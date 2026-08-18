-- Poddar/media "om trakten": när en plats saknar egen media, hämta media för notabla
-- närliggande orter (viking_cities) inom radien och matcha på titel. Löser t.ex. att
-- "Birkaborgen" saknar egna avsnitt men Birka (samma punkt) har flera.
create or replace function public.media_near(
  p_lat double precision, p_lng double precision, p_radius_m integer default 8000, p_limit integer default 10)
returns table(item_id uuid, medium text, source_name text, creator text, title text, url text,
              published_at date, summary_sv text, matched_place text, dist_m double precision)
language sql stable as $$
  with pt as (select ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography g),
  nearby as (
    select vc.name,
           ST_Distance(ST_SetSRID(ST_MakePoint((vc.coordinates)[0], (vc.coordinates)[1]), 4326)::geography, pt.g) d
    from public.viking_cities vc, pt
    where vc.coordinates is not null and length(vc.name) >= 4
      and ST_DWithin(ST_SetSRID(ST_MakePoint((vc.coordinates)[0], (vc.coordinates)[1]), 4326)::geography, pt.g, p_radius_m)
  ),
  named as (select name, min(d) d from nearby group by name),
  ranked as (
    select mi.id, mi.medium, ms.name src, ms.creator, mi.title, mi.url, mi.published_at, mi.summary_sv,
           n.name matched_place, n.d,
           row_number() over (partition by mi.id order by n.d) rn
    from named n
    join public.media_items mi on mi.title ilike '%' || n.name || '%'
    join public.media_sources ms on ms.id = mi.source_id
  )
  select id, medium, src, creator, title, url, published_at, summary_sv, matched_place, d
  from ranked where rn = 1
  order by d asc, published_at desc nulls last
  limit p_limit;
$$;
grant execute on function public.media_near(double precision,double precision,integer,integer) to anon, authenticated;
