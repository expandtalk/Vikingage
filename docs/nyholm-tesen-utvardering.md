# Nyholm-tesen — en datadriven utvärdering

*Vad Viking Age-plattformens data säger om hypoteserna i Agneta Nyholm / Sofiainstitutet, "I modern, valan och den heliga hästens spår – en studie i ett försvunnet kulturarv" (revisionsdokument uppl. 14, 2025-10-03).*

---

## 1. Syfte

Dokumentet framlägger en rad hypoteser om att svenska ortnamn bevarar spår av en undertryckt kvinnlig gudinnekult, som kristnandet och senare stavningsreformer skulle ha skrivit bort. Flera av påståendena är **distributionella** — de handlar om var saker ligger i landskapet — och därför testbara mot vår data. Denna utvärdering prövar dem empiriskt, med baslinjekontroll, och skiljer det som håller från det som inte gör det.

## 2. Vårt underlag

| Datamängd | Antal | Källa |
|---|---|---|
| Kyrkliga platser (kyrkor, kapell, kloster) | 4 592 | Wikidata (CC0) |
| — därav med belagt byggår | 1 762 | Wikidata P571 |
| — därav medeltida (byggår < 1550) | 607 | |
| — därav **daterade före 1200** (analysurvalet) | **77** | |
| Klassificerade ortnamn (efterled/förled) | 434 | Wikidata tätort/småort/by (CC0) |
| Övriga fornlämningar (dösar, gånggrifter, bildstenar, skeppssättningar, vårdkasar) | ~1 900 | RAÄ Fornsök (K-samsök) |

**Viktig avgränsning:** dateringsanalyserna vilar på de **77 kyrkor som har ett belagt byggår före 1200**. Wikidatas byggårstäckning är partiell (1 762 av 4 592), så detta är ett *stickprov* av de tidigaste kyrkorna, inte en fullständig förteckning. Ortnamnslagret (434) är likaså ett stickprov ur tätort/småort/by, inte hela gazetteern.

## 3. Metod

- **Spatial motor:** PostGIS i plattformens Postgres. Avstånd mäts på `geography` (meter), grannbestämning med GiST-index (`<->` KNN).
- **Två oberoende mått:**
  1. **9 km-buffert:** andel av en ortnamnskategori som ligger inom 9 km av minst en tidig kyrka (`ST_DWithin`).
  2. **Närmaste granne:** medianavstånd från varje ortnamn till närmaste kyrka/kapell.
- **Baslinjekontroll:** samma mått för *alla* klassificerade ortnamn, så att en kategoris närhet kan jämföras mot slumpförväntan. Utan baslinje blir varje frekvent element ett skenbart "mönster".
- **Ingen fabricering:** endast verifierade koordinater (Wikidata/RAÄ). Inga gissade lägen.

## 4. Hypoteserna som testats

### H1 — "De äldsta sockenkyrkorna byggdes på platser med namnen Val, Hammar, Ed"
Dokumentets egna handräknade tal: Ed 43, Val 36, Hammar 20.

**Test:** förekomst av Val-/Ed-/Hammar-förled bland våra 77 daterade kyrkor före 1200, mot baslinjen alla 4 223 kyrkor.

| Element | I 77 tidigaste | I alla 4 223 |
|---|---|---|
| Val- | 1 | 32 (0,8 %) |
| Ed- | 0 | 24 (0,6 %) |
| Hammar- | 0 | 23 (0,5 %) |

**Resultat: faller.** De äldsta kyrkorna visar noll anrikning. Dokumentets egna tal (~0,7–1,7 % av ~2 500 socknar) *är* basnivån för mycket vanliga topografiska efterled (vall = betesmark, ed = näs/led, hammar = klippa). Ingen baslinjekontroll görs i dokumentet — det är det centrala metodfelet.

#### H1 fördjupning — "val" är inget enhetligt namnelement

En rimlig invändning är: analyserade vi verkligen alla orter där *val* är invävt — Valsätra, Valsta, Valbo, Valsjö, Valberg? **Nej.** H1-testet prövade endast "val"-förled i de 77 tidiga kyrkornas namn (1 träff: Vallentuna kyrka), och "val" är medvetet *inte* ett av de klassade namnelementen i vår gazetteer.

Skälet är metodologiskt och går till kärnan av kritiken: i de här namnen är det **efterledet** som bär betydelsen, inte "val":

| Ort | Meningsbärande efterled |
|---|---|
| Val**sätra** | -sätra (centralort) |
| Val**sta** | -sta(d) (bebyggelse) |
| Val**bo** | -bo (boplats) |
| Val**sjö** | -sjö (sjö) |
| Val**berg** | -berg (höjd) |
| Vall**by** / Vallen**tuna** | -by / -tuna |

Att behandla "val" som en enhet blandar minst tre skilda ord — *val* (val/rund), *valr* (de fallna, jfr Valhall) och framför allt *vall* (betesmark, ofta skrivet med dubbel-L). Det är **samma hopklumpning som fäller H1**: ett vanligt, mångtydigt ordfragment ger många träffar utan att betyda något gemensamt.

