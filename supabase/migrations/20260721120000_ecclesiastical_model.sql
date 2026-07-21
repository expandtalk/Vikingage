-- Kyrklig datamodell (kyrkor/stift/ledarskap) — SLUTLIGT SCHEMA.
-- Applicerad stegvis via MCP mot fjärr-DB (db push trasig i repot) — denna fil är proveniens
-- och speglar sluttillståndet. Plan: docs/superpowers/plans/2026-07-21-kyrkor-stift-ledarskap.md

CREATE TABLE IF NOT EXISTS public.dioceses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  name_en text,
  seat text,
  realm text,                       -- 'sverige' | 'danmark' | 'hre' (Hamburg-Bremen)
  founded_year int,
  archdiocese_from_year int,        -- år det blev ärkestift (Lund 1103, Uppsala 1164)
  metropolitan_of uuid REFERENCES public.dioceses(id),
  dissolved_year int,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ecclesiastical_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  kind text NOT NULL DEFAULT 'parish_church'
    CHECK (kind IN ('parish_church','chapel','cathedral','monastery','nunnery','hospital','holy_place','bishopric')),
  lat double precision,
  lng double precision,
  geom geometry(Point,4326) GENERATED ALWAYS AS
    (CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN ST_SetSRID(ST_MakePoint(lng, lat), 4326) END) STORED,
  landscape text,
  parish text,
  municipality text,
  county text,
  parish_id uuid REFERENCES public.parishes(id),        -- socken (namn-/spatialkopplad)
  hundred_id uuid REFERENCES public.hundreds(id),        -- härad (via parishes.hundred_external_id)
  built_from int,
  built_to int,
  dating_class text,
  founded_year int,
  dissolved_year int,
  religious_order text,
  significance_level text,
  status text,
  description text,
  description_en text,
  historical_notes text,
  diocese_id uuid REFERENCES public.dioceses(id),
  heritage_site_id uuid REFERENCES public.heritage_sites(id),
  raa_object_id text,
  register_url text,
  external_id text,                                      -- t.ex. Wikidata QID (proveniens/dedup)
  source text,
  license text,
  verified_by text,
  legacy_table text,                                     -- 'parish_churches' | 'christian_sites' | 'heritage_sites' | 'wikidata'
  legacy_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (legacy_table, legacy_id)
);

CREATE TABLE IF NOT EXISTS public.church_diocese_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.ecclesiastical_sites(id) ON DELETE CASCADE,
  diocese_id uuid NOT NULL REFERENCES public.dioceses(id),
  from_year int, to_year int, note text, source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ledarskap gäller ETT STIFT (ärkebiskop/biskop) ELLER EN KYRKA (kyrkoherde/abbot).
CREATE TABLE IF NOT EXISTS public.ecclesiastical_leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid REFERENCES public.ecclesiastical_sites(id) ON DELETE CASCADE,
  diocese_id uuid REFERENCES public.dioceses(id),
  person_name text,
  king_id uuid REFERENCES public.historical_kings(id),
  role text NOT NULL CHECK (role IN ('archbishop','bishop','parish_priest','abbot','abbess','prior','dean','provost')),
  from_year int, to_year int, source text, wikipedia_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eccl_leadership_target_chk CHECK (church_id IS NOT NULL OR diocese_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS eccl_sites_geom_gix ON public.ecclesiastical_sites USING gist (geom);
CREATE INDEX IF NOT EXISTS eccl_sites_kind_idx ON public.ecclesiastical_sites (kind);
CREATE INDEX IF NOT EXISTS eccl_sites_diocese_idx ON public.ecclesiastical_sites (diocese_id);
CREATE INDEX IF NOT EXISTS eccl_parish_idx ON public.ecclesiastical_sites (parish_id);
CREATE INDEX IF NOT EXISTS eccl_hundred_idx ON public.ecclesiastical_sites (hundred_id);
CREATE INDEX IF NOT EXISTS eccl_leadership_church_idx ON public.ecclesiastical_leadership (church_id);
CREATE INDEX IF NOT EXISTS eccl_leadership_diocese_idx ON public.ecclesiastical_leadership (diocese_id);
CREATE INDEX IF NOT EXISTS eccl_leadership_role_idx ON public.ecclesiastical_leadership (role);
CREATE INDEX IF NOT EXISTS church_diocese_hist_church_idx ON public.church_diocese_history (church_id);

-- RLS: publik läsning, admin-skrivning (mönster = paleo_shorelines/heritage_sites)
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['dioceses','ecclesiastical_sites','church_diocese_history','ecclesiastical_leadership']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "public read %1$s" ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY "public read %1$s" ON public.%1$I FOR SELECT USING (true);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "admin write %1$s" ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY "admin write %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());', tbl);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated;', tbl);
  END LOOP;
END $$;