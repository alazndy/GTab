
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
  theme?: { accent: string; bg: string; border: string; };
}

interface AIConfig {
  statusBarEnabled?: boolean;
  statusBarShortcut?: string;
  dockPosition?: 'top-center' | 'bottom-center' | 'top-right';
  dockBehavior?: 'expand' | 'modal';
}

const BAR_CSS = `
  :host {
    all: initial;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --dock-bg: rgba(15, 23, 42, 0.75);
    --dock-border: rgba(255, 255, 255, 0.1);
    --dock-accent: #3b82f6;
  }
  #gtab-container {
    position: fixed;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    background: var(--dock-bg);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid var(--dock-border);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border-radius: 999px;
    padding: 4px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
    user-select: none;
    overflow: hidden;
    color: white;
    font-size: 13px;
    box-sizing: border-box;
    width: 36px;
    height: 36px;
    max-width: 36px;
  }
  
  /* Collapsed state */
  #gtab-container.collapsed {
    justify-content: center;
    padding: 0;
    cursor: pointer;
  }
  
  #gtab-container.collapsed:hover {
    box-shadow: 0 0 15px var(--dock-accent);
    border-color: var(--dock-accent);
  }

  /* Expanded state */
  #gtab-container.expanded {
    width: auto;
    max-width: 1000px;
    height: 44px;
    padding: 0 16px;
    gap: 12px;
  }

  /* Positions */
  #gtab-container.pos-top-center { top: 12px; left: 50%; transform: translateX(-50%); }
  #gtab-container.pos-bottom-center { bottom: 12px; left: 50%; transform: translateX(-50%); }
  #gtab-container.pos-top-right { top: 12px; right: 12px; }

  #gtab-container.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -20px);
  }
  #gtab-container.pos-top-right.hidden {
    transform: translateY(-20px);
  }
  #gtab-container.pos-bottom-center.hidden {
    transform: translate(-50%, 20px);
  }

  .bar-content {
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  #gtab-container.expanded .bar-content {
    opacity: 1;
  }
  
  .collapsed-indicator {
    font-weight: bold;
    font-size: 16px;
    display: none;
    color: var(--dock-accent);
  }
  #gtab-container.collapsed .collapsed-indicator {
    display: block;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
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
    border-color: var(--dock-accent);
  }
  .divider {
    width: 1px;
    height: 18px;
    background: var(--dock-border);
  }
  .nav-shortcuts {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .nav-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
  }
  .nav-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--dock-accent);
    transform: translateY(-1px);
  }
  .nav-item img {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }
  .pomo-work { color: #f87171; background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.2); }
  .pomo-break { color: #4ade80; background: rgba(74, 222, 128, 0.1); border-color: rgba(74, 222, 128, 0.2); }

  /* Modal Overlay */
  #gtab-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
    padding: 20px;
  }
  #gtab-modal-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }

  /* Modal Content */
  #gtab-modal-content {
    background: var(--dock-bg);
    border: 1px solid var(--dock-border);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
    border-radius: 24px;
    width: 100%;
    max-width: 600px;
    padding: 32px;
    color: white;
    transform: scale(0.9);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  #gtab-modal-overlay.open #gtab-modal-content {
    transform: scale(1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
  }
  .modal-stats {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .modal-stat-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 20px;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 100px;
  }
  .modal-stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.5;
  }
  .modal-stat-value {
    font-size: 18px;
    font-weight: 600;
  }

  .launchpad-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 20px;
    margin-top: 8px;
  }
  .launchpad-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 12px;
    border-radius: 16px;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
  }
  .launchpad-item:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
  }
  .launchpad-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .launchpad-icon img {
    width: 32px;
    height: 32px;
    border-radius: 6px;
  }
  .launchpad-title {
    font-size: 12px;
    text-align: center;
    font-weight: 500;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .close-modal-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s;
    font-size: 18px;
  }
  .close-modal-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--dock-accent);
  }
`;

let shadowHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let currentShortcut = 'Alt+S';
let isExpanded = false;
let isModalOpen = false;

