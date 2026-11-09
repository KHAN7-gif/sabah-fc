import {mergeMatches} from '../fixtures.mjs';
import {dueKickoffs,kickoffPayload} from '../match-notifications.mjs';
import {validSubscription,sendPush} from './web-push.mjs';
const SITE='https://sabah-fc.pages.dev/';
const DATA='https://raw.githubusercontent.com/KHAN7-gif/sabah-fc/main/published-data.json';
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const origins=new Set(['https://sabah-fc.pages.dev','https://khan7-gif.github.io']);
const configured=env=>!!(env.VAPID_PUBLIC_KEY&&env.VAPID_PRIVATE_KEY&&env.KICKOFF);
const idFor=async endpoint=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(endpoint))),b=>b.toString(16).padStart(2,'0')).join('');
export default {
  async fetch(request,env){
    const origin=request.headers.get('Origin');if(!origins.has(origin))return json({error:'Origin tidak dibenarkan.'},403);
    const headers={'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
    const reply=response=>{const next=new Response(response.body,response);for(const [key,value] of Object.entries(headers))next.headers.set(key,value);return next};
    if(request.method==='OPTIONS')return reply(new Response(null,{status:204}));
    const path=new URL(request.url).pathname;
    if(path==='/v1/config'&&request.method==='GET')return reply(json({available:configured(env),publicKey:configured(env)?env.VAPID_PUBLIC_KEY:null}));
    if(!configured(env))return reply(json({error:'Servis notifikasi belum diaktifkan oleh admin.'},503));
    if(path!=='/v1/subscriptions'||!['POST','DELETE'].includes(request.method))return reply(json({error:'Not found'},404));
    if(env.SUBSCRIPTIONS_RATE&&!((await env.SUBSCRIPTIONS_RATE.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'})).success))return reply(json({error:'Terlalu banyak percubaan. Cuba semula sebentar lagi.'},429));
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(json({error:'Format tidak sah.'},415));
    // Small bounded bodies. Push endpoints are opaque capabilities, never returned or logged.
    const reader=request.body?.getReader();if(!reader)return reply(json({error:'Data diperlukan.'},400));
    let body='';const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;if(body.length+value.length>8192){await reader.cancel();return reply(json({error:'Data terlalu besar.'},413))}body+=decoder.decode(value,{stream:true})}
    let subscription;try{subscription=JSON.parse(body)}catch{return reply(json({error:'JSON tidak sah.'},400))}
    if(!validSubscription(subscription))return reply(json({error:'Langganan push tidak sah.'},400));
    const stub=env.KICKOFF.get(env.KICKOFF.idFromName('sabah-fc-season-2026'));
    return reply(await stub.fetch('https://internal/subscriptions',{method:request.method,headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:subscription.endpoint,keys:subscription.keys})}));
  },
  async scheduled(controller,env,context){
    if(!configured(env))return;
    const stub=env.KICKOFF.get(env.KICKOFF.idFromName('sabah-fc-season-2026'));
    context.waitUntil(stub.fetch('https://internal/tick',{method:'POST'}).then(response=>{if(!response.ok)throw new Error('Kickoff scheduler failed: '+response.status)}));
  }
};
export class KickoffNotifications {
  constructor(state,env){this.state=state;this.env=env}
  async fetch(request){
    const path=new URL(request.url).pathname;
    if(path==='/subscriptions'){
      const sub=await request.json(),id=await idFor(sub.endpoint),key='sub:'+id;
      if(request.method==='DELETE'){await this.state.storage.delete(key);return json({subscribed:false})}
      const existing=await this.state.storage.get(key);
      if(!existing&&(await this.state.storage.list({prefix:'sub:',limit:5000})).size>=5000)return json({error:'Had langganan dicapai. Hubungi admin.'},503);
      await this.state.storage.put(key,{...sub,createdAt:existing?.createdAt||Date.now()});return json({subscribed:true});
    }
    if(path==='/tick')return this.tick();
    return json({error:'Not found'},404);
  }
  async tick(now=Date.now(),fetcher=fetch,pusher=sendPush){
    // Never send from a stale cached schedule after a cancelled, postponed or rescheduled game.
    const response=await fetcher(DATA+'?t='+now,{cache:'no-store',signal:AbortSignal.timeout(10000)});
    if(!response.ok)return json({error:'Schedule unavailable'},502);
    const data=await response.json();if(!Array.isArray(data.matches)||!data.revision)return json({error:'Invalid schedule'},502);
    const due=dueKickoffs(mergeMatches(data.matches),now);
    if(!due.length)return json({checked:true,sent:0});
    const subscribers=await this.state.storage.list({prefix:'sub:'});let sent=0;
    for(const job of due){
      const marker='sent:'+await idFor(job.id+':'+job.kickoff),payload=kickoffPayload(job,SITE);
      const entries=[...subscribers.entries()];
      for(let start=0;start<entries.length;start+=20){
        await Promise.all(entries.slice(start,start+20).map(async([key,subscription])=>{
          if(subscription.createdAt>job.kickoff)return; // Enabling after kick-off never sends an old game.
          const delivery=marker+':'+key;
          const claim=await this.state.storage.transaction(async transaction=>{
            const previous=await transaction.get(delivery);if(previous?.delivered||previous?.lease>now)return false;
            await transaction.put(delivery,{lease:now+30000});return true;
          });
          if(!claim)return;
          try{
            const result=await pusher(subscription,payload,this.env,fetcher);
            if(result.delivered){await this.state.storage.put(delivery,{delivered:true,at:now});sent++}
            else{await this.state.storage.delete(delivery);if(result.expired)await this.state.storage.delete(key)}
          }catch{await this.state.storage.delete(delivery)}
        }));
      }
    }
    // Retain delivery IDs long enough to deduplicate cron retries, then prune.
    const delivered=await this.state.storage.list({prefix:'sent:'});const old=[...delivered].filter(([,v])=>(v.at||v.lease)<now-7*86400000).map(([key])=>key);
    for(let start=0;start<old.length;start+=128)await this.state.storage.delete(old.slice(start,start+128));
    return json({checked:true,sent});
  }
}
