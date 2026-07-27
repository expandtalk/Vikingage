-- Metaller & proveniens — Fas 2: beräknad matchning. Se docs/metaller-proveniens-design.md.
-- Rankar malmkällor efter numerisk isotop-överlappning (metal_analyses.value inom
-- ore_sources.isotope_signature-intervall). Analogt hypotestestar-RPC:erna (distance_stats m.fl.).
--
-- DISCIPLIN: utdata är ALLTID en BERÄKNAD HYPOTES, aldrig belagd proveniens. Numerisk överlappning
-- ≠ ursprung: (a) olika malmfält delar isotopfält geologiskt; (b) silver-Pb speglar bly, inte en
-- kopparmalm; (c) blandning/omsmältning suddar signaturen. Belagd proveniens = källförd sourced_from-
-- kant (Fas 1), aldrig denna RPC. Kräver populerade signaturer → glest nu (bara Great Orme har fält).
--
-- LÄRORIKT DEMONSTRATIONSFALL (kör efter apply):
--   select * from public.match_metal_provenance('coin', (select id from public.coins where name ilike 'Bedale%'));
--   → Bedale-silvrets Pb-kvoter (obj 30: 206/204=18.59, 207/204=15.67, 208/204=38.70, 207/206=0.84)
--     faller inom Great Ormes KOPPAR-fält på alla fyra system = 4/4. En PERFEKT numerisk träff som är
--     ett FALSKT POSITIVT: Great Orme är koppar, Bedale är silver. Exakt varför utdata är hypotes,
--     ej sanning. verdict-fältet ropar detta; ore_metals visar {copper} så metallkrocken syns direkt.
--
-- Kör i SQL-editorn, sedan: supabase migration repair --status applied 20260728180000

begin;

create or replace function public.match_metal_provenance(p_object_type text, p_object_id uuid)
returns table (
  ore_source_id   uuid,
  ore_source_name text,
  ore_metals      text[],
  systems_matched integer,
  systems_compared integer,
  verdict         text
)
language sql stable set search_path = public as $$
  with obj as (
    select system, value
    from public.metal_analyses
    where object_type = p_object_type and object_id = p_object_id
  ),
  cmp as (
    select s.id, s.name, s.metals, o.value,
           (s.isotope_signature -> o.system) as rng
    from public.ore_sources s
    cross join obj o
    where s.isotope_signature is not null
      and s.isotope_signature ? o.system
      and jsonb_typeof(s.isotope_signature -> o.system) = 'array'
  )
  select id, name, metals,
    count(*) filter (where value >= (rng->>0)::numeric and value <= (rng->>1)::numeric)::integer,
    count(*)::integer,
    'BERÄKNAD HYPOTES — numerisk isotop-överlappning, EJ belagd proveniens. Kontrollera metallkompatibilitet (ore_metals) + geologisk tolkning; belagd proveniens = källförd sourced_from-kant.'
  from cmp
  group by id, name, metals
  having count(*) > 0
  order by 4 desc, 5 desc;
$$;

comment on function public.match_metal_provenance(text, uuid) is
  'Fas 2. Rankar malmkällor efter numerisk isotop-överlappning. Utdata = BERÄKNAD HYPOTES, aldrig belagd proveniens. Se migration 20260728180000.';

-- Registrera i ontologi-katalogen (agent-introspekterbar mätoperation).
insert into public.ontology_measures
  (code, label_sv, label_en, rpc, inputs, output_unit, applies_to, status, description)
values
  ('metal_provenance_match', 'metallproveniens-matchning', 'metal provenance match',
   'match_metal_provenance', 'object_type text, object_id uuid', 'systems_matched/systems_compared',
   array['coin','artefact','runic_inscription'], 'active',
   'Rankar malmkällor efter numerisk isotop-överlappning (metal_analyses vs ore_sources.isotope_signature). BERÄKNAD HYPOTES, aldrig belagd proveniens. Kräver populerade signaturer (glest nu: bara Great Orme).')
on conflict (code) do nothing;

commit;

-- NÄSTA för att göra Fas 2 skarp: populera fler isotope_signature ur OXALID/GlobaLID (bulk),
-- Artioli 2016 (Trentino), Klein 2009 (SW-Iberien). Då får RPC:n verkliga kopparobjekt att matcha.
