import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const squad = JSON.parse(app.match(/const referenceSquad=(\{.*?\});const/)[1]);
const published = JSON.parse(await readFile(new URL('../published-data.json', import.meta.url), 'utf8'));
const expected = JSON.parse(await readFile(new URL('./roster-expected.json', import.meta.url), 'utf8'));
test('all 24 supplied players have the exact names, jersey numbers, positions and ages', () => {
  const players = [...squad.starters, ...squad.subs].map(p => ({...p, ...published.playerProfiles[String(p.number)]})).concat(published.players);
  const fields = players.map(({name, number, position, age}) => ({name, number, position, age})).sort((a,b) => a.number-b.number);
  assert.deepEqual(fields, expected);
  assert.equal(new Set(players.map(p => String(p.number))).size, 24);
  assert.deepEqual(['GK','DEF','MID','FOR'].map(pos => players.filter(p => p.position === pos).length), [3,9,10,2]);
});
test('published match links and existing Gonzalo career history are preserved', () => {
  assert.equal(published.matches.filter(m => m.videoUrl).length, 7);
  assert.equal(published.playerProfiles['7'].career.length, 14);
});