**Vi körde den riktiga analysen.** 37 orter med val-/vall-förled hämtades från Wikidata (CC0), klassades **på efterledet** och mättes mot närmaste kyrka (närmaste granne, `ST_Distance` på geography):

| Grupp | Antal | Median till kyrka | Inom 1 km |
|---|---|---|---|
| **Alla val-orter** | 37 | **1 760 m** | 30 % |
| *Baslinje (alla ortnamn)* | 434 | *1 575 m* | *37 %* |
| — efterled centralort (-tuna/-sätra) | 1 | 393 m | 100 % |
| — efterled natur (-sjö/-berg…) | 5 | 881 m | 60 % |
| — efterled bebyggelse (-sta/-by/-bo…) | 12 | 1 642 m | 33 % |
| — utan produktivt efterled (Valla, Vall, Valö…) | 19 | 1 920 m | 16 % |

**Resultat:** val-orterna som grupp ligger *under* baslinjen (1 760 m vs 1 575 m; 30 % vs 37 % inom 1 km) — "val" i sig kännetecknar alltså **ingen** särskild kyrknärhet. Variationen styrs helt av efterledet: det enda centralortsnamnet (Vallentuna) ligger 393 m från kyrkan, medan de "renaste" val-namnen *utan* produktivt efterled (Valla, Vall, Valö) ligger **längst** bort (1 920 m, bara 16 % inom 1 km). Efterledet förutsäger kyrknärhet, inte "val". Det bekräftar H1-kritiken empiriskt.

*Förbehåll: delgrupperna är mycket små (centralort n = 1, natur n = 5) — per-efterled-talen är anekdotiska. Det robusta är att val-gruppen som helhet inte är särskilt kyrknära, och att de mest renodlade val-namnen ligger längst från kyrka.*

**Slutsats:** "val" kännetecknar ingenting i sig. Betydelsen — och kyrknärheten — sitter i efterledet. Vill man pröva ett namnelement måste man klassa på efterledet och baslinjetesta varje typ för sig; annars upprepar man dokumentets grundfel.

### H2 — "Kristnandet knöt an till förkristna kultplatser" (kyrkor på gamla noder)
**Test:** andel av varje ortnamnskategori inom 9 km av en tidig kyrka (< 1200).

| Namnkategori | Inom 9 km |
|---|---|
| Centralort (Husby/Tuna/Sal) | **29 %** |
| Bebyggelse (-inge/-hem) | 23 % |
| Ting/rätt (hammar/hundra) | 15 % |
| Sakralt (teofort/-lund) | 13 % |

**Resultat: delvis — men åt andra hållet än tesen.** Det är de **sekulära maktnamnen** (kungsgård/hall/stormannagård) som korrelerar starkast med de tidiga kyrkorna, inte kult- eller tingsnamnen. Stöder "makten byggde kyrkan", inte "en bortskriven gudinna".

### H3 — "Hammar är knutet till tingsplatser / ligger nära sockenkyrkorna"
**Test:** medianavstånd från namnkategori till närmaste kyrka, mot baslinjen.

| Namntyp | Median till kyrka | Inom 1 km |
|---|---|---|
| Centralort (Husby/Tuna/Sal) | **751 m** | 57 % |
| Bebyggelse | 1 139 m | 46 % |
| **Alla ortnamn (baslinje)** | **1 575 m** | 37 % |
| Sakralt | 2 015 m | 28 % |
| **Ting/rätt (hammar/hundra)** | **2 072 m** | 24 % |

**Resultat: faller.** Hammar-/tingsnamn ligger *längre* från kyrkorna än ett slumpmässigt ortnamn (2 072 m vs 1 575 m). Att rensa bort de post-medeltida industri-/bruksnamnen (Hallstahammar, Surahammar, Nyhammar …) ändrar inte medianen (2 124 → 2 119 m) — problemet är inte bruken, hammar-namn klustrar helt enkelt inte vid kyrkor. "Hammar = tingsplats" **kan inte prövas** (vi saknar ett georefererat tingsplats-lager), och materialet ger inget indirekt stöd.

### H4 — Ligger fornlämningarna vid sockenkyrkorna? (närmaste granne per typ)

Ett direkt test av kontinuitetstesen: om kyrkorna medvetet restes på gamla kult- och gravmonument bör dessa ligga *närmare* kyrkan än slumpen.

**Del A — fornlämningstyper.** Medianavstånd till närmaste kyrka (alla 4 223 kyrkor i `heritage_sites`, geodetiskt på PostGIS `geography`), mot en täthetsbaslinje: grannkyrkor ligger i median ~2 850 m isär ≈ hur långt en *slumpmässig* plats har till närmaste kyrka.

