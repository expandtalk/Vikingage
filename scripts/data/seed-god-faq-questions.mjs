import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(s,p)=>(await c.query(s,p)).rows;
// Gud-FAQ-noder (backlog, draft). Volymer ur historiska.se-datan. entity_type='deity'.
const gods=[
 ['vem-var-njord','Vem var Njord?','Who was Njord?',['njord','njörd','njärd','njord gud','vem var njord','who was njord']],
 ['vem-var-oden','Vem var Oden?','Who was Odin?',['oden','odin','oden gud','vem var oden','who was odin','allfader']],
 ['vem-var-tor','Vem var Tor?','Who was Thor?',['tor','thor','åskguden','vem var tor','who was thor']],
 ['vem-var-freja','Vem var Freja?','Who was Freyja?',['freja','freyja','freya','fröja','vem var freja','who was freyja']],
 ['vem-var-frigg','Vem var Frigg?','Who was Frigg?',['frigg','frigga','vem var frigg','who was frigg']],
 ['vem-var-balder','Vem var Balder?','Who was Balder?',['balder','baldr','baldur','vem var balder','who was balder']],
 ['vem-var-heimdall','Vem var Heimdall?','Who was Heimdall?',['heimdall','heimdal','vem var heimdall','who was heimdall']],
 ['vem-var-skade','Vem var Skade?','Who was Skadi?',['skade','skadi','skade gudinna','vem var skade','who was skadi']],
 ['vem-var-idun','Vem var Idun?','Who was Idun?',['idun','iðunn','vem var idun','who was idun']],
 ['vem-var-loke','Vem var Loke?','Who was Loki?',['loke','loki','vem var loke','who was loki']],
];
let n=0;
for(const [slug,sv,en,vars] of gods){
  await q(`insert into faq_question(slug,question_sv,question_en,variants,entity_type,status)
    values($1,$2,$3,$4,'deity','draft') on conflict(slug) do update set variants=excluded.variants, entity_type='deity' returning id`,[slug,sv,en,vars]);
  n++;
}
console.log('gud-FAQ-noder (draft):', n);
console.log('deity-frågor:', (await q(`select count(*) n from faq_question where entity_type='deity'`))[0].n);
await c.end();
