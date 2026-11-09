// Admin fixture times are Malaysia time (UTC+8), independent of the viewer's timezone.
export function kickoffTime(match){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(match.date||'')||!/^([01]\d|2[0-3]):[0-5]\d$/.test(match.time||''))return null;
  const value=Date.parse(`${match.date}T${match.time}:00+08:00`);
  if(!Number.isFinite(value)||new Date(value+8*3600000).toISOString().slice(0,10)!==match.date)return null;
  return value;
}
export function matchKey(match){
  return Number.isInteger(match.refIndex)?`ref:${match.refIndex}`:'fixture:'+JSON.stringify([match.competition||'league',match.home,match.away,match.round||'',match.stage||'',match.leg||'']);
}
export function dueKickoffs(matches,now=Date.now()){
  return matches.filter(match=>/sabah/i.test(match.home||'')||/sabah/i.test(match.away||'')).filter(match=>{
    const kick=kickoffTime(match);
    return ['PREVIEW','LIVE'].includes(match.status)&&kick!==null&&kick<=now&&now-kick<120000;
  }).map(match=>({id:matchKey(match),kickoff:kickoffTime(match),match}));
}
export function kickoffPayload({id,kickoff,match},site='https://sabah-fc.pages.dev/'){
  const url=new URL(site);url.searchParams.set('match',id);
  return {title:'Kick-off! '+match.home+' vs '+match.away,
    body:`${match.competition==='fa'?'FA Cup':'Super League'} · ${match.time} MYT${match.venue?' · '+match.venue:''}`,
    tag:'kickoff:'+id,kickoff,url:url.search};
}
