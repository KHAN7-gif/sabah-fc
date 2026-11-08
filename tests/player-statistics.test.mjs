import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePlayerStats } from '../player-statistics.mjs';
const roster = [
  { key:'20', number:20, name:'Mohd Fadzrul Danel bin Mohd Nizam', aliases:['MOHD FADZRUL DANIEL BIN MOHD NIZAM'] },
  { key:'18', number:18, name:'Abdul Halim bin Saari', aliases:['Halim Saari'] },
  { key:'extra:0', number:1, name:'Ramzi', aliases:[] }
];
const event = (type,player,team='Sabah FC',extra={}) => ({type,player,team,...extra});
const match = (refIndex,competition,events,status='FULL TIME') => ({refIndex,competition,events,status});
test('keeps competition totals separate and sums goals, assists, both cards exactly once',()=>{
  const matches=[match(0,'league',[event('assist','MOHD FADZRUL DANIEL BIN MOHD NIZAM'),event('goal','Halim Saari'),event('yellow','Halim Saari'),event('yellow','Halim Saari'),event('red','Halim Saari')]),match(22,'fa',[event('goal','Abdul Halim bin Saari'),event('assist','Halim Saari'),event('yellow','Halim Saari'),event('goal','Halim Saari','Selangor FC')])];
  const {players}=calculatePlayerStats(roster,matches);
  assert.deepEqual(players['18'].league,{goals:1,assists:0,yellow:2,red:1});
  assert.deepEqual(players['18'].fa,{goals:1,assists:1,yellow:1,red:0});
  assert.deepEqual(players['18'].all,{goals:2,assists:1,yellow:3,red:1});
  assert.equal(players['20'].league.assists,1);
  assert.deepEqual(players['extra:0'].all,{goals:0,assists:0,yellow:0,red:0});
});
test('counts live records, excludes preview fixtures and avoids duplicate match imports',()=>{
  const recorded=match(0,'league',[event('goal','Ramzi')]);
  const result=calculatePlayerStats(roster,[recorded,recorded,match(1,'league',[event('goal','Ramzi')],'PREVIEW'),match(2,'league',[event('goal','Ramzi')],'LIVE')]);
  assert.equal(result.players['extra:0'].all.goals,2);
});
test('does not guess ambiguous names, supports explicit jersey numbers and tracks unmatched events',()=>{
  const same=[...roster,{key:'99',number:99,name:'Another player',aliases:['Halim Saari']}];
  const result=calculatePlayerStats(same,[match(0,'fa',[event('goal','Halim Saari'),event('goal','Unknown player'),event('assist','Nickname','Sabah FC',{playerNumber:18}),event('yellow','Abdul Halim bin Saari')])]);
  assert.equal(result.unmatched,2);assert.equal(result.players['18'].all.goals,0);assert.equal(result.players['18'].all.assists,1);assert.equal(result.players['18'].fa.yellow,1);
});
