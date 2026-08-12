# Spec: Mobilt fältläge ("Fältföljeslagaren") — `/fält`

Status: UTKAST för granskning (Daniel). Författad 2026-07-29. **Utökad 2026-08-02** med live-navigering, riktningspil (fältkompass), bäring-mot-försvunnen-plats & "modernt golv / historiskt skinn" — se **§10**. MVP-ordning: **bil (vägföljning) först, därefter landskap-till-fots (Kalmar-pilot)**. Båt utgår ur planen.

## 1. Princip

**Desktop = analys. Mobil = fält.** Samma data, två lägen.
Desktopen svarar *"vad betyder mönstret"* (täta lager, hypoteser, forskning).
Mobilen svarar *"var är jag, hur ser platsen ut, vad finns att upptäcka — och låt mig bidra"*.

Mobilläget är alltså INTE en responsiv krympning av Explore, utan en egen vy (`/fält`) med
egen informationsarkitektur, stora tap-targets och enhandsgrepp.

## 2. Användarberättelser (Daniels)

1. Som fältbesökare vill jag se **min position** med en inzoomning som ryms de objekt som finns i närheten.
2. Jag vill se en **närhetslista**: "inom N m: runsten X, gravfält Y, konventet Z" — sorterad på avstånd.
3. Jag vill **enkelt göra observationer** kopplade till de olika lagren.
4. Jag vill **markera en position** (släppa en pin på min GPS-punkt) och få den geotaggad i systemet.
5. Jag vill **gå längs ett grund/en mur** och spela in ett spår som blir en geotaggad linje.
6. Jag vill **ta foton och lägga upp** dem kopplade till platsen/observationen.
7. Jag vill att min position **följer mig live** medan jag rör mig, med en **pil som visar färdriktningen**, så jag vet åt vilket håll jag är på väg — särskilt i bil/båt (tänk Waze).
8. Jag vill **välja en försvunnen plats** (där Kalmar gamla storkyrka låg, stadsmuren, klostret) och få en **bäringspil + levande avstånd** som leder mig dit till fots — även om ingen väg finns kvar.

## 3. Omfattning

**MVP (fas 1):**
- Geolokalisering + karta centrerad på mig, auto-zoom till närliggande objekt.
- Närhetslista (RPC `nearby_features`).
- Observation: släpp pin på GPS-position → sparas som OVERIFIERAD `field_observation`.
- Ett foto per observation (kamera → Supabase Storage).
- Enkel lager-"sheet" (färre, större toggles än desktop).
- **Live-följning + fältkompass:** kontinuerlig `watchPosition`, riktningspil = GPS-kurs med kompass-fallback (§10.2).
- **Bäring-mot-mål:** välj en (försvunnen) plats → pil + levande avstånd *med osäkerhet* (§10.3).
- **Modernt golv, historiskt skinn:** navigera på modern baskarta; historiskt lager som opacitets-overlay/lins (§10.4).

**Bygg-ordning (beslutad 2026-08-02):** **1) Bil (vägföljning)** — live-följning + GPS-kurs-kägla på modernt vägnät (mekaniskt enklast, bevisar följe/heading/recenter). **2) Landskap-till-fots (Kalmar-pilot)** — lägg på bäring-mot-försvunnen-plats + historiskt skinn (mål: gamla storkyrkan, stadsmuren, klostret). **Båt utgår ur planen.**

**Fas 2:**
- Spårinspelning (gå längs grund → LineString).
- Flera foton per observation, per-foto-GPS.
- PWA: installerbar + offline-cache (tiles + närdata) för dålig täckning i fält.
- Granskningskö-UI för admin (verifiera/avslå observationer).

## 4. Datamodell

