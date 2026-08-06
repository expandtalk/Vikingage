-- Sigtuna medeltida stadskyrkor + koppling till Sigtuna socken (för parish_governance/RegionFindsView).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
--
-- Fakta ur Wikipedia + Upplandsmuseets rapporter 2012:21 (Ölund); koord ur Wikidata P625.
-- Där verifierad koordinat saknas i källa: lat/lng NULL (obelagt) — INGEN GISSNING.
-- Sigtuna parish_id = a61dc86b-8fb7-4b12-bc35-753469441222 (parish_type='other'/stad).
-- parish_governance krävde tidigare parish_type='socken' → Sigtuna (stad) föll bort; relaxat nedan.

-- 1) Länka + berika befintliga Sigtuna-kyrkor
UPDATE public.ecclesiastical_sites SET
  parish_id = 'a61dc86b-8fb7-4b12-bc35-753469441222',
  dating_class = 'Medeltida — klosterkyrka, invigd 1247',
  built_from = COALESCE(built_from, 1247),
  patron_saint = COALESCE(patron_saint, 'Maria'),
  status = COALESCE(status, 'in_use'),
  historical_notes = COALESCE(historical_notes,
    'Dominikankonventets klosterkyrka, invigd 1247 — Mälardalens äldsta tegelkyrka. Enda av Sigtunas 8–11 medeltida kyrkor som är intakt och i bruk. Räddades vid reformationen 1529 som församlingskyrka medan övriga stadskyrkor fick förfalla.'),
  source = COALESCE(source, 'Wikipedia; Upplandsmuseets rapporter 2012:21 (Ölund)')
WHERE name = 'Mariakyrkan' AND municipality ILIKE 'Sigtuna%';

UPDATE public.ecclesiastical_sites SET
  parish_id = 'a61dc86b-8fb7-4b12-bc35-753469441222',
  historical_notes = COALESCE(historical_notes,
    'Dominikankonvent etablerat 1237 (efter ett misslyckat försök ca 17 år tidigare). Klosterbyggnaderna revs vid reformationen 1529 och teglet fraktades till Vasaslotten; klosterkyrkan (Mariakyrkan) räddades som församlingskyrka.'),
  source = COALESCE(source, 'Wikipedia; Upplandsmuseets rapporter 2012:21 (Ölund)')
WHERE name = 'Mariakyrkan Sigtuna';

UPDATE public.ecclesiastical_sites SET
  parish_id = 'a61dc86b-8fb7-4b12-bc35-753469441222',
  kind = 'cathedral',
  dating_class = COALESCE(dating_class, 'Ca 1100, ruin'),
  built_from = COALESCE(built_from, 1100),
  curated = true,
  historical_notes = COALESCE(historical_notes,
    'Stod färdig omkring 1100. Anses ha varit ärkestiftets domkyrka före flytten till Gamla Uppsala 1190. Restaurerad ruin (2019), åter öppen för allmänheten.'),
  source = COALESCE(source, 'Wikipedia (Redelius); Wikidata')
WHERE name = 'Sankt Pers kyrkoruin' AND municipality ILIKE 'Sigtuna%';

-- 2) Saknade medeltida stadskyrkor (idempotent via NOT EXISTS på namn)
INSERT INTO public.ecclesiastical_sites
  (name, kind, parish_id, municipality, county, landscape, lat, lng,
   built_from, dating_class, patron_saint, status, curated, historical_notes, source)
