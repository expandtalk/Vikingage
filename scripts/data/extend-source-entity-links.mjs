// KANONISK ren ombyggnad av forskarverk→entitet-länkarna (predicate 'studies').
// Deterministisk: (1) rensa alla 'studies'-länkar, (2) explicit Runstenar-koncept, (3) PRECIS
// auto-match mot distinkta entitetstyper. Precision före täckning: label ≥ 5, ordgräns (\m…\M),
// max 3/verk, utgivningsorter + vida geo-labels blockerade. Idempotent (kör om → samma resultat).
// (Ersätter piloten i build-source-entity-links.mjs; tabellen + RPC-patchen där behålls.)
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

// Utgivningsorter (står i bibliografiska titlar → falska "studerar"-länkar) + för vida geo-labels.
const block = [
  'sverige','norden','skandinavien','svealand','götaland','europa','norge','danmark','finland','island','ryssland','baltikum','norrland',
  'stockholm','uppsala','lund','göteborg','malmö','london','oslo','bergen','köpenhamn','københavn','berlin','leipzig','neumünster','wiesbaden','tübingen','austin','helsinki','helsingfors','amsterdam','paris','wien','münchen','odense','trondheim','roskilde',
];

// (1) Ren nollställning
console.log('rensar alla studies-länkar:', (await c.query(`delete from source_entity_links where predicate='studies'`)).rowCount);

// (2) Runstenar-koncept (theme) explicit — runstensbibliografin
const runeId = (await c.query(`select id from entity_registry where lower(label)='runstenar' and entity_type='theme' limit 1`)).rows[0]?.id;
if (runeId) {
  const r = await c.query(`insert into source_entity_links (source_id, object_id, predicate)
    select s.sourceid, $1::uuid, 'studies' from sources s
    where s.title ~* '\\m(runsten|runstenar|runinskrift|runinskrifter|runristn)'
    on conflict (source_id, object_id) do nothing`, [runeId]);
  console.log('Runstenar-länkar:', r.rowCount);
}

// (3) Precis auto-match mot distinkta entitetstyper (inkl. city → Birka fångas här)
const ins = await c.query(`
insert into source_entity_links (source_id, object_id, predicate)
select source_id, object_id, 'studies' from (
  select s.sourceid as source_id, er.id as object_id,
         row_number() over (partition by s.sourceid order by char_length(er.label) desc, er.entity_type) rn
  from sources s
  join entity_registry er
    on er.entity_type in ('landscape','city','town','god','king','dynasty','fortress','hillfort','estate')
   and char_length(er.label) >= 5
   and lower(er.label) <> all ($1::text[])
   and s.title ~* ('\\m' || regexp_replace(er.label, '([.^$*+?()\\[\\]{}|\\\\])', '\\\\\\1', 'g') || '\\M')
) t
where rn <= 3
on conflict (source_id, object_id) do nothing`, [block]);
console.log('auto-match-länkar:', ins.rowCount);

const total = (await c.query(`select count(*) n from source_entity_links`)).rows[0].n;
console.log('länkar totalt:', total);
const many = async (l, s, p) => { const r = await c.query(s, p); console.log('\n'+l); r.rows.forEach(x=>console.log('  ', JSON.stringify(x))); };
await many('per entity_type', `select er.entity_type, count(*) from source_entity_links sel join entity_registry er on er.id=sel.object_id group by 1 order by 2 desc`);
await many('STICKPROV', `select left(s.title,55) titel, er.label, er.entity_type from source_entity_links sel join sources s on s.sourceid=sel.source_id join entity_registry er on er.id=sel.object_id order by random() limit 18`);
for (const t of ['Birka','Gotland','Öland','Sigtuna','Uppland','Visby','Oden']) {
  const r = await c.query(`select jsonb_array_length((entity_answer_context($1))->'works') n`, [t]);
  console.log(`  ${t}.works =`, r.rows[0].n);
}
await c.end();
