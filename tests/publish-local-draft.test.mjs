import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('function markPublishedRevision('),source.indexOf('let editingMatch='));
test('edits made during an in-flight publish remain pending at the new base revision',()=>{
 const context={data:{matches:[{homeScore:1}]},playerProfiles:{},publishedRevision:'old',hasPendingDraft:true,awaitingDeployment:null,SYNC_STORAGE_KEY:'sync',localStorage:{setItem(k,v){this[k]=v}}};
 vm.createContext(context);
 context.submitted=JSON.stringify({...context.data,playerProfiles:context.playerProfiles});
 context.data.matches[0].homeScore=2;
 vm.runInContext(fn+";markPublishedRevision('committed',submitted)",context);
 const metadata=JSON.parse(context.localStorage.sync);
 assert.equal(context.hasPendingDraft,true);assert.equal(metadata.pending,true);assert.equal(metadata.baseRevision,'committed');assert.equal(context.data.matches[0].homeScore,2);
});
test('unchanged submitted edits are marked saved after the server confirms',()=>{
 const context={data:{matches:[]},playerProfiles:{},publishedRevision:'old',hasPendingDraft:true,awaitingDeployment:null,SYNC_STORAGE_KEY:'sync',localStorage:{setItem(k,v){this[k]=v}}};
 vm.createContext(context);context.submitted=JSON.stringify({...context.data,playerProfiles:{}});
 vm.runInContext(fn+";markPublishedRevision('committed',submitted)",context);
 assert.equal(context.hasPendingDraft,false);assert.equal(JSON.parse(context.localStorage.sync).pending,false);
});
