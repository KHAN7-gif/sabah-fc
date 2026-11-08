const fields = { goal: 'goals', assist: 'assists', yellow: 'yellow', red: 'red' };
const empty = () => ({ goals: 0, assists: 0, yellow: 0, red: 0 });
export const normalizeName = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Count entered match events once; never add historical summary totals to those events.
export function calculatePlayerStats(roster, matches) {
  const result = Object.fromEntries(roster.map(p => [p.key, { league: empty(), fa: empty(), all: empty() }]));
  const names = new Map();
  for (const p of roster) for (const name of [p.name, ...(p.aliases || [])]) {
    const normalized = normalizeName(name);
    if (!normalized) continue;
    if (!names.has(normalized)) names.set(normalized, new Set());
    names.get(normalized).add(p.key);
  }
  const seen = new Set();
  let unmatched = 0;
  for (const match of matches) {
    if (!['FULL TIME', 'LIVE'].includes(match.status)) continue;
    const competition = match.competition === 'fa' ? 'fa' : 'league';
    const identity = match.refIndex != null ? 'ref:' + match.refIndex : JSON.stringify([competition, match.home, match.away, match.date, match.round, match.leg]);
    if (seen.has(identity)) continue;
    seen.add(identity);
    for (const event of match.events || []) {
      const field = fields[event.type];
      if (!field || normalizeName(event.team) !== 'SABAHFC') continue;
      let candidates;
      if (event.playerNumber != null && String(event.playerNumber).trim()) {
        candidates = roster.filter(p => String(p.number) === String(event.playerNumber)).map(p => p.key);
      } else candidates = [...(names.get(normalizeName(event.player)) || [])];
      if (candidates.length !== 1) { unmatched++; continue; }
      const stats = result[candidates[0]];
      stats[competition][field]++;
      stats.all[field]++;
    }
  }
  return { players: result, unmatched };
}
