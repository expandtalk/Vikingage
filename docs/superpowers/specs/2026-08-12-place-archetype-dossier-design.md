# Arketyp-driven plats-dossier

**Datum:** 2026-08-12
**Status:** Design — väntar granskning
**Pilot:** Färjestaden (Öland)

## Problem

Sök- och platssvaren renderar *samma generiska form* för varje plats: "mittpunkt +
runstenar i närheten". Det gör att datarika, historiskt intressanta platser ser fattiga ut.
Konkret för **Färjestaden** (verifierat i DB, 2026-08-12): allt som gör orten intressant finns
redan lagrat men syns inte på sidan.

- Ortnamnet: `place_names` har Färjestaden endast som `osm_village` (56.6517 N, 16.4722 Ö),
  ingen belagd äldre form. Men en egen post finns: **"Snäckstaviken (Färjestaden)"**,
  `feature_type='vik'`, element `snack`, med not *"hypotes om ledungshamn vid Färjestaden
  (jfr I. Olsson 1972 om gotländska snäck-namn)"*. Korrekt märkt **hypotes** — kopplas aldrig
  till Färjestaden-svaret.
- Hålvägarna: RAÄ `färdväg` / `färdvägssystem` + milstolpar/väghållningsstenar strålar söderut
  och öster/nordost mot Algutsrum (t.ex. Färdväg L2024:7696). Ritas inte — AnswerContext saknar
  färdvägs-lager.
- Badplatserna: nästan hela kustremsan finns som `experiences` med säsong + vattenkvalitet
  (Granudden/Talludd 0,1 km, hamnen, Möllstorp, Eriksöre, Saxnäs, Kalmarsundsparken, Haga Park,
  Lökenäs, Stora Rör, Kleva). AnswerContext saknar upplevelse-lager helt.
- Sjösidan: vrak i mängd (Nya Enigheden – linjeskepp, dendro efter 1632; Grimskär-brännarna;
  många odaterade) + tabellerna `fairways`, `crossing_points`, `maritime_nodes`. Bara vraklagret
  ritas; farled/överfart/öar/grund ritas inte.

Slutsats: **problemet är inte datafattigdom, det är att kompositionen är likformig.**

## Princip: funktion, inte form

En sida blir bra när den utgår från **vad platsen var till för** och monterar de bevislager som
uttrycker den funktionen. Platsens **arketyp** (funktion) styr sidans komposition:
vilka lager kartan drar in och deras prominens, samt berättelseramen och sektionsordningen.

Kritiskt: **RAÄ-lämningstyp är inte arketypen.** "Fornborg" är en *form*; funktionen varierar
(försvar, tillflykt, kult, ting, elitboställe, ledkontroll). Klassificeraren får aldrig mappa
lämningstyp → arketyp 1:1 — arketypen läses ur en evidensvektor. DB modellerar redan detta för
fornborgar via `swedish_hillforts.fort_function` och `hillfort_phases.function` (funktion per fas).

## Arketyp-taxonomi (v1)

| Arketyp | Funktion ("varför") | Dominerande lager | Databärkraft |
|---|---|---|---|
| **overfart_logistik** | passage (färja, vad, bro, hamnläge) | färdvägar+milstolpar, hamn, `crossing_points`/`fairways`, vrak, ledungshamn-hypotes, bad | Stark — **pilot** |
| **handelsnod** | utbyte (marknad, köpstad, emporium) | köpstadssignal/`town_formation_profiles`, hamn, farled, myntfynd | Stark; bär ofta **bana** → stad → kulturcentrum |
| **centralort** | styre (husaby, kungsgård, ting, tidig kyrka) | `estates`/`estate_holdings`, kyrkor, runstenar, `central_place_profiles` | Stark |
| **forsvar** | kontroll/hot (borg, mur, skans, kase, sjöspärr) | `fort_element`-geometri, `fort_hypothesis`, sikt/höjdläge, ev. forensik | Stark — **stresstest** (ofta omtvistad funktion) |
| **processionsvag** | rörelse & rit genom landskap | `roads_near`/`road_waypoints` i sekvens, landmärken, bro-/vägrunstenar | Medel |
| **gravplats** | vem, när, monumentalitet | gravar (heritage), osteologi, `elite_monuments`, bildstenar | Medel |
| **monument** | objektet + dess plats-historik | 3D (`models_3d`), ristare, formel, `inscription_locations`/hypoteser | Medel |
| **kultplats** | rit & kontinuitet | `cult_sites`, offermossar, teofora ortnamn, spolia | Medel |

