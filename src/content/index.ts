const STATUS_KEY = 'gtab_global_status';
const EMAILS_KEY = 'gtab_status_emails';
const VISIBILITY_KEY = 'gtab_status_bar_visible';

interface PomodoroState { phase: string; timeLeft: number; running: boolean; sessions: number; }
interface GlobalStatus {
  pomodoro: PomodoroState | null;
  gmailUnread: number;
  taskCount: number;
  weather: { temp: number; city?: string } | null;
  spotify: { name: string; artist?: string; isPlaying: boolean } | null;
  theme?: { accent: string; bg: string; border: string };
}
interface Email { id: string; subject: string; from: string; snippet: string; }

let cached: GlobalStatus = { pomodoro: null, gmailUnread: 0, taskCount: 0, weather: null, spotify: null };
let expanded = false;
let activePanel: 'timer' | 'mail' | 'media' | null = null;
let panelInterval: number | null = null;
let host: HTMLElement | null = null;
let root: ShadowRoot | null = null;
let visible = true;

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}
function shortFrom(from: string) {
  return (from.match(/^(.*?)\s*<.*>$/) || ['', from])[1].trim() || from;
}
function accentColor() { return cached.theme?.accent || '#3b82f6'; }

function getMediaEl(): HTMLMediaElement | null {
  const all = [...document.querySelectorAll('video'), ...document.querySelectorAll('audio')] as HTMLMediaElement[];
  return all.find(e => !e.paused && e.duration > 0) || all.find(e => e.readyState >= 2) || null;
}
function mediaInfo() {
  const el = getMediaEl();
  const ms = navigator.mediaSession?.metadata;
  if (!el && !ms) return null;
  return {
    title: ms?.title || document.title.slice(0, 40) || window.location.hostname,
    artist: ms?.artist || window.location.hostname,
    isPlaying: el ? !el.paused : navigator.mediaSession?.playbackState === 'playing',
    progress: el && el.duration > 0 ? (el.currentTime / el.duration) * 100 : 0,
    currentTime: el?.currentTime || 0,
    duration: el?.duration || 0,
  };
}
function doMedia(action: 'play' | 'pause' | 'prev' | 'next') {
  const el = getMediaEl();
  if (action === 'play') {
    if (el) el.play().catch(() => {});
    else { try { navigator.mediaSession.callAction('play'); } catch {} }
  } else if (action === 'pause') {
    if (el) el.pause();
    else { try { navigator.mediaSession.callAction('pause'); } catch {} }
  } else if (action === 'prev') {
    try { navigator.mediaSession.callAction('previoustrack'); } catch {
      const el2 = getMediaEl(); if (el2) el2.currentTime = 0;
    }
  } else if (action === 'next') {
    try { navigator.mediaSession.callAction('nexttrack'); } catch {}
  }
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  :host { all: initial; font-family: ui-sans-serif, system-ui, sans-serif; }

  #wrap {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 2147483647; pointer-events: none;
  }

  /* Thin trigger bar */
  #trigger {
    height: 4px;
    background: linear-gradient(90deg, var(--ac,#3b82f6) 0%, rgba(0,0,0,0) 100%);
    cursor: pointer;
    pointer-events: auto;
    transition: height .2s ease, opacity .2s;
    opacity: .6;
  }
  #trigger:hover { height: 6px; opacity: 1; }
  #wrap.expanded #trigger { height: 3px; opacity: 1; }
  #wrap.hidden #trigger { opacity: 0; pointer-events: none; }

  /* Expanded panel */
  #panel {
    background: rgba(8,10,18,.88);
    border-bottom: 1px solid rgba(255,255,255,.08);
    backdrop-filter: blur(24px) saturate(1.6);
    -webkit-backdrop-filter: blur(24px) saturate(1.6);
    overflow: hidden;
    max-height: 0;
    transition: max-height .28s cubic-bezier(.4,0,.2,1);
    pointer-events: auto;
    color: white;
    font-size: 12px;
  }
  #wrap.expanded #panel { max-height: 600px; }

  /* Main bar row */
  .bar-row {
    display: flex; align-items: center;
    padding: 6px 16px; gap: 4px;
    border-bottom: 1px solid rgba(255,255,255,.05);
    flex-wrap: wrap;
  }
  .chip {
    display: flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,.07);
    background: rgba(255,255,255,.04);
    cursor: pointer; white-space: nowrap;
    transition: all .15s; font-size: 11px;
    user-select: none;
  }
  .chip:hover, .chip.active { background: rgba(255,255,255,.11); border-color: rgba(255,255,255,.15); }
  .chip.pomo { color: #f87171; }
  .chip.mail { color: #fb923c; }
  .chip.tasks { color: #4ade80; }
  .chip.wx { color: #38bdf8; }
  .chip.media { color: #a78bfa; }
  .chip.sp { color: #86efac; }
  .spacer { flex: 1; }
  .close-chip {
    opacity: .25; cursor: pointer; padding: 3px 8px;
    border-radius: 999px; font-size: 11px; transition: opacity .15s;
    user-select: none;
  }
  .close-chip:hover { opacity: .6; }

  /* Sub-panel */
  .sub { padding: 12px 16px 16px; }

  /* Timer */
  .pomo-tabs { display: flex; gap: 3px; margin-bottom: 10px; }
  .pomo-tab {
    flex: 1; padding: 4px 6px; border-radius: 8px; text-align: center;
    border: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.03);
    cursor: pointer; font-size: 10px; color: rgba(255,255,255,.45);
    transition: all .15s;
  }
  .pomo-tab.active { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.15); color: white; }
  .pomo-time { font-size: 40px; font-weight: 200; text-align: center; padding: 4px 0 2px; color: var(--ac,#3b82f6); font-variant-numeric: tabular-nums; }
  .pomo-phase { text-align: center; font-size: 10px; opacity: .4; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px; }
  .pomo-dots { display: flex; justify-content: center; gap: 5px; margin-bottom: 12px; }
  .pomo-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.12); }
  .pomo-dot.done { background: #f87171; }
  .ctrl-row { display: flex; justify-content: center; align-items: center; gap: 8px; }
  .btn { width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05); cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; color: white; transition: all .15s; }
  .btn.primary { width: 46px; height: 46px; font-size: 18px; background: var(--ac,#3b82f6); border: none; }
  .btn:hover { background: rgba(255,255,255,.12); }
  .btn.primary:hover { filter: brightness(1.15); }

  /* Mail */
  .mail-item { padding: 7px 10px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all .15s; }
  .mail-item:hover { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.08); }
  .mail-from { font-size: 11px; font-weight: 600; color: rgba(255,255,255,.85); }
  .mail-subject { font-size: 11px; color: rgba(255,255,255,.5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mail-snippet { font-size: 10px; color: rgba(255,255,255,.28); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* Media */
  .media-info { margin-bottom: 10px; }
  .media-title { font-size: 13px; font-weight: 600; }
  .media-artist { font-size: 11px; opacity: .45; margin-top: 1px; }
  .prog-track { width: 100%; height: 3px; background: rgba(255,255,255,.1); border-radius: 2px; margin: 10px 0; overflow: hidden; cursor: pointer; }
  .prog-fill { height: 100%; background: var(--ac,#3b82f6); border-radius: 2px; transition: width .6s linear; }
  .time-row { display: flex; justify-content: space-between; font-size: 10px; opacity: .35; margin-bottom: 10px; }
`;

// ── init shadow DOM ───────────────────────────────────────────────────────────
function init() {
  if (host) return;
  host = document.createElement('div');
  host.id = 'gtab-bar';
  root = host.attachShadow({ mode: 'closed' });
  const s = document.createElement('style');
  s.textContent = CSS;
  root.appendChild(s);
  const wrap = document.createElement('div');
  wrap.id = 'wrap';
  wrap.innerHTML = `<div id="trigger"></div><div id="panel"></div>`;
  root.appendChild(wrap);
  document.documentElement.prepend(host);
  wrap.style.setProperty('--ac', accentColor());

  wrap.querySelector('#trigger')!.addEventListener('click', () => {
    expanded = !expanded;
    update();
  });

  document.addEventListener('click', (e) => {
    if (!expanded) return;
    if (!host!.contains(e.target as Node)) {
      activePanel = null;
      expanded = false;
      update();
    }
  }, true);
}

// ── render ────────────────────────────────────────────────────────────────────
function update() {
  if (!root) return;
  const wrap = root.getElementById('wrap')!;
  wrap.style.setProperty('--ac', accentColor());
  wrap.className = [expanded ? 'expanded' : '', !visible ? 'hidden' : ''].filter(Boolean).join(' ');

  if (!expanded) {
    clearPanelInterval();
    wrap.querySelector('#panel')!.innerHTML = '';
    return;
  }

  renderBarRow(wrap.querySelector('#panel')!);
}

function renderBarRow(panel: Element) {
  const chips: string[] = [];
  const m = mediaInfo();

  if (cached.pomodoro) {
    const p = cached.pomodoro;
    const label = { work: 'Odak', 'short-break': 'Kısa', 'long-break': 'Mola' }[p.phase] || p.phase;
    chips.push(`<div class="chip pomo${activePanel === 'timer' ? ' active' : ''}" data-panel="timer">⏱ ${fmt(p.timeLeft)} <span style="opacity:.55;font-size:9px">${label}</span> ${p.running ? '⏸' : '▶'}</div>`);
  }
  if (cached.gmailUnread > 0) chips.push(`<div class="chip mail${activePanel === 'mail' ? ' active' : ''}" data-panel="mail">✉ ${cached.gmailUnread}</div>`);
  if (cached.taskCount > 0) chips.push(`<div class="chip tasks">✓ ${cached.taskCount}</div>`);
  if (cached.weather) chips.push(`<div class="chip wx">🌤 ${cached.weather.temp}°</div>`);
  if (m) chips.push(`<div class="chip media${activePanel === 'media' ? ' active' : ''}" data-panel="media">${m.isPlaying ? '⏸' : '▶'} <span style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block">${m.title}</span></div>`);
  else if (cached.spotify) chips.push(`<div class="chip sp">♪ <span style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block">${cached.spotify.name}</span></div>`);

  panel.innerHTML = `
    <div class="bar-row">
      ${chips.join('')}
      <div class="spacer"></div>
      <div class="close-chip" data-close>✕</div>
    </div>
    <div class="sub" id="sub-panel"></div>
  `;

  panel.querySelector('[data-close]')!.addEventListener('click', () => { expanded = false; activePanel = null; update(); });
  panel.querySelectorAll('[data-panel]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const t = (el as HTMLElement).dataset.panel as typeof activePanel;
      activePanel = activePanel === t ? null : t;
      renderSubPanel(panel.querySelector('#sub-panel')!);
      renderBarRow(panel);
    });
  });

  renderSubPanel(panel.querySelector('#sub-panel')!);
}

function clearPanelInterval() {
  if (panelInterval) { clearInterval(panelInterval); panelInterval = null; }
}

function renderSubPanel(el: Element) {
  clearPanelInterval();
  el.innerHTML = '';
  if (!activePanel) return;
  if (activePanel === 'timer') { renderTimer(el); panelInterval = window.setInterval(() => renderTimer(el), 1000); }
  if (activePanel === 'mail') renderMail(el);
  if (activePanel === 'media') { renderMedia(el); panelInterval = window.setInterval(() => renderMedia(el), 1000); }
}

function renderTimer(el: Element) {
  const p = cached.pomodoro;
  const phases = [['work', 'Odak'], ['short-break', 'Kısa Mola'], ['long-break', 'Uzun Mola']] as const;
  const cur = p?.phase || 'work';
  const t = p?.timeLeft ?? ({ work: 25*60, 'short-break': 5*60, 'long-break': 15*60 }[cur] || 1500);
  const running = p?.running || false;
  const sessions = (p as any)?.sessions || 0;

  el.innerHTML = `
    <div class="pomo-tabs">
      ${phases.map(([id, lbl]) => `<div class="pomo-tab${cur === id ? ' active' : ''}" data-phase="${id}">${lbl}</div>`).join('')}
    </div>
    <div class="pomo-time">${fmt(t)}</div>
    <div class="pomo-phase">${phases.find(([id]) => id === cur)?.[1] || ''}</div>
    <div class="pomo-dots">${Array.from({length:4}).map((_,i) => `<div class="pomo-dot${i < sessions % 4 ? ' done' : ''}"></div>`).join('')}</div>
    <div class="ctrl-row">
      <div class="btn" data-cmd="reset">↺</div>
      <div class="btn primary" data-cmd="${running ? 'stop' : 'start'}">${running ? '⏸' : '▶'}</div>
      <div class="btn" data-cmd="skip">⏭</div>
    </div>
  `;
  el.querySelectorAll('[data-phase]').forEach(b => b.addEventListener('click', () => {
    chrome.storage.local.set({ gtab_pomo_cmd: { cmd: 'switch-phase', phase: (b as HTMLElement).dataset.phase, ts: Date.now() } });
  }));
  el.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('click', () => {
    chrome.storage.local.set({ gtab_pomo_cmd: { cmd: (b as HTMLElement).dataset.cmd, ts: Date.now() } });
  }));
}

function renderMail(el: Element) {
  chrome.storage.local.get([EMAILS_KEY], (r) => {
    const emails: Email[] = r[EMAILS_KEY] || [];
    el.innerHTML = emails.length === 0
      ? '<div style="padding:12px;opacity:.35;text-align:center;font-size:11px">E-posta yok</div>'
      : emails.map(m => `
          <div class="mail-item" data-id="${m.id}">
            <div class="mail-from">${shortFrom(m.from)}</div>
            <div class="mail-subject">${m.subject}</div>
            ${m.snippet ? `<div class="mail-snippet">${m.snippet}</div>` : ''}
          </div>`).join('');
    el.querySelectorAll('[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        window.open(`https://mail.google.com/mail/#inbox/${(item as HTMLElement).dataset.id}`, '_blank');
      });
    });
  });
}

function renderMedia(el: Element) {
  const m = mediaInfo();
  if (!m) { el.innerHTML = '<div style="padding:12px;opacity:.35;text-align:center;font-size:11px">Bu sayfada medya yok</div>'; return; }
  const progW = m.progress.toFixed(1);
  const fmtTime = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;
  el.innerHTML = `
    <div class="media-info">
      <div class="media-title">${m.title}</div>
      <div class="media-artist">${m.artist}</div>
    </div>
    <div class="prog-track"><div class="prog-fill" style="width:${progW}%"></div></div>
    <div class="time-row"><span>${fmtTime(m.currentTime)}</span><span>${fmtTime(m.duration)}</span></div>
    <div class="ctrl-row">
      <div class="btn" data-action="prev">⏮</div>
      <div class="btn primary" data-action="${m.isPlaying ? 'pause' : 'play'}">${m.isPlaying ? '⏸' : '▶'}</div>
      <div class="btn" data-action="next">⏭</div>
    </div>
  `;
  el.querySelectorAll('[data-action]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      doMedia((b as HTMLElement).dataset.action as any);
    });
  });
}

// ── keyboard ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (activePanel) { activePanel = null; if (root) { const p = root.getElementById('sub-panel'); if (p) { clearPanelInterval(); p.innerHTML = ''; } renderBarRow(root.querySelector('#panel')!); } return; }
    if (expanded) { expanded = false; update(); }
  }
});

// ── storage ───────────────────────────────────────────────────────────────────
chrome.storage.local.get([STATUS_KEY, VISIBILITY_KEY], (r) => {
  if (r[STATUS_KEY]) cached = r[STATUS_KEY];
  visible = r[VISIBILITY_KEY] !== false;
  init();
  update();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes[STATUS_KEY]) { cached = changes[STATUS_KEY].newValue || cached; if (expanded) update(); }
  if (changes[VISIBILITY_KEY]) { visible = changes[VISIBILITY_KEY].newValue !== false; update(); }
});

console.log('[GTab v5.3.1] Content script ready');
