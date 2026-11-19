const REPOSITORY = 'KHAN7-gif/sabah-fc';
const BRANCH = 'main';
const DATA_PATH = 'published-data.json';
const MAX_BYTES = 512 * 1024;
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

const decode = part => Uint8Array.from(atob(part.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const decodeJSON = part => JSON.parse(new TextDecoder().decode(decode(part)));

const textEncoder = new TextEncoder();
const cookieName = '__Host-sabah-admin';
const encode = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const passwordSettings = env => /^[\w-]{3,100}$/.test(env.TURNSTILE_SITE_KEY || '') &&
  env.TURNSTILE_SECRET_KEY && env.ADMIN_LOGIN_EMAIL && /^[\w-]{22,64}\.[\w-]{43}$/.test(env.ADMIN_PASSWORD_HASH || '') &&
  env.ADMIN_SESSION_SECRET?.length >= 43 && env.ADMIN_LOGIN_RATE;

const sessionKey = env => crypto.subtle.importKey('raw', textEncoder.encode(env.ADMIN_SESSION_SECRET), {
  name: 'HMAC', hash: 'SHA-256'
}, false, ['sign', 'verify']);

async function passwordSession(request, env) {
  if (!passwordSettings(env)) return null;
  const cookie = request.headers.get('Cookie')?.split('; ').find(part => part.startsWith(cookieName + '='));
  const [payload, signature] = (cookie?.slice(cookieName.length + 1) || '').split('.');
  if (!payload || !signature || payload.length > 1000 || !/^[\w-]{43}$/.test(signature)) return null;
  try {
    if (!await crypto.subtle.verify('HMAC', await sessionKey(env), decode(signature), textEncoder.encode(payload))) return null;
    const claims = decodeJSON(payload);
    if (claims.origin === new URL(request.url).origin && claims.email === env.ADMIN_LOGIN_EMAIL && claims.exp > Date.now()) return claims;
  } catch { /* Invalid cookies cannot authorize access. */ }
  return null;
}

async function passwordLogin(request, env, fetcher) {
  if (!passwordSettings(env)) return json({ error: 'Log masuk kata laluan belum tersedia.' }, 503);
  try {
    const { success } = await env.ADMIN_LOGIN_RATE.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
    if (!success) return json({ error: 'Terlalu banyak percubaan. Cuba lagi sebentar.' }, 429);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Sila isi borang log masuk.' }, 400);
    let input = '';
    let size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return json({ error: 'Permintaan terlalu besar.' }, 413);
      }
      input += decoder.decode(value, { stream: true });
    }
    let values;
    try { values = JSON.parse(input + decoder.decode()); }
    catch { return json({ error: 'Permintaan tidak sah.' }, 400); }
    const { email, password, challenge } = values || {};
    if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || !password || password.length > 1024 ||
        typeof challenge !== 'string' || !challenge || challenge.length > 2048) return json({ error: 'Lengkapkan borang dan pengesahan Turnstile.' }, 400);

    const verify = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: challenge }),
      signal: AbortSignal.timeout(6000)
    });
    const result = verify.ok ? await verify.json() : {};
    const url = new URL(request.url);
    if (!result.success || result.hostname !== url.hostname || result.action !== 'admin_login') {
      return json({ error: 'Pengesahan Turnstile gagal. Cuba semula.' }, 403);
    }
    const [salt, expected] = env.ADMIN_PASSWORD_HASH.split('.');
    const key = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const actual = new Uint8Array(await crypto.subtle.deriveBits({
      name: 'PBKDF2', hash: 'SHA-256', salt: decode(salt), iterations: 100000
    }, key, 256));
    let mismatch = 0;
    const hash = decode(expected);
    for (let i = 0; i < hash.length; i++) mismatch |= actual[i] ^ hash[i];
    if (mismatch || email.trim().toLowerCase() !== env.ADMIN_LOGIN_EMAIL.trim().toLowerCase()) {
      return json({ error: 'E-mel atau kata laluan tidak sah.' }, 401);
    }
    const duration = 4 * 60 * 60;
    const payload = encode(textEncoder.encode(JSON.stringify({
      email: env.ADMIN_LOGIN_EMAIL, origin: url.origin, exp: Date.now() + duration * 1000
    })));
    const signature = encode(new Uint8Array(await crypto.subtle.sign('HMAC', await sessionKey(env), textEncoder.encode(payload))));
    const response = json({ authenticated: true });
    response.headers.set('Set-Cookie', `${cookieName}=${payload}.${signature}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${duration}`);
    return response;
  } catch {
    return json({ error: 'Log masuk tidak tersedia. Cuba lagi.' }, 503);
  }
}

