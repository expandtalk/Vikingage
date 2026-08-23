-- Fix #2: medieval_charters_browse timed out (57014, ~3s) on the browse-all path. The count(*) over()
-- WindowAgg carried the full 342-byte letters_raw row through a disk-spilling sort and computed
-- sdhk_year/sdhk_is_formula/sdhk_date_display for all 44k rows though only 30 are returned.
-- Rewrite: narrow the pre-window projection (sdhk_id, year, place_raw), page first, then compute the
-- display functions only on the 30 paged rows via a join back. ~2998ms -> ~600ms. Output identical.
--
-- Fix #1: entity_answer_context/resolve_place returned a null center for a clicked place whose exact
-- name isn't a gazetteer entry (e.g. the ortnamn "Skärkinds gamla kyrka" = the demolished medieval
-- church / gravkapell where Ög 171/172 actually stand) -> blank answer panel. resolve_place now ALSO
-- tries a "<X> gamla|nya kyrka(n)" -> "<X> kyrka(n)" normalization (old and new church of a parish are
-- the same locality), ranked BELOW any exact match. Resolves to the sibling church's REAL coordinate
-- (no fabricated coords). Rescues 12 of 16 such places incl. Skärkind (surfaces the nearby runestones
-- via the 15 km proximity query). + lower(name) functional indexes so resolve_place stops seq-scanning
-- place_names (358k) / heritage_sites (68k) on every call (it is called twice per answer).

-- ---- resolve_place: exact match first, then the church-variant normalization as a lower-priority fallback ----
CREATE OR REPLACE FUNCTION public.resolve_place(p_q text)
 RETURNS TABLE(lat double precision, lng double precision, zoom integer, kind text, place_name text)
 LANGUAGE sql
 STABLE
AS $function$
  with q as (
    select
      coalesce(public.normalize_search_query(p_q), lower(btrim(p_q))) as t,
      nullif(
        lower(btrim(regexp_replace(p_q, '\s+(gamla|nya)\s+(kyrka|kyrkan)', ' \2', 'i'))),
        coalesce(public.normalize_search_query(p_q), lower(btrim(p_q)))
      ) as t2
  )
  select lat, lng, zoom, kind, place_name from (
    select (cs.coordinates)[1] as lat, (cs.coordinates)[0] as lng, 16 as zoom,
           'christian_site' as kind, cs.name as place_name, 1 as prio, null::int as pop,
           case when lower(cs.name) = q.t then 0 else 1 end as ex
    from public.christian_sites cs, q where lower(cs.name) in (q.t, q.t2) and cs.coordinates is not null
    union all
    select hs.lat, hs.lng, 16, 'heritage_site', hs.name, 2, null::int, case when lower(hs.name)=q.t then 0 else 1 end
    from public.heritage_sites hs, q where lower(hs.name) in (q.t, q.t2) and hs.lat is not null
    union all
    select es.lat, es.lng, 16, 'church', es.name, 2, null::int, case when lower(es.name)=q.t then 0 else 1 end
    from public.ecclesiastical_sites es, q where lower(es.name) in (q.t, q.t2) and es.lat is not null
    union all
    select (ri.coordinates)[1], (ri.coordinates)[0], 15, 'inscription', coalesce(ri.name, ri.signum), 2, null::int,
           case when lower(ri.name)=q.t or lower(ri.signum)=q.t then 0 else 1 end
    from public.runic_inscriptions ri, q where (lower(ri.name) in (q.t,q.t2) or lower(ri.signum) in (q.t,q.t2)) and ri.coordinates is not null
    union all
    select cu.lat, cu.lng, 15, 'cult_site', cu.name, 3, null::int, case when lower(cu.name)=q.t then 0 else 1 end
    from public.cult_sites cu, q where lower(cu.name) in (q.t,q.t2) and cu.lat is not null
    union all
    select mo.lat, mo.lng, 15, 'museum_object', mo.name, 3, null::int, case when lower(mo.name)=q.t then 0 else 1 end
    from public.museum_objects mo, q where lower(mo.name) in (q.t,q.t2) and mo.lat is not null
    union all
    select (vc.coordinates)[1] as lat, (vc.coordinates)[0] as lng, 13, 'city', vc.name, 2, 1000000, case when lower(vc.name)=q.t then 0 else 1 end
    from public.viking_cities vc, q where lower(vc.name) in (q.t,q.t2) and vc.coordinates is not null
    union all
    select pn.lat, pn.lng, 12, 'place', pn.name, 5, coalesce(pn.wikidata_sitelinks, 0), case when lower(pn.name)=q.t then 0 else 1 end
    from public.place_names pn, q where lower(pn.name) in (q.t,q.t2) and pn.lat is not null
  ) hits
  order by ex asc, prio asc, pop desc nulls last
  limit 1;
$function$;

