# Benchmark: researcher-personas (v1.0)

Motor: `https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/search-hybrid` (gte-small → search_v2 → search_v1)

Frågor: 58 · Dead-ends: 2 · Ankare hittat (av ej-dead): 1/56

## Per kategori

| Kategori | Frågor | Dead-end | Ankare hittat | Topp-typ rätt |
|---|---|---|---|---|
| ARK landskap | 7 | 1 | 0/3 (0%) | — |
| ARK stratigrafi | 6 | 0 | 0/2 (0%) | — |
| ARK fynd | 6 | 0 | 1/4 (25%) | — |
| ARK bioark | 6 | 0 | 0/5 (0%) | — |
| ARK metod | 6 | 0 | 0/4 (0%) | — |
| HIST källkritik | 7 | 0 | 0/6 (0%) | — |
| HIST aktör | 5 | 1 | 0/0 (—) | — |
| HIST plats | 6 | 0 | 0/4 (0%) | — |
| HIST process | 4 | 0 | 0/0 (—) | — |
| HIST reception | 5 | 0 | 0/1 (0%) | — |

## Alla frågor

| ID | Fråga | Lang | Guld query_type | n | Dead | Ankare | Topp-1 träff (typ · label · mode) |
|---|---|---|---|---|---|---|---|
| AL1 | Varför valde människorna att bosätta sig just på den här platsen? | sv | METHOD | 8 |  | ✗ | source_text · Sången om Sigdriva — strof 12 (hybrid) |
| AL2 | Hur såg vattenlinjen och vegetationen ut när platsen var bebodd? | sv | PALEOENV | 8 |  | ✗ | dynasty · Erikska ätten (hybrid) |
| AL3 | Finns det naturliga försvarslinjer i terrängen som höjder eller träskmarker? | sv | TOPOGRAPHY | 0 | JA |  | — (lexical) |
| AL4 | Ligger platsen strategiskt nära kända historiska handelsleder eller vattenvägar? | sv | GEO_RELATION | 8 |  | ✗ | dynasty · Sjökungar (hybrid) |
| AL5 | Vilka naturresurser som lera, flinta, malm eller timmer fanns i närområdet? | sv | RESOURCE | 8 |  | ✗ | source_text · Sången om Grimner — strof 21 (hybrid) |
| AL6 | Finns det andra samtida fyndplatser eller monument i den omedelbara närheten? | sv | GEO_RELATION | 8 |  | ✗ | carver · Jakob Rød (hybrid) |
| AL7 | Hur påverkade solens position placeringen av strukturer på platsen? | sv | ARCHAEOASTRONOMY | 8 |  | ✗ | dynasty · Sjöbladsätten (hybrid) |
| AS1 | Vilka kulturlager och stratigrafi ligger staplade på varandra? | sv | STRATIGRAPHY | 8 |  | ✗ | source_text · Kvädet om Atle — strof 27 (hybrid) |
| AS2 | Vilka byggnadsmaterial har använts och varifrån kom de? | sv | MATERIAL | 7 |  | ✗ | king · Bröt-Anund (hybrid) |
| AS3 | Kan vi identifiera eldstäder, verkstäder eller andra funktionella zoner? | sv | FEATURE | 8 |  | ✗ | carver · Vigmund (hybrid) |
| AS4 | Finns det spår av bränder eller raserade väggar? | sv | TAPHONOMY | 8 |  | ✗ | carver · Grim skald (hybrid) |
| AS5 | Hur har stolphål eller raserade murar bevarats i marken? | sv | FEATURE | 8 |  | ✗ | source_text · Beowulf — strof 36 (hybrid) |
| AS6 | Finns det tecken på rituell arkitektur eller astronomisk inriktning? | sv | RITUAL | 2 |  | ✗ | place · Finnsmyren, Östra Tvåråbergs fäbodar (hybrid) |
| AF1 | Vilka typer av föremål dominerar fyndmaterialet? | sv | ARTEFACT | 8 |  | ✗ | source_text · Valans spådom — strof 2 (hybrid) |
| AF2 | Finns det importvaror som visar på långväga handel? | sv | TRADE | 8 |  | ✓ | theme · Handel (hybrid) |
| AF3 | Hittar vi spår av misslyckad tillverkning som slagg eller felbränd keramik? | sv | PRODUCTION | 2 |  | ✗ | experience · Hittarp (hybrid) |
| AF4 | Har föremålen deponerats avsiktligt som offergåvor eller är de borttappat skräp? | sv | DEPOSITION | 8 |  | ✗ | dynasty · Valdemarätten (hybrid) |
| AF5 | Kan stilen på keramiken eller smyckena typologiskt datera platsen? | sv | TYPOLOGY | 6 |  | ✗ | dynasty · Valdemarätten (hybrid) |
| AF6 | Vilka teknologier har använts för att tillverka föremålen? | sv | PRODUCTION | 5 |  | ✗ | dynasty · Sverreätten (hybrid) |
| AB1 | Vad kan makrofossil som frön och pollen berätta om vad människorna åt? | sv | BIOARCH | 8 |  | ✗ | source_text · Sången om Vavtrudner — strof 12 (hybrid) |
| AB2 | Vilka djurarter hittar vi ben av och var de vilda eller tama? | sv | OSTEOLOGY | 8 |  | ✗ | source_text · Kvädet om Atle — strof 28 (hybrid) |
| AB3 | Vad berättar de mänskliga kvarlevorna om hälsa, sjukdomar och livslängd? | sv | OSTEOLOGY | 8 |  | ✗ | source_text · Beowulf — strof 20 (hybrid) |
| AB4 | Kan isotopanalyser av tänder visa om människorna migrerade hit? | sv | ISOTOPE | 8 |  | ✗ | source_text · Kvädet om Hymer — strof 22 (hybrid) |
| AB5 | Finns det spår av våld eller strid på skeletten? | sv | TRAUMA | 8 |  | ✗ | source_text · Beowulf — strof 36 (hybrid) |
| AB6 | Vad kan DNA-analyser berätta om släktskap och populationsrörelser? | sv | ADNA | 8 |  | ✗ | theme · Genetik & aDNA (hybrid) |
| AM1 | Vilka dateringsmetoder som kol-14 eller dendrokronologi är bäst lämpade här? | sv | DATING | 8 |  | ✗ | carver · Kol (hybrid) |
| AM2 | Kan vi använda georadar, magnetometer eller LiDAR för att kartlägga platsen? | sv | PROSPECTION | 1 |  | ✗ | heritage_site · Lidarnas varsel, Källa med tradition (hybrid) |
| AM3 | Finns det skriftliga källor, kartor eller lokala sägner som stämmer med fynden? | sv | SOURCE_CROSS | 8 |  | ✗ | source_text · Sången om Grimner — strof 9 (hybrid) |
| AM4 | Finns det risk att platsen förstörs av exploatering eller plundring? | sv | HERITAGE_RISK | 8 |  | ✗ | dynasty · Stenkilska ätten (hybrid) |
| AM5 | Hur har tidigare arkeologer tolkat eller grävt ut den här platsen? | sv | RESEARCH_HISTORY | 8 |  | ✗ | dynasty · Hårfagerätten (hybrid) |
| AM6 | Hur kan vi förmedla platsens historia till allmänheten? | sv | OUTREACH | 8 |  | ✗ | dynasty · Hårfagerätten (hybrid) |
| HK1 | Vilka primärkällor finns bevarade? | sv | SOURCE_CRITICISM | 8 |  | ✗ | place · Finnsmyren, Östra Tvåråbergs fäbodar (hybrid) |
| HK2 | Vem skapade källorna och i vilket syfte? | sv | SOURCE_CRITICISM | 8 |  | ✗ | source_text · Kvädet om Atle — strof 26 (hybrid) |
| HK3 | Är källorna äkta eller finns det risk för förfalskningar? | sv | AUTHENTICITY | 8 |  | ✗ | source_text · Beowulf — strof 33 (hybrid) |
| HK4 | Finns det tendens eller vinkling i källorna? | sv | SOURCE_CRITICISM | 8 |  | ✗ | source_text · Den Höges sång — strof 138 (hybrid) |
| HK5 | Hur oberoende är källorna från varandra? | sv | SOURCE_CRITICISM | 8 |  | ✗ | source_text · Kvädet om Atle — strof 26 (hybrid) |
| HK6 | Vilka utelämnade röster saknas i det skriftliga materialet? | sv | SOURCE_CRITICISM | 6 |  | ✗ | dynasty · Sverreätten (hybrid) |
| HK7 | Skiljer sig observation från tolkning i källan? | sv | METHOD | 8 |  | ✗ | source_text · Den grönländska sången om Atle — strof 31 (hybrid) |
| HA1 | Vilka var personens viktigaste drivkrafter och övertygelser? | sv | ACTOR | 8 |  | ✗ | dynasty · Stenkilska ätten (hybrid) |
| HA2 | Vilka nätverk, allianser eller fiender hade personen? | sv | PERSON_RELATION | 4 |  | ✗ | dynasty · Valdemarätten (hybrid) |
| HA3 | Vilka centrala beslut tog personen och vilka alternativ fanns? | sv | ACTOR | 0 | JA |  | — (lexical) |
| HA4 | Hur såg samtiden på personen — hyllad, fruktad eller obetydlig? | sv | RECEPTION | 8 |  | ✗ | source_text · Kvädet om Hymer — strof 20 (hybrid) |
| HA5 | Vilken makt och vilka resurser disponerade personen? | sv | ACTOR | 6 |  | ✗ | dynasty · Erikska ätten (hybrid) |
| HP1 | Vilken politisk eller religiös betydelse hade platsen under sin storhetstid? | sv | PLACE_FUNCTION | 8 |  | ✗ | theme · Tro (hybrid) |
| HP2 | Hur har platsens namn och gränser förändrats genom historien? | sv | ONOMASTICS | 8 |  | ✗ | dynasty · Sjökungar (hybrid) |
| HP3 | Vilka historiska händelser har utspelat sig här? | sv | EVENT | 8 |  | ✗ | source_text · Det korta kvädet om Sigurd — strof 40 (hybrid) |
| HP4 | Vilka handelsvägar knöt samman platsen med omvärlden? | sv | TRADE | 8 |  | ✗ | source_text · Den grönländska sången om Atle — strof 1 (hybrid) |
| HP5 | Finns det lokala traditioner, legender eller minnesmärken kvar på platsen? | sv | TRADITION | 8 |  | ✗ | king · Folke Filbyter (hybrid) |
| HP6 | När och varför förlorade platsen sin ursprungliga betydelse? | sv | PROCESS | 8 |  | ✗ | carver · Öpir (Uppland) (hybrid) |
| HR1 | Vilka var de utlösande och underliggande orsakerna till förändringen? | sv | CAUSATION | 8 |  | ✗ | source_text · Det korta kvädet om Sigurd — strof 51 (hybrid) |
| HR2 | Vilka långsiktiga konsekvenser fick personens handlande? | sv | CONSEQUENCE | 1 |  | ✗ | king · Folke Filbyter (hybrid) |
| HR3 | Hur påverkades den breda befolkningen bortom eliterna? | sv | SOCIAL | 8 |  | ✗ | parish · Bredared (hybrid) |
| HR4 | Hur påverkade epidemier, kriser eller klimatfaktorer utvecklingen? | sv | CAUSATION | 8 |  | ✗ | dynasty · Sverkerska ätten (hybrid) |
| HE1 | Hur har bilden av personen förändrats i historieskrivningen över tid? | sv | HISTORIOGRAPHY | 8 |  | ✗ | dynasty · Sjökungar (hybrid) |
| HE2 | Vilka myter har skapats kring personen eller platsen och när uppstod de? | sv | MYTH | 8 |  | ✗ | carver · Öpir (Uppland) (hybrid) |
| HE3 | Hur används personen eller platsen idag för att legitimera politiska syften? | sv | HISTORY_USE | 4 |  | ✗ | theme · Makt & dynasti (hybrid) |
| HE4 | Hur skildras ämnet i populärkulturen jämfört med akademisk forskning? | sv | RECEPTION | 8 |  | ✗ | source_text · Sången om Skirner — strof 34 (hybrid) |
| HE5 | Har personen eller platsen fallit i glömska under vissa perioder? | sv | RECEPTION | 7 |  | ✗ | dynasty · Erikska ätten (hybrid) |

