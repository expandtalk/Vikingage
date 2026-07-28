import pg from 'pg';import{readFileSync,writeFileSync}from'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const rows=(await c.query(`select id,patron_saint,dedication_era,dedication_source from ecclesiastical_sites where patron_saint is not null order by id`)).rows;
let sql=`-- Patrocinium (Daniel): helgondedikation som metod för att hitta moderkyrkan/grundläggningen per härad.
-- Tidiga inhemska helgon (Sigfrid/Eskil/Botvid) + kungliga (Olof d.1030/Knut) = tidig grundläggning.
-- patron_saint extraherat ur "Sankt X"-namnform (namnet = dedikationen); dedication_era-klassning ur
-- svensk kyrkohistoria. Wikidata P825 var TOMT för svenska kyrkor → ingen massimport, inget påhittat.
-- Full patrocinium (de utan "Sankt"-namn) kräver Det medeltida Sverige/Sveriges kyrkor (manuellt).
alter table public.ecclesiastical_sites
  add column if not exists patron_saint text, add column if not exists dedication_era text, add column if not exists dedication_source text;
begin;
`;
for(const r of rows) sql+=`update public.ecclesiastical_sites set patron_saint=${r.patron_saint?`'${r.patron_saint.replace(/'/g,"''")}'`:'null'}, dedication_era=${r.dedication_era?`'${r.dedication_era}'`:'null'}, dedication_source=${r.dedication_source?`'${r.dedication_source.replace(/'/g,"''")}'`:'null'} where id='${r.id}';\n`;
sql+=`commit;

-- Moderkyrka/grundläggnings-kandidat per härad: tidigaste patron-era, sen äldst byggår.
create or replace view public.v_mother_church_candidate as
  with ranked as (select name,landscape,parish,hundred_id,patron_saint,dedication_era,built_from,
    case dedication_era when 'tidig_inhemsk' then 1 when 'tidig_kunglig' then 2 when 'medel_kunglig' then 3
      when 'universell' then 4 when 'senmedeltida' then 6 else 5 end era_rank
    from public.ecclesiastical_sites where kind in ('parish_church','chapel','monastery') and hundred_id is not null)
  select distinct on (hundred_id) hundred_id,name,parish,patron_saint,dedication_era,built_from
  from ranked order by hundred_id, era_rank asc, built_from asc nulls last;
`;
writeFileSync('supabase/migrations/20260728700000_patrocinium.sql',sql);
console.log('Migration:',rows.length,'patron-rader + vy');
await c.end();
