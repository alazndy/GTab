import { GmailListResponse, CalendarListResponse } from '../types';

/** Thrown when a silent (non-interactive) sign-in is not possible. The UI should offer a login button. */
export const AUTH_REQUIRED = 'AUTH_REQUIRED';

export interface AuthOptions {
  interactive?: boolean;
  /** Skip the cache and ask Google for consent again (needed after scopes change). */
  forceConsent?: boolean;
  /** Google account e-mail. Each account has its own cached token. */
  loginHint?: string;
}

export interface CachedToken {
  token: string;
  /** Expiry time in ms since epoch. */
  exp: number;
}

// Refresh a little before Google's expiry so a request never starts with a dying token.
const EXPIRY_SKEW_MS = 60_000;
const memoryCache = new Map<string, CachedToken>();
const inFlight = new Map<string, Promise<string>>();

const cacheKey = (loginHint?: string) => `gtab_gtoken:${loginHint?.trim().toLowerCase() || 'default'}`;

// chrome.storage.session is shared by all GTab tabs and cleared when the browser closes,
// so a new tab can reuse a token instead of starting another auth flow.
const sessionStore = (): chrome.storage.StorageArea | undefined =>
  typeof chrome !== 'undefined' ? chrome.storage?.session : undefined;

const isValid = (entry: unknown): entry is CachedToken =>
  !!entry &&
  typeof (entry as CachedToken).token === 'string' &&
  typeof (entry as CachedToken).exp === 'number' &&
  (entry as CachedToken).exp - EXPIRY_SKEW_MS > Date.now();

const readCached = async (key: string): Promise<CachedToken | null> => {
  const mem = memoryCache.get(key);
  if (isValid(mem)) return mem;
  try {
    const stored = (await sessionStore()?.get(key))?.[key];
    if (isValid(stored)) {
      memoryCache.set(key, stored);
      return stored;
    }
  } catch {
    // storage.session is unavailable outside the extension (vite dev server).
  }
  return null;
};

export const storeToken = async (loginHint: string | undefined, entry: CachedToken): Promise<void> => {
  const key = cacheKey(loginHint);
  memoryCache.set(key, entry);
  try {
    await sessionStore()?.set({ [key]: entry });
  } catch {
    // Memory cache still works for this tab.
  }
};

export const invalidateToken = async (loginHint?: string): Promise<void> => {
  const key = cacheKey(loginHint);
  memoryCache.delete(key);
  try {
    await sessionStore()?.remove(key);
  } catch {
    // Nothing to remove.
  }
};

/**
 * Runs the Google OAuth implicit flow and returns a fresh token. Does not touch the cache.
 * launchWebAuthFlow is used instead of identity.getAuthToken because Edge does not support the latter.
 */
export const authenticate = ({ interactive = false, forceConsent = false, loginHint }: AuthOptions = {}): Promise<CachedToken> => {
  const manifest = chrome.runtime.getManifest();
  const clientId = manifest.oauth2?.client_id ?? '';
  const scopes = manifest.oauth2?.scopes?.join(' ') || 'openid email profile';
  let redirectUri = chrome.identity.getRedirectURL();
  if (!redirectUri.endsWith('/')) redirectUri += '/';

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
    redirect_uri: redirectUri,
    scope: scopes,
    prompt: !interactive ? 'none' : forceConsent ? 'consent' : 'select_account',
    state,
  });
  if (loginHint) params.set('login_hint', loginHint);

  const flowDetails: chrome.identity.WebAuthFlowDetails = {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    interactive,
  };
  if (!interactive) {
    // These fields exist in Chrome 113+ but are missing from @types/chrome.
    (flowDetails as any).abortOnLoadForNonInteractive = true;
    (flowDetails as any).timeoutMsForNonInteractive = 3000;
  }

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(flowDetails, (redirectUrl) => {
      if (chrome.runtime.lastError || !redirectUrl) {
        reject(new Error(interactive
          ? chrome.runtime.lastError?.message || 'Kullanıcı girişi iptal edildi veya yönlendirme başarısız.'
          : AUTH_REQUIRED));
        return;
      }

      const result = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
      if (result.get('state') !== state) {
        reject(new Error('OAuth state mismatch'));
        return;
      }

      const error = result.get('error');
      if (error) {
        reject(new Error(interactive ? `Google Hatası: ${error}` : AUTH_REQUIRED));
        return;
      }

      const token = result.get('access_token');
      if (!token) {
        reject(new Error('Bağlantı sağlandı ancak access_token bulunamadı.'));
        return;
      }
      const expiresIn = Number(result.get('expires_in')) || 3600;
      resolve({ token, exp: Date.now() + expiresIn * 1000 });
    });
  });
};

