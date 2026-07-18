# Royal Chronicles — schemakartläggning (2026-07-18)

Kartläggning inför import av `regents_missing.csv` + `relations_edges.csv` + de 11 rättelserna.
**Inget kört ännu** — detta är underlaget för beslut om schemaändringar innan SQL genereras.

## Nuläge i DB
- **`historical_kings`** (128 rader) — `id, name, name_variations text[], dynasty_id→royal_dynasties, reign_start/end int, status king_status, region text NOT NULL, description, archaeological_evidence bool, runestone_mentions bool, gender text ('male' default), birth_year, death_year`.
- **`royal_dynasties`** (12 rader) — `id, name, name_en NOT NULL, description, period_start/end, region NOT NULL`.
- **`king_inscription_links`** (0 rader — tomt) — king↔inskrift.
- **`historical_sources`** — katalog över källverk (Adam, Rimbert…), enum `reliability`, `bias_types bias_type[]`. INTE per-kung-citat.
- **Ingen `royal_chronicles`-tabell** — sidan byggs av `historical_kings` + `royal_dynasties` (hook `useHistoricalKings`, `select('*, dynasty:royal_dynasties(*)')`).
- **Ingen person↔person-relationstabell.**
- Enum **`king_status`** = `historical | semi_legendary | legendary | disputed` → matchar CSV `classification` direkt (Historical→historical, Semi-legendary→semi_legendary, Legendary→legendary).

### Befintliga 12 dynastier
Bjälboätten (26), Eriksätten (2), Hårfagerätten (12), Jelling-dynastin (6), Rurikdynastin (12), Sjökungar (8), Skilfingar (2), **Stenkilsätten (0 — tom!)**, **Sverkerätren (1 — STAVFEL)**, Sverreätten (3), Valdemarätten (2), Ynglingar (7).

## CSV → historical_kings-kolumn
| CSV-kolumn | DB-kolumn | Status |
|---|---|---|
| name | name | ✅ |
| reign_start / reign_end | reign_start / reign_end | ✅ |
| classification | status (enum) | ✅ direkt mappning |
| runestone | runestone_mentions | ✅ |
| archaeology | archaeological_evidence | ✅ |
| dynasty | dynasty_id | ⚠️ kräver lookup/create i royal_dynasties |
| region | region | ⚠️ inkonsekvent i DB (se nedan) |
| (härledd) | gender | ⚠️ härled: Queen/Furstinna/kongemor → female, annars male |
| **role** | — | ❌ **INGEN kolumn** |
| **de_facto_ruler** | — | ❌ **INGEN kolumn** |
| **external_attestation** | — | ❌ **INGEN kolumn** (bara 2 booleans finns) |
| **node_control** | — | ❌ ingen kolumn |
| **sources** | — | ❌ ingen kolumn (historical_sources = separat verkskatalog) |

## BESLUT SOM BEHÖVS (schemaändringar)

### 1. Lägg till kolumner på `historical_kings`? (REK: ja)
- `role text` — King/Queen/Jarl/Drots/Riksföreståndare/Sjökonung/Härförare/Furste/Expeditionsledare/Motkonung. **Hög nytta:** löser rättelse #7 (Ingvar) OCH ersätter den sköra namn-/beskrivnings-heuristiken i `filterByRulerType` (idag gissar UI:t kung/jarl ur textinnehåll).
- `de_facto_ruler boolean default false` — jarlar/drots/riksföreståndare som styrde utan kungatitel.
- `external_attestation text[]` — frankisk/anglosaxisk/irisk/bysantinsk/arabisk/rysk/påvlig/tysk.
- `sources text` — fritext-källbelägg per regent (CSV-kolumnen).
- `node_control text` (valfri, maritim) — kan annars vika in i description.

### 2. Region-normalisering (REK: ja)
DB blandar `Sweden`+`Sverige`, `Norge`+`Norway`, samt sammansatta (`Danmark/Jylland`, `Norge/Northumbria`). Dynastierna använder engelska (Sweden/Norway/Denmark/Kievrus). **Förslag:** kanonisera till engelska enkel-token: `Sweden, Denmark, Norway, Kievrus` + NYA `Västerleden` (Danelagen/York/Dublin/Man) och `England` (anglosaxare). Städa befintliga blandade värden i samma svep (annars matchar inte region-filtret i UI:t, som kör `.eq('region', ...)`).