## Topp-3 per fråga (för inspektion)

**AL1** `Varför valde människorna att bosätta sig just på den här platsen?`
- source_text · Sången om Sigdriva — strof 12 · 0.01
- source_text · Den Höges sång — strof 10 · 0.01
- source_text · Sången om Grimner — strof 2 · 0.01

**AL2** `Hur såg vattenlinjen och vegetationen ut när platsen var bebodd?`
- dynasty · Erikska ätten · 0.01
- dynasty · Sverkerska ätten · 0.009
- king · Domar · 0.008

**AL3** `Finns det naturliga försvarslinjer i terrängen som höjder eller träskmarker?`
- DEAD-END

**AL4** `Ligger platsen strategiskt nära kända historiska handelsleder eller vattenvägar?`
- dynasty · Sjökungar · 0.011
- dynasty · Jelling-dynastin · 0.01
- dynasty · Erikska ätten · 0.01

**AL5** `Vilka naturresurser som lera, flinta, malm eller timmer fanns i närområdet?`
- source_text · Sången om Grimner — strof 21 · 0.01
- source_text · Sången om Grimner — strof 18 · 0.01
- source_text · Andra kvädet om Gudrun — strof 6 · 0.01

**AL6** `Finns det andra samtida fyndplatser eller monument i den omedelbara närheten?`
- carver · Jakob Rød · 0.011
- source_text · Det korta kvädet om Sigurd — strof 18 · 0.01
- carver · Gunnar · 0.01