| Typ | Antal | Median till kyrka | Inom 1 km |
|---|---|---|---|
| Bildstenar | 192 | 972 m | 52 % |
| Gånggrifter | 426 | 1 333 m | 37 % |
| Dösar | 192 | 1 444 m | 25 % |
| Skeppssättningar | 865 | 2 376 m | 12 % |
| **Baslinje (slumpmässig plats → kyrka)** | — | **~2 850 m** | — |

En gradient framträder, men **åt fel håll för tesen**: de största, mest synliga rituella monumenten — skeppssättningarna — ligger *längst* från kyrkorna (på slumpnivå), inte närmast. Megaliterna ligger ~2× närmare än slumpen, vilket förklaras av delad landskapsekonomi (både fornlämningar och kyrkor följer åkermark; megaliterna sitter i kyrktäta Falbygden/Skåne) snarare än medveten placering.

**Del B — runmaterialet, uppdelat.** "Runinskrifter" är hela runkorpusen, inte bara resta minnesstenar. Delas det upp (svenska inskrifter, mätt mot kyrkor **exkl. moderna**, baslinje grannkyrka ~3 557 m) faller det isär:

| Klass | Antal | Median → kyrka | Med namngiven ristare |
|---|---|---|---|
| Kyrko-/byggnadsinskrift (puts, dopfunt, klocka) | 232 | ~12 m | 3 % |
| Gravmonument (gravhäll, Eskilstunakista) | 500 | ~12 m | 4 % |
| **Rest runsten (minnessten)** | 1 678 | **1 148 m** | **35 %** |
| Fragment | 579 | 70 m | 12 % |

Det förklarar varför en naiv sammanslagning ger "~150 m": medianen dras ner av objekt som *per definition* sitter i kyrkan — gravhällar, putsklotter och inmurade fragment. Den genuina **resta minnesstenen ligger ~1,1 km från kyrkan** (~3× närmare än slumpen, men klart *utanför*), och är huggen av namngivna professionella **runristare** (35 % attribuerade) — inte av "druider" (ett keltiskt fenomen utan nordisk motsvarighet).

**Flera stenar per kyrka:** 680 kyrkor har ≥1 runinskrift inom 200 m, 357 har ≥2, 30 har ≥10. Topplistan (medeltidskyrkor) domineras av gravhälls- och samlingskyrkor: Lunds och Uppsala domkyrkor, Spånga, Väversunda (26 gravmonument), Köping på Öland — alltså kristna gravmiljöer, inte kultplatser.

**Metodnot (moderna kyrkor):** kyrklagret innehåller ~1 180 efterreformatoriska kyrkor och 91 moderna frikyrkor. En modern pingstkyrka i Uppsala "toppade" först runstenslistan — en ren artefakt: en klump Upplandsstenar med approximativ Uppsala-koordinat snäppte till närmaste kyrkpunkt. Filtreras kyrkorna till byggår < 1550 (+ odaterade, minus frikyrkor; 3 043 st) försvinner artefakten och stenarna knyts korrekt till domkyrkan. Siffrorna i Del B använder detta rensade kyrklager.

**Slutsats:** kontinuitetstesen får inget stöd. Det kyrknära runmaterialet är antingen (a) kristet gravmaterial och kyrkinskrifter som hör kyrkan till, eller (b) sekundärt återbrukade stenar (inmurade/flyttade). De genuina resta minnesstenarna ligger ~1 km ut, och de största rituella monumenten längst bort. Samstämmer med H2: tidiga kyrkor följer maktens och böndernas landskap, inte de förkristna kultmonumenten. **Mönstret stärker slutsatsen: kyrkan omges av kristet gravmaterial och återbrukade stenar — inte av bevarad hednisk kult.**

**Datahål under åtgärd — heliga källor:** det skarpaste kontinuitetstestet vore avstånd mellan **offer-/traditionskällor** och kyrka (helgonkällan invid kyrkan är en klassisk pagan→kristen markör). Lagret finns i RAÄ Fornsök: lämningstypen "Källa med tradition" ger **2 095 verifierade lämningar med koordinat** (K-samsök `itemName="Källa med tradition"`), och import är förberedd via samma pipeline som de 211 vårdkasarna (körs när databasombygget står stilla). Metodfel att undvika innan resultatet tolkas:

- **Kategorin är bred.** "Källa med tradition" blandar hednisk offerkälla, medeltida helgonkälla och sentida folktro — traditionen är inte med nödvändighet förkristen. Resultatet mäter närhet, inte kontinuitetens riktning.
- **Praktisk konfundering:** en kyrka behövde vatten. En källa nära kyrkan kan vara infrastruktur, inte kultarv. Närhet ≠ kontinuitet.
- **Baslinje krävs:** jämför källa→kyrka mot slumppunkt→kyrka (som i H4), annars blir varje närhet skenbar.
- **Ingen fabricering:** endast poster med `gml:coordinates` direkt ur RAÄ importeras (dedup på `source_uri`).

### H5 — "Vagn/vång-namnen är dolda vagnskultplatser som föregick sockenkyrkorna"

