# Platsupplevelse — två axlar, presets, besöksdata & geodata

**Datum:** 2026-08-12
**Status:** Design (konsoliderar en lång diskussionstråd). Relevans-fixen (#1 nedan) är gjord och committad; resten är att bygga.
**Relaterat minne:** [[place-archetype-dossier]], [[personas-gamification-plan]], [[experiences-badlager]], [[cookieless-and-privacy]], [[mobile-plan-location]], [[maplibre-drive-view-fas2]], [[dem-derived-shorelines]], [[search-geo-anchor-unaccent]], [[content-pages-kg-spatial]]

---

## 1. Syfte & problem

Söksvaret och platssidorna ska tjäna **tre publiker på samma data**: den historieintresserade, den breda besökaren (som kanske inte alls bryr sig om historia men vill *göra något* nära sig — med barn, hund, partner, familj), och **AI-agenter** som vill konsumera strukturerat, källmärkt data. Idag är kontrollmodellen hopblandad (yrkes-"linser" som paketerar *innehåll* med *renderingsfilosofi*), täckningen ojämn, och gränssnittet läser som att akademikern är normalfallet.

Kärnbeslutet: **separera två axlar som nu är sammanblandade, och låt allt annat (personas, occasions, yrkeslinser) bli *presets* över dem.** Plus en ärlig linje kring vad som är källbelagt, vad som är redaktionell bedömning, och vad som är live-flöde.

---

## 2. Kärnmodell: två axlar + presets

### 2.1 Innehållsaxeln (vad)
Kombinerbara innehållstyper — samma som dagens kartlager: runstenar, gravfält, kyrkor, fornborgar, hamnar/vrak, överfarter, **utflykter**, **äventyr** (bad/grottor/fiske/…). Användaren slår på/av fritt. Detta är axeln jag redan byggt som legend-togglar i `AnswerContext`.

### 2.2 Lägesaxeln (hur) — Upptäck / Fördjupa
Ett globalt val som **inte** rör vilket innehåll som visas, bara *hur*:

| | **Upptäck** (default, namnlöst i tonen) | **Fördjupa** |
|---|---|---|
| Språkregister | vardagligt, berättande | fackligt, precist |
| Källhänvisning | dold (finns bakom klick) | synlig (SDHK/RAÄ/signum) |
| Osäkerhet | döljs eller "ungefär" | intervall + konfidens (belagt/hypotes) |
| Renderingstäthet | kuraterat urval (få, starka) | allt, kanonisk sortering |
| Primär entry | destinationer/utflykter | entiteter/forskning |

**Regel:** innehållsraden är identisk i båda lägena. Byter man läge *omgrupperas/omtonas* vyn — den blandas inte om. Man kan börja i Upptäck, hitta en runsten, klicka **Fördjupa** och behålla position + urval. Övergång = fördjupning, inte omtag.

Default är Upptäck och **namnlöst** ("balanserat läge" tas bort). Akademikern är inte normalfallet.

### 2.3 Presets — personas, occasions och yrkeslinser är samma sak
Ett **preset** = ett sparat `(innehållsurval + läge + besökslins)`. Det löser "vem är du?"-problemet: ingen deklarerar yrke, man väljer en *nyfikenhet eller ett tillfälle*.

- **Occasion-presets** (Upptäck): "Med barn", "Med hund", "Romantik", "Familj", "En timme på norra Öland", "Vad kan man se i regn". Sätter innehåll (t.ex. bad + utflykter + naturstig) + besöksattribut (tillgänglighet, tid).
- **Nyfikenhets-presets** (Fördjupa) — de gamla yrkeslinserna, omdöpta till substantiv/fråga:

| Gammalt (yrke) | Nytt (substantiv) | Underrubrik |
|---|---|---|
| Lingvist | **Namnen** | Vad heter platsen och varför |
| Osteolog | **Människorna** | Vilka låg i gravarna |
| Marinarkeolog | **Sjövägarna** | Hamnar, vrak och gammal strandlinje |
| Kyrkohistoriker | **Tron** | Från blot till kyrka |
| Geolog | **Marken** | Is, berg och strandlinjer |
| Kulturgeograf | **Bygden** | Hur gårdar och stråk hängde ihop |

Yrket får ligga kvar som liten undertext för den som bryr sig. En preset är alltså inte en tredje kontroll — det är en genväg som ställer in de två axlarna. Persistens: cookiefritt i `localStorage` (matchar integritetslinjen); inloggade forskare kan spara på kontot. **Legend-invarianten gäller:** preset sätter *initialt* läge, tvingar aldrig PÅ per render (seeda en gång med ref-vakt).

---

## 3. Äventyr: ankarberoende — attribut *och* innehåll

Diskussionen landade nästan i "bad = attribut, inte lager". Det är rätt **när ankaret är en fornlämning** ("bada vid Gråborg" = detalj på destinationen), men fel för besökaren som *inte* bryr sig om historia och söker "nära mig, med barn". För hen **är** bad/skidbacke/motionsspår innehållet.

**Beslut — samma `experiences`-data, två ytor, valt av ankaret:**
- Ankare = fornlämning/ort (sök "Gråborg") → äventyr visas som **attribut/detalj** på destinationen (`badplats:true`, "grotta 400 m").
- Ankare = "nära mig / ett tillfälle" (mobil, occasion-preset) → äventyr **är** lagret (det jag redan byggt via `nearby_experiences`).

Behåll alltså äventyrslagret jag byggt; gör det **ankar-medvetet**. Slå inte ihop till attribut-bara — då tappas den breda besökaren som är hela poängen med utbyggnaden.

Nya kategorier att bygga ut äventyr med (var och en kräver **verifierad öppen källa** — INGEN GISSNING): slalom-/skidbackar, motionsspår, naturstigar, fågelskådning. Se §4 om deras epistemik och §8 om källor.

---

## 4. Tre epistemiska register (måste hållas synligt isär)

Plattformens trovärdighet är produkten. Idag finns två register (belagt fakta vs sägen). Besöks- och äventyrsdata tvingar fram ett tredje:

1. **Källbelagt & beständigt** — RAÄ, SDHK, SGU, Lantmäteri. Har proveniens + referens. (Kartan, historielagren.)
2. **Redaktionell bedömning** — "syns något på plats?", "värt en omväg?", hook. Ingen extern källa kan svara. Är en *signerad bedömning* med författare + datum (`curated_by`, `curated_at`, `verified_on_site`). Accepteras för Upptäck-lagret, tydligt märkt — samma disciplin som "märk sägen som sägen".
3. **Live-flöde & efemärt** — **skidväder**, isläge, öppettider. Tidsstämplat, källhänvisat, cachat *overlay* — lagras **aldrig** som fakta, hör **inte** hemma i `site_visit_profile`. Skidväder = SMHI-flöde med "uppdaterad kl. X", inte en kolumn.

Att blanda ihop dessa är samma fel som att presentera en gissning som fakta. Tre register, alltid visuellt åtskilda.

---

## 5. `site_visit_profile` — besöksdata-ontologin

Besöksdata är **redaktionellt** (register 2), inte källhärlett → en **1:1-tabell hängd på site-entiteten**, inte kolumner på fornlämningen. Proveniensen skiljer sig och måste bäras.

### 5.1 Fält (prioritetsordning)
- **`visibility`** — `monumentalt` / `syns om man vet vad man letar efter` / `inget synligt` / `rekonstruerat`. **Enskilt viktigaste fältet** — merparten av RAÄ-punkterna är osynliga i fält.
- `signage` — finns skylt, och på vilket språk
- `access_mode` — till fots / bil / cykel / båt + `distance_from_parking_m`
- `terrain` — asfalt / grusstig / stig / stenig obana / betesmark (löser både WCAG och barnvagn)
- `visit_minutes` — typisk tid på plats
- `season_notes` — igenväxning, betesdjur, häckningstid, isläge
- `land_access` — allemansrätt / privat / reservatsföreskrift / entré
- `hazards` — brant, vatten, grotta som kräver lampa
- `hook` — en mening som gör platsen värd att åka till (en krok, inte en sammanfattning)
- `worth` — tregradig (Michelin): värt resan / värt en omväg / om du ändå är i närheten
- **Proveniens (obligatoriskt):** `curated_by`, `curated_at`, `verified_on_site` (bool — har någon faktiskt varit där?)

Närhet till andra platser lagras **inte** — det är en `ST_DWithin`-fråga.

`worth`/`hook` är subjektiva på ett sätt resten av DB:n inte är. Vi accepterar medvetet att Upptäck-lagret har en **redaktionell röst** — men märkt (register 2), aldrig maskerad som källa.

### 5.2 Seed & täckning
- **Man kan aldrig kuratera 44 000 poster.** Upptäck är därför inte ett filter över allt — det är en **kuraterad urvalslista**. Turisten vill inte ha 200 träffar, den vill ha sju.
- **Seed från de 83 utflykterna först.** De *är* redan detta lager i redaktionell form. Härled tabellens kolumner ur vad de 83 redan säger, extendera sedan.
- **Okuraterade lämningar som svaga, oklickbara prickar.** Visar ärligt att landskapet är fullt av lämningar även om bara ett urval är beskrivet — bättre än en fotnot "vi visar bara kuraterat", och en fin karta i sig. Svarar också på "säg hur många träffar man får".

---

## 6. Sök, etiketter, knappar, karta

### 6.1 Relevans — GJORT (committat)
Ankring (prefix/ordgräns tungt, intern substring nästan inget), entitetsvikt, tomhetsdemotering, utflyktsboost. Kvar (små):
- **Antal vs urval är två buggar.** "190 inskrifter i landskapet" fixar räknaren; *vilka 12 chips* och "Öl ATA4701/43 först" är en egen policy: **namngivna stenar först i Upptäck** (Bjärbystenen före Öl 36), kanonisk signumsortering i Fördjupa.
- **`RUNESTONES NEARBY · 80`** = globalt `LIMIT 80` i `entity_answer_context`, inte geografiskt. För landskap: visa hela antalet, byt ordet "nearby".
- **Tomma OSM-hamlets:** demotera (två oberoende termer — multiplikativ tomhetsstraff + exakt-/helordsträffsboost som alltid slår straffet), **inte** hård-exkludera ur index (bevarar exakt-träff). Regeln blir "exakt namn vinner alltid, annars sjunker tomma noder", oberoende av frågans form.
- **Läges-medveten ranking via SEKTIONSORDNING, inte multiplikatorer.** Vänsterkolumnen är redan sektionerad (Landskap, Ortnamn, Fornlämningar, Mynt). Gör **Utflykter** till egen sektion; låt läget styra **sektionsordningen** (Upptäck: Utflykter överst; Fördjupa: längre ner). Inom sektion rankar ren matchkvalitet. Förutsägbart vid lägesbyte, slipper multiplikator-underhåll.

### 6.2 Etikettläckage (rena buggar — en eftermiddag, EJ i18n)
- `Okänd`/`null` som klickbart chip → filtrera null **före** render (bugg, ej polish)
- "Region: visa alla 190 inskrifter i" kapas mitt i mening → trasig mall (bugg)
- sublabel som upprepar titeln ("Ölanda · osm_hamlet" + underrubrik "Ölanda") → rendera bara när den tillför (socken/härad/landskap)
- `other`/`Okänd`/`osm_hamlet` = interna värden på skärm → mänsklig etikett eller dölj
- miniatyr-dedup på etikett + skippa tomma arkivskanningar
- **tom mörk kartruta (Stockholm)** → egen rot­orsak, inte bara empty-state: Stockholm ligger utanför den Öland/Kalmar-täta kärnan → sannolikt inget användbart center från `entity_answer_context` → `fitBounds` fick noll punkter. Diagnostisera *varför* (samma "no center"-väg kan få andra långt-från-kärnan-sökningar att kännas trasiga) innan empty-state läggs på.

**i18n är bomben i listan.** "Engelska rubriker över svenskt innehåll" är en eftermiddag *om* i18n-infra finns, annars ett projekt. **Skilj ut den** — skeppa buggarna nu; om språkväxlingen kräver utbyggt översättningslager, lägg den *efter* kartan.

### 6.3 Knapphierarki (bunta med etiketterna — samma filer)
- **Primärknappen = destinationen, inte handlingen.** "Utforska Öland" / "Visa alla 190 inskrifter", inte "Open ↵".
- **En primär per panel**, max två sekundära i rad, resten textlänkar.
- **Runverktyget** äger idag primärpositionen utan koppling till träffen (tydligaste UX-missen) → ned till sekundärraden i **Fördjupa**, helt bort ur Upptäck.
- "Forskare och källor" som **textlänk**, inte knapp (viktig för trovärdighet, efterfrågas av få).
- "11 utflykter" blir en **ingång/knapp** — starkare för bred målgrupp än "190 inskrifter", finns redan i datat.

### 6.4 Karta (differentiatorn — hård grind)
När buggar + knappar är committade: gå på **fitBounds** + **strandlinje-slider** oavsett vad som är kvar på polishlistan (annars skjuts differentiatorn på obestämd tid). Eniro-referens: streckad platsgräns, rita/mät/vägbeskrivning, flygfoto-lager.

---

## 7. Mobil personalisering

- **"Nära mig / tillfälle" är en egen landningsyta**, inte söksvaret. Occasion-preset + geolocation-först. Samma `experiences`/utflykts-data, annan ingång. En profil driver tre ytor: desktop-sök, mobil-fält, agent-API.
- **Fältbuggar (billiga, fixa vid nästa fälttest):**
  - *Walk-zoom kräver 2 klick:* läges-medveten first-fix-zoom (walk=18) fyras bara vid *första* GPS-fixen; byte till walk *efter* fix zoomar aldrig om → applicera lägets zoom vid lägesbyte, ej bara first-fix.
  - *Trögt att växla walk/cykel/kör:* växlingen kör om tungt lagerarbete → mät och lätta.
  - *"Organisera valen efter en fråga":* byt läges-väljaren till **"Hur tar du dig fram?"** (går / cyklar / kör) = befintlig travel-mode.

---

## 8. Geodata-inventering (appendix — "vad som finns", ta senare)

Målet är **mer geodata**, i synnerhet administrativa/historiska gränser (Eniro-lik platsgräns + tematisering) och terräng (strandförskjutning + 3D). Vi behöver inte lösa allt nu — detta är kartan över vad som finns, med licens att verifiera per produkt.

### 8.1 SCB Digitala gränser — **CC0**, klart att ta
- Län, kommuner, LA-regioner. Sweref99 TM, ArcView-shape + MapInfo TAB. **CC0** (ingen attributionskrav; rek. "Källa: SCB").
- Enkla gränser **för tematisering, ej analys** (för exakta gränser → Lantmäteriet).
- **Användning:** kommun/län-gränser på kartan (Eniro-lik streckad platsgräns) + koroplet för befolkningsaxeln. Billigast/snabbast av allt här.

### 8.2 Lantmäteriet Geotorget — avgiftsfria produkter (verifiera licens/villkor per produkt; "avgiftsfri" ≠ nödvändigtvis CC0, vissa kräver Geotorget-konto och/eller "juridisk prövning")

**Högst värde för plattformen:**
- **Socken och stad, Nedladdning vektor** (avgiftsfri) — historisk indelning, ~2350 socknar + ~130 städer. **Kärna för en runologisk/medeltida plattform** (`parishes` finns redan men saknar riktig geometri) → socken-ankrad sök + streckad sockengräns.
- **Markhöjdmodell Nedladdning** (grid 1 m, hög noggrannhet) + **grid 50+** + **Markhöjd Direkt** (API, punkt-höjd), avgiftsfria — **DEM** för strandförskjutning ([[dem-derived-shorelines]]) och 3D-terräng i förarläget ([[maplibre-drive-view-fas2]]).
- **Kommun, Län och Rike, Nedladdning/Direkt** (avgiftsfri) — admin-ytor (komplement/alternativ till SCB).
- **Ortnamn, Nedladdning/Direkt vektor** (avgiftsfri) — officiella, av ortnamnsmyndigheten fastställda namn → onomastik-luckan ([[isof-placenameservice]] / [[god-ortnamnssed-provenance]]).
- **Topografi 50, Nedladdning vektor** (avgiftsfri) — innehåller **stigar**, vägbommar, markslag → naturstigar/motionsspår-underlag för äventyr.
- **Topografisk webbkarta Nedladdning, raster** (avgiftsfri) — zoombar **offline**-baskarta → fältläge utan uppkoppling.

**Historiska kartor & flygfoto (avgiftsfria, georef-raster — [[map-raster-assets]]):**
- Ekonomiska kartan (1935–1978), Generalstabskartan (1827–1971), Häradsekonomiska kartan (1859–1934) — fornminnen, ortnamn, äldre markanvändning.
- Ortofoto historiska Visning (1949–2005) + Ortofoto Nedladdning (avgiftsfri) — flygfoto-lager (Eniro-likt).

**Övrigt relevant (avgiftsfri):** Distriktsindelning (2523 distrikt), Marktäcke (åker/skog/sjö/sankmark), Hydrografi (vattennätverk), Laserdata skog (punktmoln), NMK50/250 (militär topo), Sverigekartor (översikt).

**Att verifiera innan ingest (INGEN GISSNING):** exakt licens/villkor per Lantmäteri-produkt i Geotorget (öppna data/CC0 vs avgiftsfri-med-villkor vs juridisk prövning), format (mestadels Sweref99 TM → transformera till WGS84 för Leaflet), och att "enkla gränser ej för analys" (SCB) räcker för vårt visnings-/tematiseringsbehov.

### 8.3 Koder, gränser & koordinater — hur de hänger ihop
Koderna är **join-nycklarna**; koordinaterna kommer ur **polygonerna**, inte ur en kodtabell:

| Nivå | Ansvarig | Kod (join-nyckel) | Geometri (källa till koordinat) |
|---|---|---|---|
| Län/region | SCB | 2-siffrig länskod (01 = Stockholm) | SCB Digitala gränser / LM Kommun-Län-Rike (polygon) |
| Kommun | SCB | 4-siffrig (0180 = Stockholm; 2 första = län) | samma |
| Tätort/ort | SCB | tätortskod (T-kod) | SCB tätortsytor |
| Socken | Lantmäteriet | unik socken-kod + namn | LM **Socken och stad** (polygon) |

- **Koordinater gissas aldrig ur minnet ([[coordinate-provenance-discipline]]).** En orts/sockens punkt = **centroiden beräknad ur den officiella polygonen** (PostGIS `ST_Centroid`/`ST_PointOnSurface` — det senare garanterar en punkt *inuti* ytan för konkava socknar). Det är källbelagt, inte påhittat.
- **CRS:** källfilerna är **SWEREF 99 TM (EPSG:3006)**; transformera till **WGS84 (EPSG:4326)** för Leaflet (PostGIS `ST_Transform`). Höjd: RH 2000 + geoidmodell SWEN17_RH2000 om vi behöver meter över havet ur DEM.
- **Nytta:** ersätter ev. minnes-satta area-center med **belagda centroider**, ger polygonen för streckad platsgräns (§6.4), och kopplar `parishes`/kommun-data ([[db-ortnamn-data]] province-backfill) till riktig geometri via koderna. Färdiga lat/long-listor (t.ex. Simplemaps) undviks som primärkälla — de är sekundära och saknar proveniens; centroid ur officiell polygon är sanningen.

### 8.4 Ordning (när vi tar geodatat)
1. **SCB CC0-gränser** (kommun/län) — snabbast, ger Eniro-lik platsgräns + koroplet direkt.
2. **Socken och stad** (Lantmäteri) — störst plattformsvärde, ger sockengeometri.
3. **DEM** (Markhöjdmodell) — låser upp strandförskjutning + 3D som redan är påbörjade spår.
4. Resten (topografi/stigar, ortnamn, historiska rastrar) efter behov per feature.

---

## 9. Sekvens (bygg-ordning)

1. **Etikett-buggar + knapphierarki** (samma filer, en pass) — null-chip, kapad mall, sublabel-dedup, miniatyr-dedup, tom-karta-rotorsak, primär=destination, runverktyg→Fördjupa, utflykts-knapp. **i18n utbruten.**
2. **Hård grind → kartan** (fitBounds + strandlinje-slider). Sätt taket: när #1 är committat går vi hit oavsett polish-rest.
3. **`site_visit_profile`** DDL seedad från de 83 utflykterna + `image_role` (`field_photo`/`archival`/`drawing`/`aerial`; Upptäck kräver field_photo) + eget kort beskrivningsfält (15–20 ord, ej trunkerad brödtext).
4. **Två-axel-kontrollpanelen** (Innehåll × Läge + presets) — efter att besöksfälten finns (de är förutsättning för Upptäck-urvalet).
5. **Geodata** enligt §8.3, löpande.
6. **Mobil**: near-me/occasion-yta + fältbuggar (billiga fältfixar när som helst).

---

## 10. Öppna beslut / att verifiera

- Exakt licens per Lantmäteri-produkt (§8.2).
- Källor för nya äventyrskategorier (skidbackar, motionsspår, fågel, naturstig) — verifiera öppen källa + licens innan ingest; skidväder = SMHI live-overlay, ej lagrad fakta.
- Persisterings-yta för presets: `localStorage` (cookiefritt) nu; konto-sparande för forskare senare.
- Om okuraterade "svaga prickar" ska renderas från hela `heritage_sites` eller ett förfilter (prestanda).
- Agent-API/JSON-LD-lagret (schema.org + ev. `/llms.txt`) — egen spec när människo-UX:t satt sig; samma motor, tredje klient.
