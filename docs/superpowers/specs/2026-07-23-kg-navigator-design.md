# KG-navigator — kunskapsgraf som vägvisare till rätt sektion

**Datum:** 2026-07-23
**Status:** Design för granskning
**Ägare:** Daniel Larsson

---

## 1. Problem

Plattformen har en **enorm datamassa** som i praktiken är oupptäckbar för besökaren. Datan är inte orenderad — kartan visar redan 34 795 objekt över åtta lagergrupper — men rikedomen ligger begravd i en gigantisk legend och en bred toppnavigering. Det finns **ingen väg från "det här är jag intresserad av / det här frågar jag om" → rätt lager + rätt sektion**.

Verifierad datamassa (radantal, publikt läsbara tabeller):

| Tabell | Rader |
|---|---|
| `place_names` | 42 983 |
| `relationship` (KG-kanter) | 14 523 |
| `signum_inscription_links` | 13 970 |
| `inscription_material` | 9 514 |
| `interpretations` | 9 198 |
| `heritage_sites` | 9 112 |
| `entity_registry` (KG-noder) | 7 639 |
| `runic_inscriptions` | 6 434 |
| `readings` | 6 124 |
| `place_names`, dating, source_texts m.fl. | tusental |

Kartlager (legend, totalt 34 795 objekt): runstenar 6 438, kyrkor 4 187, fort 1 285 (fornborgar 1 236 + vikingaforten 49), kultplatser 35, vikingarutter 107, folk/regioner 40, historiska händelser 37, mynt 32, aDNA 4, dåtida strandlinje (SGU), maktsäten.

## 2. Mål

Bygg en **kunskapsgraf ur befintlig databasdata** vars uppgift är att **lotsa besökaren till rätt sektion**. Givet ett intresse eller en fråga ska grafen svara:

> intresse/fråga → *(rätt delmängd av lagren + flyg dit + rätt sektioner + kopplade entiteter)*

Grafen orkestrerar **uppmärksamhet** — den renderar inte ny data, den översätter "var man ska leta".

## 3. Nuläge (verifierat i kod och DB)

Allt nedan finns redan och ska återanvändas — inget byggs om.

### 3.1 Destinationssystemet finns
- **`/explore?focus=<FocusType>`** sätter ett kurerat lager-tillstånd. `FocusType` (`src/hooks/useFocusManager.ts`): `inscriptions | coordinates | carvers | rivers | fortresses | gods | cultSites | hundreds | parishes | names | folkGroups | geneticEvents`. Ytterligare focus-värden finns i lanseringskorten (t.ex. `churches` i `ExploreViewCards.tsx`).
- **`explore_profiles`** (7 rader) + `src/config/exploreProfiles.ts`: intresse-linser (lingvist, kulturgeograf, genetiker, handel, arkeolog, osteolog, explore) → `layers: Record<string,boolean>` + `primaryLayers`. Focus läggs som **override ovanpå en profil**.
- **Sektions-routes** i toppnav: `/economic-history`, `/excursions`, `/historical-events`, `/fortresses`, `/royal-chronicles`, m.fl.

### 3.1b Destinationsprincip: dedikerade, tvåspråkiga routes — inte dynamiska focus-states
Önskad destinationsform är **egna, statiska, tvåspråkiga routes per innehållssektion** — `/churches` (en) + `/kyrkor` (sv) — **inte** `/explore?focus=churches`. Skäl:
- **Indexerbarhet:** en dedikerad URL kan nå sökmotorer; ett `?focus=`-SPA-tillstånd gör det inte. Det är samma "gör datan synlig"-mål, fast på webbnivå.
- **Delbarhet/deep-link:** ren URL, stabil, språkspecifik.

En dedikerad route kan internt sätta samma lager-tillstånd (profil + focus + flyTo), men med ren URL. **Beroende:** att routen blir *äkta* SEO-synlig (server-renderad/prerenderad) hänger ihop med det **parkerade SPA-SEO/prerender-beslutet** (se minnet `seo-spa-prerender-beslut`, Astro föredraget spår). v1 kan leverera de rena routerna som klient-renderade alias; full SEO-rendering är ett separat spår.

