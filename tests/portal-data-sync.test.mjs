import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPortalData } from '../portal-data-sync.mjs';
const published={schemaVersion:1,revision:'new',players:[{name:'New player'}],matches:[{events:[{player:'New scorer'}]}],teams:[],playerProfiles:{7:{nickname:'NEW'}}};
const localData={players:[{name:'Old player'}],matches:[]};
const localProfiles={7:{nickname:'OLD'}};
const select=extra=>selectPortalData({published,localData,localProfiles,metadata:null,admin:false,fallback:{},...extra});
test('public viewers use published data rather than stale legacy browser storage',()=>{
 const state=select();assert.equal(state.data.players[0].name,'New player');assert.equal(state.profiles[7].nickname,'NEW');assert.equal(state.preserveLocal,true);
});
test('pending edits resume after closing the browser or a remote revision change',()=>{
 for (const admin of [true,false]) for (const baseRevision of ['new','old']) {
  const state=select({admin,metadata:{pending:true,baseRevision}});
  assert.equal(state.data.players[0].name,'Old player');
  assert.equal(state.profiles[7].nickname,'OLD');
  assert.equal(state.pending,true);assert.equal(state.baseRevision,baseRevision);
 }
 const offline=select({published:null,metadata:{pending:true,baseRevision:'old'}});
 assert.equal(offline.pending,true);assert.equal(offline.baseRevision,'old');
});
test('admin keeps a committed local snapshot while deployment still serves the preceding revision',()=>{
 const state=select({admin:true,metadata:{pending:false,baseRevision:'committed',previousRevision:'new'}});
 assert.equal(state.deploying,true);assert.equal(state.pending,false);assert.equal(state.baseRevision,'committed');assert.equal(state.data.players[0].name,'Old player');
 assert.equal(select({metadata:{pending:false,baseRevision:'committed',previousRevision:'new'}}).data.players[0].name,'New player');
});
test('source objects are not mutated; unavailable public data falls back to local storage',()=>{
 const state=select();state.data.players[0].name='Modified';assert.equal(published.players[0].name,'New player');
 assert.equal(select({published:null}).data.players[0].name,'Old player');
});

