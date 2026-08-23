# Sök-benchmark

Repeterbar mätning av sökkvaliteten mot den deployade `search-hybrid`-motorn. Kör samma frågor
före/efter en förbättring (ingest, UGC, innehåll) och se kvaliteten röra sig — svart på vitt.

Ingen build/dev-server behövs: slår direkt mot deployad Supabase edge (publik anon-läsning).

## Struktur

```
suite-core-retrieval.json       # 62 frågor: entiteter, platser, historiska, relationer, evidens, flerspråkigt
suite-researcher-personas.json  # 58 frågor: arkeolog + historiker (källkritik/metod/evidens) + innehållsgap
run.mjs                         # kör en svit → results/<svit>-<datum>.{json,md}
compare.mjs                     # jämför de två senaste körningarna för en svit → trend
lib/query-understanding.mjs     # klient-ankarextraktion (används av arkiverade A/B-experimentet)
results/                        # datumstämplade snapshots (historik — sparas, committas)
archive/                        # engångsexperiment (query-understanding A/B, historiskt)
```

## Kör

```bash
npm run bench                 # båda sviterna + trend
npm run bench:core            # bara core-retrieval + trend
npm run bench:researchers     # bara forskarpersonerna + trend

# eller direkt:
node benchmark/run.mjs suite-core-retrieval.json
node benchmark/compare.mjs core-retrieval
```

Arbetsflöde: kör → gör en förbättring (ingesta data, skapa UGC, förbättra innehåll) → kör igen →
`compare` visar deltat. Snapshots namnges per datum, så en körning per dag jämförs mot föregående.

## Mått

| Mått | Betyder | Rör sig när du… |
|---|---|---|
| **Svarbar %** | andel frågor med minst 1 träff (ej dead-end) | ingestar data (färre tomma sökningar) |
| **Ankare hittat %** | rätt förväntad entitet finns i topp-8 | förbättrar entiteter/relationer/länkning |
| **Topp-typ rätt %** | topp-1-träffens typ = förväntad (bara core-sviten) | förbättrar ranking/retrieval |
| **Dead-ends** | frågor med 0 träffar | detta är den dyraste UX-förlusten — jaga den till 0 |

## Praktiska förslag — störst förbättring först

1. **Jaga dead-ends först.** Varje dead-end = en användare som får tomt. `compare`-rapporten listar
   dem längst ner. Störst hävstång: ingesta/UGC:a innehåll för just de frågorna, kör om, se dem
   försvinna. En dead-end→träff är alltid en förbättring; en ✗→✓ är finlir.
2. **Forskarpersona-sviten mäter innehållsgapet, inte bara retrieval.** Många av dess frågor är
   generiska begrepps-/metodfrågor utan egennamn (källkritik, stratigrafi, bioarkeologi) — de landar
   först när **ordliste-/begreppslagret** finns. Prioritera att seeda de kategorier som scorar sämst.
3. **En körning per dag räcker.** `compare` plockar de två senaste snapshotsen. Kör före en
   ingest-/UGC-omgång och efter → deltat är din kvitto på att arbetet gav effekt.
4. **Frys sviterna.** `meta.version` markerar dem som stabila. Lägg gärna TILL frågor (ny version),
   men ändra/ta bort MEDVETET — annars blir trenden över tid ojämförbar.
5. **Regressionsvakt.** `compare` flaggar frågor som blev SÄMRE. En ingest som fixar 5 men bryter 2
   är inte gratis — se regressionslistan innan du är nöjd.
6. **UGC-loop:** ta de 5 sämsta frågorna → skapa innehåll/UGC för dem (människa-i-loopen) → kör om.
   Det är den snabbaste vägen från "tomt" till "svarar".

## Motor

`POST /functions/v1/search-hybrid {q, limit}` → `{hits[], mode}` (gte-small → search_v2 → search_v1;
query-understanding server-side). Sviterna kör mot **prod** — ingen lokal build.
