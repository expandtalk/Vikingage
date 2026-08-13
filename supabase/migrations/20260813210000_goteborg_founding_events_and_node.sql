-- Göteborgs grundningshistoria (events: 0 → 3) + kurerad content_page-nod som ankrar svaret rätt.
-- Koordinater VERIFIERADE: Färjenäs 57.6969/11.9031 (Färjenäsparken, Wikidata), central Göteborg
-- 57.7075/11.9675 (Gustaf Adolfs torg, Simplemaps CC BY 4.0). Källa: Wikipedia (Karl IX:s Göteborg /
-- Göteborgs historia). content_page 'goteborg' → entity_answer_context ankrar på Gustaf Adolfs torg
-- (var Hisingen) + länkar /sv/goteborg + listas på /sv/plats (Regioner & städer).
INSERT INTO historical_events (event_name, event_name_en, year_start, year_end, description, description_en, event_type, region_affected, sources, lat, lng, location_status, location_note)
SELECT v.name, v.name_en, v.ys, v.ye, v.descr, v.descr_en, v.etype, ARRAY['Västergötland','Bohuslän'], ARRAY[v.src], v.lat, v.lng, 'approximate', v.note
FROM (VALUES
  ('Karl IX grundar det första Göteborg vid Färjenäs','Charles IX founds the first Gothenburg at Färjenäs',
   1603,1603,'settlement',
   'Karl IX beslutade 1603 att anlägga staden Göteborg vid kronogården Färjestaden (senare Färjenäs) på Hisingen — det första Göteborg.',
   'In 1603 Charles IX decided to found the town of Gothenburg at the crown farm Färjestaden (later Färjenäs) on Hisingen — the first Gothenburg.',
   57.6969,11.9031,'Färjenäs/Färjestaden, Hisingen (Färjenäsparken)',
   'Wikipedia: Karl IX:s Göteborg / Göteborgs historia. Koordinat: Färjenäsparken (Wikidata).'),
  ('Danska trupper bränner ned det första Göteborg','Danish troops burn down the first Gothenburg',
   1611,1611,'military',
   'Under Kalmarkriget brände danska styrkor 1611 ned Karl IX:s Göteborg vid Färjenäs till grunden.',
   'During the Kalmar War, Danish forces burned Charles IX''s Gothenburg at Färjenäs to the ground in 1611.',
   57.6969,11.9031,'Färjenäs, Hisingen',
   'Wikipedia: Karl IX:s Göteborg / Göteborgs historia.'),
  ('Gustaf II Adolf återgrundar Göteborg — "Här ska staden ligga"','Gustavus Adolphus refounds Gothenburg — "Here shall the city lie"',
   1619,1619,'settlement',
   'Gustaf II Adolf beslutade 1619 att anlägga Göteborg på dess nuvarande plats söder om Göta älv. Tillfället är förevigat på Gustaf Adolfs torg (Fogelbergs staty).',
   'In 1619 Gustavus Adolphus decided to found Gothenburg at its present location south of the Göta river; the moment is commemorated at Gustaf Adolfs torg.',
   57.7075,11.9675,'Gustaf Adolfs torg, nuvarande Göteborg (central-koordinat, Simplemaps)',
   'Wikipedia: Göteborgs historia. Central-koordinat: Simplemaps World Cities (CC BY 4.0).')
) AS v(name, name_en, ys, ye, etype, descr, descr_en, lat, lng, note, src)
WHERE NOT EXISTS (SELECT 1 FROM historical_events e WHERE e.event_name = v.name);

INSERT INTO content_pages (slug, url, title_sv, title_en, kind, geom, geom_approx, priority, teaser_sv, teaser_en, verb_sv, verb_en)
SELECT 'goteborg','/sv/goteborg','Göteborg','Gothenburg','region',
  ST_SetSRID(ST_MakePoint(11.9675, 57.7075),4326), true, 50,
  'Grundad sent: 1603 vid Färjenäs på Hisingen (Karl IX), bränd av danskarna 1611, återgrundad 1619 av Gustaf II Adolf ("Här ska staden ligga"). Holländskt arv, skansar och hamnstad vid Göta älv.',
  'Founded late: 1603 at Färjenäs on Hisingen (Charles IX), burned by the Danes 1611, refounded 1619 by Gustavus Adolphus. Dutch heritage, redoubts and a harbour city on the Göta river.',
  'Utforska','Explore'
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug='goteborg');
