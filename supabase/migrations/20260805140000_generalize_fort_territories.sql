-- Generaliserad borgterritorie-RPC: Voronoi/Thiessen över fornborgar inom en bbox, klippt till samma bbox.
-- Öland-varianten delegerar hit. Applicerad i prod 2026-08-05 via MCP apply_migration (denna fil = repo-spegling).
create or replace function public.fort_territories(
  minx double precision, miny double precision, maxx double precision, maxy double precision
)
returns table(fort_name text, dated boolean, period_start integer, period_end integer, geojson text)
language sql stable as $$
  with forts as (
    select name, ST_SetSRID(coordinates::geometry, 4326) as g,
           (dating_basis is not null) as dated, period_start, period_end
      from swedish_hillforts
     where coordinates is not null
       and ST_Y(coordinates::geometry) between miny and maxy
       and ST_X(coordinates::geometry) between minx and maxx
  ),
  vor as ( select (ST_Dump(ST_VoronoiPolygons(ST_Collect(g)))).geom as cell from forts ),
  clip as (
    select ST_Intersection(ST_SetSRID(cell,4326),
             ST_SetSRID(ST_MakeEnvelope(minx,miny,maxx,maxy),4326)) as cell from vor
  )
  select f.name, f.dated, f.period_start, f.period_end, ST_AsGeoJSON(c.cell)
    from clip c join forts f on ST_Contains(c.cell, f.g);
$$;

create or replace function public.oland_fort_territories()
returns table(fort_name text, dated boolean, period_start integer, period_end integer, geojson text)
language sql stable as $$
  select * from public.fort_territories(16.35, 56.20, 17.10, 57.37);
$$;

grant execute on function public.fort_territories(double precision,double precision,double precision,double precision) to anon, authenticated;
