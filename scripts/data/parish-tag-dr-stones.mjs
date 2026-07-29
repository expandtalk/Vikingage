// Parish-taggar Blekinge/Halland-runstenar (DR-serien + Sm54) ur RAÄ-socken (Daniels Fornsök-lista).
// Bara etiketter (parish/province) på befintliga runic_inscriptions — ingen ny data. Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
// signum → [socken, landskap]  (socken ur RAÄ; landskap = kulturhistoriskt)
const MAP={
  'DR 352':['Vapnö','Halland'],        // Vapnöstenen
  'DR 353':['Holm','Halland'],
  'DR 354':['Kvibille','Halland'],
  'DR 355':['Getinge','Halland'],
  'Sm 54' :['Södra Unnaryd','Småland'],// Hylte kn, Hallands län / Småland landskap
  'DR 356':['Sölvesborg','Blekinge'],  // Sölvesborgsstenen
  'DR 357':['Sölvesborg','Blekinge'],  // Stentoftenstenen
  'DR 358':['Sölvesborg','Blekinge'],  // Gummarpstenen (Gummarp by, Sölvesborg)
  'DR 359':['Mjällby','Blekinge'],     // Istabystenen
  'DR 360':['Listerby','Blekinge'],    // Björketorpsstenen (redan taggad)
  'DR 361':['Åryd','Blekinge'],        // Halahultstenen (Åryd, Karlshamn)
  'DR 363':['Sturkö','Blekinge'],      // Sturköstenen
  'DR 364':['Lösen','Blekinge'],
  'DR 366':['Lösen','Blekinge'],
};
const norm=s=>s.replace(/\s+/g,'').toUpperCase();
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
try{
  await c.query('BEGIN'); let upd=0,miss=[];
  for(const [sig,[parish,prov]] of Object.entries(MAP)){
    const r=await c.query(
      `update runic_inscriptions set parish=$1, province=$2
       where regexp_replace(coalesce(signum,''),'\\s','','g') = $3 returning signum, name`,
      [parish, prov, norm(sig)]);
    if(r.rowCount){ upd+=r.rowCount; console.log(`  ${sig} → ${parish} (${prov})  [${r.rows.map(x=>x.name||x.signum).join(', ')}]`); }
    else miss.push(sig);
  }
  console.log(`\nuppdaterade: ${upd}, ej funna: ${miss.join(', ')||'inga'}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
