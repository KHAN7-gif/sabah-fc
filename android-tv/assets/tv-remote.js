(() => {
  if(window.SabahTVRemote)return;
  const css=document.createElement('style');
  css.textContent=`
    :root{color-scheme:dark;--surface:#202127;--line:#ffffff18;--navy:#f4f5f8;--blue:#b4cdf9}
    html{scroll-behavior:smooth;scroll-padding:38px 35px;background:#101114}
    body{--tv-sidebar:222px;margin:0;background:radial-gradient(ellipse at 90% 0,#26324755,transparent 65%),#101114!important;color:#f5f5f7!important;font:18px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #app{margin-left:var(--tv-sidebar);min-height:100vh}
    #app>header,.mobile-bottom-nav{display:none!important}
    #app>main{max-width:none!important;width:auto!important;margin:0!important;padding:42px 42px 28px!important}
    #app .portal-page,#app .stats-dashboard,#app .squad-page,#app .match-detail,#app .squad-profile{max-width:none!important;width:100%!important}
    #app .stats-dashboard{padding:0!important}
    #app :is(h1,h2,h3,h4,.kpi,.score,.compact-team,.standing-club,.standing-points,.event-player,.match-record-player,.stats-goal-scorer,.stats-goal-opponent,.stats-goal-minute,.profile-intro h1,.profile-club,.profile-position-name){color:#f5f5f7!important}
    #app h1{font-size:clamp(32px,3.2vw,54px)!important;letter-spacing:-.045em!important;line-height:1.12!important;text-transform:none}
    #app h2{font-size:26px;letter-spacing:-.025em}#app h3{font-size:21px}
    #app :is(.muted,.competition-caption,.match-count,.compact-round,.compact-status,.fixture-meta,.stats-source-note,.stats-goal-vs,.stats-goal-opponent small,.profile-note,.match-disclaimer,.profile-disclaimer,.match-event-note,.profile-team,.portal-page-heading p,.stats-heading p,.squad-section-heading span,.squad-search label,.squad-search [data-squad-count],.video-source-credit,.stats-goal-scorer small){color:#aeb2bd!important;font-size:14px!important}
    #app a{color:#a9cbff}#app :is(.portal-eyebrow,.eyebrow,.profile-section-kicker){color:#becbe2!important;letter-spacing:.16em}
    #app :is(.panel,.match-centre,.stats-board,.profile-panel,.profile-information,.main-position,.club-trophy-card,.club-all-titles,.home-calendar,.schedule-card,.standing-panel,.match-video,.match-detail,.event-editor,.squad-admin-extra){background:#1c1d23!important;border-color:#ffffff14!important;box-shadow:0 12px 40px #0002!important;border-radius:20px}
    #app :is(.compact-match,.fixture-card,.match,.stats-ranking-row,.stats-leader,.stats-summary>div,.profile-fields>div,.profile-stat,.match-event-list,.event-edit-row,.opponent-item,.opening-rank-row,.schedule-match){background:#26272e!important;border-color:#ffffff14!important;color:#f5f5f7!important;box-shadow:none!important}
    #app :is(.stats-summary,.stats-board-header,.stats-switch,.stats-leader-photo,.stats-rank-avatar,.competition-tabs,.club-tabs,.club-victories-label,.match-filters,.detail-top,.detail-matchmeta,.detail-content,.match-timeline-team,.match-team-stats-clubs,.squad-section-heading,.squad-list,.club-all-titles th){background:#1c1d23!important;border-color:#ffffff14!important;color:#dce0e9!important}
    #app :is(.stats-summary b,.stats-leader-details strong,.stats-rank-details strong,.stats-ranking-row b,.club-trophy-card h3,.club-trophy-body>strong,.club-all-titles td,.standing-table td,.standing-table th,.profile-fields dd,.profile-fields strong,.profile-fields label,.cal-date,.schedule-title){color:#f5f5f7!important}
    #app :is(th,td,.match-timeline-row,.match-record,.club-trophy-card h3){border-color:#ffffff14!important}
    #app :is(.schedule-day,.schedule-club strong,.schedule-status,.schedule-score,.cal-controls strong,.stats-no-data){color:#eef0f6!important}
    #app :is(.schedule-competition,.schedule-small,.schedule-ground,.stats-summary small,.stats-leader-details small,.stats-rank-details small,.cal-weekdays,.cal-competition-key){color:#afb5c4!important}
    #app .schedule-club strong{font-size:16px!important}#app .schedule-title{border:0!important;border-radius:20px!important;padding:22px 26px!important;background:radial-gradient(ellipse at 90% 0,#687e9b66,transparent 65%),#253957!important}
    #app .portal-page :is(.stats-competition-tabs,.home-competition-tabs,.competition-tabs,.club-tabs,.match-filters){background:#1c1d23!important;border:0!important}
    #app .portal-page :is(.stats-competition-tabs,.home-competition-tabs,.competition-tabs,.club-tabs,.match-filters) button{background:transparent!important;color:#bdc2ce!important;min-height:44px;font-size:15px!important;border:0!important;border-radius:12px!important}
    #app .portal-page :is(.stats-competition-tabs,.home-competition-tabs,.competition-tabs,.club-tabs,.match-filters) button.active{background:#e9eaf0!important;color:#17181e!important;box-shadow:none!important}
    #app .standing-table th{background:#292c35!important;color:#ccd1dd!important}
    #app .standing-table .sabah-highlight,#app .standing-table .sabah-highlight td{background:#33445f!important}
    #app .home-calendar :is(.cal-date,.cal-controls button){background:#30323c!important;color:#f5f5f7!important}
    #app .schedule-list{padding:0!important}
    @media(min-width:1200px){#app .schedule-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:auto 1fr;grid-auto-flow:column;gap:10px 20px}#app .schedule-day{margin:16px 0 0}#app .schedule-card{min-width:0;margin:0}#app .schedule-empty{grid-column:1/-1}}

    #app :is(.hero,.squad-header,.club-banner,.squad-stats-header,.club-honours-hero){border:1px solid #ffffff10!important;background:radial-gradient(ellipse at 90% 0,#687e9b66,transparent 65%),linear-gradient(115deg,#253957,#172435)!important;box-shadow:0 18px 50px #0003!important;padding:32px!important;border-radius:24px!important}
    #app .squad-profile--showcase .profile-hero{background:radial-gradient(ellipse at 20% 0,#46628d,transparent 65%),#1b2434!important}
    #app .squad-section{background:transparent!important;margin-bottom:32px}
    #app .squad-section-heading{padding:12px 0!important;border:0!important}
    #app .squad-list{padding:10px 0!important;background:transparent!important;gap:18px!important}
    #app .squad-page--roster .squad-list{grid-template-columns:repeat(6,minmax(0,1fr))!important}
    #app .squad-player--portrait{aspect-ratio:3/4!important;border-radius:15px!important;background:radial-gradient(ellipse at 50% 8%,#a2adc2,transparent 80%),linear-gradient(#56647f,#202f4d)!important}
    #app .squad-player-copy strong{font-size:15px!important;line-height:1.25!important}
    #app .squad-player-copy small{font-size:12px!important}
    #app :is(button,input,select,textarea){font-family:inherit}
    #app :is(input,select,textarea){background:#292b33!important;color:#f5f5f7!important;border:1px solid #ffffff26!important;font-size:17px!important;border-radius:12px!important;min-height:46px}
    #app :is(input,textarea)::placeholder{color:#a6a9b4!important}
    #app :is(.secondary,.competition-tab,.squad-position-filters button,.stats-switch button,.three-goal-half button,.club-tabs button,.profile-back,.detail-back){background:#30323c!important;color:#dddfe8!important;border-color:#ffffff12!important;border-radius:12px!important;min-height:44px;padding:10px 17px!important}
    #app :is(.competition-tab.active,.secondary.active,.squad-position-filters button[aria-pressed=true],.stats-switch .active,.three-goal-half button[aria-pressed=true],.club-tabs button.active){background:#e9eaf0!important;color:#17181e!important;border-color:#e9eaf0!important;box-shadow:none!important}
    #app .stats-category-tabs button{color:#c3c6d0!important;font-size:16px}#app .stats-category-tabs button.active{color:white!important;border-bottom-color:white!important}
    #app .detail-result{background:#f5f5f7!important;color:#17181e!important}#app .detail-result :is(strong,b,span){color:#17181e!important}
    #app .main-position p,#app .profile-portrait-caption{color:#b6c2d7!important}#app .squad-section-heading{background:transparent!important}
    #app .profile-hero-summary{background:#101823cc!important}#app .profile-position{background:#ffffff1c!important;color:white!important}
    #app .stats-goal-scorer{font-size:18px}#app footer{padding:20px 40px 36px;color:#8b8e99}
    button,a,input,select,textarea,[tabindex]{scroll-margin:36px 30px}
    .tv-focused{outline:3px solid #fff!important;outline-offset:5px!important;box-shadow:0 12px 34px #0008,0 0 0 8px #ffffff15!important;position:relative;z-index:2}
    #app :is(button,a).tv-focused{filter:brightness(1.18);transform:scale(1.025)}
    iframe.tv-focused{outline-offset:-5px!important}
    .tv-sidebar{position:fixed;inset:0 auto 0 0;width:var(--tv-sidebar);z-index:70;display:flex;flex-direction:column;gap:22px;padding:30px 18px 24px;background:linear-gradient(180deg,#24252ce8,#17181ee8);border-right:1px solid #ffffff0b;box-shadow:12px 0 50px #0002;backdrop-filter:blur(30px);overflow-y:auto;scrollbar-width:none}
    .tv-brand{display:flex;gap:12px;align-items:center;padding:0 9px;margin-bottom:12px;color:white}
    .tv-brand img{width:44px;height:50px;object-fit:contain}.tv-brand strong{font-size:20px;letter-spacing:-.03em;white-space:nowrap}.tv-brand small{display:block;font-size:9px;letter-spacing:.14em;color:#aeb4c3;white-space:nowrap}
    .tv-menu{display:flex;flex-direction:column;gap:8px}
    .tv-menu button{position:relative;width:100%;display:flex;align-items:center;gap:14px;text-align:left;padding:13px 18px;min-height:51px;border:0;border-radius:13px;background:transparent;color:#bfc1cb;font-size:18px;font-weight:650;line-height:1.1;cursor:pointer;transition:background .16s,color .16s,transform .16s}
    .tv-menu svg{width:23px;height:23px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .tv-menu button[aria-current=page]{background:#ffffff13;color:#fff}
    .tv-menu button[aria-current=page]::before{content:'';position:absolute;left:6px;top:21px;width:4px;height:12px;border-radius:4px;background:#d4d7e0}
    .tv-menu button.tv-focused{background:#f3f3f7!important;color:#17181d!important;outline:0!important;box-shadow:0 7px 24px #0005!important;transform:scale(1.035)}
    .tv-menu button.tv-focused::before{background:#3c3d45}
    .tv-sidebar-bottom{margin-top:auto;padding:16px 12px 0;color:#9b9da8;font-size:12px;border-top:1px solid #ffffff12}
    .tv-sidebar-bottom strong{display:block;color:#c9ccd6;font-size:13px;margin-bottom:4px}
    @media(max-height:650px){body{--tv-sidebar:194px}.tv-sidebar{padding:20px 14px;gap:12px}.tv-brand{margin-bottom:0}.tv-menu{gap:5px}.tv-menu button{padding:10px 14px;min-height:43px;font-size:16px}.tv-menu button[aria-current=page]::before{top:16px}.tv-sidebar-bottom{font-size:10px;padding-top:10px}#app>main{padding:28px!important}#app .squad-page--roster .squad-list{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important}}
  `;
  document.head.appendChild(css);
  const icons={
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    matches:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-12 4 2 2 4-4"/>',
    standing:'<path d="M8 21h8m-4-4v4M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4"/>',
    stats:'<path d="M4 20V10m5 10V5m5 15v-8m5 8V8"/>',
    players:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5"/>',
    about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
    admin:'<path d="M12 3 4 6v6c0 4 8 9 8 9s8-5 8-9V6z"/><path d="m8 12 3 3 5-6"/>'
  };
  const sidebar=document.createElement('aside');sidebar.className='tv-sidebar';sidebar.setAttribute('aria-label','Sabah FC TV');
  sidebar.innerHTML='<div class="tv-brand"><img src="assets/logos/sabah-fc.png" alt="Logo Sabah FC"><div><strong>Sabah FC</strong><small>FAN PORTAL · TV</small></div></div><div class="tv-menu" role="navigation" aria-label="Navigasi utama TV"></div><div class="tv-sidebar-bottom"><strong>SEASON 2026/27</strong>Unofficial fan portal</div>';
  document.body.appendChild(sidebar);
  const sourceMenu=()=>[...document.querySelectorAll('#app>header [data-page]')];
  const menu=sidebar.querySelector('.tv-menu');
  let menuSignature='';
  const syncMenu=()=>{
    const sources=sourceMenu(),signature=sources.map(x=>x.dataset.page+':'+x.textContent).join('|');
    if(signature!==menuSignature){
      menuSignature=signature;menu.replaceChildren();
      for(const source of sources){
        const button=document.createElement('button');button.type='button';button.dataset.tvPage=source.dataset.page;
        button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+(icons[source.dataset.page]||icons.about)+'</svg><span></span>';
        button.querySelector('span').textContent=source.textContent;button.onclick=()=>{sourceMenu().find(x=>x.dataset.page===button.dataset.tvPage)?.click();window.scrollTo({top:0,behavior:'instant'})};menu.appendChild(button);
      }
    }
    const active=sourceMenu().find(x=>x.getAttribute('aria-current')==='page')?.dataset.page;
    // Detail views retain their parent section in the sidebar.
    const selected=active||(document.querySelector('.squad-profile')?'players':document.querySelector('.match-detail')?'matches':null);
    for(const button of menu.children)button.setAttribute('aria-current',button.dataset.tvPage===selected?'page':'false');
  };
  const selector='button,a[href],input:not([type=hidden]),select,textarea,iframe,[tabindex="0"],[role="button"]';
  const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return !el.disabled&&!el.closest('[hidden]')&&r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
  const candidates=()=>{const dialog=document.querySelector('dialog[open]');return [...(dialog||document).querySelectorAll(selector)].filter(visible)};
  let current=null;let remembered=null;
  const focus=el=>{if(!el||!visible(el))return;document.querySelectorAll('.tv-focused').forEach(x=>x.classList.remove('tv-focused'));current=el;remembered=['data-tv-page','data-stats-category','data-stats-competition','data-squad-position','data-competition','data-goal-half'].map(key=>el.hasAttribute(key)?[key,el.getAttribute(key)]:null).find(Boolean)||null;el.classList.add('tv-focused');el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',inline:'nearest'});};
  const center=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};
  const ensure=()=>{const dialog=document.querySelector('dialog[open]');if(current?.isConnected&&visible(current)&&(!dialog||dialog.contains(current)))return current;const all=candidates();const restored=remembered?all.find(el=>el.getAttribute(remembered[0])===remembered[1]):null;const active=document.activeElement;const first=(dialog?all.find(el=>dialog.contains(el)):null)||(active?.matches(selector)&&all.includes(active)?active:null)||restored||all.find(el=>el.matches('[data-close-match],[data-back-players],[data-cancel-player],[data-admin-back]'))||all.find(el=>el.matches('[data-tv-page][aria-current=page]'))||all[0];focus(first);return first};
  const move=direction=>{
    const origin=ensure();if(!origin)return false;
    const inSidebar=sidebar.contains(origin),dialog=document.querySelector('dialog[open]');
    if(inSidebar&&(direction==='up'||direction==='down')){const items=[...menu.children].filter(visible),index=items.indexOf(origin),target=items[index+(direction==='down'?1:-1)];if(target)focus(target);return !!target}
    if(inSidebar&&direction==='left')return false;
    if(inSidebar&&direction==='right'){
      const all=candidates().filter(el=>document.querySelector('#app>main')?.contains(el));
      const onscreen=all.find(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight});
      const target=onscreen||all[0];if(target)focus(target);return !!target;
    }
    const mainArea=document.querySelector('#app>main');
    if(direction==='left'&&!dialog&&mainArea&&origin.getBoundingClientRect().left<=mainArea.getBoundingClientRect().left+parseFloat(getComputedStyle(mainArea).paddingLeft)+10){focus(menu.querySelector('[aria-current=page]')||menu.firstElementChild);return true}
    const from=center(origin);let best=null,score=Infinity;
    for(const target of candidates()){
      if(target===origin||origin.contains(target)||target.contains(origin)||(!inSidebar&&sidebar.contains(target)))continue;
      const to=center(target),dx=to.x-from.x,dy=to.y-from.y;
      const main=direction==='right'?dx:direction==='left'?-dx:direction==='down'?dy:-dy;
      const cross=(direction==='right'||direction==='left')?Math.abs(dy):Math.abs(dx);
      if(main<=4)continue;
      const rank=main+cross*3+(cross>main?cross*2:0);
      if(rank<score){best=target;score=rank}
    }
    if(!best&&direction==='left'&&!dialog)best=menu.querySelector('[aria-current=page]')||menu.firstElementChild;
    if(best)focus(best);else if(direction==='down'||direction==='up')window.scrollBy({top:(direction==='down'?1:-1)*innerHeight*.6,behavior:'smooth'});
    return !!best;
  };
  const activate=()=>{
    const el=ensure();if(!el)return '';
    if(el.tagName==='IFRAME'){
      try{const url=new URL(el.src);if(['www.youtube-nocookie.com','www.youtube.com'].includes(url.hostname)){const id=url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})$/)?.[1];if(id)return 'external:https://www.youtube.com/watch?v='+id;const list=url.searchParams.get('list');if(list)return 'external:https://www.youtube.com/playlist?list='+encodeURIComponent(list)}}catch{}
    }
    if(el.tagName==='SELECT')return 'select';
    if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){el.focus();return 'keyboard'}
    el.click();return '';
  };
  const back=()=>{const dialog=document.querySelector('dialog[open]');if(dialog){dialog.close();return true}const button=[...document.querySelectorAll('[data-close-match],[data-back-players],[data-cancel-player],[data-admin-back]')].find(visible);if(button){button.click();return true}const active=menu.querySelector('[aria-current=page]');if(current&&!sidebar.contains(current)){focus(active||menu.firstElementChild);return true}if(active&&active.dataset.tvPage!=='home'){menu.querySelector('[data-tv-page=home]').click();focus(menu.querySelector('[data-tv-page=home]'));return true}return false};
  new MutationObserver(()=>{syncMenu();if(!current?.isConnected||document.querySelector('dialog[open]')&&!current.closest('dialog[open]'))setTimeout(ensure,0)}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('focusin',event=>{if(event.target.matches(selector)&&visible(event.target)){document.querySelectorAll('.tv-focused').forEach(x=>x.classList.remove('tv-focused'));current=event.target;current.classList.add('tv-focused')}});
  window.SabahTVRemote={move,activate,back,focus};syncMenu();ensure();
})();