### 3.2 Grafen finns men saknar bindväv
- **Noder** `entity_registry` (7 639): inscription 6 434, carver 341, artefact 339, king 212, source 98, coin 32, god 26, theme 25, dynasty 23, road 10, landscape 6, city 6, fortress 1.
- **Kanter** `relationship` (14 523) — men fördelningen är sned:

| Predikat | Kanter |
|---|---|
| `has_artefact` | 12 995 |
| `carved_by` | 1 313 |
| `has_theme` | 170 |
| `mentions_person`, `located_in`, `cites`, `sampled_at`, `dated_by`… | ensiffrigt |
| `buried_at`, `dated_to`, `belongs_to_parish`, `part_of_hundred`, `commissioned_by`, `kin_of`, `introduced_at`, `taxed_under`, `built_by`, `near`, `depicts`, `written_in`, `within_shape` | **0** |

- **Vokabulär** `rel_predicates` (30 predikat) och RPC **`graph_neighborhood(p_id)`** finns.

### 3.3 Sökytan finns
- `src/components/search/GlobalSearch.tsx` — hybrid-sök (`search-hybrid`) + grundat RAG-svar (`search-answer`, graf-förstärkt). Embeddings 100 % (15 686/15 686).

## 4. Diagnos

Datan är osynlig för att **grafen saknar bindväv**: navigerings-kritiska predikat är tomma, och de största innehållstabellerna är inte ens noder. FK-relationerna finns redan i tabellerna (kung→dynasti, kyrka→socken, runa→datering, ort→landskap) men har aldrig materialiserats som grafkanter. Så `graph_neighborhood` returnerar idag nästan bara artefakt- och ristarkanter — värdelöst för navigation.

**Att "bygga en kunskapsgraf ur databasen" = skörda kanterna ur FK-datan + registrera de stora innehållstabellerna som noder.** Då blir grafen rik nog att lotsa, och navigationen faller ut ovanpå.

## 5. Arkitektur

Fyra lager, allt ovanpå det som finns:

| Byggsten | Återanvänder | Nytt |
|---|---|---|
| **Destinationsvokabulär** | `FocusType`, `explore_profiles`, sektions-routes | — |
| **Grafen** | `entity_registry`, `relationship`, `graph_neighborhood` | — |
| **Bindväv** | FK-data i tabellerna | nod-skörd + kant-materialisering |
| **Vägvisaren** | destinationskatalogen | predikat/entitet → focus-/lager-tillstånd + sektion |
| **Ytan** | `GlobalSearch` | fråga → entitet → rekommenderade lager+sektioner |

Destinationen är **inte** en URL utan ett **lager-tillstånd** ("tänd Frej-kultplatser + tema fruktbarhet, flyg till Uppland") — precis det profil/focus-systemet redan gör, men graf- och frågedrivet.

## 6. Design

### 6.1 Nod-skörd (A)
Registrera saknade innehållstabeller som noder i `entity_registry`. Prioriterade nya nodtyper: `place` (ur `places`/`place_names`), `parish`, `church` (christian_sites + kyrkkällan bakom `focus=churches`), `hillfort`/`fortress` (fler än nuvarande 1), `event` (historical_events), `excursion`. Idempotent (md5-baserade uuid:er där naturlig nyckel saknas, likt befintliga landscape-noder).

### 6.2 Kant-materialisering (B)
Fyll tomma predikat ur FK/kolumn-data. **Nya predikat registreras i `rel_predicates` FÖRST** (samma transaktion före `relationship`-insert). Nytt predikat behövs: **`has_estate`** (kung → kungsgård/förläning; person→plats-ankaret).

v1-kanter (högst värde + redan mappade lager):
- **kung → dynasti**: `belongs_to_dynasty`/`kin_of` ur `historical_kings.dynasty_id` + `royal_relations`.
- **kung → kungsgård/förläning**: `has_estate` ur estates/maktgeografi-data.
- **gud → kultplats**: befintlig geokodning (16/11/8 kultplatser) formaliseras som kanter.
- **ort → landskap**: `located_in` ur `places`/`place_names`.
- **kyrka → socken → härad**: `belongs_to_parish`/`part_of_hundred` (geokopplar de 4 187 kyrkorna där koordinat saknas men socken/härad finns). Dedikerade routes `/kyrkor` + `/churches`.