Nyholm läser vång/väng/vang (~1 300 i Sverige) som dolda *vagn*-namn — ceremoniella vagnsplatser som blev moderkyrkor — och avfärdar standardtolkningen 'åker/inhägnad mark'.

**Kvalitetskontroll — etymologin håller inte:**

- **vång ≠ vagn.** Fornsvenska *vanger*/*vang* = inhägnad åker/gärde, ett centralt begrepp i det gamla **vångalaget** (tresädet): byns marker hette Norrvång, Östervång, Södervång. Det förklarar direkt Nyholms egna exempel *Sudervanga/Norrvanga* (Gotland) och *Västervala/Östervala* som väderstrecks-åkrar — motsatsen till en mystisk läsning.
- **Nyholms egna medeltidsformer motbevisar tesen.** *Vanghum* (1257, dativ pluralis "vid åkrarna"), *Vengium/Vengia* (1291, dativ av väng), *Wanga* (1322) — alla pekar på *vang(er)* (åker). Ingen bär vagns hårda -g- (*vagn*); dolde namnen "vagn" borde formerna visa det.
- **Å/Ä-argumentet är fel.** Ljuden fanns i fornsvenskan; det var *bokstäverna* å/ä/ö som utvecklades i stavningen (å ur "aa"; ä/ö ersatte æ/ø). Att en utgåva normaliserar en form från 1267 till "Vångsta" är normal editionspraxis, inte förfalskning — och de medeltida formerna hon citerar är just åker-formerna.
- **Folketymologiska bihypoteser:** jul (fvn. *jól*, ýlir/geola) och hjul (*hjól*) är skilda ord; vallfärd kommer av medellågtyska *wallevart* (Wallfahrt, 'vandra'), inte av *vala*.

**Vad som ändå är riktigt:** vagnen *hade* kultisk betydelse under förhistorien — Dejbjergvagnarna (dansk förromersk järnålder, offermosse), Osebergvagnen, bronsålderns Trundholm-solvagn, hällristningarnas vagnar och Tacitus Nerthus-procession. Felet är det onomastiska språnget från "vagnen var helig" till "vång-namn = dolda vagnskultplatser".

**Datatest (indikativt):** de kyrkor i basen vars namn bär vång/väng (n=9 efter rensning av moderna) ligger i median **13,7 km** från närmaste fornborg — *längre* bort än övriga kyrkor (11,4 km) — och är inte äldre. Alltså inget stöd för "vång = fornborgs-/kultnod som blev moderkyrka". Förbehåll: urvalet är litet eftersom vång mest är *ägomarksnamn* som saknas i vår gazetteer; en riktig prövning kräver hela Lantmäteriets/Isofs ortnamn.

#### H5 empirisk uppföljning (2026-07-20) — hela vång-korpusen ur registret

Hela registerträffen för "vång" (**5 020 namn**, exporterade i sin helhet ur Isofs Ortnamnsregister) klassad på registrets **egen lokaltyp**:

| Lokaltyp | Antal | Andel |
|---|---|---|
| ägomark | 2 937 | 58,5 % |
| naturnamn | 970 | 19,3 % |
| terräng | 445 | 8,9 % |
| bebyggelse | 316 | 6,3 % |
| bebyggelsenamn | 120 | 2,4 % |
| vatten / anläggning / övrigt | 232 | 4,6 % |

**86,7 % av alla vång-namn är ägomark, naturnamn eller terräng — bara ~8,7 % är bebyggelse.** Registret typar alltså vång som *odlingsmark och landskap*, inte som bebyggelse och absolut inte som en egen sakral kategori.

**Hur ordet uppfattas.** Detta är kärnan i kritiken mot vagn-läsningen. Ett ortnamnselement "uppfattas" — av namngivarna och av registret — genom *vad slags plats det betecknar*. Vång betecknar i nio fall av tio en åker, ett gärde eller ett stycke terräng (*Alevången, Laduvången, Gamlevången, Vångarna*, ofta med gårds- eller personnamnsförled: Ladu-, Abulla-, Adela-). Det är fornsvenska *vang(er)* = inhägnad åker, grundordet i vångalaget (tresädet: Norrvång/Östervång/Södervång). Ett ord som i praktiken *är* namnet på byns åkerlyckor kan inte samtidigt vara ett dolt nät av vagnskultplatser — hade de varit kultplatser skulle de inte ha hetat, och inte ha typats som, ägomark. Vagn-läsningen förutsätter att man bortser från registrets egen, massiva typning.

**Koordinatnot.** Registret ger koordinat på **socken-nivå** (4 989/5 020 har koordinat, men bara **577 unika lägen** = socknar). Ett avståndstest mot kyrkor blir därför ett socken-centroid-test där varje namn ärver sin sockens läge — det mäter sockentäthet, inte namnets faktiska läge, och kan inte skilja kultnärhet från att socknen råkar ha en kyrka. Lokaltyps-fördelningen ovan är koordinatoberoende och är därför det bärande resultatet. *(Ett tidigare indikativt punkttest på 21 vång-bebyggelser ur Wikidata gav median 1 046 m till kyrka mot baslinjens 1 594 m — men det speglar den agrara markanvändningen, §H4, inte kult: vång = åker, och åker ligger vid gårdar där även kyrkan restes.)*

**Slutsats (H5, uppdaterad):** vång är ett åker-/gärdesnamn i registret (58,5 % ägomark, 86,7 % mark/natur). Etymologin håller på hela materialets nivå. Tesen "vång = dolda vagnskultplatser" får inget stöd.

## 5. Vad som är BRA i dokumentet

- **Grundtesen om valan/völvan** som högstatus rituell/politisk aktör — inte marginell spåkärring — är i linje med aktuell forskning (Neil Price, *The Viking Way*; Gardeła). Oseberg och stavgravarna (Fyrkat grav 4, Birka, Klinta, Hagebyhöga) stödjer bilden.
- **Korrekta faktaankare:** Brates Völuspá-översättning 1913, SAOB-beläggen för *vala*, Oseberg (~834, katterna, hästarna), Frejas vagn, Trumpington bed burial (Leggett).
- **Rätt källbas:** Lantmäteriets historiska kartor, Isof, SAOB, Fornsök.
- **Sund metodisk poäng:** stavningsreformer (enkelt/dubbelt L, å/ä/ö) har dolt äldre namnformer — man måste gå till 1200–1600-talens skrivningar. Det är korrekt onomastisk praxis.
- **Kvinnohistorisk kärna** med eget värde (häxprocess-arkivarbetet).

## 6. Vad som är DÅLIGT

- **Baslinjeförsummelse:** ingen kontroll för hur vanliga elementen är; frekventa ord blir skenmönster (H1, H3).
- **Etymologisk hopklumpning:** *Vallentuna, Vallby, Valö, Ervalla* slås ihop till en "valan", trots skilda ursprung (i Vallentuna är efterledet **-tuna**, inte "val"). Samma led återkommer i den isländska handskriften **Möðruvallabók** (ca 1350, nu i källbiblioteket): namnet är ett proveniensnamn efter gården Möðruvellir, där *-vellir* = "slätter/fält" (fornnord. *vǫllr*, samma ord som i Þingvellir/Eidsvoll) och *Möðru-* sannolikt är växten *maðra* eller ett personnamn — inte "mor" och inte "vala/völva". Att läsa *valla/vellir* som "vala" är samma fel som fäller vång-tesen (H5).
- **AI-genererad etymologi:** dokumentet är öppet med att stora delar bygger på ChatGPT/Gemini och anger själv ~5–10 % fel; det ger exemplet att ChatGPT hittade på ett kloster i Härnösand. Det är exakt felläget som genomsyrar den etymologiska kärnan.
- **Konsensus avfärdas som förtryck** ("tolkningsföreträde") — ett vanligt kännetecken för alternativforskning.

## 7. Slutsats

Dela dokumentet i två lager. **Frågan, källbasen och faktaankarna** är genuint bra — völvans centrala roll är rimlig och forskningsförankrad. **Den specifika etymologiska metoden** (varje Val/Ed/Hammar → gudinnespår) håller inte: tre testbara distributionspåståenden faller mot baslinjen. Det som *överlever* är en sekulär läsning — de tidiga kyrkorna följer den världsliga maktens noder (Husby/Tuna/Sal), inte kult- eller tingsnamnen.

## 8. Förbehåll

Små urval (77 tidiga kyrkor, 434 ortnamn), byggårstäckning partiell, ortnamnslagret begränsat till tätort/småort/by, och avstånd mäts mot *alla* kyrkor (inte enbart medeltida). Riktningen är ändå konsekvent över två oberoende metoder (9 km-buffert + närmaste granne) och med baslinjekontroll. Resultaten ska läsas som väl underbyggda indikationer, inte som slutgiltiga bevis.

## 9. Nya datakällor som stärker prövningen (under integrering)

Tre tillskott till plattformen adresserar direkt de förbehåll och datahål som listas ovan. **Inga av dessa resultat är ännu körda** — de anges som vad som blir prövbart, inte som fynd. Slutsatserna i §7 står tills prövningarna faktiskt gjorts med baslinjekontroll.

- **Fullständiga ortnamn (Lantmäteriet CC0 + Isof CC-BY).** Dagens ortnamnslager (434) är ett stickprov ur tätort/småort/by. Med Lantmäteriets och Isofs fulla ortnamnsregister kan varje namnelement klassas **på efterledet** och baslinjetestas för sig på hela beståndet — precis den prövning H1-fördjupningen och H5 efterlyser men i dag bara kan göra på små urval (val n=37, vång n=9). Isof bidrar dessutom med **historiska/dialektala belägg och äldsta kända form**, vilket låter oss skilja medeltida namn från sentida (dokumentets egen metodpoäng, §5). Isof är CC-BY och bär källangivelse per post.
- **Period-korrekt strandlinje (SGU strandförskjutningsmodell, CC-BY).** Alla avståndsmått ovan mäts mot *dagens* landskap. Under järnålder/vikingatid stod havet högre — en plats som i dag ligger inåt land kan ha legat vid vattnet. SGU-modellen (100-årsupplösning; ~500 e.Kr. = 1450 år före 1950, kollektion `bp1000-1900`) låter oss lägga in en **period-korrekt kustlinje som spatial kontroll** och pröva om en påstådd närhet till kult eller makt i själva verket bara speglar var det fanns beboelig, icke-dränkt mark då. Modellen är regional och grov och bärs som osäkerhetszon, aldrig som skarp linje.
- **Heliga källor ("Källa med tradition", ~2 095 lämningar, RAÄ Fornsök).** Det skarpaste kontinuitetstestet (helgonkälla invid kyrka, §4) blir körbart via samma pipeline som vårdkasarna. Förbehållen i §4 gäller alltjämt: kategorin är bred (hednisk offerkälla / medeltida helgonkälla / sentida folktro), källa ≠ kult, och baslinje krävs.

Sammantaget flyttar tillskotten flera av "kan inte prövas / litet urval"-noteringarna ovan mot *prövbart* — men först när de körts, med baslinje, blir de bevisvärde.

## 10. Registrets lokaltyp som metod — en jämförelse mellan elementen

En ny, direkt prövningsmetod blev möjlig när Isofs Ortnamnsregister visade sig kunna **exportera hela träffmängden per element till Excel** (`/place-names/excel-file?place-name=…`). Då kan varje elements samtliga namn klassas på registrets egen **lokaltyp** — vilket i praktiken är namngivarnas och traditionens svar på *vad slags plats ordet betecknar*, alltså "hur ordet uppfattas".

**Förbehåll (viktigt):** sökningen är fritext ("Contains"), **inte** klassad på för-/efterled, så korta eller mångtydiga element fångar brus (*sal* matchar Uppsala/Salem; *hammar* matchar bruksnamn). Siffrorna nedan är **orienterande**, inte slutliga; en exakt prövning kräver för-/efterledsklassning (jfr H1-fördjupningen om att "val" inte är ett enhetligt element). Ändå är mönstret entydigt.

| Element | n (Contains) | Mark/natur¹ | Bebyggelse² | Vanligaste lokaltyp | Kommentar |
|---|---|---|---|---|---|
| **vång** | 5 020 | **86,7 %** | 8,7 % | ägomark 58,5 % | åker/gärde |
| hunn | 523 | 55 % | 24 % | terräng 29 % | bergsnamn (Hunneberg) |
| sal | 6 704 | 52 % | 26 % | terräng 24 % | brus (Uppsala, Salem) |
| harg | 437 | 44 % | 33 % | bebyggelse 24 % | *sakralt led* |
| hammar | 6 319 | 49 % | 34 % | terräng 27 % | bergknalle |
| stav | 5 763 | 30 % | 36 % | bebyggelse 31 % | |
| valla | 2 163 | 38 % | 46 % | bebyggelse 38 % | vall/betesmark |
| hov | 2 257 | 32 % | 50 % | bebyggelse 40 % | *sakralt led* (brus: fi. *Ahovaara* m.fl.) |
| **tuna** | 1 712 | 15 % | **55,8 %** | bebyggelse 38 % | centralplats |

¹ ägomark + naturnamn + terräng. ² bebyggelse + bebyggelsenamn.

**Utfall.** Elementen faller på en tydlig **åker→bebyggelse-gradient**: vång är åkermark (87 % mark/natur), tuna är bosättning/centralplats (56 % bebyggelse), och de övriga ligger däremellan. Ingen av dem har någon sakral/kult-lokaltyp — inte ens de **genuint sakrala leden hov (hednatempel) och harg (kultplats/altare)**, som registret ändå typar som vanlig bebyggelse och terräng. Det beror inte på att kulten "gömts", utan på att registrets lokaltyp beskriver *feature-typ* (åker, terräng, bebyggelse, vatten), inte semantik: en hov-plats var en gård/byggnad och typas därefter. **Poängen:** lokaltypen kan avslöja *vad slags plats* ett ord betecknar (och där är svaret vardagliga mark- och bebyggelsetermer, inte en kultkategori) — men själva kult-*kontinuiteten* måste prövas rumsligt (§11), inte via lokaltyp. (*val* och *ed* kunde inte exporteras — registret svarar 500/400, sannolikt för korta/för många Contains-träffar; *valla* ovan fångar dock huvuddelen av "val"-familjen och visar samma vardagliga mönster.)

**Teofora led kan inte prövas med fritextsök — en gräns värd att notera.** Ett försök att mäta gudanamnen visar problemet tydligt: *frös-* (Frey) drunknar i *Frösjön/Fröskan* (frusen/is), *ullev-* (Ullevi) i *kulleviken*, *tors-* (Tor) i *storsand-*. De genuina kultnamnen (Frösvi, Ullevi, Torsåker) finns men går inte att skilja ut med Contains — de kräver Isofs ortnamnselement-/namntypsindex eller manuell klassning. Notera också att *frej/Freja* (modern namnform) mest fångar sentida villa- och anläggningsnamn, inte förkristen kult; guden bär i ortnamn formen *Frö-*. Det är samma hopklumpningsfälla som fäller Nyholms egen metod (§6), nu tillämpad på gudanamnen — och skälet till att en seriös prövning av de teofora leden måste klassas på element, inte sökas som textsträng.

**Lokaltypen förutsäger klustringen (koppling till §11).** Kontrasten vång ↔ tuna är belysande: **vång är åkermark** (58,5 % ägomark) och **tuna är bosättning/centralplats** (55,8 % bebyggelse). Det förklarar direkt varför de beter sig olika i punktkoordinat-klustringen (§11): tuna ligger nära de tidiga kyrkorna (64 % inom 3 km) *därför att det är ett bebyggelse-/maktnamn*, medan åkermarksnamn inte klustrar vid kyrkor. Ett elements lokaltyp — vad slags plats det betecknar — förutsäger alltså dess landskapsrelation. Det är motsatsen till Nyholms modell, där skilda element (både åker- och bebyggelsenamn) slås ihop till en enda dold kult.

**Metodvinst.** Excel-exporten gör hela registret maskinläsbart per element. Det är grunden för att göra dessa prövningar *exakta* när för-/efterledsklassning och punktkoordinater (Lantmäteriet CC0 via Geotorget) byggs in — då kan varje efterledstyp baslinjetestas för sig, i stället för på fritextträffar.

## 11. Punktkoordinat-klustring (Rolandssons metod) — Uppland & Ångermanland

Lektor Lennart Rolandsson (Uppsala) skissade en radie-metod: extrahera sockenkyrkornas GIS-lägen och mät hur ortnamn med "dominerande ord" klustrar inom 3–7 km. Den kunde nu köras på **punktkoordinater** (inte socken-centroider):

- **Kyrkor:** 207 verifierade medeltida sockenkyrkor (RAÄ Bebyggelseregister, dubbel-AI-extraktion korskollad — positionsavvikelse median 1 m; se `parish_churches`).
- **Ortnamn:** 3 424 orter i de två landskapen med punktkoordinat ur **Wikidata (CC0)** — den maskinläsbara datan bakom Wikipedias koordinater.
- **Mått:** andel inom 3/5/7 km av närmaste sockenkyrka (PostGIS `geography`), per namnelement mot baslinjen (alla orter).

| Grupp | n | ≤3 km | ≤5 km | ≤7 km |
|---|---|---|---|---|
| **Baslinje (alla orter)** | 3 424 | **42 %** | 69 % | 80 % |
| husby | 28 | **79 %** | 96 % | 96 % |
| tuna | 53 | **64 %** | 85 % | 92 % |
| by | 411 | 64 % | 83 % | 90 % |
| sal | 31 | 48 % | 65 % | 90 % |
| hammar | 28 | 46 % | 61 % | 86 % |
| -inge | 79 | 38 % | 78 % | 84 % |
| stav | 17 | 29 % | 71 % | 88 % |
| *torp (kontroll)* | 127 | 34 % | 61 % | 74 % |
| *sjö (kontroll)* | 80 | **20 %** | 32 % | 45 % |

**Utfall — bekräftar H2/H3 på punktkoordinatnivå.** Det är de **sekulära central-/maktnamnen** som klustrar vid de tidiga kyrkorna: **Husby** (kungsgård/kronogods) 79 % inom 3 km och **Tuna** (centralplats) 64 %, mot baslinjens 42 %. De av Nyholm framhållna elementen ligger vid eller under baslinjen: hammar 46 %, sal 48 %, stav 29 %. Kyrkorna restes alltså vid den världsliga maktens noder — kungsgården och centralplatsen — inte vid kult- eller de påstådda gudinnenamnen. Det stärker slutsatsen i §H2/§7: "makten byggde kyrkan", inte "en bortskriven gudinnekult".

**Negativ kontroll — måttet diskriminerar.** För att visa att utslaget inte bara speglar "allt ligger nära en kyrka" lades rena kontrollord till: **sjö** (naturnamn) hamnar på **20 % inom 3 km — långt under baslinjens 42 %**, och **torp** (sentida kolonisation) på 34 %, också under. Sjönamn och torp ligger alltså tydligt *längre* från de medeltida kyrkorna, medan makt-/centralplatsnamnen ligger långt över. Spännvidden **sjö 20 % ‹ baslinje 42 % ‹ tuna 64 % ‹ husby 79 %** visar att måttet fångar en verklig, riktad skillnad — inte en artefakt av att kyrkor finns överallt.

**De sakrala leden går inte att pröva här — än.** Ett försök att köra samma klustring på de faktiskt kultassocierade leden (hov, harg, lund, vi) föll på datatäckningen: i de två landskapen ger Wikidata bara en handfull träffar, och de är brusiga (hov fångar Stockholms-stadsdelar som *Åkeshov/Johanneshov*; lund fångar *Flundran*; vi n=2, *Härnevi*). Inget statistiskt utslag går att läsa ur det. Just de leden — där en eventuell kontinuitet vore mest relevant för tesen — kräver därför hela gazetteern (Lantmäteriet, punktkoordinat) för att kunna prövas. Det är den skarpaste posten för nästa steg.

*Förbehåll: substring-matchning (brus för korta element som *sal*), Wikidata täcker bebyggelse/kända orter men inte hela gazetteern (ägomarksnamnen saknas), bbox tar med en kant av grannlandskap, och ingen formell signifikanstest är gjord än. Husby/Tuna-utslaget (79/64 % mot 42 %) är dock så pass tydligt att riktningen är robust. Efterledsklassning + Lantmäteriets fulla ortnamn (punktkoordinat) skärper testet — det är nästa steg, tillsammans med Rolandsson.*

## 12. Hund/hunn och hundaret — Nyholms argument prövat

Nyholm läser hund-/hunn-namn (Hundhamra i Botkyrka, Hundavad/Lundsbacke i Östergötland, Hunnevad i Skänninge) som två saker på en gång: (a) spår av **hundaret** (det administrativa distriktet) och (b) en **dold gudinna "Hon/Hunn"**, ett noa-namn (tabubelagt) som kristnandet skulle ha skrivit bort. Samma tudelning som resten av dokumentet gäller.

**Det som håller.** Hundaret var ett verkligt **ledungs-/värnpliktsdistrikt** — ett *hundrað* ("hundra man" ≈ en skeppsbesättning) som utrustade och bemannade ett skepp, föregångare till häradet, en proto-skatt/värnplikt (jfr §11 om ledungen). Och platserna Nyholm nämner *är* genuina centralorter: Hundhamra med fornborg + storhög vid Mälarens farled (nämnd i Erikskrönikan), Hundavad/Lundsbacke med 82 resta stenar. Observationen "hund-namn vid maktnoder" har alltså substans.

**Det som inte håller — etymologin.** Tre skilda fornnordiska ord klumpas ihop: **hundr** (hund/djuret, öknamn), **hundrað** (hundra → *hundare*, distriktet) och **hón** (hon, pronomenet). Steget "Hunn = Hon = dold gudinna, noa-namn man inte fick uttala" saknar stöd — Snorres "hon" är just pronomenet "hon" i en kontext där en kvinnlig gestalt redan nämnts, inte ett hemligt gudanamn. Namnbytena (Hundavad→Lindevad, Hunnevad→Linnevad) förklaras lika gärna av att *hundr* var nedsättande, eller av kristnande/nya ägare, som av en undertryckt kult. Det är samma folketymologiska språng som fäller vång→vagn och val→vala.

**Datatest (Uppland/Ångermanland, punktkoordinat).** "hund"-namnen i regionen är i praktiken **hundare-distriktsnamnen** (Sjuhundra, Långhundra, Lyhundra, Ärlinghundra, Fjärdhundra) + Husby-sammansättningar. Deras läge:

| hund/hundare-namn → närmaste | inom | baslinje (alla orter) |
|---|---|---|
| **fornborg** | **64 %** (≤3 km), 93 % (≤5 km) | 36 % / 58 % |
| kyrka | 71 % (≤3 km) | 42 % |
| **Kung Valdemars segelled** | **0 %** (≤10 km), 29 % (≤20 km) | 26 % / 37 % |

**Utfall.** Hundare-namnen ligger nära **fornborgar** (64 % mot baslinjens 36 %) och kyrkor, men **påfallande långt från segelleden** (0 % inom 10 km; 12–38 km inland) — *längre* bort än ett slumpmässigt ortnamn. Det ritar upp hundaret som ett **inlands administrativt-militärt** system, knutet till fornborgarna (försvar), kronogodsen (Husby) och landvägarna — inte till navigationspunkterna på sjövägen. Det stöder den sekulära försvars-/ledungsläsningen: hundaret var maktens och försvarets organisation, inte en bortskriven gudinnekult. Nyholms *observation* (hund-namn vid centralorter) bekräftas; hennes *tolkning* (gudinnan Hon) gör det inte.

*Förbehåll: litet urval (n=14), substring-matchning, koordinater på socken-/kommun-nivå, och segelleden är en grov 49-punkters linje. Hundsjö (384 km, Norrland) är brus. Riktningen — fornborgsnära, segelledsfjärran — är dock konsekvent. En exakt prövning kräver Lantmäteriets elementklassade ortnamn.*

---

*Genererat ur Viking Age-plattformens data. Metod och siffror är reproducerbara via plattformens PostGIS-funktioner (`sites_in_bbox`, `graph_neighborhood`) och `place_names`/`heritage_sites`.*
