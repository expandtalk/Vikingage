-- Runbleck: klassificerare (som is_runestone) + analys-satellit. Se QA-uppgift #17.
-- Runbleck/amuletter = inskrivna metall-/ben-/träbleck och amuletter (ej resta stenmonument).
-- ~150 st i runic_inscriptions (Bleck 41, Runbleck 14, Bleck(amulett) 15, blybleck 4, Amulett 57 m.fl.).
-- Definition (dokumenterad, källkritisk): object_type ILIKE '%bleck%' OR '%amulet%'.
-- MEDVETET: 'Skidmunbleck (svärd/dolk)' (svärdsbeslag) fångas av %bleck% men är gränsfall —
-- flaggas i runbleck_analysis vid kurering, ej exkluderat i predikatet (konservativt inkluderande).

begin;

create or replace function public.is_runbleck(p_object_type text)
returns boolean language sql immutable as $$
  select p_object_type ilike '%bleck%' or p_object_type ilike '%amulet%';
$$;
comment on function public.is_runbleck(text) is
  'Sant om object_type anger ett runbleck/amulett (inskrivet metall-/ben-/träbleck, ej rest stenmonument). Se migration 20260728210000.';

create or replace function public.count_runbleck()
returns integer language sql stable as $$
  select count(*)::int from runic_inscriptions where public.is_runbleck(object_type);
$$;
comment on function public.count_runbleck() is 'Antal runbleck/amuletter (se is_runbleck).';

grant execute on function public.is_runbleck(text) to anon, authenticated;
grant execute on function public.count_runbleck() to anon, authenticated;

-- Analys-satellit (1:1 med bleck-delen av runic_inscriptions). Fält Daniel efterfrågade +
-- material kopplar till metall-proveniens-domänen (metal_analyses på object_type='runic_inscription').
create table if not exists public.runbleck_analysis (
  id uuid primary key default gen_random_uuid(),
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  material text,            -- koppar | bly | silver | brons | guld | ben | trä | oklart
  charm_type text,          -- galder | besvärjelse | futhark_rad | kristet | namn | medicinskt | oklart
  folded boolean,           -- vikt/hopvikt (depositionsrit — vanligt för bleck)
  deposit_context text,     -- grav | boplats | kyrka | våtmark | lös | okänd
  reading_state text,       -- tolkad | delvis | otolkad
  preservation text,        -- komplett | fragment | korroderad …
  is_borderline boolean not null default false,  -- t.ex. svärdsbeslag som fångas av predikatet
  note text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inscription_id)
);
create index if not exists runbleck_analysis_material_idx on public.runbleck_analysis(material);

alter table public.runbleck_analysis enable row level security;
drop policy if exists runbleck_analysis_read on public.runbleck_analysis;
create policy runbleck_analysis_read on public.runbleck_analysis for select using (true);
drop policy if exists runbleck_analysis_write on public.runbleck_analysis;
create policy runbleck_analysis_write on public.runbleck_analysis for all using (public.is_admin()) with check (public.is_admin());

commit;

-- Kontroll: select public.count_runbleck();
