// Bornholm-kyrkor → heritage_sites (raa_type='kyrka'), parallellt med Gotlands/Ölands kyrkolager.
// Verifierade koordinater ur Wikidata P625; beskrivningar är egna faktatexter (ingen verbatim
// från upphovsrättsskyddad artikel/PDF, jfr rättighetsspärren). Kör: node scripts/data/ingest-bornholm-churches.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();

// [namn, sogn, lat, lng, QID, existence, beskrivning]
const CH=[
 ['Nylars Kirke','Nylars sogn',55.0739,14.8147,'Q1742935','extant','Medeltida rundkyrka (ca 1150) — en av Bornholms fyra rundkyrkor, byggd som både kyrka och försvarsverk. Två runstenar står i vapenhuset.'],
 ['Østerlars Kirke','Østerlars sogn',55.1714,14.9617,'Q1742987','extant','Bornholms största och äldsta rundkyrka (ca 1150), med kraftig mittpelare och kalkmålningar. Runstenar knutna till kyrkan.'],
 ['Sankt Ols Kirke','Olsker sogn',55.2360,14.8004,'Q951098','extant','Rundkyrka (1100-tal) i Olsker — den smäckraste av de fyra bornholmska rundkyrkorna.'],
 ['Ny Kirke','Nyker sogn',55.1394,14.7692,'Q596951','extant','Den minsta av Bornholms fyra rundkyrkor (1200-tal), Nyker. Runsten knuten till kyrkan.'],
 ['Aa Kirke','Aakirkeby sogn',55.0707,14.9193,'Q300821','extant','Bornholms största medeltidskyrka och enda egentliga stadskyrka (Aakirkeby). Berömd för stenmästaren Sighrafs signerade dopfunt av gotländsk sandsten (1200-tal) med elva bildscener ur Jesu liv och en förklarande runinskrift.'],
 ['Vestermarie Kirke','Vestermarie sogn',55.1057,14.8250,'Q7923426','extant','Medeltida sockenkyrka (ombyggd 1885). På kyrkogården står sex runstenar — den största samlingen vid en enskild kyrka på Bornholm.'],
 ['Sankt Clemens Kirke','Klemensker sogn',55.1751,14.8027,'Q3428492','extant','Medeltida sockenkyrka i Klemensker (ombyggd på 1800-talet). Runstenar, flera med kristna kors, hör till kyrkan.'],
 ['Rø Kirke','Rø sogn',55.2106,14.8962,'Q7386709','extant','Medeltida sockenkyrka (ombyggd på 1800-talet). Runstenar hör till kyrkan.'],
 ['Sankt Bodils Kirke','Bodilsker sogn',55.0619,15.0728,'Q7592673','extant','Romansk medeltidskyrka (1200-tal) i Bodilsker. Runstenar hör till kyrkan.'],
 ['Østermarie kirkeruin','Østermarie sogn',55.1380,15.0161,'Q26257987','destroyed','Ruin efter Østermaries medeltida sockenkyrka (torn bevarat); ersatt av ny kyrka 1891. Runstenar hör till platsen.'],
 ['Sankt Ibs Kirke','Ibsker sogn',55.1171,15.1047,'Q3376739','extant','Romansk medeltidskyrka (1100-tal), Ibsker.'],
 ['Ruts Kirke','Rutsker sogn',55.2152,14.7501,'Q7382841','extant','Bornholms högst belägna kyrka — romansk medeltidskyrka (1100-tal), Rutsker.'],
 ['Sankt Peders Kirke','Pedersker sogn',55.0267,14.9765,'Q7595220','extant','Romansk medeltidskyrka (1100-tal), Pedersker.'],
 ['Sankt Knuds Kirke','Knudsker sogn',55.1069,14.7520,'Q7592751','extant','Romansk medeltidskyrka (1100-tal), Knudsker.'],
 ['Sankt Pouls Kirke','Poulsker sogn',55.0228,15.0404,'Q7595115','extant','Romansk medeltidskyrka (1200-tal), Poulsker.'],
];

let ins=0, skip=0;
for(const [name,parish,lat,lng,qid,existence,desc] of CH){
  const uri='https://www.wikidata.org/wiki/'+qid;
  const sql=`INSERT INTO heritage_sites
    (raa_type,name,landscape,municipality,parish,lat,lng,period,description,source_uri,register_system,register_id,existence,context_state)
    VALUES ('kyrka',$1,'Bornholm','Bornholm',$2,$3,$4,'Medeltid (1100–1200-tal)',$5,$6,'wikidata',$7,$8,'unassessed')
    ON CONFLICT (source_uri) DO NOTHING`;
  if(APPLY){
    const r=await c.query(sql,[name,parish,lat,lng,desc,uri,qid,existence]);
    if(r.rowCount>0){ins++;} else {skip++;}
    console.log(`${r.rowCount>0?'+':'·'} ${name} (${qid})`);
  } else {
    console.log(`DRY  ${name} — ${parish} (${lat},${lng}) ${qid}`);
  }
}
if(APPLY){
  const tot=await c.query(`SELECT count(*) n FROM heritage_sites WHERE raa_type='kyrka' AND landscape='Bornholm'`);
  console.log(`\ninsatta: ${ins}, hoppade (fanns): ${skip}. Bornholm-kyrkor i heritage_sites nu: ${tot.rows[0].n}`);
} else {
  console.log(`\n(${CH.length} kyrkor — kör med --apply för att skriva)`);
}
await c.end();
