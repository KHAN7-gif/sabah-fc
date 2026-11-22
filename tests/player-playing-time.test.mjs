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
 const ranked=rankPlayingTime(players);
 assert.deepEqual(ranked.map(row=>[row.p.rosterKey,row.value]),[['33',618],['5',540],['22',344]]);
 assert.equal(ranked[0].seconds,37052);
 assert.deepEqual(rankPlayingTime(players,'league'),ranked);
 assert.deepEqual(rankPlayingTime(players,'fa'),[]);
 assert.deepEqual(rankPlayingTime(players,'malaysia'),[]);
 assert.equal(players[0].name,'RUSDI BIN ROSLAN');
});
