#!/usr/bin/env python
"""Härled paleo-strandlinjer ur Lantmäteris Markhöjdmodell 1 m (MHM, bar-jord, RH2000).

Bättre än SGU (grov/statisk) och Copernicus (DSM → träd/hus-bias): MHM är bar jord,
höjdosäkerhet 0,1 m, EPSG:5845 (SWEREF99 TM + RH2000 = riktiga höjder). Tröskla DEM mot
regional relativ havsnivå (RSL, ur projektets paleo_rsl) per år → land/hav → strandlinje-polygon.

Bevisat 2026-08-15 på 4 tiles (Färjestaden): RSL +0,5/+1,26/+2,0 m ger 14,6/15,2/15,6 km² hav
(havet växer bakåt i tiden = landhöjning). Kräver: rasterio, shapely, numpy (installerade).
GDAL CLI behövs EJ — rasterio bär GDAL internt.

Kör:  python scripts/data/derive-shoreline-mhm.py --tiles <dir> --year 950 --rsl 1.26 --out shoreline_950.geojson
      (flera år: upprepa; RSL per år tas normalt ur paleo_rsl för regionen — anges här explicit för spårbarhet)
"""
import argparse, glob, json, sys
import numpy as np
import rasterio
from rasterio.merge import merge
from rasterio.features import shapes
from rasterio.warp import transform_geom
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tiles', required=True, help='katalog med MHM .tif (EPSG:5845)')
    ap.add_argument('--year', type=int, required=True)
    ap.add_argument('--rsl', type=float, required=True, help='relativ havsnivå (m RH2000) för året')
    ap.add_argument('--simplify', type=float, default=5.0, help='förenkling i meter (SWEREF99 TM)')
    ap.add_argument('--min-area-m2', type=float, default=10000.0, help='minsta havspolygon (m²) att behålla')
    ap.add_argument('--downsample-m', type=float, default=None,
                    help='nedsampla mosaiken till denna cellstorlek (m) med medelvärde — krävs för stora AOI '
                         '(hela Öland i 1 m = ~13 GB i minnet). 10 m räcker gott för strandlinje på kartskala.')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()

    tifs = sorted(glob.glob(f'{a.tiles}/*.tif'))
    if not tifs:
        sys.exit(f'inga .tif i {a.tiles}')
    srcs = [rasterio.open(t) for t in tifs]
    # Nedsampling (valfritt): res + Resampling.average → utjämnad DEM som ryms i minnet.
    if a.downsample_m:
        from rasterio.enums import Resampling
        mos, tf = merge(srcs, res=(a.downsample_m, a.downsample_m), resampling=Resampling.average)
    else:
        mos, tf = merge(srcs)
    dem = mos[0].astype('float32')
    nod = srcs[0].nodata
    src_crs = srcs[0].crs

    # hav = giltig cell under RSL
    sea = (dem != nod) & (dem < a.rsl)
    # vektorisera hav, förenkla, filtrera bort skräp, reprojicera 5845→4326
    polys = []
    for geom, val in shapes(sea.astype('uint8'), mask=sea, transform=tf):
        if val != 1:
            continue
        g = shape(geom)
        if g.area < a.min_area_m2:
            continue
        polys.append(g.simplify(a.simplify))
    sea_geom = unary_union(polys)
    gj = transform_geom(src_crs.to_string(), 'EPSG:4326', mapping(sea_geom))

    feat = {'type': 'Feature',
            'properties': {'model_version': 'mhm_lantmateri', 'year': a.year, 'rsl_m': a.rsl,
                           'source': 'Lantmäteriet Markhöjdmodell 1 m (bar jord, RH2000, EPSG:5845); RSL ur paleo_rsl'},
            'geometry': gj}
    with open(a.out, 'w', encoding='utf-8') as f:
        json.dump({'type': 'FeatureCollection', 'features': [feat]}, f)
    print(f'ar {a.year} RSL +{a.rsl} m: {len(polys)} havspolygoner -> {a.out}')

if __name__ == '__main__':
    main()
