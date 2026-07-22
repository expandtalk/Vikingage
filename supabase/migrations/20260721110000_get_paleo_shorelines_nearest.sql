-- RPC för strandlinjelagret. Applicerad via MCP mot fjärr-DB (db push trasig i detta
-- repo) — denna fil är proveniens. Returnerar strandlinjeskivan närmast ett givet år
-- (year_ce) som GeoJSON-strängar, snappar till närmaste tillgängliga skiva. Läs-only, publik.
CREATE OR REPLACE FUNCTION public.get_paleo_shorelines_nearest(p_year int)
RETURNS TABLE(id uuid, period_label text, year_ce int, water_body_type text, geojson text)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH pick AS (
    SELECT ps.year_ce AS y
    FROM public.paleo_shorelines ps
    WHERE ps.model_version = 'sgu_strandforskjutning'
    ORDER BY abs(ps.year_ce - p_year), ps.year_ce
    LIMIT 1
  )
  SELECT ps.id, ps.period_label, ps.year_ce, ps.water_body_type, ST_AsGeoJSON(ps.geom)
  FROM public.paleo_shorelines ps, pick
  WHERE ps.model_version = 'sgu_strandforskjutning' AND ps.year_ce = pick.y
  ORDER BY ps.water_body_type;
$$;

GRANT EXECUTE ON FUNCTION public.get_paleo_shorelines_nearest(int) TO anon, authenticated;
