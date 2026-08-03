-- Runiska titlar på runstenar: auditerbar belägg-tabell för kartlagret "Runiska titlar".
-- VERIFIERINGSPASS: bara standalone-ORD räknas (inte namnled, t.ex. -iarl i personnamn),
-- dräng breddas, goði UTESLUTS (kuþi/kuþa kolliderar med guð = Gud), bonde flaggas tvetydigt
-- (make/husbonde ~ jordägande bonde). Bär geografi (koord/landskap/land), materialstatus
-- (signerad-tillskriven verkstad / ornerad stilgrupp / kors) och kontext-snutt för granskning.
-- Källa: runic_inscriptions (Rundata/Evighetsrunor). HEURISTISKT verifierat — ej statistiskt bevis.

drop table if exists public.runic_title_occurrences cascade;
create table public.runic_title_occurrences (
  id uuid primary key default gen_random_uuid(),
  signum text,
  title_form text not null,
  label_sv text,
  rank_tier int,
  confidence text,
  verification text default 'standalone',
  context text,
  lat double precision, lng double precision,
  country text, province text, parish text,
  stone_name text,
  signed boolean, ornamented boolean, has_cross boolean,
  coord_confidence text,
  created_at timestamptz default now()
);

-- Sep-klass = runrad-skiljetecken/mellanslag; standalone = titel-ord, inte namnled.
with defs(on_form,label_sv,rank_tier,forms,confidence) as (values
  ('konungr','kung',1,'kunukʀ|kunuk|kununk|kunungʀ|konungr|konohr|kununkr','high'),
  ('jarl','jarl',2,'iarl|jarl|earl','medium'),
  ('goði','gode',3,'kuþi|kuþa','low'),
  ('þegn','thegn',3,'þiakn|þekn|þegn|þakn|þiagn|þiaikn','high'),
  ('drengR','dräng',4,'trik|triki|trak|traki|trekiʀ|trekʀ|trekir|drengʀ|dræng|treng','low'),
  ('bóndi','bonde',4,'buanta|bonta|bonti|buonti|boanta|bondi','medium'),
  ('hirð','hird',4,'hirþ|hirdman|hirþman|hiþman','high'),
  ('bryti','bryte',5,'bryti|bruti','high'),
  ('félagi','felage',5,'filaka|felaga|filak|felag|filaga|felagi','high'),
  ('gildi','gille',5,'kildi|gildi|kilta|gilda','medium'),
  ('skipari','skeppare',5,'skibara|skipara|skibari|skipari','high'),
  ('stýrimaðr','styrman',5,'sturiman|styriman|sturimanr','high'),
  ('þræll','träl',6,'þrel|þral|þræl|trel|tral','low'),
  ('frelsi','frigiven',6,'frelsi|frials|frels|laisiŋ|leysing|lesing','high')
)
insert into public.runic_title_occurrences
  (signum,title_form,label_sv,rank_tier,confidence,context,lat,lng,country,province,parish,stone_name,signed,ornamented,has_cross,coord_confidence)
select ri.signum, d.on_form, d.label_sv, d.rank_tier, d.confidence,
  substring(ri.transliteration from ('.{0,16}(^|[ [:space:]·:×+*¶/()\[\].,;])('||d.forms||')($|[ [:space:]·:×+*¶/()\[\].,;]).{0,10}')),
  case when ri.coordinates is not null then greatest(ri.coordinates[0],ri.coordinates[1]) end,
  case when ri.coordinates is not null then least(ri.coordinates[0],ri.coordinates[1]) end,
  ri.country, ri.province, ri.parish,
  coalesce(nullif(ri.name,''), (ri.also_known_as)[1]),
  (coalesce(nullif(ri.carver_attribution,''),nullif(ri.carver,'')) is not null),
  (ri.style_group is not null and ri.style_group <> ''),
  ri.has_cross,
  ri.coord_confidence
from public.runic_inscriptions ri
join defs d
  on ri.transliteration ~* ('(^|[ [:space:]·:×+*¶/()\[\].,;])('||d.forms||')($|[ [:space:]·:×+*¶/()\[\].,;])')
where ri.transliteration is not null and ri.transliteration <> '';

-- goði: guð-kollision (bönformler) → ut ur lagret, kräver manuell genomgång
delete from public.runic_title_occurrences where title_form='goði';

-- frigiven: word-boundary-fångst (DR 58 Hørning m.fl. missas av strikt standalone)
insert into public.runic_title_occurrences
  (signum,title_form,label_sv,rank_tier,confidence,verification,context,lat,lng,country,province,parish,stone_name,signed,ornamented,has_cross,coord_confidence)
select ri.signum,'frelsi','frigiven',6,'high','word-boundary',
  substring(ri.transliteration from '.{0,20}(frelsi|frials|frels).{0,20}'),
  case when ri.coordinates is not null then greatest(ri.coordinates[0],ri.coordinates[1]) end,
  case when ri.coordinates is not null then least(ri.coordinates[0],ri.coordinates[1]) end,
  ri.country,ri.province,ri.parish,coalesce(nullif(ri.name,''),(ri.also_known_as)[1]),
  (coalesce(nullif(ri.carver_attribution,''),nullif(ri.carver,'')) is not null),
  (ri.style_group is not null and ri.style_group<>''), ri.has_cross, ri.coord_confidence
from public.runic_inscriptions ri
where ri.transliteration ~* '(frelsi|frials|\yfrels)'
  and not exists (select 1 from public.runic_title_occurrences o where o.signum=ri.signum and o.title_form='frelsi');

-- bonde: flagga tvetydigheten make/husbonde ~ jordägande bonde
update public.runic_title_occurrences set confidence='ambiguous',
  verification='make/husbonde ~ jordägande bonde (tvetydig)' where title_form='bóndi';

-- RLS: publik läsning (projektkonvention)
alter table public.runic_title_occurrences enable row level security;
drop policy if exists "public read runic_title_occurrences" on public.runic_title_occurrences;
create policy "public read runic_title_occurrences" on public.runic_title_occurrences for select using (true);

create index if not exists runic_title_occ_form_idx on public.runic_title_occurrences(title_form);
create index if not exists runic_title_occ_tier_idx on public.runic_title_occurrences(rank_tier);

-- Berikningskolumner (jord/höjd/flytt) som titel-kartlagret (useRunicTitles) läser.
-- Fylls av analys-scripten (ingest-sgu-soil / ingest-elevation / ingest-original-soil). Nullbara.
alter table public.runic_title_occurrences add column if not exists jordart text;
alter table public.runic_title_occurrences add column if not exists fertility text;
alter table public.runic_title_occurrences add column if not exists elevation_m double precision;
alter table public.runic_title_occurrences add column if not exists moved_km double precision;
