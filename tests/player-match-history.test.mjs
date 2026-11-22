import test from 'node:test';
import assert from 'node:assert/strict';
import {playerMatchHistory} from '../player-match-history.mjs';
const roster=[{key:'a',name:'Player A',aliases:['A']},{key:'b',name:'Player B',aliases:['B']}];
const fixture=(date,events,status='FULL TIME')=>({date,home:'Sabah FC',away:'Opponent',competition:'league',homeScore:1,awayScore:0,status,events});
const event=(type,player,team='Sabah FC')=>({type,player,team,minute:'25′'});
test('history isolates player events, keeps score, sorts newest first and deduplicates matches',()=>{
 const old=fixture('2026-08-24',[event('goal','A'),event('assist','B'),event('goal','A','Opponent')]);
 const recent=fixture('2026-09-13',[event('yellow','Player A')]);
 const rows=playerMatchHistory('a',roster,[old,recent,old,fixture('2026-10-01',[event('goal','A')],'PREVIEW')]);
 assert.equal(rows.length,2);assert.equal(rows[0].match.date,'2026-09-13');
 assert.equal(rows[1].stats.goals,1);assert.equal(rows[1].stats.assists,0);assert.equal(rows[1].events.length,1);assert.equal(rows[1].match.homeScore,1);
});
test('players with no recorded contribution have an empty history',()=>{
 assert.deepEqual(playerMatchHistory('b',roster,[fixture('2026-08-24',[event('goal','A')])]),[]);
});

test('Game Log includes zero minutes, merges recorded totals once and preserves match scores',()=>{
 const squad=[{key:'22',name:'JUAN FLERE'},{key:'28',name:'DARREN YEE DENG LOK'}];
 const match={...fixture('2026-10-31',[event('assist','DARREN YEE DENG LOK')]),away:'Terengganu FC',round:6};
 const rows=playerMatchHistory('28',squad,[match,match]);
 assert.equal(rows.length,7);
 const recorded=rows.find(row=>row.match.date===match.date);
 assert.equal(recorded.seconds,4734);
 assert.equal(recorded.stats.assists,1);
 assert.equal(recorded.events.length,1);
 assert.equal(recorded.match.homeScore,1);
 const juan=playerMatchHistory('22',squad,[]);
 assert.equal(juan.length,6);
 assert.equal(juan.find(row=>row.match.date==='2026-10-17').seconds,0);
 assert.equal(juan[0].match.homeScore,undefined);
 assert.equal(juan[0].match.status,'RECORDED');
});

test('Game Log overrides conflicting totals and keeps obscured cards unknown',()=>{
 const squad=[{key:'8',name:'MUHAMMAD FARHAN BIN ROSLAN'}];
 const match={...fixture('2026-08-28',[event('goal',squad[0].name)]),away:'Penang FC'};
 const rows=playerMatchHistory('8',squad,[match]);
 const penang=rows.find(row=>row.match.date===match.date);
 assert.equal(rows.length,7);
 assert.equal(penang.stats.goals,0);
 assert.equal(penang.stats.yellow,null);
 assert.deepEqual(penang.events,[]);
});
