import { GmailListResponse, CalendarListResponse } from '../types';

export const getAuthToken = async (interactive = false, forceConsent = false): Promise<string> => {
  // Edge support: getAuthToken is not supported on Edge. 
  // We use launchWebAuthFlow as a universal solution for all Chromium browsers.
  
  const manifest = chrome.runtime.getManifest();
  const clientId = manifest.oauth2?.client_id;
  const scopes = manifest.oauth2?.scopes?.join(' ') || 'openid email profile';
  let redirectUri = chrome.identity.getRedirectURL();
  if (!redirectUri.endsWith('/')) {
    redirectUri += '/';
  }
  
  const prompt = !interactive ? 'none' : forceConsent ? 'consent' : 'select_account';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `response_type=token&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `prompt=${prompt}`;

  const flowDetails: chrome.identity.WebAuthFlowDetails = { url: authUrl, interactive };
  if (!interactive) {
    (flowDetails as any).abortOnLoadForNonInteractive = true;
    (flowDetails as any).timeoutMsForNonInteractive = 3000;
  }

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(flowDetails, (redirectUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      if (!redirectUrl) {
        reject(new Error('Kullanıcı girişi iptal edildi veya yönlendirme başarısız.'));
        return;
      }

      // Check for errors in fragment
      const hash = new URL(redirectUrl).hash.substring(1);
      const params = new URLSearchParams(hash);
      const error = params.get('error');
      
      if (error) {
        if (interactive) {
          reject(new Error(`Google Hatası: ${error}`));
        } else {
          // Fail silently for background checks
          reject(new Error('User interaction required'));
        }
        return;
      }

      const token = params.get('access_token');
      if (token) {
        resolve(token);
      } else {
        reject(new Error('Bağlantı sağlandı ancak access_token bulunamadı.'));
      }
    });
  });
};

export const fetchUnreadEmails = async (token: string): Promise<GmailListResponse> => {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=5', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
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

export const fetchMessageDetails = async (token: string, messageId: string): Promise<GmailMessageDetails> => {
  const isStore = import.meta.env.VITE_EDITION === 'store';
  const url = isStore
    ? `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
    : `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Gmail API Error: ${response.statusText}`);
  }

  const data = await response.json();
  const headers = data.payload?.headers ?? [];

  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  return {
    id: data.id,
    snippet: isStore ? '' : (data.snippet ?? ''),
    subject: getHeader('subject'),
    from: getHeader('from'),
    date: getHeader('date'),
    internalDate: data.internalDate ?? '0'
  };
};

export const fetchUpcomingEvents = async (token: string): Promise<CalendarListResponse> => {
  const timeMin = new Date().toISOString();
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=5&orderBy=startTime&singleEvents=true`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Calendar API Error: ${response.statusText}`);
  }
  
  return response.json();
};
