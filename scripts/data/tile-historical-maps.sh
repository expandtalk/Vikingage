#!/usr/bin/env bash
# Fas 1: tile:a historiska kartblad (Ekonomiska/Generalstabs/Häradsekonomiska)
# till XYZ-tiles för Leaflet-overlay.
#
# Källblad: .tif + .tfw (world file) + .TAB (MapInfo). CRS = EPSG:3021 (RT90 2.5 gon V).
# Kräver GDAL (gdal_translate, gdalwarp, gdalbuildvrt, gdal2tiles.py) — OSGeo4W/QGIS/conda.
# Körs DÄR bladen + GDAL finns (din maskin eller servern) — Claude når inte FTP-filerna.
#
# Användning:
#   ./tile-historical-maps.sh <SRC_DIR med .tif+.tfw> <OUT_TILES_DIR> [MINZOOM] [MAXZOOM]
# Ex:
#   ./tile-historical-maps.sh ./Ekonomiska_kartan/10a ./tiles/ekonomiska 8 16
set -euo pipefail

SRC="${1:?ange källkatalog med .tif-blad}"
OUT="${2:?ange output-tiles-katalog}"
MINZ="${3:-8}"
MAXZ="${4:-16}"
SRS_SRC="EPSG:3021"     # RT90 2.5 gon V (ur .TAB CoordSys)
SRS_WEB="EPSG:3857"     # Web Mercator (Leaflet)
WORK="$(mktemp -d)"

echo "==> Omprojicerar blad $SRS_SRC -> $SRS_WEB (med alpha så bladkanter blir genomskinliga)"
shopt -s nullglob nocaseglob
n=0
for tif in "$SRC"/*.tif; do
  base="$(basename "${tif%.*}")"
  # gdal läser .tfw automatiskt; -a_srs sätter CRS som saknas i själva TIFF:en
  gdal_translate -q -a_srs "$SRS_SRC" "$tif" "$WORK/${base}_src.tif"
  gdalwarp -q -s_srs "$SRS_SRC" -t_srs "$SRS_WEB" -r bilinear -dstalpha \
           -co TILED=YES "$WORK/${base}_src.tif" "$WORK/${base}_web.tif"
  n=$((n+1))
done
echo "==> $n blad omprojicerade"
[ "$n" -gt 0 ] || { echo "Inga .tif i $SRC"; exit 1; }

echo "==> Bygger sömlös mosaik (VRT)"
gdalbuildvrt "$WORK/mosaic.vrt" "$WORK"/*_web.tif

echo "==> Genererar XYZ-tiles (z$MINZ-$MAXZ) -> $OUT"
mkdir -p "$OUT"
# --xyz = Google/OSM-schema (Leaflet default). Utan den blir det TMS (y flippad).
gdal2tiles.py --xyz -z "$MINZ-$MAXZ" -w none --processes=4 "$WORK/mosaic.vrt" "$OUT"

echo "==> Klart. Ladda upp $OUT till public_html/map/tiles/<lager>/ och peka Leaflet dit:"
echo "    L.tileLayer('https://vikingage.se/map/tiles/<lager>/{z}/{x}/{y}.png', { maxZoom: $MAXZ, opacity: 0.7 })"
rm -rf "$WORK"
