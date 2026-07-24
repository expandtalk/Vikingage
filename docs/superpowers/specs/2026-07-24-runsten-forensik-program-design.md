# Forensisk runstensanalys — program-design

**Datum:** 2026-07-24
**Status:** Design (program-nivå) — väntar användargranskning innan DP1-spec
**Författare:** Daniel Larsson + Claude
**Relaterat:** `2026-07-17-ortnamn-gis-pilot-design.md` (metoden återanvänds), `src/utils/placeNameElements.ts`, minnesnoterna hypothesis-tester / picture-stone-spolia / carver-enrichment-kallstrom

---

## 1. Bakgrund & mål

Plattformen har en beprövad, reproducerbar analysmetod på ortnamnssidan (`/sv/ortnamn`): en deklarativ **element-katalog** med evidensskikt (core / extended / control), en ren **matchningsfunktion** som körs identiskt i importskript och UI, och en **hypotestestare** som alltid jämför en signalgrupp mot en **kontroll-baslinje** och redovisar n, median och osäkerhet.

Målet med detta program är att föra över samma metod till **runinskrifterna**, med tre sammanflätade ambitioner:

1. **Datera stenar snävare än källdateringen.** Rundatas dateringar är breda (ofta 200–300 år) därför att stildatering är trubbig. Men den breda dateringen är inte taket — den är **startkuvertet**. Varje sten bär flera *oberoende* dateringsvillkor, och det sanna intervallet är **snittet** av dem. Kombinationen ger ofta decennie-upplösning.
2. **Attribuera stenar** som i konstvärldens connoisseurskap — via ornamentik, runformer, ordval, komposition — och hitta "digitala tvillingar" (stenar av samma hand/verkstad).
3. **Kartlägga språkets förändring över tid** (och rum) med ortnamns-metoden, men på en **tidsaxel** (sekel, decennium där data räcker).

Bärande insikt (Daniel): *en sten är summan av sina drag, och dragen begränsar tiden.* En person blir sällan >90 år och är yrkesverksam ~30–70; en ristares hela produktion ligger därför i ett ~40-årsfönster. Mästar–lärling, förebild och samarbete ger en logisk tidsstruktur. Knyts en inskrift till en daterbar händelse (Ingvarståget ~1041) pinnas den hårt.

Perioden "vikingatid" används **inte** som analysenhet — den är en efterhandskonstruktion. Neutrala 100-årsintervall (nedbrytbara till decennium) är analysaxeln.

---

## 2. Kärnprinciper (icke förhandlingsbara)

Dessa gäller varje delprojekt och all UI.

1. **Cirkularitetsväggen.** För att studera språkförändring får dateringen *endast* komma från **icke-språkliga** ankare (ornamentik, runform, verktygsspår, material, relationer, händelseankare). Språkliga drag (formel, ordval, titel, versmått) är **signalen** som studeras — de får aldrig datera de stenar som sedan matar språkstudien. Fingerprinting får *föreslå* datum; bara oberoende ankare får *bekräfta* dem för DP2.
2. **Proveniens på varje härlett värde.** Varje snävad datering och varje härlett drag visar (a) vilka villkor/metoder som gav det, (b) källa, (c) kvarvarande osäkerhet. Aldrig en påhittad exakt siffra som "fakta".
3. **Datum är intervall-med-konfidens, aldrig punkter.** Attribueringsosäkerhet propagerar: sannolik attribuering → sannolikt ärvt datum.
4. **Kontroll-baslinje.** Ingen signalgrupp mäts isolerat; den jämförs mot en kontrollgrupp (jfr `by/sta/torp` på ortnamnssidan).
5. **Reproducerbarhet.** Alla urvals-/matchningsregler är deklarativa och bestämda i förväg — samma regel i importskript och UI.
6. **AI ger estimat, inte facit.** Maskinellt härledda drag är hypoteser med konfidens, alltid människo-verifierbara (visa bild + mät-overlay), och kalibrerade mot ett expertset innan de får mata datering.

---

## 3. Arkitektur — översikt

