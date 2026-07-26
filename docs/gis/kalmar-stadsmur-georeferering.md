# Kalmar stadsmur — georefereringskit (QGIS → fort_element)

Detta är den reproducerbara uppställningen för att ersätta den **preliminära** landmärkes-
rekonstruktionen (migration `20260727140000`, `evidence='rekonstruerad'`, `published=true`)
med **georefererad** geometri. Den interaktiva GCP-placeringen görs i QGIS Georeferencer;
allt annat (schema, transform-val, osäkerhetsmodell, ingest) är specificerat här.

Källbilder finns i `docs/stadsmura_kalmar_stockholm_visby_viborg/`:
- `kalmar-ursprungi.jpg` — arkeologisk rekonstruktionsplan (**bild 3**, bäst för topologi)
- `kalmar-stadsmur-modern-karta.jpg` — modern tolkning på dagens karta (**bild 2**, lättast georef)
- `kalmar-stadsmur-.jpg` — foto/utsnitt

## 1. Skilj på fas, källa och säkerhet
- **Pahrs karta 1585** (Krigsarkivet SE/KrA/0424/058/047): primärkälla men skissartad,
  renässansbefästning runt medeltidsstaden. Ej skalriktig → **TPS**, räkna med stiliserad form.
- **Bild 2** (modern tolkning): lättast att georeferera, sämst som källa. **Polynom grad 1**.
- **Bild 3** (rekonstruktionsplan): bäst för topologi (portar, gatunät, holme). Ojämn intern
  geometri → **TPS**.

Tidsavgränsning: gamla staden övergavs successivt vid flytten till Kvarnholmen från 1640-talet.

## 2. Georefereringskedja — aldrig direkt
Modernt ortofoto (Lantmäteriet) → 1700/1800-talets stadskarta över Kalmar → 1600-talsplanen.
Varje steg får egen RMSE; total osäkerhet = √(Σ RMSE²). Georeferera **inte** bild 1 direkt mot
dagens karta (fel blir 50–100 m).

## 3. GCP-kandidater (rangordnade — ta koordinaterna själv i QGIS mot ortofoto)
| Prio | Objekt | Varför |
|------|--------|--------|
| 1 | Kalmar slotts fyra bastionsspetsar | Stenlagda, ~oförändrade sedan 1500-tal, syns i alla bilder |
| 1 | Slottsportens/brofästets läge | Skarp, dokumenterad punkt |
| 2 | Södra/Mosaiska kyrkogårdens murhörn | Kontinuitet från gamla staden |
| 2 | Dominikankonventets utgrävda grundmurar | Endast om rapportkoordinater finns |
| 3 | Tomt-/kvartershörn i Gamla stan (medeltida gatunät) | Svaga — låg vikt |
| – | Strandlinjen mot Slottsfjärden | **Använd ej** — kraftigt utfylld |
| – | Storkyrkans/portarnas läge | **Använd ej** — målvariabler (cirkelresonemang) |

## 4. Osäkerhet per segment (fyller `pos_accuracy_m`)
σ_tot = √(σ_RMSE² + σ_linjebredd² + σ_tolkning²)
- σ_RMSE: ur georefereringen.
- σ_linjebredd: en penseldragen mur på bild 1 ≈ 15–20 m i terräng.
- σ_tolkning: 0 där muren är utgrävd, generöst där linjen dras mellan två kända punkter.

## 5. Digitalisera + ladda (skriv aldrig koordinater för hand)
Digitalisera i QGIS mot de georefererade lagren; sätt fälten `element_type, evidence,
sigma_rmse, sigma_linje, sigma_tolkning` under digitaliseringen. Exportera GeoPackage:

```bash
ogr2ogr -f PostgreSQL PG:"$PGCONN" kalmar_stadsmur.gpkg \
  -nln private.kalmar_mur_staging -t_srs EPSG:3006 \
  -lco GEOMETRY_NAME=geom -lco FID=gid -overwrite
```

Staging ligger i `private` (ej exponerat av PostgREST). Ladda in i fort_element med
`published=false` tills segmenten granskats:

```sql
INSERT INTO public.fort_element
  (site, element_type, name, start_earliest, start_latest, end_earliest, end_latest,
   evidence, pos_accuracy_m, published, geom)
SELECT 'Kalmar gamla stad', s.element_type, NULLIF(s.name,''),
       1300, 1350, 1647, 1690,             -- verifiera per segment mot grävrapport
       s.evidence,
       round(sqrt(COALESCE(s.sigma_rmse,0)^2 + COALESCE(s.sigma_linje,0)^2
               + COALESCE(s.sigma_tolkning,0)^2)::numeric, 1),
       false,
       public.ST_Multi(public.ST_MakeValid(s.geom))
FROM private.kalmar_mur_staging s;
```

Ersätt sedan de preliminära raderna (`name LIKE '%preliminär%'` respektive port-punkterna)
och sätt `published=true` på de granskade georefererade segmenten.

## 6. Georefereringen är en källa
Lägg in den som `fort_source`-rad (`source_type='sekundarlitteratur'`) med `transform_type,
gcp_count, rmse_m` i citatet och checka in GCP-filen (`gcp/kalmar_1650_tps.points`) i repot.
Utan det är digitaliseringen inte reproducerbar — vilket var hela poängen.

## 7. QA mot KMR (valfritt nästa steg)
Ladda RAÄ:s stadslager-polygon (KMR) och lägg matvyn `private.qa_mur_vs_kmr`
(ST_Distance / ST_HausdorffDistance / andel_inom). **Matvyn måste ligga i `private`** — RLS
gäller inte matvyer och PostgREST exponerar allt i `public`. Använd som avvikelselarm, aldrig
för att justera in geometrin (KMR-polygonen är förvaltningsavgränsning, inte uppmätt murlinje).
