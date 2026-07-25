-- Tekniska innovationer → species_introductions (category='innovation', proxy_type='teknik').
-- geom är GENERERAD (utelämnas). Renderas av useMapSpeciesMarkers (epok-överlapp date_from/to).
-- Koordinater approximativa/representativa fyndplatser. Idempotent på (entity, category).

insert into species_introductions
  (entity, category, proxy_type, site_name, region, lat, lng, date_from, date_to, date_text, confidence, source, note)
select v.entity, 'innovation', 'teknik', v.site, v.region, v.lat, v.lng, v.df, v.dt, v.dtext, v.conf, v.src, v.note
from (values
  ('Segel (segelrigg)', 'Gotland (bildstenar)', 'Gotland', 57.60, 18.30, 600, 800, '600–800 e.Kr.', 'medium',
   'Gotländska bildstenar; allmän skeppsarkeologi',
   'Segelteknik på skandinaviska skepp, avbildad på gotländska bildstenar ca 700. Inspiration via kontinentala/frisiska och österländska kontakter — en förutsättning för vikingatidens långfärder.'),
  ('Hjulet & vagnen', 'Trundholm', 'Danmark/Norden', 55.93, 11.60, -1800, -1400, 'ca 1800–1400 f.Kr.', 'medium',
   'Trundholms solvagn; bronsålderns materiella kultur',
   'Hjul och vagn sprids till Norden under äldre bronsålder; Trundholms solvagn (~1400 f.Kr.) vittnar om vagnens rituella betydelse. Kontinentalt ursprung.'),
  ('Ekerhjul / stridsvagn', 'Södra Skandinavien', 'Norden', 57.00, 14.00, -1600, -1100, 'ca 1600–1100 f.Kr.', 'low',
   'Hällristningar; bronsåldersikonografi',
   'Ekerhjulet (lätt stridsvagn) avbildas på hällristningar under bronsåldern — teknik med kontinentalt/stäppursprung.'),
  ('Tamhästen', 'Södra Skandinavien', 'Norden', 55.50, 13.00, -2000, -1500, 'ca 2000–1500 f.Kr.', 'medium',
   'aDNA och arkeozoologi (stäppursprung)',
   'Den domesticerade hästen sprids till Norden under bronsålder; ytterst av stäppursprung, kopplad till indoeuropeisk expansion.'),
  ('Stigbygeln', 'Vendel/Valsgärde', 'Uppland', 59.90, 17.60, 550, 800, '550–800 e.Kr.', 'medium',
   'Vendeltida ryttargravar (Vendel, Valsgärde)',
   'Stigbygeln, med ursprung på den eurasiska stäppen (avarer) och förmedlad via kontinenten, förändrar ryttarkrigföringen; syns i vendeltida ryttargravar.'),
  ('Ramsadeln', 'Södra Skandinavien', 'Norden', 58.00, 15.00, 1, 400, '1–400 e.Kr.', 'low',
   'Romersk järnålder; kontinental påverkan',
   'Ramsadeln introduceras under romersk järnålder genom kontinental (romersk) påverkan.'),
  ('Romerska lyximporter', 'Östergötland', 'Norden', 58.40, 15.60, 1, 400, '1–400 e.Kr.', 'medium',
   'Vapengravar och importfynd (romersk järnålder)',
   'Glas, brons och lyxföremål från Romarriket når Norden via handelsvägar (bl.a. bärnstensrutten) och blir statusmarkörer i vapengravar — inspiration från kontinenten och senare Konstantinopel.')
) as v(entity, site, region, lat, lng, df, dt, dtext, conf, src, note)
where not exists (
  select 1 from species_introductions s where s.entity = v.entity and s.category = 'innovation'
);