Senare (v2+): runa → datering (`dated_to`), händelse → tid, mynt → myntverk (`minted_in`).

### 6.3 Vägvisaren (C)
Ett litet, versionerbart konfig-lager: **entitetstyp + predikat → destination**. Destination = `{ route?: {sv,en}, focus?: FocusType, profile?: string, enableLayers?: string[], flyTo?: {bbox|center} }`.

**Destinationen är i första hand en dedikerad tvåspråkig route** (`route: {sv:'/kyrkor', en:'/churches'}`); `focus`/`enableLayers`/`flyTo` används där ingen dedikerad route ännu finns, eller för att sätta lager-tillstånd *inuti* routen. Nya dedikerade routes läggs till efter hand (v1 börjar med dem som redan finns/efterfrågas mest).

Exempel:
- entitet `god` → `{ route: {sv:'/gudar', en:'/gods'}, enableLayers: ['cult_<gudnamn>'] }`
- entitet `church` → `{ route: {sv:'/kyrkor', en:'/churches'} }`
- predikat `has_estate` → `{ route: {sv:'/maktsäten', en:'/power-seats'}, flyTo: estate-bbox }` (eller focus tills routen finns)
- entitet `king` → `{ route: {sv:'/kungakronikor', en:'/royal-chronicles'}, flyTo: estates-bbox }`
- predikat `has_theme` → `{ route: {sv:'/utflykter', en:'/excursions'}, enableLayers: [tema] }`

Vägvisaren läser grannarna från `graph_neighborhood` och översätter varje kant till en destination (dedikerad route först).

### 6.4 Sök-ytan (D)
I `GlobalSearch`: fritext → resolvera till entitet(er) i `entity_registry` (via `search_v2`) → hämta grannskap → rendera **destinations-/lagerkort**: "Det här handlar om *X* — gå vidare hit", varje kort en riktig destination (dedikerad route först, annars focus-state + flyTo). Det grundade svaret (`search-answer`) står kvar överst. Ingen återvändsgränd.

**Tre presentationsregler (UX):**
1. **Tematisk gruppering, inte platt lista.** Destinationskorten grupperas i kategorier — t.ex. *Makt & union · Kyrkor & socknar · Fornborgar · Handel & mynt · Utflykter* — härledda ur grannarnas entitetstyp/predikat. En rankad radhög (dagens beteende) ersätts av grupperade kort.
2. **Händelse/story först.** När en plats har en kopplad `historical_event` lyfts *berättelsen* som primär rubrik ("Sandbyborgsmassakern") framför platsnamnet ("Sandby borg"). Kräver att `event`-noder finns och att en `event`-kant (t.ex. `happened_at`) knyter händelse→plats. (Node-typ `event` läggs till i nod-skörden; specifika händelser kan vara innehållsluckor — se 6.6.)
3. **Tidsperiod högst upp.** En epok-väljare överst i resultaten ramar in svaret och är ingången till tidsmaskinen: väljs "medeltid" visas medeltida lager/kort, "vikingatid" visar vikingatida. Speglar `selectedTimePeriod` (samma vokabulär som kartan) och styr både kort-urval och kartans tidstillstånd vid "Res dit".

### 6.6 Innehåll vs motor (gap-visning)
Navigatorn visar vad datan bär och **gör luckor synliga** — den fyller dem inte. Kalmar illustrerar: Kläckeberga/Hossmo-kyrkorna + slottet + fornborgar finns i DB och surfas; den rika medeltida berättelsen (Kalmar Stads Tänkebok, Kalmarunionen + Erik av Pommerns kröning, stadsmurarna, Vasaresidenset, Stensö-landstigningen) är **innehållsluckor**. Att författa sådant innehåll (union som `historical_event`, Tänkeboken som `source`, murar som platser, Stensö som `excursion`) är ett **separat innehållsspår**, inte del av KG-motorn. Beslut per plats: fyll innehåll, eller visa ärligt + flagga lucka. v1-motorn förutsätter det senare.

