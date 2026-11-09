import assert from 'node:assert/strict';
import {hkdfSync} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {mergeMatches,referenceFixtures} from '../fixtures.mjs';
import {kickoffTime,matchKey,dueKickoffs,kickoffPayload} from '../match-notifications.mjs';
import {encode64,decode64,encryptPayload,vapidAuthorization,validSubscription,sendPush} from '../notifications/web-push.mjs';
import worker,{KickoffNotifications} from '../notifications/worker.mjs';
const proxySource=await readFile(new URL('../functions/api/notifications/[[path]].js',import.meta.url),'utf8');
const {handleNotifications}=await import('data:text/javascript;base64,'+Buffer.from(proxySource).toString('base64'));
const now=Date.parse('2026-11-21T13:00:15Z');
const match={refIndex:6,home:'Kelantan Red Warrior FC',away:'Sabah FC',date:'2026-11-21',time:'21:00',competition:'league',round:7,status:'PREVIEW'};
const receiver=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
const receiverBytes=new Uint8Array(await crypto.subtle.exportKey('raw',receiver.publicKey));
const auth=crypto.getRandomValues(new Uint8Array(16));
const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/test-device',keys:{p256dh:encode64(receiverBytes),auth:encode64(auth)}};
const vapid=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
const privateJwk=await crypto.subtle.exportKey('jwk',vapid.privateKey);
const env={VAPID_PUBLIC_KEY:encode64(await crypto.subtle.exportKey('raw',vapid.publicKey)),VAPID_PRIVATE_KEY:privateJwk.d};
let checks=0;
async function test(name,run){await run();checks++;console.log('PASS: '+name)}
await test('Malaysia kickoff parsing, invalid dates, missing times and both competitions',()=>{
 assert.equal(kickoffTime(match),Date.parse('2026-11-21T13:00:00Z'));
 for(const invalid of [{date:'2026-02-30'},{time:''},{time:'25:10'},{date:'invalid'}])assert.equal(kickoffTime({...match,...invalid}),null);
 const fa={...match,refIndex:23,competition:'fa'};
 assert.equal(dueKickoffs([match,fa],now).length,2);
 for(const status of ['FULL TIME','POSTPONED','CANCELLED'])assert.equal(dueKickoffs([{...match,status}],now).length,0);
 assert.equal(dueKickoffs([match],now-60000).length,0);assert.equal(dueKickoffs([match],now+120000).length,0);
});
await test('Shared fixture merging preserves all fixtures and admin rescheduling overrides the baseline',()=>{
 const all=mergeMatches([{...match,time:'22:30'}]);assert.equal(all.length,referenceFixtures.length);
 assert.equal(all.find(x=>x.refIndex===6).time,'22:30');assert.equal(dueKickoffs(all,now).length,0);
 assert.equal(matchKey(match),matchKey({...match,date:'2026-11-22'}));
 const payload=kickoffPayload(dueKickoffs([match],now)[0]);assert.equal(new URL(payload.url,'https://khan7-gif.github.io/sabah-fc/').pathname,'/sabah-fc/');assert.equal(new URL(payload.url,'https://sabah-fc.pages.dev/').searchParams.get('match'),'ref:6');
});
await test('Subscription validation rejects arbitrary URLs, insecure endpoints and invalid keys',()=>{
 assert(validSubscription(subscription));
 for(const endpoint of ['http://fcm.googleapis.com/x','https://127.0.0.1/x','https://fcm.googleapis.com.evil.test/x','https://user:password@fcm.googleapis.com/x','https://fcm.googleapis.com:8443/x'])assert(!validSubscription({...subscription,endpoint}));
 assert(!validSubscription({...subscription,keys:{auth:'bad',p256dh:'bad'}}));
});
await test('RFC 8291 encrypted payload decrypts with the independent Node HKDF implementation',async()=>{
 const payload=kickoffPayload(dueKickoffs([match],now)[0]);const wire=await encryptPayload(subscription,payload);
 const salt=wire.slice(0,16);assert.equal(new DataView(wire.buffer).getUint32(16),4096);assert.equal(wire[20],65);
 const sender=wire.slice(21,86),ciphertext=wire.slice(86);
 const senderKey=await crypto.subtle.importKey('raw',sender,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const shared=await crypto.subtle.deriveBits({name:'ECDH',public:senderKey},receiver.privateKey,256);
 const ikm=hkdfSync('sha256',Buffer.from(shared),auth,Buffer.concat([Buffer.from('WebPush: info\0'),receiverBytes,sender]),32);
 const cek=hkdfSync('sha256',Buffer.from(ikm),salt,Buffer.from('Content-Encoding: aes128gcm\0'),16);
 const nonce=hkdfSync('sha256',Buffer.from(ikm),salt,Buffer.from('Content-Encoding: nonce\0'),12);
 const key=await crypto.subtle.importKey('raw',cek,'AES-GCM',false,['decrypt']);
 const plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:nonce},key,ciphertext));
 assert.equal(plain.at(-1),2);assert.deepEqual(JSON.parse(new TextDecoder().decode(plain.slice(0,-1))),payload);
 assert.notDeepEqual(wire,await encryptPayload(subscription,payload));
});
await test('VAPID signature verifies, has the endpoint audience, and expired endpoints are recognized',async()=>{
 const authorization=await vapidAuthorization(subscription.endpoint,env,now),token=authorization.match(/t=([^,]+)/)[1],parts=token.split('.');
 const claims=JSON.parse(new TextDecoder().decode(decode64(parts[1])));
 assert.equal(claims.aud,'https://fcm.googleapis.com');assert.equal(claims.exp,Math.floor(now/1000)+43200);
 assert(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},vapid.publicKey,decode64(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])));
 const result=await sendPush(subscription,{title:'Test'},env,async(url,options)=>{assert.equal(options.headers.TTL,'120');assert.equal(options.headers['Content-Encoding'],'aes128gcm');assert.equal(options.redirect,'error');return new Response(null,{status:410})});assert.equal(result.expired,true);
});
class Storage {
 constructor(){this.values=new Map();this.queue=Promise.resolve()}
 async get(key){return this.values.get(key)}
 async put(key,value){this.values.set(key,value)}
 async delete(keys){for(const key of Array.isArray(keys)?keys:[keys])this.values.delete(key)}
 async list({prefix,limit=Infinity}){return new Map([...this.values].filter(([key])=>key.startsWith(prefix)).slice(0,limit))}
 transaction(callback){const task=this.queue.then(()=>callback(this));this.queue=task.catch(()=>{});return task}
}
const setup=async()=>{const storage=new Storage();await storage.put('sub:device',{...subscription,createdAt:now-60000});return {storage,object:new KickoffNotifications({storage},env)}};
const source=(matches=[match])=>async()=>new Response(JSON.stringify({revision:'admin-revision',matches}));
await test('Scheduler persists deduplication across retries and only pushes to subscribers enrolled before kickoff',async()=>{
 const {storage,object}=await setup();let sends=0;const push=async()=>{sends++;return {delivered:true}};
 await storage.put('sub:late',{...subscription,createdAt:now+1});
 await object.tick(now,source(),push);await object.tick(now+30000,source(),push);assert.equal(sends,1);
 const reopened=new KickoffNotifications({storage},env);await reopened.tick(now+45000,source(),push);assert.equal(sends,1);
});
await test('Delivery leases prevent duplicate sends during overlapping scheduled invocations',async()=>{
 const {object}=await setup();let sends=0;
 await Promise.all([object.tick(now,source(),async()=>{sends++;return {delivered:true}}),object.tick(now,source(),async()=>{sends++;return {delivered:true}})]);assert.equal(sends,1);
});
await test('Postponed, finished, missing-time and rescheduled games do not notify; source failures do not use old schedules',async()=>{
 const {object}=await setup();let sends=0;const push=async()=>{sends++;return {delivered:true}};
 for(const update of [{status:'POSTPONED'},{status:'FULL TIME'},{time:''},{time:'22:00'}])await object.tick(now,source([{...match,...update}]),push);
 assert.equal((await object.tick(now,async()=>new Response(null,{status:503}),push)).status,502);assert.equal(sends,0);
});
await test('Failed deliveries retry; revoked subscriptions are removed; unsubscribing deletes the endpoint',async()=>{
 const {storage,object}=await setup();let sends=0;
 await object.tick(now,source(),async()=>({delivered:false,status:503}));
 await object.tick(now+10000,source(),async()=>{sends++;return {delivered:true}});assert.equal(sends,1);
 const expired=await setup();await expired.object.tick(now,source(),async()=>({expired:true}));assert.equal((await expired.storage.list({prefix:'sub:'})).size,0);
 await object.fetch(new Request('https://internal/subscriptions',{method:'POST',body:JSON.stringify(subscription)}));assert.equal((await storage.list({prefix:'sub:'})).size,2);
 await object.fetch(new Request('https://internal/subscriptions',{method:'DELETE',body:JSON.stringify(subscription)}));assert.equal((await storage.list({prefix:'sub:'})).size,1);
});
await test('Public Worker API restricts origins, checks payloads, and does not expose signing keys',async()=>{
 const configEnv={...env,KICKOFF:{idFromName:()=>1,get:()=>({fetch:async()=>new Response('{"subscribed":true}')})}};
 const config=await worker.fetch(new Request('https://worker/v1/config',{headers:{Origin:'https://sabah-fc.pages.dev'}}),configEnv);
 const data=await config.json();assert.equal(data.publicKey,env.VAPID_PUBLIC_KEY);assert(!JSON.stringify(data).includes(env.VAPID_PRIVATE_KEY));
 assert.equal((await worker.fetch(new Request('https://worker/v1/config',{headers:{Origin:'https://evil.example'}}),configEnv)).status,403);
 const headers={Origin:'https://khan7-gif.github.io','Content-Type':'application/json'};
 assert.equal((await worker.fetch(new Request('https://worker/v1/subscriptions',{method:'POST',headers,body:JSON.stringify(subscription)}),configEnv)).status,200);
 assert.equal((await worker.fetch(new Request('https://worker/v1/subscriptions',{method:'POST',headers,body:JSON.stringify({...subscription,endpoint:'https://example.com/x'})}),configEnv)).status,400);
 assert.equal((await worker.fetch(new Request('https://worker/v1/subscriptions',{method:'POST',headers,body:'x'.repeat(9000)}),configEnv)).status,413);
 assert.equal((await worker.fetch(new Request('https://worker/v1/subscriptions',{method:'POST',headers,body:JSON.stringify(subscription)}),{...configEnv,SUBSCRIPTIONS_RATE:{limit:async()=>({success:false})}})).status,429);
});
await test('Pages proxy supports GitHub Pages CORS, preserves Origin, and reports missing binding honestly',async()=>{
 const unavailable=await handleNotifications({request:new Request('https://sabah-fc.pages.dev/api/notifications/config'),env:{}});assert.equal(unavailable.status,503);assert.equal((await unavailable.json()).available,false);
 const response=await handleNotifications({request:new Request('https://sabah-fc.pages.dev/api/notifications/config',{headers:{Origin:'https://khan7-gif.github.io'}}),env:{NOTIFICATIONS:{fetch:async request=>{assert.equal(request.headers.get('Origin'),'https://khan7-gif.github.io');assert.equal(new URL(request.url).pathname,'/v1/config');return new Response('{"available":true}')}}}});
 assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://khan7-gif.github.io');assert.equal(response.status,200);
 assert.equal((await handleNotifications({request:new Request('https://sabah-fc.pages.dev/api/notifications/config',{headers:{Origin:'https://evil.test'}}),env:{}})).status,403);
});
// Exercise the real service-worker source with simulated browser events.
const {runInNewContext}=await import('node:vm');
await test('Service worker displays push and opens the correct match on both Cloudflare and GitHub Pages',async()=>{
 const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
 for(const scope of ['https://sabah-fc.pages.dev/','https://khan7-gif.github.io/sabah-fc/']){
  const handlers={},notifications=[];let pending,opened;
  const self={registration:{scope,showNotification:async(title,options)=>notifications.push({title,...options})},addEventListener:(name,callback)=>handlers[name]=callback,clients:{matchAll:async()=>[],openWindow:async url=>{opened=url}}};
  runInNewContext(source,{self,URL,Date,Number,String});
  const payload=kickoffPayload(dueKickoffs([match],now)[0]);
  handlers.push({data:{json:()=>payload},waitUntil:task=>{pending=task}});await pending;
  assert.equal(notifications[0].body,payload.body);assert.equal(notifications[0].data.url,new URL('?match=ref%3A6',scope).href);
  handlers.notificationclick({notification:{data:notifications[0].data,close:()=>{}},waitUntil:task=>{pending=task}});await pending;assert.equal(opened,notifications[0].data.url);
  handlers.push({data:{json:()=>({...payload,url:'https://evil.example/'})},waitUntil:task=>{pending=task}});await pending;assert.equal(notifications[1].data.url,scope);
 }
});

console.log(`${checks} notification checks passed.`);
