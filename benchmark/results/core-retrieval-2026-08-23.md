# Benchmark: core-retrieval (v1.0)

Motor: `https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/search-hybrid` (gte-small → search_v2 → search_v1)

Frågor: 62 · Dead-ends: 5 · Ankare hittat (av ej-dead): 52/57

## Per kategori

| Kategori | Frågor | Dead-end | Ankare hittat | Topp-typ rätt |
|---|---|---|---|---|
| A entity/place | 10 | 0 | 9/10 (90%) | 70% |
| B present-day | 10 | 0 | 9/10 (90%) | — |
| C historical | 10 | 0 | 10/10 (100%) | — |
| D relations | 10 | 0 | 9/10 (90%) | — |
| E evidence/concept | 10 | 2 | 7/8 (88%) | 50% |
| M multilingual | 12 | 3 | 8/9 (89%) | 50% |

## Alla frågor

| ID | Fråga | Lang | Guld query_type | n | Dead | Ankare | Topp-1 träff (typ · label · mode) |
|---|---|---|---|---|---|---|---|
| A1 | Varnhem | sv | PLACE_LOOKUP | 8 |  | ✓ | parish · Varnhem (hybrid) |
| A2 | Kalmar | sv | PLACE_LOOKUP | 8 |  | ✓ | parish · Kalmar (hybrid) |
| A3 | Kalmar slott | sv | ENTITY_LOOKUP | 8 |  | ✓ | place · Kalmar slott (hybrid) |
| A4 | Rydboholm | sv | PLACE_LOOKUP | 4 |  | ✓ | place_name · Rydboholm (hybrid) |
| A5 | Västra Aros | sv | ENTITY_LOOKUP | 8 |  | ✗ | place · Västra Strö (hybrid) |
| A6 | Birger jarl | sv | PERSON_LOOKUP | 8 |  | ✓ | king · Birger Jarl (hybrid) |
| A7 | Gustav Vasa | sv | PERSON_LOOKUP | 8 |  | ✓ | king · Gustav Vasa (hybrid) |
| A8 | Olof Skötkonung | sv | PERSON_LOOKUP | 8 |  | ✓ | king · Olof Skötkonung (hybrid) |
| A9 | Sigtuna | sv | PLACE_LOOKUP | 8 |  | ✓ | parish · Sigtuna (hybrid) |
| A10 | Öland | sv | PLACE_LOOKUP | 8 |  | ✓ | landscape · Öland (hybrid) |
| B11 | Var ligger Varnhem? | sv | LOCAL_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| B12 | Vad finns att se i Varnhem? | sv | LOCAL_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| B13 | Hur tar jag mig till Varnhem? | sv | ROUTING | 8 |  | ✓ | parish · Varnhem (hybrid) |
| B14 | Vilka sevärdheter finns nära Varnhem? | sv | GEOGRAPHIC_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| B15 | Vilka kyrkor finns i Varnhem? | sv | GEOGRAPHIC_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| B16 | Vilka museer finns i Kalmar? | sv | GEOGRAPHIC_SEARCH | 8 |  | ✓ | parish · Kalmar (hybrid) |
| B17 | Vad finns nära Kalmar slott? | sv | GEOGRAPHIC_SEARCH | 8 |  | ✓ | place · Kalmar slott (hybrid) |
| B18 | Restauranger nära Kalmar slott | sv | LOCAL_SEARCH | 8 |  | ✓ | place · Kalmar slott (hybrid) |
| B19 | Hur långt är det från Stockholm till Varnhem? | sv | ROUTING | 8 |  | ✗ | parish · Stockholm (hybrid) |
| B20 | Vad heter Varnhem idag? | sv | ATTESTATION | 4 |  | ✓ | excursion · Varnhem (Kata gård) (hybrid) |
| C21 | Vad vet vi om Varnhem under medeltiden? | sv | DISCOVERY | 8 |  | ✓ | parish · Varnhem (hybrid) |
| C22 | När grundades Varnhems kloster? | sv | TEMPORAL_SEARCH | 8 |  | ✓ | place · Varnhems kloster (hybrid) |
| C23 | Vilka personer är begravda i Varnhem? | sv | RELATION_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| C24 | Vilka kungar är kopplade till Varnhem? | sv | RELATION_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| C25 | Vilka medeltida dokument nämner Varnhem? | sv | DOCUMENT_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| C26 | När nämns Varnhem första gången? | sv | ATTESTATION | 1 |  | ✓ | parish · Varnhems (hybrid) |
| C27 | Vilka ortnamn i Västergötland är belagda före år 1000? | sv | TEMPORAL_SEARCH | 8 |  | ✓ | landscape · Västergötland (hybrid) |
| C28 | Vilka runinskrifter finns nära Varnhem? | sv | GEOGRAPHIC_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| C29 | Vilka personer nämns i dokument från Varnhem? | sv | RELATION_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| C30 | Hur förändrades Varnhem under medeltiden? | sv | DISCOVERY | 8 |  | ✓ | parish · Varnhem (hybrid) |
| D31 | Vem var far till Gustav Vasa? | sv | PERSON_RELATION | 8 |  | ✓ | king · Gustav Vasa (hybrid) |
| D32 | Vilka personer var släkt med Gustav Vasa? | sv | PERSON_RELATION | 8 |  | ✓ | king · Gustav Vasa (hybrid) |
| D33 | Vilka orter är kopplade till Gustav Vasa? | sv | PLACE_RELATION | 8 |  | ✓ | king · Gustav Vasa (hybrid) |
| D34 | Vilka personer är kopplade till Varnhem? | sv | RELATION_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| D35 | Vilka kloster är kopplade till Västergötland? | sv | RELATION_SEARCH | 8 |  | ✓ | landscape · Västergötland (hybrid) |
| D36 | Vilka orter är kopplade till Birger jarl? | sv | PLACE_RELATION | 8 |  | ✓ | king · Birger Jarl (hybrid) |
| D37 | Vilka personer förekommer tillsammans med Birger jarl i källorna? | sv | PERSON_RELATION | 8 |  | ✓ | king · Birger Jarl (hybrid) |
| D38 | Vilka runinskrifter finns nära medeltida kyrkor? | sv | RELATION_SEARCH | 8 |  | ✓ | carver · Vidbjörn (hybrid) |
| D39 | Vilka orter har både runinskrifter och medeltida dokument? | sv | RELATION_SEARCH | 8 |  | ✗ | theme · Runverket (Sveriges runinskrifter) (hybrid) |
| D40 | Vilka personer kan kopplas till både Varnhem och Skara? | sv | RELATION_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| E41 | Vilken är den äldsta källan som nämner Varnhem? | sv | ATTESTATION | 8 |  | ✓ | parish · Varnhem (hybrid) |
| E42 | Finns det motstridiga uppgifter om Gustav Vasas födelseplats? | sv | CONTRADICTION | 8 |  | ✓ | king · Gustav Vasa (hybrid) |
| E43 | Vilka uppgifter om Gustav Vasa bygger på senare tradition? | sv | EVIDENCE | 8 |  | ✓ | king · Gustav Vasa (hybrid) |
| E44 | Vad vet vi säkert om Varnhem och vad är osäkert? | sv | EVIDENCE | 8 |  | ✓ | parish · Varnhem (hybrid) |
| E45 | Vilka påståenden om en ort stöds av flera oberoende källor? | sv | EVIDENCE | 8 |  | ✗ | source_text · Det korta kvädet om Sigurd — strof 63 (hybrid) |
| E46 | mjölk | sv | CONCEPT_THEME | 3 |  | ✓ | ecclesiastical_site · Mjölkuddskyrkan (hybrid) |
| E47 | solidus | sv | CONCEPT_THEME | 5 |  | ✓ | coin · Solidus "Leo Perpetuus" (feb 457) (hybrid) |
| E48 | hacksilver | sv | CONCEPT_THEME | 0 | JA |  | — (lexical) |
| E49 | attung | sv | CONCEPT_THEME | 0 | JA |  | — (lexical) |
| E50 | Vad betyder namnet Varnhem? | sv | ETYMOLOGY | 8 |  | ✓ | parish · Varnhem (hybrid) |
| M51 | Where is Varnhem? | en | LOCAL_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| M52 | Hvor ligger Varnhem? | da | LOCAL_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| M53 | Kvar ligg Varnhem? | no | LOCAL_SEARCH | 8 |  | ✓ | parish · Varnhem (hybrid) |
| M54 | milk | en | CONCEPT_THEME | 1 |  | ✓ | person · Milke Falck (hybrid) |
| M55 | mælk | da | CONCEPT_THEME | 0 | JA |  | — (lexical) |
| M56 | melk | no | CONCEPT_THEME | 8 |  | ✓ | person · Melker Ellborg (hybrid) |
| M57 | mjólk | is | CONCEPT_THEME | 0 | JA |  | — (lexical) |
| M58 | Roman gold coin solidus | en | CONCEPT_THEME | 8 |  | ✗ | carver · Anonym mästare (U 665/672) (hybrid) |
| M59 | runestones near Uppsala | en | GEOGRAPHIC_SEARCH | 8 |  | ✓ | parish · Uppsala (hybrid) |
| M60 | medieval charters mentioning Kalmar | en | DOCUMENT_SEARCH | 8 |  | ✓ | parish · Kalmar (hybrid) |
| M61 | who was Gustav Vasa | en | PERSON_LOOKUP | 8 |  | ✓ | king · Gustav Vasa (hybrid) |
| M62 | vikingekonge | da | CONCEPT_THEME | 0 | JA |  | — (lexical) |