Slugs (`overfart_logistik` …) är stabila nycklar; visningsnamn tvåspråkigt.

## Datamodell

### Arketyp som claim, inte fast etikett

Arketyp lagras **inte** som en enkel kolumn på platsen. Den är ett claim i den befintliga
claim-liggaren (`place_claim`), med status ortogonalt mot konfidens — precis som övriga claims:

- **status:** `belagt` | `hypotes` | `omtvistat`
- En plats kan bära **konkurrerande** arketyp-claims samtidigt (t.ex. borg tolkad som försvar
  *och* kult). Dossiern visar båda med källkritiken bredvid, tvingar aldrig fram ett svar.

Ny lättviktstabell (namn prel.) `place_archetype` som materialiserad, sök-/render-vänlig vy över
befordrade arketyp-claims:

```
place_archetype(
  id, place_ref (tabell+id el. place_slug), archetype (slug),
  role ('primary' | 'phase' | 'secondary'),
  phase_order int null, phase_from int null, phase_to int null,   -- för banan
  status ('belagt'|'hypotes'|'omtvistat'), confidence numeric,
  provenance jsonb,   -- fingerprint-signaler + regel som föreslog + källa
  created_at, updated_at
)
```

### Primär arketyp + faser (tid)

- **Primär** styr sidans ledande ansikte (obligatorisk, exakt en per plats).
- **Faser/sekundära** är opt-in och lägger till lager + en tidslinje. De flesta platser har bara
  en primär (Färjestaden = `overfart_logistik`). Rika platser bär en bana
  (Kalmar: överfart → handelsnod → centralort/kulturcentrum) — återanvänder mönstret från
  `town_formation_profiles` (fyrfas) och `hillfort_phases`.

## Automation (kärnan — Daniel arbetar solo)

Hybrid-tilldelning som kör sig själv och bara knackar på dörren vid tvetydighet.

1. **Fingerprint = ren SQL-feature-vektor per plats.** Generalisering av befintliga
   `maritime_node_fingerprint`. Signaler t.ex.: överfart/hamn inom radie? `fort_element`?
   `crossing_points`/`fairways`? köpstadssignal/`town_formation_profiles`? `cult_sites`?
   gravfältstäthet? `estates`/husaby? Deterministiskt, billigt, granskningsbart — ingen ML,
   ingen svart låda.
2. **Regelklassificerare** över vektorn → föreslår **primär arketyp** (+ ev. faser) med
   **konfidens** och **status**. Regler = läsbara, versionshanterade.
3. **Befordran efter risk** (som claim-liggaren):
   - **Entydig hög konfidens** (en ren signaltyp) → auto-befordras till `place_archetype` med
     full proveniens. Daniel ser den aldrig. **Ribban sätts högt** (Daniels beslut 2026-08-12:
     hellre en kö man hinner med än fel etikett inbränd på kanon).
   - **Tvetydig / flera signaltyper / låg konfidens** → landar i `place_suggestions`-kön för ett
     ~5-sekunders tumme-upp, batchat.
4. **Agentflottan kör passet** (schemalagt); verifierar-agenten rekoncilierar drift mot källa.
   Människa-i-loopen bara för undantagen. Aldrig autonom skrivning till kanon.

## Sidgenerering ur profil

Sidan byggs av **motor + profil**, inte handförfattad HTML.

- **Motorn** = befintliga `*_near`-RPC:er (`place_features_near`, `roads_near`, `sites_near`,
  `nearby_experiences`, `fortifications_near`, `nearby_features_ranked`) + platsens center.
- **Profilen** = deklarativ config per arketyp: vilka lager som hämtas, deras kartprominens/
  z-ordning, berättelseramen och sektionsordningen i högerkolumnen. Speglar Explore-profilerna
  (enad config) och legend-seedningen (seeda en gång, ref-vakt — får aldrig tvinga på per render).
