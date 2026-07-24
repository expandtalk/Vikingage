-- 20260724190000_stone_ontology_kg.sql
-- Ontologi + KG kring stenkategorin. Ontologi-TYPER för alla; KG-NODER endast för de
-- kurerade, namngivna stenarna (Landamäri #3–6 + Vita sten) — ej de ~15k generiska.

-- 1. Ontologins typkatalog (visas på /ontologi): sten-lämningstyper.
INSERT INTO ontology_entity_types (code, label_sv, label_en, physical_table, id_column, coord_kind, status, description) VALUES
  ('milstolpe','Milsten/milstolpe','Milestone','heritage_sites','id','latlng','active',
   'Vägmärke: milsten/milstolpe (avståndsmarkering längs landsväg, 1649–1891 års gästgiveri-/väglag). Ur RAÄ/FMIS via K-samsök.'),
  ('gransmarke','Gränssten/gränsmärke','Boundary marker','heritage_sites','id','latlng','active',
   'Gränsmärke/råmärke mellan gårdar, socknar, härader eller riken. Ur RAÄ/FMIS; inkl. Landamäri-riksgränsstenar (Sverige–Danmark ~1050).'),
  ('vaghallningssten','Väghållningssten','Road-maintenance stone','heritage_sites','id','latlng','active',
   'Väghållningssten som markerade markägarens ansvar för en vägsträckas underhåll. Ur RAÄ/FMIS.')
ON CONFLICT (code) DO NOTHING;

-- 2. Saknade landskapsnoder (md5('landscape:'||namn)::uuid — samma konvention som befintliga).
INSERT INTO entity_registry (id, entity_type, label) VALUES
  (md5('landscape:Skåne')::uuid, 'landscape', 'Skåne'),
  (md5('landscape:Småland')::uuid, 'landscape', 'Småland'),
  (md5('landscape:Södermanland')::uuid, 'landscape', 'Södermanland')
ON CONFLICT (id) DO NOTHING;

-- 3. Kurerade sten-noder (id = heritage_sites.id), entity_type='gränsmärke'.
INSERT INTO entity_registry (id, entity_type, label)
SELECT h.id, 'gränsmärke', h.name FROM heritage_sites h
WHERE h.id IN (
  'dbf9b9d1-3c86-4273-bf18-79528740b295', -- Vita sten (Brännkyrka 230:1)
  'f410ac06-52b1-4be1-8cc3-97d7a3a394de', -- Kinne sten
  '2342eee0-d16f-4e21-9ab1-5dec8559d62c', -- Vite sten (Landamäri)
  '2e8baf93-ab82-4427-97a6-b581d9c4860c', -- Vrangs rör (Vraksnäs)
  '0b03f805-abe8-48eb-9060-8dc826502054'  -- Brorshall (Brömse sten?)
)
ON CONFLICT (id) DO NOTHING;

-- 4. located_in-kanter: sten -> landskap.
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT h.id, 'located_in', md5('landscape:'||h.landscape)::uuid, 'heritage_sites.landscape', 'certain'
FROM heritage_sites h
WHERE h.id IN (
  'dbf9b9d1-3c86-4273-bf18-79528740b295','f410ac06-52b1-4be1-8cc3-97d7a3a394de',
  '2342eee0-d16f-4e21-9ab1-5dec8559d62c','2e8baf93-ab82-4427-97a6-b581d9c4860c',
  '0b03f805-abe8-48eb-9060-8dc826502054')
  AND h.landscape IS NOT NULL
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = md5('landscape:'||h.landscape)::uuid AND er.entity_type='landscape')
ON CONFLICT DO NOTHING;

-- 5. Landamäri-tema + has_theme-kanter (endast de 4 Landamäri-stenarna; EJ Vita sten som är lokal).
INSERT INTO themes (id, name, name_en, slug, description)
VALUES (md5('theme:landamari')::uuid, 'Landamäri (riksgräns ~1050)', 'Landamäri (realm border ~1050)', 'landamari',
  'De sex gränsstenarna i Landamäri — det äldsta gränsavtalet mellan Sverige och Danmark (Äldre Västgötalagen, Cod. Holm. B 59).')
ON CONFLICT (id) DO NOTHING;
INSERT INTO entity_registry (id, entity_type, label)
VALUES (md5('theme:landamari')::uuid, 'theme', 'Landamäri (riksgräns ~1050)')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT h.id, 'has_theme', md5('theme:landamari')::uuid, 'Landamäri', 'probable'
FROM heritage_sites h
WHERE h.id IN (
  'f410ac06-52b1-4be1-8cc3-97d7a3a394de','2342eee0-d16f-4e21-9ab1-5dec8559d62c',
  '2e8baf93-ab82-4427-97a6-b581d9c4860c','0b03f805-abe8-48eb-9060-8dc826502054')
ON CONFLICT DO NOTHING;
