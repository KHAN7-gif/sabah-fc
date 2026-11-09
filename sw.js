// Push-only service worker: portal HTML/data remain on the normal no-cache refresh path.
self.addEventListener('push',event=>{
  event.waitUntil((async()=>{
    let payload;try{payload=event.data?.json()}catch{}
    payload=payload||{};
    const base=new URL('./',self.registration.scope);
    const target=new URL(payload.url||base.href,base);
    const safe=target.origin===base.origin&&target.pathname.startsWith(base.pathname)?target.href:base.href;
    await self.registration.showNotification(String(payload.title||'Sabah FC · Kick-off'),{
      body:String(payload.body||'Perlawanan bermula mengikut jadual admin.'),icon:new URL('assets/icons/icon-192.png',base).href,
      badge:new URL('assets/icons/notification-badge.png',base).href,
      tag:String(payload.tag||'sabah-kickoff'),renotify:false,
      timestamp:Number.isFinite(payload.kickoff)?payload.kickoff:Date.now(),data:{url:safe}
    });
  })());
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const base=new URL('./',self.registration.scope),url=new URL(event.notification.data?.url||base.href,base);
    if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const client=clients.find(x=>new URL(x.url).origin===url.origin&&new URL(x.url).pathname.startsWith(base.pathname));
    if(client){await client.navigate(url.href);await client.focus()}else await self.clients.openWindow(url.href);
  })());
});
