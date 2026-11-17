import React, { useState, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Track {
  name: string;
  artist: string;
  albumArt: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

const CLIENT_ID_KEY = 'gtab_spotify_client_id';
const TOKEN_KEY = 'gtab_spotify_token';
const TOKEN_EXP_KEY = 'gtab_spotify_token_exp';
const REFRESH_KEY = 'gtab_spotify_refresh';
const SCOPES = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
const POLL_MS = 5000;

/** Login is needed again: no refresh token, or Spotify rejected it. */
class SpotifyAuthError extends Error {}

const getCachedToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const exp = localStorage.getItem(TOKEN_EXP_KEY);
  if (!token || !exp) return null;
  if (Date.now() >= parseInt(exp) - 60_000) return null;
  return token;
};

const hasSession = () => !!getCachedToken() || !!localStorage.getItem(REFRESH_KEY);

const clearTokens = () => {
  [TOKEN_KEY, TOKEN_EXP_KEY, REFRESH_KEY].forEach(k => localStorage.removeItem(k));
};

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const randomString = (byteLength: number) => base64url(crypto.getRandomValues(new Uint8Array(byteLength)));

const requestToken = async (body: Record<string, string>): Promise<string> => {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  if (res.status === 400 || res.status === 401) throw new SpotifyAuthError(`Spotify token error ${res.status}`);
  if (!res.ok) throw new Error(`Spotify token error ${res.status}`);

  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(TOKEN_EXP_KEY, String(Date.now() + (Number(data.expires_in) || 3600) * 1000));
  // Spotify may rotate the refresh token; keep the newest one.
  if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
  return data.access_token;
};

// Authorization Code flow with PKCE. Spotify removed the implicit grant (response_type=token).
const loginWithPkce = async (clientId: string): Promise<string> => {
  const redirectUri = chrome.identity.getRedirectURL();
  const verifier = randomString(64);
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
  const state = randomString(16);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
    show_dialog: 'true',
  });

  const redirectUrl = await new Promise<string>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: `https://accounts.spotify.com/authorize?${params.toString()}`, interactive: true },
      (url) => {
        if (chrome.runtime.lastError || !url) reject(new Error(chrome.runtime.lastError?.message || 'Auth cancelled'));
        else resolve(url);
      }
    );
  });

  const result = new URL(redirectUrl).searchParams;
  if (result.get('state') !== state) throw new Error('OAuth state mismatch');
  const authError = result.get('error');
  if (authError) throw new Error(authError);
  const code = result.get('code');
  if (!code) throw new Error('No authorization code in response');

  return requestToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: verifier,
  });
};

const refreshAccessToken = (clientId: string): Promise<string> => {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return Promise.reject(new SpotifyAuthError('No refresh token'));
  return requestToken({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId });
};

