-- Avrättningshändelser (event-nivå) — bär TID + person/brott/bödel, pekar på plats (heritage_sites)
-- när den är känd. Löser "avrättningsplats vid en viss tid": platsen kan flytta, händelsen är daterad.
-- Källdisciplin: rotter.se och andra skyddade sammanställningar får ALDRIG massimporteras
-- (katalogskydd 49§ URL). Fakta är fria; uttryck bara PD/CC. source_rights dokumenterar kanalen.
create extension if not exists postgis;

create table if not exists execution_events (
  id               uuid primary key default gen_random_uuid(),
  site_id          uuid references heritage_sites(id) on delete set null,  -- avrättningsplatsen om matchad
  executed_person  text,
  person_age       int,
  home_place       text,               -- avrättades hemort (by/socken)
  crime            text,               -- mord, dråp, barnamord, tidelag, häxeri, blodskam, stöld ...
  method           text,               -- halshuggning, hängning, rådbråkning, bränning, stegling ...
  event_date       date,               -- exakt datum om känt
  event_year       int,                -- år när bara år är känt
  period           text,               -- fritext-epok om datum oklart
  place_name       text,               -- namngiven plats även utan site_id (t.ex. "Bägby galgbacke")
  parish           text,
  landscape        text,
  lat              double precision,
  lng              double precision,
  executioner      text,               -- bödel
  payment_amount   numeric,            -- bödelns betalning
  payment_currency text,
  participants     text,               -- medhjälpare/vittnen
  description      text,               -- eget referat, ALDRIG verbatim ur skyddad källa
  source_ref       text,               -- primärkälla (Riksarkivet-signum, tryckt verk)
  source_url       text,
  source_rights    text default 'facts_only',  -- 'CC0'|'PD'|'facts_only' (aldrig 'proprietary'-verbatim)
  wikidata_qid     text unique,        -- dedup mot Wikidata
  created_at       timestamptz default now(),
  geom geometry(Point,4326) generated always as (
    case when lat is not null and lng is not null then ST_SetSRID(ST_MakePoint(lng,lat),4326) end
  ) stored
);
create index if not exists execution_events_geom_idx on execution_events using gist(geom);
create index if not exists execution_events_site_idx on execution_events(site_id);
create index if not exists execution_events_year_idx on execution_events(event_year);

-- Blockera verbatim-uttryck ur skyddad källa (samma anda som source_texts-vakten).
create or replace function enforce_execution_source_rights() returns trigger as $$
begin
  if new.source_rights not in ('CC0','PD','facts_only','CC-BY','CC-BY-SA') then
    raise exception 'execution_events.source_rights=% ej tillåtet: fakta fritt, uttryck bara PD/CC', new.source_rights;
  end if;
  return new;
end $$ language plpgsql;
drop trigger if exists trg_execution_source_rights on execution_events;
create trigger trg_execution_source_rights before insert or update on execution_events
  for each row execute function enforce_execution_source_rights();

alter table execution_events enable row level security;
drop policy if exists execution_events_read on execution_events;
create policy execution_events_read on execution_events for select using (true);
drop policy if exists execution_events_write on execution_events;
create policy execution_events_write on execution_events for all using (is_admin()) with check (is_admin());
