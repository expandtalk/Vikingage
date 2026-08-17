-- medeltidsbrev-sök skiljer nu A/Ä/Å/Ö (Sture/Daniel): medieval_charters_browse textmatchning
-- bytt extensions.unaccent() → public.search_fold() (bevarar å/ä/ö, foldar övriga accenter).
-- 'vala' ger ej längre charter som säger 'VÅLA'. Verifierat: vala=62, våla=79, väla=16 (åtskilda).

CREATE OR REPLACE FUNCTION public.medieval_charters_browse(q text DEFAULT NULL::text, sort text DEFAULT 'sdhk'::text, dir text DEFAULT 'asc'::text, century integer DEFAULT NULL::integer, has_fulltext boolean DEFAULT NULL::boolean, page integer DEFAULT 1, page_size integer DEFAULT 30, p_facets jsonb DEFAULT NULL::jsonb, p_year_from integer DEFAULT NULL::integer, p_year_to integer DEFAULT NULL::integer)
 RETURNS TABLE(sdhk_id integer, year integer, date_raw text, place_raw text, lang_raw text, regest text, has_fulltext boolean, total_count bigint, date_display text, is_formula boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with base as (
    select
      lr.sdhk_id,
      public.sdhk_year(lr.date_raw) as year,
      lr.date_raw, lr.place_raw, lr.lang_raw,
      lr.summary as regest,
      (lr.edition_text is not null and btrim(lr.edition_text) <> '') as has_fulltext,
      public.sdhk_date_display(lr.date_raw) as date_display,
      public.sdhk_is_formula(lr.summary, lr.print_ref) as is_formula
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
        select 1 from sdhk.charter_year y
        where y.sdhk_id = lr.sdhk_id and y.nominal_year >= p_year_from
      ))
      and (p_year_to is null or exists(
        select 1 from sdhk.charter_year y
        where y.sdhk_id = lr.sdhk_id and y.nominal_year <= p_year_to
      ))
  ),
  counted as (select *, count(*) over() as total_count from base)
  select sdhk_id, year, date_raw, place_raw, lang_raw, regest, has_fulltext, total_count,
         date_display, is_formula
  from counted
  order by
    case when sort='year'  and dir='asc'  then year end asc  nulls last,
    case when sort='year'  and dir='desc' then year end desc nulls last,
    case when sort='place' and dir='asc'  then place_raw end asc  nulls last,
    case when sort='place' and dir='desc' then place_raw end desc nulls last,
    case when sort='sdhk'  and dir='desc' then sdhk_id end desc,
    sdhk_id asc
  limit  greatest(1, least(100, coalesce(page_size, 30)))
  offset greatest(0, (greatest(1, coalesce(page, 1)) - 1) * greatest(1, least(100, coalesce(page_size, 30))));
$function$

;