const SpotifyWidget: React.FC = () => {
  const [clientId, setClientId] = useState(localStorage.getItem(CLIENT_ID_KEY) || '');
  const [inputClientId, setInputClientId] = useState('');
  const [setup, setSetup] = useState(!localStorage.getItem(CLIENT_ID_KEY));
  const [connected, setConnected] = useState(hasSession);
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getValidToken = useCallback(async (): Promise<string> => {
    return getCachedToken() ?? refreshAccessToken(clientId);
  }, [clientId]);

  /** Calls the Spotify API; on 401 refreshes the token once and retries. */
  const spotifyFetch = useCallback(async (path: string, init: RequestInit = {}): Promise<Response> => {
    const send = (token: string) =>
      fetch(`https://api.spotify.com/v1${path}`, { ...init, headers: { Authorization: `Bearer ${token}` } });
    const res = await send(await getValidToken());
    if (res.status !== 401) return res;
    localStorage.removeItem(TOKEN_KEY);
    return send(await refreshAccessToken(clientId));
  }, [clientId, getValidToken]);

  const handleFailure = useCallback((e: unknown) => {
    if (e instanceof SpotifyAuthError) {
      clearTokens();
      setConnected(false);
      setTrack(null);
    }
    // Network errors are transient; the next poll retries.
  }, []);

  const fetchTrack = useCallback(async () => {
    const res = await spotifyFetch('/me/player/currently-playing');
    if (res.status === 204 || !res.ok) { setTrack(null); return; }
    const data = await res.json();
    if (!data?.item) { setTrack(null); return; }
    setTrack({
      name: data.item.name,
      artist: (data.item.artists ?? []).map((a: { name: string }) => a.name).join(', '),
      albumArt: data.item.album?.images?.[0]?.url || '',
      isPlaying: data.is_playing,
      progress: data.progress_ms ?? 0,
      duration: data.item.duration_ms,
    });
  }, [spotifyFetch]);

  useEffect(() => {
    if (!connected || setup) return;
    const poll = () => {
      if (document.hidden) return;
      fetchTrack().catch(handleFailure);
    };
    poll();
    const timer = window.setInterval(poll, POLL_MS);
    document.addEventListener('visibilitychange', poll);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', poll);
    };
  }, [connected, setup, fetchTrack, handleFailure]);

  const login = async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      await loginWithPkce(clientId);
      setConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  const control = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    setError(null);
    try {
      const isPost = action === 'next' || action === 'previous';
      const res = await spotifyFetch(`/me/player/${action}`, { method: isPost ? 'POST' : 'PUT' });
      if (res.status === 403) setError('Bu işlem Spotify Premium gerektirir.');
      else if (res.status === 404) setError('Aktif bir Spotify cihazı bulunamadı.');
      else if (!res.ok) setError('Spotify komutu başarısız oldu.');
      setTimeout(() => fetchTrack().catch(handleFailure), 600);
    } catch (e) {
      handleFailure(e);
    }
  };

  const saveSetup = () => {
    const id = inputClientId.trim();
    if (!id) return;
    if (id !== clientId) {
      clearTokens();
      setConnected(false);
    }
    localStorage.setItem(CLIENT_ID_KEY, id);
    setClientId(id);
    setSetup(false);
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (setup) {
    const redirectUri = typeof chrome !== 'undefined' && chrome.identity?.getRedirectURL
      ? chrome.identity.getRedirectURL()
      : '(extension yüklenince görünür)';
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 p-5">
        <MusicalNoteIcon className="w-8 h-8 text-green-400 opacity-60" />
        <div className="text-center">
          <p className="text-sm font-semibold text-white">Spotify Kurulumu</p>
          <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
            1. developer.spotify.com → App oluştur<br />
            2. Redirect URI olarak şunu ekle:<br />
            <span className="text-white/60 break-all">{redirectUri}</span>
          </p>
        </div>
        <input
          type="text"
          value={inputClientId}
          onChange={e => setInputClientId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveSetup()}
          placeholder="Spotify Client ID..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/20 outline-none focus:border-green-400/40 transition-colors"
        />
        <button
          onClick={saveSetup}
          disabled={!inputClientId.trim()}
          className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
        >
          Kaydet
        </button>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 p-4">
        <MusicalNoteIcon className="w-8 h-8 text-green-400 opacity-60" />
        <p className="text-sm font-semibold text-white">Spotify</p>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        <button
          onClick={login}
          disabled={loading}
          className="px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {loading && <ArrowPathIcon className="w-3 h-3 animate-spin" />}
          Spotify ile Bağlan
        </button>
        <button onClick={() => setSetup(true)} className="text-[10px] text-white/20 hover:text-white/50 transition-colors">
          Client ID değiştir
        </button>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 p-4">
        <MusicalNoteIcon className="w-8 h-8 text-white/10" />
        <p className="text-xs text-white/30">Spotify&apos;da bir şey çalmıyor.</p>
        <button onClick={() => setSetup(true)} className="text-[10px] text-white/20 hover:text-white/40 mt-2">
          Ayarlar
        </button>
      </div>
    );
  }

  const pct = track.duration > 0 ? (track.progress / track.duration) * 100 : 0;

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt="album"
            className="w-28 h-28 rounded-xl shadow-2xl object-cover"
          />
        ) : (
          <div className="w-28 h-28 rounded-xl bg-white/5 flex items-center justify-center">
            <MusicalNoteIcon className="w-10 h-10 text-white/20" />
          </div>
        )}
        <div className="text-center max-w-full px-2">
          <p className="text-sm font-semibold text-white truncate">{track.name}</p>
          <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
          {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-white/30">{fmt(track.progress)}</span>
          <span className="text-[10px] text-white/30">{fmt(track.duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 pb-4">
        <button onClick={() => control('previous')} className="p-2 text-white/40 hover:text-white transition-colors">
          <BackwardIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => control(track.isPlaying ? 'pause' : 'play')}
          className="p-2.5 bg-green-500 hover:bg-green-400 rounded-full transition-colors shadow-lg"
        >
          {track.isPlaying
            ? <PauseIcon className="w-5 h-5 text-white" />
            : <PlayIcon className="w-5 h-5 text-white" />
          }
        </button>
        <button onClick={() => control('next')} className="p-2 text-white/40 hover:text-white transition-colors">
          <ForwardIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SpotifyWidget;
