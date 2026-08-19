-- search_typeahead: klassa entity_type=person i grp=person (annars hamnade personer under "Övrigt").
CREATE OR REPLACE FUNCTION public.search_typeahead(p_q text, p_limit integer DEFAULT 12)
 RETURNS TABLE(entity_type text, entity_id uuid, label text, sublabel text, signum text, grp text, score double precision)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
declare
  ql text := lower(btrim(p_q));
  qa text := public.f_unaccent(btrim(p_q));  -- ascii-foldad (å/ä/ö→a/a/o) för fallback
begin
  if ql is null or length(ql) < 2 then return; end if;
  -- Dynamisk SQL med prefixen som LITERALER → planeraren använder prefix-indexen (annars seq-scan 454k).
  -- Matchar diakritik-exakt (lower(label)) ELLER ascii-foldat (f_unaccent(label)); ascii-only rankas lägre.
  return query execute format($q$
    with cand as (
      select d.entity_type, d.entity_id, d.label, d.sublabel, d.signum,
        case d.entity_type
          when 'viking_name' then 'name'
          when 'person' then 'person' when 'king' then 'person' when 'carver' then 'person' when 'saint' then 'person'
          when 'place_name' then 'place' when 'place' then 'place' when 'parish' then 'place'
          when 'city' then 'place' when 'hundred' then 'place' when 'landscape' then 'place'
          else 'other' end as grp,
        -- exakt namn > diakritik-prefix > ascii-only (lägre). Sen prominence/popularity, kortare etikett.
        (case when lower(d.label) = %L then 100.0
              when lower(d.label) like %L then 50.0
              else 25.0 end)
        + 3.0 * coalesce(d.prominence, 0)
        + 0.5 * ln(1 + coalesce(d.popularity, 0))
        + 4.0 * coalesce(d.popularity_score, 0)
        - 0.02 * length(d.label) as score
      from public.search_document d
      where lower(d.label) like %L or public.f_unaccent(d.label) like %L
    ),
    ranked as (
      select *, row_number() over (partition by grp order by score desc, length(label)) as grp_rn
      from cand
    )
    select entity_type, entity_id, label, sublabel, signum, grp, score
    from ranked where grp_rn <= 4
    order by score desc limit %s
  $q$, ql, ql || '%', ql || '%', qa || '%', greatest(1, least(p_limit, 20)));
end;
$function$
;
