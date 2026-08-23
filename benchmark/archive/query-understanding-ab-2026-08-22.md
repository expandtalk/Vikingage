# Sökbenchmark v2 — entitetsextraktion vs baseline

Motor: samma edge; skillnaden = query-understanding (ankar-extraktion) före retrieval.

| Mått | Baseline | v2 |
|---|---|---|
| Dead-ends | 13 | **5** |
| Ankare hittat (topp-8) | 30/62 | **52/62** |

Förbättrade: **22** · Regresserade: **0**

## Förbättringar

| ID | Fråga | Ankare | Baseline topp-1 | v2 topp-1 |
|---|---|---|---|---|
| B12 | Vad finns att se i Varnhem? | Varnhem | king · Aun den gamle | parish · Varnhem |
| B13 | Hur tar jag mig till Varnhem? | Varnhem | source_text · Sången om Regin — strof 13 | parish · Varnhem |
| B14 | Vilka sevärdheter finns nära Varnhem? | Varnhem | DEAD | parish · Varnhem |
| B15 | Vilka kyrkor finns i Varnhem? | Varnhem | place · Stora Rytterns kyrkoruin | parish · Varnhem |
| B16 | Vilka museer finns i Kalmar? | Kalmar | source_text · Det korta kvädet om Sigurd — strof 54 | parish · Kalmar |
| B17 | Vad finns nära Kalmar slott? | Kalmar slott | source_text · Den Höges sång — strof 145 | place · Kalmar slott |
| C22 | När grundades Varnhems kloster? | Varnhems kloster | source_text · Den Höges sång — strof 25 | place · Varnhems kloster |
| C23 | Vilka personer är begravda i Varnhem? | Varnhem | dynasty · Sverkerska ätten | parish · Varnhem |
| C24 | Vilka kungar är kopplade till Varnhem? | Varnhem | dynasty · Sverreätten | parish · Varnhem |
| C25 | Vilka medeltida dokument nämner Varnhem? | Varnhem | christian_site · Hospitalshuset, Jönköping | parish · Varnhem |
| C27 | Vilka ortnamn i Västergötland är belagda före år 1000? | Västergötland | DEAD | landscape · Västergötland |
| C28 | Vilka runinskrifter finns nära Varnhem? | Varnhem | theme · Runverket (Sveriges runinskrifter) | parish · Varnhem |
| C29 | Vilka personer nämns i dokument från Varnhem? | Varnhem | DEAD | parish · Varnhem |
| C30 | Hur förändrades Varnhem under medeltiden? | Varnhem | DEAD | parish · Varnhem |
| D34 | Vilka personer är kopplade till Varnhem? | Varnhem | DEAD | parish · Varnhem |
| D35 | Vilka kloster är kopplade till Västergötland? | Västergötland | DEAD | landscape · Västergötland |
| D40 | Vilka personer kan kopplas till både Varnhem och Skara? | Varnhem | king · Magnus den gode | parish · Varnhem |
| E41 | Vilken är den äldsta källan som nämner Varnhem? | Varnhem | dynasty · Sjöbladsätten | parish · Varnhem |
| E44 | Vad vet vi säkert om Varnhem och vad är osäkert? | Varnhem | parish · Vadstena | parish · Varnhem |
| E50 | Vad betyder namnet Varnhem? | Varnhem | DEAD | parish · Varnhem |
| M52 | Hvor ligger Varnhem? | Varnhem | DEAD | parish · Varnhem |
| M53 | Kvar ligg Varnhem? | Varnhem | place · Tranbygge kvarn | parish · Varnhem |

## Regressioner

Inga.

## Kvarstående dead-ends (v2)

- **E48** `hacksilver` (ankare: "hacksilver")
- **E49** `attung` (ankare: "attung")
- **M55** `mælk` (ankare: "mælk")
- **M57** `mjólk` (ankare: "mjólk")
- **M62** `vikingekonge` (ankare: "vikingekonge")
