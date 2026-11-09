const ALLOWED=new Set(['https://sabah-fc.pages.dev','https://khan7-gif.github.io']);
export async function handleNotifications({request,env}){
  const url=new URL(request.url),origin=request.headers.get('Origin')||url.origin;
  const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
  if(ALLOWED.has(origin))Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});
  const error=(message,status)=>new Response(JSON.stringify({error:message,available:false}),{status,headers});
  if(!ALLOWED.has(origin))return error('Origin tidak dibenarkan.',403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  const routes={'/api/notifications/config':'/v1/config','/api/notifications/subscribe':'/v1/subscriptions'};
  const target=routes[url.pathname];
  if(!target||!(target==='/v1/config'?request.method==='GET':['POST','DELETE'].includes(request.method)))return error('Not found',404);
  if(!env.NOTIFICATIONS)return error('Servis notifikasi belum diaktifkan oleh admin.',503);
  try{
    const response=await env.NOTIFICATIONS.fetch(new Request('https://notifications'+target,{method:request.method,headers:{Origin:origin,'CF-Connecting-IP':request.headers.get('CF-Connecting-IP')||'unknown','Content-Type':request.headers.get('Content-Type')||'application/json'},body:['POST','DELETE'].includes(request.method)?request.body:undefined,duplex:'half'}));
    const merged=new Headers(response.headers);for(const [key,value] of Object.entries(headers))merged.set(key,value);
    return new Response(response.body,{status:response.status,headers:merged});
  }catch{return error('Servis notifikasi tidak dapat dihubungi. Cuba semula.',503)}
}
export const onRequest=handleNotifications;
