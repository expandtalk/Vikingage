-- Avsiktslager för egna sökmotorn.
-- entity_facets = kurerade "bryt-i-val"-facetter per entitet (renderas som chips i GlobalSearch,
--   sida vid sida med KG-grannar från graph_neighborhood). prior_weight = ordningsprior (kan
--   senare matas av SEO-intent-datan); locale null=båda, annars geo-viktning sv/en.
-- entity_senses = homonym-disambiguering. En rad per betydelse av en söksträng. our_domain=true =
--   vår kanoniska mening (guden Tor, ringborgen Sandby); our_domain=false = off-topic homonym som
--   visas "vid sidan", avmarkerad ("det fokuserar vi inte på").

CREATE TABLE IF NOT EXISTS entity_facets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  facet_key text NOT NULL,
  label_sv text NOT NULL,
  label_en text NOT NULL,
  destination text NOT NULL,
  is_external boolean NOT NULL DEFAULT false,
  icon text,
  prior_weight numeric NOT NULL DEFAULT 1,
  locale text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (entity_type, entity_id, facet_key)
);
CREATE INDEX IF NOT EXISTS idx_entity_facets_entity ON entity_facets(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS entity_senses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  sense_label_sv text NOT NULL,
  sense_label_en text NOT NULL,
  our_domain boolean NOT NULL,
  rank int NOT NULL DEFAULT 0,
  entity_type text,
  entity_id uuid,
  destination text,
  note_sv text,
  note_en text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_entity_senses_term ON entity_senses(lower(term));

ALTER TABLE entity_facets ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_senses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read entity_facets" ON entity_facets;
CREATE POLICY "public read entity_facets" ON entity_facets FOR SELECT USING (true);
DROP POLICY IF EXISTS "public read entity_senses" ON entity_senses;
CREATE POLICY "public read entity_senses" ON entity_senses FOR SELECT USING (true);

-- Pilot-seed: Sandby borg (hillfort) + homonym-demo (Tor).
INSERT INTO entity_facets (entity_type, entity_id, facet_key, label_sv, label_en, destination, is_external, icon, prior_weight) VALUES
 ('hillfort','53969468-2554-4b19-871a-2fa51d79f333','massacre','Massakern & fynden','The massacre & finds','/sv/sandby-borg#massakern',false,'AlertTriangle',100),
 ('hillfort','53969468-2554-4b19-871a-2fa51d79f333','coins','Romerska guldmynt (Åbyskatten)','Roman gold coins (Åby hoard)','/sv/sandby-borg#skatter',false,'Coins',90),
 ('hillfort','53969468-2554-4b19-871a-2fa51d79f333','seafort','Sjöborg — visa på kartan','Sea fort — show on map','/explore?center=56.55253,16.63926&zoom=15',false,'MapPin',80),
 ('hillfort','53969468-2554-4b19-871a-2fa51d79f333','visit','Besök borgen (oland.se)','Visit (oland.se)','https://www.oland.se/sandby-borg',true,'ExternalLink',40)
ON CONFLICT (entity_type, entity_id, facet_key) DO NOTHING;

INSERT INTO entity_senses (term, sense_label_sv, sense_label_en, our_domain, rank, entity_type, entity_id, destination, note_sv, note_en) VALUES
 ('sandby borg','Sandby borg (ringborg, Öland)','Sandby borg (ring fort, Öland)',true,0,'hillfort','53969468-2554-4b19-871a-2fa51d79f333','/sv/sandby-borg','Folkvandringstida ringborg','Migration-Period ring fort'),
 ('sandby','Sandby borg (ringborg, Öland)','Sandby borg (ring fort, Öland)',true,0,'hillfort','53969468-2554-4b19-871a-2fa51d79f333','/sv/sandby-borg','Folkvandringstida ringborg','Migration-Period ring fort'),
 ('tor','Tor (åskguden)','Thor (the thunder god)',true,0,'god',NULL,'/explore?focus=gods','Nordisk åsk- och åskvädersgud','Norse god of thunder'),
 ('tor','Tor Browser','Tor Browser',false,5,NULL,NULL,NULL,'Anonymitetsprogramvara — det fokuserar vi inte på.','Anonymity software — not our focus')
ON CONFLICT DO NOTHING;
