const enriqueRecords = [
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:5400,goals:1,assists:0,yellow:1},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:0,assists:0,yellow:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:5400,goals:0,assists:0,yellow:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:720,goals:0,assists:0,yellow:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:5400,goals:0,assists:0,yellow:0}
];
export const durationLabel = seconds => String(Math.floor(seconds/60));
export function playingTimeRecords(player) {
 const name=String(player.name||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');
 return name.includes('ENRIQUELOPEZ')?enriqueRecords.map(r=>({...r})):[];
}
export function playingTimeSummary(records) {
 const seconds=records.reduce((sum,r)=>sum+r.seconds,0);
 return {seconds,appearances:records.length,fullMatches:records.filter(r=>r.seconds>=5400).length,average:records.length?Math.round(seconds/records.length):0};
}
