-- Sökefterfrågan på keyword-nivå, kopplad till entitet (person/plats/namn). Driver:
--   1) VILKA namn/personer vi ska ha  (entity_label + entity_kind)
--   2) VIKT per entitet               (aggregerad volume → vilka sidor byggs tunga)
--   3) VAD man söker i kombination     (keyword grupperat per entitet → FAQ-kandidater)
--   4) HUR söksvarssidan visas         (serp_features → vilka block: PAA, Knowledge panel, Image pack, AI Overview)
-- Källa: Ahrefs-export (konkurrent-organic + egna). Sökvolym = INTERN signal, republiceras EJ (Ahrefs ToS).
-- Keyword/volym är fakta om marknaden; vi lagrar dem för prioritering, inte som publikt innehåll.

CREATE TABLE IF NOT EXISTS public.entity_search_demand (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  entity_label text,             -- primär entitet ur Ahrefs "Entities", t.ex. "Gustav I"
  entity_kind text,              -- 'person','plats','namn','övrig' (ur "(Person)"/"(Location)"…)
  resolved_entity_type text,     -- vår KG-typ vid matchning: 'person','historical_king','viking_name'… (nullable)
  resolved_entity_id uuid,       -- fylls av senare rekonciliering (nullable)
  country text,
  language text,
  volume int,                    -- månatlig sökvolym (lokal marknad)
  intent text,                   -- primär: informational/navigational/commercial/transactional
  branded boolean DEFAULT false,
  serp_features text[],          -- ['People also ask','Knowledge panel','Image pack','AI Overview','Thumbnail','Video preview']
  kd numeric,
  cpc numeric,
  competitor_url text,           -- vem som rankar (current || previous URL) — konkurrentspaning
  source text NOT NULL DEFAULT 'ahrefs',
  dataset text,                  -- vilken export, t.ex. 'historiska-personer.nu 2026-08-20'
  captured_date date,
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.entity_search_demand IS 'Sökefterfrågan per keyword, kopplad till entitet. INTERN prioriteringssignal (Ahrefs) — sökvolym republiceras ej. Driver namnval, sidvikt, FAQ-kandidater och val av söksvarsblock (serp_features).';

CREATE UNIQUE INDEX IF NOT EXISTS entity_search_demand_uniq
  ON public.entity_search_demand (lower(keyword), coalesce(country,''), coalesce(dataset,''));
CREATE INDEX IF NOT EXISTS entity_search_demand_kind ON public.entity_search_demand (entity_kind);
CREATE INDEX IF NOT EXISTS entity_search_demand_label ON public.entity_search_demand (lower(entity_label));
CREATE INDEX IF NOT EXISTS entity_search_demand_vol ON public.entity_search_demand (volume DESC);
CREATE INDEX IF NOT EXISTS entity_search_demand_resolved ON public.entity_search_demand (resolved_entity_type, resolved_entity_id);
CREATE INDEX IF NOT EXISTS entity_search_demand_serp ON public.entity_search_demand USING gin (serp_features);

ALTER TABLE public.entity_search_demand ENABLE ROW LEVEL SECURITY;
-- INTERN signal: läsning endast för admin (till skillnad från övriga faktatabeller). Sökvolym ej publik.
DROP POLICY IF EXISTS "entity_search_demand admin read" ON public.entity_search_demand;
CREATE POLICY "entity_search_demand admin read" ON public.entity_search_demand FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "entity_search_demand admin write" ON public.entity_search_demand;
CREATE POLICY "entity_search_demand admin write" ON public.entity_search_demand FOR ALL USING (is_admin()) WITH CHECK (is_admin());