function fmt(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function initShadowDOM() {
  if (shadowHost) return;
  
  shadowHost = document.createElement('div');
  shadowHost.id = 'gtab-status-bar-host';
  shadowHost.style.position = 'fixed';
  shadowHost.style.zIndex = '2147483647';
  shadowHost.style.pointerEvents = 'none';
  
  shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
  
  const style = document.createElement('style');
  style.id = 'gtab-style';
  style.textContent = BAR_CSS;
  shadowRoot.appendChild(style);

  // Modal Overlay
  const overlay = document.createElement('div');
  overlay.id = 'gtab-modal-overlay';
  overlay.innerHTML = `<div id="gtab-modal-content"></div>`;
  shadowRoot.appendChild(overlay);
  
  const container = document.createElement('div');
  container.id = 'gtab-container';
  container.classList.add('collapsed');
  shadowRoot.appendChild(container);
  
  document.documentElement.appendChild(shadowHost);
}

function renderModal(status: GlobalStatus, content: HTMLElement, config: AIConfig) {
  const statsHtml = `
    <div class="modal-stats">
      ${status.pomodoro ? `
        <div class="modal-stat-card">
          <span class="modal-stat-label">Focus</span>
          <span class="modal-stat-value">🍅 ${fmt(status.pomodoro.timeLeft)}</span>
        </div>
      ` : ''}
      <div class="modal-stat-card">
        <span class="modal-stat-label">Weather</span>
        <span class="modal-stat-value">🌡️ ${status.weather?.temp || '--'}°</span>
      </div>
      <div class="modal-stat-card">
        <span class="modal-stat-label">Tasks</span>
        <span class="modal-stat-value">✅ ${status.taskCount}</span>
      </div>
    </div>
  `;

  const shortcutsHtml = status.navShortcuts?.length ? `
    <div class="launchpad-grid">
      ${status.navShortcuts.map((ns, i) => `
        <div class="launchpad-item" data-idx="${i}">
          <div class="launchpad-icon">
            <img src="${ns.icon}" onerror="this.src='https://www.google.com/s2/favicons?sz=64&domain=${new URL(ns.url).hostname}'"/>
          </div>
          <div class="launchpad-title">${ns.title}</div>
        </div>
      `).join('')}
    </div>
  ` : '<div style="opacity: 0.5; padding: 20px; text-align: center;">No shortcuts added yet.</div>';

  content.innerHTML = `
    <div class="modal-header">
      ${statsHtml}
      <div class="close-modal-btn" id="close-modal">✕</div>
    </div>
    ${shortcutsHtml}
  `;

  content.querySelector('#close-modal')?.addEventListener('click', () => {
    isModalOpen = false;
    start();
  });

  content.querySelectorAll('.launchpad-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt((el as HTMLElement).dataset.idx!);
      const url = status.navShortcuts![idx].url;
      window.open(url, '_blank');
      isModalOpen = false;
      start();
    });
  });
}

function renderBar(status: GlobalStatus, config: AIConfig, visible: boolean) {
  initShadowDOM();
  const container = shadowRoot!.getElementById('gtab-container')!;
  const overlay = shadowRoot!.getElementById('gtab-modal-overlay')!;
  const modalContent = shadowRoot!.getElementById('gtab-modal-content')!;
  
  // Apply Theme Colors
  if (status.theme) {
    shadowHost!.style.setProperty('--dock-accent', status.theme.accent);
    shadowHost!.style.setProperty('--dock-bg', status.theme.bg);
    shadowHost!.style.setProperty('--dock-border', status.theme.border);
  }

  // Modal logic
  if (isModalOpen && visible) {
    overlay.classList.add('open');
    renderModal(status, modalContent, config);
  } else {
    overlay.classList.remove('open');
  }

  // Update visibility and position
  container.className = ''; // Reset classes
  if (!visible) container.classList.add('hidden');
  
  const pos = config.dockPosition || 'top-center';
  container.classList.add(`pos-${pos}`);
  
  if (isExpanded) {
    container.classList.add('expanded');
    container.classList.remove('collapsed');
  } else {
    container.classList.add('collapsed');
    container.classList.remove('expanded');
  }

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
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Collapsed indicator content
  let indicator = 'G';
  if (status.pomodoro && status.pomodoro.running) {
    indicator = fmt(status.pomodoro.timeLeft).split(':')[0]; // Just minutes
  }

  container.innerHTML = `
    <div class="collapsed-indicator">${indicator}</div>
    <div class="bar-content">
      ${parts.join('')}
      ${navHtml}
    </div>
  `;
  
  // Re-attach listeners because we use innerHTML
  container.onclick = (e) => {
    const target = e.target as HTMLElement;
    if (container.classList.contains('collapsed')) {
      if (config.dockBehavior === 'modal') {
        isModalOpen = true;
      } else {
        isExpanded = true;
      }
      renderBar(status, config, visible);
      e.stopPropagation();
      return;
    }
    
    // If clicking the container itself while expanded, collapse it
    if (target === container || target.classList.contains('bar-content')) {
      isExpanded = false;
      renderBar(status, config, visible);
    }
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      isModalOpen = false;
      renderBar(status, config, visible);
    }
  };

  container.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt((el as HTMLElement).dataset.idx!);
      const url = status.navShortcuts![idx].url;
      window.open(url, '_blank');
    });
  });
  
  container.querySelector('#pomo-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.storage.local.set({ gtab_pomo_cmd: { cmd: status.pomodoro?.running ? 'stop' : 'start', ts: Date.now() } });
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isModalOpen) {
    isModalOpen = false;
    start();
    return;
  }

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
  const status = (data[STATUS_KEY] || {
    pomodoro: null,
    gmailUnread: 0,
    taskCount: 0,
    weather: null,
    spotify: null,
    navShortcuts: []
  }) as GlobalStatus;
  
  const config = data[CONFIG_KEY] as AIConfig;
  const visible = data[VISIBILITY_KEY] ?? true;
  
  if (config?.statusBarShortcut) currentShortcut = config.statusBarShortcut;
  
  if (config?.statusBarEnabled !== false) {
    renderBar(status, config || {}, visible);
  } else if (shadowHost) {
    shadowHost.remove();
    shadowHost = null;
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes[STATUS_KEY] || changes[CONFIG_KEY] || changes[VISIBILITY_KEY]) {
    start();
  }
});

start();
console.log('[GTab] Content script initialized ✓');
