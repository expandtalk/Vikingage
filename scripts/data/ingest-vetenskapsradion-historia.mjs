import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:120000});
await c.connect();
// 1) källa
const src=(await c.query(`insert into media_sources(medium,name,creator,url,external_ref,blurb_sv,blurb_en,authority)
  values('podcast','Vetenskapsradion Historia','Sveriges Radio','https://sverigesradio.se/vetenskapsradionhistoria','sr:407',
  'Sveriges Radios historieprogram i P1, sänt sedan 2000. Arkeologi, vikingatid, medeltid och aktuell forskning.',
  'Swedish public radio history programme (P1), since 2000. Archaeology, Viking Age, medieval history and current research.', true)
  on conflict do nothing returning id`)).rows[0]
  || (await c.query(`select id from media_sources where external_ref='sr:407'`)).rows[0];
const sourceId=src.id; console.log('source_id:',sourceId);
// 2) hämta alla avsnitt
const parseDate=s=>{const m=/\/Date\((\d+)\)\//.exec(s||'');return m?new Date(+m[1]).toISOString().slice(0,10):null;};
let page=1,total=0,ins=0;
for(;;){
  const r=await fetch(`http://api.sr.se/api/v2/episodes/index?programid=407&format=json&size=100&page=${page}`);
  const j=await r.json(); const eps=j.episodes||[];
  for(const e of eps){
    const pub=parseDate(e.publishdateutc);
    const dur=e.downloadpodfile?.duration||e.listenpodfile?.duration||null;
    await c.query(`insert into media_items(source_id,medium,title,url,external_ref,published_at,duration_seconds,summary_sv,lang)
      values($1,'podcast',$2,$3,$4,$5,$6,$7,'sv') on conflict do nothing`,
      [sourceId,e.title,e.url||`https://sverigesradio.se/avsnitt/${e.id}`,`sr:ep:${e.id}`,pub,dur,(e.description||'').slice(0,2000)]);
    ins++;
  }
  total+=eps.length;
  if(page>=(j.pagination?.totalpages||1)||!eps.length)break;
  page++;
}
console.log('avsnitt hämtade:',total,'| insert-försök:',ins);
// 3) verifiera + search_vector
const cnt=(await c.query(`select count(*) n, count(search_vector) sv from media_items where source_id=$1`,[sourceId])).rows[0];
console.log('i DB:',cnt.n,'| med search_vector:',cnt.sv);
if(+cnt.sv < +cnt.n){
  console.log('search_vector ej auto — sätter manuellt...');
  await c.query(`update media_items set search_vector=to_tsvector('swedish',coalesce(title,'')||' '||coalesce(summary_sv,'')) where source_id=$1 and search_vector is null`,[sourceId]);
  console.log('uppdaterat.');
}
await c.end();
