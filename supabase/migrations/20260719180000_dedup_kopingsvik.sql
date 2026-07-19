-- Köpingsvik fanns dubbelt i viking_cities. Behåll raden med koordinater, ta bort dubbletten.
delete from public.viking_cities
where id in (
  select id from (
    select id, row_number() over (
      partition by lower(name), lower(coalesce(region,''))
      order by (coordinates is not null) desc, id
    ) rn
    from public.viking_cities where name ilike 'köpingsvik'
  ) t where rn > 1
);