**Resolvern är delad.** Fråga → entitet → `graph_neighborhood` → destinationer är ett eget lager som två vyer konsumerar: destinationskorten (v1) och brainstorming-mappen (6.5, v2). Bygg resolvern så att båda vyerna faller ut ur samma anrop.

### 6.5 Brainstorming-map (v2-vy över samma resolver)
En **interaktiv nodgraf**: entiteten i centrum, grannarna som noder (klick → expandera nästa led), varje nod en dörr till sin sektion (samma destination-mappning som korten). Ingen ny datamodell — bara ett renderingslager (nodlayout + expandera-på-klick) ovanpå resolvern i 6.4. Värdet skalar med hur mycket bindväv som materialiserats (v2+-predikaten), så den byggs efter v1 med avsikt. Detta är den tidigare efterfrågade "brainstorming-noden".

## 7. Scope

### v1 (denna spec)
KG-navigatorn + första nod-skörden och kant-materialiseringen för **kung→kungsgård/dynasti, gud→kultplats, ort→landskap, kyrka→socken/härad** (med dedikerade routes `/kyrkor` + `/churches`), surfat i söket som destinationskort. Byggt så att fler linser/predikat = config, inte omskrivning.

### v2+ (senare, ett predikat i taget)
Historiska händelser via tid, mynt/ekonomisk historia, utflykter efter intresse, runa→tolkning/läsning/datering.

### Relation till nuvarande sök (behålls oförändrad)
Sök-motorn — hybrid `search_v2`/`search-hybrid` (100 % embeddat) + grundat RAG-svar `search-answer` (graf-förstärkt) + federerade grupper + temachips — är genuint stark och **rörs inte**. KG-navigatorn är ett **additivt lager**: den lägger till destinationskorten ("…och gå vidare hit") i `GlobalSearch` (6.4). Svaret blir en dörr i stället för en återvändsgränd. Ingen omskrivning av motorn.

## 8. Icke-mål (YAGNI)
- Ingen ny 3D/first-person-vy. "Resa" = kamera + tidsreglage på befintlig data.
- Ingen utbyggnad av tidsmaskinen framåt i tiden (paleo-strandlinjer stannar ≤950; post-vikingatida svar bär kunskap, inte strandlinjemorf).
- Ingen omskrivning av legend-/profil-/focus-systemet — vi bygger ovanpå.
- Ingen browsbar grafvisualisering i v1 — men uttryckligt planerad som v2-vy (6.5) över samma resolver; v1-resolvern byggs så den låser upp den.
- Ingen full SEO-/prerender-rendering av de dedikerade routerna i v1 — de levereras som klient-renderade tvåspråkiga alias; äkta server-/prerender-SEO är ett separat spår (parkerat beslut, Astro föredraget).

## 9. Datamodell-ändringar
- `rel_predicates`: nytt predikat `has_estate` (subject `king`/`person` → object `place`/`estate`), ev. `belongs_to_dynasty` om det saknas.
- `entity_registry`: nya nodtyper `place`, `parish`, `church`, `event`, `excursion` (v1: `place` + formalisering av god→kultplats).
- Inga destruktiva ändringar; all skörd idempotent och additiv.

## 10. Risker
- **KG-materialisering är write-through**: registrera noder i `entity_registry` FÖRE kant-insert, annars ser triggern dem inte (jfr theme_links-mekanismen). Verifiera via kant-antal efteråt.
- **`has_estate`-data**: estates/maktgeografi-täckningen avgör hur många kungar som får plats-ankare; mät före löfte.
- **Sned FK-kvalitet**: vissa dynasti-/dateringskopplingar är osäkra — bär `confidence` på kanten där källan är svag (`certain` ≠ belagd).

## 11. Test
- Nod-skörd: antal noder per ny typ matchar källtabellens radantal (idempotent — kör två gånger, samma antal).
- Kant-materialisering: `relationship`-antal per nytt predikat > 0 och matchar FK-räkningen.
- Vägvisare: enhetstest av predikat→destination-mappningen (given kant → förväntad `{focus, section, flyTo}`).
- Sök: given fråga ("Frej", "Birger jarl", "Uppland") → förväntade destinationskort.
