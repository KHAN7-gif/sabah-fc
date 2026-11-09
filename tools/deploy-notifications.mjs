// Run in GitHub Actions after adding Cloudflare credentials as repository secrets.
// Existing VAPID signing keys are preserved so enrolled phones keep working.
import {spawn} from 'node:child_process';
const account=process.env.CLOUDFLARE_ACCOUNT_ID,token=process.env.CLOUDFLARE_API_TOKEN;
if(!account||!token)throw new Error('Tambah CLOUDFLARE_ACCOUNT_ID dan CLOUDFLARE_API_TOKEN pada GitHub Actions Secrets dahulu.');
if(!/^[a-f0-9]{32}$/i.test(account))throw new Error('Cloudflare Account ID tidak sah.');
const base=`https://api.cloudflare.com/client/v4/accounts/${account}`;
async function api(path,options={}){
  const response=await fetch(base+path,{...options,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(30000)});
  const body=await response.json();if(!response.ok||!body.success)throw new Error('Cloudflare API gagal: '+path+' (HTTP '+response.status+'). Semak kebenaran token.');return body.result;
}
function wrangler(args,input){
  return new Promise((resolve,reject)=>{const child=spawn('npx',['--yes','wrangler@4.47.0',...args,'--config','notifications/wrangler.jsonc'],{stdio:['pipe','inherit','inherit'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('Wrangler gagal (kod '+code+').')));child.stdin.end(input||'')});
}
await wrangler(['deploy']);
const settings=await api('/workers/scripts/sabah-fc-notifications/settings');
const names=new Set(settings.bindings.filter(x=>x.type==='secret_text').map(x=>x.name));
if(names.has('VAPID_PUBLIC_KEY')!==names.has('VAPID_PRIVATE_KEY'))throw new Error('Hanya satu kunci VAPID wujud. Pulihkan pasangan kunci asal sebelum meneruskan.');
if(!names.has('VAPID_PUBLIC_KEY')){
  const keys=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
  const raw=Buffer.from(await crypto.subtle.exportKey('raw',keys.publicKey)),jwk=await crypto.subtle.exportKey('jwk',keys.privateKey);
  await wrangler(['secret','bulk'],JSON.stringify({VAPID_PUBLIC_KEY:raw.toString('base64url'),VAPID_PRIVATE_KEY:jwk.d}));
  console.log('Pasangan kunci push baharu disimpan sebagai Cloudflare Worker Secrets.');
}else console.log('Pasangan kunci push sedia ada dikekalkan.');
const project=await api('/pages/projects/sabah-fc');
const services={...(project.deployment_configs?.production?.services||{}),NOTIFICATIONS:{service:'sabah-fc-notifications',environment:'production'}};
// Update only the service-binding map. Do not send back masked Access/GitHub secrets.
await api('/pages/projects/sabah-fc',{method:'PATCH',body:JSON.stringify({deployment_configs:{production:{services}}})});
const updated=await api('/pages/projects/sabah-fc');
const previousVariables=Object.keys(project.deployment_configs?.production?.env_vars||{});
if(previousVariables.some(key=>!Object.hasOwn(updated.deployment_configs?.production?.env_vars||{},key)))throw new Error('Semak tetapan Pages: nama pemboleh ubah sedia ada berubah.');
const deployments=await api('/pages/projects/sabah-fc/deployments?env=production&per_page=1');
if(!deployments.length)throw new Error('Terbit webapp melalui integrasi GitHub Pages Cloudflare dahulu.');
const deployment=await api(`/pages/projects/sabah-fc/deployments/${deployments[0].id}/retry`,{method:'POST'});
console.log('Servis push terpasang. Deployment Pages baharu: '+deployment.id);
let ready=false;
for(let attempt=0;attempt<60;attempt++){
  const current=await api(`/pages/projects/sabah-fc/deployments/${deployment.id}`);
  if(current.latest_stage?.status==='failure'||current.latest_stage?.status==='canceled')throw new Error('Deployment Pages gagal. Semak Workers & Pages > sabah-fc > Deployments.');
  if(current.latest_stage?.name==='deploy'&&current.latest_stage?.status==='success'){ready=true;break}
  await new Promise(resolve=>setTimeout(resolve,5000));
}
if(!ready)throw new Error('Deployment masih berjalan. Semak Pages > Deployments dan cuba pautan status selepas siap.');
const response=await fetch('https://sabah-fc.pages.dev/api/notifications/config',{cache:'no-store',signal:AbortSignal.timeout(15000)});
const config=await response.json();if(!response.ok||config.available!==true)throw new Error('Servis belum sedia. Semak binding NOTIFICATIONS, kunci VAPID dan deployment.');
console.log('Status push: available=true. Buka webapp telefon dan tekan Notifikasi > Aktifkan notifikasi.');
