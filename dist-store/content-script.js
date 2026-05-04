const y="gtab_global_status",w="gtab_ai_config",b="gtab_status_bar_visible",C=`
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
`;let i=null,c=null,S="Alt+S",v=!1,p=!1;function k(t){return`${Math.floor(t/60).toString().padStart(2,"0")}:${(t%60).toString().padStart(2,"0")}`}function z(){if(i)return;i=document.createElement("div"),i.id="gtab-status-bar-host",i.style.position="fixed",i.style.zIndex="2147483647",i.style.pointerEvents="none",c=i.attachShadow({mode:"closed"});const t=document.createElement("style");t.id="gtab-style",t.textContent=C,c.appendChild(t);const e=document.createElement("div");e.id="gtab-modal-overlay",e.innerHTML='<div id="gtab-modal-content"></div>',c.appendChild(e);const a=document.createElement("div");a.id="gtab-container",a.classList.add("collapsed"),c.appendChild(a),document.documentElement.appendChild(i)}function _(t,e,a){var m,h,s;const o=`
    <div class="modal-stats">
      ${t.pomodoro?`
        <div class="modal-stat-card">
          <span class="modal-stat-label">Focus</span>
          <span class="modal-stat-value">🍅 ${k(t.pomodoro.timeLeft)}</span>
        </div>
      `:""}
      <div class="modal-stat-card">
        <span class="modal-stat-label">Weather</span>
        <span class="modal-stat-value">🌡️ ${((m=t.weather)==null?void 0:m.temp)||"--"}°</span>
      </div>
      <div class="modal-stat-card">
        <span class="modal-stat-label">Tasks</span>
        <span class="modal-stat-value">✅ ${t.taskCount}</span>
      </div>
    </div>
  `,l=(h=t.navShortcuts)!=null&&h.length?`
    <div class="launchpad-grid">
      ${t.navShortcuts.map((d,g)=>`
        <div class="launchpad-item" data-idx="${g}">
          <div class="launchpad-icon">
            <img src="${d.icon}" onerror="this.src='https://www.google.com/s2/favicons?sz=64&domain=${new URL(d.url).hostname}'"/>
          </div>
          <div class="launchpad-title">${d.title}</div>
        </div>
      `).join("")}
    </div>
  `:'<div style="opacity: 0.5; padding: 20px; text-align: center;">No shortcuts added yet.</div>';e.innerHTML=`
    <div class="modal-header">
      ${o}
      <div class="close-modal-btn" id="close-modal">✕</div>
    </div>
    ${l}
  `,(s=e.querySelector("#close-modal"))==null||s.addEventListener("click",()=>{p=!1,x()}),e.querySelectorAll(".launchpad-item").forEach(d=>{d.addEventListener("click",()=>{const g=parseInt(d.dataset.idx),u=t.navShortcuts[g].url;window.open(u,"_blank"),p=!1,x()})})}function f(t,e,a){var u,$;z();const o=c.getElementById("gtab-container"),l=c.getElementById("gtab-modal-overlay"),m=c.getElementById("gtab-modal-content");t.theme&&(i.style.setProperty("--dock-accent",t.theme.accent),i.style.setProperty("--dock-bg",t.theme.bg),i.style.setProperty("--dock-border",t.theme.border)),p&&a?(l.classList.add("open"),_(t,m)):l.classList.remove("open"),o.className="",a||o.classList.add("hidden");const h=e.dockPosition||"top-center";o.classList.add(`pos-${h}`),v?(o.classList.add("expanded"),o.classList.remove("collapsed")):(o.classList.add("collapsed"),o.classList.remove("expanded"));const s=[];if(t.pomodoro){const n=t.pomodoro,r=n.phase==="work"?"pomo-work":"pomo-break";s.push(`
      <div class="stat-item clickable ${r}" id="pomo-toggle">
        <span>🍅 ${k(n.timeLeft)}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${n.running?"⏸":"▶"}</span>
      </div>
    `)}if(t.gmailUnread>0&&s.push(`<div class="stat-item">✉️ ${t.gmailUnread}</div>`),t.taskCount>0&&s.push(`<div class="stat-item">✅ ${t.taskCount}</div>`),t.weather&&s.push(`<div class="stat-item">🌡️ ${t.weather.temp}°</div>`),t.spotify){const n=t.spotify.name.length>20?t.spotify.name.slice(0,20)+"...":t.spotify.name;s.push(`
      <div class="stat-item clickable" id="spotify-toggle">
        <span>🎵 ${n}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${t.spotify.isPlaying?"⏸":"▶"}</span>
      </div>
    `)}let d="";(u=t.navShortcuts)!=null&&u.length&&(d=`
      <div class="divider"></div>
      <div class="nav-shortcuts">
        ${t.navShortcuts.map((n,r)=>`
          <div class="nav-item" data-idx="${r}" title="${n.title}">
            <img src="${n.icon}" onerror="this.src='https://www.google.com/s2/favicons?sz=32&domain=${new URL(n.url).hostname}'"/>
          </div>
        `).join("")}
      </div>
    `);let g="G";t.pomodoro&&t.pomodoro.running&&(g=k(t.pomodoro.timeLeft).split(":")[0]),o.innerHTML=`
    <div class="collapsed-indicator">${g}</div>
    <div class="bar-content">
      ${s.join("")}
      ${d}
    </div>
  `,o.onclick=n=>{const r=n.target;if(o.classList.contains("collapsed")){e.dockBehavior==="modal"?p=!0:v=!0,f(t,e,a),n.stopPropagation();return}(r===o||r.classList.contains("bar-content"))&&(v=!1,f(t,e,a))},l.onclick=n=>{n.target===l&&(p=!1,f(t,e,a))},o.querySelectorAll(".nav-item").forEach(n=>{n.addEventListener("click",r=>{r.stopPropagation();const L=parseInt(n.dataset.idx),E=t.navShortcuts[L].url;window.open(E,"_blank")})}),($=o.querySelector("#pomo-toggle"))==null||$.addEventListener("click",n=>{var r;n.stopPropagation(),chrome.storage.local.set({gtab_pomo_cmd:{cmd:(r=t.pomodoro)!=null&&r.running?"stop":"start",ts:Date.now()}})})}window.addEventListener("keydown",t=>{if(t.key==="Escape"&&p){p=!1,x();return}const e=S.split("+"),a=e[e.length-1].toLowerCase(),o=e.includes("Alt"),l=e.includes("Ctrl"),m=e.includes("Cmd")||e.includes("Meta");t.key.toLowerCase()===a&&t.altKey===o&&t.ctrlKey===l&&t.metaKey===m&&(t.preventDefault(),I())});async function I(){const e=!((await chrome.storage.local.get(b))[b]??!0);await chrome.storage.local.set({[b]:e})}async function x(){const t=await chrome.storage.local.get([y,w,b]),e=t[y]||{pomodoro:null,gmailUnread:0,taskCount:0,weather:null,spotify:null,navShortcuts:[]},a=t[w],o=t[b]??!0;a!=null&&a.statusBarShortcut&&(S=a.statusBarShortcut),(a==null?void 0:a.statusBarEnabled)!==!1?f(e,a||{},o):i&&(i.remove(),i=null)}chrome.storage.onChanged.addListener(t=>{(t[y]||t[w]||t[b])&&x()});x();console.log("[GTab] Content script initialized ✓");
