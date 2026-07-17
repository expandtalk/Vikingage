# Ortnamnslager — GIS-pilot

**Datum:** 2026-07-17
**Status:** Design godkänd, redo för implementeringsplan
**Författare:** Daniel Larsson (Expandtalk) m. Claude Code

---

## 1. Sammanfattning

Viking Age-plattformen är i praktiken redan ett tematiskt GIS: kartlager ligger som
React-komponenter i `src/components/map/layers/`, med egna ikoner (`L.divIcon`),
legend-styrd filtrering (`enabledLegendItems`) och data via hooks mot Supabase.

Denna pilot lägger till **ett nytt punktlager — `PlaceNamesLayer` — för forskningsrelevanta
ortnamn**, filtrerbart på namnelement och tidsperiod, byggt så att fornminnen och
sockenkyrkor sedan blir "samma mönster, ny datakälla".

Piloten är medvetet avgränsad till **ortnamnslagret (gazetteern)**. Den levererar det
saknade dataunderlaget i Stephanie Heinz forskningsrapport (juli 2026), steg 2 — hela
gazetteern med mikrotoponymer — och förbereder för de statistiska stegen (nollmodell,
närhetsanalys) utan att bygga dem här.

Vetenskaplig hållbarhet är ett **krav**, inte nice-to-have. Det formar datamodellen och
UI:t (avsnitt 8).

---

## 2. Bakgrund och forskningskoppling

Piloten sitter direkt på Stephanie Heinz hypotes (rapport juli 2026): förkristna
namnelement (**Val, Ed, Hammar, Vang, Sal, Stav, Horn** samt hästrelaterade **Hors,
Ross, Stod, Ökna**) markerar platser med kult-/centralortsfunktion, och samvarierar med
runstenar och fornborgar.

Rapportens egen slutsats: materialet är *förenligt* med hypotesen men *bevisar* den inte,
och det avgörande är inte fler exempel utan **en nollmodell** och **hela gazetteern**.
Rapporten pekar ut (steg 2) att databasen saknar mikrotoponymer som Valsäng, Valås,
Valhäll — exakt den typ av kluster hypotesen bygger på. **Ortnamnslagret i denna pilot
är den saknade gazetteern.**

Plattformen har redan de andra lagren för den framtida klusteranalysen:
`swedish_hillforts` (fornborgar) och runstensdata. Piloten kompletterar med ortnamn.

Rapportens avsnitt 5 (källkritik) översätts till konkreta krav i avsnitt 8 nedan.

---

## 3. Åtkomstmodell

**Publikt lager.** `place_names` får publik läs-RLS och renderas i den publika kartan på
`/explore` — precis som `archaeological_sites`, runstenar och handelsvägar idag. Ingen
inloggning krävs för att se lagret.

- RLS: `SELECT` för `anon` + `authenticated`; `INSERT/UPDATE/DELETE` endast via
  `is_admin()` (samma mönster som referensdata efter commit `0f89659`).
- Login påverkar inte lagret — login låser fortsatt bara upp AI-datering och adminpanel.

---

## 4. Datamodell

### 4.1 Tabell `place_names`

Speglar `archaeological_sites`-mönstret.

| kolumn | typ | not |
|---|---|---|
| `id` | uuid PK default gen_random_uuid() | |
| `name` | text NOT NULL | ortnamnet i Lantmäteriets form |
| `lat` | double precision NOT NULL | WGS84 |
| `lng` | double precision NOT NULL | WGS84 |
| `element_keys` | text[] NOT NULL | matchade element, t.ex. `{val}` — driver filtret |
| `element_category` | text | `sacral` \| `power` \| `nature` (bästa gissning, se 4.2) |
| `feature_type` | text | Lantmäteriets objekttyp (bebyggelse/natur/…) |
| `parish_id` | uuid FK → parishes NULL | geo-koppling när möjlig |
| `province` | text | landskap (för regionjämförelse Ångermanland/Västergötland) |
| `earliest_attestation_year` | integer NULL | äldsta belägg — fylls senare från Isof |
| `attested_form` | text NULL | belagd stavning — fylls senare från Isof |
| `attestation_source` | text NULL | t.ex. `isof_ortnamnsregistret` |
| `source` | text NOT NULL default `lantmateriet_ortnamn` | proveniens |
| `source_license` | text NOT NULL default `CC BY 4.0` | |
| `external_id` | text | Lantmäteriets id — idempotent upsert |
| `imported_at` | timestamptz NOT NULL | importdatum (visas i UI) |
| `created_at` / `updated_at` | timestamptz default now() | |

**Index:** GIN på `element_keys`; btree på `element_category`, `province`. Unikt på
`(source, external_id)` för idempotent re-import.

