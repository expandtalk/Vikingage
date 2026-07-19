-- ============================================================================
-- Flytta felimporterade "ristare" (attributionsanteckningar) från carvers
-- till rätt hemvist: inskriften de handlar om.
--
-- Bakgrund: 137 rader i public.carvers är inte ristare utan attributions-
-- hypoteser av typen "Samma som gjort DR 155", "Ovan ristare.",
-- "tillsammans med Livsten". De har hamnat som pseudo-ristare vid en trasig
-- import. Informationen har dock värde: varje post är en per-inskrift-notering
-- om att stenen (den post-länken pekar på) ristats av samma anonyma hand som
-- vissa andra signa. Se exports/carvers-attribution-cleanup.csv för full lista.
--
-- Denna migration:
--   1. Skapar public.inscription_attributions (strukturerad "samma hand"-data).
--   2. Skapar public.import_attribution_staging (bevarar oupplösta noter).
--   3. Nivå A (~49): flyttar noter vars källinskrift finns i runic_inscriptions.
--   4. "tillsammans med Livsten" (2 länkar): skapar äkta carver_inscription
--      mot Livsten-posten.
--   5. Nivå B + C (~87): bevarar texten i staging för senare reconcile
--      (kräver den bredare rundata-re-importen).
--   6. Tar bort de 137 pseudo-ristarna + deras carver_inscription-länkar
--      FÖRST efter att informationen bevarats.
--
-- Ingen information raderas — den flyttas. Kör mot branch och granska
-- radantal (kommentarerna nedan anger förväntat utfall) innan merge till main.
--
-- Bytea-brygga (jfr get_carver_inscriptions): carver_inscription.carverid och
-- .inscriptionid är bytea = hex av uuid utan bindestreck.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Måltabeller
-- ---------------------------------------------------------------------------
create table if not exists public.inscription_attributions (
  id             uuid primary key default gen_random_uuid(),
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  kind           text not null default 'same_hand'
                   check (kind in ('same_hand','reading_history','skill_note','imitation','ornament','other')),
  note_sv        text not null,
  related_signa  text[],          -- best-effort/framtida: strukturerade målsigna (note_sv är auktoritativ)
  certainty      boolean,         -- true = säker attribuering, false = "troligen/eventuellt"
  source_ref     text,
  created_at     timestamptz not null default now()
);

comment on table public.inscription_attributions is
  'Attributionsanteckningar per inskrift (t.ex. "ristad av samma anonyma hand som DR 155"). Flyttad från felimporterade carvers-poster 2026-07 (Källström 2007 / SRD).';
comment on column public.inscription_attributions.related_signa is
  'Best-effort strukturerade målsigna. note_sv är källan. Parsning är ett uppföljningsjobb.';

create index if not exists inscription_attributions_inscription_id_idx
  on public.inscription_attributions (inscription_id);

create table if not exists public.import_attribution_staging (
  id                   uuid primary key default gen_random_uuid(),
  original_carver_name text not null,      -- den felimporterade "ristar"-strängen
  note_text            text not null,
  related_signa        text[],
  link_count           integer not null default 0,
  tier                 text,               -- B_source_missing | C_orphan
  resolved             boolean not null default false,
  created_at           timestamptz not null default now()
);

comment on table public.import_attribution_staging is
  'Oupplösta attributionsnoter (källinskrift ej i runic_inscriptions, eller helt olänkade). Reconcile efter rundata-re-import. Innehåller permutations-artefakter (t.ex. U 1015/1017-1024-familjen) som ska dedupas vid reconcile.';

-- ---------------------------------------------------------------------------
-- 2. Identifiera de 137 pseudo-ristarna (samma predikat som analysen)
-- ---------------------------------------------------------------------------
-- OBS: vanlig (ej temporär) scratch-tabell — vissa SQL-körare (Supabase-editorn,
-- delade migrations-runners) kör satser i separata sessioner, och en TEMP-tabell
-- skulle då försvinna mellan satserna ("relation _pseudo_carvers does not exist").
-- En vanlig tabell överlever; den droppas explicit i slutet.
drop table if exists public._pseudo_carvers;
create table public._pseudo_carvers as
select id, name
from public.carvers
where name ilike 'Samma som%'         or name ilike 'Samma ristare%'
   or name ilike 'Troligen samma%'    or name ilike 'Troligen samme%'
   or name ilike 'Eventuellt samma%'  or name ilike 'Förmodligen samma%'
   or name ilike 'Antagligen samma%'  or name ilike 'Imitation av%'
   or name ilike 'Visar vissa likheter%' or name ilike 'Tidigare tolkad%'
   or name ilike 'En ovan%'           or name ilike 'En van%'
   or name ilike 'Ovan ristare%'      or name ilike 'tillsammans med%'
   or name ilike 'Troligen samma ornamentik%';

-- Säkerhetsspärr: förväntat 137. Avbryt om urvalet drivit iväg.
do $$
declare n integer;
begin
  select count(*) into n from _pseudo_carvers;
  if n < 130 or n > 145 then
    raise exception 'Oväntat antal pseudo-ristare: % (förväntat ~137). Avbryter.', n;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Nivå A: flytta noter vars källinskrift finns i runic_inscriptions
