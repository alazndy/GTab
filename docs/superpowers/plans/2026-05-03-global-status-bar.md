# Global Status Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Shadow DOM-based global status bar that pushes content down, supports keyboard toggling, and displays real-time stats and navigation shortcuts.

**Architecture:** A single Shadow Host injected into the document, containing a Shadow Root for style isolation. The script listens to `chrome.storage.onChanged` for status updates and config changes. Content displacement is handled by adjusting `margin-top` on the `html` or `body` element.

**Tech Stack:** Vanilla TypeScript, Shadow DOM, Chrome Storage API, Tailwind-like CSS.

---

### Task 1: Core Shadow DOM Infrastructure

**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1: Define Constants and Interfaces**
Update the interfaces to include `navShortcuts` and config.

```typescript
const STATUS_KEY = 'gtab_global_status';
const CONFIG_KEY = 'gtab_ai_config';
const VISIBILITY_KEY = 'gtab_status_bar_visible'; // Persist toggle state

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
```

- [ ] **Step 2: Implement Shadow Host Creation**
Create a function to initialize the shadow host if it doesn't exist.

```typescript
let shadowHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;

function initShadowDOM() {
  if (shadowHost) return;
  
  shadowHost = document.createElement('div');
  shadowHost.id = 'gtab-status-bar-host';
  // Ensure host doesn't interfere with page layout
  shadowHost.style.position = 'fixed';
  shadowHost.style.top = '0';
  shadowHost.style.left = '0';
  shadowHost.style.width = '100%';
  shadowHost.style.height = '0';
  shadowHost.style.zIndex = '2147483647';
  
  shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
  
  const style = document.createElement('style');
  style.textContent = BAR_CSS;
  shadowRoot.appendChild(style);
  
  const container = document.createElement('div');
  container.id = 'gtab-container';
  shadowRoot.appendChild(container);
  
  document.documentElement.appendChild(shadowHost);
}
```

- [ ] **Step 3: Define BAR_CSS**
Create a comprehensive CSS string for the glassmorphic bar.

```typescript
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
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 13px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2147483647;
  }
  #gtab-container.hidden {
    transform: translateY(-100%);
  }
  .bar-content {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 1200px;
    padding: 0 20px;
  }
  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .stat-item.clickable {
    cursor: pointer;
    transition: background 0.2s;
  }
  .stat-item.clickable:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .divider {
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 0.2);
  }
  .nav-shortcuts {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.03);
  }
  .nav-item:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-1px);
  }
  .nav-item img {
    width: 16px;
    height: 16px;
    border-radius: 3px;
  }
  .pomo-work { color: #f87171; }
  .pomo-break { color: #4ade80; }
`;
```

### Task 2: Rendering and Content Displacement

**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1: Implement Render Logic**
Update the container's innerHTML based on status.

```typescript
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
  
  // Build parts
  const parts: string[] = [];
  
  // Pomodoro
  if (status.pomodoro) {
    const p = status.pomodoro;
    const cls = p.phase === 'work' ? 'pomo-work' : 'pomo-break';
    parts.push(`
      <div class="stat-item clickable ${cls}" id="pomo-toggle">
        <span>🍅 ${fmt(p.timeLeft)}</span>
        <span style="font-size: 10px; opacity: 0.7;">${p.running ? '⏸' : '▶'}</span>
      </div>
    `);
  }
  
  // Gmail & Tasks
  if (status.gmailUnread > 0) parts.push(`<div class="stat-item">✉️ ${status.gmailUnread}</div>`);
  if (status.taskCount > 0) parts.push(`<div class="stat-item">✅ ${status.taskCount}</div>`);
  
  // Weather
  if (status.weather) parts.push(`<div class="stat-item">🌡️ ${status.weather.temp}°</div>`);
  
  // Spotify
  if (status.spotify) {
    const name = status.spotify.name.length > 20 ? status.spotify.name.slice(0, 20) + '...' : status.spotify.name;
    parts.push(`
      <div class="stat-item clickable" id="spotify-toggle">
        <span>🎵 ${name}</span>
        <span style="font-size: 10px; opacity: 0.7;">${status.spotify.isPlaying ? '⏸' : '▶'}</span>
      </div>
    `);
  }
  
  // Nav Shortcuts
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
  
  // Event listeners
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
```

- [ ] **Step 2: Implement Content Pushing**
Handle the `margin-top` on `html` or `body`.

```typescript
function pushContent(active: boolean) {
  const height = '40px';
  document.documentElement.style.transition = 'margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  document.documentElement.style.marginTop = active ? height : '0';
}
```

### Task 3: Keyboard Toggle and Storage Listeners

**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1: Keyboard Shortcut Listener**
Listen for the configured shortcut.

```typescript
let currentShortcut = 'Alt+S';

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
  const { gtab_status_bar_visible } = await chrome.storage.local.get('gtab_status_bar_visible');
  const newState = !gtab_status_bar_visible;
  await chrome.storage.local.set({ gtab_status_bar_visible: newState });
}
```

- [ ] **Step 2: Initialize and Sync**
Set up the main loop.

```typescript
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
```

---

### Task 4: Final Verification and Commit

- [ ] **Step 1: Verify the build**
Run: `pnpm build`
Expected: SUCCESS

- [ ] **Step 2: Commit changes**

```bash
git add src/content/index.ts
git commit -m "feat: implement Shadow DOM global status bar with nav shortcuts and keyboard toggle"
```

---

Plan complete and saved to `docs/superpowers/plans/2026-05-03-global-status-bar.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
