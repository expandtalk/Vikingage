-- Verifierat sockenkyrkolager (Uppland + Ångermanland) ur RAÄ Bebyggelseregister.
-- Applicerad via MCP mot fjärr-DB (db push trasig i detta repo) — denna fil är proveniens.
-- Data (207 medeltida sockenkyrkor) laddas separat via psql (scripts/data, ej i repo).
--
-- Metod: dubbel-AI-extraktion (Claude + ChatGPT ur samma gpkg,
-- kulturhistoriskt_inventerad_bebyggelse_sverige.gpkg) korskollad — positionsavvikelse
-- median 1 m / max 75 m mellan extraktionerna → koordinater verifierade. Union + medeltidsfilter
-- (built_from <= 1550 eller dateringsklass "medeltid"). verified_by = om båda eller en extraktion hade kyrkan.
CREATE TABLE IF NOT EXISTS public.parish_churches (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  landskap          text,
  kommun            text,
  lan               text,
  built_from        integer,
  built_to          integer,
  dating_class      text,
  raa_object_id     text,
  register_url      text,
  lat               double precision NOT NULL,
  lng               double precision NOT NULL,
  geom              geometry(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
  coordinate_method text,
  source            text NOT NULL DEFAULT 'RAÄ Bebyggelseregister (kulturhistoriskt_inventerad_bebyggelse_sverige.gpkg)',
  license           text NOT NULL DEFAULT 'CC0',
  verified_by       text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS parish_churches_geom_gix ON public.parish_churches USING gist (geom);
CREATE INDEX IF NOT EXISTS parish_churches_landskap_idx ON public.parish_churches (landskap);

ALTER TABLE public.parish_churches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read parish_churches" ON public.parish_churches FOR SELECT USING (true);
CREATE POLICY "admin write parish_churches" ON public.parish_churches FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT SELECT ON public.parish_churches TO anon, authenticated;

COMMENT ON TABLE public.parish_churches IS
  'Verifierade medeltida sockenkyrkor (Uppland + Ångermanland) ur RAÄ Bebyggelseregister. Dubbel-AI-extraktion korskollad (pos-avvikelse median 1 m). För Rolandsson/Nyholm-klustringsmetoden.';