De tre nullbara `attestation`-kolumnerna är arkitekturens sätt att hedra
det vetenskapliga datering-kravet (rapportens steg 4) utan att blockera piloten:
Lantmäteriets gazetteer saknar äldsta belägg, det fylls senare från Isof (avsnitt 5.2).

### 4.2 Element-katalog (i kod)

`src/utils/placeNameElements.ts` — kurerad startlista, versionerad i git. Varje element
har en **dokumenterad inklusionsregel** (rapportens krav §5.3: regeln bestäms *före*
sökning, stavningsvarianter är inte ad hoc).

```ts
interface PlaceNameElement {
  key: string;              // 'val'
  label: string;            // 'Val / Vall'
  category: 'sacral' | 'power' | 'nature';
  contested: boolean;       // etymologiskt omtvistad (rapport §5.2)
  etymology: string;        // kort not, visas i UI
  patterns: string[];       // matchningsledet, normaliserat gemener
  excludes: string[];       // kända falska träffar (rapport §3.3)
}
```

Startlista (Stephanie Heinz element; `Mar/Mer` medvetet uteslutet — brus mot Maria/Mark):

| key | label | category | contested | excludes (brus) | etymologi-not |
|---|---|---|---|---|---|
| `val` | Val / Vall | sacral | ja | — | *vé/vi* (kult) el. *vall* (slätt/gärde) |
| `ed` | Ed | nature | nej | — | näs/drag mellan vatten (kommunikation) |
| `hammar` | Hammar | nature | nej | `hamar` (NO) | stenig höjd / bergklack |
| `vang` | Vang / Vång | nature | ja | — | inhägnad äng |
| `sal` | Sal | power | ja | `salt` (Saltäng) | hall/sal — central-/kultbyggnad |
| `stav` | Stav | sacral | ja | — | stav / stavgård (möjlig kult) |
| `horn` | Horn | sacral | ja | — | topografiskt horn/udde el. teofor |
| `horse` | Häst (Hors/Ross/Stod/Ökna) | sacral | ja | — | hästrelaterat, möjligt hästoffer |

**Kategorierna är bästa gissning, inte påståenden.** `contested`-flaggan och
`etymology`-noten är obligatoriska och syns i UI (avsnitt 8, rapport §5.2: etymologin
arbetar delvis emot hypotesen). Daniel kompletterar listan med egna element senare —
schemat är byggt för det.

---

## 5. Datakällor (utredning + rekommendation)

Kravet var att utreda Lantmäteriets endpoint (öppna data-API vs. nedladdningsfil) och
rekommendera.

### 5.1 Namn + koordinat → Lantmäteriet "Ortnamn Nedladdning, vektor" (REKOMMENDERAD)

- Fri, **CC BY 4.0**, uppdateras veckovis. Innehåller Lantmäteriets fastställda
  namnformer och stavningar, inkl. de mikrotoponymer rapporten saknar.
- Två åtkomstsätt via Geotorget:
  - **Bulk-nedladdning** (`ortnamn_se.zip`, STAC-baserad) — **rekommenderas för piloten.**
    En fil, körs lokalt av Node-skriptet, inga anrop per panorering, enkel att iterera.
  - STAC/REST-API — bättre för återkommande/inkrementell sync, mer att bygga. Migrera
    hit om importen blir schemalagd.
- **Rekommendation:** börja med bulk-filen. Kräver konto på Geotorget för att beställa
  produkten (fri). Node-skriptet parsar, matchar mot element-katalogen, upsertar.

### 5.2 Äldsta belägg → Isof Ortnamnsregistret (SENARE)

- Isof:s Ortnamnsregister (~3,7M skannade kort, `ortnamnsregistret.isof.se`) innehåller
  äldsta belägg, belagd stavning och litteraturhänvisning — det rapporten steg 4 kräver.
- **Inget dokumenterat öppet API/bulk.** Kontakt: `namn@isof.se`.
- **Rekommendation:** utanför piloten. `attestation`-fälten lämnas nullbara och fylls i en
  senare fas (API-förfrågan till Isof, eller riktad manuell registrering av pilot-elementen).

### 5.3 Licens

Lantmäteriet CC BY 4.0 kräver attribuering. `source` + `source_license` lagras per rad
och visas i popup (avsnitt 8).

---

## 6. ETL / importskript

Lokalt Node-skript (beslut: enklare att iterera i pilot; migrera till Supabase edge
function om det blir återkommande).

- Plats: `scripts/import-place-names.ts` (körs `tsx`/`ts-node`, service-role-nyckel från
  `.env`, aldrig committad).
