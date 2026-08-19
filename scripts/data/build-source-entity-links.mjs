// Länklager forskarverk → entitet (KG-nativt). sources (Libris-verk, bytea-PK) kan inte ligga i
// relationship (uuid), så en parallell typad länktabell source_entity_links pekar på entity_registry
// (samma object_id-mönster som relationship). entity_answer_context får en 'works'-gren som ytar
// verken på entitetens svarssida ("Relaterad forskning"/verk). Pilot: Birka + runstenar.
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();
const run = async (label, sql, params) => { const r = await c.query(sql, params); console.log(label, r.rowCount ?? ''); return r; };

// 1) Länktabell (KG-edge för bytea-källor → entity_registry)
await run('table', `create table if not exists public.source_entity_links (
  id uuid primary key default gen_random_uuid(),
  source_id bytea not null references public.sources(sourceid) on delete cascade,
  object_id uuid not null references public.entity_registry(id) on delete cascade,
  predicate text not null default 'studies',
  created_at timestamptz not null default now(),
  unique (source_id, object_id)
)`);
await run('rls', `alter table public.source_entity_links enable row level security`);
await run('rls-read', `drop policy if exists sel_read on public.source_entity_links;
  create policy sel_read on public.source_entity_links for select using (true)`);
await run('rls-write', `drop policy if exists sel_write on public.source_entity_links;
  create policy sel_write on public.source_entity_links for all using (public.is_admin()) with check (public.is_admin())`);

// 2) KG-predikat 'studies' (källa studerar entitet) för koherens
await run('predicate', `insert into public.rel_predicates (code, label_sv, label_en, subject_type, object_type, description)
  values ('studies','studerar','studies','source','*','Vetenskapligt verk som behandlar/studerar entiteten (forskarbibliografi, ej primärkälla).')
  on conflict (code) do nothing`);

// 3) "Runstenar"-koncept i entity_registry (så plural/singular matchar via ILIKE p_name||'%')
const rune = await c.query(`select id from entity_registry where lower(label)='runstenar' limit 1`);
let runeId = rune.rows[0]?.id;
if (!runeId) {
  const r = await c.query(`insert into entity_registry (id, entity_type, label) values (gen_random_uuid(),'theme','Runstenar') returning id`);
  runeId = r.rows[0].id; console.log('skapade Runstenar-entitet', runeId);
} else console.log('Runstenar-entitet finns', runeId);

// 4) Populera länkar
const BIRKA = '5a2e82f0-911e-4fb2-83f9-29cef0e89cc4'; // entity_registry Birka (city)
await run('länka Birka-verk', `insert into source_entity_links (source_id, object_id, predicate)
  select s.sourceid, $1::uuid, 'studies' from sources s where s.title ilike '%birka%'
  on conflict (source_id, object_id) do nothing`, [BIRKA]);
await run('länka runsten-verk', `insert into source_entity_links (source_id, object_id, predicate)
  select s.sourceid, $1::uuid, 'studies' from sources s
  where s.title ilike '%runsten%' or s.title ilike '%runinskrift%' or s.title ilike '%runinskrifter%' or s.title ~* 'runor\\M'
  on conflict (source_id, object_id) do nothing`, [runeId]);
const cnt = await c.query(`select count(*) n from source_entity_links`); console.log('länkar totalt:', cnt.rows[0].n);

// 5) Patcha entity_answer_context: lägg till works-CTE + works-utdata (string-insertion på nuvarande def)
const def0 = (await c.query(`select pg_get_functiondef(p.oid) def from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='entity_answer_context' limit 1`)).rows[0].def;
if (def0.includes("'works',")) { console.log('RPC redan patchad — hoppar'); }
else {
  const WORKS_CTE = `works AS (
  SELECT s.title, coalesce(s.author,'') AS author, s.publication_year AS year, s.isbn, rs.name AS scholar
  FROM source_entity_links sel
  JOIN sources s ON s.sourceid = sel.source_id
  LEFT JOIN research_scholars rs ON rs.id = s.scholar_id
  JOIN entity_registry er ON er.id = sel.object_id
  WHERE lower(er.label) = lower(p_name) OR er.label ILIKE p_name || '%'
  ORDER BY s.publication_year DESC NULLS LAST
  LIMIT 20
),
`;
  let def = def0.replace('related AS (', WORKS_CTE + 'related AS (');
  const WORKS_OUT = `'works', (SELECT coalesce(jsonb_agg(jsonb_build_object('title',w.title,'author',w.author,'year',w.year,'isbn',w.isbn,'scholar',w.scholar) ORDER BY w.year DESC NULLS LAST),'[]'::jsonb) FROM works w),
  'count', (SELECT count(*) FROM ins)`;
  def = def.replace(`'count', (SELECT count(*) FROM ins)`, WORKS_OUT);
  if (!def.includes("'works',") || !def.includes('works AS (')) throw new Error('patch-anchor missade');
  await c.query(def);
  console.log('RPC patchad med works-gren');
}

// 6) Verifiera
for (const t of ['Birka','runstenar','runsten']) {
  const r = await c.query(`select jsonb_array_length((entity_answer_context($1))->'works') n, ((entity_answer_context($1))->'works'->0->>'title') ex`, [t]);
  console.log(`entity_answer_context('${t}').works =`, r.rows[0].n, '| ex:', r.rows[0].ex);
}
await c.end();
