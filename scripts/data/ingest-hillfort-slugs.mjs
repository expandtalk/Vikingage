import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const slugify=(s)=>(s||'').toLowerCase()
  .replace(/å|ä/g,'a').replace(/ö/g,'o').replace(/é|è|ê/g,'e').replace(/ü/g,'u').replace(/ø/g,'o').replace(/æ/g,'ae')
  .normalize('NFKD').replace(/[̀-ͯ]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/-{2,}/g,'-');
await c.query(`alter table swedish_hillforts add column if not exists slug text`);
await c.query(`create unique index if not exists swedish_hillforts_slug_key on swedish_hillforts(slug) where slug is not null`);
const rows=(await c.query(`select id, name from swedish_hillforts order by name`)).rows;
const used=new Set((await c.query(`select slug from swedish_hillforts where slug is not null`)).rows.map(r=>r.slug));
let n=0;
for(const r of rows){
  // hoppa om redan satt
  const cur=(await c.query(`select slug from swedish_hillforts where id=$1`,[r.id])).rows[0].slug;
  if(cur) continue;
  let base=slugify(r.name)||'borg'; let s=base, i=2;
  while(used.has(s)) s=`${base}-${i++}`;
  used.add(s);
  await c.query(`update swedish_hillforts set slug=$1 where id=$2`,[s,r.id]);
  n++;
}
console.log('slugs satta:',n,'/',rows.length);
console.log('Birkaborgen slug:', (await c.query(`select slug from swedish_hillforts where name ilike 'birkaborgen'`)).rows[0]?.slug);
console.log('null-slugs kvar:', (await c.query(`select count(*) n from swedish_hillforts where slug is null`)).rows[0].n);
await c.end();
