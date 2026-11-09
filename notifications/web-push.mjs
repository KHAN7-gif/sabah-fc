// RFC 8291 aes128gcm Web Push and RFC 8292 VAPID, using the Workers Web Crypto API.
export const encode64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
export const decode64=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const utf8=value=>new TextEncoder().encode(value);
const concat=(...chunks)=>{const result=new Uint8Array(chunks.reduce((n,x)=>n+x.length,0));let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length}return result};
export function validSubscription(value){
  try{
    const url=new URL(value.endpoint);
    const allowed=['fcm.googleapis.com','updates.push.services.mozilla.com','push.services.mozilla.com','web.push.apple.com'].includes(url.hostname)||/^[a-z0-9.-]+\.notify\.windows\.com$/.test(url.hostname);
    if(!allowed||url.protocol!=='https:'||url.port||url.username||url.password||url.hash||value.endpoint.length>2048)return false;
    return /^[A-Za-z0-9_-]+$/.test(value.keys.p256dh)&&decode64(value.keys.p256dh).length===65&&decode64(value.keys.p256dh)[0]===4&&/^[A-Za-z0-9_-]+$/.test(value.keys.auth)&&decode64(value.keys.auth).length===16;
  }catch{return false}
}
async function hkdf(input,salt,info,length){
  const key=await crypto.subtle.importKey('raw',input,'HKDF',false,['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt,info},key,length*8));
}
export async function encryptPayload(subscription,payload){
  const plain=utf8(JSON.stringify(payload));if(plain.length>3000)throw new Error('Push payload too large');
  const receiver=decode64(subscription.keys.p256dh),auth=decode64(subscription.keys.auth);
  const keypair=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
  const sender=new Uint8Array(await crypto.subtle.exportKey('raw',keypair.publicKey));
  const publicKey=await crypto.subtle.importKey('raw',receiver,{name:'ECDH',namedCurve:'P-256'},false,[]);
  const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:publicKey},keypair.privateKey,256));
  const ikm=await hkdf(shared,auth,concat(utf8('WebPush: info\0'),receiver,sender),32),salt=crypto.getRandomValues(new Uint8Array(16));
  const cek=await hkdf(ikm,salt,utf8('Content-Encoding: aes128gcm\0'),16),nonce=await hkdf(ikm,salt,utf8('Content-Encoding: nonce\0'),12);
  const key=await crypto.subtle.importKey('raw',cek,'AES-GCM',false,['encrypt']);
  const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce},key,concat(plain,new Uint8Array([2]))));
  const header=new Uint8Array(21);header.set(salt);new DataView(header.buffer).setUint32(16,4096);header[20]=sender.length;
  return concat(header,sender,ciphertext);
}
export async function vapidAuthorization(endpoint,env,now=Date.now()){
  const raw=decode64(env.VAPID_PUBLIC_KEY);
  if(raw.length!==65||raw[0]!==4||decode64(env.VAPID_PRIVATE_KEY).length!==32)throw new Error('Invalid VAPID key');
  const key=await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',x:encode64(raw.slice(1,33)),y:encode64(raw.slice(33)),d:env.VAPID_PRIVATE_KEY,ext:true},{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const header=encode64(utf8(JSON.stringify({typ:'JWT',alg:'ES256'}))),claims=encode64(utf8(JSON.stringify({aud:new URL(endpoint).origin,exp:Math.floor(now/1000)+12*3600,sub:'https://sabah-fc.pages.dev/'})));
  const message=header+'.'+claims,signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,utf8(message));
  return `vapid t=${message}.${encode64(signature)}, k=${env.VAPID_PUBLIC_KEY}`;
}
export async function sendPush(subscription,payload,env,fetcher=fetch){
  if(!validSubscription(subscription))return {expired:true};
  const body=await encryptPayload(subscription,payload),authorization=await vapidAuthorization(subscription.endpoint,env);
  const response=await fetcher(subscription.endpoint,{method:'POST',headers:{Authorization:authorization,'Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream',TTL:'120',Urgency:'high'},body,redirect:'error',signal:AbortSignal.timeout(8000)});
  return {delivered:response.ok,expired:[404,410].includes(response.status),status:response.status};
}
