-- Runbleck: Sigtunas kopparbleck (Gustavson & Källström, Situne Dei 2016) + fyra bleck
-- undersökta med neutrontomografi vid ILL Grenoble 2026 (Berg, Fedrigo, Källström; RAÄ).
--
-- DISCIPLIN:
--  * transliteration lämnas NULL i ALLA rader — tolkningar/normaliseringar hör i
--    scholarly_notes, ALDRIG i translit-slotten (jfr translit-korruptions-audit).
--  * object_type återanvänder befintlig vokabulär ('Runbleck' / 'blybleck').
--  * Koordinater: Sigtuna = stadskoordinat (kvartersnivå ej som exakt punkt);
--    Alva/Väskinde = sockennivå; Källa = kyrkomonumentet. Alla verifierade (Nominatim/
--    viking_cities), coord_confidence markerar precisionen. Ingen koord ur minnet.
--  * Sl 1 (koppardosan 1911) finns redan som U Fv1912;8 → ej dubblerad.
--  * dating_confidence är numerisk i schemat → utelämnas (metod anges i dating_text).
--
-- Nyckeltema (Källström): koppar-/bronsbleck = förkristen tid/hednisk magi; blybleck =
-- medeltida/kristna böner (ofta latin). Sigtuna har HITTILLS bara kopparbleck, och de
-- flesta bär icke-lexikala pseudorunor — i skarp kontrast mot stadens många runben som
-- visar utbredd runkunnighet vid övergången vikingatid→medeltid.

INSERT INTO public.runic_inscriptions
  (signum, name, object_type, material, dimensions, location, parish, province, country,
   coordinates, coord_source, coord_confidence, dating_text, period_start, period_end,
   interpretation_confidence, scholarly_notes, bibliography, data_source, current_location)
SELECT
  v.signum, v.name, v.object_type, v.material, v.dimensions, v.location, v.parish, v.province, v.country,
  v.coordinates, v.coord_source, v.coord_confidence, v.dating_text, v.period_start, v.period_end,
  v.interpretation_confidence, v.scholarly_notes, to_jsonb(v.bibliography), v.data_source, v.current_location
