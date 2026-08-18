-- Typeahead-förslag: publicerade FAQ-frågor som matchar (prefix på variant, delsträng i frågan,
-- eller normaliserad fråga). Så "vik"/"viking"/"njord" visar FAQ-navet direkt i sökrutan.
-- Ordnas på relevans: exakt variant-match först, sedan frågeprefix, sedan kortast.
create or replace function public.faq_suggest(p_q text, p_limit integer default 5)
returns table(slug text, question_sv text, question_en text, entity_type text)
language sql stable set search_path to 'public' as $$
  with qq as (select lower(btrim(p_q)) t, coalesce(normalize_search_query(p_q), lower(btrim(p_q))) nm)
  select s.slug, s.question_sv, s.question_en, s.entity_type from (
    select distinct on (fq.slug) fq.slug, fq.question_sv, fq.question_en, fq.entity_type,
      (case when exists(select 1 from unnest(coalesce(fq.variants,'{}'::text[])) v where lower(v)=qq.t or lower(v)=qq.nm) then 0
            when lower(fq.question_sv) like qq.t||'%' then 1 else 2 end) as rel,
      length(fq.question_sv) as len
    from public.faq_question fq, qq
    where fq.status='published' and length(qq.t) >= 2 and (
      lower(fq.question_sv) ilike '%'||qq.t||'%'
      or exists (select 1 from unnest(coalesce(fq.variants,'{}'::text[])) v
                 where lower(v) like qq.t||'%' or lower(v)=qq.t or lower(v)=qq.nm)
      or fq.slug ilike '%'||replace(qq.t,' ','-')||'%')
    order by fq.slug
  ) s
  order by s.rel, s.len
  limit p_limit;
$$;
grant execute on function public.faq_suggest(text,integer) to anon, authenticated;
