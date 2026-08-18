-- Gap A: /sv/ortnamn sök→tvåaxel rankade homonymer på ÄLDSTA ÅR — så "Kalmar" visade Uppland-homonymen
-- (1286, enda daterade) före Kalmar stad (Småland). Fix: ranka på NOTABILITET först.
-- Signal: is_primary_referent (auktoritativ men gles, 10 rader) → wikidata_sitelinks (4273 orter) → år.
-- Kalmar[Småland] har 91 sitelinks, övriga Kalmar-homonymer 0 → staden hamnar först. Jfr place-notability.

create or replace function public.place_name_two_axis(p_name text, p_limit int default 12)
returns table(
  id uuid, name text, province text, socken text, lat double precision, lng double precision,
  year int, attested_form text, attestation_source text, source_type text,
  source text, attribution text, source_license text,
  element_keys text[], strata jsonb, typ_ref jsonb
) language sql stable set search_path = public as $$
  with base as (
    select distinct on (lower(p.name), coalesce(p.province,''), coalesce(p.socken,''))
      p.id, p.name, p.province, p.socken, p.lat, p.lng,
      p.earliest_attestation_year as year, p.attested_form, p.attestation_source,
      p.source, p.attribution, p.source_license, p.element_keys,
      coalesce(p.is_primary_referent, false) as prim,
      coalesce(p.wikidata_sitelinks, 0) as wsl,
      case
        when p.attestation_source ilike 'Runinskrift%' then 'runsten'
        when p.attestation_source ilike 'SDHK%'        then 'sdhk'
        when p.attestation_source ilike 'SOL%'         then 'sol'
        when p.attestation_source ilike 'Isof%'        then 'isof'
        when p.attestation_source is not null          then 'övrig'
        else null end as source_type
    from place_names p
    where p.superseded_by is null and lower(p.name) = lower(btrim(p_name))
    order by lower(p.name), coalesce(p.province,''), coalesce(p.socken,''),
             p.earliest_attestation_year asc nulls last
  )
  select b.id, b.name, b.province, b.socken, b.lat, b.lng, b.year, b.attested_form,
    b.attestation_source, b.source_type, b.source, b.attribution, b.source_license, b.element_keys,
    (select coalesce(jsonb_agg(jsonb_build_object(
        'key', e.element_key, 'label', e.label, 'lang', e.language_origin,
        'activity', e.activity_category, 'stratum', e.period_stratum, 'strength', e.strength
      ) order by e.element_key), '[]'::jsonb)
     from public.ortnamn_element_config e where e.element_key = any(b.element_keys)) as strata,
    (select coalesce(jsonb_agg(distinct jsonb_build_object(
        'typ_key', t.typ_key, 'label', t.label, 'system', t.system, 'funktion', t.funktion,
        'bildningsskikt', t.bildningsskikt, 'datering_konfidens', t.datering_konfidens,
        'requires_human', t.requires_human, 'teofor_risk', t.teofor_risk,
        'homonym_note', t.homonym_note, 'kalla', t.kalla
      )), '[]'::jsonb)
     from public.ortnamn_typ_referens t
     where t.element_key = any(b.element_keys)
        or (t.typ_key = 'deity_forled'
            and b.element_keys && array['tor','frö','fröja','oden','ull','njärd','skade','hel','härn'])
    ) as typ_ref
  from base b
  -- Gap A: notabilitet först, år sist (tidigare bara år asc → fel homonym överst)
  order by b.prim desc, b.wsl desc, b.year asc nulls last, coalesce(b.province,'')
  limit greatest(1, least(coalesce(p_limit, 12), 40));
$$;

revoke all on function public.place_name_two_axis(text, int) from public;
grant execute on function public.place_name_two_axis(text, int) to anon, authenticated;