--    Förväntat: ~49 rader (47 same_hand + 1 reading_history + 1 skill_note)
-- ---------------------------------------------------------------------------
insert into public.inscription_attributions
  (inscription_id, kind, note_sv, certainty, source_ref)
select
  ri.id,
  case
    when p.name ilike 'Tidigare tolkad%' then 'reading_history'
    when p.name in ('En ovan och osäker ristare.',
                    'En van och konstnärligt framstående ristare.',
                    'Ovan ristare.','Visar vissa likheter med U') then 'skill_note'
    when p.name ilike 'Imitation%'                then 'imitation'
    when p.name ilike 'Troligen samma ornamentik%' then 'ornament'
    else 'same_hand'
  end,
  p.name,
  ci.certainty,
  'Källström 2007 / SRD (flyttad från felimporterad carvers-post)'
from _pseudo_carvers p
join public.carver_inscription ci
  on encode(ci.carverid,'hex') = replace(p.id::text,'-','')
join public.runic_inscriptions ri
  on lower(encode(ci.inscriptionid,'hex')) = lower(replace(ri.id::text,'-',''))
where p.name not ilike 'tillsammans med%';

-- ---------------------------------------------------------------------------
-- 4. "tillsammans med Livsten": skapa äkta carver_inscription mot Livsten.
--    Behåller samma inscriptionid (bytea) som pseudo-länken pekade på.
--    Livsten = e27ee1ba-4893-4b04-8dd4-9418df15dcd8
-- ---------------------------------------------------------------------------
insert into public.carver_inscription
  (carverinscriptionid, carverid, inscriptionid, attribution, certainty, notes, lang)
select
  decode(replace(gen_random_uuid()::text,'-',''),'hex'),
  decode(replace('e27ee1ba-4893-4b04-8dd4-9418df15dcd8','-',''),'hex'),
  ci.inscriptionid,
  ci.attribution,
  ci.certainty,
  'Samsignerad tillsammans med Livsten (flyttad från felimporterad carvers-post)',
  coalesce(ci.lang,'sv')
from _pseudo_carvers p
join public.carver_inscription ci
  on encode(ci.carverid,'hex') = replace(p.id::text,'-','')
where p.name ilike 'tillsammans med%'
  and not exists (   -- undvik dubblett om Livsten redan är länkad till inskriften
    select 1 from public.carver_inscription lv
    where lv.inscriptionid = ci.inscriptionid
      and encode(lv.carverid,'hex') = replace('e27ee1ba-4893-4b04-8dd4-9418df15dcd8','-','')
  );

-- ---------------------------------------------------------------------------
-- 5. Nivå B + C: bevara oupplösta noter i staging.
--    Förväntat: ~87 rader (15 B utan Livsten + 72 C).
-- ---------------------------------------------------------------------------
insert into public.import_attribution_staging
  (original_carver_name, note_text, link_count, tier)
select
  p.name,
  p.name,
  coalesce(lc.link_count,0),
  case when coalesce(lc.link_count,0) > 0 then 'B_source_missing' else 'C_orphan' end
from _pseudo_carvers p
left join lateral (
  select count(*) as link_count
  from public.carver_inscription ci
  where encode(ci.carverid,'hex') = replace(p.id::text,'-','')
) lc on true
where p.name not ilike 'tillsammans med%'
  and not exists (   -- ej redan flyttad som nivå A
    select 1
    from public.carver_inscription ci
    join public.runic_inscriptions ri
      on lower(encode(ci.inscriptionid,'hex')) = lower(replace(ri.id::text,'-',''))
    where encode(ci.carverid,'hex') = replace(p.id::text,'-','')
  );

-- ---------------------------------------------------------------------------
-- 6. Städa: ta bort pseudo-ristarnas länkar och själva posterna.
--    (Livsten-länkarna i steg 4 har carverid=Livsten och överlever.)
-- ---------------------------------------------------------------------------
delete from public.carver_attributes ca
using _pseudo_carvers p
where ca.carver_id = p.id;

delete from public.carver_inscription ci
using _pseudo_carvers p
where encode(ci.carverid,'hex') = replace(p.id::text,'-','');

delete from public.carvers c
using _pseudo_carvers p
where c.id = p.id;

-- ---------------------------------------------------------------------------
-- 7. RLS: publik läsning, admin skriver (samma mönster som övriga tabeller)
-- ---------------------------------------------------------------------------
alter table public.inscription_attributions   enable row level security;
alter table public.import_attribution_staging enable row level security;

drop policy if exists "inscription_attributions public read" on public.inscription_attributions;
create policy "inscription_attributions public read"
  on public.inscription_attributions for select using (true);

drop policy if exists "inscription_attributions admin write" on public.inscription_attributions;
create policy "inscription_attributions admin write"
  on public.inscription_attributions for all
  using (public.is_admin()) with check (public.is_admin());

-- Staging är intern kurering: endast admin läser/skriver.
drop policy if exists "import_attribution_staging admin all" on public.import_attribution_staging;
create policy "import_attribution_staging admin all"
  on public.import_attribution_staging for all
  using (public.is_admin()) with check (public.is_admin());

grant select on public.inscription_attributions to anon, authenticated;
grant all    on public.inscription_attributions to authenticated;
grant all    on public.import_attribution_staging to authenticated;

-- Städa scratch-tabellen.
drop table if exists public._pseudo_carvers;

commit;
