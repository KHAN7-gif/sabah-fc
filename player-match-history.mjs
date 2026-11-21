import {calculatePlayerStats} from './player-statistics.mjs';

export function playerMatchHistory(key, roster, matches) {
  const seen = new Set();
  return matches.filter(match => {
    if (!['FULL TIME','LIVE'].includes(match.status) || ![match.home,match.away].includes('Sabah FC')) return false;
    const identity = match.refIndex != null ? 'ref:'+match.refIndex : JSON.stringify([match.competition||'league',match.home,match.away,match.date,match.round,match.leg]);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  }).map(match => {
    const stats = calculatePlayerStats(roster,[match]).players[key]?.all;
    const events = (match.events||[]).filter(event => {
      const single = calculatePlayerStats(roster,[{...match,events:[event]}]).players[key]?.all;
      return single && Object.values(single).some(value=>value>0);
    });
    return {match,stats,events};
  }).filter(row=>row.stats && Object.values(row.stats).some(value=>value>0))
    .sort((a,b)=>String(b.match.date||'').localeCompare(String(a.match.date||'')) || String(b.match.time||'').localeCompare(String(a.match.time||'')));
}
