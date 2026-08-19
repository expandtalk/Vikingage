-- Publika RPC:er som exponerar RELEVANTA lit_intake-poster (tabellen är privat/RLS). SECURITY DEFINER.
-- lit_for_query: matchar ämne mot titel/abstract (svarspanelens "Senaste forskningen"-kort).
-- lit_recent: hela flödet för /sv/nyheter + /en/news (ev. disciplin-filtrerat).
create or replace function public.lit_for_query(p_q text, p_limit int default 6)
 returns table(title text, authors text, journal text, doi text, url text, is_oa boolean, publication_date date, discipline text, relevance real)
 language sql stable security definer set search_path to 'public' as $f$
  select title, authors, journal, doi, url, is_oa, publication_date, discipline, relevance
  from lit_intake
  where status='relevant' and length(coalesce(p_q,''))>=3
    and (title ilike '%'||p_q||'%' or abstract ilike '%'||p_q||'%'
         or to_tsvector('english', coalesce(title,'')||' '||coalesce(abstract,'')) @@ plainto_tsquery('english', p_q))
  order by relevance desc, publication_date desc nulls last
  limit greatest(1, least(p_limit, 12));
$f$;
grant execute on function public.lit_for_query(text,int) to anon, authenticated;

create or replace function public.lit_recent(p_limit int default 80, p_discipline text default null)
 returns table(title text, authors text, journal text, doi text, url text, is_oa boolean, publication_date date, discipline text, abstract text, source text)
 language sql stable security definer set search_path to 'public' as $f$
  select title, authors, journal, doi, url, is_oa, publication_date, discipline, left(abstract,320), source
  from lit_intake
  where status='relevant' and (p_discipline is null or discipline = p_discipline)
  order by publication_date desc nulls last, relevance desc
  limit greatest(1, least(p_limit, 300));
$f$;
grant execute on function public.lit_recent(int,text) to anon, authenticated;