### `field_observations`
| kolumn | typ | not |
|---|---|---|
| id | uuid pk | |
| observer_id | uuid | auth.uid() |
| geom | geometry(Geometry,4326) | Point (pin) eller LineString (spår) |
| obs_kind | text CHECK ('point','track') | |
| category | text CHECK ('grund','mur','gravhög','sten','väg','strandlinje','byggnad','annat') | vad det är |
| note | text | fritext, egen |
| observed_at | timestamptz | |
| accuracy_m | numeric | GPS-noggrannhet (hederlighet) |
| coord_precision | text default 'fält-gps' | jfr plattformens precisions-tier |
| status | text CHECK ('pending','verified','rejected') default 'pending' | **moderering** |
| reviewed_by | uuid null | |
| reviewed_at | timestamptz null | |
| linked_kind | text null | om observationen annoterar ett befintligt objekt |
| linked_id | uuid null | (polymorf, mjuk länk) |
| device_meta | jsonb null | heading/hastighet/plattform vid inspelning |
| created_at / updated_at | timestamptz | |

### `observation_photos`
| kolumn | typ |
|---|---|
| id | uuid pk |
| observation_id | uuid → field_observations on delete cascade |
| storage_path | text (Supabase Storage-bucket `field-observations`) |
| taken_at | timestamptz |
| geom | geometry(Point,4326) null (EXIF/GPS om finns) |
| caption | text null |

### RLS
- `field_observations`: **insert** av inloggad (observer_id = auth.uid()). **select**: egna rader + `status='verified'` publikt. **update/delete/verifiera**: `is_admin()`.
- `observation_photos`: samma ägarlogik via observationens observer_id.
- Storage-bucket `field-observations`: authenticated write till egen mapp, publik read på verifierade (signed/RLS).

### Granskningsvy
`v_field_observations_pending` — kö för admin. Verifierade observationer kan MANUELLT kureras vidare
(t.ex. ett verifierat grund → egen `heritage_sites`-rad) men **aldrig automatiskt**.

## 5. Proveniens & moderering (avgörande — plattformens hederlighetsdisciplin)

Fältobservationer är **användarbidrag** → in som **OVERIFIERADE** (`status='pending'`,
`coord_precision='fält-gps'`, observer, tid, foto). De:
- flaggas tydligt i UI (egen färg/ikon "obekräftad fältobservation"),
- smälts **ALDRIG** in i kanoniska lager förrän en admin granskat,
- följer samma anda som `evidence_class` och koordinat-proveniensen genom hela projektet.

Bygger på den befintliga skrivpolicyn (inloggad forskare drar markör → `coord_precision='forskare'`,
Kalmar-sidan). Fält-GPS är en egen, lägre precisionsnivå.

## 6. Backend

### RPC `nearby_features(p_lat, p_lng, p_radius_m)`
Union av de geo-bärande tabellerna → returnerar närmaste objekt med avstånd:
`(kind, id, name, lat, lng, distance_m, layer_key, url)`, sorterat på avstånd, limit N.
Källor: `runic_inscriptions`, `heritage_sites`, `christian_sites`, `coins`, `fort_element`,
`swedish_hillforts`, `place_names`, m.fl. Använder `geom::geography <-> point` (KNN) för snabb närhet.
(Detta är den sedan tidigare efterlysta `nearby_features`-RPC:n i DB-TODO.)

## 7. Frontend / teknik

- **Routing:** ny route `/fält` (+ `/field`) → `FieldMode`-sida, skild från Explore. Mobil-detektering
  kan föreslå `/fält`, men det är ett eget läge (inte auto-tvingat).
- **Position:** `navigator.geolocation.watchPosition` (hög noggrannhet). Auto-`fitBounds` på mig + närmaste objekt.
- **Karta:** samma imperativa Leaflet-mönster som forskningssidorna; baskarta + relief/LiDAR-overlay
  (samma system som `historicalMapLayers`, kräver tile-upload).
- **Foto:** `<input type="file" accept="image/*" capture="environment">` → Supabase Storage.
- **Spår:** samla `watchPosition`-punkter → förenkla → LineString vid sparning.
- **PWA (fas 2):** `vite-plugin-pwa` — manifest + service worker; cache tiles + närdata offline.
- **UX:** bottom-sheet för "vad är här", stora knappar, en observation-FAB (＋). Lager som enkel lista, ej desktop-legendens täta träd.