SELECT * FROM (VALUES
  ('Sankt Olofs kyrkoruin','parish_church','a61dc86b-8fb7-4b12-bc35-753469441222'::uuid,'Sigtuna kommun','Stockholms län','Uppland',
    59.61836, 17.72120, 1075, 'Stenkyrka ca 1075–1100; ruin', 'Olof (Olav)', 'ruin', true,
    'Ligger på Mariakyrkans kyrkogård väster om Mariakyrkan. Föregicks av gravgård ca 980–1050, träkyrka ca 1050–1075 och en äldre stenkyrka; nuvarande ruin från 1100-talets början. Koordinat Wikidata Q10661450.',
    'Wikipedia; Wikström 2006; Upplandsmuseets rapporter 2012:21; Wikidata Q10661450'),
  ('Sankt Lars kyrkoruin','parish_church','a61dc86b-8fb7-4b12-bc35-753469441222'::uuid,'Sigtuna kommun','Stockholms län','Uppland',
    59.61697, 17.72003, 1100, '1100-tal; ruin', 'Laurentius', 'ruin', true,
    'Uppförd vid kristnandet på 1100-talet, i bruk till reformationen. Reparerad 1586 och nyttjades därefter som skola. Eldhärjad 1658 och blev ruin; idag återstår främst det raserade västtornet. Koordinat Wikidata Q10661400.',
    'Wikipedia; Wikidata Q10661400'),
  ('Sankt Nicolai kyrka (Sigtuna)','parish_church','a61dc86b-8fb7-4b12-bc35-753469441222'::uuid,'Sigtuna kommun','Stockholms län','Uppland',
    NULL, NULL, 1150, '1100-talets senare del; utplånad', 'Nicolaus', 'destroyed', true,
    'En av Sigtunas yngre medeltidskyrkor (1100-talets senare del), möjligen köpmännens/sjöfarandes kyrka. Utplånad ner till grundmurarna; exakt läge obelagt (ingen verifierad koordinat).',
    'Wikipedia (Redelius)'),
  ('Sankta Gertruds kyrkoruin','parish_church','a61dc86b-8fb7-4b12-bc35-753469441222'::uuid,'Sigtuna kommun','Stockholms län','Uppland',
    NULL, NULL, NULL, 'Medeltida ruin', 'Gertrud', 'ruin', true,
    'Medeltida kyrkoruin i Sigtuna (Wikidata Q10659440). Verifierad koordinat saknas i källa — läge obelagt.',
    'Wikidata Q10659440'),
  ('Sigtuna biskopskyrka','cathedral','a61dc86b-8fb7-4b12-bc35-753469441222'::uuid,'Sigtuna kommun','Stockholms län','Uppland',
    NULL, NULL, 1080, '1000-talets slut; riven på 1200-talet', NULL, 'destroyed', true,
    'Stadens första stenkyrka, från 1000-talets slut, belägen mitt i staden (grunden syns på Sigtuna museums tomt). Revs på 1200-talet. Exakt koordinat obelagt.',
    'Wikipedia (Sigtuna museum)')
) AS v(name,kind,parish_id,municipality,county,landscape,lat,lng,built_from,dating_class,patron_saint,status,curated,historical_notes,source)
WHERE NOT EXISTS (
  SELECT 1 FROM public.ecclesiastical_sites e WHERE e.name = v.name
);

-- 3) Relaxa parish_governance: räkna även stad/other-parishes (Sigtuna = stad, ej socken);
--    returnera även lat/lng/patron_saint (för kartmarkörer i RegionFindsView).
CREATE OR REPLACE FUNCTION public.parish_governance(p_socken text)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  WITH ch AS (
    SELECT e.id, e.name, e.kind, e.built_from, e.dating_class, e.status, e.image_url, e.diocese_id,
           e.lat, e.lng, e.patron_saint, d.name AS diocese_name
    FROM public.ecclesiastical_sites e
    JOIN public.parishes p ON p.id = e.parish_id
    LEFT JOIN public.dioceses d ON d.id = e.diocese_id
    WHERE lower(p.name) = lower(p_socken) AND p.parish_type IN ('socken','stad','other')
  )
  SELECT json_build_object(
    'churches', (SELECT coalesce(json_agg(json_build_object(
        'name', name, 'kind', kind, 'built_from', built_from, 'dating_class', dating_class,
        'status', status, 'image_url', image_url, 'diocese', diocese_name,
        'lat', lat, 'lng', lng, 'patron_saint', patron_saint) ORDER BY built_from NULLS LAST), '[]'::json) FROM ch),
    'history', (SELECT coalesce(json_agg(row_to_json(hh)), '[]'::json) FROM (
        SELECT DISTINCT d.name AS diocese, h.from_year, h.to_year, h.note
        FROM public.church_diocese_history h JOIN public.dioceses d ON d.id = h.diocese_id
        WHERE h.church_id IN (SELECT id FROM ch)
        ORDER BY h.from_year) hh),
    'leadership', (SELECT coalesce(json_agg(row_to_json(ll)), '[]'::json) FROM (
        SELECT l.person_name, l.role, l.from_year, l.to_year, d.name AS diocese
        FROM public.ecclesiastical_leadership l JOIN public.dioceses d ON d.id = l.diocese_id
        WHERE l.diocese_id IN (SELECT DISTINCT diocese_id FROM ch WHERE diocese_id IS NOT NULL)
        ORDER BY l.from_year NULLS LAST) ll)
  );
$function$;
