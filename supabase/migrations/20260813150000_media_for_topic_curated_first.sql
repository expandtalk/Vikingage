-- media_for_topic: gör FULLTEXT-grenen till en ren fallback.
--
-- Bugg (Daniel, fält): en sökning på "Kalmar" (staden) drog in poddavsnitt om Gamleby/Västervik
-- ("188. När Gamleby var Västervik") och Stensjö by ("171. …"), som INTE är Kalmar-taggade utan bara
-- NÄMNER "nordöstra Kalmar län" i sammanfattningen. Orsak: fulltextgrenen (search_vector, vikt 8.0)
-- matchade det passerande omnämnandet med högst vikt av alla grenar.
--
-- Rättning: kurerade kopplingar (topic_term-exakt + tema) är sanningen. Fulltext körs BARA som
-- fallback när termen saknar kurerad träff — så väl-kurerade orter (Kalmar har egna Kalmar-taggade
-- avsnitt) inte förorenas av mer-omnämnanden, medan otaggade sökord fortfarande får fulltext-täckning.
-- Ingen annan logik ändrad (source-rank, tema-vikt, UTM, rankning identisk).

CREATE OR REPLACE FUNCTION public.media_for_topic(q text, p_medium text DEFAULT NULL::text, p_limit integer DEFAULT 30, p_offset integer DEFAULT 0)
 RETURNS TABLE(item_id uuid, source_id uuid, medium text, source_name text, creator text, title text, url text, published_at date, view_count bigint, summary_sv text, score real, source_rank bigint)
 LANGUAGE sql
 STABLE
AS $function$
  with qq as (select lower(unaccent(trim(q))) as term),
  tsq as (select websearch_to_tsquery('swedish', q) as query),
  matched_theme as (
    select t.id from themes t, qq
    where lower(unaccent(t.name)) = qq.term
       or lower(unaccent(coalesce(t.name_en,''))) = qq.term
       or exists (select 1 from unnest(coalesce(t.keywords,'{}')) k where lower(unaccent(k)) = qq.term)
       or exists (select 1 from theme_keywords tk where tk.theme_id = t.id and lower(unaccent(tk.term)) = qq.term)
  ),
  matched_source as (
    select distinct l.source_id from media_topic_links l, qq
    where l.source_id is not null and l.item_id is null and l.topic_term is not null
      and lower(unaccent(l.topic_term)) = qq.term
  ),
  -- KURERADE träffar: exakt topic_term + tema. Detta är sanningen.
  curated as (
    select l.item_id, (l.relevance * 1.0)::real as w from media_topic_links l, qq
      where l.item_id is not null and l.topic_term is not null and lower(unaccent(l.topic_term)) = qq.term
    union all
    select l.item_id, (l.relevance * 0.9)::real from media_topic_links l
      where l.item_id is not null and l.theme_id in (select id from matched_theme)
  ),
  hits as (
    select item_id, w from curated
    union all
    -- FULLTEXT endast som fallback: bara när termen saknar kurerad koppling. Annars matchar
    -- passerande omnämnanden ("Kalmar län") in fel avsnitt på en ortssökning.
    select mi.id, (ts_rank(mi.search_vector, tsq.query) * 8.0)::real
      from media_items mi, tsq
      where tsq.query is not null and mi.search_vector @@ tsq.query
        and not exists (select 1 from curated)
  ),
  agg as (select h.item_id, max(h.w) as w from hits h group by h.item_id),
  scored as (
    select mi.id as item_id, mi.source_id, mi.medium, ms.name as source_name, ms.creator,
           mi.title, mi.url, mi.published_at, mi.view_count, mi.summary_sv,
           (a.w * (1 + case when ms.authority then 0.25 else 0 end)
              * (case when mi.source_id in (select source_id from matched_source) then 1.3 else 1 end))::real as score
    from agg a
    join media_items mi on mi.id = a.item_id
    join media_sources ms on ms.id = mi.source_id
    where p_medium is null or mi.medium = p_medium
  ),
  ranked as (
    select *, row_number() over (partition by source_id order by score desc, view_count desc nulls last) as source_rank
    from scored
  )
  select item_id, source_id, medium, source_name, creator, title,
         url || (case when position('?' in url) > 0 then '&' else '?' end)
             || 'utm_source=vikingage.se&utm_medium=referral&utm_campaign=mediegraf' as url,
         published_at, view_count, summary_sv, score, source_rank
  from ranked
  order by (score - (source_rank - 1) * 0.15) desc, view_count desc nulls last
  limit p_limit offset p_offset;
$function$;
