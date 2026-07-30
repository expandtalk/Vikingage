-- INTEROP steg 1: delade stabila identifierare (join-nycklar mot externa auktoriteter).
-- Låter andra forskares data/AI aligna på samma URI för samma entitet (Wikidata = globalt nav,
-- RAÄ/kulturarvsdata = svensk arkeologis auktoritet, GeoNames/Pleiades/VIAF/PeriodO m.fl.).
create table if not exists external_ids (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null,      -- 'heritage_sites','elite_monuments','viking_cities','trade_route_points','runic_inscriptions'…
  entity_id text not null,         -- radens id (uuid/text)
  scheme text not null,            -- 'wikidata' | 'raa_lamning' | 'geonames' | 'pleiades' | 'viaf' | 'periodo'
  identifier text not null,        -- 'Q40415', 'raa/lamning/…'
  uri text,                        -- fullt resolverbar URI
  confidence text default 'säker', -- säker | trolig | osäker
  source text,
  created_at timestamptz default now(),
  unique (entity_table, entity_id, scheme, identifier)
);
create index if not exists external_ids_entity_idx on external_ids(entity_table, entity_id);
create index if not exists external_ids_scheme_idx on external_ids(scheme, identifier);

alter table external_ids enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='external_ids' and policyname='external_ids_read') then
    create policy external_ids_read on external_ids for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename='external_ids' and policyname='external_ids_write') then
    create policy external_ids_write on external_ids for all using (is_admin()) with check (is_admin()); end if;
end $$;

-- Backfill: RAÄ-lämnings-URI:er ur heritage_sites.source_uri (tusentals verifierade join-nycklar).
insert into external_ids (entity_table, entity_id, scheme, identifier, uri, source)
select 'heritage_sites', id::text, 'raa_lamning', source_uri, 'https://' || source_uri, 'heritage_sites.source_uri'
from heritage_sites
where source_uri is not null and source_uri ~ 'raa/lamning'
on conflict (entity_table, entity_id, scheme, identifier) do nothing;
