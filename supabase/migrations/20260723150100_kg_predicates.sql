-- 20260723150100_kg_predicates.sql
INSERT INTO rel_predicates (code, label_sv, label_en, subject_type, object_type, description) VALUES
  ('belongs_to_dynasty', 'tillhör dynasti', 'belongs to dynasty', 'king',   'dynasty',   'Kung tillhör kungadynasti (ur historical_kings.dynasty_id).'),
  ('has_estate',         'har gods',        'has estate',        'king',   'estate',    'Kung innehar kungsgård/förläning (ur estate_holdings.king_id).'),
  ('has_cult_site',      'har kultplats',   'has cult site',     'god',    'cult_site', 'Gud dyrkad på kultplats (ur cult_sites.deity).')
ON CONFLICT (code) DO NOTHING;
