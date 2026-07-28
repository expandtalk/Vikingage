// Seeda ortnamn_element_hits med Ångermanlands träffar (per led + namn + koord + near_node).
// Speglar ledparserns CULT-regexar. Idempotent (unique + ON CONFLICT via delete+insert per region).
import pg from 'pg';import{readFileSync}from'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const CULT=[['tor',/^tors[a-zäåö]/],['frö',/^(frös|frö|frey|frej|frea|fröj)/],['sal',/^sal(a|o|e|u)/],['ross',/^(ross|hross|hors)[a-zäåö]/],['vang',/^vang/],['stav',/^stav[a-zäåö]/],['hov',/^hov[a-zäåö]/],['härn',/^härn/],['gull',/^gull/],['katt',/^katt[a-zäåö]/],['val',/^val(?!l)[a-zäåö]/],['ed',/^eds[a-zäåö]/],['hammar',/^hammar/],['horn',/^horn[a-zäåö]/],['mor',/^mora?[a-zäåö]/],['lund',/^lund/],['tuna',/^tuna/],['var',/^var(?!a)[a-zäåö]/],['skade',/^skade/],['hel',/^hel(?!s)[a-zäåö]/],['oden',/^od[ei]n/],['galt',/^galt/],['get',/^get[a-zäåö]/],['gås',/^gås/]];
const hav=(a,b,d,e)=>{const R=6371,r=Math.PI/180,dφ=(d-a)*r,dλ=(e-b)*r,x=Math.sin(dφ/2)**2+Math.cos(a*r)*Math.cos(d*r)*Math.sin(dλ/2)**2;return 2*R*Math.asin(Math.sqrt(x));};
const region='Ångermanland', bbox=[62.20,64.00,15.00,19.00];
const cps=(await c.query(`select lat,lng from central_places where name = any($1) and lat is not null`,[['Nora','Torsåker','Härnösand–Säbrå']])).rows;
const pn=(await c.query(`select name,lat,lng from place_names where lat between $1 and $2 and lng between $3 and $4 and lat is not null`,bbox)).rows;
await c.query(`delete from ortnamn_element_hits where region=$1`,[region]);
let n=0;
for(const p of pn){
  const nm=p.name.toLowerCase();
  const near=cps.some(cp=>hav(p.lat,p.lng,cp.lat,cp.lng)<=8);
  for(const [key,re] of CULT){
    if(re.test(nm)){
      await c.query(`insert into ortnamn_element_hits (region,element_key,place_name,lat,lng,near_node) values ($1,$2,$3,$4,$5,$6) on conflict do nothing`,[region,key,p.name,p.lat,p.lng,near]);
      n++;
    }
  }
}
console.log(`Seedade ${n} träffar för ${region}.`);
console.log('Per led:',(await c.query(`select element_key, count(*) tot, count(*) filter(where near_node) nara from ortnamn_element_hits where region=$1 group by 1 order by 2 desc`,[region])).rows.map(r=>`${r.element_key}:${r.tot}(${r.nara}nära)`).join(' '));
await c.end();
