// Franciskan-/gråbrödra-nätverket (Daniels lista) → christian_sites (site_type='monastery',
// religious_order='franciscan'). Visby finns redan. Stadscentroider ur place_names (flaggade,
// ej exakt konventsläge); Stockholm/Kökar med kända lägen; Raumo/Viborg utelämnas (ingen verifierad
// koord). Idempotent (hoppar befintliga namn). Kör: node scripts/data/seed-franciscan-convents.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const one=async(sql,p)=>(await c.query(sql,p)).rows[0];

// [namn, town(lookup)|null, override [lng,lat]|null, founded|null, dateNote, county, province, country, extraNote]
const CONV=[
  ['Enköpings gråbrödrakonvent','Enköping',null,1250,'ca 1250','Uppsala','Uppland','Sverige',''],
  ['Skara gråbrödrakonvent','Skara',null,1259,'omnämnt 1259','Västra Götaland','Västergötland','Sverige',''],
  ['Gråbrödraklostret Stockholm (Gråmunkeholmen)',null,[18.0635,59.3247],1270,'1270 (Riddarholmen)','Stockholm','Uppland','Sverige','Riddarholmen = f.d. Gråmunkeholmen'],
  ['Sankta Klara systerkloster, Stockholm',null,[18.0606,59.3324],1286,'1286','Stockholm','Uppland','Sverige','Klarissorden (fattigsystrar), franciskansk familj'],
  ['Linköpings gråbrödrakonvent','Linköping',null,1287,'1287','Östergötland','Östergötland','Sverige',''],
  ['Arboga gråbrödrakonvent','Arboga',null,null,'1200-tal','Västmanland','Västmanland','Sverige',''],
  ['Jönköpings gråbrödrakloster','Jönköping',null,null,'1200-tal','Jönköping','Småland','Sverige',''],
  ['Nyköpings gråbrödrakonvent','Nyköping',null,null,'1200-tal','Södermanland','Södermanland','Sverige',''],
  ['Söderköpings gråbrödrakonvent','Söderköping',null,null,'1200-tal','Östergötland','Östergötland','Sverige',''],
  ['Uppsala gråbrödrakonvent','Uppsala',null,null,'1200-tal','Uppsala','Uppland','Sverige',''],
  ['Krokeks gråbrödrakonvent','Krokek',null,1440,'omnämnt 1440','Östergötland','Östergötland','Sverige',''],
  ['Nylödöse gråbrödrakonvent',null,[12.0,57.7267],1473,'1473 (Nya Lödöse/Gamlestaden)','Västra Götaland','Västergötland','Sverige','Nya Lödöse, nuv. Gamlestaden Göteborg (approx)'],
  ['Växjö gråbrödrakonvent','Växjö',null,null,'1400-tal','Kronoberg','Småland','Sverige',''],
  ['Kökars gråbrödrakonvent (Hamnö)',null,[20.9050,59.9250],1450,'ca mitten 1400-tal','Åland','Åland','Finland','Hamnö, Kökar — franciskanskt kapell/konvent'],
];

async function townCoord(town){
  const r=await one(`select ST_Y(ST_Centroid(geom)) lat, ST_X(ST_Centroid(geom)) lng from place_names where name=$1 and ST_Y(ST_Centroid(geom)) between 55 and 69 and ST_X(ST_Centroid(geom)) between 10 and 24 limit 1`,[town]);
  return r ? [r.lng, r.lat] : null;
}
try{
  await c.query('BEGIN');
  let added=0, skipped=0, nocoord=[];
  for(const [name,town,override,founded,dateNote,county,province,country,extra] of CONV){
    if(await one(`select id from christian_sites where name=$1`,[name])){ skipped++; continue; }
    let coord = override;
    let src = override ? 'känt läge' : 'place_names (stadscentroid)';
    if(!coord && town){ coord = await townCoord(town); }
    if(!coord){ nocoord.push(name); continue; }
    const notes=`Franciskankonvent (gråbröder), ${province}. Etablerat ${dateNote}.${extra?' '+extra+'.':''} KOORDINAT: ${override?'känt läge (approx)':'stadscentroid ur place_names'} — ej exakt konventsläge, att verifiera. Del av franciskanernas (gråbrödernas) klosternätverk i medeltidens svenska rike.`;
    await c.query(
      `insert into christian_sites (name,name_en,coordinates,site_type,religious_order,founded_year,period,status,significance_level,description,historical_notes,current_condition,region,county,province)
       values ($1,$2,point(${coord[0]},${coord[1]}),'monastery','franciscan',$3,'medieval','historical','medium',$4,$5,'Läge approximerat — att verifiera',$6,$7,$8)`,
      [name,name.replace('gråbrödrakonvent','Franciscan friary').replace('gråbrödrakloster','Franciscan friary'),founded,
       `Franciskankonvent (gråbröder), ${dateNote}.${extra?' '+extra+'.':''}`,notes,country==='Finland'?'Finland/Åland':'Sverige',county,province]);
    added++;
  }
  console.log(`franciskankonvent tillagda: ${added}, hoppade (fanns): ${skipped}, utan koord (pending): ${nocoord.join(', ')||'inga'}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
