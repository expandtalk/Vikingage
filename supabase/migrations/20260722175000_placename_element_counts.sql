-- Räknar hur ofta varje namnled förekommer i ortnamnsregistret, uppdelat på OSM-
-- gazetteern (analysunderlag) och det kurerade urvalet. Applicerad via MCP execute_sql;
-- fil = proveniens. Används på /place-names för att visa t.ex. hur många orter som bär
-- tor/frö/oden — jämförbart med runkorpusen.
create or replace function public.placename_element_counts()
returns table(element_key text, n_osm integer, n_curated integer)
language sql stable set search_path to 'public' as $$
  select k as element_key,
    count(*) filter (where source = 'osm')::int,
    count(*) filter (where source is distinct from 'osm')::int
  from place_names, unnest(element_keys) k
  where lat is not null
  group by k;
$$;