- Flöde:
  1. Läs `ortnamn_se.zip` (nedladdad manuellt från Geotorget).
  2. För varje ortnamn: normalisera, matcha mot element-katalogens `patterns`, filtrera
     bort `excludes`. Namn utan träff kastas.
  3. Tagga `element_keys` (kan vara flera), sätt `element_category`, `province`,
     `feature_type`, `source`, `imported_at`.
  4. Upsert på `(source, external_id)` — idempotent, kan köras om.
- **Loggar denominatorn** (rapport §5.1/§5.3): totalt antal genomsökta namn, antal
  träffar per element, antal kastade. Skrivs till konsol + en `import-report`-rad, så
  urvalet är spårbart och reproducerbart.
- Ingen tystlåten avgränsning: skriptet importerar **alla** namn som matchar reglerna i
  hela filen — ingen geografisk eller antalsmässig trunkering (avsnitt 8).

---

## 7. Frontend

Följer befintligt lagermönster exakt.

- **Hook** `src/hooks/map/usePlaceNameMarkers.ts` — läser `place_names` från Supabase,
  filtrerar på aktiva element + period, returnerar `{id, position, symbol, color,
  popupContent}` (samma form som `useArchaeologicalSiteMarkers`).
- **Lager** `src/components/map/layers/PlaceNamesLayer.tsx` — kopia av
  `ArchaeologicalSitesLayer`-mönstret: `L.divIcon` med färg per `element_category`,
  `L.layerGroup`, säker cleanup. Renderas i `MapCore.tsx` bredvid övriga lager.
- **Legend** — ny nyckel `place_names` i `RegionalLegend.tsx` + `types.ts`, med
  underkryssrutor per kategori (sakralt / makt / natur). Per-element-filter (`val` vs
  `sal`) i pilotens legend; djupare UI kan komma senare.
- **Ikon/färg** — egen färg per kategori, symbol markerar `contested` (t.ex. `~`) så
  omtvistad etymologi syns direkt på kartan.

---

## 8. Vetenskaplig hållbarhet (krav → implementation)

Direkt översättning av rapportens avsnitt 5 och Daniels krav 4.

| Krav | Implementation |
|---|---|
| **Visa alla förekomster i vyn** (inte kuraterat urval per karta; basfrekvens §5.1) | Hooken hämtar *alla* `place_names` som matchar aktiva element inom vyn — ingen sampling, ingen per-karta-kuratering. Lagret visar en räknare: "N förekomster av {element} i vyn". |
| **Reproducerbar kartvy** (§5.3) | Filtertillstånd (aktiva element, period, kartans bounds) kodas i URL-query — utökar befintligt `/explore?focus=`-mönster. En vy kan delas och återskapas exakt. |
| **Dokumenterad inklusionsregel per element** (§5.3) | Element-katalogen (4.2) med `patterns`/`excludes` i git; regeln är fast före sökning. Popup visar vilken regel som gav träffen. |
| **Käll- och datumangivelse synlig** (krav 4) | Popup visar `source` (Lantmäteriet, CC BY 4.0), `imported_at`, och `earliest_attestation_year`+`attested_form` när de finns. |
| **Etymologisk ärlighet** (§5.2) | `contested`-flagga + `etymology`-not per element, synlig i legend och popup; kartsymbol markerar omtvistade element. Kategorin presenteras som gissning, inte påstående. |
| **Denominator/urval bokförs** (§5.3) | Importskriptet loggar totalt genomsökta namn, träffar per element och kastade — urvalet är transparent. |

**Utanför piloten men förberett:** nollmodell/Monte-Carlo (§5.1, steg 1) och
närhetsanalys runsten↔fornborg↔ortnamn (steg 6). Datamodellen (`province`,
`element_keys`, koordinater) är designad så att dessa kan byggas ovanpå utan
schemaändring.

---

## 9. Testanvändare & signup-verifiering

**Krav:** två icke-tekniska forskare — Agneta (`info@sofiainstitutet.se`) och
Stephanie (`stephanie.l.e.heinz@gmail.com`) — ska kunna skapa **egna** konton och testa
systemet, **utan** admin-rättigheter.

### 9.1 Rollfråga: behövs en "researcher"-roll?

**Rekommendation: nej — vanlig `user` räcker för piloten.**

- `useUserRole.tsx` har bara `'admin' | 'user'`. Nya signups får ingen rad i
  `user_roles` → default `'user'` → aldrig admin. Kravet "inga admin-rättigheter"
  uppfylls automatiskt.
- Kartan (inkl. ortnamnslagret) är publik → testarna ser allt de behöver redan som
  inloggad `user`; login ger dessutom AI-datering.
- En `'researcher'`-roll behövs först om vi senare vill ha en behörighet *mellan* user
  och admin (t.ex. skapa forskningsanteckningar men inte redigera referensdata). Läggs
  till då, inte nu. YAGNI.