```
                       ┌──────────────────────────────────────────┐
                       │   Gemensamt substrat: stone_features       │
                       │   (typad, källbelagd, konfidens-taggad,    │
                       │    roll A/B/C, språklig? hård/mjuk)         │
                       └──────────────────────────────────────────┘
                                   ▲                 ▲
         visuell extraktion        │                 │   text-/data-härledning
      ┌───────────────────┐        │                 │   ┌──────────────────┐
      │ V1 metrisk (CV)    │──────► │                 │ ◄─│ ordval/formel/    │
      │ V2 stil (vision-ML)│  fyller B (icke-språkl.) │   │ titel/versmått    │
      │ V3 teknik (3D)     │        │                 │   │ (språkligt → DP2) │
      └───────────────────┘        │                 │   └──────────────────┘
                                   ▼                 ▼
                    ┌───────────────────────────────────────┐
                    │  NAV: temporal villkorsgraf             │
                    │  stil ∩ ristarfönster ∩ händelse         │
                    │  + riktade "före"-kanter (mästar/förebild)│
                    │  + samtidighet (samarbete/dubbelsign.)   │
                    │  → refined_from/to + konfidens + proveniens│
                    └───────────────────────────────────────┘
                          │              │               │
                          ▼              ▼               ▼
                       DP1            DP2              DP3
                   datering    diakron språk     attribuering /
                   (ryggrad)   (ortnamn-metod)   digital tvilling
```

**Enheter och deras ansvar:**

- **`stone_features` (substrat).** En normaliserad, extensibel uppsättning drag per inskrift. Varje drag är en typad post: `{ inscription_id, feature_key, role: A|B|C, value, is_linguistic: bool, is_hard_constraint: bool, confidence, method, source }`. Alla tre delprojekt läser härifrån; ingen bygger sin egen dragrepresentation.
- **Villkorsgrafen (nav).** Konsumerar roll-A-drag + relationer, producerar per-sten förfinat dateringsintervall. Ren, testbar modul (constraint-propagation).
- **Visuell pipeline.** Producerar roll-B-drag (icke-språkliga) ur bilder. Fristående; skriver till `stone_features`.
- **DP1/DP2/DP3.** Konsumenter. Var och en har sin egen spec, plan och UI.

Isoleringsprincip: substratet är det enda gränssnittet mellan producenter (text-härledning, visuell pipeline, kurering) och konsumenter (DP1–3). Man ska kunna byta ut hur ett drag *härleds* utan att röra hur det *konsumeras*.

---

## 4. Signalkatalog — tre roller

Daniels ~30 signaler faller i tre funktionella roller. Rollen avgör vad draget *gör* i motorn. Kolumnen **Datanivå**: `nu` = härledbart ur dagens data · `kurering` = kräver expertbedömning/ny tabell · `frontlinje` = kräver ny mätdata (t.ex. 3D).

### Roll A — dateringsvillkor (NÄR)
| Signal | Verkan | Språkligt? | Datanivå |
|---|---|---|---|
| Runtyp (långkvist/kortkvist/stavlös) | brett kuvert | nej | nu/kurering* |
| Stilgrupp (Gräslund `style_group`) | kuvert | nej | nu |
| Ristarfönster (aktiv ~30–70) | snävar hårt | nej | nu |
| Mästar→lärling | riktad "före"-kant | nej | kurering |
| Förebild/efterföljd | riktad "före"-kant | nej | kurering |
| Samarbete / dubbelsignatur | samtidighet (∩ fönster) | nej | kurering |
| Händelseankare (Ingvar, englandståg, österled/Konstantinopel) | hård gräns | nej | kurering |
| Koppling till tidig kyrka/ting/tingshändelse | terminus | nej | kurering |

\* Runtyp finns kanske delvis; verifieras av auditen.

### Roll B — attribueringsdrag / "fingerprint" (VEM / verkstad)
| Signal | Språkligt? | Datanivå |
|---|---|---|
| Ornamentik / drakslingans stil | nej | kurering / V2 |
| Runformer (glyf-morfologi) | nej | nu(text) / V2 |
| Skiljemarkörer (kryssformigt skiljetecken) | nej | nu(text) |
| Bindrunor / ovanliga sammanbindningar | nej | kurering |
| Komposition: var på stenen, vilka sidor, hur draken stänger texten | nej | V1/V2 |
| Typografisk regularitet (runhöjd, teckenavstånd, spärrning, horungar) | nej | **V1** |
| Kvalitet / amatörmässighet | nej | V1/V2 |
| Storlek (→ verkstad vs platsbunden) | nej | nu/kurering |
| Spårprofil (verktygsspår) | nej | **frontlinje (3D)** |
| Signatur (ristarnamn i texten) | nej† | nu(text) |
| Resarformler | **ja** | nu(text) |
| Ordval för ristningsakten (*rista/haggva/marka*) | **ja** | nu(text) |
| Titlar (*þróttaR þegn* m.fl.) | **ja** | nu(text) |
| Versmått / skaldeform | **ja** | nu(text, delvis via MeterBadge) |

† Signaturens *form* är icke-språklig; namnet som ord är det inte — hanteras som attribuering, inte som språksignal i DP2.

