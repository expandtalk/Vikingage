import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(s,p)=>(await c.query(s,p)).rows;
// Birka-fynd, Stockholms läns museum, foto Alf Nordström, CC BY. Bild-URL:er = og:image från
// DigitaltMuseums artefaktsidor (auktoritativ bild↔artefakt-koppling). Hotlänkas, rehostas ej.
const items=[
  {img:'019EGGisso2tp', dimu:'0210114020005', title:'Birka — vikingatida spelpjäser i glas', year:1962},
  {img:'019EGGisso2yE', dimu:'0210114020006', title:'Birka — frisiska kannor och rhenländskt glas', year:1964},
  {img:'019EGGisso2yJ', dimu:'0210114020007', title:'Birka — Birkamynt', year:1962},
];
for(const it of items){
  const url=`https://ems.dimu.org/image/${it.img}?dimension=1600x1600`;
  const thumb=`https://ems.dimu.org/image/${it.img}?dimension=400x400`;
  if((await q(`select 1 from historical_depictions where image_url like $1`,[`%${it.img}%`])).length){ console.log('finns:', it.title); continue; }
  await q(`insert into historical_depictions
    (subject_type,title,place_name,province,image_url,thumb_url,artist,year,license_code,source_institution,source_url,lat,lng)
    values ('other',$1,'Birka','Uppland',$2,$3,'Alf Nordström',$4,'CC BY','Stockholms läns museum',$5,59.336,17.545)`,
    [it.title, url, thumb, it.year, `https://digitaltmuseum.org/${it.dimu}/birka`]);
  console.log('✅', it.title);
}
console.log('\nimages_for_query(Birka):', (await q(`select category, count(*) n from images_for_query('Birka',40) group by category`)).map(r=>r.category+':'+r.n).join(', '));
await c.end();
