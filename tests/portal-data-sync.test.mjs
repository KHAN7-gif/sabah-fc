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
test('only an admin with a draft based on the current revision can resume it',()=>{
 const metadata={pending:true,baseRevision:'new'};
 assert.equal(select({admin:true,metadata}).data.players[0].name,'Old player');
 assert.equal(select({metadata}).data.players[0].name,'New player');
 const stale=select({admin:true,metadata:{pending:true,baseRevision:'old'}});
 assert.equal(stale.data.players[0].name,'New player');assert.equal(stale.preserveLocal,true);assert.equal(stale.pending,false);
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
