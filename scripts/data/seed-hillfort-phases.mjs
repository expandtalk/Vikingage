// (a) Lägg in Gåseborg (saknades; verifierad koord Wikipedia/RAÄ Järfälla 62:1).
// (b) Dekomponera KÄLLBELAGDA multi-fas-borgar i hillfort_phases (funktion över tid).
// Ingen påhittad datering — bara borgar där litteraturen anger faser. Idempotent. Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();

// [from,to,function,description,basis,source]
const PHASES={
  'Eketorps borg':[
    [300,400,'refuge','Eketorp I — liten ringborg (tillflykt/vakt)','14C/fynd','Eketorp-monografierna (Borg m.fl.)'],
    [400,700,'settlement','Eketorp II — utbyggd befäst by med bostäder + fähus (boskap)','14C/fynd','Eketorp-monografierna'],
    [1000,1300,'garrison','Eketorp III — medeltida garnison/gård','14C/fynd','Eketorp-monografierna'],
  ],
  'Gråborg':[
    [400,700,'refuge','Fornborgsfas — tillflykt/försvar','typologi','Olausson; RAÄ'],
    [1000,1250,'trade','Medeltida återbruk — S:t Knuts kapell + marknad intill','historisk källa','RAÄ; Länsstyrelsen'],
  ],
  'Ismantorps borg':[
    [200,650,'refuge','Tillflykt; 9 portar — kult/tings-funktion debatterad','14C/typologi','Andrén; RAÄ'],
  ],
  'Sandby borg':[
    [400,550,'settlement','Befäst by/tillflykt; massakern ~480 frös läget','14C/fynd','Kalmar läns museum (Sandby borg-projektet)'],
  ],
  'Torsburgen':[
    [300,800,'refuge','Gotlands största fornborg — tillflykt/försvar','14C','RAÄ; Engström'],
  ],
  'Gåseborg':[
    [300,500,'trade','Bronsgjutarverkstad uppe på borgen (deglar) — hantverk + försvarsläge','fynd (deglar, unders. 2002)','Carlström 2002'],
  ],
};

try{
  await c.query('BEGIN');
  // (a) Gåseborg finns som "Fornborg (Järfälla)" (raa Järfälla 62:1, rätt koord) — döp om + datera.
  const up=await c.query(`update swedish_hillforts set
      name='Gåseborg',
      period='Folkvandringstid — bronsgjutning ~300–500 e.Kr. (deglar); vallfas yngre järnålder',
      period_start=300, period_end=500,
      description=coalesce(description,'En av Mälardalens största fornborgar på brant berg över Görvälnfjärden. Deglar (metallgjutning) daterar hantverk till ~300–500. Gåseborgs grotta nedanför.'),
      dating_basis='fynd (deglar, unders. 2002)', dating_confidence='hög',
      dating_source='Carlström 2002; Wikipedia; RAÄ Järfälla 62:1'
      where raa_number='Järfälla 62:1'`);
  console.log(`Gåseborg (Fornborg Järfälla) omdöpt+daterad: ${up.rowCount} rad.`);

  // (b) faser
  let nf=0;
  for(const [name,phases] of Object.entries(PHASES)){
    const r=await c.query(`select id from swedish_hillforts where name=$1 limit 1`,[name]);
    if(!r.rowCount){ console.log('  SAKNAS:',name); continue; }
    const fid=r.rows[0].id;
    await c.query(`delete from hillfort_phases where hillfort_id=$1`,[fid]);
    for(const [f,t,fn,desc,basis,src] of phases){
      await c.query(`insert into hillfort_phases (hillfort_id,phase_from,phase_to,function,description,basis,source,confidence)
        values ($1,$2,$3,$4,$5,$6,$7,'medel')`,[fid,f,t,fn,desc,basis,src]);
      nf++;
    }
  }
  console.log(`Faser inlagda: ${nf} (${Object.keys(PHASES).length} borgar).`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