## 8. Öppna beslut (för Daniel)

1. **Kurering:** ska verifierade fältobservationer kunna promotas till ett kanoniskt lager (t.ex. heritage_sites), eller alltid ligga kvar som eget fältlager?
2. **Foton:** publika efter verifiering, eller alltid bakom inloggning? (copyright/CC-BY: sätt licens per foto — jfr `source_rights`-spärren.)
3. **Vem får bidra:** alla inloggade, eller bara editor/admin (som dragbara markörer idag)?
4. **Offline-ambition i MVP** eller fas 2?

## 9. Beroenden / not

Allt frontend når `vikingage.se` först efter `npm run build` + FTP-upload av `dist/` (deploy-gapet).
PWA + Storage kräver Supabase-konfiguration (bucket + policies) live.

---

## 10. Tillägg 2026-08-02 — Live-navigering, fältkompassen & historiskt skinn

Härledd ur en diskussion med Daniel. Kärnan: fältläget är inte "modern bilnavigering" utan
**live-position ovanpå det försvunna landskapet** — du står fysiskt där något *låg* (Kalmar gamla
storkyrka, stadsmuren, klostret) och din prick hamnar på den historiska platsen. Waze-känsla, men
målet finns oftast inte kvar.

### 10.1 Två färdsätts-smaker av samma läge

"Vägen" betyder olika saker beroende på hur du färdas — och det avgör designen:

| Smak | När | "Vägen" | Riktning | Baskarta |
|---|---|---|---|---|
| **Landskap till fots** | vandra en fornlämningsmiljö | *ingen* — man går på vägar som inte finns | **bäring mot valt mål** (§10.3) | historiskt skinn i fokus (§10.4) |
| **Väg (bil)** | bil | modern väg | **GPS-kurs** (färdriktning) | modernt vägnät |

*(Båt/farled/sjökort utgår ur planen — se §10.6.)*

Daniels egen formulering styr detta: *"vi går på vägar som inte finns, så att följa vägar är
framför allt viktigt när man kör bil eller båt."* Vägföljning hör alltså hemma i bil/båt-smaken;
till fots leder vi i stället mot **punktmål**.

### 10.2 Fältkompassen — riktningspilen

**Källa (beslutad, omkastad under diskussionen):**
- **Primär när i rörelse:** GPS-kurs, `position.coords.heading` från `watchPosition`. Pekar längs
  vägen/farleden — rätt signal där det gäller (bil/båt). `heading` är `null` när `speed ≈ 0`.
- **Fallback när stillastående:** enhetens kompass — `deviceorientationabsolute` (Android/Chrome)
  respektive iOS `event.webkitCompassHeading`. (Bil-smaken lutar helt på GPS-kursen; kompassen
  behövs främst till fots.) iOS kräver `DeviceOrientationEvent.requestPermission()`
  **utlöst av en knapptryckning** + säker kontext (https). Håller pilen levande när du stannat och
  vrider dig. Behörigheten begärs först när man faktiskt behöver den, inte vid sidladdning.
- **Batteri/livscykel:** `watchPosition` + orienteringslyssnare startas när fältläget aktiveras och
  **rivs när det lämnas**. Ingen bakgrundsföljning. Bevarar Near me:s löfte "vi följer dig inte" —
  följning sker bara i det uttryckligt aktiverade läget.

**Två konceptuellt skilda pilar** (rita så de inte förväxlas):
1. **Egen-kägla** — var *jag* är på väg / pekar (GPS-kurs / kompass). Sitter på den blå pricken.
2. **Målbäring** — mot en vald (försvunnen) plats (§10.3). Egen färg/form.

**Rendering:** Leaflets `circleMarker` kan inte roteras. Byt "Du är här"-pricken (idag i
`useMapNearMe`, alt. eget lager i `FieldMode`) mot en `L.marker` med en `divIcon` (SVG-kägla/pil).
Rotera via CSS-transform på ett **inre** element i ikonen, inte på ikon-roten — Leaflet äger rotens
transform för positionering, så en rotation där slåss med panorering.