## Topp-3 per fråga (för inspektion)

**A1** `Varnhem`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**A2** `Kalmar`
- parish · Kalmar · 0.523
- place · Kalmar · 0.522
- municipality · Kalmar · 0.516

**A3** `Kalmar slott`
- place · Kalmar slott · 0.531
- heritage_site · Kalmar slott · 0.521
- castle · Kalmar slott · 0.516

**A4** `Rydboholm`
- place_name · Rydboholm · 0.516
- heritage_site · Rydboholms kyrka · 0.066
- ecclesiastical_site · Rydboholms kyrka · 0.066

**A5** `Västra Aros` — _historiskt namn på Västerås — testar aliaslager_
- place · Västra Strö · 0.01
- place · Västra Arninge · 0.01
- parish · Västra Sallerup · 0.009

**A6** `Birger jarl`
- king · Birger Jarl · 0.535
- person · Birger jarl · 0.52
- genetic_individual · Birger Jarl (Birger Magnusson) · 0.066

**A7** `Gustav Vasa`
- king · Gustav Vasa · 0.537
- source · Gustav Vasa – landsfader eller tyrann? · 0.066
- source · Gustav Vasas reformationstavlor · 0.066

**A8** `Olof Skötkonung`
- king · Olof Skötkonung · 0.527
- excursion · Sigtuna · 0.031
- coin · Fyrkantigt mynt, Olof Skötkonung · 0.016

