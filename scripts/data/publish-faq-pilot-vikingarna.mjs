import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(s,p)=>(await c.query(s,p)).rows;
// applicera get_faq v2
await c.query(readFileSync('supabase/migrations/20260819100000_get_faq_related_suggestions.sql','utf8'));
const pid=(await q(`select id from faq_question where slug='vilka-var-vikingarna'`))[0].id;
// 1) seeda PAA-frågor (draft-backlog) + länka till piloten
const paa=[
 ['var-bodde-vikingarna','Var bodde vikingarna?','Where did the Vikings live?',['var bodde vikingarna','var levde vikingarna']],
 ['vad-betyder-ordet-viking','Vad betyder ordet viking?','What does the word Viking mean?',['vad betyder viking','varifrån kommer ordet viking']],
 ['fanns-kvinnliga-vikingar','Fanns kvinnliga vikingar?','Were there female Vikings?',['kvinnliga vikingar','sköldmö','fanns det kvinnliga krigare']],
 ['vad-var-varingarna','Vad var väringarna?','Who were the Varangians?',['väringar','varjager','väringagardet','vad var väringar']],
 ['nar-slutade-vikingatiden','När slutade vikingatiden?','When did the Viking Age end?',['när slutade vikingatiden','vikingatidens slut','1066']],
];
let rank=10;
for(const [slug,sv,en,vars] of paa){
  const rid=(await q(`insert into faq_question(slug,question_sv,question_en,variants,entity_type,status)
    values($1,$2,$3,$4,'topic','draft') on conflict(slug) do update set question_sv=excluded.question_sv returning id`,[slug,sv,en,vars]))[0].id;
  await q(`insert into faq_related(question_id,related_id,relation,rank) values($1,$2,'paa',$3)
    on conflict(question_id,related_id) do update set rank=excluded.rank`,[pid,rid,rank]); rank+=10;
}
// 2) publicera piloten
await q(`update faq_answer_lens set review_status='verified' where question_id=$1`,[pid]);
await q(`update faq_question set status='published', updated_at=now() where id=$1`,[pid]);
// 3) verifiera
const r=(await q(`select get_faq('vilka var vikingarna') r`))[0].r;
console.log('PUBLICERAT. get_faq → linser:', r?.lenses?.length, '| bias:', r?.bias?.length, '| PAA:', (r?.related||[]).map(x=>x.question_sv).length);
console.log('linser:', (r?.lenses||[]).map(l=>l.discipline_label+':'+l.status).join(', '));
console.log('PAA:', (r?.related||[]).map(x=>x.question_sv).join(' · '));
console.log('normaliserad fråga funkar:', (await q(`select (get_faq('vem var vikingarna?') is not null) ok`))[0].ok);
await c.end();