**AL7** `Hur påverkade solens position placeringen av strukturer på platsen?`
- dynasty · Sjöbladsätten · 0.01
- carver · Östen 2 · 0.009
- dynasty · Sverreätten · 0.009

**AS1** `Vilka kulturlager och stratigrafi ligger staplade på varandra?`
- source_text · Kvädet om Atle — strof 27 · 0.01
- source_text · Beowulf — strof 25 · 0.01
- source_text · Beowulf — strof 41 · 0.01

**AS2** `Vilka byggnadsmaterial har använts och varifrån kom de?`
- king · Bröt-Anund · 0.009
- place · Kittan och Liden · 0.009
- dynasty · Sverkerska ätten · 0.009

**AS3** `Kan vi identifiera eldstäder, verkstäder eller andra funktionella zoner?`
- carver · Vigmund · 0.01
- dynasty · Gyllenstierna · 0.01
- carver · Tyrvi · 0.009

**AS4** `Finns det spår av bränder eller raserade väggar?`
- carver · Grim skald · 0.01
- source_text · Den Höges sång — strof 57 · 0.01
- source_text · Valans spådom — strof 21 · 0.01

**AS5** `Hur har stolphål eller raserade murar bevarats i marken?`
- source_text · Beowulf — strof 36 · 0.01
- source_text · Kvädet om Atle — strof 34 · 0.01
- source_text · Beowulf — strof 3 · 0.01

