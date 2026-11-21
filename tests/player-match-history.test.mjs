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
