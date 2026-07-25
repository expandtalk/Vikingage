# RAÄ bildcorpus-ingest — design

**Datum:** 2026-07-25
**Status:** Design — väntar användargranskning innan implementationsplan
**Relaterat:** `2026-07-24-runsten-forensik-program-design.md` §6 (visuell pipeline) & §8 (datagrund); projektminne `ksamsok-fmis-pipeline`, `spatial-knowledge-graph-direction` (CC0-ingest-mönstret)

---

## 1. Mål

Licens-filtrerad ingest av **PD/CC0-runstensbilder från K-samsök** till `inscription_media`, kopplat till runinskriftens signum — råmaterialet som saknas för den visuella pipelinen (V1/V2). **Bara det vi bevisligen får använda** dras in. Södermanland först som pilot.

Icke-mål: att köra V1/V2-analysen (separat), att skrapa Arkivsök, att integrera Runor (se §7).

## 2. Källa & åtkomst — endast K-samsök REST

Kartläggningen (2026-07-25) visade att **endast K-samsök** har ett dokumenterat, frågebart licensfält och programmatisk åtkomst utan auth. Runor är en SPA utan verifierad API (den påstådda `runor.nordiska.uu.se/rest` gav 404); Arkivsök har ingen bulk (fil-för-fil, ~300 000 bilder) → båda förkastas som ingest-väg.

- Endpoint: `https://kulturarvsdata.se/ksamsok/api?method=search&version=1.1&query=<CQL>`
- Format: begär **JSON-LD** via `Accept: application/json` (obs: serialisering bytt 2025-06-23 → JSON-LD 1.1, `itemLicenseUrl` är nu `{"@id": "..."}`, inte sträng — parsa båda).
- Pilot-query (CQL): `text=runsten AND county=södermanland AND thumbnailExists=j` (justera fältnamn efter stickprov, se §5).
- Ingen auth för `method=search`; **ingen dokumenterad rate limit → bygg ändå med paus/backoff** (anta implicit gräns).

## 3. Licensmodell & filter

Två vokabulär cirkulerar → **matcha på delsträng, aldrig exakt sträng** (licensversion varierar per post, t.ex. äldre `by/2.5/se/`):
- RAÄ-internt: `kulturarvsdata.se/resurser/license#{pdmark|cc0|by|by-sa|by-nc|...|inc|inc-ow-eu|inc-edu}`
- Upplösta CC-URI:er: `creativecommons.org/publicdomain/zero/1.0/`, `creativecommons.org/licenses/by/2.5/se/`, osv.

**Använd `mediaLicenseUrl` (per bild), inte `itemLicenseUrl` (per post)** — de kan skilja sig; bilden är det vi ingestar, så bildens licens gäller.

| Delsträng i licens-URL | Åtgärd |
|---|---|
| `publicdomain/zero`, `publicdomain/mark`, `#cc0`, `#pdmark` | **BEHÅLL** — fri |
| `/licenses/by/` **utan** `-nc`/`-nd`/`-sa`, `#by` | **BEHÅLL + attribuera** (spara `attribution`-sträng) |
| `/licenses/by-sa/`, `#by-sa` | **EGEN BUCKET, default HOPPA ÖVER** — ShareAlike smittar corpus-licensen nedström; separat beslut |
| `by-nc*`, `by-nd*`, `#inc*`, RightsStatements "in copyright" | **HOPPA ÖVER** |
| **Fält saknas / null** | **HOPPA ÖVER** (default-till-restriktivt — RAÄ säger själva att märkning saknas på delar; anta aldrig fritt) |

Varje behållen bild loggas med sitt råa licensvärde för spårbarhet.

## 4. Mappning → `inscription_media`

Per behållen bild, upsert till `inscription_media` (befintlig tabell, §8):
- `media_url` — K-samsöks bild-URL (högsta tillgängliga upplösning, ej thumbnail)
- `media_type` = `'image'`, `file_format` från URL
- `photographer`, `photo_date` — ur mediametadata om de finns
- `copyright_info` = råt licensvärde; `source_institution` = `'RAÄ / K-samsök'`
- `resolution` — om angiven
- `description` — inkl. **provenansflaggor**: `image_type` (foto | teckning | etsning), `painted` (uppmålad ja/nej/okänd), `possibly_lost_state` (historiskt foto kan visa mer än vad som finns idag), `quality` (om bedömbar)

**Bildtyp-filter för visuell forensik:** endast `image_type = foto` matar V1/V2. Teckningar/etsningar (Boije/Haglund) ingestas men flaggas som *läshjälp, ej forensiskt underlag*. Föredra omålade "objektiva" foton; fler-datum-serier av samma sten behålls som robusthetsdata.

## 5. Kopplingsnyckel — signum (KRÄVER verifiering före skala)

Kringla visar ett strukturerat **"Runsignum"**-fält på K-samsök-poster från leverantören `raa/dokumentation` (ex. "Ög Fv1969;306"). Men exakt fältväg i K-samsöks API-schema är **overifierad** (kan vara `itemLabel`, `altLabel`, fritext i `itemDescription`, eller leverantörsspecifik).

**Obligatoriskt verifieringssteg innan uppskalning:** hämta rått JSON-LD för 5–10 *kända* Södermanlands-stenar (t.ex. Sö 159, Sö 158, Sö 217, Sö 301) och lås fast exakt fältväg + signum-format. Matcha mot `runic_inscriptions.rundata_signum` / signum-kolumnen i vår DB. Poster utan säker signum-match → lägg i en osäker-hink för manuell granskning, koppla inte gissningsvis.

## 6. Pilot-scope & steg (Södermanland)

1. Verifiera signum-fältväg mot 5–10 kända Sö-stenar (§5).
2. Kör K-samsök-query för Södermanland med `thumbnailExists=j`, paginera med backoff.
3. Applicera licensfiltret (§3) **lokalt i kod** (serverside-filtrering på licens är inte bekräftad pålitlig för alla leverantörer).
4. Signum-matcha, mappa, upserta till `inscription_media` (§4) — idempotent på (signum, media_url).
5. Rapportera: antal bilder per licens-bucket, antal signum-matchade vs osäkra, täckning (hur många Sö-inskrifter fick ≥1 foto).

## 7. Öppna frågor / att verifiera

- **Signum-fältväg** (§5) — blockerande, verifieras i steg 1.
- **Licens-granularitet i Arkivsök** — irrelevant om vi kör K-samsök; noteras bara.
- **Implicit rate limit** — bygg med paus/backoff oavsett.
- **Andel poster utan licensmärkning** — mäts i piloten; om stor andel "okänt" begränsar det täckningen (skip-default).
- **Runor** — parkerat: inspektera dess faktiska nätverkstrafik i en riktig browser (`browse`/`connect-chrome`) senare; kan visa sig proxya samma K-samsök-data → då behövs ingen separat Runor-väg.
- **BY-SA-beslut** (§3) — Daniel avgör om ShareAlike-bilder ska in i egen bucket eller uteslutas helt.

## 8. Nästa steg

Efter godkänd design → `writing-plans` för en implementationsplan: ett `scripts/data/ingest-raa-images.mjs` (K-samsök-klient + licensfilter + signum-matchning + upsert), med verifieringssteget (§5) som första task och en ren, testbar licensfilter-funktion (`src/domain/media/licenseFilter.ts`) som TDD-kärna.
