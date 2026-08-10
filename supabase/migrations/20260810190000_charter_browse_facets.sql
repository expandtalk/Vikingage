-- Task 3 (medeltidsbrev-facettgruppering): add optional facet/year filters to
-- public.medieval_charters_browse(...) and add public.charter_facet_counts(...).
--
-- medieval_charters_browse must be dropped first because Postgres does not allow
-- CREATE OR REPLACE to change a function's argument list. The old signature
-- (q, sort, dir, century, has_fulltext, page, page_size) is preserved exactly
-- (same names/types/order/defaults) so existing callers keep working unchanged;
-- three new optional args (p_facets, p_year_from, p_year_to) are appended with
-- defaults of null, so old-style calls behave identically to before.

drop function public.medieval_charters_browse(
  q text, sort text, dir text, century integer, has_fulltext boolean,
  page integer, page_size integer
);

create or replace function public.medieval_charters_browse(
  q text default null::text,
  sort text default 'sdhk'::text,
  dir text default 'asc'::text,
  century integer default null::integer,
  has_fulltext boolean default null::boolean,
  page integer default 1,
  page_size integer default 30,
  p_facets jsonb default null,
  p_year_from integer default null,
  p_year_to integer default null
)
returns table(
  sdhk_id integer, year integer, date_raw text, place_raw text, lang_raw text,
  regest text, has_fulltext boolean, total_count bigint, date_display text,
  is_formula boolean
)
language sql
stable security definer
set search_path to 'public'
as $function$
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
        extensions.unaccent(coalesce(lr.summary,'')||' '||coalesce(lr.place_raw,'')||' '||coalesce(lr.author_raw,''))
        ilike '%' || extensions.unaccent(btrim(q)) || '%')
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
$function$;

-- Per-facet-value counts under the same filter (for the facet panel's numbers).
create or replace function public.charter_facet_counts(
  p_q text default null,
  p_facets jsonb default null,
  p_year_from integer default null,
  p_year_to integer default null
)
returns table(facett text, varde text, n bigint)
language sql
stable security definer
set search_path to 'public'
as $function$
  with matched as (
    select lr.sdhk_id
    from sdhk.letters_raw lr
    where
      (p_q is null or btrim(p_q) = '' or
        extensions.unaccent(coalesce(lr.summary,'')||' '||coalesce(lr.place_raw,'')||' '||coalesce(lr.author_raw,''))
        ilike '%' || extensions.unaccent(btrim(p_q)) || '%')
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
  )
  select t.facett, t.varde, count(distinct t.sdhk_id) as n
  from sdhk.charter_tags t
  join matched m on m.sdhk_id = t.sdhk_id
  group by t.facett, t.varde
  order by t.facett, n desc, t.varde;
$function$;

grant execute on function public.medieval_charters_browse(
  text, text, text, integer, boolean, integer, integer, jsonb, integer, integer
) to anon, authenticated;

grant execute on function public.charter_facet_counts(
  text, jsonb, integer, integer
) to anon, authenticated;
