const STORAGE_KEY = 'gtab_global_status';

interface GlobalStatus {
  pomodoro: { phase: string; timeLeft: number; running: boolean } | null;
  gmailUnread: number;
  taskCount: number;
  weather: { temp: number } | null;
  spotify: { name: string; isPlaying: boolean } | null;
  navShortcuts?: { title: string; url: string; icon: string }[];
}

function fmt(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

const CSS = `
  #gtab-bar-host {
    position: fixed;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    pointer-events: none;
  }
  .gtab-bar {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 999px;
    padding: 3px 6px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 11px;
    color: #fff;
    white-space: nowrap;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    pointer-events: auto;
  }
  .gtab-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    cursor: default;
    line-height: 1;
  }
  .gtab-item.clickable { cursor: pointer; }
  .gtab-item.clickable:hover { background: rgba(255,255,255,0.1); }
  .gtab-pomo  { color: #f87171; }
  .gtab-mail  { color: #fb923c; }
  .gtab-tasks { color: #4ade80; }
  .gtab-wx    { color: #38bdf8; }
  .gtab-sp    { color: #86efac; }
  .gtab-nav   { padding: 2px 5px; }
  .gtab-nav img { width: 14px; height: 14px; border-radius: 2px; }
  .gtab-div   { width: 1px; height: 14px; background: rgba(255,255,255,0.12); margin: 0 1px; flex-shrink: 0; }
  .gtab-hide  { opacity: 0.25; font-size: 10px; padding: 2px 5px; cursor: pointer; }
  .gtab-hide:hover { opacity: 0.6; }
  #gtab-show-btn {
    position: fixed;
    bottom: 14px;
    right: 14px;
    z-index: 2147483647;
    background: rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 999px;
    padding: 4px 8px;
    color: rgba(255,255,255,0.3);
    font-size: 10px;
    cursor: pointer;
    font-family: ui-sans-serif, system-ui, sans-serif;
    backdrop-filter: blur(12px);
    pointer-events: auto;
  }
  #gtab-show-btn:hover { color: rgba(255,255,255,0.7); }
`;

let host: HTMLDivElement | null = null;
let showBtn: HTMLButtonElement | null = null;
let hidden = false;

function ensureHost() {
  if (!host) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    host = document.createElement('div');
    host.id = 'gtab-bar-host';
    document.body.appendChild(host);
  }
  return host;
}

function render(status: GlobalStatus) {
  if (hidden) return;

  const el = ensureHost();
  const parts: string[] = [];

  if (status.pomodoro) {
    const p = status.pomodoro;
    const label = p.phase === 'work' ? 'Odak' : p.phase === 'short-break' ? 'Kısa' : 'Mola';
    parts.push(`<div class="gtab-item gtab-pomo clickable" data-action="pomo">${fmt(p.timeLeft)} <span style="opacity:.55;font-size:9px">${label}</span> ${p.running ? '⏸' : '▶'}</div>`);
  }

  if (status.gmailUnread > 0) {
    parts.push(`<div class="gtab-item gtab-mail">✉ ${status.gmailUnread}</div>`);
  }

  if (status.taskCount > 0) {
    parts.push(`<div class="gtab-item gtab-tasks">✓ ${status.taskCount}</div>`);
  }

  if (status.weather) {
    parts.push(`<div class="gtab-item gtab-wx">🌤 ${status.weather.temp}°</div>`);
  }

  if (status.spotify) {
    const name = status.spotify.name.length > 22 ? status.spotify.name.slice(0, 22) + '…' : status.spotify.name;
    parts.push(`<div class="gtab-item gtab-sp">♪ ${name} ${status.spotify.isPlaying ? '⏸' : '▶'}</div>`);
  }

  if (status.navShortcuts && status.navShortcuts.length > 0) {
    status.navShortcuts.forEach((ns, i) => {
      parts.push(`<div class="gtab-item gtab-nav clickable" data-nav-idx="${i}" title="${ns.title}"><img src="${ns.icon}" /></div>`);
    });
  }

  if (parts.length === 0) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = `<div class="gtab-bar">${parts.join('<div class="gtab-div"></div>')}
    <div class="gtab-hide gtab-item" data-action="hide">✕</div>
  </div>`;

  el.querySelectorAll('[data-nav-idx]').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt((item as HTMLElement).dataset.navIdx || '0');
      chrome.storage.local.get([STORAGE_KEY], (r) => {
        const s: GlobalStatus = r[STORAGE_KEY];
        if (s?.navShortcuts?.[idx]) {
          window.location.href = s.navShortcuts[idx].url;
        }
      });
    });
  });

  el.querySelector('[data-action="pomo"]')?.addEventListener('click', () => {
    chrome.storage.local.get([STORAGE_KEY], (r) => {
      const s: GlobalStatus = r[STORAGE_KEY];
      if (s?.pomodoro) {
        chrome.storage.local.set({
          gtab_pomo_cmd: { cmd: s.pomodoro.running ? 'stop' : 'start', ts: Date.now() }
        });
      }
    });
  });

  el.querySelector('[data-action="hide"]')?.addEventListener('click', () => {
    hidden = true;
    el.innerHTML = '';
    if (!showBtn) {
      showBtn = document.createElement('button');
      showBtn.id = 'gtab-show-btn';
      showBtn.textContent = 'GTab';
      showBtn.addEventListener('click', () => {
        hidden = false;
        showBtn?.remove();
        showBtn = null;
        chrome.storage.local.get([STORAGE_KEY], (r) => {
          if (r[STORAGE_KEY]) render(r[STORAGE_KEY]);
        });
      });
      document.body.appendChild(showBtn);
    }
  });
}

console.log('[GTab] Content script loaded ✓');

chrome.storage.local.get([STORAGE_KEY], (r) => {
  console.log('[GTab] Storage data:', r[STORAGE_KEY]);
  if (r[STORAGE_KEY]) render(r[STORAGE_KEY]);
  else console.log('[GTab] No data yet — open a GTab new tab first');
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) {
    console.log('[GTab] Storage updated:', changes[STORAGE_KEY].newValue);
    render(changes[STORAGE_KEY].newValue);
  }
});
