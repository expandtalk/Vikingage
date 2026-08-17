-- Klick-logg för sök (cortiq-stil click-through-signal). STEG 1: samla data.
-- GDPR: RENT AGGREGAT — en räknare per (sökterm, entitet). INGET användar-id, ingen IP, ingen
-- session, inga per-klick-rader. Går inte att koppla till en individ → ej persondata.
-- Skrivs bara via SECURITY DEFINER-RPC; anon får EXECUTE, INGEN direkt tabellåtkomst (till skillnad
-- från search_gaps som av misstag gav anon full DML — vi upprepar inte det).
-- Rankningen (80% wiki / 20% klick) kopplas in i ett SENARE steg när data samlats.

create table if not exists public.search_click (
  term        text not null,
  entity_type text not null,
  entity_id   uuid not null,
  clicks      integer not null default 0,
  first_seen  date not null default current_date,
  last_seen   date not null default current_date,
  primary key (term, entity_type, entity_id)
);
comment on table public.search_click is
  'Aggregerad klick-signal för sök (GDPR: ingen individdata, bara räknare per term+entitet).';

-- Härledd klick-popularitet per entitet: summa klick över alla termer. Materialiseras vid behov
-- in i search_document.popularity-blandningen (80/20) i ett separat rankningssteg.
create index if not exists idx_search_click_entity on public.search_click (entity_type, entity_id);

-- RLS: ingen direkt åtkomst för anon/authenticated. All skrivning går genom RPC:n nedan.
alter table public.search_click enable row level security;
-- (Ingen policy = ingen rad-åtkomst för vanliga roller; SECURITY DEFINER-funktionen kringgår RLS.)

create or replace function public.log_search_click(p_term text, p_entity_type text, p_entity_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare t text := lower(btrim(p_term));
begin
  -- Validering: rimlig term, känd entitetstyp, giltig uuid. Ingen metadata sparas.
  if t is null or length(t) < 2 or length(t) > 60 then return; end if;
  if p_entity_type is null or length(p_entity_type) > 40 then return; end if;
  if p_entity_id is null then return; end if;
  insert into public.search_click (term, entity_type, entity_id, clicks)
  values (t, p_entity_type, p_entity_id, 1)
  on conflict (term, entity_type, entity_id)
    do update set clicks = search_click.clicks + 1, last_seen = current_date;
end $$;

comment on function public.log_search_click is
  'Anonym aggregat-loggning av ett sökklick (term→entitet). Ingen individdata. Anropas med anon-nyckel.';

-- Endast EXECUTE till klientrollerna — INGEN tabellåtkomst.
revoke all on function public.log_search_click(text, text, uuid) from public;
grant execute on function public.log_search_click(text, text, uuid) to anon, authenticated;
