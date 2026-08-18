-- Fornvännen-artiklar (3605 st, DiVA-harvest → historical_sources, collection ilike 'fornv', alla med
-- direkt-PDF i url) på svarssidan som "läs mer". Daniel: "Jag får inte upp några artiklar från
-- fornvännen på sidan. Det borde väl finnas? Den är mer om man vill läsa mer."
-- Matchar frågan mot titel ELLER ämnesord (subjects[]), case-insensitivt (subjects är blandad versal:
-- "Kalmar", "Kalmar slott" → en client-side .cs.{Kalmar} missar gement "kalmar"). Titelträff rankas
-- före ren ämnesordsträff, sen nyast först. Fornvännen CC BY 4.0 (Riksantikvarieämbetet/KVHAA) — länka ut.
-- Aggregat-läsning: SECURITY DEFINER, EXECUTE revoke från PUBLIC + grant anon/authenticated.

create or replace function public.fornvannen_for_query(q text, lim int default 6)
returns table (id uuid, title text, written_year int, url text, subjects text[], title_match boolean)
language sql stable security definer set search_path = public as $$
  with needle as (select '%' || trim(q) || '%' as pat)
  select h.id, h.title, h.written_year, h.url, h.subjects,
         (h.title ilike (select pat from needle)) as title_match
  from public.historical_sources h, needle
  where h.collection ilike '%fornv%'
    and h.url is not null
    and length(trim(q)) >= 2
    and (
      h.title ilike needle.pat
      or exists (select 1 from unnest(h.subjects) s where s ilike needle.pat)
    )
  order by (h.title ilike needle.pat) desc, h.written_year desc nulls last
  limit greatest(1, least(coalesce(lim, 6), 20));
$$;

revoke all on function public.fornvannen_for_query(text, int) from public;
grant execute on function public.fornvannen_for_query(text, int) to anon, authenticated;