**Kartorientering (beslut):** **norr uppåt, käglan roterar** (Google Maps standardläge). Robust,
inga plugins. "Färdriktning uppåt" (course-up, hela kartan snurrar) är ett *betydligt* större lyft
— Leaflet roterar inte kartan nativt — och skjuts till en möjlig senare uppgradering, inte MVP.

### 10.3 Bäring mot en försvunnen plats

Svaret på "vi går på vägar som inte finns": ingen ruttning: en **skattjakts-kompass**.

- **Målet är en vektor i databasen**, aldrig utläst ur ett suddigt raster: `christian_sites`
  (klostret), `fort_hypothesis`-segment (stadsmuren, med `evidence_class` per segment),
  `location_hypotheses`, `heritage_sites`, runstenars ursprungslägen (`inscription_locations`).
- Klientsidan räknar **bäring + haversine-avstånd** från live-positionen till målets koordinat och
  ritar pilen + "≈ N m".
- **Osäkerheten MÅSTE bäras (plattformens hederlighetsdisciplin).** "Där klostret låg" är ofta en
  grov centroid. Visa aldrig falsk skärpa: *"≈ 150 m — läget ungefärligt (evidensklass C)"* snarare
  än "138 m". Luta på `evidence_class` / `coord_precision` som redan finns. Detta blir en **feature**:
  du ser inte bara *var* något låg utan *hur säkert* vi vet det. Jfr [[coordinate-provenance-discipline]]
  och Kalmars [[fortification-evidence-model]].

### 10.4 Modernt golv, historiskt skinn — inte tvärtom

**Problemet Daniel pekade på:** en gammal karta som *underlag* är svårnavigerad — georefereringen
glappar tiotals meter, det saknas moderna hållpunkter att orientera mot, och täckningen är fläckvis
(bara vissa rutor är inskannade). Man kör inte bil på en 1700-talskarta.

**Lösningen (som arkitekturen redan stöder):** `useMapHistoricalOverlays` behandlar redan
Lantmäteri-kartorna som **opt-in overlay-rastrar**, inte som basemap. I fältläge:
- **Golv = modern, läsbar karta** (OSM/topo) — den du navigerar på.
- **Historiskt = genomskinligt skinn ovanpå** med **opacitetsreglage**.
- **Mobil-vänligt alternativ:** en **lins runt pricken** — en cirkel som avslöjar det historiska
  lagret just där du står, resten modernt ("vad låg här, precis här?").
- **Försvunna features = vektormarkörer** (bär precisionen, §10.3); rastret bär stämning/kontext.

Konsekvens: vi förlitar oss **aldrig** på det gamla rastret för navigering — invändningen tar bort
ett problem i stället för att lägga till ett.

### 10.5 Hederlighet (utökning av §5)

- Bäringspilens avstånd **ärver målets koordinatosäkerhet** — visa evidensklass/precision, aldrig
  meter-skarpt sken över en centroid.
- Det historiska rastret är **aldrig** navigations-golv (georef-osäkerhet); positionens sanning
  ligger i modernt golv + vektormål.
- GPS-noggrannheten (`accuracy_m`) visas för användaren precis som för fältobservationer (§4).

### 10.6 Beslutade (2026-08-02)

5. **Bygg-ordning:** **bil (vägföljning) först**, därefter landskap-till-fots (Kalmar-pilot).
   Bil-smaken är mekaniskt enklast (modernt vägnät visar redan vägar, GPS-kurs primär, ingen
   bäring-mot-mål) → bevisar följning + heading + recenter innan det historiska lägget läggs på.
6. **Målval för bäringspilen:** **tryck på en markör → bottom-sheet "led mig hit".** (Inte en
   separat lista.)
7. **Båt / sjökort / farled: UTGÅR ur planen.** Ingen båt-smak, inget sjökortslager i detta arbete.