### 3. Ny relationstabell (REK: ja — namnbaserad)
Många ändpunkter är INTE kungar (Emma av Normandie, Gytha, Gyda…), så namnbaserat är flexiblare än FK-tvång:
```sql
create table royal_relations (
  id uuid primary key default gen_random_uuid(),
  person_a text not null,
  person_b text not null,
  relation_type text not null,   -- äktenskap|förälder|fostran|exil_hos|tjänst_hos|fadderskap|dråp_strid
  period text,
  comment text,
  source text,
  king_a_id uuid references historical_kings(id),  -- valfri koppling
  king_b_id uuid references historical_kings(id),
  created_at timestamptz not null default now()
);
```
+ RLS: publik läsning, admin-skrivning (som övriga tabeller).

## Rättelser — bekräftade mål (IDs)
| # | Post (id) | Åtgärd |
|---|-----------|--------|
| 1 | Gustav Vasa `279b632e` | dynasty Bjälboätten → **Vasaätten** (skapa) |
| 2 | Magnus Eriksson `87abac81` | dynasty Eriksätten → **Bjälboätten** |
| 3 | Sigrid Storråda `9f9714e2`, Astrid Olofsdotter `39e97c03` | ta bort Bjälbo-ätt (null); Astrid reign 1050–1100 → ~1015–1035 |
| 4 | Ragnhild Eriksdotter `a82d1c66` | fixa description ("mor till Harald Gråfäll" → Gunnhild) |
| 5 | Beatrix av Wittelsbach `6bab89ec` | separera från fel Erik Magnusson |
| 6 | Toke/Björn/Sibir-klustret | flagga spekulativt (leta rader) |
| 7 | Ingvar Vittfarne `c4830573` | role King → **Expeditionsledare** (kräver role-kolumn) |
| 8 | Dubbletter | Gorm ×3 `cb88822e/dad80e7c/9d1391b2`, Harald Blåtand ×2 `11e1bca1/4d844095`, Håkan Magnusson ×2 `58ef0da3/8dc1d7f9`, Magnus Haraldsson ×2 `68f95a7f/c4ed8d94`, Olav Kyrre ×2 `cec27557/883c257f` → deduplicera |
| 9 | Sverkerätren | döp om dynastin → **Sverkerska ätten** |
| 10 | Olof III `5e99ed64` | verifiera/ta bort (null reign, oidentifierbar) |
| 11 | Ynglingar → Munsöätten | flytta Erik Segersäll `53153467`, Olof Skötkonung `8d8f9ccd`, Anund Jakob `5ec127f0` (+ Emund); reservera Ynglingar för legendariska (Adils/Ottar) |
| — | Ragnhild `b682be14` (disputed, gender male, null reign) | trolig dataartefakt — verifiera/ta bort |

## Dynastier att skapa (utöver de 12)
Vasaätten, Munsöätten (osäkerhetsflagga), Estridska ätten, Ladejarlarna, Uí Ímair, Crovan-dynastin, Olof-dynastin (Hedeby), Polotsk-linjen, Wessex-dynastin, Godwin-ätten, Oxenstierna, Tott, Sjöbladsätten, Natt och Dag, Trolle, Gyllenstierna, Oldenburg, Ätten Grip.
Återanvänd: **Stenkilsätten** (=Stenkilska), **Eriksätten** (=Erikska), **Sverkerätren→döp om**, Valdemarätten, Rurikdynastin, Hårfagerätten, Sverreätten.

## Föreslagen körordning (efter beslut)
1. **Migration**: kolumner (§1) + `royal_relations` (§3) + RLS. → SQL-editor + `migration repair`.
2. **Region-städning** (§2) — UPDATE befintliga + kanonisera.
3. **Rättelser** (11) — UPDATE på bekräftade IDs.
4. **Dedup** (#8) — slå ihop, behåll kanonisk, flytta ev. FK.
5. **Dynastier** — INSERT saknade + döp om Sverkerätren.
6. **Regenter** — INSERT ur regents_missing.csv (dynasty-lookup, gender-härledning).
7. **Relationer** — INSERT ur relations_edges.csv (dedup-flagga rad Erik Emune–Malmfrid).
8. **Integritetscheck**: `external_attestation IS NOT NULL AND status='legendary'` → 0 rader.
9. **UI-följd** (separat): använd `role` i `filterByRulerType`; visa attestering/relationer; lägg till region-filteralternativ Västerleden/England.