**A9** `Sigtuna`
- parish · Sigtuna · 0.54
- place · Sigtuna · 0.54
- excursion · Sigtuna · 0.531

**A10** `Öland`
- landscape · Öland · 0.527
- content_page · Öland · 0.516
- place_name · Öland · 0.516

**B11** `Var ligger Varnhem?` — _NL-fråga: överlever entitetslänkning trots frågeord?_
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**B12** `Vad finns att se i Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**B13** `Hur tar jag mig till Varnhem?` — _routing utanför korpus-scope_
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**B14** `Vilka sevärdheter finns nära Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**B15** `Vilka kyrkor finns i Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**B16** `Vilka museer finns i Kalmar?`
- parish · Kalmar · 0.523
- place · Kalmar · 0.522
- municipality · Kalmar · 0.516

**B17** `Vad finns nära Kalmar slott?`
- place · Kalmar slott · 0.531
- heritage_site · Kalmar slott · 0.521
- castle · Kalmar slott · 0.516

**B18** `Restauranger nära Kalmar slott` — _restauranger finns EJ i korpus — förväntad scope-miss_
- place · Kalmar slott · 0.531
- heritage_site · Kalmar slott · 0.521
- castle · Kalmar slott · 0.516

**B19** `Hur långt är det från Stockholm till Varnhem?`
- parish · Stockholm · 0.532
- county · Stockholm · 0.516
- municipality · Stockholm · 0.516

**B20** `Vad heter Varnhem idag?`
- excursion · Varnhem (Kata gård) · 0.016
- parish · Varnhem · 0.01
- parish · Varnhems · 0.01

**C21** `Vad vet vi om Varnhem under medeltiden?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**C22** `När grundades Varnhems kloster?`
- place · Varnhems kloster · 0.525
- christian_site · Varnhems kloster · 0.525
- ecclesiastical_site · Varnhems kloster · 0.516

**C23** `Vilka personer är begravda i Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**C24** `Vilka kungar är kopplade till Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**C25** `Vilka medeltida dokument nämner Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**C26** `När nämns Varnhem första gången?`
- parish · Varnhems · 0.008

**C27** `Vilka ortnamn i Västergötland är belagda före år 1000?` — _aggregat/filter — ingen enskild ankarentitet_
- landscape · Västergötland · 0.516
- source · Epigrafiska områden i medeltidens Västergötland : ett samspel mellan latinsk och runsk skriftkultur · 0.016
- source · Ett kammargravfält i Västergötland · 0.016

**C28** `Vilka runinskrifter finns nära Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**C29** `Vilka personer nämns i dokument från Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**C30** `Hur förändrades Varnhem under medeltiden?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**D31** `Vem var far till Gustav Vasa?` — _far = Erik Johansson; testar om NL-brus sänker entitetslänkning vs A7_
- king · Gustav Vasa · 0.537
- source · Gustav Vasa – landsfader eller tyrann? · 0.066
- source · Gustav Vasas reformationstavlor · 0.066

**D32** `Vilka personer var släkt med Gustav Vasa?`
- king · Gustav Vasa · 0.537
- source · Gustav Vasa – landsfader eller tyrann? · 0.066
- source · Gustav Vasas reformationstavlor · 0.066

**D33** `Vilka orter är kopplade till Gustav Vasa?`
- king · Gustav Vasa · 0.537
- source · Gustav Vasa – landsfader eller tyrann? · 0.066
- source · Gustav Vasas reformationstavlor · 0.066

