-- P4.1: Satellit-integration (docs/kunskapsgraf-arkitektur.md §P4, ontology §1b).
-- Läsningar/tolkningar/översättningar ur rundata → "syns på flera sätt" blir verkligt,
-- och FTS-indexeringen (P4.2) får hela materialet, inte bara P-projektionen.
--  * readings: publika tabellen fanns (tom, ren uuid-form) → fylls via bryggan.
--  * interpretations: fanns inte alls → skapas ren (uuid, FK, RLS).
--  * translations: legacy-bytea med 1 657 rader från ÄLDRE edition (0 id-överlapp,
--    1 631 innehållsdubbletter) → toppas upp innehållsdeduperat på (inskrift, språk, text).
-- Idempotent.

begin;

-- ---------- 1. readings (7 043 i staging) ----------
insert into public.readings (id, inscription_id, reading_type, text, tei_text, rundata_readingid)
select rr.readingid, r.id, rr.reading, rr.text, rr.teitext, rr.readingid::text
from rundata_raw.readings rr
join rundata_raw.inscriptions i on i.inscriptionid = rr.inscriptionid
join public.runic_inscriptions r on r.rundata_objectid = i.objectid
on conflict (id) do nothing;

-- ---------- 2. interpretations (ny tabell; 10 117 i staging) ----------
create table if not exists public.interpretations (
  id uuid primary key,
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  version text,           -- rundata-version (P/Q/R/S)
  text text,
  tei_text text,
  language text,
  source_ref text not null default 'rundata 2020-11-29 (interpretations)',
  created_at timestamptz not null default now()
);
create index if not exists interpretations_inscription_idx on public.interpretations(inscription_id);
alter table public.interpretations enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename='interpretations' and policyname='Public read interpretations') then
    create policy "Public read interpretations" on public.interpretations for select using (true);
    create policy "Admin write interpretations" on public.interpretations for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

insert into public.interpretations (id, inscription_id, version, text, tei_text, language)
select ri.interpretationid, r.id, ri.interpretation, ri.text, ri.teitext, ri.language
from rundata_raw.interpretations ri
join rundata_raw.inscriptions i on i.inscriptionid = ri.inscriptionid
join public.runic_inscriptions r on r.rundata_objectid = i.objectid
on conflict (id) do nothing;

-- ---------- 3. translations: innehållsdeduperad upptoppning (8 508 i staging) ----------
insert into public.translations (translationid, inscriptionid, translation, text, teitext, language)
select
  decode(replace(rt.translationid::text, '-', ''), 'hex'),
  decode(replace(r.id::text, '-', ''), 'hex'),
  rt.translation, rt.text, rt.teitext, rt.language
from rundata_raw.translations rt
join rundata_raw.inscriptions i on i.inscriptionid = rt.inscriptionid
join public.runic_inscriptions r on r.rundata_objectid = i.objectid
where not exists (
  select 1 from public.translations pt
  where pt.inscriptionid = decode(replace(r.id::text, '-', ''), 'hex')
    and pt.language = rt.language
    and pt.text = rt.text
)
on conflict do nothing;

commit;
