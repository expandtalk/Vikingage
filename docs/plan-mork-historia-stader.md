# Plan — Mörk historia, förlorade städer & personer

**Bakgrund:** genomgång av Daniels material (2026-08). Georef-planen för gamla Kalmar finns redan
(`docs/kalmar/lantmateriet-georef-plan.md` — QGIS-arbete, ej kod). Resten nedan saknas.

## 1. Mörk historia / blodbad — SAKNAS, HÖGST VÄRDE
Daniel: *"Kalmar blodbad borde vara ett event — något som borde vara en enhet i databasen för
ALLA städer. Mörka historier är populära stadsvandringar."* + *"Avrättningsplatser borde alltid
vara en del av en stads mörka historia."*

**Design:** `dark_history_events` (eller `historical_events` + `event_type` i {blodbad, massaker,
avrättning, upplopp, brand} + `city`/`place`-koppling). Fält: namn, år, plats/stad, typ,
antal_offer (spann), förövare, offer/målgrupp, kontext, koord, källa, wikidata_qid.

**Seed (välbelagda, med källa — siffror flaggas som spann):**
- Kalmar 1505 (slakt på råd/borgare), **Kalmar stormning 1525** (~1400 döda, Peder Svarts krönika —
  flaggas osäker), **Kalmars senare blodbad 1599** (22 avrättade, hertig Karl, 16 maj)
- Stockholms blodbad 1520, Linköpings blodbad 1600, Åbo/Viborgs blodbad 1599, Ronneby blodbad 1564
- Slaget om Gotland 1321 (~1800), **Öland 1611** (13 avrättade, Kalmarkriget), Sandby borg-massakern
  (~400-tal — finns redan som fornborg/oland-model)
- Dackefejden (1542–43, koppla befintliga Dacke-lager)

**Produkt:** "Mörk historia"-lager/tidslinje per stad → stadsvandringar. Koppla till avrättningar (§5).

## 2. Förlorade / medeltida städer — SAKNAS
Ingen tabell för städer som funnits och försvunnit.
- **Mönsterås** — stadsprivilegier 1604 (Karl IX), bränd av danskar 1612 & 1677, blev köping under Kalmar.
- **Hästholmen** (Vättern, S om Omberg) — en av rikets städer på 1300-talet, viktig Vätternhamn;
  riddaren **Gerhard Snakenborg**s borg på Klippholmen (58.27965, 14.63448); "Birgitta-effekten"
  (Vadstena tog över) → nedgång.

**Design:** `historical_towns` (namn, koord, privilegie_år, status_över_tid: handelsplats→tingsplats→
stad→köping, nedgångsorsak, källa). Seed Mönsterås + Hästholmen + fler bortglömda (ej i
Nationalatlas/Ahlberg — Daniels poäng att de saknas i standardverk).

## 3. Historiska personer / ätter — SAKNAS
- **Gerhard Snakenborg** (Hästholmen-borgen, Albrekts man) — svar på Daniels fråga: **nej, finns ej**.
- **Christopher Andersson Grip (Gyllengrip)** + **Johan Larsson Sparre** — avrättade Kalmar 1599 →
  passar som `execution_events`-poster (`executed_person`-fältet finns). Grips grav (avhugget huvud)
  på Kalmar gamla kyrkogård = konkret stadsvandrings-stopp.
- Helena Snakenborg (hovdam Elisabet I) — nod i person-nätet.

**Design:** person-koppling till events/platser (execution_events + ev. estates/holders). Ätterna
Grip/Snakenborg som `historical_dynasties`-lika noder om vi vill.

## 4. Klosterholmen (Öland) — SAKNAS
Befäst medeltida storgård (RAÄ) / ev. Vasa-kungsgård, källarmurar kvar (57.19689, 16.94073),
Hornssjön (avsnörd havsvik, vallgravar + kajplats). Även kallad Nackholm. → `heritage_sites`
(kurerad, som naturgrottorna) + koppla [[oland-model]].

## 5. Avrättningsplatser ↔ städer — KOPPLING SAKNAS
`execution_events` finns (rikt schema) men är inte kopplat till städer. Lägg `city`/`town`-referens
så en stads "mörk historia" automatiskt visar dess avrättningar (Daniels princip).

## Byggordning (rekommenderad)
1. **Mörk historia-domän** (§1) — störst, gäller alla städer, matar stadsvandringar. Seed blodbaden.
2. **Klosterholmen** (§4) — snabb, källförd, koppar Öland-modellen.
3. **Förlorade städer** (§2) — Mönsterås + Hästholmen + fler.
4. **Personer/ätter** (§3) — Grip/Snakenborg som execution_events + noder.
5. **Avrättning ↔ stad-koppling** (§5).

## 6. Ölands vägnät över tid — diakront forsknings-labb (eget spår)
Daniel: Öland löper 2 vägar (väst/öst) + tvärvägar; stenarna pekar mot ÖNS centralort (Borgholm),
inte Stockholm; 1891 års vägreform + metersystemet vände/flyttade milstenar. *"Kan vi se de
äldsta vägarna och följa dem över tiden med hjälp av vägstenar, milstenar, flygfoto?"*

**Har idag:** 92 milstenar + 137 väghållningsstenar + 2 vägmärken på Öland (RAÄ, bara punkter),
`viking_roads`/`road_waypoints`/`road_landmarks`, och `inscription_locations` (läges-historik-
mönster: from_year/to_year/**moved_year**/certainty — samma som behövs för flyttade stenar).