**AS6** `Finns det tecken på rituell arkitektur eller astronomisk inriktning?`
- place · Finnsmyren, Östra Tvåråbergs fäbodar · 0.008
- place · Skänninge, Sankt Olofs konvent, kv. Munkgärdet · 0.006

**AF1** `Vilka typer av föremål dominerar fyndmaterialet?`
- source_text · Valans spådom — strof 2 · 0.01
- source_text · Det korta kvädet om Sigurd — strof 18 · 0.01
- source_text · Andra kvädet om Gudrun — strof 15 · 0.01

**AF2** `Finns det importvaror som visar på långväga handel?`
- theme · Handel · 0.01
- carver · Finn · 0.01
- king · Ingjald Illråde · 0.009

**AF3** `Hittar vi spår av misslyckad tillverkning som slagg eller felbränd keramik?`
- experience · Hittarp · 0.066
- source · Vraket som Björn hittade · 0.016

**AF4** `Har föremålen deponerats avsiktligt som offergåvor eller är de borttappat skräp?`
- dynasty · Valdemarätten · 0.012
- dynasty · Sverreätten · 0.01
- dynasty · Stenkilska ätten · 0.01

**AF5** `Kan stilen på keramiken eller smyckena typologiskt datera platsen?`
- dynasty · Valdemarätten · 0.011
- dynasty · Gyllenstierna · 0.01
- carver · Jakob Rød · 0.01

**AF6** `Vilka teknologier har använts för att tillverka föremålen?`
- dynasty · Sverreätten · 0.009
- dynasty · Sjöbladsätten · 0.009
- dynasty · Sverkerska ätten · 0.008

**AB1** `Vad kan makrofossil som frön och pollen berätta om vad människorna åt?`
- source_text · Sången om Vavtrudner — strof 12 · 0.01
- source_text · Andra kvädet om Gudrun — strof 21 · 0.01
- source_text · Beowulf — strof 5 · 0.01

**AB2** `Vilka djurarter hittar vi ben av och var de vilda eller tama?`
- source_text · Kvädet om Atle — strof 28 · 0.01
- source_text · Kvädet om Atle — strof 27 · 0.01
- source_text · Sången om Regin — strof 13 · 0.009

