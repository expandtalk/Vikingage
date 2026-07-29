-- Runord-test v2: hanterar (1) flyttade stenar och (2) medium.
--  p_placement: 'exclude_moved' (default; mät ursprungsmönster) | 'all'
--    "flyttad" = kyrk-associerad ELLER original≠current (>100 m) i inscription_locations.
--    Koordinat = ORIGINAL (inscription_locations role='original') där den finns, annars nuvarande.
--  p_medium: 'all' | 'stone' | 'portable' (kävle/ben/märklapp) | 'coin'
-- Svarar på Daniels kritik: uteslut flyttade när man mäter originalläge; jämför hur SKRIFTEN
-- användes (inte bara runstenar). moved_year är nästan tom → "när flyttades" = separat datajobb.
create or replace function runic_word_nn(p_term text, p_reference text, p_placement text default 'exclude_moved', p_medium text default 'all')
returns table(cohort text, n integer, median_m integer)
language sql stable as $$
  with refs as (
    select geom g from ecclesiastical_sites where p_reference='church' and geom is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from swedish_hillforts where p_reference='fornborg' and coordinates is not null
    union all select geom from thing_sites where p_reference='thing' and geom is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from viking_cities where p_reference='town' and coordinates is not null
    union all select geom from heritage_sites where p_reference='gravfalt' and geom is not null and raa_type ilike '%gravfält%'
  ),
  ins as (
    select ri.id, ri.transliteration, ri.object_type,
      (lower(coalesce(ri.location,'')||' '||coalesce(ri.current_location,'')) like '%kyrk%'
       or exists (select 1 from inscription_locations o join inscription_locations cu
            on o.inscription_id=cu.inscription_id and o.role='original' and cu.role='current'
            where o.inscription_id=ri.id and o.lat is not null and cu.lat is not null
              and ST_Distance(ST_SetSRID(ST_MakePoint(o.lng,o.lat),4326)::geography,
                              ST_SetSRID(ST_MakePoint(cu.lng,cu.lat),4326)::geography) > 100)) moved,
      coalesce(
        (select ST_SetSRID(ST_MakePoint(o.lng,o.lat),4326) from inscription_locations o
           where o.inscription_id=ri.id and o.role='original' and o.lat is not null limit 1),
        ST_SetSRID(ST_MakePoint((ri.coordinates)[0],(ri.coordinates)[1]),4326)) g
    from runic_inscriptions ri where ri.coordinates is not null
  ),
  filt as (
    select * from ins where g is not null
      and (p_medium='all'
        or (p_medium='stone'    and (object_type ilike '%runsten%' or object_type ilike '%runestone%' or object_type ilike '%gravhäll%'))
        or (p_medium='portable' and (object_type ilike '%pinne%' or object_type ilike '%träinskrift%' or object_type ilike '%runben%' or object_type ilike '%revben%' or object_type ilike '%märklapp%'))
        or (p_medium='coin'     and object_type ilike '%mynt%'))
      and (p_placement='all' or not moved)
  ),
  coh as (
    select 'match'::text cohort, g from filt where transliteration ilike '%'||p_term||'%'
    union all
    select 'baseline', g from (select g from filt order by random() limit 1200) x
  ),
  nn as (
    select coh.cohort, ST_Distance(coh.g::geography, r.g::geography) d
    from coh cross join lateral (select g from refs order by coh.g <-> refs.g limit 1) r
  )
  select cohort, count(*)::int, round(percentile_cont(0.5) within group (order by d))::int
  from nn group by cohort;
$$;
grant execute on function runic_word_nn(text, text, text, text) to anon, authenticated;

-- Bonus: sammanfatta FLYTTEN (Daniels "mät hur/vart stenar flyttades"). Distans original→current
-- + hur många hamnade vid kyrka. moved_year mest tom (dateringen av flyttarna = datagap).
create or replace function relocation_summary()
returns table(n_pairs integer, median_move_m integer, moved_to_church integer, max_move_m integer)
language sql stable as $$
  with pairs as (
    select o.inscription_id,
      ST_Distance(ST_SetSRID(ST_MakePoint(o.lng,o.lat),4326)::geography,
                  ST_SetSRID(ST_MakePoint(cu.lng,cu.lat),4326)::geography) d,
      lower(coalesce(cu.place_name,'')) cur
    from inscription_locations o join inscription_locations cu
      on o.inscription_id=cu.inscription_id and o.role='original' and cu.role='current'
    where o.lat is not null and cu.lat is not null
  )
  select count(*)::int, round(percentile_cont(0.5) within group (order by d))::int,
         count(*) filter (where cur like '%kyrk%')::int, round(max(d))::int
  from pairs;
$$;
grant execute on function relocation_summary() to anon, authenticated;
