import {calculatePlayerStats} from './player-statistics.mjs';
import {playingTimeRecords} from './player-playing-time.mjs';

export function playerMatchHistory(key, roster, matches) {
  const seen = new Set();
  const eligible = matches.filter(match => {
    if (!['FULL TIME','LIVE'].includes(match.status) || ![match.home,match.away].includes('Sabah FC')) return false;
    const identity = match.refIndex != null ? 'ref:'+match.refIndex : JSON.stringify([match.competition||'league',match.home,match.away,match.date,match.round,match.leg]);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
  const rows = eligible.map(match => {
    const stats = calculatePlayerStats(roster,[match]).players[key]?.all;
    const events = (match.events||[]).filter(event => {
      const single = calculatePlayerStats(roster,[{...match,events:[event]}]).players[key]?.all;
      return single && Object.values(single).some(value=>value>0);
    });
    return {match,stats,events};
  }).filter(row=>row.stats && Object.values(row.stats).some(value=>value>0));

  const player = roster.find(player=>player.key===key);
  for (const record of playingTimeRecords(player||{})) {
    const matchesRecord = match => match.date===record.date && (match.competition||'league')===record.competition && [match.home,match.away].includes(record.opponent);
    let row = rows.find(row=>matchesRecord(row.match));
    if (!row) {
      const match = eligible.find(matchesRecord) || {
        date:record.date, round:record.round, competition:record.competition,
        home:'Sabah FC', away:record.opponent, status:'RECORDED'
      };
      row = {match,stats:{},events:[]};
      rows.push(row);
    }
    // Game Log totals describe this player, without duplicating match events.
    const stats = Object.fromEntries(['goals','assists','yellow','red'].map(key=>[key,record[key]??null]));
    row.events = row.events.filter(event=>{
      const statKey = {goal:'goals',assist:'assists',yellow:'yellow',red:'red'}[event.type];
      return statKey && row.stats[statKey]===stats[statKey];
    });
    row.stats = stats;
    row.seconds = record.seconds;
  }
  return rows.filter(row=>row.seconds!==0).sort((a,b)=>String(b.match.date||'').localeCompare(String(a.match.date||'')) || String(b.match.time||'').localeCompare(String(a.match.time||'')));
}
