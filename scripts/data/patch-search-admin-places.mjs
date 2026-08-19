// Fasta sidor för administrativa platser: registrerar Sveriges 290 kommuner + 21 län som sökbara
// entiteter (municipality/county) i rebuild_search_document_x ur admin_boundaries, så en sökning på
// t.ex. "Oskarshamn" ger en EXAKT träff (inte "ingen exakt träff" bredvid kunskapsnoden). Landskap
// (landscape) fanns redan. Infogar även Visby-content_page (historikerns källbelagda förslag).
// Idempotent. Kör: node scripts/data/patch-search-admin-places.mjs
import fs from 'fs'; import pg from 'pg';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();
let d=(await c.query(`select pg_get_functiondef(oid) d from pg_proc where proname='rebuild_search_document_x'`)).rows[0].d;
const blocks = [
  ['municipality', `admin_boundaries ab where ab.level='kommun' and ab.name is not null and (p_id is null or md5('municipality:'||ab.code)::uuid = p_id)`, "'kommun','Sverige'", 'kommun Sverige','municipality Sweden'],
  ['county', `admin_boundaries ab where ab.level='lan' and ab.name is not null and (p_id is null or md5('county:'||ab.code)::uuid = p_id)`, "'län','Sverige'", 'län region Sverige','county region Sweden'],
];
for (const [t, from, sub, bsv, ben] of blocks) {
  if (d.includes(`p_type = '${t}'`)) { console.log(`${t} finns`); continue; }
  const block=`
  if p_type is null or p_type = '${t}' then
    insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
    select '${t}', md5('${t}:'||ab.code)::uuid, ab.name, concat_ws(' · ', ${sub}),
      concat_ws(' ', ab.name, '${bsv}'), concat_ws(' ', ab.name, '${ben}')
    from ${from};
  end if;
`;
  d = d.replace(/end\s*\$function\$\s*$/, block+'\nend $function$\n');
  console.log(`${t}-block injicerat`);
}
await c.query(d);
await c.query(`select rebuild_search_document('municipality')`);
await c.query(`select rebuild_search_document('county')`);
console.log('municipality:', (await c.query(`select count(*) n from search_document where entity_type='municipality'`)).rows[0].n, '| county:', (await c.query(`select count(*) n from search_document where entity_type='county'`)).rows[0].n);

// Visby content_page (historikerns källbelagda teaser; Wikidata P625 57.6290/18.3071)
const tsv='Visby på Gotland växte fram under 1100-talet och blev under medeltiden en av Östersjöns ledande köpmannastäder och en central plats i Hansan. Staden styrdes av ett tyskt-gutniskt dubbelråd och fick en egen stadslag på 1300-talet. Innanför ringmuren står idag domkyrkan S:ta Maria (från 1225) tillsammans med ett tiotal kyrkoruiner.';
const ten='Visby on Gotland grew up during the 12th century and became one of the leading merchant towns of the Baltic and a key place in the Hanseatic network. The town was governed by a joint German–Gutnish council and had its own town law by the 14th century. Within the ring wall stand today the cathedral of St Mary (from 1225) and around a dozen church ruins.';
await c.query(`insert into content_pages (slug,url,title_sv,title_en,kind,teaser_sv,teaser_en,geom,priority)
  values ('visby','/sv/visby','Visby','Visby','place',$1,$2, ST_SetSRID(ST_MakePoint(18.3071,57.6290),4326), 60)
  on conflict (slug) do update set teaser_sv=excluded.teaser_sv, teaser_en=excluded.teaser_en, geom=excluded.geom, url=excluded.url`, [tsv, ten]);
await c.query(`select rebuild_search_document('content_page')`);
console.log('Visby content_page infogad + registrerad.');
await c.end();
