# Artefaktsidan — museisamlingar som andra lins (+ fyndkarta)

**Datum:** 2026-08-04
**Sida:** `/sv/artefakter` (och `/artefacts`) — `src/pages/Artefacts.tsx`
**Status:** Design godkänd, redo för implementationsplan

## Problem

`/sv/artefakter` handlar idag **enbart** om *föremålstyper som bär runinskrifter*
(`artefact_types_v1` → typ → `get_artefact_inscriptions`). Kategorikorten är ikoner,
inte foton — ett medvetet val från när vi saknade objektbilder.

Det stämmer inte längre. Vi har byggt en riktig samlingskorpus (`museum_objects`) som
sidan inte visar alls: fotograferade, fyndplatsförsedda, daterade fysiska föremål ur
museisamlingar (framför allt SHM, CC BY). Det är "artefakterna som finns på museum".

## Verifierade fakta (prod-DB, 2026-08-04)

`museum_objects`:

| Mått | Antal |
|---|---|
| Objekt totalt | **1 208** (alla med `museum_id` + `source_url`) |
| …med foto (`image_url`) | 696 (~58 %) |
| …med fyndplats (text) | 1 194 |
| …med datering (`period`) | 843 |
| …med koordinat (`lat`/`lng`) | **340** |
| Distinkta fyndpunkter | 88 |

Museer med objekt (5 av 19): Historiska museet **1 193**, Skoklosters slott 9,
Hallwylska 3, Kungliga myntkabinettet 2, Livrustkammaren 1.

**Två avgörande observationer:**

1. **Foto (696) och koordinat (340) är helt disjunkta** — 0 objekt har både bild och
   läge. Galleri och karta visar alltså *olika delmängder* av samlingen.
2. **Koordinaterna är äkta fyndplatsdata, inte centroider** — de varierar per punkt,
   `find_socken` är ofta `null`, och 6–10 objekt delar en punkt för att de kommer från
   samma fyndplats/depå. MEN precisionen är okänd/varierande (ofta plats-/områdesnivå).
   → De ska märkas **ungefärliga** (källa: SHM:s fyndplatsuppgift), aldrig som exakta
   GPS-fyndpunkter. (Källkritik-/koordinatregeln i CLAUDE.md.)

`category` är SHM:s pipe-separerade taxonomi och rörig, t.ex.
`Arkeologisk samling|Vapen och rustningar`, `Osteologisk samling|Arkeologisk samling`.

## Beslut (godkända av Daniel)

- **Två linser på samma sida.** Museisamlingar **först/default**.
- Fyndkoordinater ska med — som **egen kartvy** i museilinsen.

## Design

### Sido-shell + lins-växlare

`Artefacts.tsx` blir en tunn shell:

- Segmenterad kontroll överst: **[ Föremål i museisamlingar ] [ Runbärande föremålstyper ]**
- Default = museisamlingar.
- Aktiv lins speglas i URL: `?lins=museum` (default) / `?lins=runor` — deep-link + SEO.
- `PageMeta`-beskrivningen uppdateras så museisamlingen nämns.

Filuppdelning (dagens 250-radersfil gör för mycket):

| Fil | Ansvar |
|---|---|
| `src/pages/Artefacts.tsx` | Shell: lins-state ↔ URL, växlare, renderar en av två browsers |
| `src/components/artefacts/RunicTypeBrowser.tsx` | **Utlyft** dagens innehåll oförändrat (kategori→typ→inskrifter-dialog) |
| `src/components/artefacts/MuseumCollectionBrowser.tsx` | Ny lins: läges-växling + filter + galleri + fyndkarta |
| `src/components/artefacts/MuseumObjectCard.tsx` | Galleri-kort |
| `src/components/artefacts/MuseumObjectDialog.tsx` | Detaljdialog |
| `src/components/artefacts/MuseumFindMap.tsx` | Klustrad Leaflet-fyndkarta |
| `src/hooks/useMuseumObjects.ts` | Data (react-query) + härledd normaliserad kategori |

### Lins A — Föremål i museisamlingar (ny, default)

**Data:** `useMuseumObjects` — ett `select` mot `museum_objects` med join `museums(name)`,
kolumner: `id, name, title, description, category, material, technique, size, denomination,
find_country, find_landscape, find_socken, find_place, context, period, period_start,
period_end, osteology, image_url, source_url, source, attribution, lat, lng, museum_id,
museums(name)`. 1 208 rader hämtas en gång; filtrering/sök sker **klientsidigt**.

