import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const getCachedToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const exp = localStorage.getItem(TOKEN_EXP_KEY);
  if (!token || !exp) return null;
  if (Date.now() >= parseInt(exp) - 60_000) return null;
  return token;
};

const getSpotifyToken = async (clientId: string): Promise<string> => {
  const redirectUri = chrome.identity.getRedirectURL();
  const scopes = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
  const authUrl =
    `https://accounts.spotify.com/authorize?client_id=${clientId}` +
    `&response_type=token` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&show_dialog=true`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (redirectUrl) => {
      if (chrome.runtime.lastError || !redirectUrl) {
        reject(new Error(chrome.runtime.lastError?.message || 'Auth cancelled'));
        return;
      }
      const hash = new URL(redirectUrl).hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');
      const expiresIn = parseInt(params.get('expires_in') || '3600');
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(TOKEN_EXP_KEY, String(Date.now() + expiresIn * 1000));
        resolve(token);
      } else {
        reject(new Error('No access_token in response'));
      }
    });
  });
};

const SpotifyWidget: React.FC = () => {
  const [clientId, setClientId] = useState(localStorage.getItem(CLIENT_ID_KEY) || '');
  const [inputClientId, setInputClientId] = useState('');
  const [setup, setSetup] = useState(!localStorage.getItem(CLIENT_ID_KEY));
  const [token, setToken] = useState<string | null>(getCachedToken());
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const fetchTrack = useCallback(async (t: string) => {
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${t}` }
    });
    if (res.status === 401) throw new Error('TOKEN_EXPIRED');
    if (res.status === 204 || !res.ok) { setTrack(null); return; }
    const data = await res.json();
    if (!data?.item) { setTrack(null); return; }
    setTrack({
      name: data.item.name,
      artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
      albumArt: data.item.album.images[0]?.url || '',
      isPlaying: data.is_playing,
      progress: data.progress_ms ?? 0,
      duration: data.item.duration_ms,
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchTrack(token).catch(e => {
      if (e.message === 'TOKEN_EXPIRED') { setToken(null); }
    });
    pollingRef.current = window.setInterval(() => {
      fetchTrack(token).catch(() => {});
    }, 5000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [token, fetchTrack]);

  const login = async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const t = await getSpotifyToken(clientId);
      setToken(t);
    } catch (e: any) {
      setError(e.message || 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  const control = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    if (!token) return;
    const isPost = action === 'next' || action === 'previous';
    await fetch(`https://api.spotify.com/v1/me/player/${action}`, {
      method: isPost ? 'POST' : 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setTimeout(() => fetchTrack(token).catch(() => {}), 600);
  };

  const saveSetup = () => {
    const id = inputClientId.trim();
    if (!id) return;
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

  if (!token) {
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