// Verify Access signatures here as well as at the edge. An unprotected route must fail closed.
async function authorize(request, env, fetcher) {
  const team = env.CF_ACCESS_TEAM_DOMAIN || '';
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(team) || !env.CF_ACCESS_AUD || !env.ADMIN_EMAILS) {
    return { error: json({ error: 'Penerbitan belum diaktifkan di Cloudflare.' }, 503) };
  }
  try {
    const token = request.headers.get('Cf-Access-Jwt-Assertion') || '';
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const header = decodeJSON(parts[0]);
    const claims = decodeJSON(parts[1]);
    const now = Date.now() / 1000;
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' ||
        claims.iss !== `https://${team}` || !Number.isFinite(claims.exp) || claims.exp <= now ||
        !Number.isFinite(claims.iat) || claims.iat > now + 60 ||
        (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > now + 60)) ||
        !Array.isArray(claims.aud) || !claims.aud.includes(env.CF_ACCESS_AUD)) throw new Error('Invalid claims');
    const emails = env.ADMIN_EMAILS.split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
    if (typeof claims.email !== 'string' || !emails.includes(claims.email.toLowerCase())) throw new Error('Not an administrator');
    const certs = await fetcher(`https://${team}/cdn-cgi/access/certs`, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!certs.ok) return { error: json({ error: 'Pengesahan admin tidak tersedia. Cuba semula.' }, 502) };
    const { keys } = await certs.json();
    const jwk = keys?.find(key => key.kid === header.kid && key.kty === 'RSA');
    if (!jwk) throw new Error('Unknown signing key');
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`))) throw new Error('Invalid signature');
    return { email: claims.email };
  } catch {
    return { error: json({ error: 'Log masuk sebagai admin melalui Cloudflare Access.' }, 401) };
  }
}

function validData(data) {
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  const text = (value, max = 500) => typeof value === 'string' && value.length <= max;
  return object(data) && Array.isArray(data.players) && data.players.length <= 500 &&
    data.players.every(p => object(p) && text(p.name, 200) && String(p.number ?? '').length <= 10) &&
    Array.isArray(data.matches) && data.matches.length <= 2000 &&
    data.matches.every(m => object(m) && text(m.home, 200) && text(m.away, 200)) &&
    Array.isArray(data.teams) && data.teams.length <= 100 && data.teams.every(t => object(t) && text(t.name, 200)) &&
    text(data.about, 10000) && object(data.playerProfiles) && Object.keys(data.playerProfiles).length <= 500 &&
    Object.values(data.playerProfiles).every(object) &&
    (data.opponents === undefined || (Array.isArray(data.opponents) && data.opponents.length <= 500 && data.opponents.every(v => text(v, 200))));
}

async function github(env, fetcher, options = {}) {
  return fetcher(`https://api.github.com/repos/${REPOSITORY}/contents/${DATA_PATH}${options.method ? '' : `?ref=${BRANCH}`}`, {
    ...options,
    headers: { Authorization: `Bearer ${env.GITHUB_PUBLISH_TOKEN}`, Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Sabah-FC-Publisher', 'Content-Type': 'application/json' }
  });
}

