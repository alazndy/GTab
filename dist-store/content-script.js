const z="gtab_global_status",P="gtab_ai_config",f="gtab_status_bar_visible",B=`
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

  /* Dropdown Panels */
  .gtab-panel {
    position: fixed;
    z-index: 2147483646;
    background: rgba(10, 12, 20, 0.92);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    min-width: 280px;
    max-width: 360px;
    max-height: 420px;
    overflow-y: auto;
    backdrop-filter: blur(24px);
    color: white;
    font-size: 12px;
    animation: panel-in 0.15s ease;
  }
  @keyframes panel-in {
    from { opacity: 0; transform: translateY(6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .panel-header {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1em;
    opacity: .4;
    margin-bottom: 10px;
    padding: 0 4px;
  }
  /* Timer panel */
  .pomo-panel-time {
    font-size: 36px;
    font-weight: 200;
    font-variant-numeric: tabular-nums;
    text-align: center;
    padding: 8px 0;
    color: var(--dock-accent);
  }
  .pomo-panel-phase {
    text-align: center;
    font-size: 11px;
    opacity: .5;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  .pomo-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
  }
  .pomo-tab {
    flex: 1;
    padding: 5px 6px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(255,255,255,.04);
    cursor: pointer;
    font-size: 10px;
    text-align: center;
    transition: all .15s;
    color: rgba(255,255,255,.5);
  }
  .pomo-tab.active { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.2); color: white; }
  .pomo-tab:hover { background: rgba(255,255,255,.09); }
  .pomo-controls {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .pomo-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.06);
    cursor: pointer;
    font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s;
    color: white;
  }
  .pomo-btn.primary { width: 48px; height: 48px; font-size: 18px; background: var(--dock-accent); border-color: transparent; }
  .pomo-btn:hover { background: rgba(255,255,255,.14); }
  .pomo-btn.primary:hover { filter: brightness(1.2); }
  .pomo-dots { display: flex; justify-content: center; gap: 6px; }
  .pomo-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.15); }
  .pomo-dot.done { background: #f87171; }
  /* Mail panel */
  .mail-item {
    display: flex; flex-direction: column; gap: 2px;
    padding: 8px 10px; border-radius: 10px; cursor: pointer;
    border: 1px solid transparent; transition: all .15s;
  }
  .mail-item:hover { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.08); }
  .mail-from { font-size: 11px; font-weight: 600; color: rgba(255,255,255,.85); }
  .mail-subject { font-size: 11px; color: rgba(255,255,255,.55); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mail-snippet { font-size: 10px; color: rgba(255,255,255,.3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* Media panel */
  .media-title { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
  .media-artist { font-size: 11px; opacity: .5; margin-bottom: 10px; }
  .media-progress { width: 100%; height: 3px; background: rgba(255,255,255,.1); border-radius: 2px; margin-bottom: 10px; overflow: hidden; }
  .media-progress-fill { height: 100%; background: var(--dock-accent); transition: width .5s linear; }
  .media-controls { display: flex; justify-content: center; gap: 10px; }
  .media-btn {
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.06);
    cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
    transition: all .15s; color: white;
  }
  .media-btn.primary { width: 44px; height: 44px; font-size: 18px; background: var(--dock-accent); border-color: transparent; }
  .media-btn:hover { background: rgba(255,255,255,.14); }
  .media-btn.primary:hover { filter: brightness(1.2); }
`;let d=null,n=null,q="Alt+S",E=!1,x=!1,v=null,k=null,y=null;function H(t){const e=t.match(/^(.*?)\s*<.*>$/);return e?e[1].trim():t}function M(){const t=navigator.mediaSession,e=t==null?void 0:t.metadata,o=[...Array.from(document.querySelectorAll("video")),...Array.from(document.querySelectorAll("audio"))],a=o.find(r=>!r.paused&&r.duration>0)||o.find(r=>r.duration>0);return!e&&!a?null:{title:(e==null?void 0:e.title)||(a?document.title.slice(0,40):""),artist:(e==null?void 0:e.artist)||window.location.hostname,isPlaying:(t==null?void 0:t.playbackState)==="playing"||(a?!a.paused:!1),progress:a&&a.duration>0?a.currentTime/a.duration*100:0}}function Y(t){const o=[...Array.from(document.querySelectorAll("video")),...Array.from(document.querySelectorAll("audio"))].find(a=>a.duration>0);if(t==="play"){o==null||o.play();try{navigator.mediaSession.playbackState="playing"}catch{}}if(t==="pause"){o==null||o.pause();try{navigator.mediaSession.playbackState="paused"}catch{}}if(t==="prev")try{navigator.mediaSession.callAction("previoustrack")}catch{}if(t==="next")try{navigator.mediaSession.callAction("nexttrack")}catch{}}function L(){var t;v=null,(t=n==null?void 0:n.querySelector(".gtab-panel"))==null||t.remove()}function w(t){var m;if(v===t){L();return}v=t,(m=n==null?void 0:n.querySelector(".gtab-panel"))==null||m.remove();const e=document.createElement("div");e.className="gtab-panel";const o=n==null?void 0:n.getElementById("gtab-container"),a=o==null?void 0:o.classList.contains("pos-bottom-center"),r=o==null?void 0:o.getBoundingClientRect();r&&(a?e.style.bottom=`${window.innerHeight-r.top+8}px`:e.style.top=`${r.bottom+8}px`,e.style.left="50%",e.style.transform="translateX(-50%)"),t==="timer"?U(e):t==="mail"?K(e):t==="media"&&D(e),n==null||n.appendChild(e)}function U(t){var l;const e=k==null?void 0:k.pomodoro,o=[["work","Odak"],["short-break","Kısa Mola"],["long-break","Uzun Mola"]],a=(e==null?void 0:e.phase)||"work",r={work:1500,"short-break":300,"long-break":900},m=(e==null?void 0:e.timeLeft)??r[a],b=(e==null?void 0:e.running)??!1,c=(e==null?void 0:e.sessions)??0;t.innerHTML=`
    <div class="panel-header">Pomodoro</div>
    <div class="pomo-tabs">
      ${o.map(([s,p])=>`<div class="pomo-tab ${a===s?"active":""}" data-phase="${s}">${p}</div>`).join("")}
    </div>
    <div class="pomo-panel-time">${S(m)}</div>
    <div class="pomo-panel-phase">${((l=o.find(([s])=>s===a))==null?void 0:l[1])||""}</div>
    <div class="pomo-controls">
      <div class="pomo-btn" data-cmd="reset">↺</div>
      <div class="pomo-btn primary" data-cmd="${b?"stop":"start"}">${b?"⏸":"▶"}</div>
      <div class="pomo-btn" data-cmd="skip">⏭</div>
    </div>
    <div class="pomo-dots">
      ${Array.from({length:4}).map((s,p)=>`<div class="pomo-dot ${p<c%4?"done":""}"></div>`).join("")}
    </div>
  `,t.querySelectorAll("[data-cmd]").forEach(s=>{s.addEventListener("click",p=>{p.stopPropagation();const u=s.dataset.cmd;chrome.storage.local.set({gtab_pomo_cmd:{cmd:u,ts:Date.now()}})})}),t.querySelectorAll("[data-phase]").forEach(s=>{s.addEventListener("click",p=>{p.stopPropagation();const u=s.dataset.phase;chrome.storage.local.set({gtab_pomo_cmd:{cmd:"switch-phase",phase:u,ts:Date.now()}})})})}function K(t){chrome.storage.local.get(["gtab_status_emails"],e=>{const o=e.gtab_status_emails||[];t.innerHTML=`<div class="panel-header">Okunmamış E-postalar (${o.length})</div>`+(o.length===0?'<div style="padding:12px;opacity:.4;text-align:center">E-posta yok</div>':o.map(a=>`
            <div class="mail-item" data-id="${a.id}">
              <div class="mail-from">${H(a.from)}</div>
              <div class="mail-subject">${a.subject}</div>
              ${a.snippet?`<div class="mail-snippet">${a.snippet}</div>`:""}
            </div>
          `).join("")),t.querySelectorAll(".mail-item").forEach(a=>{a.addEventListener("click",()=>{window.open(`https://mail.google.com/mail/#inbox/${a.dataset.id}`,"_blank"),L()})})})}function D(t){const e=M();if(!e){t.innerHTML='<div style="padding:12px;opacity:.4;text-align:center">Medya bulunamadı</div>';return}t.innerHTML=`
    <div class="panel-header">Medya</div>
    <div class="media-title">${e.title}</div>
    <div class="media-artist">${e.artist}</div>
    <div class="media-progress"><div class="media-progress-fill" style="width:${e.progress}%"></div></div>
    <div class="media-controls">
      <div class="media-btn" data-action="prev">⏮</div>
      <div class="media-btn primary" data-action="${e.isPlaying?"pause":"play"}">${e.isPlaying?"⏸":"▶"}</div>
      <div class="media-btn" data-action="next">⏭</div>
    </div>
  `,t.querySelectorAll("[data-action]").forEach(o=>{o.addEventListener("click",a=>{a.stopPropagation(),Y(o.dataset.action),setTimeout(()=>{L(),w("media")},300)})}),y&&clearInterval(y),y=window.setInterval(()=>{const o=M();if(!o||v!=="media"){clearInterval(y);return}const a=t.querySelector(".media-progress-fill");a&&(a.style.width=`${o.progress}%`)},1e3)}function S(t){return`${Math.floor(t/60).toString().padStart(2,"0")}:${(t%60).toString().padStart(2,"0")}`}function O(){if(d)return;d=document.createElement("div"),d.id="gtab-status-bar-host",d.style.position="fixed",d.style.zIndex="2147483647",d.style.pointerEvents="none",n=d.attachShadow({mode:"closed"});const t=document.createElement("style");t.id="gtab-style",t.textContent=B,n.appendChild(t);const e=document.createElement("div");e.id="gtab-modal-overlay",e.innerHTML='<div id="gtab-modal-content"></div>',n.appendChild(e);const o=document.createElement("div");o.id="gtab-container",o.classList.add("collapsed"),n.appendChild(o),document.documentElement.appendChild(d)}function N(t,e,o){var m,b,c;const a=`
    <div class="modal-stats">
      ${t.pomodoro?`
        <div class="modal-stat-card">
          <span class="modal-stat-label">Focus</span>
          <span class="modal-stat-value">🍅 ${S(t.pomodoro.timeLeft)}</span>
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
  `,r=(b=t.navShortcuts)!=null&&b.length?`
    <div class="launchpad-grid">
      ${t.navShortcuts.map((l,s)=>`
        <div class="launchpad-item" data-idx="${s}">
          <div class="launchpad-icon">
            <img src="${l.icon}" onerror="this.src='https://www.google.com/s2/favicons?sz=64&domain=${new URL(l.url).hostname}'"/>
          </div>
          <div class="launchpad-title">${l.title}</div>
        </div>
      `).join("")}
    </div>
  `:'<div style="opacity: 0.5; padding: 20px; text-align: center;">No shortcuts added yet.</div>';e.innerHTML=`
    <div class="modal-header">
      ${a}
      <div class="close-modal-btn" id="close-modal">✕</div>
    </div>
    ${r}
  `,(c=e.querySelector("#close-modal"))==null||c.addEventListener("click",()=>{x=!1,h()}),e.querySelectorAll(".launchpad-item").forEach(l=>{l.addEventListener("click",()=>{const s=parseInt(l.dataset.idx),p=t.navShortcuts[s].url;window.open(p,"_blank"),x=!1,h()})})}function $(t,e,o){var u,_,A,C,j;O();const a=n.getElementById("gtab-container"),r=n.getElementById("gtab-modal-overlay"),m=n.getElementById("gtab-modal-content");t.theme&&(d.style.setProperty("--dock-accent",t.theme.accent),d.style.setProperty("--dock-bg",t.theme.bg),d.style.setProperty("--dock-border",t.theme.border)),x&&o?(r.classList.add("open"),N(t,m)):r.classList.remove("open"),a.className="",o||a.classList.add("hidden");const b=e.dockPosition||"top-center";a.classList.add(`pos-${b}`),E?(a.classList.add("expanded"),a.classList.remove("collapsed")):(a.classList.add("collapsed"),a.classList.remove("expanded"));const c=[];if(t.pomodoro){const i=t.pomodoro,g=i.phase==="work"?"pomo-work":"pomo-break";c.push(`
      <div class="stat-item clickable ${g}" id="pomo-toggle">
        <span>🍅 ${S(i.timeLeft)}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${i.running?"⏸":"▶"}</span>
      </div>
    `)}t.gmailUnread>0&&c.push(`<div class="stat-item clickable" id="mail-toggle">✉️ ${t.gmailUnread}</div>`),t.taskCount>0&&c.push(`<div class="stat-item">✅ ${t.taskCount}</div>`),t.weather&&c.push(`<div class="stat-item">🌡️ ${t.weather.temp}°</div>`);const l=M();if(l){const i=l.title.length>22?l.title.slice(0,22)+"…":l.title;c.push(`
      <div class="stat-item clickable" id="media-toggle">
        <span>${l.isPlaying?"⏸":"▶"}</span>
        <span style="font-size:11px">${i}</span>
      </div>
    `)}if(t.spotify&&!l){const i=t.spotify.name.length>20?t.spotify.name.slice(0,20)+"...":t.spotify.name;c.push(`
      <div class="stat-item clickable" id="spotify-toggle">
        <span>🎵 ${i}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${t.spotify.isPlaying?"⏸":"▶"}</span>
      </div>
    `)}let s="";(u=t.navShortcuts)!=null&&u.length&&(s=`
      <div class="divider"></div>
      <div class="nav-shortcuts">
        ${t.navShortcuts.map((i,g)=>`
          <div class="nav-item" data-idx="${g}" title="${i.title}">
            <img src="${i.icon}" onerror="this.src='https://www.google.com/s2/favicons?sz=32&domain=${new URL(i.url).hostname}'"/>
          </div>
        `).join("")}
      </div>
    `);let p="G";t.pomodoro&&t.pomodoro.running&&(p=S(t.pomodoro.timeLeft).split(":")[0]),a.innerHTML=`
    <div class="collapsed-indicator">${p}</div>
    <div class="bar-content">
      ${c.join("")}
      ${s}
    </div>
  `,a.onclick=i=>{const g=i.target;if(a.classList.contains("collapsed")){e.dockBehavior==="modal"?x=!0:E=!0,$(t,e,o),i.stopPropagation();return}(g===a||g.classList.contains("bar-content"))&&(E=!1,$(t,e,o))},r.onclick=i=>{i.target===r&&(x=!1,$(t,e,o))},a.querySelectorAll(".nav-item").forEach(i=>{i.addEventListener("click",g=>{g.stopPropagation();const I=parseInt(i.dataset.idx),T=t.navShortcuts[I].url;window.open(T,"_blank")})}),(_=a.querySelector("#pomo-toggle"))==null||_.addEventListener("click",i=>{i.stopPropagation(),w("timer")}),(A=a.querySelector("#mail-toggle"))==null||A.addEventListener("click",i=>{i.stopPropagation(),w("mail")}),(C=a.querySelector("#media-toggle"))==null||C.addEventListener("click",i=>{i.stopPropagation(),w("media")}),(j=a.querySelector("#spotify-toggle"))==null||j.addEventListener("click",i=>{var g;i.stopPropagation(),chrome.storage.local.set({gtab_pomo_cmd:{cmd:(g=t.spotify)!=null&&g.isPlaying?"stop":"start",ts:Date.now()}})})}window.addEventListener("keydown",t=>{if(t.key==="Escape"){if(v){L();return}if(x){x=!1,h();return}}const e=q.split("+"),o=e[e.length-1].toLowerCase(),a=e.includes("Alt"),r=e.includes("Ctrl"),m=e.includes("Cmd")||e.includes("Meta");t.key.toLowerCase()===o&&t.altKey===a&&t.ctrlKey===r&&t.metaKey===m&&(t.preventDefault(),F())});async function F(){const e=!((await chrome.storage.local.get(f))[f]??!0);await chrome.storage.local.set({[f]:e})}async function h(){const t=await chrome.storage.local.get([z,P,f]),e=t[z]||{pomodoro:null,gmailUnread:0,taskCount:0,weather:null,spotify:null,navShortcuts:[]},o=t[P]||{};k=e;const a=t[f]??!0;o!=null&&o.statusBarShortcut&&(q=o.statusBarShortcut),(o==null?void 0:o.statusBarEnabled)!==!1?$(e,o||{},a):d&&(d.remove(),d=null)}chrome.storage.onChanged.addListener(t=>{(t[z]||t[P]||t[f])&&h()});h();console.log("[GTab] Content script initialized ✓");