/** Returns a cached token when it is still valid, otherwise runs the auth flow once (shared by concurrent callers). */
export const getAuthToken = async (options: AuthOptions = {}): Promise<string> => {
  const key = cacheKey(options.loginHint);
  if (!options.forceConsent) {
    const cached = await readCached(key);
    if (cached) return cached.token;
  }

  const flowKey = `${key}|${options.interactive ? 'i' : 's'}|${options.forceConsent ? 'c' : ''}`;
  const pending = inFlight.get(flowKey);
  if (pending) return pending;

  const promise = authenticate(options)
    .then(async (entry) => {
      await storeToken(options.loginHint, entry);
      return entry.token;
    })
    .finally(() => inFlight.delete(flowKey));
  inFlight.set(flowKey, promise);
  return promise;
};

/** fetch() with a Google bearer token. On 401 it drops the cached token and retries once silently. */
export const googleFetch = async (url: string, init: RequestInit = {}, auth: AuthOptions = {}): Promise<Response> => {
  const send = (token: string) =>
    fetch(url, {
      ...init,
      headers: { ...(init.headers as Record<string, string> | undefined), Authorization: `Bearer ${token}` },
    });

  const response = await send(await getAuthToken(auth));
  if (response.status !== 401) return response;

  await invalidateToken(auth.loginHint);
  return send(await getAuthToken({ loginHint: auth.loginHint }));
};

const IS_STORE_EDITION = import.meta.env.VITE_EDITION === 'store';

export const fetchUnreadEmails = async (auth: AuthOptions = {}): Promise<GmailListResponse> => {
  // The gmail.metadata scope (store edition) rejects the `q` parameter; labelIds works with every scope.
  const response = await googleFetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=UNREAD&maxResults=5',
    {},
    auth,
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gmail API Error: ${response.statusText}`);
  }

  return response.json();
};

export interface GmailMessageDetails {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  internalDate: string; // Used for sorting across accounts
}

export const fetchMessageDetails = async (messageId: string, auth: AuthOptions = {}): Promise<GmailMessageDetails> => {
  const id = encodeURIComponent(messageId);
  const url = IS_STORE_EDITION
    ? `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
    : `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`;

  const response = await googleFetch(url, {}, auth);
  if (!response.ok) {
    throw new Error(`Gmail API Error: ${response.statusText}`);
  }

  const data = await response.json();
  const headers: { name: string; value: string }[] = data.payload?.headers ?? [];
  const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name)?.value || '';

  return {
    id: data.id,
    snippet: IS_STORE_EDITION ? '' : (data.snippet ?? ''),
    subject: getHeader('subject'),
    from: getHeader('from'),
    date: getHeader('date'),
    internalDate: data.internalDate ?? '0',
  };
};

export const fetchUpcomingEvents = async (auth: AuthOptions = {}): Promise<CalendarListResponse> => {
  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    maxResults: '5',
    orderBy: 'startTime',
    singleEvents: 'true',
  });
  const response = await googleFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {},
    auth,
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Calendar API Error: ${response.statusText}`);
  }

  return response.json();
};
