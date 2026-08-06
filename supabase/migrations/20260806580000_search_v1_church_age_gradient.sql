-- search_v1 relevansvikt efter FAKTISK kyrkoålder (Daniel: "vi har ju en tidslinje"). Gradient:
-- <1100 ×2.5, 1100–1299 ×1.7, 1300–1549 ×1.2, ≥1550 ×0.15. ODATERADE = neutrala ×1.0 (straffas ej).
-- Odaterbara moderna frikyrkor (heritage_site utan årtal) fångas på namn ×0.05. Inline → överlever rebuild.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
CREATE OR REPLACE FUNCTION public.search_v1(p_q text, p_limit integer DEFAULT 30, p_types text[] DEFAULT NULL::text[])
 RETURNS TABLE(entity_type text, entity_id uuid, signum text, label text, sublabel text, snippet text, score double precision)
 LANGUAGE sql STABLE SET search_path TO 'public', 'extensions'
AS $function$
with q as (
  select trim(p_q) as raw,
         lower(replace(trim(p_q), ' ', '')) as qnorm,
         websearch_to_tsquery('simple', p_q) as tq_simple,
         websearch_to_tsquery('swedish', p_q) as tq_sv,
         websearch_to_tsquery('english', p_q) as tq_en
),
exact_sig as (
  select d.entity_type, d.entity_id, 1::bigint as rnk
  from search_document d, q
  where length(q.qnorm) >= 2
    and (d.signum_norm = q.qnorm or lower(d.label) = lower(q.raw))
),
trgm as (
  select entity_type, entity_id, row_number() over (order by sim desc) as rnk
  from (
    select d.entity_type, d.entity_id, similarity(d.label, q.raw) as sim,
           (d.label ilike '%' || q.raw || '%') as is_substr
    from search_document d, q
    where length(q.raw) >= 2 and (d.label % q.raw or d.label ilike '%' || q.raw || '%')
    order by sim desc limit 60
  ) x
  where x.is_substr or x.sim >= 0.45
),
fts as (
  select entity_type, entity_id, row_number() over (order by rank desc) as rnk
  from (
    select d.entity_type, d.entity_id,
      greatest(ts_rank(d.tsv_simple, q.tq_simple),
               ts_rank(d.tsv_sv, q.tq_sv),
               ts_rank(d.tsv_en, q.tq_en)) as rank
    from search_document d, q
    where d.tsv_simple @@ q.tq_simple or d.tsv_sv @@ q.tq_sv or d.tsv_en @@ q.tq_en
    order by rank desc limit 300
  ) x
),
fused as (
  select entity_type, entity_id, sum(w / (60 + rnk)) as score
  from (
    select entity_type, entity_id, rnk, 3.0 as w from exact_sig
    union all select entity_type, entity_id, rnk, 1.5 from trgm
    union all select entity_type, entity_id, rnk, 1.0 from fts
  ) s
  group by entity_type, entity_id
),
diversified as (
  select f.*, row_number() over (partition by f.entity_type order by f.score desc) as type_rn
  from fused f
)
select * from (
  select d.entity_type, d.entity_id, d.signum, d.label, d.sublabel,
    ts_headline('simple',
      left(concat_ws(' ', d.body_sv, d.body_en, d.body_simple), 600),
      q.tq_simple, 'MaxWords=18, MinWords=6, MaxFragments=1') as snippet,
    f.score * (
      case
        when d.label ~* '(immanuel|filadelfia|smyrna|betlehemsk|elimkyrk|pingstkyrk|missionskyrk|baptistkyrk|metodistkyrk|sjömanskyrk|korskyrk|citykyrk|allianskyrk|frälsningsarm|adventkyrk|equmenia|saronkyrk|katolska kyrkan)'
          then 0.05
        when coalesce(ec.built_from, ec.founded_year, ec.current_building_year, cs.founded_year) < 1100 then 2.5
        when coalesce(ec.built_from, ec.founded_year, ec.current_building_year, cs.founded_year) between 1100 and 1299 then 1.7
        when coalesce(ec.built_from, ec.founded_year, ec.current_building_year, cs.founded_year) between 1300 and 1549 then 1.2
        when coalesce(ec.built_from, ec.founded_year, ec.current_building_year, cs.founded_year) >= 1550 then 0.15
        else 1.0
      end
    ) as score
  from diversified f
  join search_document d using (entity_type, entity_id)
  left join ecclesiastical_sites ec on ec.id = d.entity_id and d.entity_type = 'church'
  left join christian_sites cs on cs.id = d.entity_id and d.entity_type = 'christian_site'
  cross join q
  where f.type_rn <= 20
    and (p_types is null or d.entity_type = any (p_types))
) z
order by z.score desc
limit p_limit
$function$;
