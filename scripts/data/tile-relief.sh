#!/usr/bin/env bash
# Genererar HILLSHADE-tiles ur höjddata (DEM, t.ex. Lantmäteriets Höjddata Grid 50+/2+)
# till XYZ-tiles för Leaflet-relieflagret → public_html/map/tiles/relief/{z}/{x}/{y}.png.
#
# Reliefen visar de fysiska strandvallarna/de forna vattenfårorna (Höga kustens raised beaches,
# Långhundraledens dal) som SGU:s grova strandlinjemask inte gör. Matchar historicalMapLayers.ts
# 'histmap_relief' (maxNativeZoom 15, minZoom 5).
#
# Kräver GDAL (gdaldem, gdalbuildvrt, gdalwarp, gdal2tiles.py) — OSGeo4W/QGIS/conda.
# Körs DÄR höjddata + GDAL finns (din maskin eller servern) — Claude når inte FTP-filerna.
#
# Användning:
#   ./tile-relief.sh <SRC_DIR med DEM .tif> <OUT_TILES_DIR> [MINZOOM=5] [MAXZOOM=15] [SRC_EPSG=3006]
# Ex:
#   ./tile-relief.sh ./hojddata_grid50 ./tiles/relief 5 15 3006
#   # ladda sedan upp ./tiles/relief/ → public_html/map/tiles/relief/ via FTP
set -euo pipefail

SRC="${1:?ange källkatalog med DEM .tif}"
OUT="${2:?ange output-tiles-katalog (t.ex. ./tiles/relief)}"
MINZ="${3:-5}"
MAXZ="${4:-15}"
SRC_EPSG="${5:-3006}"     # Höjddata Grid = SWEREF99 TM (EPSG:3006). RT90 = 3021. Justera vid behov.
SRS_WEB="EPSG:3857"        # Web Mercator (Leaflet)
WORK="$(mktemp -d)"

command -v gdaldem >/dev/null || { echo "GDAL saknas (gdaldem). Installera OSGeo4W/QGIS/conda-gdal."; exit 1; }

shopt -s nullglob nocaseglob
tifs=("$SRC"/*.tif)
[ "${#tifs[@]}" -gt 0 ] || { echo "Inga .tif i $SRC"; exit 1; }
echo "==> ${#tifs[@]} DEM-blad. Bygger mosaik (VRT)"
gdalbuildvrt "$WORK/dem.vrt" "${tifs[@]}"

echo "==> Omprojicerar DEM $SRC_EPSG -> $SRS_WEB"
gdalwarp -q -s_srs "EPSG:$SRC_EPSG" -t_srs "$SRS_WEB" -r bilinear -co TILED=YES \
         "$WORK/dem.vrt" "$WORK/dem_web.tif"

echo "==> Beräknar multidirektionell hillshade (framhäver strandvallar/terrasser)"
# -multidirectional ger jämnare relief än enkel ljuskälla; -z överdriver höjden något för synlighet.
gdaldem hillshade -multidirectional -z 1.3 -compute_edges "$WORK/dem_web.tif" "$WORK/hillshade.tif"

echo "==> Genererar XYZ-tiles (z$MINZ-$MAXZ) -> $OUT"
# -w none = ingen viewer-HTML; XYZ-schema (samma som Leaflet {z}/{x}/{y}).
gdal2tiles.py --xyz -z "$MINZ-$MAXZ" -w none -r bilinear "$WORK/hillshade.tif" "$OUT"

rm -rf "$WORK"
echo "==> KLART. Ladda upp $OUT/ → public_html/map/tiles/relief/ via FTP."
echo "    (Valfritt: kombinera med färgrelief via 'gdaldem color-relief' + hsv-merge för färglagd terräng.)"