export async function handleRequest({ request, env }, fetcher = fetch) {
  const url = new URL(request.url);
  if (!['/api/admin/session', '/api/admin/publish'].includes(url.pathname)) return json({ error: 'Not found' }, 404);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
  if (request.method === 'POST' && (request.headers.get('Origin') !== url.origin ||
      !request.headers.get('Content-Type')?.startsWith('application/json'))) return json({ error: 'Permintaan tidak sah.' }, 403);
  const sessionRoute = url.pathname === '/api/admin/session';
  if (sessionRoute && request.method === 'POST') return passwordLogin(request, env, fetcher);
  const session = await passwordSession(request, env);
  if (!session) {
    const access = await authorize(request, env, fetcher);
    if (access.error) {
      if (sessionRoute && !url.searchParams.has('login') && passwordSettings(env)) {
        return json({ authenticated: false, turnstileSiteKey: env.TURNSTILE_SITE_KEY });
      }
      return access.error;
    }
  }
  if (url.pathname === '/api/admin/session' && request.method === 'GET') {
    if (url.searchParams.get('login') === 'editor') {
      return new Response(null, { status: 303, headers: { Location: '/#admin', 'Cache-Control': 'no-store' } });
    }
    if (url.searchParams.has('login')) return new Response('<!doctype html><html lang="ms"><meta charset="utf-8"><title>Sabah FC Admin</title><p>Log masuk admin berjaya. Tutup tab ini dan kembali ke laman Sabah FC, kemudian klik “Terbit sekarang”.</p></html>', { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    return json({ authenticated: true });
  }
  if (url.pathname !== '/api/admin/publish' || request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!env.GITHUB_PUBLISH_TOKEN) return json({ error: 'Token penerbitan GitHub belum dikonfigurasi di Cloudflare.' }, 503);
  try {
    // Read the stream with a hard cap, including requests without Content-Length.
    let size = 0;
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Data diperlukan.' }, 400);
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) { await reader.cancel(); return json({ error: 'Data terlalu besar.' }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    let body;
    try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'JSON tidak sah.' }, 400); }
    if (!validData(body.data) || typeof body.baseRevision !== 'string') return json({ error: 'Format data tidak sah.' }, 400);
    const current = await github(env, fetcher);
    if (!current.ok) return json({ error: 'Gagal membaca data GitHub. Semak akses token kepada repositori.' }, 502);
    const file = await current.json();
    const previous = decodeJSON(file.content.replace(/\s/g, ''));
    if (previous.revision !== body.baseRevision) return json({ error: 'Data GitHub sudah berubah. Eksport salinan tempatan dahulu, kemudian muat semula untuk semakan.', conflict: true }, 409);
    const data = body.data;
    const snapshot = { schemaVersion: 1, revision: previous.revision, players: data.players, matches: data.matches,
      teams: data.teams, about: data.about, opponents: data.opponents || [], playerProfiles: data.playerProfiles };
    const previousData = { schemaVersion: 1, revision: previous.revision, players: previous.players, matches: previous.matches,
      teams: previous.teams, about: previous.about, opponents: previous.opponents || [], playerProfiles: previous.playerProfiles || {} };
    if (JSON.stringify(snapshot) === JSON.stringify(previousData)) return json({ published: true, unchanged: true, revision: previous.revision });
    snapshot.revision = crypto.randomUUID();
    snapshot.updatedAt = new Date().toISOString();
    const content = new TextEncoder().encode(JSON.stringify(snapshot, null, 2) + '\n');
    if (content.length > MAX_BYTES) return json({ error: 'Data terlalu besar.' }, 413);
    let binary = '';
    for (const byte of content) binary += String.fromCharCode(byte);
    const updated = await github(env, fetcher, { method: 'PUT', body: JSON.stringify({
      message: 'Update portal data from authenticated admin', content: btoa(binary), sha: file.sha, branch: BRANCH
    }) });
    if ([409, 422].includes(updated.status)) return json({ error: 'Data berubah semasa menyimpan. Eksport salinan tempatan dan muat semula.', conflict: true }, 409);
    if (!updated.ok) return json({ error: 'GitHub menolak penerbitan. Semak token dan peraturan branch.' }, 502);
    const result = await updated.json();
    return json({ published: true, revision: snapshot.revision, commit: result.commit.sha });
  } catch {
    return json({ error: 'Penerbitan gagal. Data tempatan masih disimpan; cuba semula.' }, 502);
  }
}

export const onRequest = context => handleRequest(context);