---

## 11. Tillägg 2026-08-11 — Mobil-UX-pass (fältläget som riktigt färdverktyg)

Härlett ur Daniels live-QA av det deployade fältläget. Konkreta UX-brister + förfiningar. A/B/C
nedan är redan gjorda; E–H + följ-läges-förfiningen byggs i detta pass.

### 11.1 Följ-läge: position i BOTTEN, inte mitten (förfining av §3/§7/§10.2)
**Belagt i browser:** den gröna vit-pil-markören hamnar **mitt på skärmen** → fel. Nav-app-mönster:
- Markören ska ligga i **nedre tredjedelen (~75–80 % ner)** så det mesta av skärmen är "framåt".
  Tekniskt: offsetta `setView`/`panTo` med ett pixel-offset (panorera kartan framåt) istället för att
  centrera på GPS-punkten.
- **Zooma in vid aktivering** (~z15–16) på min plats. Idag är det utzoomat.
- **Följ pausar när användaren drar/zoomar själv** (slåss inte mot användaren) + en **"centrera"-knapp**
  för att återgå. Som nav-appar.
- **Gäller alla färdsätt** (gå/cykla/bil/båt-rörelse).
- **Fas 1 = norr uppåt, käglan roterar** (bekräftar beslutet i §10.2 — robust, inga plugins).
- **Fas 2 (steg 2, Daniel-beslut 2026-08-11) = heading-up-rotation** (kartan snurrar så färdriktningen
  pekar upp). Kräver rotations-plugin (leaflet-rotate) + omtestning av alla paner/lager/kontroller.

### 11.2 En markör, inte två (bugg)
**Belagt:** två vita pilar visas på mobil — den gröna här-markören PLUS en andra position-markör. Ska
vara **exakt EN** aktuell-position-markör (den gröna vit-pilen, roterar med kurs). Fixa dubbletten.

### 11.3 Travel-mode-defaults (alla lager på)
När man väljer **gå/cykla/bil** ska **alla lager vara PÅ som default** — särskilt **bad, grottor, svamp**
— och överstyrbart **när man är inloggad** (persisteras). Respektera legend-invarianten
([[legend-toggle-invariant]]): seeda EN gång, tvinga aldrig på per render.
⚠️ **Svamp-blockare:** ingen svamp-namngiven tabell hittades i DB (2026-08-11) trots [[svampkarta-domain]]
— verifiera att svamp-lagret finns/funkar INNAN det kan vara default.

### 11.4 Konsolidera "nära dig"-listorna
Slå ihop **"upplevelser/sidor nära dig"** + **"mest sevärt nära dig"** → **EN rankad lista**
(`nearby_features_ranked`). En välrankad lista täcker allt; två överlappande förvirrar.

### 11.5 Scroll-affordans
Synlig indikering att nära-dig-listan **går att scrolla** (fade/pil).

### 11.6 Rensa skärm-yta (D)
Ta bort överflödigt **grått/svart fält** runt ikonerna → mer karta. Exakt fält pekas ut av Daniel vid
implementation (rad-2-baren vs ett fält längst ned).

### 11.7 Klart 2026-08-11 (byggt, väntar FTP)
- **A/B:** rad-2-ikonerna (Anpassa karta / Min sida) nedflyttade + 20 px mellanrum (var ~4 px).
- **C:** +/- zoom skjuts ner 58 px på mobil så den inte döljs av den flytande strandlinje-kontrollen
  ("+ syntes inte"). Verifierat i mobil-viewport.

### 11.8 Bygg-ordning
Fas 1: 11.2 (dubblett) → 11.1 (följ-läge norr-upp) → 11.3 (defaults) → 11.4 (konsolidering) → 11.5
(scroll) → 11.6 (D). Fas 2: 11.1 heading-up-rotation. Verifieras per punkt i mobil-browser före klart.

## 12. Tillägg 2026-08-11b — Fälttest (bil) + Waze-basics + roadmap