**AB3** `Vad berättar de mänskliga kvarlevorna om hälsa, sjukdomar och livslängd?`
- source_text · Beowulf — strof 20 · 0.01
- source_text · Beowulf — strof 15 · 0.01
- source_text · Beowulf — strof 35 · 0.01

**AB4** `Kan isotopanalyser av tänder visa om människorna migrerade hit?`
- source_text · Kvädet om Hymer — strof 22 · 0.01
- source_text · Kvädet om Hymer — strof 27 · 0.01
- source_text · Första kvädet om Gudrun — strof 2 · 0.01

**AB5** `Finns det spår av våld eller strid på skeletten?`
- source_text · Beowulf — strof 36 · 0.01
- source_text · Valans spådom — strof 50 · 0.01
- source_text · Valans spådom — strof 36 · 0.01

**AB6** `Vad kan DNA-analyser berätta om släktskap och populationsrörelser?`
- theme · Genetik & aDNA · 0.013
- carver · Ofeg · 0.01
- carver · Bero · 0.01

**AM1** `Vilka dateringsmetoder som kol-14 eller dendrokronologi är bäst lämpade här?`
- carver · Kol · 0.01
- carver · Dólgfinnr · 0.01
- carver · Vigmar · 0.01

**AM2** `Kan vi använda georadar, magnetometer eller LiDAR för att kartlägga platsen?`
- heritage_site · Lidarnas varsel, Källa med tradition · 0.066

**AM3** `Finns det skriftliga källor, kartor eller lokala sägner som stämmer med fynden?`
- source_text · Sången om Grimner — strof 9 · 0.01
- source_text · Sången om Grimner — strof 33 · 0.01
- source_text · Första kvädet om Helge Hundingsbane — strof 27 · 0.01

**AM4** `Finns det risk att platsen förstörs av exploatering eller plundring?`
- dynasty · Stenkilska ätten · 0.011
- dynasty · Valdemarätten · 0.01
- theme · Plundring & vikingafärder · 0.01

**AM5** `Hur har tidigare arkeologer tolkat eller grävt ut den här platsen?`
- dynasty · Hårfagerätten · 0.01
- theme · Plundring & vikingafärder · 0.01
- folk_group · Götar · 0.009

**AM6** `Hur kan vi förmedla platsens historia till allmänheten?`
- dynasty · Hårfagerätten · 0.01
- source_text · Kvädet om Trym — strof 14 · 0.01
- source_text · Den grönländska sången om Atle — strof 94 · 0.01

**HK1** `Vilka primärkällor finns bevarade?`
- place · Finnsmyren, Östra Tvåråbergs fäbodar · 0.01
- source_text · Beowulf — strof 1 · 0.01
- source_text · Beowulf — strof 2 · 0.009

**HK2** `Vem skapade källorna och i vilket syfte?`
- source_text · Kvädet om Atle — strof 26 · 0.01
- source_text · Det korta kvädet om Sigurd — strof 34 · 0.01
- source_text · Det korta kvädet om Sigurd — strof 63 · 0.01

**HK3** `Är källorna äkta eller finns det risk för förfalskningar?`
- source_text · Beowulf — strof 33 · 0.01
- source_text · Kvädet om Atle — strof 1 · 0.01
- source_text · Beowulf — strof 5 · 0.01

**HK4** `Finns det tendens eller vinkling i källorna?`
- source_text · Den Höges sång — strof 138 · 0.01
- source_text · Den Höges sång — strof 41 · 0.01
- source_text · Valans spådom — strof 21 · 0.01

**HK5** `Hur oberoende är källorna från varandra?`
- source_text · Kvädet om Atle — strof 26 · 0.01
- source_text · Det korta kvädet om Sigurd — strof 18 · 0.01
- source_text · Kvädet om Atle — strof 34 · 0.01

**HK6** `Vilka utelämnade röster saknas i det skriftliga materialet?`
- dynasty · Sverreätten · 0.01
- dynasty · Sjöbladsätten · 0.009
- carver · Árni · 0.009

**HK7** `Skiljer sig observation från tolkning i källan?`
- source_text · Den grönländska sången om Atle — strof 31 · 0.01
- god · Ull · 0.01
- source_text · Sången om Skirner — strof 4 · 0.01

**HA1** `Vilka var personens viktigaste drivkrafter och övertygelser?`
- dynasty · Stenkilska ätten · 0.011
- dynasty · Erikska ätten · 0.01
- dynasty · Sverkerska ätten · 0.009

