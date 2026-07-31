# Museum-import — spec

**Status:** museidomän byggd; SHM-samlingsimport specad, ej körd (data finns i repot).

## 1. Museidomän — GJORT
- `museums` (webbplats, domän, telefon, e-post, adress, öppettider jsonb, key_pages, geo) +
  `museum_events` (aktiviteter, kopplar säsong). Migr. 20260731340000.
- 15 kuraterade museer (namn/webbplats/typ verifierade; koord ungefärliga; **telefon/öppettider
  null — ingestas**). I `nearby_features_ranked` som feature_type `museum` + `place_signals` 'sight'.

## 2. SHM-samlingsimport — SPECAD, EJ KÖRD
**Data finns redan:** `docs/shm_sis_object_20260724_093302.csv` (533 objekt, SHM CC BY) +
`STATENSHISTORISKAMUSEUM/`. Kolumner: Föremålsnummer, Museum, Föremålsbenämning, Material,
Teknik, Storlek, Fyndplats (Land/Landskap/Socken/Kommun/Plats/Fornlämning), Arkeologisk kontext,
Tidsperiod, Titel, Beskrivning, Kategori, Valör, **Osteologi** (artbedömning/benslag/ålder/
skador/könsbestämning), Bild, URL.

**Mål-mappning:**
- Objekt → `artefacts` (befintlig tabell), länkade till museet Historiska museet (`museum_id`
  eller relationship `held_by`/`has_artefact`).
- Fyndplats → koordinat på **sockennivå** (samma metod som solidi-guldet: heritage_sites parish-
  centroid), flaggad approximativ. Landskap/socken/plats som text.
- Tidsperiod → period_start/end (parsning) för tidsfilter.
- Kategori/Material/Teknik → typning.
- **Osteologi** → `genetic_individuals`/osteologi-profilen (Daniels tidigare fråga) — art, benslag,
  ålder, skador/patologi, kön. Kopplar [[royal-osteology]]/[[osteology-gis]].
- Bild/URL → `inscription_media`/media-länk (CC BY-attribution).

**Pipeline:** återanvänd `ingest-shm-gold.mjs`-mönstret (CSV-parse, socken-centroid, CC BY→
attribution, cat_no i museum_inv om ej numeriskt). Nytt: `scripts/data/ingest-shm-collection.mjs`.

**Källrättigheter:** SHM CC BY 4.0 → FAKTA + metadata fritt; attribution obligatorisk. Ingen
verbatim upphovsrättsskyddad text (trigger-spärren, [[source-rights-copyright-guard]]).

## 3. Praktisk museiinfo — ingest-källa saknas
Telefon/öppettider/events för `museums`/`museum_events`: kandidatkällor = Riksförbundet Sveriges
museer, per-museum-webbplats (strukturerad data/JSON-LD), eller manuell kurering. Ej fabricerat.

## Byggordning
1. `ingest-shm-collection.mjs` — 533 objekt → artefacts + osteologi + media, sockenkoord. **Redo att köra.**
2. `/artefacts` temporal vy (period-slider) — knyter objekten till tid (Daniels tidigare önskan).
3. museum_events + öppettider-ingest (källa TBD).
