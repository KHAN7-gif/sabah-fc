import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../functions/api/admin/[[path]].js', import.meta.url), 'utf8');
const { handleRequest } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const baseline = JSON.parse(await readFile(new URL('../published-data.json', import.meta.url), 'utf8'));
const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const jwk = { ...await crypto.subtle.exportKey('jwk', pair.publicKey), kid: 'test' };
const env = { CF_ACCESS_TEAM_DOMAIN: 'example.cloudflareaccess.com', CF_ACCESS_AUD: 'audience', ADMIN_EMAILS: 'admin@example.test', GITHUB_PUBLISH_TOKEN: 'test-server-only-token' };
async function token(overrides = {}) {
  const head = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ iss: `https://${env.CF_ACCESS_TEAM_DOMAIN}`, aud: [env.CF_ACCESS_AUD], iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+300, email: 'admin@example.test', ...overrides })).toString('base64url');
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${Buffer.from(signature).toString('base64url')}`;
}
function fixture(body = {}) {
  const data = structuredClone(baseline);
  data.playerProfiles['22'] = { name: 'Juan', nickname: 'Shirt Name', country: 'AR', country2: 'ES', career: [{ club: 'Sabah FC', years: '2026–' }] };
  return { baseRevision: baseline.revision, data, ...body };
}
async function request(body = fixture(), overrides = {}) {
  const jwt = overrides.jwt === undefined ? await token() : overrides.jwt;
  return new Request('https://sabah-fc.pages.dev/api/admin/publish', { method: 'POST', headers: {
    Origin: 'https://sabah-fc.pages.dev', 'Content-Type': 'application/json', 'Cf-Access-Jwt-Assertion': jwt, ...overrides.headers
  }, body: JSON.stringify(body) });
}
function mocks(options = {}) {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.endsWith('/cdn-cgi/access/certs')) return Response.json({ keys: [jwk] });
    assert.ok(url.startsWith('https://api.github.com/repos/KHAN7-gif/sabah-fc/contents/published-data.json'));
    assert.equal(init.headers.Authorization, 'Bearer test-server-only-token');
    if (init.method === 'PUT') return Response.json({ commit: { sha: 'abc1234' } }, { status: options.putStatus || 200 });
    return Response.json({ sha: 'current-blob', content: Buffer.from(JSON.stringify(options.current || baseline)).toString('base64') }, { status: options.getStatus || 200 });
  };
  return { calls, fetcher };
}

test('unconfigured endpoint fails closed without network access', async () => {
  const { calls, fetcher } = mocks();
  assert.equal((await handleRequest({ request: await request(), env: {} }, fetcher)).status, 503);
  assert.equal(calls.length, 0);
});
test('requires a valid, unexpired admin JWT with the correct issuer and audience', async () => {
  for (const jwt of ['', await token({ exp: 1 }), await token({ aud: ['wrong'] }), await token({ iss: 'https://wrong.test' }), await token({ email: 'visitor@example.test' }), (await token()).slice(0, -10) + 'tampered']) {
    const { calls, fetcher } = mocks();
    assert.equal((await handleRequest({ request: await request(fixture(), { jwt }), env }, fetcher)).status, 401);
    assert.equal(calls.filter(c => c.url.includes('api.github.com')).length, 0);
  }
});
test('rejects cross-origin writes, invalid data, oversized payloads and invalid routes', async () => {
  const { fetcher } = mocks();
  assert.equal((await handleRequest({ request: await request(fixture(), { headers: { Origin: 'https://evil.test' } }), env }, fetcher)).status, 403);
  assert.equal((await handleRequest({ request: await request({ baseRevision: baseline.revision, data: {} }), env }, fetcher)).status, 400);
  const large = fixture(); large.extra = 'x'.repeat(530000);
  assert.equal((await handleRequest({ request: await request(large), env }, fetcher)).status, 413);
  assert.equal((await handleRequest({ request: new Request('https://sabah-fc.pages.dev/api/admin/other'), env }, fetcher)).status, 404);
});
test('detects stale revisions and concurrent GitHub conflicts without overwriting', async () => {
  const stale = mocks({ current: { ...baseline, revision: 'newer' } });
  assert.equal((await handleRequest({ request: await request(), env }, stale.fetcher)).status, 409);
  assert.equal(stale.calls.filter(c => c.init.method === 'PUT').length, 0);
  const concurrent = mocks({ putStatus: 409 });
  assert.equal((await handleRequest({ request: await request(), env }, concurrent.fetcher)).status, 409);
});
test('commits all player data to the single allowed file and branch using its SHA', async () => {
  const { calls, fetcher } = mocks();
  const response = await handleRequest({ request: await request(), env }, fetcher);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.commit, 'abc1234');
  assert.notEqual(result.revision, baseline.revision);
  const put = calls.find(c => c.init.method === 'PUT');
  const body = JSON.parse(put.init.body);
  assert.equal(body.branch, 'main'); assert.equal(body.sha, 'current-blob');
  const content = JSON.parse(Buffer.from(body.content, 'base64').toString());
  assert.equal(content.playerProfiles['22'].nickname, 'Shirt Name');
  assert.equal(content.playerProfiles['22'].career[0].years, '2026–');
  assert.deepEqual(content.matches, baseline.matches);
  assert.deepEqual(content.players, baseline.players);
  assert.equal(content.revision, result.revision);
  assert.ok(!JSON.stringify(content).includes(env.GITHUB_PUBLISH_TOKEN));
});
test('unchanged data does not create another commit; upstream errors do not leak credentials', async () => {
  const same = mocks();
  const result = await handleRequest({ request: await request({ baseRevision: baseline.revision, data: baseline }), env }, same.fetcher);
  assert.equal((await result.json()).unchanged, true);
  assert.equal(same.calls.filter(c => c.init.method === 'PUT').length, 0);
  const failed = mocks({ getStatus: 403 });
  const failure = await handleRequest({ request: await request(), env }, failed.fetcher);
  assert.equal(failure.status, 502); assert.ok(!(await failure.text()).includes(env.GITHUB_PUBLISH_TOKEN));
});