### 12.1 Fälttest-resultat & rotation AV
Daniels körning avslöjade att **kartrotationen desorienterade** — den roterade men positionen syntes
inte uppdateras. Rotorsak: **TVÅ rotationssystem** — fältnavets heading-up (`useMapFieldNav`,
leaflet-rotate) *och* `useMapCourseUp` (CSS-transform, `courseUp` default PÅ) som roterade runt
CENTRUM medan fältnavet la positionen i nedre tredjedelen → position svängde ut ur bild.
**BÅDA av som default nu** (norr-upp). Klart + verifierat (commits 64ee423, 2089d0a):
- Heading-up: `HEADING_UP_ENABLED=false`.
- `courseUp=false` default.
- Hela Near me-panelen scrollbar (annars klipptes "Kör dit" av `maxHeight:62vh`).
Rotation återupptas först när center-vs-nedre-tredjedel-konflikten är löst + live-verifierad.

Rutt-navigeringen = riktig **OSRM-bilrutt** (`services/routing.ts`) + röst (`useSpokenDirections`,
läser route.maneuvers). **Ingen omdirigering** vid avvikelse ännu. OSRM/Nominatim demo-servrar = EJ
för produktion/kommersiellt → routing-leverantör (självhostad OSRM / ORS / GraphHopper) är ett
senare beslut.

### 12.2 NÄSTA BYGGE — "Waze-basics"-klustret (rekommenderad prio)
Målet: göra körläget faktiskt användbart. I ordning:
1. **Fixa objekt-klick** — klick på korridor-/nearby-/vrak-objekt öppnar ingen popup/flyg-dit (bugg).
2. **ETA i minuter** stort och tydligt + "framme"-signal (vi har `route.durationMin` — bara att visa).
3. **Ljud AV som default** (Waze-mönster) — `useSpokenDirections` muted default true.
4. **Spara resa med namn + "nyligen"-taggade senaste resor** — klick på rutten → spara; central
   "Ange destination" (gärna röst-input); senaste ~20 mål som autoförslag (lokalt, cookie-fritt).
   = Daniels kalibrerings-idé (återkommande resor: handla/lämna barn/hund).
5. **Auto-avsluta resa** när stillastående >30 min.
Övrigt UI: krymp adressraden/här-markören (står "väldigt högt med stor ikon"); minimera footern i
körläge (äter plats). Map-matching (snäpp position till rutt) döljer att linjen ligger "precis ovanför"
när man kör i en fil — ruttlinjen ritas på vägens mittlinje, GPS+fil förskjuter några meter (ej bugg).

### 12.3 Roadmap — egna spår efter Waze-basics
- **Kollektivtrafik-restid (HÖGST prio av visionen)** — vi har INGEN restid alls idag; bil-OSRM löser
  inte kollektivt. Kräver svensk kollektiv-API (**ResRobot/Trafiklab**). Fyller konkret lucka
  (Daniels son: "hur lång tid till en grotta med T-bana"). Eget litet spår.
- **3D-körvy** (pil långt ner, väg framåt, ETA under — Waze-känsla) = redan planerad **Fas 2 (MapLibre)**,
  jfr kulturmiljö-navigatorn.
- **HUD på bilrutan** — kartmotor speglad till bilfönster/instrumentdisplay; egen gränssnitts-spec.
- **Smarta glasögon (AR)** — samma kartmotor som AR-lager; framtida gränssnitt.
- **QR-koder som klistermärken** — dela en färdig rutt/resa via länk kodad som QR (klistras upp fysiskt).

Waze-referens (Daniels förebild): auto-laddar innehåll, ljud av default, central "Ange destination"
(+ röst), senaste resor taggade "nyligen"; pil vid start + ruttvy, sedan 3D-körvy där pilen är långt
ner och ETA i minuter syns tydligt.

---

## 13. FÄLTPROV 2026-08-12 (Daniel körde bil 50 min) + KONSOLIDERAD STATUS

