import test from 'node:test';
import assert from 'node:assert/strict';
import {rankPlayingTime} from '../player-playing-time.mjs';
const players=[
 {name:'RUSDI BIN ROSLAN',rosterKey:'88'},
 {name:'JUAN FLERE',rosterKey:'22'},
 {name:'DOMINIC JUN JIN TAN',rosterKey:'33'},
 {name:'OSKARI JOHANNES KEKKONEN',rosterKey:'5'}
];
test('minutes ranking sorts by total playing time and excludes unused players',()=>{
 const ranked=rankPlayingTime(players,'league');
 assert.deepEqual(ranked.map(row=>[row.p.rosterKey,row.value]),[['33',618],['5',540],['22',344]]);
 assert.equal(ranked[0].seconds,37052);
 assert.deepEqual(rankPlayingTime(players,'league'),ranked);
 assert.deepEqual(rankPlayingTime(players,'fa').map(row=>row.value),[180,156,45]);
 assert.deepEqual(rankPlayingTime(players,'malaysia'),[]);
 assert.equal(rankPlayingTime(players)[0].value,798);
 assert.equal(players[0].name,'RUSDI BIN ROSLAN');
});

const {faPlayingTime}=await import('../fa-playing-time.mjs');
const {playingTimeRecords,playingTimeSummary}=await import('../player-playing-time.mjs');
test('FA Cup includes every starter and substitute, isolates competitions and leaves stoppage duration unknown',()=>{
 const records=Object.values(faPlayingTime).flat();
 for(const date of ['2026-09-02','2026-09-09']){
  const leg=records.filter(r=>r.date===date);
  assert.equal(leg.length,16);
  assert.equal(leg.reduce((sum,r)=>sum+(r.seconds??0),0),990*60);
  assert.ok(leg.every(r=>r.competition==='fa'));
 }
 const farhan=playingTimeRecords({name:'MUHAMMAD FARHAN BIN ROSLAN'}).filter(r=>r.competition==='fa');
 assert.equal(farhan.length,2);
 assert.equal(farhan[0].seconds,null);
 assert.match(farhan[0].minutesNote,/90\+3/);
 assert.equal(playingTimeSummary(farhan).pending,1);
 assert.equal(playingTimeSummary(farhan).seconds,66*60);
});
