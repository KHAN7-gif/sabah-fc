import {faPlayingTime} from './fa-playing-time.mjs';
const rusdiRecords = [
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0}
];
const rozacklyeRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null}
];
const shahrulnizamRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:3150,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:5218,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:4706,goals:0,assists:1,yellow:0,red:null},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null}
];
const fakrulRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:665,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:691,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:null}
];
const dominicRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:4652,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:null},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:null}
];
const juanRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:5218,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:4621,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0}
];
const daneRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:4617,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:1423,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:3961,goals:0,assists:0,yellow:0,red:0}
];
const darrenRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:4734,goals:0,assists:1,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:939,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:1831,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:680,goals:1,assists:0,yellow:0,red:0}
];
const damienRecords = [
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:181,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:0,assists:0,yellow:1,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:778,goals:0,assists:0,yellow:0,red:0}
];
const dineshRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:2700,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:3734,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:4460,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:4668,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:1831,goals:0,assists:0,yellow:1,red:0},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:2700,goals:0,assists:0,yellow:1,red:0}
];
const joseRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:5400,goals:1,assists:0,yellow:1,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:1438,goals:0,assists:0,yellow:0,red:0}
];
const shoRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:3150,goals:0,assists:1,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:782,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:0,assists:0,yellow:1,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:2700,goals:0,assists:0,yellow:0,red:0}
];
const halimRecords = [
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:3976,goals:0,assists:0,yellow:1,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:4382,goals:0,assists:0,yellow:1,red:0}
];
const fayadhRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:747,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:1665,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:4569,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:4166,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:3568,goals:0,assists:1,yellow:0,red:0},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:5400,goals:0,assists:2,yellow:0,red:0}
];
const farhanRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:2700,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:830,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:1233,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:3568,goals:0,assists:0,yellow:null,red:null},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:0,goals:0,assists:0,yellow:null,red:null}
];
const jungbinRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:1808,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:2700,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:2700,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:1438,goals:0,assists:0,yellow:0,red:0}
];
const miguelRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:2249,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:181,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:3976,goals:0,assists:1,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:5400,goals:0,assists:1,yellow:0,red:0}
];
const ramziRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0}
];
const hanafieRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:1423,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:1233,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:4708,goals:1,assists:0,yellow:0,red:0},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:2700,goals:0,assists:0,yellow:0,red:0}
];
const oskariRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:5400,goals:0,assists:0,yellow:1,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0}
];
const gonzaloRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:3591,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:5400,goals:1,assists:0,yellow:0,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:1,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:5400,goals:1,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:2700,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:3961,goals:1,assists:0,yellow:0,red:0}
];
const rawilsonRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:5400,goals:0,assists:0,yellow:1,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:693,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:0,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:4719,goals:0,assists:0,yellow:0,red:0}
];
const danelRecords = [
 {date:'2026-11-21',opponent:'Kelantan Red Warrior FC',round:7,competition:'league',seconds:2249,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:5400,goals:0,assists:0,yellow:1,red:0},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:4166,goals:0,assists:0,yellow:1,red:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:5400,goals:0,assists:0,yellow:0,red:0},
 {date:'2026-08-24',opponent:'Star City FC',round:1,competition:'league',seconds:5400,goals:0,assists:1,yellow:0,red:0}
];
const enriqueRecords = [
 {date:'2026-10-31',opponent:'Terengganu FC',round:6,competition:'league',seconds:5400,goals:1,assists:0,yellow:1},
 {date:'2026-10-17',opponent:'Negeri Sembilan FC',round:5,competition:'league',seconds:5400,goals:0,assists:0,yellow:0},
 {date:'2026-09-13',opponent:'DPMM FC',round:4,competition:'league',seconds:5400,goals:0,assists:0,yellow:0},
 {date:'2026-09-05',opponent:'Kuching City FC',round:3,competition:'league',seconds:731,goals:0,assists:0,yellow:0},
 {date:'2026-08-28',opponent:'Penang FC',round:2,competition:'league',seconds:5400,goals:0,assists:0,yellow:0}
];
export const durationLabel = seconds => String(Math.round(seconds/60));
export function playingTimeRecords(player) {
 const name=String(player.name||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');
 const records=name==='RUSDIBINROSLAN'?rusdiRecords:name==='ROZACKLYEYANAM'?rozacklyeRecords:name==='MOHDSHAHRULNIZAMABDULLAH'?shahrulnizamRecords:name==='MUHAMMADFAKRULIMANBINNASZARI'?fakrulRecords:name==='DOMINICJUNJINTAN'?dominicRecords:name==='JUANFLERE'?juanRecords:name==='DANEJAMESINGHAM'?daneRecords:name==='DARRENYEEDENGLOK'?darrenRecords:name==='DAMIENCHIENKHAILIM'?damienRecords:name==='DINESHALRAJASINGAM'?dineshRecords:name==='JOSEANGELALONSOMARTIN'?joseRecords:name==='SHOYAMAMOTO'?shoRecords:name==='ABDULHALIMBINSAARI'?halimRecords:name==='MOHAMMADFAYADHBINMOHDZULKIFLIAMIN'?fayadhRecords:name==='MUHAMMADFARHANBINROSLAN'?farhanRecords:name==='JUNGBINPARK'?jungbinRecords:name==='MIGUELANGELGARRIDOCIFUENTES'?miguelRecords:name==='MOHAMADRAMZIMUSTAKIM'?ramziRecords:name==='ABDULHANAFIEBINTOKYOABDULHASIM'?hanafieRecords:name==='OSKARIJOHANNESKEKKONEN'?oskariRecords:name==='GONZALOIGNACIODIRENZO'?gonzaloRecords:name==='RAWILSONBATUIL'?rawilsonRecords:name.includes('ENRIQUELOPEZ')?enriqueRecords:/FADZRULDAN(?:E|IE)L/.test(name)&&name.includes('MOHDNIZAM')?danelRecords:[];
 const fa=Object.entries(faPlayingTime).find(([fullName])=>fullName.replace(/[^A-Z]/g,'')===name)?.[1]||[];
 return [...records,...fa].map(r=>({...r}));
}
export function playingTimeSummary(records) {
 const seconds=records.reduce((sum,r)=>sum+(r.seconds??0),0);
 return {seconds,appearances:records.length,fullMatches:records.filter(r=>r.seconds>=5400).length,pending:records.filter(r=>r.seconds==null).length,average:records.filter(r=>r.seconds!=null).length?Math.round(seconds/records.filter(r=>r.seconds!=null).length):0};
}

export function rankPlayingTime(players, competition='all') {
 return players.map(p=>{
  const records=playingTimeRecords(p).filter(r=>r.seconds>0&&(competition==='all'||r.competition===competition));
  const seconds=playingTimeSummary(records).seconds;
  return {p,seconds,value:Number(durationLabel(seconds))};
 }).filter(row=>row.seconds>0)
  .sort((a,b)=>b.seconds-a.seconds||String(a.p.name).localeCompare(String(b.p.name)));
}