**Denna fil är den ENDA mobil-planen.** Övriga fold:as in här: `docs/nearby-rank-plan.md`,
`docs/superpowers/specs/2026-07-31-mobil-explore-narhet-design.md`,
`docs/superpowers/specs/2026-08-04-kulturmiljo-navigator-fas1-design.md` (turn-by-turn/3D). Se [[mobile-plan-location]].

### 13.1 Verifierade buggar + rotorsak (ur kod)
- **P0 — rutten spårar inte position.** `NavigatorHud` ritar rutten men matchar aldrig GPS mot
  linjen; koden säger själv *"v1: helrutts-totaler; live nedräkning kommer i Plan 2 (rutt-progress)"*.
  → manövern avancerar aldrig ("ut på E4:an"), kartan re-centreras inte längs rutten. GPS uppdateras
  (watchPosition OK) men konsumeras ej för progress. **Det här är hela orsaken till "satt kvar på
  Stockholmsvägen i 50 min".**
- **Footer växte in över ETA.** `Explore` dolde footern bara vid `!driving && !isMobile`; vid
  isMobile-misdetekt kunde den täcka HUD:ens nedre rad (där ETA+km ligger, `bottom:88px`).
  **FIXAT 2026-08-12:** döljs nu även när rutt aktiv (`!driving && !route && !isMobile`).
- **Ljudknappen hittades ej.** Var en naken ikon i HUD-toppen. **FIXAT:** synlig pill (ram+bg, 44px).
- **Gångläge "liten prick".** Koden zoomar EGENTLIGEN in vid första fix (`useMapFieldNav` z≥16), men
  fyrade inte i Daniels walk-session → **kräver enhets-debug** (ev. flownRef persist / effekt-gate /
  långsam GPS). Ej blind-ändrad.
- **3D-vyn fungerade ej** (`/3D-bil`, DriveView3D/MapLibre initierade inte). Eget spår, Fas 2.
- **Ingen ETA/parkering.** ETA fanns (doldes av footern, nu fixat). Parkering vid mål = ny feature.

### 13.2 P0 — turn-by-turn-progress-motorn (den saknade "Plan 2")
Ren, testbar funktion (jfr `utils/navHud.test.ts`): **(position, rutt) → {aktiv manöver, avstånd till
nästa manöver, kvarvarande sträcka, ETA, projicerad kartcenter}**.
1. Projicera GPS-position på ruttlinjen (närmaste segment) → hur långt in i rutten.
2. Aktiv/nästa manöver = nästa OSRM-steg efter projektionen; avstånd = längs linjen (ej fågelväg).
3. Kvarvarande sträcka/tid = från projektionspunkt till mål (live nedräkning, ej pinnad).
4. Karta re-centreras/panorerar till position (course-up valfritt) + "off-route"-detektion → om-rutt.
Bygg motorn enhetstestad FÖRE UI. Detta gör körläget faktiskt navigerbart.

### 13.3 Snabbvinst-status
- [x] Footer döljs under aktiv rutt (commit 2026-08-12).
- [x] Ljudknapp = synlig pill (commit 2026-08-12).
- [ ] Gångläge-zoom: verifiera att `useMapFieldNav` z≥16-fixen fyrar i walk mode (enhets-debug).
- [~] **P0 turn-by-turn-motorn (§13.2) — KÄRNAN KLAR 2026-08-12.** `src/utils/routeProgress.ts`
      (projektion + avancerande manöver + nedräkning + off-route), enhetstestad (9 tester);
      `hudModelLive` wire:ad i NavigatorHud (live ETA/km/manöver/väg). **KVAR (kräver fältprov):**
      (1) kart-recentrering på snäppt position (useMapFieldNav följer redan GPS — verifiera i fält),
      (2) off-route → räkna om rutten (routeProgress.offRoute finns, trigga routing på nytt),
      (3) talad vägledning ska följa progress (useSpokenDirections), (4) Daniels fält-återtest.
- [ ] 3D-vy-init (DriveView3D). Parkering vid mål (närmaste P ur OSM/Overpass).
