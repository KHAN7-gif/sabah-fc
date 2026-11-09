(() => {
  if(window.SabahTVRemote)return;
  const css=document.createElement('style');
  css.textContent=`
    html{scroll-behavior:smooth;scroll-padding:70px 42px}
    body{font-size:18px}#app>main{padding-left:48px!important;padding-right:48px!important}
    #app>header{padding-left:48px!important;padding-right:48px!important}
    .mobile-bottom-nav{display:none!important}#app>header nav{display:flex!important;position:static!important;inset:auto!important;width:auto!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0;gap:8px!important}#app>header nav button{display:inline-flex!important;font-size:14px;padding:8px 10px}#app>header nav [data-page="admin"]{display:none!important}
    .squad-page--roster .squad-list{grid-template-columns:repeat(6,minmax(0,1fr))!important}
    .squad-player-copy strong{font-size:16px!important}.stats-goal-scorer{font-size:18px}
    button,a,input,select,textarea,[tabindex]{scroll-margin:80px 45px}
    .tv-focused{outline:4px solid #ffce54!important;outline-offset:4px!important;box-shadow:0 0 0 8px #ffce5428!important}
    button.tv-focused,a.tv-focused{background-color:#315b8a!important;color:white!important}
    iframe.tv-focused{outline-offset:-5px!important}
    [data-page="admin"]{display:none!important}
    footer{padding-bottom:30px}.profile-note,.match-disclaimer{font-size:14px!important}
  `;
  document.head.appendChild(css);
  const selector='button,a[href],input:not([type=hidden]),select,textarea,iframe,[tabindex="0"],[role="button"]';
  const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return !el.disabled&&!el.closest('[hidden]')&&r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
  const candidates=()=>[...document.querySelectorAll(selector)].filter(visible);
  let current=null;let remembered=null;
  const focus=el=>{if(!el)return;document.querySelectorAll('.tv-focused').forEach(x=>x.classList.remove('tv-focused'));current=el;remembered=['data-page','data-stats-category','data-stats-competition','data-squad-position','data-competition','data-goal-half'].map(key=>el.hasAttribute(key)?[key,el.getAttribute(key)]:null).find(Boolean)||null;el.classList.add('tv-focused');el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',inline:'nearest'});};
  const center=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};
  const ensure=()=>{if(current?.isConnected&&visible(current))return current;const active=document.activeElement;if(active&&active.matches(selector)&&visible(active)){focus(active);return active}const all=candidates();const restored=remembered?all.find(el=>el.getAttribute(remembered[0])===remembered[1]):null;const dialog=document.querySelector('dialog[open]');const first=restored||(dialog?all.find(el=>dialog.contains(el)):null)||all.find(el=>el.matches('[data-close-match],[data-back-players],[data-cancel-player],[data-admin-back]'))||all.find(el=>el.matches('[data-page][aria-current=page]'))||all.find(x=>x.getBoundingClientRect().top>=0)||all[0];focus(first);return first};
  const move=direction=>{
    const origin=ensure();if(!origin)return false;
    const from=center(origin);let best=null,score=Infinity;
    for(const target of candidates()){
      if(target===origin||origin.contains(target)||target.contains(origin))continue;
      const to=center(target),dx=to.x-from.x,dy=to.y-from.y;
      const main=direction==='right'?dx:direction==='left'?-dx:direction==='down'?dy:-dy;
      const cross=(direction==='right'||direction==='left')?Math.abs(dy):Math.abs(dx);
      if(main<=4)continue;
      const rank=main+cross*3+(cross>main?cross*2:0);
      if(rank<score){best=target;score=rank}
    }
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
  const back=()=>{const dialog=document.querySelector('dialog[open]');if(dialog){dialog.close();return true}const button=[...document.querySelectorAll('[data-close-match],[data-back-players],[data-cancel-player],[data-admin-back]')].find(visible);if(button){button.click();return true}const active=document.querySelector('header [data-page][aria-current=page]');const home=document.querySelector('header [data-page=home]');if(active&&active.dataset.page!=='home'&&home){home.click();return true}return false};
  new MutationObserver(()=>{if(!current?.isConnected)setTimeout(ensure,0)}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('focusin',event=>{if(event.target.matches(selector)&&visible(event.target)){document.querySelectorAll('.tv-focused').forEach(x=>x.classList.remove('tv-focused'));current=event.target;current.classList.add('tv-focused')}});
  window.SabahTVRemote={move,activate,back,focus};ensure();
})();
