-- Ingest: 38 fiskeställen (Daniels sammanställning fiskestallen_sverige_v2, 2026).
-- category='fiske', subtype=målart. Säsong (fler-intervall, t.ex. "mar-maj, okt-nov") som TEXT i
-- facts.season — single season_from/to_month passar inte; normalisering = följdsteg.
-- coord ALLA Approx (minne/Google Places), EJ Lantmäteri-verifierade → coord_precision='approximate'.
-- Idempotent: hoppar rader som redan finns (category='fiske' + samma name).
INSERT INTO public.experiences (name, category, subtype, lat, lng, coord_source, coord_precision, locality, source, rights_note, facts)
SELECT v.name, 'fiske', v.species, v.lat, v.lng, v.csrc, 'approximate', v.region,
  'Daniel Larsson, sammanställning fiskestallen_sverige_v2 (2026)',
  'Egen sammanställning; koordinat Approx (minne/Google Places), ej Lantmäteri-verifierad',
  jsonb_build_object('season', v.season, 'notes', v.notes, 'sweref99tm', jsonb_build_array(v.se, v.sn))
FROM (VALUES
('Mörrumsån (Kronolaxfisket)','Blekinge','Lax, havsöring',56.19175,14.748729,484406.5,6227449.6,'mar-sep','Pool 1-2 vid Laxens Hus, Kungsforsen. Premiär slutet av mars.','Google Places'),
('Emån, Ems herrgård','Småland / Kalmar län','Havsöring, lax',57.128716,16.497065,590625.1,6332708.6,'mar-okt','Klassisk sträcka nära mynningen vid Mönsterås.','Google Places'),
('Ölands södra udde (Ottenby/Långe Jan)','Öland','Havsöring (kust)',56.19604,16.398489,586775.4,6228778.7,'mar-maj, okt-nov','Sydudden, fiska båda sidorna beroende på vind.','Google Places'),
('Kapelludden','Öland','Havsöring (kust)',56.8213,16.8983,615861.4,6299100.8,'mar-maj, okt-nov','Ostkustens klassiker, revkanter och tångbälten.','Approx (udde)'),
('Östergarnslandet','Gotland','Havsöring (kust)',57.4333,18.9167,735082.1,6372396.3,'mar-apr, okt-nov','Världsklass kustöring.','Approx (område)'),
('Ljugarn','Gotland','Havsöring (kust)',57.3283,18.7083,723218.9,6360015.7,'mar-apr, okt-nov','Sydostkustens kända öringssträcka.','Approx (ort)'),
('Sankt Anna skärgård (Tyrislöt)','Östergötland','Gädda, abborre',58.321703,16.897288,611130.5,6466093.3,'apr-maj, sep-nov','Bas med båtramp och boende. Toppklass på gädda.','Google Places'),
('Nämdöfjärden','Stockholms skärgård','Gädda, abborre',59.22,18.7,711146.0,6570409.9,'apr-maj, sep-nov','Grunda vikar tidig vår, vassbälten på hösten.','Approx (fjärd)'),
('Vättern (Motala)','Östergötland','Röding',58.5371,15.0364,502119.3,6488510.3,'dec-apr','Trolling/vertikal. OBS fredningsområden.','Approx (hamn)'),
('Vänern (Kristinehamn)','Värmland','Gullspångslax, storöring',59.310068,14.108919,449267.4,6574918.3,'året runt, bäst okt-apr','Trollingfiske efter landlåst lax.','Google Places'),
('Hökensås Sportfiske','Västergötland','Regnbåge (put & take)',58.098253,14.073989,445415.3,6440023.6,'apr-okt','Ett 30-tal tallhedssjöar, flugfiskeklassiker.','Google Places'),
('Byskeälven (Fällfors)','Västerbotten','Lax',65.1071,20.7591,770197.7,7232722.7,'jun-aug','Älvens hjärta, högsäsong juni-juli.','Approx (ort)'),
('Ammarnäs / Vindelälven','Lappland','Öring, harr, röding',65.957628,16.210166,555013.6,7315717.8,'jun-sep','Älvfiske + röding i Tjulträsken.','Google Places'),
('Tjuonajokk (Kaitumälven)','Lappland','Harr',67.49224,21.06882,758912.2,7498938.3,'jun-sep','Helikopter från Gällivare. Harr över kilot.','Google Places'),
('Kukkolaforsen (Torneälven)','Norrbotten','Sik (håvfiske), lax',65.962899,24.033313,909446.9,7345334.2,'jun-sep','Traditionellt håvfiske sedan 1500-talet.','Google Places'),
('Stora Rör','Öland (västkust)','Havsöring (kust)',56.7519,16.5214,593031.6,6290802.2,'mar-maj, okt-dec','Kalmarsundssidan, funkar även vintertid vid milt väder.','Approx (hamn)'),
('Äleklinta','Öland (västkust)','Havsöring (kust)',56.98,16.57,595420.5,6316255.9,'mar-maj, okt-nov','Klappersten och djupt vatten nära land, klassisk sträcka.','Approx (ort)'),
('Byxelkrok / Neptuni åkrar','Öland (nordväst)','Havsöring (kust)',57.335,17.01,620993.6,6356464.5,'mar-maj, okt-nov','Grusrevlar norr om hamnen, vackert och fiskrikt.','Approx (ort)'),
('Grankullaviken (Norra udden)','Öland (norr)','Havsöring, gädda',57.36,17.08,625121.5,6359373.4,'apr-maj, sep-nov','Grund vik innanför Långe Erik, även vårlek gädda.','Approx (vik)'),
('Högby hamn / Bödakusten','Öland (ostkust)','Havsöring (kust)',57.17,17.03,622744.8,6338137.2,'mar-maj, okt-nov','Långa sandrevlar och tångruskor på ostkusten.','Approx (hamn)'),
('Bläsinge hamn','Öland (ostkust)','Havsöring (kust)',56.54,16.64,600847.1,6267387.0,'mar-maj, okt-nov','Revlar norr och söder om hamnen.','Approx (hamn)'),
('Gårdby / Norra Kvinneby','Öland (ostkust)','Havsöring (kust)',56.6,16.65,601301.4,6274079.1,'mar-maj, okt-nov','Klassiskt vadarfiske över tångbälten.','Approx (sträcka)'),
('Segerstads fyr','Öland (sydost)','Havsöring (kust)',56.325,16.53,594616.1,6243303.6,'mar-maj, okt-nov','Ödsligt och produktivt, långgrunt med djuprännor.','Approx (fyrplats)'),
('Färjestaden (brofästet)','Öland (västkust)','Havsöring, gädda',56.6597,16.4567,589293.8,6280454.7,'mar-maj, okt-dec','Strömsatt vatten kring bron, hemmavatten för många.','Approx (ort)'),
('Strömmen (Gamla stan)','Stockholm city','Lax, havsöring',59.3283,18.0716,674747.6,6580639.6,'året runt, bäst maj-sep lax','Fritt fiske mitt i stan sedan 1636 - unik urban laxfiskeplats.','Approx (Norrbro)'),
('Ingaröfjärden','Stockholms skärgård','Gädda, abborre',59.25,18.55,702413.5,6573281.9,'apr-maj, sep-nov','Nära stan, grunda vikar och sund.','Approx (fjärd)'),
('Möja','Stockholms skärgård','Gädda, abborre',59.42,18.9,721246.8,6593307.2,'apr-maj, sep-nov','Mellanskärgårdens pärla, guidat fiske finns.','Approx (ö)'),
('Sandhamn','Stockholms skärgård','Havsöring, horngädda',59.2886,18.913,722843.9,6578734.7,'apr-jun','Ytterskärgård, horngäddan kommer i maj.','Approx (ort)'),
('Dalarö / Jungfrufjärden','Stockholms skärgård','Gädda, gös',59.13,18.42,695690.7,6559543.0,'apr-maj, sep-nov','Södra skärgårdens klassiker, gös på sommaren.','Approx (fjärd)'),
('Furusund / Blidö','Stockholms skärgård (norr)','Gädda, abborre',59.66,18.92,720803.7,6620069.9,'apr-maj, sep-nov','Norra skärgårdens sund och vikar.','Approx (ort)'),
('Björkfjärden (Mälaren)','Mälaren','Gös, gädda',59.4,17.55,644777.6,6587367.4,'jun-sep gös','Mälarens gösfiske håller hög klass, vertikal och trolling.','Approx (fjärd)'),
('Göta älv (centrala Göteborg)','Göteborg','Lax, öring',57.72,11.97,319539.3,6401573.3,'mar-sep','Laxfiske mitt i stan, kortfiske via Sportfiskarna.','Approx (älvsträcka)'),
('Säveån (Jonsered)','Göteborg / Partille','Lax, öring',57.748,12.174,331814.8,6404163.6,'mar-sep','Laxförande å i vacker bruksmiljö, begränsat antal kort.','Approx (ort)'),
('Vrångö (södra skärgården)','Göteborgs skärgård','Havsöring, makrill',57.5667,11.7833,307615.1,6385031.1,'öring mar-maj, makrill jun-sep','Bilfri ö, vadfiske på västsidan.','Approx (ö)'),
('Hönö / Öckerö','Göteborgs skärgård (norr)','Makrill, torsk, havsöring',57.6897,11.6431,299911.8,6399120.5,'jun-sep makrill','Klippfiske och båtfiske, lätt att nå med färja.','Approx (ö)'),
('Vinga','Göteborgs skärgård','Makrill, havsfiske',57.632,11.605,297320.3,6392814.9,'jun-sep','Ytterskärgård, båtutflykt med havsfiskekaraktär.','Approx (ö)'),
('Delsjöarna','Göteborg','Regnbåge, gädda, abborre',57.69,12.05,324156.7,6398025.0,'apr-okt','Stadsnära put & take, kort via Sportfiskarna Göteborg.','Approx (sjö)'),
('Marstrand / Hakefjorden','Bohuslän (Göteborgsområdet)','Havsöring, makrill',57.8866,11.5924,297994.9,6421175.4,'öring mar-maj, makrill jun-sep','Klassiskt bohuslänskt kustfiske.','Approx (ort)')
) AS v(name, region, species, lat, lng, se, sn, season, notes, csrc)
WHERE NOT EXISTS (SELECT 1 FROM public.experiences e WHERE e.category='fiske' AND e.name = v.name);
