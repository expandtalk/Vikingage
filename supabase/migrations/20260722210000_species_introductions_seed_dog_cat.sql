-- species_introductions: första sourcade seed (hund + katt). Applicerad via MCP
-- execute_sql; fil = proveniens. Koordinater null tills verifierade (OSM/Fornsök) —
-- hitta inte på. Konfidens: belagd (genom-bekräftat, peer-review) / trolig (zooark/
-- populärvetenskap) / hypotes (populärhistoriskt narrativ).
-- Källor:
--   Bergström, A. et al. 2026. Genomic history of early dogs in Europe. Nature 651:986–994
--     (CC BY 4.0). — genom-bekräftade hundar (Kesslerloch 14,2 ka; svenska mesolitiska
--     Bökeberg/Tågerup; gropkeramisk Ajvide; Gökhem omdaterad vikingatid; 21 danska).
--   Populär Historia 3/2020 (I. Svanberg). — zooark (Hornborgasjön ~7000 f.Kr., Östergötland
--     barngrav), ikonografi (Tanum bronsålder), text (blot/"hundhedning", larmfunktion).
--   SVERAK/Kattförbundet (populärhistoria). — katt-kulturkontext (Egypten, spridning).
--     OBS: ej skandinavisk arkeologi; skandinaviska kattfynd SAKNAS i datalagret.
-- Nyttodjur-tolkning (Daniel): katt=råttfångst (pestrelevant), hund=jakt+larm/skydd.
--   Delvis källbar (Svanberg: larm, blot); i övrigt tolkning — flaggas i note.
insert into public.species_introductions (entity,category,proxy_type,site_name,region,landscape,date_text,date_from,date_to,uncertainty,confidence,source,note) values
('hund','djur','adna','Kesslerloch','Schweiz',null,'~14 200 år sedan (14,2 ka) — äldsta genom-bekräftade hunden',-12250,-12250,'normal','belagd','Bergström et al. 2026, Nature 651:986 (CC BY 4.0)','Skjuter tillbaka hundens genetiska diversifiering till >14,2 ka.'),
('hund','djur','adna','Bökeberg','Sverige','Skåne','mesolitikum ~8 ka (helgenom 13×)',-6000,-6000,'normal','belagd','Bergström et al. 2026, Nature 651:986 (CC BY 4.0)','En av 8 genom-bekräftade mesolitiska hundar i Sverige.'),
('hund','djur','adna','Tågerup','Sverige','Skåne','mesolitikum (Kongemose/Ertebølle)',-5500,-5000,'normal','belagd','Bergström et al. 2026, Nature 651:986 (CC BY 4.0)',null),
('hund','djur','adna','Ajvide (gropkeramisk kultur)','Sverige','Gotland','~4,8 ka — mesolitisk härkomst-kontinuitet',-2850,-2850,'normal','belagd','Bergström et al. 2026, Nature 651:986 (CC BY 4.0)','>3 årtusenden ancestry-kontinuitet i jägar-Skandinavien.'),
('hund','djur','adna','Frälsegården, Gökhem','Sverige','Västergötland','omdaterad till yngre järnålder/vikingatid (1 154 cal BP)',800,800,'normal','belagd','Bergström et al. 2026, Nature 651:986 (CC BY 4.0)','Ny 14C-datering ger vikingatid, ej neolitikum.'),
('hund','djur','adna','danska mesolitiska/neolitiska boplatser','Danmark',null,'~9–5 ka (21 hundar bekräftade)',-7000,-3000,'normal','belagd','Bergström et al. 2026, Nature 651:986 (CC BY 4.0)','Lokala mesolitiska hundar levde vidare genom neolitiska övergången.'),
('hund','djur','zooarchaeology','Hornborgasjön','Sverige','Västergötland','~7000 f.Kr. — tre hundgravar med rödockra',-7000,-7000,'normal','trolig','Populär Historia 3/2020 (I. Svanberg)','Äldsta svenska belägg; rituell status.'),
('hund','djur','zooarchaeology','Östergötland (barngrav)','Sverige','Östergötland','~4 500 år sedan — barn i famnen på gammal hund',-2500,-2500,'normal','trolig','Populär Historia 3/2020 (I. Svanberg)',null),
('hund','djur','iconography','Tanum (hällristning)','Sverige','Bohuslän','bronsålder — krigare med tolkade hundar',-1500,-500,'hög','trolig','Populär Historia 3/2020 (I. Svanberg)','Ikonografisk proxy; motivtolkning osäker.'),
('hund','djur','text','Norden (blot/"hundhedning")','Sverige',null,'fram till kristnandet — hundoffer i blot',700,1100,'normal','trolig','Populär Historia 3/2020 (I. Svanberg)','Nyttodjur + rituell roll; larmfunktion.'),
('katt','djur','text','Egypten (Bast-kult, Bubastis)','Egypten',null,'~5000 år sedan — katten helig',-3000,-3000,'hög','hypotes','SVERAK/Kattförbundet (populärhistoria)','Kulturkontext, ej arkeologiskt datum.'),
('katt','djur','text','spridning Egypten→Italien→Europa','Europa',null,'~900 f.Kr. Italien; ~900 e.Kr. England',-900,900,'hög','hypotes','SVERAK/Kattförbundet (populärhistoria)','Nyttodjur (råttfångst, pestrelevant). Skandinaviska fynd saknas.')
on conflict do nothing;