**Läges-växling** inuti linsen:

- **Galleri** — foto-rutnät. Fotoförsedda objekt (696) sorteras först; objekt utan foto
  visas med **kategori-ikon som platshållare** (vi döljer inte de 512 utan bild —
  fyndplats/datering är ändå värdefullt).
- **Fyndkarta** — de 340 objekten med koordinat som **klustrad** punktkarta (proportionella
  symboler; 88 punkter bär 340 objekt). Klick på punkt/kluster → lista → detaljdialog.
  Egen liten Leaflet-instans (imperativt mönster som `Angermanland`/`Öland`-kartorna).

**Delade filter + fritextsök** (gäller båda lägena):

- **Kategori** — härledd facett ur SHM-taxonomin (se nedan).
- **Landskap** (`find_landscape`).
- **Period** (`period` / `period_start`–`period_end`).
- Fritext över `name`/`title`/`find_*`.
- **Museum** — visas bara när >1 museum finns i aktuell vy (99 % är SHM → svag primär axel).

Varje läge visar **sin egen träffräkning** (t.ex. "Galleri 40 · Fyndkarta 0" efter ett
filter) så att foto/koordinat-disjunktheten blir synlig i stället för förvirrande.

**Kategori-normalisering** (endast omgruppering av *befintliga* etiketter — inga påhittade
fakta): splitta `category` på `|`, släpp de generiska leden (`Arkeologisk samling`,
`Föremål`), ta det mest specifika kvarvarande ledet och mappa:

| SHM-led | Facett |
|---|---|
| Vapen och rustningar | Vapen & rustningar |
| Dräkt och personlig utrustning | Dräkt & personligt |
| Hantverk och redskap | Hantverk & redskap |
| Husgeråd och livsmedel | Husgeråd |
| Transport och samfärdsel | Transport |
| Byggnadsdetaljer och monument | Byggnadsdetaljer |
| Osteologisk samling | Osteologi / ben |
| Medaljer (+ mynt) | Mynt & medaljer |
| (endast generiskt led kvar) | Övrigt |

**Kort (`MuseumObjectCard`):** foto (eller kategori-ikon) · namn/titel · fyndplats
(`find_socken · find_landscape`) · period · museibricka. Klick → dialog.

**Detaljdialog (`MuseumObjectDialog`):** stor bild (om finns), material/teknik/mått/kontext,
kategori, fyndplats, period, museum, ev. osteologi (`jsonb`), och:

- **Ungefärlig koordinat med källa** när `lat/lng` finns — märkt "ungefärlig fyndplats
  (SHM)", aldrig som exakt punkt.
- **Obligatorisk CC BY-attribution** (`attribution`/`source`) + "Se hos [källa] ↗"
  (`source_url`, finns på alla 1 208).

### Lins B — Runbärande föremålstyper

Dagens `RunicTypeBrowser`, **oförändrad funktion**. Bara inte längre default.

## Ärlig täckningssignal

Eftersom foto och koordinat är disjunkta blir det tydligt var samlingen är tunn (galleriet
har inga lägen; kartan inga foton). Det är rätt beteende: det visar var mer arbete behövs,
inte en falsk fullständighet. En kort not i linsen förklarar detta.

## Felhantering

- Datafel/tomt → tydligt tomt-läge per lins (samma mönster som dagens sida).
- Objekt utan `image_url` → ikon-platshållare (ingen brutet-bild-ikon).
- Externa SHM-bilder som inte laddar → `onError` faller tillbaka till kategori-ikon.
- Fyndkarta utan koordinatträffar (efter filter) → tomt-läge "Inga koordinatsatta fynd i
  urvalet" (foto-läget kan ändå ha träffar).

## Testning

- Enhetstest för kategori-normaliseringen (pipe-splittning, generiska led bort, mappning,
  fallback → Övrigt).
- Enhetstest för filter/sök-predikaten (landskap/period/fritext) på en fixtur.
- Manuell QA: lins-växling ↔ URL, galleri foto-först, fyndkarta klick→dialog, attribution
  syns på varje kort/dialog, disjunkt-räkningen stämmer.

## Utanför scope (nästa fas)

- Samma 340 fyndpunkter som **eget legend-lager på `/explore`** (återanvänder kart-stacken,
  koppling socken/landskap). Egen spec.
- Att fylla koordinat på fler objekt / foto på koordinatförsedda (datainsamling, inte kod).

## Öppna frågor

Inga blockerande. Kategori-normaliseringens facett-etiketter kan justeras efter smak.
