import React, { useEffect, useState, useMemo } from 'react';
import { Shortcut, Category, ShortcutProfile } from '../../types';
import {
  MagnifyingGlassIcon, PlusCircleIcon, CheckCircleIcon,
  ArrowTopRightOnSquareIcon, FolderIcon, Cog6ToothIcon,
  ChevronLeftIcon, EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline';

const STORAGE_KEY   = 'gtab_shortcuts';
const HIDDEN_KEY    = 'gtab_popup_hidden';

type View = 'main' | 'settings' | 'add';

interface TabInfo { title: string; url: string; favIconUrl?: string; }

// ── helpers ────────────────────────────────────────────────────────────────

const ensureProto = (url: string) => {
  if (!url) return '';
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) return url;
  return `https://${url}`;
};

const favicon = (url: string) => {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(ensureProto(url)).hostname}&sz=64`; }
  catch { return ''; }
};

const readShortcuts  = (): Shortcut[]  => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; } };
const readHidden     = (): string[]    => { try { return JSON.parse(localStorage.getItem(HIDDEN_KEY)   ?? '[]'); } catch { return []; } };
const writeShortcuts = (s: Shortcut[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
const writeHidden    = (h: string[])   => localStorage.setItem(HIDDEN_KEY,  JSON.stringify(h));

const flatAll = (s: Shortcut[]) => s.flatMap(x => x.isFolder ? (x.children ?? []) : [x]);

// ── inline style atoms ─────────────────────────────────────────────────────

const S = {
  root:      { width: 380, background: '#0a0a0a', color: '#fff', fontFamily: '"Geist Sans", system-ui, sans-serif', display: 'flex', flexDirection: 'column' } as React.CSSProperties,
  header:    { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' } as React.CSSProperties,
  logo:      { width: 22, height: 22, borderRadius: 6, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 } as React.CSSProperties,
  scroll:    { maxHeight: 420, overflowY: 'auto' as const, paddingBottom: 8 },
  label:     { fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)', marginBottom: 6, padding: '0 14px' },
  iconBtn:   { background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  input:     { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 10px 7px 30px', fontSize: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' as const },
  chip:      (active: boolean) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: active ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.12)', background: active ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', color: active ? '#a5b4fc' : 'rgba(255,255,255,0.55)' } as React.CSSProperties),
  row:       { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' } as React.CSSProperties,
  addBtn:    (disabled: boolean) => ({ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: disabled ? 'default' : 'pointer', background: disabled ? 'rgba(34,197,94,0.15)' : '#4f46e5', border: `1px solid ${disabled ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.5)'}`, color: disabled ? '#86efac' : '#fff', flexShrink: 0 } as React.CSSProperties),
  submitBtn: { width: '100%', background: '#4f46e5', border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', marginTop: 4 } as React.CSSProperties,
};

// ── component ──────────────────────────────────────────────────────────────

