-- /sv/ortnamn "Äldsta belägg"-vyn: TVÅAXEL. Sidan visade tidigare bara en handkurerad tabell
-- (place_name_attestations, 13 rader) — INTE de 5451 beläggen i place_names. Denna RPC surfar dem.
--
-- TVÅ KLOCKOR (källkritik, Daniel): belägg ≠ namnålder. Vi returnerar BÅDA axlarna men blandar dem ALDRIG:
--   AXEL A (belägg): year + attested_form + attestation_source + source_type (runsten/sdhk/sol/isof) =
--     NÄR namnet först SKREVS. En latinsk SDHK-form (Myriby 1283) är en skrivform, ej namnets ålder/språk.
--   AXEL B (skikt/motiv): härledd ur ortnamnsleden (element_keys → ortnamn_element_config) =
--     språklager (urnordiska/fornnordiska/samiska/finska), motiv/funktion (bebyggelse/kult/sjöfart/
--     administration/topografiskt) och period_stratum. Visar att namnet ofta är MYCKET äldre än belägget.
-- Dedup: distinct on (namn, ~läge) → oldest per ort (samlar place_names-dubbletter, t.ex. Sigtuna×2).

create or replace function public.oldest_attestations(p_limit int default 200, p_source text default null)
returns table(
  name text, lat double precision, lng double precision, year int,
  attested_form text, attestation_source text, source_type text,
  element_keys text[], strata jsonb
) language sql stable set search_path = public as $$
  with base as (
    select distinct on (lower(p.name), round(p.lat::numeric, 1))
      p.name, p.lat, p.lng, p.earliest_attestation_year as year,
      p.attested_form, p.attestation_source, p.element_keys,
      case
        when p.attestation_source ilike 'Runinskrift%' then 'runsten'
        when p.attestation_source ilike 'SDHK%'        then 'sdhk'
        when p.attestation_source ilike 'SOL%'         then 'sol'
        when p.attestation_source ilike 'Isof%'        then 'isof'
        else 'övrig' end as source_type
    from place_names p
    where p.earliest_attestation_year is not null and p.lat is not null
    order by lower(p.name), round(p.lat::numeric, 1), p.earliest_attestation_year asc
  )
  select b.name, b.lat, b.lng, b.year, b.attested_form, b.attestation_source, b.source_type, b.element_keys,
    (select coalesce(jsonb_agg(jsonb_build_object(
        'key', e.element_key, 'label', e.label, 'lang', e.language_origin,
        'activity', e.activity_category, 'stratum', e.period_stratum, 'strength', e.strength) order by e.element_key), '[]'::jsonb)
     from public.ortnamn_element_config e where e.element_key = any(b.element_keys)) as strata
  from base b
  where (p_source is null or p_source = 'all' or b.source_type = p_source)
  order by b.year asc, b.name asc
  limit greatest(1, least(coalesce(p_limit, 200), 1000));
$$;

revoke all on function public.oldest_attestations(int, text) from public;
grant execute on function public.oldest_attestations(int, text) to anon, authenticated;

-- Källfördelning för facett-räknare (Axel A source_type).
create or replace function public.attestation_source_counts()
returns table(source_type text, n bigint)
language sql stable set search_path = public as $$
  select case
      when attestation_source ilike 'Runinskrift%' then 'runsten'
      when attestation_source ilike 'SDHK%'        then 'sdhk'
      when attestation_source ilike 'SOL%'         then 'sol'
      when attestation_source ilike 'Isof%'        then 'isof'
      else 'övrig' end as source_type,
    count(*) as n
  from public.place_names
  where earliest_attestation_year is not null
  group by 1 order by 2 desc;
$$;
revoke all on function public.attestation_source_counts() from public;
grant execute on function public.attestation_source_counts() to anon, authenticated;