**D34** `Vilka personer är kopplade till Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**D35** `Vilka kloster är kopplade till Västergötland?`
- landscape · Västergötland · 0.516
- source · Epigrafiska områden i medeltidens Västergötland : ett samspel mellan latinsk och runsk skriftkultur · 0.016
- source · Ett kammargravfält i Västergötland · 0.016

**D36** `Vilka orter är kopplade till Birger jarl?`
- king · Birger Jarl · 0.535
- person · Birger jarl · 0.52
- genetic_individual · Birger Jarl (Birger Magnusson) · 0.066

**D37** `Vilka personer förekommer tillsammans med Birger jarl i källorna?`
- king · Birger Jarl · 0.535
- person · Birger jarl · 0.52
- genetic_individual · Birger Jarl (Birger Magnusson) · 0.066

**D38** `Vilka runinskrifter finns nära medeltida kyrkor?` — _korstyp-fråga, ingen ankarentitet_
- carver · Vidbjörn · 0.01
- carver · Vigmund · 0.01
- theme · Runverket (Sveriges runinskrifter) · 0.01

**D39** `Vilka orter har både runinskrifter och medeltida dokument?` — _korstyp-fråga_
- theme · Runverket (Sveriges runinskrifter) · 0.012
- carver · Vidbjörn · 0.011
- carver · Vigmund · 0.011

**D40** `Vilka personer kan kopplas till både Varnhem och Skara?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**E41** `Vilken är den äldsta källan som nämner Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**E42** `Finns det motstridiga uppgifter om Gustav Vasas födelseplats?`
- king · Gustav Vasa · 0.02
- dynasty · Vasaätten · 0.01
- king · Vsevolod I · 0.008

**E43** `Vilka uppgifter om Gustav Vasa bygger på senare tradition?`
- king · Gustav Vasa · 0.037
- dynasty · Vasaätten · 0.01
- king · Gustav IV Adolf · 0.009

**E44** `Vad vet vi säkert om Varnhem och vad är osäkert?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**E45** `Vilka påståenden om en ort stöds av flera oberoende källor?` — _abstrakt metafråga_
- source_text · Det korta kvädet om Sigurd — strof 63 · 0.01
- source_text · Kvädet om Atle — strof 27 · 0.01
- source_text · Andra kvädet om Gudrun — strof 6 · 0.01

**E46** `mjölk` — _vardagsord: ska ge relaterat, ej dead-end_
- ecclesiastical_site · Mjölkuddskyrkan · 0.066
- heritage_site · Mjölkestenarna, Stenkrets/stenrad · 0.066
- experience · Lingon och Mjölk, Lindesjön · 0.016

**E47** `solidus` — _homonym: guldmynt vs räkneenhet (senare i svarslagret)_
- coin · Solidus "Leo Perpetuus" (feb 457) · 0.066
- museum_object · solidus theodosius ii · 0.066
- source · Solidusfynden på Öland och Gotland · 0.066

**E48** `hacksilver` — _domänterm — finns kuraterat innehåll?_
- DEAD-END

**E49** `attung` — _domänterm (jordmått)_
- DEAD-END

**E50** `Vad betyder namnet Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**M51** `Where is Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**M52** `Hvor ligger Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**M53** `Kvar ligg Varnhem?`
- parish · Varnhem · 0.526
- city · Varnhem · 0.516
- archaeological_site · Varnhem · 0.516

**M54** `milk` — _engelskt begreppsord — matchar EJ svenska mjölk-ortnamn lexikalt_
- person · Milke Falck · 0.067

**M55** `mælk` — _danskt — matchar EJ mjölk-_
- DEAD-END

**M56** `melk`
- person · Melker Ellborg · 0.068
- person · Melker Karlsson · 0.068
- person · Melker Hallberg · 0.068

**M57** `mjólk`
- DEAD-END

**M58** `Roman gold coin solidus`
- carver · Anonym mästare (U 665/672) · 0.01
- carver · Samma som gjort U 276 · 0.01
- carver · Anonym mästare (U 1026/1027) · 0.01

**M59** `runestones near Uppsala`
- parish · Uppsala · 0.532
- place · Uppsala · 0.532
- road_waypoint · Uppsala · 0.517

**M60** `medieval charters mentioning Kalmar`
- parish · Kalmar · 0.523
- place · Kalmar · 0.522
- municipality · Kalmar · 0.516

**M61** `who was Gustav Vasa`
- king · Gustav Vasa · 0.537
- source · Gustav Vasa – landsfader eller tyrann? · 0.066
- source · Gustav Vasas reformationstavlor · 0.066

**M62** `vikingekonge` — _danskt 'vikingakung' — semantisk bro till sv/en?_
- DEAD-END

