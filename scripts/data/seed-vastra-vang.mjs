// Västra Vång (Hjortsberga, Ronneby, Blekinge) → heritage_sites. Central-/kultplats, järnålder–
// vikingatid. Koordinat verifierad mot Wikidata Q10718694 + sv.wikipedia (56.2603, 15.4203).
// Fakta (fria): 70 guldgubbar (t.o.m. 2023), keltiska/romerska bronsmasker + provinsromersk byst,
// arabiska mynt, ~15 ha, upptäckt 2004 (Blekinge museum + Södertörn/Lund). Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();
const desc='Central- och kultplats, järnålder–vikingatid (ca 200 f.Kr.–1000-tal). Upptäckt 2004; forskningsgrävning av Blekinge museum m. Södertörn/Lund. 70 guldgubbar (t.o.m. 2023), bronsmasker av trolig keltisk härkomst + en provinsromersk bronsbyst med lokal kopia (fästa på stora bronskärl), arabiska mynt — indikatorer på makt, kult och långväga kontakter. ~15 ha; en ekbevuxen höjd i mitten hade särskild kultstatus. Ligger ~7 km N om Listerby/Björketorpsstenen — del av ett tätt östblekingskt elitkomplex. Koordinat verifierad mot Wikidata Q10718694 + sv.wikipedia. Källa: Blekinge museum.';
try{
  await c.query('BEGIN');
  const ex=await c.query(`select id from heritage_sites where name ilike 'Västra Vång%' and landscape='Blekinge' limit 1`);
  if(ex.rowCount){ console.log('finns redan:', ex.rows[0].id); }
  else{
    const r=await c.query(`insert into heritage_sites (name,raa_type,lat,lng,landscape,municipality,parish,period,description,source_uri)
      values ('Västra Vång (central-/kultplats)','Centralplats',56.2603,15.4203,'Blekinge','Ronneby','Hjortsberga','järnålder–vikingatid',$1,'wikidata.org/wiki/Q10718694') returning id`,[desc]);
    console.log('inlagd:', r.rows[0].id);
  }
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