const Popup: React.FC = () => {
  const [tab,       setTab]       = useState<TabInfo | null>(null);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [hidden,    setHidden]    = useState<string[]>([]);
  const [query,     setQuery]     = useState('');
  const [view,      setView]      = useState<View>('main');
  const [justAdded, setJustAdded] = useState(false);

  // add-form state
  const [addTitle,    setAddTitle]    = useState('');
  const [addUrl,      setAddUrl]      = useState('');
  const [addProfiles, setAddProfiles] = useState<string[]>([]);  // selected profile names

  useEffect(() => {
    setShortcuts(readShortcuts());
    setHidden(readHidden());
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const t = tabs[0];
        if (t) setTab({ title: t.title ?? '', url: t.url ?? '', favIconUrl: t.favIconUrl });
      });
    }
  }, []);

  const flat    = useMemo(() => flatAll(shortcuts), [shortcuts]);
  const folders = useMemo(() => shortcuts.filter(s => s.isFolder), [shortcuts]);

  // All unique profile objects across all shortcuts (deduped by name)
  const allProfiles = useMemo(() => {
    const map = new Map<string, ShortcutProfile>();
    flat.forEach(s => s.profiles?.forEach(p => { if (!map.has(p.name)) map.set(p.name, p); }));
    return [...map.values()];
  }, [flat]);

  const isAdded = useMemo(() => {
    if (!tab?.url) return false;
    try {
      const host = new URL(tab.url).hostname;
      return flat.some(s => { try { return new URL(ensureProto(s.url)).hostname === host; } catch { return false; } });
    } catch { return false; }
  }, [tab, flat]);

  const tabHost = useMemo(() => { try { return new URL(tab?.url ?? '').hostname; } catch { return ''; } }, [tab]);

  const visible = useMemo(() => flat.filter(s => !hidden.includes(s.id)), [flat, hidden]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const src = q ? visible : visible.slice(0, 14);
    return q ? src.filter(s => s.title.toLowerCase().includes(q) || s.url.toLowerCase().includes(q)).slice(0, 14) : src;
  }, [visible, query]);

  const visibleFolders = useMemo(() => (query.trim() ? [] : folders.filter(f => !hidden.includes(f.id)).slice(0, 6)), [folders, hidden, query]);

  // ── actions ──

  const toggleHidden = (id: string) => {
    const next = hidden.includes(id) ? hidden.filter(x => x !== id) : [...hidden, id];
    setHidden(next);
    writeHidden(next);
  };

  const openAddForm = () => {
    setAddTitle(tab?.title || tabHost);
    setAddUrl(tab?.url || '');
    setAddProfiles([]);
    setView('add');
  };

  const submitAdd = () => {
    if (!addTitle.trim() || !addUrl.trim()) return;
    const selectedProfileObjs = addProfiles
      .map(name => allProfiles.find(p => p.name === name))
      .filter(Boolean) as ShortcutProfile[];

    const newItem: Shortcut = {
      id: crypto.randomUUID(),
      title: addTitle.trim(),
      url: addUrl.trim(),
      category: Category.OTHER,
      ...(selectedProfileObjs.length > 0 && { profiles: selectedProfileObjs }),
    };
    const updated = [...shortcuts, newItem];
    writeShortcuts(updated);
    setShortcuts(updated);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    setView('main');
  };

  const openUrl = (url: string) => { chrome.tabs.create({ url }); window.close(); };

  const openWithProfile = (baseUrl: string, profileUrl: string) => {
    const t = profileUrl.trim();
    if (!t) { openUrl(baseUrl); return; }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      try {
        const u = new URL(baseUrl);
        if (baseUrl.includes('google.com') || baseUrl.includes('youtube.com')) {
          u.searchParams.set('authuser', t); openUrl(u.toString()); return;
        }
      } catch { /* noop */ }
      openUrl(`mailto:${t}`); return;
    }
    openUrl(ensureProto(t));
  };

  // ── sub-views ──

  const ViewSettings = () => (
    <>
      <div style={S.scroll}>
        <p style={{ ...S.label, marginTop: 12 }}>Göster / Gizle</p>
        {[...folders, ...flat].filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i).map(s => {
          const isHidden = hidden.includes(s.id);
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <img src={s.isFolder ? '' : favicon(s.url)} alt="" style={{ width: 18, height: 18, borderRadius: 3, objectFit: 'contain', flexShrink: 0, background: 'rgba(255,255,255,0.06)' }} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
              {s.isFolder && <FolderIcon style={{ width: 18, height: 18, color: '#fbbf24', flexShrink: 0 }} />}
              <span style={{ flex: 1, fontSize: 12, color: isHidden ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
              <button onClick={() => toggleHidden(s.id)} style={{ ...S.iconBtn, color: isHidden ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.9)' }}>
                {isHidden ? <EyeSlashIcon style={{ width: 15, height: 15 }} /> : <EyeIcon style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          );
        })}
        {flat.length === 0 && <p style={{ textAlign: 'center', padding: '24px 16px', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Henüz kısayol yok.</p>}
      </div>
    </>
  );

  const ViewAdd = () => (
    <div style={{ padding: '12px 14px 16px' }}>

      {/* Profile chips */}
      {allProfiles.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ ...S.label, padding: 0, marginBottom: 8 }}>Profil seç</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {allProfiles.map(p => {
              const active = addProfiles.includes(p.name);
              return (
                <button
                  key={p.id}
                  onClick={() => setAddProfiles(prev => active ? prev.filter(n => n !== p.name) : [...prev, p.name])}
                  style={S.chip(active)}
                >
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: active ? 'rgba(165,180,252,0.4)' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800 }}>
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  {p.name}
                  {active && <span style={{ fontSize: 10 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <p style={{ ...S.label, padding: 0, marginBottom: 4 }}>Ad</p>
          <input
            value={addTitle}
            onChange={e => setAddTitle(e.target.value)}
            style={{ ...S.input, paddingLeft: 10 }}
            placeholder="Örn: YouTube"
            autoFocus
          />
        </div>
        <div>
          <p style={{ ...S.label, padding: 0, marginBottom: 4 }}>URL</p>
          <input
            value={addUrl}
            onChange={e => setAddUrl(e.target.value)}
            style={{ ...S.input, paddingLeft: 10, fontFamily: 'monospace', fontSize: 11 }}
            placeholder="https://..."
          />
        </div>
        <button onClick={submitAdd} style={S.submitBtn}>
          GTab'a Ekle
        </button>
      </div>
    </div>
  );

  // ── header ──

  const headerTitle = view === 'settings' ? 'Görünürlük' : view === 'add' ? 'Sayfayı Ekle' : 'GTab';

  return (
    <div style={S.root}>

      {/* Header */}
      <div style={S.header}>
        {view !== 'main' ? (
          <button onClick={() => setView('main')} style={S.iconBtn}>
            <ChevronLeftIcon style={{ width: 16, height: 16 }} />
          </button>
        ) : (
          <div style={S.logo}>G</div>
        )}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{headerTitle}</span>
        {view === 'main' && (
          <button onClick={() => setView('settings')} style={S.iconBtn} title="Görünürlük ayarları">
            <Cog6ToothIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {/* Settings view */}
      {view === 'settings' && <ViewSettings />}

      {/* Add view */}
      {view === 'add' && <ViewAdd />}

      {/* Main view */}
      {view === 'main' && (
        <>
          {/* Current Page */}
          {tab && tabHost && (
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ ...S.label, padding: 0, marginBottom: 8 }}>Mevcut Sayfa</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={tab.favIconUrl || favicon(tab.url)} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.title || tabHost}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tabHost}</p>
                </div>
                <button onClick={isAdded || justAdded ? undefined : openAddForm} style={S.addBtn(isAdded || justAdded)}>
                  {isAdded || justAdded
                    ? <><CheckCircleIcon style={{ width: 13, height: 13 }} />{justAdded ? 'Eklendi' : 'Ekli'}</>
                    : <><PlusCircleIcon style={{ width: 13, height: 13 }} />Ekle</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div style={{ padding: '10px 14px 8px' }}>
            <div style={{ position: 'relative' }}>
              <MagnifyingGlassIcon style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'rgba(255,255,255,0.3)' }} />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Kısayol ara..." autoFocus style={S.input} />
            </div>
          </div>

          <div style={S.scroll}>

            {/* Folders */}
            {visibleFolders.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <p style={S.label}>Gruplar</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: '0 14px' }}>
                  {visibleFolders.map(f => (
                    <button key={f.id} onClick={() => { (f.children ?? []).forEach(c => c.url && chrome.tabs.create({ url: ensureProto(c.url) })); window.close(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.15)', cursor: 'pointer', textAlign: 'left' }}>
                      <FolderIcon style={{ width: 13, height: 13, color: '#fbbf24', flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 11, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</p>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{f.children?.length ?? 0} öğe</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shortcuts */}
            {filtered.length > 0 && (
              <div>
                <p style={{ ...S.label, marginTop: visibleFolders.length > 0 ? 8 : 0 }}>{query ? `"${query}"` : 'Kısayollar'}</p>
                {filtered.map(s => {
                  const hasProfiles = (s.profiles?.length ?? 0) > 0;
                  return (
                    <div key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={S.row} onClick={() => openUrl(ensureProto(s.url))}>
                        <img src={s.iconType === 'image' && s.iconValue ? s.iconValue : favicon(s.url)} alt="" style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'contain', flexShrink: 0, background: 'rgba(255,255,255,0.06)' }} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.88)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                        <ArrowTopRightOnSquareIcon style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.22)', flexShrink: 0 }} />
                      </div>
                      {hasProfiles && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 14px 8px 42px' }}>
                          {s.profiles!.map(p => (
                            <button key={p.id} onClick={() => openWithProfile(ensureProto(s.url), p.url ?? '')} className={p.avatarColor || 'bg-blue-600/70'} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px 2px 4px', borderRadius: 99, fontSize: 10, fontWeight: 600, color: '#fff', cursor: 'pointer', border: 'none' }}>
                              <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800 }}>{p.name.charAt(0).toUpperCase()}</span>
                              <span style={{ maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {filtered.length === 0 && visibleFolders.length === 0 && (
              <p style={{ textAlign: 'center', padding: '24px 16px', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                {query ? `"${query}" için sonuç yok.` : 'Görünür kısayol yok.'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Popup;