**HA2** `Vilka nätverk, allianser eller fiender hade personen?`
- dynasty · Valdemarätten · 0.008
- dynasty · Erikska ätten · 0.008
- dynasty · Sverkerska ätten · 0.007

**HA3** `Vilka centrala beslut tog personen och vilka alternativ fanns?`
- DEAD-END

**HA4** `Hur såg samtiden på personen — hyllad, fruktad eller obetydlig?`
- source_text · Kvädet om Hymer — strof 20 · 0.01
- source_text · Kvädet om Hymer — strof 1 · 0.01
- source_text · Sången om Skirner — strof 34 · 0.01

**HA5** `Vilken makt och vilka resurser disponerade personen?`
- dynasty · Erikska ätten · 0.01
- dynasty · Valdemarätten · 0.009
- dynasty · Sverkerska ätten · 0.009

**HP1** `Vilken politisk eller religiös betydelse hade platsen under sin storhetstid?`
- theme · Tro · 0.009
- source_text · Det korta kvädet om Sigurd — strof 16 · 0.009
- source_text · Beowulf — strof 14 · 0.009

**HP2** `Hur har platsens namn och gränser förändrats genom historien?`
- dynasty · Sjökungar · 0.011
- dynasty · Jelling-dynastin · 0.01
- place · Kittan och Liden · 0.01

**HP3** `Vilka historiska händelser har utspelat sig här?`
- source_text · Det korta kvädet om Sigurd — strof 40 · 0.01
- source_text · Sången om Grimner — strof 45 · 0.01
- source_text · Kvädet om Helge Hjorvardsson — strof 36 · 0.01

**HP4** `Vilka handelsvägar knöt samman platsen med omvärlden?`
- source_text · Den grönländska sången om Atle — strof 1 · 0.01
- source_text · Sången om Vavtrudner — strof 23 · 0.01
- source_text · Sången om Grimner — strof 21 · 0.01

**HP5** `Finns det lokala traditioner, legender eller minnesmärken kvar på platsen?`
- king · Folke Filbyter · 0.01
- king · Ivar Vidfamne · 0.01
- king · Svegder · 0.01

**HP6** `När och varför förlorade platsen sin ursprungliga betydelse?`
- carver · Öpir (Uppland) · 0.012
- carver · Dólgfinnr · 0.01
- carver · Bero · 0.01

**HR1** `Vilka var de utlösande och underliggande orsakerna till förändringen?`
- source_text · Det korta kvädet om Sigurd — strof 51 · 0.01
- source_text · Andra kvädet om Gudrun — strof 24 · 0.01
- source_text · Första kvädet om Gudrun — strof 16 · 0.01

**HR2** `Vilka långsiktiga konsekvenser fick personens handlande?`
- king · Folke Filbyter · 0.006

**HR3** `Hur påverkades den breda befolkningen bortom eliterna?`
- parish · Bredared · 0.01
- king · Ivar Vidfamne · 0.009
- parish · Bredaryd · 0.009

**HR4** `Hur påverkade epidemier, kriser eller klimatfaktorer utvecklingen?`
- dynasty · Sverkerska ätten · 0.01
- dynasty · Erikska ätten · 0.01
- source_text · Det korta kvädet om Sigurd — strof 14 · 0.01

**HE1** `Hur har bilden av personen förändrats i historieskrivningen över tid?`
- dynasty · Sjökungar · 0.011
- dynasty · Jelling-dynastin · 0.011
- king · Ragnhild · 0.01

**HE2** `Vilka myter har skapats kring personen eller platsen och när uppstod de?`
- carver · Öpir (Uppland) · 0.011
- source_text · Kvädet om Hymer — strof 27 · 0.01
- source_text · Kvädet om Helge Hjorvardsson — strof 23 · 0.01

**HE3** `Hur används personen eller platsen idag för att legitimera politiska syften?`
- theme · Makt & dynasti · 0.011
- dynasty · Erikska ätten · 0.009
- dynasty · Sverkerska ätten · 0.009

**HE4** `Hur skildras ämnet i populärkulturen jämfört med akademisk forskning?`
- source_text · Sången om Skirner — strof 34 · 0.01
- source_text · Den Höges sång — strof 6 · 0.01
- source_text · Den Höges sång — strof 107 · 0.01

**HE5** `Har personen eller platsen fallit i glömska under vissa perioder?`
- dynasty · Erikska ätten · 0.01
- dynasty · Gyllenstierna · 0.01
- dynasty · Stenkilska ätten · 0.009