- **Ny plats + satt arketyp ⇒ sida automatiskt.** Ingen bespoke per plats.
- **Prosan (v1):** mallad ur data med luckor fyllda från DB, varje påstående märkt
  belagt/hypotes. Agent-utkastad rikare prosa till staging är **fas 2** (opt-in), aldrig direkt
  i kanon. *(Öppen fråga 3 — se nedan; default = mallad.)*

### Nya render-lager i AnswerContext (och delad med PlaceMap)

Byggblock som återanvänds av generaliseringen, inte Färjestaden-specifika:

1. **Upplevelse-lager** — `nearby_experiences` (bad/svamp/utflykt), säsongsstyrt, i högerkolumnen.
2. **Kommunikations-lager** — färdvägar/hålvägar + milstolpar (`roads_near`), strålar mot centrum.
3. **Sjösidans-lager** — `fairways` + `crossing_points` + vrak + öar/grund som ett "från sjösidan".
4. **Berättelse-nod** — surfa ortnamns-/funktionshypotesen överst (Färjestaden → Snäckstaviken),
   märkt hypotes med källa.

Legend-togglar följer legend-invarianten (default-på men aldrig påtvingad per render).

## Pilot-scope

Spika mönstret på *olika* arketyper så motorn bevisas för mer än datarika, entydiga platser.
OBS: **Ismantorp och Sandby borg är BÅDA `försvar`** (fornborg) — inte skilda arketyper. En
försvarsplats räcker som pilot; den andra blir sekundärt exempel som samma motor täcker.

1. **Färjestaden** (`overfart_logistik`) — huvudpilot; alla fyra nya lager + berättelse-nod.
2. **Vickleby** (bygd/`kultplats`-karaktär: Karlevistenen, kyrka, alvar/skeppssättning, kvarnar,
   hålvägar) — tillagd 2026-08-12 efter rapporterad bugg: sök på Vickleby centrerade rätt men visade
   Kalmars sevärda platser (Vickleby-sidans lämningar har prominence=0 → filtrerades bort; enda
   prominenta inom 25 km = Kalmar ~7,6 km över sundet). Ranknings-fix (avstånds-dämpad prominence)
   applicerad men **plåstrar bara** — den verkliga fixen är databerikning + lokalt ankrade
   funktions-lager, dvs. exakt dossiern. Vickleby stresstestar (a) lokal ankring för en anspråkslös
   plats, (b) aktivitets-/"På platsen"-lagret, (c) **tvetydig arketyp → människa bekräftar**.
3. **Ismantorp** (`försvar`, omtvistad funktion: försvar vs kult) — stresstestar arketyp-som-claim,
   konkurrerande tolkningar och tvetydig → kö-vägen. Sandby borg = samma arketyp, sekundärt exempel
   med forensiskt/massaker-överlägg.
4. **En centralort** (Kalmar/Hossmo) — testar bana/faser + estates/kyrk-lager (om vi vill ha en fjärde).

## Hederlighet & källkritik

- Koordinater aldrig ur minnet — allt center/lager kommer ur DB eller markeras approximativt.
- Snäckstaviken = **hypotes** (I. Olsson 1972), aldrig presenterat som faktum.
- Arketyp-claims bär proveniens (signaler + regel + källa); auto-befordran loggas.
- Konkurrerande tolkningar visas som `omtvistat`, inte bortsorterade.

## Utanför scope (v1)

- ML-klassificering (reglerna räcker och är granskningsbara).
- Agent-utkastad prosa (fas 2).
- Community/UGC på dossiern (befintlig stub räcker).
- Retroaktiv omtaggning av alla ~hundratals kuraterade platser — piloten först, massbefordran sen.

## Öppna frågor (att bekräfta vid granskning)

1. Tabellnamn `place_archetype` + koppling via `place_slug` vs polymorf `place_ref` — vilket
   passar bäst mot hur kuraterade platser redan pekas ut (cult_sites/heritage_sites/place_slug)?
2. Ska pilotens tre platser alla bli `/sv/plats/:slug`-sidor, eller får centralorten/försvaret
   bara berikad svarspanel i v1?
3. Prosa v1: mallad-ur-data (default) — bekräfta att det räcker för piloten.
