const g="gtab_global_status",b="gtab_ai_config",c="gtab_status_bar_visible",L=`
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
`;let r=null,d=null,y="Alt+S",p=!1;function v(t){return`${Math.floor(t/60).toString().padStart(2,"0")}:${(t%60).toString().padStart(2,"0")}`}function $(){if(r)return;r=document.createElement("div"),r.id="gtab-status-bar-host",r.style.position="fixed",r.style.zIndex="2147483647",r.style.pointerEvents="none",d=r.attachShadow({mode:"closed"});const t=document.createElement("style");t.id="gtab-style",t.textContent=L,d.appendChild(t);const e=document.createElement("div");e.id="gtab-container",e.classList.add("collapsed"),d.appendChild(e),document.documentElement.appendChild(r)}function m(t,e,n){var f,u;$();const o=d.getElementById("gtab-container");t.theme&&(r.style.setProperty("--dock-accent",t.theme.accent),r.style.setProperty("--dock-bg",t.theme.bg),r.style.setProperty("--dock-border",t.theme.border)),o.className="",n||o.classList.add("hidden");const l=e.dockPosition||"top-center";o.classList.add(`pos-${l}`),p?(o.classList.add("expanded"),o.classList.remove("collapsed")):(o.classList.add("collapsed"),o.classList.remove("expanded"));const s=[];if(t.pomodoro){const a=t.pomodoro,i=a.phase==="work"?"pomo-work":"pomo-break";s.push(`
      <div class="stat-item clickable ${i}" id="pomo-toggle">
        <span>🍅 ${v(a.timeLeft)}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${a.running?"⏸":"▶"}</span>
      </div>
    `)}if(t.gmailUnread>0&&s.push(`<div class="stat-item">✉️ ${t.gmailUnread}</div>`),t.taskCount>0&&s.push(`<div class="stat-item">✅ ${t.taskCount}</div>`),t.weather&&s.push(`<div class="stat-item">🌡️ ${t.weather.temp}°</div>`),t.spotify){const a=t.spotify.name.length>20?t.spotify.name.slice(0,20)+"...":t.spotify.name;s.push(`
      <div class="stat-item clickable" id="spotify-toggle">
        <span>🎵 ${a}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${t.spotify.isPlaying?"⏸":"▶"}</span>
      </div>
    `)}let h="";(f=t.navShortcuts)!=null&&f.length&&(h=`
      <div class="divider"></div>
      <div class="nav-shortcuts">
        ${t.navShortcuts.map((a,i)=>`
          <div class="nav-item" data-idx="${i}" title="${a.title}">
            <img src="${a.icon}" onerror="this.src='https://www.google.com/s2/favicons?sz=32&domain=${new URL(a.url).hostname}'"/>
          </div>
        `).join("")}
      </div>
    `);let x="G";t.pomodoro&&t.pomodoro.running&&(x=v(t.pomodoro.timeLeft).split(":")[0]),o.innerHTML=`
    <div class="collapsed-indicator">${x}</div>
    <div class="bar-content">
      ${s.join("")}
      ${h}
    </div>
  `,o.onclick=a=>{const i=a.target;if(o.classList.contains("collapsed")){p=!0,m(t,e,n),a.stopPropagation();return}(i===o||i.classList.contains("bar-content"))&&(p=!1,m(t,e,n))},o.querySelectorAll(".nav-item").forEach(a=>{a.addEventListener("click",i=>{i.stopPropagation();const w=parseInt(a.dataset.idx),S=t.navShortcuts[w].url;window.open(S,"_blank")})}),(u=o.querySelector("#pomo-toggle"))==null||u.addEventListener("click",a=>{var i;a.stopPropagation(),chrome.storage.local.set({gtab_pomo_cmd:{cmd:(i=t.pomodoro)!=null&&i.running?"stop":"start",ts:Date.now()}})})}window.addEventListener("keydown",t=>{const e=y.split("+"),n=e[e.length-1].toLowerCase(),o=e.includes("Alt"),l=e.includes("Ctrl"),s=e.includes("Cmd")||e.includes("Meta");t.key.toLowerCase()===n&&t.altKey===o&&t.ctrlKey===l&&t.metaKey===s&&(t.preventDefault(),C())});async function C(){const e=!((await chrome.storage.local.get(c))[c]??!0);await chrome.storage.local.set({[c]:e})}async function k(){const t=await chrome.storage.local.get([g,b,c]),e=t[g]||{pomodoro:null,gmailUnread:0,taskCount:0,weather:null,spotify:null,navShortcuts:[]},n=t[b],o=t[c]??!0;n!=null&&n.statusBarShortcut&&(y=n.statusBarShortcut),(n==null?void 0:n.statusBarEnabled)!==!1?m(e,n||{},o):r&&(r.remove(),r=null)}chrome.storage.onChanged.addListener(t=>{(t[g]||t[b]||t[c])&&k()});k();console.log("[GTab] Content script initialized ✓");