### Roll C — kontext / proveniens (VAR / socialt)
| Signal | Datanivå |
|---|---|
| Gård / estate | kurering (estates finns) |
| Härad & socken | nu |
| Placering / topografi | nu (koordinater) |
| Yrke → rod / kung / kyrka | kurering |
| Resenärens ursprung (England, Grekland, …) | kurering |
| Romersk-inspirerad verkstad | kurering |
| Material (t.ex. skiffer) | kurering |
| Regional signatur österled/Konstantinopel | kurering |

---

## 5. Navet — temporal villkorsgraf (DP1:s kärna)

Modellen är ett **intervall-constraint-nät** (jfr Allens intervall-algebra):

- **Noder** = inskrifter (och ristare, som bär ett aktivt fönster).
- **Egenvillkor** per nod: initialt intervall = stilkuvert `[period_start, period_end]`.
- **Hårda gränser**: händelseankare, terminus post/ante quem från kyrka/ting.
- **Riktade kanter** ("A före B"): mästar→lärling, förebild→efterföljd.
- **Samtidighetskanter**: samarbete/dubbelsignatur ⇒ ristarnas aktiva fönster måste överlappa; samverkans-stenen dateras av snittet.
- **Ristarband**: alla stenar tillskrivna en ristare ärver hans aktiva fönster (≤ ~40 år; livslängd ≤ ~90).

**Propagering:** snitta egenvillkor med alla inkommande gränser; propagera riktade kanter tills fixpunkt. Resultat per sten: `refined_from`, `refined_to`, `confidence`, och `provenance` (lista över vilka villkor som bidrog). Upplösning: sekel som default, decennium redovisas bara när villkoren faktiskt bär det.

**Cirkularitetsvakt i praktiken:** grafen körs i två lägen — `all` (alla villkor, för visning/attribuering) och `non_linguistic` (endast icke-språkliga villkor, det datum DP2 får konsumera). DP2 läser *aldrig* `all`-datumet.

Öppna designval att spika i DP1-specen: representation av osäkerhet (intervall + konfidensklass i v1; sannolikhetsfördelning skjuts till DP3/probabilistisk fas), och hur motstridiga villkor flaggas (hellre "konflikt, ej snävad" än falsk precision).

---

## 6. Visuell extraktions-pipeline

En fristående kapacitet som fyller roll-B (icke-språkliga) drag ur bilder och därmed tjänar både DP1 (datering via form/ornament) och DP3 (attribuering). Stegas efter realism:

- **V1 — metrisk/typografisk** (byggbart nu om bild finns): segmentera runor, mät runhöjds-varians, teckenavstånd, spärrning, baslinje-regularitet, radstruktur, horungar → *regularitets-/professionalism-score*. Klassisk CV, ingen tung ML. Helt icke-språkligt.
- **V2 — stilistisk** (vision-modell, hypotesnivå): bildsten ja/nej, drakslingans stil, ornamentskola, layout, kvalitet. **Måste kalibreras mot expertset innan den matar DP1** (ornamentstil används själv för datering → felpropagering).
- **V3 — teknik/verktygsspår** (frontlinje): grooves/spårprofil, ristningsordning. Kräver 3D/RTI-underlag; 2D-foto räcker inte. Aspirationell tills sådan data finns.

Degraderingsrisker som pipelinen måste hantera/flagga: vittring, lav, modern rödfärg (1900-talsrekonstruktion), återanvända/skadade stenar (spolia).

---

## 7. Dekomponering i delprojekt

Programmet är för stort för en spec. Det byggs som separata delprojekt ovanpå `stone_features`, var och en med egen spec → plan → implementation.

### DP1 — Dateringsförfinings-motorn  ← **börja här**
Villkorsgrafen (§5) + `stone_features`-substratet (roll A + de icke-språkliga B/C-drag som redan är härledbara) + en proveniens-modell. Levererar per-sten `refined_from/to/confidence/provenance` via en RPC. **Varför först:** den är ryggraden och lyfter *omedelbart* befintliga ytor — kartans tidslinje, carvers-sidan (ristarband), och intresseprofilernas period-filter — utan att kräva vare sig visuell pipeline eller språkmodell. MVP kan köras på enbart `stil ∩ ristarfönster ∩ händelseankare` och sen växa.

### DP2 — Diakron språkkartläggning
Ortnamns-metoden på runorna: en run-språk-katalog (samma schema som `placeNameElements.ts`) + reproducerbar matchning mot translittereringen + kontroll-baslinje + **tidsaxel** (sekel/decennium) + 300-årsgrind (`refined_to − refined_from < 300`, på `non_linguistic`-datumet). Semantiska ordgrupper (makt/kult/släkt/lag/färd) som första seedade katalog; dialekt/lånord och ordformer som ytterligare katalogfiler.