### 9.2 Verifieringschecklista (del av implementeringen)

Kodnivå (verifierat i design):
- [x] `signUp` skickar bekräftelsemejl (`Auth.tsx:118`, redirect `origin/`).
- [x] Nya konton blir `user`, inte admin (`useUserRole.tsx`).
- [x] Admin-länk döljs för icke-admin (`Header.tsx:74`, `{isAdmin && …}`).

Runtime/dashboard (görs vid implementering — ej synligt i koden):
- [ ] Supabase-dashboard: signups **på**, e-postbekräftelse **på**.
- [ ] Redirect-URL:er inkluderar produktionsdomänen (inte bara `localhost`).
- [ ] SMTP/avsändare fungerar (bekräftelsemejl når extern inkorg, ej spam).
- [ ] Genomgång som inloggad `user`: inga döda/blockerade länkar utöver `/admin`
      (som korrekt redirectar).
- [ ] Test-signup med engångsadress → bekräfta → landa på kartan som `user`.

**Not:** piloten *möjliggör* att Agneta och Stephanie registrerar sig själva. Att bjuda
in dem eller mejla dem är en separat, uttryckligen bekräftad åtgärd — inget mejl skickas
utan Daniels "skicka".

---

## 10. Extensibilitet

Fornminnen och sockenkyrkor återanvänder exakt samma fyra delar:
`{tabell, importskript, hook, layer}`. Enda som byts:

- **Fornminnen:** datakälla RAÄ Fornsök/Kulturmiljöregistret (WFS/REST); "element" ersätts
  av `object_type` (runsten/gravfält/fornborg).
- **Sockenkyrkor:** RAÄ/K-samsök; minsta datasetet, enklast.

Element-katalogen är ortnamns-specifik; övriga lager får sin egen kategorimappning.

---

## 11. Utanför scope (YAGNI för piloten)

- Live-WFS-proxy (ETL valt istället).
- Isof äldsta-belägg-import (fält förberedda, källa saknar API).
- Fornminnes- och kyrklager (nästa iterationer).
- Nollmodell/Monte-Carlo och närhetsanalys (framtida, förberett i schema).
- `researcher`-roll, per-element-djupfilter-UI, tidsanimering av ortnamn.
- Norge/Danmark (`source`-fältet förbereder expansion).

---

## 12. Acceptanskriterier

1. `place_names`-tabell finns med RLS (publik läs, admin-skriv) och angivna index.
2. `scripts/import-place-names.ts` importerar Lantmäteriets ortnamn, taggar element enligt
   katalogen, är idempotent, och loggar denominatorn.
3. `PlaceNamesLayer` visas i kartan på `/explore`, filtrerbart per kategori/element via
   legenden, med egna ikoner och `contested`-markering.
4. Lagret visar **alla** matchande förekomster i vyn + räknare (ingen kuratering).
5. Filtertillstånd är kodat i URL → vyn är reproducerbar.
6. Popup visar namn, element+regel, källa/licens, importdatum (+ äldsta belägg när det finns).
7. Signup-verifieringschecklistan (9.2) är genomförd; Agneta & Stephanie kan registrera
   sig som icke-admin `user`.

---

## 13. Öppna frågor

1. **Geotorget-konto:** vem beställer "Ortnamn Nedladdning, vektor" (kräver
   Lantmäteriet-inlogg)? Daniel, antar jag — bekräfta.
2. **Isof-kontakt:** ska vi redan nu mejla `namn@isof.se` om äldsta-belägg-data, eller
   vänta tills lagret står? (Förslag: vänta.)
3. **Kategoritilldelning:** stämmer bästa-gissning-kategorierna i 4.2, eller vill Daniel
   justera någon (t.ex. Sal → sacral istället för power)?

---

## 14. Källor

- [Ortnamn Nedladdning, vektor — Lantmäteriet](https://www.lantmateriet.se/sv/geodata/vara-produkter/produktlista/ortnamn-nedladdning-vektor/)
- [Geotorget — Ortnamn Nedladdning](https://geotorget.lantmateriet.se/link/ortnamn-nedladdning-vektor)
- [Öppna data — Lantmäteriet](https://www.lantmateriet.se/oppnadata)
- [Ortnamnsregistret — Institutet för språk och folkminnen (Isof)](https://www.isof.se/namn/ortnamn/vara-ortnamnssamlingar/ortnamnsregistret)
- [Ortnamnsregistret (digital)](https://ortnamnsregistret.isof.se/)
- Stephanie Heinz, *Ortnamnskluster, runstenar och fornborgar* (arbetsrapport, juli 2026)
