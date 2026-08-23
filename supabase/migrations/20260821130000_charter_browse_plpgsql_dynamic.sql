-- medieval_charters_browse stayed ~2.4s on the q= path even with the trgm index: the SQL function's
-- cached GENERIC plan sees "(q IS NULL OR <trgm ILIKE>)" and, because the IS NULL branch could match
-- everything, refuses the trigram index and seq-scans. Fix: a plpgsql impl that builds WHERE dynamically
-- (the trgm filter is only emitted when q is non-empty), so EXECUTE re-plans each call with the filter as
-- a hard predicate and uses idx_letters_raw_folded_trgm (~2.4s -> ~130ms). format(%L)/whitelisted ORDER BY
-- keep it injection-safe. A thin SQL wrapper preserves the exact public signature/param names (PostgREST
-- API) — needed because plpgsql cannot have a parameter named has_fulltext AND an OUT column of the same
-- name, while the SQL wrapper can. Output columns/semantics unchanged.
CREATE OR REPLACE FUNCTION public._medieval_charters_browse_impl(
    p_q text, p_sort text, p_dir text, p_century integer, p_has_fulltext boolean,
    p_page integer, p_page_size integer, p_facets jsonb, p_year_from integer, p_year_to integer)
 RETURNS TABLE(sdhk_id integer, year integer, date_raw text, place_raw text, lang_raw text, regest text, has_fulltext boolean, total_count bigint, date_display text, is_formula boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $fn$
DECLARE
  w   text := 'true';
  ob  text;
  lim int := greatest(1, least(100, coalesce(p_page_size, 30)));
  off int := greatest(0, (greatest(1, coalesce(p_page, 1)) - 1) * greatest(1, least(100, coalesce(p_page_size, 30))));
BEGIN
  IF p_q IS NOT NULL AND btrim(p_q) <> '' THEN
    w := w || format(' AND public.search_fold(coalesce(lr.summary,'''')||'' ''||coalesce(lr.place_raw,'''')||'' ''||coalesce(lr.author_raw,'''')) ILIKE ''%%''||public.search_fold(%L)||''%%''', p_q);
  END IF;
  IF p_century IS NOT NULL THEN
    w := w || format(' AND public.sdhk_year(lr.date_raw) BETWEEN %s AND %s', p_century, p_century + 99);
  END IF;
  IF p_has_fulltext IS NOT NULL THEN
    w := w || format(' AND (lr.edition_text IS NOT NULL AND btrim(lr.edition_text) <> '''') = %L', p_has_fulltext);
  END IF;
  IF p_facets IS NOT NULL THEN
    w := w || format(' AND NOT EXISTS (SELECT 1 FROM jsonb_each(%L::jsonb) f(facett, vals) WHERE NOT EXISTS (SELECT 1 FROM sdhk.charter_tags t WHERE t.sdhk_id=lr.sdhk_id AND t.facett=f.facett AND t.varde IN (SELECT jsonb_array_elements_text(f.vals))))', p_facets);
  END IF;
  IF p_year_from IS NOT NULL THEN
    w := w || format(' AND EXISTS (SELECT 1 FROM sdhk.charter_year y WHERE y.sdhk_id=lr.sdhk_id AND y.nominal_year >= %s)', p_year_from);
  END IF;
  IF p_year_to IS NOT NULL THEN
    w := w || format(' AND EXISTS (SELECT 1 FROM sdhk.charter_year y WHERE y.sdhk_id=lr.sdhk_id AND y.nominal_year <= %s)', p_year_to);
  END IF;
  ob := CASE
    WHEN p_sort='year'  AND p_dir='asc'  THEN 'year asc nulls last, sdhk_id asc'
    WHEN p_sort='year'  AND p_dir='desc' THEN 'year desc nulls last, sdhk_id asc'
    WHEN p_sort='place' AND p_dir='asc'  THEN 'place_raw asc nulls last, sdhk_id asc'
    WHEN p_sort='place' AND p_dir='desc' THEN 'place_raw desc nulls last, sdhk_id asc'
    WHEN p_sort='sdhk'  AND p_dir='desc' THEN 'sdhk_id desc'
    ELSE 'sdhk_id asc'
  END;

  RETURN QUERY EXECUTE format($q$
    WITH filt AS (
      SELECT lr.sdhk_id, public.sdhk_year(lr.date_raw) AS year, lr.place_raw
      FROM sdhk.letters_raw lr
      WHERE %s
    ),
    counted AS (SELECT *, count(*) OVER() AS total_count FROM filt),
    paged AS (SELECT * FROM counted ORDER BY %s LIMIT %s OFFSET %s)
    SELECT p.sdhk_id, p.year, lr.date_raw, lr.place_raw, lr.lang_raw, lr.summary AS regest,
           (lr.edition_text IS NOT NULL AND btrim(lr.edition_text) <> '') AS has_fulltext,
           p.total_count,
           public.sdhk_date_display(lr.date_raw) AS date_display,
           public.sdhk_is_formula(lr.summary, lr.print_ref) AS is_formula
    FROM paged p JOIN sdhk.letters_raw lr USING (sdhk_id)
    ORDER BY %s
  $q$, w, ob, lim, off, replace(ob, 'place_raw', 'p.place_raw'));
END;
$fn$;

-- Public API wrapper: exact original signature + param names (PostgREST), forwards to the impl.
CREATE OR REPLACE FUNCTION public.medieval_charters_browse(q text DEFAULT NULL::text, sort text DEFAULT 'sdhk'::text, dir text DEFAULT 'asc'::text, century integer DEFAULT NULL::integer, has_fulltext boolean DEFAULT NULL::boolean, page integer DEFAULT 1, page_size integer DEFAULT 30, p_facets jsonb DEFAULT NULL::jsonb, p_year_from integer DEFAULT NULL::integer, p_year_to integer DEFAULT NULL::integer)
 RETURNS TABLE(sdhk_id integer, year integer, date_raw text, place_raw text, lang_raw text, regest text, has_fulltext boolean, total_count bigint, date_display text, is_formula boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $wrap$
  SELECT * FROM public._medieval_charters_browse_impl(q, sort, dir, century, has_fulltext, page, page_size, p_facets, p_year_from, p_year_to);
$wrap$;