### DP3 — Attribuering / digital tvilling
Fingerprint-vektor per sten (roll-B-drag) + likhetsmått + klustring → "digitala tvillingar", hand-/verkstadshypoteser. Nedströms om att B-drag finns (text-härledda nu, visuella via pipelinen).

### Tvärgående: visuell pipeline (§6)
Byggs V1 → V2 → V3, oberoende av DP-ordningen, men V1 bör tidigareläggas eftersom den ger icke-språkliga dateringsdrag som stärker DP1 och DP2:s oberoende.

---

## 8. Datagrund (delvis verifierad — bakgrundsaudit pågår)

**Bekräftat (kod/schema):**
- `runic_inscriptions`: `period_start`, `period_end`, `dating_text`, `dating_confidence`, `style_group` (Gräslund-kod), `translitteration`. Koordinater finns.
- Ristare: aktiv-period visas (`formatPeriod`), RPC:er `get_carver_statistics` / `get_carver_inscriptions`, carver↔inskrift-länk finns (`carverid`-filter).
- `king_inscription_links` finns. `MeterBadge` klassificerar redan versmått (skaldiskt/eddiskt) per inskrift. Generisk `relationship`/`entity_registry`-KG finns (kan hålla mästar–lärling/förebild-kanter).
- Bild-substrat: repo har `images/…`-mappar (u357, karlevistenen m.fl.); gren `feat/runestone-portrait-thumbs` (mergad) införde porträtt-tumnaglar.

**Kräver bygge/kurering (preliminärt):** stentyps-/attribuerings-drag (ornamentik, komposition, kvalitet), mästar–lärling- & förebild-relationer, strukturerade händelse→inskrift-länkar, material, resenärsursprung, yrke→institution.

**Frontlinje:** spårprofil (3D).

**Kvarstår att verifiera mot live-DB innan DP1-spec:** täckningsgrad för `period_start/end`, fördelning som klarar <300-årsgrinden, andel ristar-länkade stenar, runtyp-taggningens existens, bildtäckning/upplösning. (Uppdateras när auditen och en live-DB-koll är klara.)

---

## 9. Metodrisker & motåtgärder

| Risk | Motåtgärd |
|---|---|
| **Cirkularitet** (språk daterar språk) | Två graflägen; DP2 läser bara `non_linguistic`-datum (§5) |
| **Falsk precision** | Datum = intervall + konfidens; konflikt → "ej snävad" hellre än gissning |
| **Attribueringsosäkerhet propagerar** | Konfidens bärs och multipliceras genom ärvda datum |
| **AI översäljs** | Härledda drag = hypoteser m. konfidens, människo-verifierbara, kalibrerade före datering |
| **Datatäckning/bias** | Redovisa n och täckning öppet; glesa sekel markeras, tystas inte |
| **Vittring/rödfärg/spolia** | Pipelinen flaggar bildkvalitet & återanvändning |

---

## 10. Byggordning & MVP

1. **`stone_features`-substrat** (schema + skrivväg) — minsta gemensamma nämnare.
2. **DP1 MVP** — villkorsgraf på `stil ∩ ristarfönster ∩ händelseankare`, proveniens, RPC, koppla in i tidslinje/carvers.
3. **Visuell V1** (metrisk) — om bildtäckning räcker; ger fler icke-språkliga drag.
4. **DP1-utbyggnad** — relationskanter (mästar/förebild/samarbete) via KG-relationer.
5. **DP2** — språk-katalog + tidsaxel på oberoende datum.
6. **DP3 / V2 / probabilistisk fas** — attribuering, stilklassning, fördelningar.

---

## 11. Uttryckligen ute ur scope nu (YAGNI)

- Full 30-signal-katalog på en gång — signaler läggs in efter datatillgång × dateringskraft.
- Probabilistisk fingerprinting / bayesianska fördelningar — efter deterministisk snitt-modell.
- V3 verktygsspårs-forensik (3D) — kräver mätdata vi saknar.
- Refaktor av den *befintliga* ortnamns-motorn till delad kärna — DP2 speglar schemat; hopslagning skjuts till när nyttan är bevisad.

---

## 12. Öppna frågor

1. Källa för icke-språkliga attribueringsdrag (ornamentik/runform-taggning) — Samnordisk runtextdatabas, Axelson, egen kurering, eller den visuella pipelinen? Avgör hur snabbt cirkularitetsväggen kan hålla i DP2.
2. Bildrättigheter/upplösning för visuell V1 — vilka bildkällor får användas och räcker upplösningen?
3. Osäkerhetsrepresentation i DP1 v1: konfidensklasser (hög/medel/låg) räcker, eller behövs numeriska intervall direkt?
