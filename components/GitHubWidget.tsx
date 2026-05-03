import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface GHEvent {
  id: string;
  type: string;
  repo: { name: string; url: string };
  created_at: string;
  payload: any;
}

const USERNAME_KEY = 'gtab_github_username';

const EVENT_META: Record<string, { label: (p: any) => string; color: string; emoji: string }> = {
  PushEvent:          { label: p => `${p.commits?.length || 1} commit`, color: 'text-blue-400', emoji: '⬆️' },
  PullRequestEvent:   { label: p => p.action === 'opened' ? 'PR açıldı' : p.action === 'closed' && p.pull_request?.merged ? 'PR merge' : 'PR güncellendi', color: 'text-violet-400', emoji: '🔀' },
  IssuesEvent:        { label: p => p.action === 'opened' ? 'Issue açıldı' : 'Issue güncellendi', color: 'text-yellow-400', emoji: '❗' },
  WatchEvent:         { label: () => 'Yıldızlandı', color: 'text-yellow-300', emoji: '⭐' },
  ForkEvent:          { label: () => 'Fork edildi', color: 'text-green-400', emoji: '🍴' },
  CreateEvent:        { label: p => `${p.ref_type} oluşturuldu`, color: 'text-emerald-400', emoji: '✨' },
  DeleteEvent:        { label: p => `${p.ref_type} silindi`, color: 'text-red-400', emoji: '🗑️' },
  ReleaseEvent:       { label: p => `${p.release?.tag_name} yayınlandı`, color: 'text-cyan-400', emoji: '🚀' },
  IssueCommentEvent:  { label: () => 'Yorum yapıldı', color: 'text-white/50', emoji: '💬' },
};

const getEventMeta = (type: string, payload: any) => {
  const meta = EVENT_META[type];
  if (!meta) return { label: type.replace('Event', ''), color: 'text-white/40', emoji: '📌' };
  return { label: meta.label(payload), color: meta.color, emoji: meta.emoji };
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor(diff / 60_000);
  if (h > 23) return `${Math.floor(h / 24)}g önce`;
  if (h > 0) return `${h}s önce`;
  return `${Math.max(1, m)}d önce`;
};

const GitHubWidget: React.FC = () => {
  const [username, setUsername] = useState(localStorage.getItem(USERNAME_KEY) || '');
  const [inputVal, setInputVal] = useState(localStorage.getItem(USERNAME_KEY) || '');
  const [events, setEvents] = useState<GHEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchEvents = useCallback(async (user: string) => {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      const [evRes, userRes] = await Promise.all([
        fetch(`https://api.github.com/users/${user}/events/public?per_page=20`),
        fetch(`https://api.github.com/users/${user}`)
      ]);
      if (!evRes.ok) throw new Error(evRes.status === 404 ? 'Kullanıcı bulunamadı.' : `GitHub API: ${evRes.status}`);
      const evData: GHEvent[] = await evRes.json();
      setEvents(evData.filter(e => EVENT_META[e.type] || true).slice(0, 15));
      if (userRes.ok) {
        const u = await userRes.json();
        setAvatarUrl(u.avatar_url);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (username) fetchEvents(username);
  }, [username, fetchEvents]);

  const handleSave = () => {
    const u = inputVal.trim();
    if (!u) return;
    localStorage.setItem(USERNAME_KEY, u);
    setUsername(u);
  };

  if (!username) {
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 p-4">
        <div className="text-3xl">🐙</div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">GitHub Aktivite</p>
          <p className="text-xs text-white/40 mt-1">GitHub kullanıcı adını gir</p>
        </div>
        <div className="flex gap-2 w-full max-w-[220px]">
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="kullanıcı adı..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 placeholder-white/20 outline-none focus:border-white/30"
          />
          <button onClick={handleSave} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
            Ara
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5 shrink-0">
        {avatarUrl
          ? <img src={avatarUrl} alt={username} className="w-5 h-5 rounded-full" />
          : <span className="text-sm">🐙</span>
        }
        <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-xs font-semibold text-white/80 hover:text-white transition-colors truncate">
          {username}
        </a>
        <button onClick={() => fetchEvents(username)} disabled={loading} className="p-1 text-white/30 hover:text-white/60 transition-colors">
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={() => { setUsername(''); setInputVal(''); localStorage.removeItem(USERNAME_KEY); }} className="p-1 text-white/20 hover:text-white/50 transition-colors text-[10px]">
          ✕
        </button>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && events.length === 0 && (
          <div className="flex items-center justify-center h-full text-white/30 text-xs">Yükleniyor...</div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full text-red-400/60 text-xs p-4 text-center">{error}</div>
        )}
        {!loading && !error && events.length === 0 && (
          <div className="flex items-center justify-center h-full text-white/30 text-xs">Aktivite bulunamadı.</div>
        )}
        {events.map(event => {
          const meta = getEventMeta(event.type, event.payload);
          const repoUrl = `https://github.com/${event.repo.name}`;
          return (
            <div key={event.id} className="group flex items-start gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
              <span className="text-sm shrink-0 mt-0.5">{meta.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className={`text-[10px] font-bold ${meta.color}`}>{meta.label}</span>
                </div>
                <a href={repoUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-white/40 hover:text-white/70 truncate block transition-colors">
                  {event.repo.name}
                </a>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-white/25">{timeAgo(event.created_at)}</span>
                <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-white/0 group-hover:text-white/20 transition-all">
                  <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GitHubWidget;
