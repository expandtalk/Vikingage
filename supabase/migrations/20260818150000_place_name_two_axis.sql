-- /sv/ortnamn: SÖK ETT NAMN → se dess TVÅAXEL (Daniel: "se tvåaxeln efter jag skrivit in").
-- oldest_attestations() ger en bläddringslista (topp-N äldsta); denna ger tvåaxeln för ETT sökt namn,
-- homonym-medvetet (en rad per distinkt namn+province+socken, äldsta belägg per).
--
--   AXEL A (belägg): year + attested_form + attestation_source + source_type (runsten/sdhk/sol/isof).
--   AXEL B (skikt): strata ur ortnamn_element_config (språk/aktivitet/period_stratum) OCH
--                   typ_ref ur ortnamn_typ_referens (system A/B/C, bildningsskikt, teofor_risk,
--                   homonym_note, datering_konfidens, requires_human, källa).
-- Belägg och namnålder blandas ALDRIG. Teofor-risk/homonym surfas som källkritisk varning i UI.

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
  order by b.year asc nulls last, coalesce(b.province,'')
  limit greatest(1, least(coalesce(p_limit, 12), 40));
$$;

revoke all on function public.place_name_two_axis(text, int) from public;
grant execute on function public.place_name_two_axis(text, int) to anon, authenticated;