-- functional indexes so the exact/normalized lookups above are index scans, not seq scans
CREATE INDEX IF NOT EXISTS idx_heritage_sites_lower_name ON public.heritage_sites (lower(name));
CREATE INDEX IF NOT EXISTS idx_eccl_sites_lower_name ON public.ecclesiastical_sites (lower(name));
CREATE INDEX IF NOT EXISTS idx_christian_sites_lower_name ON public.christian_sites (lower(name));
CREATE INDEX IF NOT EXISTS idx_place_names_lower_name ON public.place_names (lower(name));
CREATE INDEX IF NOT EXISTS idx_cult_sites_lower_name ON public.cult_sites (lower(name));
CREATE INDEX IF NOT EXISTS idx_museum_objects_lower_name ON public.museum_objects (lower(name));
CREATE INDEX IF NOT EXISTS idx_viking_cities_lower_name ON public.viking_cities (lower(name));
CREATE INDEX IF NOT EXISTS idx_runic_inscriptions_lower_name ON public.runic_inscriptions (lower(name));
CREATE INDEX IF NOT EXISTS idx_runic_inscriptions_lower_signum ON public.runic_inscriptions (lower(signum));

-- ---- medieval_charters_browse: narrow window + compute display fns only on the paged rows ----
CREATE OR REPLACE FUNCTION public.medieval_charters_browse(q text DEFAULT NULL::text, sort text DEFAULT 'sdhk'::text, dir text DEFAULT 'asc'::text, century integer DEFAULT NULL::integer, has_fulltext boolean DEFAULT NULL::boolean, page integer DEFAULT 1, page_size integer DEFAULT 30, p_facets jsonb DEFAULT NULL::jsonb, p_year_from integer DEFAULT NULL::integer, p_year_to integer DEFAULT NULL::integer)
 RETURNS TABLE(sdhk_id integer, year integer, date_raw text, place_raw text, lang_raw text, regest text, has_fulltext boolean, total_count bigint, date_display text, is_formula boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with filt as (
    select lr.sdhk_id, public.sdhk_year(lr.date_raw) as year, lr.place_raw
    from sdhk.letters_raw lr
    where
      (q is null or btrim(q) = '' or
        public.search_fold(coalesce(lr.summary,'')||' '||coalesce(lr.place_raw,'')||' '||coalesce(lr.author_raw,''))
        ilike '%' || public.search_fold(btrim(q)) || '%')
      and (century is null or public.sdhk_year(lr.date_raw) between century and century + 99)
      and (has_fulltext is null
           or (lr.edition_text is not null and btrim(lr.edition_text) <> '') = has_fulltext)
      and (p_facets is null or not exists (
        select 1 from jsonb_each(p_facets) f(facett, vals)
        where not exists (
          select 1 from sdhk.charter_tags t
          where t.sdhk_id = lr.sdhk_id and t.facett = f.facett
            and t.varde in (select jsonb_array_elements_text(f.vals))
        )
      ))
      and (p_year_from is null or exists(
        select 1 from sdhk.charter_year y where y.sdhk_id = lr.sdhk_id and y.nominal_year >= p_year_from))
      and (p_year_to is null or exists(
        select 1 from sdhk.charter_year y where y.sdhk_id = lr.sdhk_id and y.nominal_year <= p_year_to))
  ),
  counted as (select *, count(*) over() as total_count from filt),
  paged as (
    select * from counted
    order by
      case when sort='year'  and dir='asc'  then year end asc  nulls last,
      case when sort='year'  and dir='desc' then year end desc nulls last,
      case when sort='place' and dir='asc'  then place_raw end asc  nulls last,
      case when sort='place' and dir='desc' then place_raw end desc nulls last,
      case when sort='sdhk'  and dir='desc' then sdhk_id end desc,
      sdhk_id asc
    limit  greatest(1, least(100, coalesce(page_size, 30)))
    offset greatest(0, (greatest(1, coalesce(page, 1)) - 1) * greatest(1, least(100, coalesce(page_size, 30))))
  )
  select p.sdhk_id, p.year, lr.date_raw, lr.place_raw, lr.lang_raw, lr.summary as regest,
         (lr.edition_text is not null and btrim(lr.edition_text) <> '') as has_fulltext,
         p.total_count,
         public.sdhk_date_display(lr.date_raw) as date_display,
         public.sdhk_is_formula(lr.summary, lr.print_ref) as is_formula
  from paged p join sdhk.letters_raw lr using (sdhk_id)
  order by
    case when sort='year'  and dir='asc'  then p.year end asc  nulls last,
    case when sort='year'  and dir='desc' then p.year end desc nulls last,
    case when sort='place' and dir='asc'  then p.place_raw end asc  nulls last,
    case when sort='place' and dir='desc' then p.place_raw end desc nulls last,
    case when sort='sdhk'  and dir='desc' then p.sdhk_id end desc,
    p.sdhk_id asc;
$function$;