FROM (VALUES
  -- ---- Sigtuna, sju kopparbleck (Situne Dei 2016) ----
  ('Sl 5','Sigtunablecket I (Sigtunagaldern)','Runbleck','Koppar',NULL,'kv. Granhäcken (Malmen)','Sigtuna','Uppland','Sverige',
   point(17.7234,59.6191),'Sigtuna stad (viking_cities)','ungefärlig (stadslager, kvartersnivå)','förmedeltid/tidig medeltid, tidigaste bebyggelsefasen ~1050–1150 (stratigrafisk, kv. Granhäcken)',1000,1150,'medel',
   'Sigtunas mest omtalade runbleck, funnet 1931 vid grundgrävning för en skola. Språkligt betydelsebärande, ristat på folkspråket. Tolkat som sjukdomsbesvärjelse (Eriksson & Zetterholm 1933) — sannolikt mot blodförgiftning/barnsängsfeber personifierad som tursarnas drott (þursa drōtinn) — alt. som skydd för boskap mot vargen (von Friesen 1935). Använder stavlösa runor. Tillvarataget i stadens kulturlager, EJ grav (mot äldre antagande).',
   'Gustavson & Källström, "Runbleck från Sigtuna", Situne Dei 2016; Eriksson & Zetterholm, Fornvännen 1933; Lindquist 1931; von Friesen 1935.','Situne Dei 2016','Statens historiska museum / Sigtuna museum'),

  ('Sl 3','Sigtunablecket II','Runbleck','Koppar',NULL,'kv. Humlegården','Sigtuna','Uppland','Sverige',
   point(17.7234,59.6191),'Sigtuna stad (viking_cities)','ungefärlig (stadslager, kvartersnivå)','tidig medeltid (osäker; kv. Humlegården, grävning 1927)',1000,1200,'låg',
   'Omvikt kopparbleck från Humlegården (grävning 1927, runorna uppmärksammade 1942). Möjligen betydelsebärande: Nordén (1943) läste en fornsvensk gengångarbesvärjelse; Svärdström (1969) invänder och ser ev. en inledande latinsk formel (hic/haec/hoc + kristi). Ingen samstämmig tolkning föreligger. Vissa likheter med Sl 5, bl.a. stavlösa runor. Stadslager, ej grav.',
   'Gustavson & Källström, Situne Dei 2016; Nordén 1943; Svärdström 1969.','Situne Dei 2016','Statens historiska museum / Sigtuna museum'),

  ('Sl 4','Sigtunablecket III','Runbleck','Koppar',NULL,'kv. Humlegården','Sigtuna','Uppland','Sverige',
   point(17.7234,59.6191),'Sigtuna stad (viking_cities)','ungefärlig (stadslager, kvartersnivå)','tidig medeltid (osäker; kv. Humlegården, grävning 1927)',1000,1200,'låg',
   'Kopparbleck ristat på båda sidor (Humlegården 1927). På ena sidan två runrader med bl.a. tre tvemadher-runor (Â) jämte flera okända teckenformer; baksidan saknar klar struktur utom ännu en tvemadher-runa. Icke-lexikal/pseudorunor. Bildar grupp med Sl 13 och Sl 118. Stadslager, ej grav.',
   'Gustavson & Källström, Situne Dei 2016.','Situne Dei 2016','Statens historiska museum / Sigtuna museum'),

  ('Sl 13','Runblecket Sl 13, kv. Granhäcken','Runbleck','Koppar',NULL,'kv. Granhäcken','Sigtuna','Uppland','Sverige',
   point(17.7234,59.6191),'Sigtuna stad (viking_cities)','ungefärlig (stadslager, kvartersnivå)','tidig medeltid ~1050–1150 (stratigrafisk, arkeologisk kontext 1985; Tesch 2006)',1050,1150,'låg',
   'Litet kopparbleck funnet vid arkeologisk undersökning 1985 i kv. Granhäcken (samma kvarter som Sl 5). Ristat på båda sidor med mer övertygande runformer än Sl 4/Sl 118, men ger ingen uttalbar teckenföljd. Formmässigt nära det nyupptäckta Sl 118. Stadslager, ej grav.',
   'Gustavson & Källström, Situne Dei 2016; Strid & Åhlén, Fornvännen 1986; Tesch 2006.','Situne Dei 2016','Statens historiska museum / Sigtuna museum'),

  ('Sl 118','Runblecket Sl 118 (museimagasinet, Sf 1375:7)','Runbleck','Koppar','58 × 15 × <1 mm','museimagasin (trol. kv. S:ta Gertrud, grävning 1927)','Sigtuna','Uppland','Sverige',
   point(17.7234,59.6191),'Sigtuna stad (viking_cities)','ungefärlig (stadslager, fyndplats oklar)','tidig medeltid (grupperas ~sent 1000-tal/tidigt 1100-tal)',1050,1150,'låg',
   'Återidentifierat 2014 i Sigtuna museums magasin (Anders Söderberg) bland jordfunna föremål (Sf 1375, ~70 föremål). Runor endast på framsidan (9 tecken), kraftigt vittrade; tre har huvudstavar ristade med dubbla linjer — mycket ovanligt i svenskt material och med närmaste motsvarighet på Sl 119. Teckenkaraktären gör det tveksamt om inskriften är språkligt betydelsebärande. Trol. från Gunnar Gihls grävning i kv. S:ta Gertrud 1927.',
   'Gustavson & Källström, Situne Dei 2016.','Situne Dei 2016','Sigtuna museum (Sf 1375:7)'),

  ('Sl 119','Runblecket Sl 119 (museimagasinet, Sf 1386:a)','Runbleck','Koppar','114 × 19–23 × <1 mm','museimagasin ("okänd fyndplats i Svarta jorden")','Sigtuna','Uppland','Sverige',
   point(17.7234,59.6191),'Sigtuna stad (viking_cities)','ungefärlig (stadslager, fyndplats oklar)','tidig medeltid (osäker)',1000,1200,'låg',
   'Återidentifierat 2014 i museimagasinet, brutet i två passande delar. Bär på BÅDA sidor nästan identiska, systematiskt ordnade runlika tecken, de flesta ristade med dubbla linjer. Nio centrala tecken i tre grupper om tre (2, 4 resp. 6 bågar) — betoningen på 3 och 9 antyder magiskt syfte snarare än lönnskrift. Enstaka tecken motsvarar äldre runraden (g/G, tvemadher ú). Bästa parallell: blyblecket från Källa ödekyrka (Öland, SHM 31153:321, sexarmad figur) samt amuletter från Gorodísjtje i Ryssland och ett bleck från Hovgården, Adelsö. Står för sig självt i Sigtunamaterialet.',
   'Gustavson & Källström, Situne Dei 2016; Pereswetoff-Morath (ms. 2016); Nosov 1990.','Situne Dei 2016','Sigtuna museum (Sf 1386:a)'),

  ('Sl 120','Runblecket från Götes mack','Runbleck','Kopparlegering','25 × 22 × 0,8 mm','Götes mack (busstorget, västra staden)','Sigtuna','Uppland','Sverige',
   point(17.7234,59.6191),'Sigtuna stad (viking_cities)','ungefärlig (stadslager)','övergång vikingatid→medeltid, sent 1000-tal/tidigt 1100-tal (stratigrafisk, AII/AIV-keramik)',1050,1125,'låg',
   'Funnet 2014 vid Arkeologikonsults undersökning vid Götes mack (33 vikingatida skelettgravar + tidigmedeltida bebyggelse); blecket hörde till bebyggelsefasen. Ristat på båda sidor (~8 tecken/sida) med pseudorunor byggda av huvudstavar, tvärstreck och bågar; enstaka regelrätta runor (b, h) och komplicerade bindrunor (u + k/þ/ʀ). Teckentyp känd från laggkärlsbotten på Helgeandsholmen (Stockholm, sent 1300-tal) och runristat ben från kv. Glambeck i Lund (1100–25). Stadslager, ej grav. I samma område spår av metallhantverk.',
   'Gustavson & Källström, Situne Dei 2016; Hed Jakobsson & Runer, Situne Dei 2016.','Situne Dei 2016','Sigtuna museum'),

  -- ---- Neutrontomografi-projektet, ILL Grenoble 2026 ----
  ('Binge, Alva (blybleck)','Runblecket från Binge, Alva','blybleck','Bly',NULL,'Binge','Alva','Gotland','Sverige',
   point(18.3610,57.2094),'Nominatim: Alva socken','ungefärlig (sockennivå)','vendeltid/tidig vikingatid, 600–700-tal (runtypologiskt: blandad äldre+yngre runrad)',600,800,'låg',
   'Blybleck som undersöktes med neutrontomografi vid Institut Laue-Langevin (ILL), Grenoble, 2026. Särskilt intressant: den synliga inskriften kombinerar runor ur både äldre och yngre runraden på ett sätt som pekar mot vendeltid/tidig vikingatid — samt en rad mycket märkliga runtecken som kan dölja lönnskrift. Anmärkningsvärt att blecket är av BLY, som annars kännetecknar medeltida bleck. Neutrontomografin visade att det finns runor även på den dolda (hopvikta) sidan; hela inskriften ännu ej framtagen (digital uppveckling av Per Ahlberg, Uppsala). Projekt: Helena Berg (Kulturarvslab. Visby), Anna Fedrigo (ILL), Magnus Källström (RAÄ, runläsning), föremål från Historiska museet.',
   'Källström & Berg, neutrontomografi-projektet ILL Grenoble 2026 (RAÄ, k-blogg / kulturarvsvetenskap).','RAÄ 2026 (neutrontomografi)','Statens historiska museum'),

  ('Källa ödekyrka (SHM 31153:321)','Blyblecket från Källa ödekyrka','blybleck','Bly',NULL,'Källa ödekyrka','Källa','Öland','Sverige',
   point(16.9863,57.1114),'Nominatim: Källa gamla kyrka (Wikidata Q1795326)','kyrkomonument','medeltid (blybleck)',1100,1400,'låg',
   'Medeltida blybleck från Källa ödekyrka (norra Öland), SHM inv. 31153:321. Bär en sexarmad figur som utgör den bästa kända parallellen till tecknen på Sigtunablecket Sl 119 (Pereswetoff-Morath). Ett av fyra bleck som undersöktes med neutrontomografi vid ILL Grenoble 2026 — tekniken avslöjade runor även på den dolda sidan (bly är ogenomträngligt för vanlig röntgen men inte för neutroner). Hela inskriften ännu ej framtagen.',
   'Källström & Berg, neutrontomografi-projektet ILL Grenoble 2026; Pereswetoff-Morath (ms. 2016).','RAÄ 2026 (neutrontomografi)','Statens historiska museum'),

  ('Gällungs I, Väskinde','Runbleck I från Gällungs, Väskinde','Runbleck','Koppar',NULL,'Gällungs','Väskinde','Gotland','Sverige',
   point(18.4202,57.6912),'Nominatim: Väskinde socken','ungefärlig (sockennivå)','vikingatid (kopparbleck, osäker)',800,1100,'låg',
   'Ett av två ihoprullade kopparbleck från Gällungs i Väskinde, undersökta med neutrontomografi vid ILL Grenoble 2026. Koppar visade sig svårare än bly: metallen kan inte utsättas för lika stark neutronstrålning (radioaktivitetsrisk), och ristningen syntes inte i den digitala bilden — inte ens runorna på utsidan. En teori är att metallytan är vaxbehandlad. Kräver andra undersökningsmetoder. Ihoprullat → stora delar av inskriften dold.',
   'Källström & Berg, neutrontomografi-projektet ILL Grenoble 2026.','RAÄ 2026 (neutrontomografi)','Statens historiska museum'),

  ('Gällungs II, Väskinde','Runbleck II från Gällungs, Väskinde','Runbleck','Koppar',NULL,'Gällungs','Väskinde','Gotland','Sverige',
   point(18.4202,57.6912),'Nominatim: Väskinde socken','ungefärlig (sockennivå)','vikingatid (kopparbleck, osäker)',800,1100,'låg',
   'Det andra av två ihoprullade kopparbleck från Gällungs i Väskinde (par med Gällungs I), neutrontomografi vid ILL Grenoble 2026. Se Gällungs I: kopparblecken gav ingen läsbar ristning i tomografin (trol. vaxbehandlad yta / neutronstyrkans begränsning), till skillnad från blyblecken från Binge och Källa där dolda runor kunde påvisas.',
   'Källström & Berg, neutrontomografi-projektet ILL Grenoble 2026.','RAÄ 2026 (neutrontomografi)','Statens historiska museum')
) AS v(signum, name, object_type, material, dimensions, location, parish, province, country,
   coordinates, coord_source, coord_confidence, dating_text, period_start, period_end,
   interpretation_confidence, scholarly_notes, bibliography, data_source, current_location)
WHERE NOT EXISTS (SELECT 1 FROM public.runic_inscriptions r WHERE r.signum = v.signum);
