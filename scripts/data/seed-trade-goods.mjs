// Varudimension (steg 4/2). Nordiskt perspektiv: export österut / import hem. Solidus-guldet
// kopplas som folkvandringstidens guldfas av östkontakten (evidens = coins-skatterna på Öland).
// Idempotent (slug + (route,good)). Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();

// [slug, namn, name_en, class, direction, era_from, era_to, beskrivning, evidence_note]
const GOODS=[
  ['pals','Päls & pälsverk','Furs','päls','export',750,1050,'Ekorre, mård, bäver, sobel från norr — nordisk toppexport österut','Nämns av arabiska geografer (Ibn Khordadbeh)'],
  ['jarn','Järn','Iron','järn','export',750,1100,'Svenskt myr-/bergsjärn, osmundar','Blästbruk i Mellansverige'],
  ['tral','Trälar','Thralls / slaves','människa','export',750,1050,'Slaver (saqaliba) — en av de mest lönsamma varorna österut','Ibn Fadlan beskriver Rus slavhandel vid Bulgar 922'],
  ['barnsten','Bärnsten','Amber','råvara','export',750,1100,'Baltisk bärnsten','—'],
  ['vapen','Svärd & vapen','Swords','redskap','export',800,1050,'Frankiska (ULFBERHT) och nordiska klingor i transit','—'],
  ['dirham','Islamiskt silver (dirham)','Islamic silver (dirhams)','ädelmetall','import',800,1000,'Abbasidiska/samanidiska dirhamer — silverflödet som fyller Gotlands och Mälardalens skatter','~700 silverskatter på Gotland; huvudartär = Volgavägen'],
  ['siden','Siden','Silk','lyxvara','import',800,1050,'Bysantinskt/österländskt siden','Fragment i Birka-gravar'],
  ['glas','Glas','Glass','lyxvara','import',750,1050,'Glasbägare och pärlor','Birka'],
  ['solidusguld','Solidus-guld (bysantinskt/romerskt)','Byzantine/Roman gold solidi','ädelmetall','import',394,550,'Folkvandringstidens guldfas av östkontakten — 400 år före vikingatidens silver. Präglade i Konstantinopel, Ravenna, Milano; die-länkad precisionsforskning (Fischer).','5 solidusskatter på ÖLAND i coins (Stora Brunneby, Björnhovda ×2, Åby/Sandby), 394–476 e.Kr.; en av Östersjöns största guldkoncentrationer'],
  ['sill','Sill & salt','Herring & salt','råvara','import',1150,1400,'Medeltida hansahandel (Valdemars segelleds era)','—'],
];
// route-slug -> [ [good-slug, direction, note] ]
const LINKS={
  'ostvagen':[['pals','export',null],['tral','export',null],['vapen','export',null],['barnsten','export',null],
    ['siden','import',null],['glas','import',null],
    ['solidusguld','import','Föregångarfas (folkvandringstid) — samma östliga guldström 400 år före vikingaledens silver']],
  'volgavagen':[['pals','export',null],['tral','export',null],['jarn','export',null],
    ['dirham','import','Huvudartären för islamiskt silver — Bulgar var dirham-marknaden']],
  'valdemar-segelled':[['sill','import','Medeltida hansavaror (annan epok än vikingaledernas)']],
};

try{
  await c.query('BEGIN');
  const gmap={};
  for(const [slug,name,en,cls,dir,ef,et,desc,ev] of GOODS){
    const {rows:[g]}=await c.query(`insert into trade_goods (slug,name,name_en,commodity_class,direction,era_from,era_to,description,evidence_note)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      on conflict (slug) do update set name=excluded.name,name_en=excluded.name_en,commodity_class=excluded.commodity_class,
        direction=excluded.direction,era_from=excluded.era_from,era_to=excluded.era_to,description=excluded.description,
        evidence_note=excluded.evidence_note returning id`,[slug,name,en,cls,dir,ef,et,desc,ev]);
    gmap[slug]=g.id;
  }
  let nl=0;
  for(const [rslug,links] of Object.entries(LINKS)){
    const {rows:[r]}=await c.query(`select id from trade_routes where slug=$1`,[rslug]);
    if(!r){ console.log('route saknas:',rslug); continue; }
    for(const [gslug,dir,note] of links){
      await c.query(`insert into route_goods (route_id,good_id,direction,note) values ($1,$2,$3,$4)
        on conflict (route_id,good_id) do update set direction=excluded.direction, note=excluded.note`,
        [r.id,gmap[gslug],dir,note]);
      nl++;
    }
  }
  const sol=(await c.query(`select count(*)::int n from coins where denomination ilike '%solid%'`)).rows[0].n;
  console.log(`varor: ${GOODS.length}, route-kopplingar: ${nl}, solidus-mynt i coins (evidens): ${sol}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
