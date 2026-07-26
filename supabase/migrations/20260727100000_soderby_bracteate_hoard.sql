-- Söderbyskatten — folkvandringstida guldbrakteatfynd, Danmarks socken, Uppland.
-- Eget fynd (coins-tabellen, category='hoard', metal='gold'), ej kopplat till Mora-hypoteserna.
-- Källa: Lamm et al. 2000; Rundkvist & Westerholm, "Kammargravfältet vid Danmarksby", Fornvännen;
-- Zachrisson 2010.
--
-- INTEGRITET: exakt fyndplats var ett kärr uppe i skogen Lunsen (funnet 1876 vid dikesgrävning,
-- kompletterat med metallsökare 1995) — ej exakt inmätt. Koordinat = Söderby by (verifierad via
-- Nominatim: 59.80772, 17.75641), markerad som ungefärlig i find_place. Ingen bild lagras (ingen
-- verifierad öppen bildkälla till hands).

INSERT INTO public.coins
  (name, name_en, category, metal, denomination, period_start, period_end,
   find_place, coordinates, obverse, significance, description, description_en, sources)
SELECT
  'Söderbyskatten (guldbrakteater)',
  'The Söderby hoard (gold bracteates)',
  'hoard', 'gold', 'guldbrakteat', 450, 540,
  'Söderby, Danmarks socken, Uppland — nedlagt i kärr i skogen Lunsen (ungefärlig plats, by-koordinat)',
  point(17.75641, 59.80772),
  'Enkelsidiga guldhängen (brakteater) med pressbleck: mytologiska motiv.',
  'Ett av få guldbrakteatfynd i Mälarområdet och unikt rikt på bildmotiv. Den stora brakteaten (framme 1995) är unik: en person med stav intrasslad i en orm, biten av ett odjur — omöjlig att säkert knyta till någon bevarad fornnordisk berättelse (Oden? Loke?). Fyra medelstora visar en skäggig man i baklängesvolt med två kroknäbbade fåglar över huvudet — tolkat som Oden i sejd-trans med sina korpar/örnar; motivet finns annars bara vid Lau backar (Gotland) och Ulvsunda. Fem korsbrakteater tolkas som crux gemmata (juvelbesatt kors, jfr Ravenna) — kristen bildkonst i hednisk kontext. Vittnar om folkvandringstidens elit som offrade sitt romarguld när klimatkatastrofen 536–540 slog till.',
  'Depåfynd av tio guldbrakteater samt småguld (tenar och spiraler), nedlagt vid folkvandringstidens slut (ca 540 e.Kr.). Guldbrakteater tillverkades bara ca 450–540 och bars endast av kvinnor; de är mycket ovanliga i Mälarområdet. Tre modeller ingår: (1) en stor med människor och djur, (2) fyra medelstora med en man, ett djur och två fåglar (voltigörmotiv, Oden?), (3) fem medelstora med kors. Funnet 1876 vid dikesgrävning i ett kärr i skogen Lunsen, kompletterat med metallsökare 1995. Söderby låg vid bygdens södra gräns mot skogen, ca 3 km söder om kammargravfältet vid Danmarksby och ca 1,5 km från Mora äng — samma kommunikationskorridor mellan Uppsala och Knivsta/Alsike. Förvaras på Statens historiska museum.',
  'A hoard of ten gold bracteates plus scrap gold (rods and spirals), deposited at the close of the Migration Period (c. AD 540). Gold bracteates were made only c. 450–540 and worn only by women; they are very rare in the Mälaren region. Three models are present: (1) one large with humans and animals, (2) four medium with a man, an animal and two birds (a somersaulting figure, Odin?), (3) five medium with a cross. Found in 1876 during ditch-digging in a bog in the Lunsen forest, supplemented by metal-detecting in 1995. Söderby lay at the southern edge of the settled land against the forest, c. 3 km south of the Danmarksby chamber-grave cemetery and c. 1.5 km from the Mora meadow — the same corridor between Uppsala and Knivsta/Alsike. Held at the Swedish History Museum.',
  'Lamm, J.P. et al. 2000, "Der Brakteat der Jahrhunderts", Frühmittelalterliche Studien 34; Rundkvist, M. & Westerholm, A., "Kammargravfältet vid Danmarksby", Fornvännen; Zachrisson, T. 2010, Situne Dei.'
WHERE NOT EXISTS (SELECT 1 FROM public.coins WHERE name = 'Söderbyskatten (guldbrakteater)');
