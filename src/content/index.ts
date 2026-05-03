
const STATUS_KEY = 'gtab_global_status';
const CONFIG_KEY = 'gtab_ai_config';
const VISIBILITY_KEY = 'gtab_status_bar_visible';

interface NavShortcut {
  title: string;
  url: string;
  icon: string;
}

interface GlobalStatus {
  pomodoro: { phase: string; timeLeft: number; running: boolean } | null;
  gmailUnread: number;
  taskCount: number;
  weather: { temp: number } | null;
  spotify: { name: string; isPlaying: boolean } | null;
  navShortcuts?: NavShortcut[];
}

interface AIConfig {
  statusBarEnabled?: boolean;
  statusBarShortcut?: string;
}

const BAR_CSS = `
  :host {
    all: initial;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  #gtab-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 13px;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  #gtab-container.hidden {
    transform: translateY(-100%);
  }
  .bar-content {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 1400px;
    width: 100%;
    padding: 0 24px;
    justify-content: center;
  }
  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
    white-space: nowrap;
    transition: all 0.2s;
  }
  .stat-item.clickable {
    cursor: pointer;
  }
  .stat-item.clickable:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }
  .divider {
    width: 1px;
    height: 18px;
    background: rgba(255, 255, 255, 0.15);
    margin: 0 4px;
  }
  .nav-shortcuts {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .nav-shortcuts::-webkit-scrollbar {
    display: none;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
  }
  .nav-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
  .nav-item img {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  .nav-item span {
    font-weight: 500;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pomo-work { color: #f87171; background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.2); }
  .pomo-break { color: #4ade80; background: rgba(74, 222, 128, 0.1); border-color: rgba(74, 222, 128, 0.2); }
  .pomo-work:hover { background: rgba(248, 113, 113, 0.2); }
  .pomo-break:hover { background: rgba(74, 222, 128, 0.2); }
`;

let shadowHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let currentShortcut = 'Alt+S';

function fmt(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function pushContent(active: boolean) {
  const height = '40px';
  document.documentElement.style.transition = 'margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  document.documentElement.style.marginTop = active ? height : '0';
}

function initShadowDOM() {
  if (shadowHost) return;
  
  shadowHost = document.createElement('div');
  shadowHost.id = 'gtab-status-bar-host';
  shadowHost.style.position = 'fixed';
  shadowHost.style.top = '0';
  shadowHost.style.left = '0';
  shadowHost.style.width = '100%';
  shadowHost.style.height = '0';
  shadowHost.style.zIndex = '2147483647';
  shadowHost.style.pointerEvents = 'none';
  
  shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
  
  const style = document.createElement('style');
  style.textContent = BAR_CSS;
  shadowRoot.appendChild(style);
  
  const container = document.createElement('div');
  container.id = 'gtab-container';
  container.style.pointerEvents = 'auto';
  shadowRoot.appendChild(container);
  
  document.documentElement.appendChild(shadowHost);
}

function renderBar(status: GlobalStatus, visible: boolean) {
  initShadowDOM();
  const container = shadowRoot!.getElementById('gtab-container')!;
  
  if (!visible) {
    container.classList.add('hidden');
    pushContent(false);
    return;
  }
  
  container.classList.remove('hidden');
  pushContent(true);
  
  const parts: string[] = [];
  
  if (status.pomodoro) {
    const p = status.pomodoro;
    const cls = p.phase === 'work' ? 'pomo-work' : 'pomo-break';
    parts.push(`
      <div class="stat-item clickable ${cls}" id="pomo-toggle">
        <span>🍅 ${fmt(p.timeLeft)}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${p.running ? '⏸' : '▶'}</span>
      </div>
    `);
  }
  
  if (status.gmailUnread > 0) parts.push(`<div class="stat-item">✉️ ${status.gmailUnread}</div>`);
  if (status.taskCount > 0) parts.push(`<div class="stat-item">✅ ${status.taskCount}</div>`);
  if (status.weather) parts.push(`<div class="stat-item">🌡️ ${status.weather.temp}°</div>`);
  
  if (status.spotify) {
    const name = status.spotify.name.length > 20 ? status.spotify.name.slice(0, 20) + '...' : status.spotify.name;
    parts.push(`
      <div class="stat-item clickable" id="spotify-toggle">
        <span>🎵 ${name}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${status.spotify.isPlaying ? '⏸' : '▶'}</span>
      </div>
    `);
  }
  
  let navHtml = '';
  if (status.navShortcuts?.length) {
    navHtml = `
      <div class="divider"></div>
      <div class="nav-shortcuts">
        ${status.navShortcuts.map((ns, i) => `
          <div class="nav-item" data-idx="${i}" title="${ns.title}">
            <img src="${ns.icon}" onerror="this.src='https://www.google.com/s2/favicons?sz=32&domain=${new URL(ns.url).hostname}'"/>
            <span>${ns.title}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  container.innerHTML = `
    <div class="bar-content">
      ${parts.join('')}
      ${navHtml}
    </div>
  `;
  
  container.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt((el as HTMLElement).dataset.idx!);
      const url = status.navShortcuts![idx].url;
      window.location.href = url;
    });
  });
  
  container.querySelector('#pomo-toggle')?.addEventListener('click', () => {
    chrome.storage.local.set({ gtab_pomo_cmd: { cmd: status.pomodoro?.running ? 'stop' : 'start', ts: Date.now() } });
  });
}

window.addEventListener('keydown', (e) => {
  const parts = currentShortcut.split('+');
  const key = parts[parts.length - 1].toLowerCase();
  const alt = parts.includes('Alt');
  const ctrl = parts.includes('Ctrl');
  const meta = parts.includes('Cmd') || parts.includes('Meta');
  
  if (e.key.toLowerCase() === key && 
      e.altKey === alt && 
      e.ctrlKey === ctrl && 
      e.metaKey === meta) {
    e.preventDefault();
    toggleVisibility();
  }
});

async function toggleVisibility() {
  const data = await chrome.storage.local.get(VISIBILITY_KEY);
  const newState = !(data[VISIBILITY_KEY] ?? true);
  await chrome.storage.local.set({ [VISIBILITY_KEY]: newState });
}

async function start() {
  const data = await chrome.storage.local.get([STATUS_KEY, CONFIG_KEY, VISIBILITY_KEY]);
  const status = data[STATUS_KEY] as GlobalStatus;
  const config = data[CONFIG_KEY] as AIConfig;
  const visible = data[VISIBILITY_KEY] ?? true;
  
  if (config?.statusBarShortcut) currentShortcut = config.statusBarShortcut;
  
  if (config?.statusBarEnabled !== false && status) {
    renderBar(status, visible);
  } else if (shadowHost) {
    shadowHost.remove();
    shadowHost = null;
    pushContent(false);
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes[STATUS_KEY] || changes[CONFIG_KEY] || changes[VISIBILITY_KEY]) {
    start();
  }
});

start();
console.log('[GTab] Content script initialized ✓');
