const p="gtab_global_status",m="gtab_ai_config",r="gtab_status_bar_visible",v=`
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
`;let n=null,d=null,u="Alt+S";function x(t){return`${Math.floor(t/60).toString().padStart(2,"0")}:${(t%60).toString().padStart(2,"0")}`}function g(t){const e="40px";document.documentElement.style.transition="margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1)",document.documentElement.style.marginTop=t?e:"0"}function y(){if(n)return;n=document.createElement("div"),n.id="gtab-status-bar-host",n.style.position="fixed",n.style.top="0",n.style.left="0",n.style.width="100%",n.style.height="0",n.style.zIndex="2147483647",n.style.pointerEvents="none",d=n.attachShadow({mode:"closed"});const t=document.createElement("style");t.textContent=v,d.appendChild(t);const e=document.createElement("div");e.id="gtab-container",e.style.pointerEvents="auto",d.appendChild(e),document.documentElement.appendChild(n)}function w(t,e){var c,b;y();const a=d.getElementById("gtab-container");if(!e){a.classList.add("hidden"),g(!1);return}a.classList.remove("hidden"),g(!0);const i=[];if(t.pomodoro){const o=t.pomodoro,s=o.phase==="work"?"pomo-work":"pomo-break";i.push(`
      <div class="stat-item clickable ${s}" id="pomo-toggle">
        <span>🍅 ${x(o.timeLeft)}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${o.running?"⏸":"▶"}</span>
      </div>
    `)}if(t.gmailUnread>0&&i.push(`<div class="stat-item">✉️ ${t.gmailUnread}</div>`),t.taskCount>0&&i.push(`<div class="stat-item">✅ ${t.taskCount}</div>`),t.weather&&i.push(`<div class="stat-item">🌡️ ${t.weather.temp}°</div>`),t.spotify){const o=t.spotify.name.length>20?t.spotify.name.slice(0,20)+"...":t.spotify.name;i.push(`
      <div class="stat-item clickable" id="spotify-toggle">
        <span>🎵 ${o}</span>
        <span style="font-size: 10px; opacity: 0.7; margin-left: 4px;">${t.spotify.isPlaying?"⏸":"▶"}</span>
      </div>
    `)}let l="";(c=t.navShortcuts)!=null&&c.length&&(l=`
      <div class="divider"></div>
      <div class="nav-shortcuts">
        ${t.navShortcuts.map((o,s)=>`
          <div class="nav-item" data-idx="${s}" title="${o.title}">
            <img src="${o.icon}" onerror="this.src='https://www.google.com/s2/favicons?sz=32&domain=${new URL(o.url).hostname}'"/>
            <span>${o.title}</span>
          </div>
        `).join("")}
      </div>
    `),a.innerHTML=`
    <div class="bar-content">
      ${i.join("")}
      ${l}
    </div>
  `,a.querySelectorAll(".nav-item").forEach(o=>{o.addEventListener("click",()=>{const s=parseInt(o.dataset.idx),f=t.navShortcuts[s].url;window.location.href=f})}),(b=a.querySelector("#pomo-toggle"))==null||b.addEventListener("click",()=>{var o;chrome.storage.local.set({gtab_pomo_cmd:{cmd:(o=t.pomodoro)!=null&&o.running?"stop":"start",ts:Date.now()}})})}window.addEventListener("keydown",t=>{const e=u.split("+"),a=e[e.length-1].toLowerCase(),i=e.includes("Alt"),l=e.includes("Ctrl"),c=e.includes("Cmd")||e.includes("Meta");t.key.toLowerCase()===a&&t.altKey===i&&t.ctrlKey===l&&t.metaKey===c&&(t.preventDefault(),k())});async function k(){const e=!((await chrome.storage.local.get(r))[r]??!0);await chrome.storage.local.set({[r]:e})}async function h(){const t=await chrome.storage.local.get([p,m,r]),e=t[p],a=t[m],i=t[r]??!0;a!=null&&a.statusBarShortcut&&(u=a.statusBarShortcut),(a==null?void 0:a.statusBarEnabled)!==!1&&e?w(e,i):n&&(n.remove(),n=null,g(!1))}chrome.storage.onChanged.addListener(t=>{(t[p]||t[m]||t[r])&&h()});h();console.log("[GTab] Content script initialized ✓");