**Nyckelinsikt (som diakrona namnmodellen):** en vägsten är TID- och PLATS-bunden. Modell:
- **Sten-metadata:** `stone_kind` (milsten | km-sten | väghållningssten | vägvisarsten), `target_place`
  (Borgholm på Öland / Stockholm på fastlandet), `distance_value` + `unit` (mil→km), `inscription`
  (initialer/gårdsnummer/år för väghållning), `era`.
- **Läges-historik:** återanvänd `inscription_locations`-mönstret → `stone_locations` (original vs
  nuvarande, `moved_year=1891`, orsak "km-reform: vänd + flyttad ~1 km"). Fångar Alböke/Köpings
  vända milstenar + de saknade (Alböke–Köping, Bredsättra = 0).
- **Väghållnings-sträckor:** varje bondes ansvarssträcka (lantmäteriets indelning efter markandel) →
  segment kopplat till stenen (vem ansvarade). System till 1920-talet.
- **Km-stenar mot Borgholm** (5/10/15) = radiellt distansnät mot centralort — sökbart "stenar mot X".

**Diakron vägrekonstruktion (produkten):** lägg milstenar + väghållningsstenar + runstenar (originalläge
via inscription_locations) + fornborgar (logistik-nät runt varje borg) + vådakasar + djupa vikar
(hamnar, jfr norra Öland) + flygfoto → rekonstruera de äldsta vägarna och följ dem över tid. Datera
väg-segment efter stenarna/features längs dem. Koppla [[oland-model]] (väst-korridoren) + [[maritime-node-fingerprint]].

**Landskapsförändring:** reduktioner/landreformer geometriskt över tid; kristnandet + folkvandringstidens
fornborgar omformade markanvändning/vägar. Egen tidsskiktad vy.

**Källa:** Karl-Axel Björklund, "Milstolpar på Öland" (2002, 95 stenar inkl. Ölands museum/Solliden/
Kaffetorpet). Ölands museum Himmelsberga har 2 milstenar (äldre huvudtyp, okänt ursprung).

## 7. Stenar med en berättelse — som entitet
Daniel: *"Vi har stenar också som en entitet. De som har en berättelse kopplad till sig"* —
t.ex. **Hwita/Vita sten** (gränssten, Stockholm). **Har:** stenen finns redan ("Vita sten,
Brännkyrka 230:1", heritage_sites) + sägenstenar (`heritage_sagensten`, 150) + rik tema-vokabulär.
**Saknas:** själva BERÄTTELSEN kopplad till stenen.
**Design:** narrativ-lager via `theme_links` (polymorf) + `source_texts` (PD-berättelser) ELLER
ett `story`/`narrative`-fält på en `storied_stones`-vy över namngivna stenar (sägenstenar +
gränsstenar med historik). Kopplar "Stenar"-legendgruppen + [[tradition-stones-layer]]. Varje
berättad sten blir ett stopp i stadsvandringarna (§8).

## 8. Self-guided city walks / spökvandring — PRODUKT
Daniel: self-guided walks (à la city-walks.info) + **spökvandring** (Stockholm Ghost Walk: mord,
avrättningar, sjukdomar, legender i Gamla stan/Södermalm) + digital självguidad tur + nedladdningsbar
PDF-karta. Kommersiellt gångbart (Ghost Walk: 247k besökare sedan 2008).

**Har:** `excursions` (76) + rutt-punkt-mönster (`trade_route_points`/`valdemar_route_points`) +
teman + Near me-rank + mörk historia (§1) + museer + berättade stenar (§7).
**Design:** `walking_routes` (namn, tema [spökvandring/mörk historia/sevärt], stad, språk, längd/tid,
PDF-karta-url) + `walk_stops` (ordnad sekvens, refererar BEFINTLIGA entiteter: avrättningsplatser,
berättade stenar, mörk-historia-events, kyrkor/kyrkogårdar, museer) + per-stopp-berättelse.
**Produkt:** printbar/mobil rutt-vy; "mörk historia"-tema drar avrättningar + blodbad + pest-platser
automatiskt. Återanvänder allt: Near me (rutt = kurerad närhet), rank-signalerna, mörk historia.
Detta binder ihop §1 (blodbad), §7 (stenar) och avrättningarna till en *upplevelse*.

## 9. Vägvisare 1768 — historisk vägkälla
Daniel har boken *"Vägvisare 1768"* (alla vägar i Sverige) att komplettera med. Som Biurman 1742
([[map-raster-assets.md]]) — ingest som historisk vägkälla: vägar, avstånd, gästgiverier →
kompletterar Öland-vägspåret (§6) + nationell vägrekonstruktion. Källa för hur vägnätet såg ut 1768.

## 10. Gustav Vasa … (ofullständigt)
Daniels sista rad bröts av ("Vi har Gustav Vass b…"). Troligen Gustav Vasa-brev / -register?
**Ej tolkat** — inväntar förtydligande innan det läggs in.

## Källkritik
- Blodbads-dödssiffror varierar mellan krönikor (Kalmar 1525 "1400" = Peder Svart) → lagra som spann + källa, aldrig som fakta.
- Koordinater ur texterna (Klippholmen 58.27965/14.63448, Klosterholmen 57.19689/16.94073) verifieras mot karta innan ingest.
- Georef-planen (steg 4) är QGIS/Daniel — ingen fabricerad murgeometri.
