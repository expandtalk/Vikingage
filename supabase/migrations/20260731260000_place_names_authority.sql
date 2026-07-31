-- God ortnamnssed: gör namnkällan explicit. `name` fylls till 99 % från OSM (crowdsourcat,
-- ej de LM-normerade formerna som Kulturmiljölagen 1:4 pekar ut som normerande). Vi
-- införer proveniens: name_authority (osm|wikidata|lantmateriet) + normed_name (auktoritetens
-- form). När name_authority <> 'osm' bör UI visa normed_name som gällande form; OSM-formen
-- bevaras som variant. QID-crosswalk lever i external_ids (scheme='wikidata').
ALTER TABLE place_names ADD COLUMN IF NOT EXISTS name_authority text NOT NULL DEFAULT 'osm';
ALTER TABLE place_names ADD COLUMN IF NOT EXISTS normed_name text;
COMMENT ON COLUMN place_names.name_authority IS 'Auktoritet som display-namnet följer: osm (ej normerat) | wikidata (proxy för LM-form) | lantmateriet (godkänd form)';
COMMENT ON COLUMN place_names.normed_name IS 'Namnform enligt auktoritet (LM/Wikidata). Visa denna som gällande när name_authority <> osm.';

NOTIFY pgrst, 'reload schema';
