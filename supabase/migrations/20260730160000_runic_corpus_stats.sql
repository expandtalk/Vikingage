-- Korpus-översikt för forskar-urvalet: hur många runinskrifter, och hur de kategoriseras i
-- risk-grupper (flyttade / på samlingspunkt) + medium. Grund för "välj urval → ta bort risk-stenar
-- → testa"-flödet på /sv/ortnamn. "flyttad" = kyrk-associerad el. original≠current >100m;
-- "samling" = ≥15 inskrifter inom ~100 m (Bergen/Uppsala/Lund/Sigtuna).
create or replace function runic_corpus_stats()
returns table(with_coords integer, moved integer, collection integer, clean integer,
              stones integer, portable integer, coins integer, plaster integer)
language sql stable as $$
  with pil as (
    select round((coordinates)[1]::numeric,3) la, round((coordinates)[0]::numeric,3) lo
    from runic_inscriptions where coordinates is not null group by 1,2 having count(*) >= 15
  ),
  f as (
    select ri.id, ri.object_type,
      (lower(coalesce(ri.location,'')||' '||coalesce(ri.current_location,'')) like '%kyrk%'
       or exists (select 1 from inscription_locations o join inscription_locations cu
            on o.inscription_id=cu.inscription_id and o.role='original' and cu.role='current'
            where o.inscription_id=ri.id and o.lat is not null and cu.lat is not null
              and ST_Distance(ST_SetSRID(ST_MakePoint(o.lng,o.lat),4326)::geography,
                              ST_SetSRID(ST_MakePoint(cu.lng,cu.lat),4326)::geography) > 100)) moved,
      exists (select 1 from pil where pil.la=round((ri.coordinates)[1]::numeric,3) and pil.lo=round((ri.coordinates)[0]::numeric,3)) coll
    from runic_inscriptions ri where ri.coordinates is not null
  )
  select count(*)::int,
    count(*) filter (where moved)::int,
    count(*) filter (where coll)::int,
    count(*) filter (where not moved and not coll)::int,
    count(*) filter (where object_type ilike '%runsten%' or object_type ilike '%runestone%' or object_type ilike '%gravhäll%')::int,
    count(*) filter (where object_type ilike '%pinne%' or object_type ilike '%träinskrift%' or object_type ilike '%runben%' or object_type ilike '%revben%' or object_type ilike '%märklapp%')::int,
    count(*) filter (where object_type ilike '%mynt%')::int,
    count(*) filter (where object_type ilike '%puts%')::int
  from f;
$$;
grant execute on function runic_corpus_stats() to anon, authenticated;
