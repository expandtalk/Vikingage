-- Ortnamnsled braut (väg) + drag (portage), Brötastenen-reconcile, Revsudden som korsningsnod.
-- Källkritik: braut (Bröta = vägen Grödinge–Södertälje, Brötastenen Sö 292) ≠ bröte (abatis, Olaus Magnus 1555)
-- — två skilda ord; braut är sällsynt och taggas per namn. drag = dragställe/portage (produktiv led).
-- Brötastenen = Sö 292 verifierat (sv.wikipedia). Revsudden = smalaste Kalmar–Öland (node_type 'strait').

INSERT INTO ortnamn_element_config (element_key, label, category, strength, include, forms, owner, note, period_stratum)
SELECT * FROM (VALUES
  ('braut','braut/bröt (väg)','communication','probable',true,'bröt, bröta, braut, -bröte',
   'system','Fornsv. braut = väg (besläktat med bryta väg). Ex. Bröta i Grödinge = gamla vägen Grödinge–Södertälje, med Brötastenen (Sö 292). OBS: ej samma ord som bröte = abatis/vägspärr (Olaus Magnus 1555). Sällsynt; tagga per namn. Källa: SOL 2003.',NULL),
  ('drag','drag/-ed (dragställe, portage)','communication','probable',true,'drag, draget, drag-ed, dragby',
   'system','Dragställe/ed — där båtar drogs mellan vatten (portage), ofta smalaste passagen. Ex. Draget (Botkyrka, Tullingesjön/Alby); Drag vid Revsudden (smalaste Kalmar–Öland). Produktiv led. Källa: SOL 2003.',NULL)
) AS v(element_key,label,category,strength,include,forms,owner,note,period_stratum)
WHERE NOT EXISTS (SELECT 1 FROM ortnamn_element_config c WHERE c.element_key = v.element_key);

UPDATE runic_inscriptions SET name='Brötastenen'
 WHERE signum='Sö 292' AND (name IS NULL OR name='');

INSERT INTO maritime_nodes (name, name_en, node_type, lat, lng, enclosure, coord_precision, description, source_uri)
SELECT 'Revsudden','Revsudden','strait',56.7737431,16.4749128,'sund','approx',
  'Smalaste överfarten Kalmar–Öland (Kalmarsunds norra del). Korsnings-/färjenod; intill ortnamnet "Drag" (56.779/16.420) = dragställe + RAÄ-fornlämningar vid näset. Jfr Draget i Botkyrka.',
  'https://sv.wikipedia.org/wiki/Revsudden'
WHERE NOT EXISTS (SELECT 1 FROM maritime_nodes WHERE name='Revsudden');

UPDATE place_names SET element_keys = array_append(coalesce(element_keys,'{}'), 'braut')
 WHERE name='Bröthagen' AND lat BETWEEN 59.10 AND 59.11 AND NOT ('braut' = ANY(coalesce(element_keys,'{}')));
UPDATE place_names SET element_keys = array_append(coalesce(element_keys,'{}'), 'drag')
 WHERE ((name='Draget' AND lat BETWEEN 59.24 AND 59.25) OR (name='Drag' AND lat BETWEEN 56.77 AND 56.79))
   AND NOT ('drag' = ANY(coalesce(element_keys,'{}')));
