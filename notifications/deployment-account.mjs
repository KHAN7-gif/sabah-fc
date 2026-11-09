export async function resolveCloudflareAccount(token,supplied,fetcher=fetch){
  if(!token)throw new Error('Tambah CLOUDFLARE_API_TOKEN pada Secrets dahulu.');
  if(supplied){
    if(!/^[a-f0-9]{32}$/i.test(supplied))throw new Error('Cloudflare Account ID tidak sah.');
    return supplied;
  }
  const response=await fetcher('https://api.cloudflare.com/client/v4/accounts?per_page=50',{
    headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(30000)
  });
  const body=await response.json();
  if(!response.ok||!body.success||!Array.isArray(body.result))throw new Error('Tidak dapat mengesan akaun Cloudflare. Semak Account Settings: Read pada token, atau tetapkan CLOUDFLARE_ACCOUNT_ID.');
  if(body.result.length!==1||Number(body.result_info?.total_count||body.result.length)!==1)throw new Error('Token mempunyai akses kepada sifar atau beberapa akaun. Tetapkan CLOUDFLARE_ACCOUNT_ID bagi projek sabah-fc.');
  const account=body.result[0].id;
  if(!/^[a-f0-9]{32}$/i.test(account||''))throw new Error('Cloudflare mengembalikan Account ID tidak sah.');
  return account;
}
