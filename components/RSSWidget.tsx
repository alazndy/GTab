import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, PlusIcon, XMarkIcon, RssIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail?: string;
  feedName: string;
}

interface Feed {
  id: string;
  url: string;
  name: string;
}

const FEEDS_KEY = 'gtab_rss_feeds';
const CACHE_KEY = 'gtab_rss_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 min

const DEFAULT_FEEDS: Feed[] = [
  { id: '1', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
  { id: '2', url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
];

const loadFeeds = (): Feed[] => {
  try { return JSON.parse(localStorage.getItem(FEEDS_KEY) || 'null') || DEFAULT_FEEDS; }
  catch { return DEFAULT_FEEDS; }
};

const fetchFeed = async (feed: Feed): Promise<RSSItem[]> => {
  const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=8`);
  if (!res.ok) throw new Error(`${feed.name}: fetch failed`);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(`${feed.name}: ${data.message || 'Error'}`);
  return (data.items || []).map((item: any) => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    description: item.description?.replace(/<[^>]*>/g, '').slice(0, 120) || '',
    thumbnail: item.thumbnail || item.enclosure?.link,
    feedName: feed.name,
  }));
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor(diff / 60_000);
  if (h > 23) return `${Math.floor(h / 24)}g`;
  if (h > 0) return `${h}s`;
  return `${m}d`;
};

const RSSWidget: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>(loadFeeds);
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  const loadAll = useCallback(async (force = false) => {
    if (!feeds.length) { setItems([]); setLoading(false); return; }
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { items: ci, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) { setItems(ci); setLoading(false); return; }
      }
    }
    setLoading(true); setError(null);
    try {
      const results = await Promise.allSettled(feeds.map(f => fetchFeed(f)));
      const all: RSSItem[] = [];
      results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value); });
      all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setItems(all);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ items: all, ts: Date.now() }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [feeds]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveFeeds = (f: Feed[]) => {
    setFeeds(f);
    localStorage.setItem(FEEDS_KEY, JSON.stringify(f));
  };

  const addFeed = () => {
    if (!newUrl.trim()) return;
    const feed: Feed = { id: Date.now().toString(), url: newUrl.trim(), name: newName.trim() || new URL(newUrl).hostname };
    const next = [...feeds, feed];
    saveFeeds(next);
    setNewUrl(''); setNewName('');
    setTimeout(() => loadAll(true), 100);
  };

  const removeFeed = (id: string) => saveFeeds(feeds.filter(f => f.id !== id));

  if (showSettings) {
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5 shrink-0">
          <span className="text-xs font-semibold text-white/80">RSS Kaynakları</span>
          <button onClick={() => { setShowSettings(false); loadAll(true); }} className="text-xs text-white/40 hover:text-white/70">Kaydet</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {feeds.map(f => (
            <div key={f.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80 truncate">{f.name}</p>
                <p className="text-[10px] text-white/30 truncate">{f.url}</p>
              </div>
              <button onClick={() => removeFeed(f.id)} className="text-white/20 hover:text-red-400 transition-colors">
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {feeds.length === 0 && <p className="text-xs text-white/30 text-center py-4">Kaynak yok</p>}
        </div>
        <div className="p-3 border-t border-white/10 space-y-2 shrink-0">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Kaynak adı (opsiyonel)" className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/80 placeholder-white/20 outline-none" />
          <div className="flex gap-2">
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeed()} placeholder="RSS URL..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/80 placeholder-white/20 outline-none focus:border-orange-400/40" />
            <button onClick={addFeed} className="px-2 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors">
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5 shrink-0">
        <RssIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <span className="flex-1 text-xs font-medium text-white/80">Haber</span>
        <button onClick={() => loadAll(true)} disabled={loading} className="p-1 text-white/30 hover:text-orange-300 transition-colors">
          <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={() => setShowSettings(true)} className="p-1 text-white/30 hover:text-white/60 transition-colors">
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && items.length === 0 && (
          <div className="flex items-center justify-center h-full text-white/30 text-xs">Yükleniyor...</div>
        )}
        {error && items.length === 0 && (
          <div className="flex items-center justify-center h-full text-red-400/60 text-xs p-4 text-center">{error}</div>
        )}
        {!loading && items.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-4">
            <RssIcon className="w-8 h-8 text-orange-400/20" />
            <p className="text-xs text-white/30">RSS kaynağı ekle</p>
            <button onClick={() => setShowSettings(true)} className="text-[10px] text-orange-400 hover:text-orange-300">+ Kaynak ekle</button>
          </div>
        )}
        {items.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
            className="group flex gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
          >
            {item.thumbnail && (
              <img src={item.thumbnail} alt="" className="w-12 h-10 object-cover rounded flex-shrink-0 opacity-80" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 line-clamp-2 group-hover:text-white transition-colors leading-tight">{item.title}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-orange-400/70 font-medium truncate">{item.feedName}</span>
                <span className="text-white/15">·</span>
                <span className="text-[10px] text-white/25 shrink-0">{timeAgo(item.pubDate)}</span>
                <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5 text-white/0 group-hover:text-white/20 ml-auto shrink-0 transition-all" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RSSWidget;
