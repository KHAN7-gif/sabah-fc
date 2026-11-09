const endpoint=location.hostname.endsWith('.github.io')?'https://sabah-fc.pages.dev/api/notifications/':'/api/notifications/';
const bell='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>';
export const notificationButton=()=>'<button type="button" class="notification-launcher" data-notifications-open aria-label="Notifikasi kick-off">'+bell+'<span>Notifikasi</span></button>';
const supportsPush=()=>window.isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const keyBytes=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
let dialog,registration,configuration,busy=false,subscription;
async function api(path,options={}){
  const response=await fetch(endpoint+path,{...options,cache:'no-store',signal:AbortSignal.timeout(12000)});
  let body;try{body=await response.json()}catch{throw new Error('Servis notifikasi belum tersedia. Cuba semula selepas pemasangan Cloudflare selesai.')}
  if(!response.ok)throw new Error(body.error||'Servis notifikasi tidak tersedia.');return body;
}
function status(message,error=false){const node=dialog.querySelector('[data-notification-status]');node.textContent=message;node.dataset.error=String(error)}
function controls(){
  dialog.querySelector('[data-notification-enable]').hidden=!!subscription;
  dialog.querySelector('[data-notification-disable]').hidden=!subscription;
  dialog.querySelectorAll('[data-notification-enable],[data-notification-disable]').forEach(x=>x.disabled=busy);
}
async function refresh(){
  if(isIOS()&&!standalone()){status('Pada iPhone/iPad, buka melalui Safari → Kongsi → Tambah ke Skrin Utama. Buka aplikasi dari Skrin Utama untuk mengaktifkan notifikasi.');dialog.querySelector('[data-notification-enable]').disabled=true;return}
  if(!supportsPush()){status('Pelayar ini belum menyokong notifikasi web. Gunakan Chrome pada Android, atau webapp Skrin Utama pada iPhone/iPad (iOS 16.4 ke atas).');dialog.querySelector('[data-notification-enable]').disabled=true;return}
  configuration=null;busy=true;controls();status('Menyemak tetapan notifikasi…');
  try{
    registration=await navigator.serviceWorker.register(new URL('./sw.js',import.meta.url),{scope:new URL('./',import.meta.url).pathname,updateViaCache:'none'});
    await navigator.serviceWorker.ready;subscription=await registration.pushManager.getSubscription();
    if(Notification.permission==='denied'){status('Notifikasi disekat. Benarkan melalui tetapan laman/pelayar telefon, kemudian buka semula panel ini.');return}
    configuration=await api('config');
    if(!configuration.available){status('Servis notifikasi belum diaktifkan oleh admin. Tiada notifikasi automatik dihantar buat masa ini.');return}
    // Renew an existing browser subscription on open to recover a temporary registration failure.
    if(subscription){await api('subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(subscription)});status('Notifikasi kick-off aktif pada telefon ini. Anda akan menerima peringatan untuk semua perlawanan yang dijadualkan admin.')}
    else status('Terima notifikasi apabila kick-off bermula mengikut jadual admin, walaupun webapp ditutup.');
  }catch(error){status(error.message,true)}finally{busy=false;controls();if(!configuration?.available||Notification.permission==='denied')dialog.querySelector('[data-notification-enable]').disabled=true}
}
async function enable(){
  if(busy||!supportsPush())return;busy=true;controls();
  try{
    // Request permission directly from the user's button gesture, especially on iOS.
    const permission=await Notification.requestPermission();if(permission!=='granted'){status(permission==='denied'?'Notifikasi disekat. Benarkan dalam tetapan laman telefon.':'Kebenaran belum diberikan. Tekan Aktifkan untuk cuba semula.');return}
    if(!configuration?.available)throw new Error('Servis notifikasi belum diaktifkan oleh admin.');
    subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(configuration.publicKey)});
    try{await api('subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(subscription)})}
    catch(error){await subscription.unsubscribe();subscription=null;throw error}
    status('Notifikasi kick-off aktif. Jadual mengikuti masa MYT yang admin tetapkan.');
  }catch(error){status(error.message||'Notifikasi tidak dapat diaktifkan. Cuba semula.',true)}finally{busy=false;controls()}
}
async function disable(){
  if(busy||!subscription)return;busy=true;controls();
  try{
    const previous=subscription.toJSON();if(!await subscription.unsubscribe())throw new Error('Tidak dapat mematikan notifikasi. Cuba semula.');subscription=null;
    try{await api('subscribe',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify(previous)})}catch{} // Expired push endpoints are also removed by the sender.
    status('Notifikasi kick-off dimatikan pada telefon ini.');
  }catch(error){status(error.message,true)}finally{busy=false;controls()}
}
export function initNotifications(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.className='notification-dialog';dialog.setAttribute('aria-labelledby','notificationTitle');
  dialog.innerHTML='<div class="notification-dialog-top"><span class="notification-dialog-icon">'+bell+'</span><button type="button" class="notification-close" aria-label="Tutup notifikasi">×</button></div><p class="notification-kicker">SABAH FC · MATCHDAY</p><h2 id="notificationTitle">Jangan terlepas kick-off.</h2><p class="notification-description">Semua perlawanan Super League dan FA Cup, mengikut tarikh dan masa Malaysia (MYT) yang admin simpan.</p><p class="notification-status" data-notification-status role="status" aria-live="polite"></p><div class="notification-actions"><button type="button" class="primary" data-notification-enable>Aktifkan notifikasi</button><button type="button" class="secondary" data-notification-disable hidden>Matikan notifikasi</button></div><p class="notification-footnote">Penghantaran sekitar waktu kick-off bergantung pada internet, pelayar dan tetapan bateri telefon. Perlawanan ditunda atau masa belum ditetapkan tidak menghantar notifikasi.</p>';
  document.body.appendChild(dialog);
  dialog.querySelector('.notification-close').onclick=()=>dialog.close();dialog.onclick=event=>{if(event.target===dialog)dialog.close()};
  dialog.querySelector('[data-notification-enable]').onclick=enable;dialog.querySelector('[data-notification-disable]').onclick=disable;
  document.addEventListener('click',event=>{if(event.target.closest('[data-notifications-open]')){dialog.showModal();refresh()}});
}
