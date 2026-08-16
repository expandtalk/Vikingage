#!/usr/bin/env python
"""Generera Terrarium-RGB terräng-tiles (MapLibre raster-dem) ur MHM 1m-DEM.

Cookiefritt/självhostat: tiles laddas upp till public_html/terrain/<namn>/{z}/{x}/{y}.png
och läses av MapLibre som en raster-dem-source med encoding:'terrarium' (samma princip
som övriga statiska kartresurser under public_html/, EJ i git-repot).

Terrarium-kodning: höjd h (m) -> h2=h+32768; R=h2//256, G=h2%256, B=frac*256.
MapLibre avkodar: h = (R*256 + G + B/256) - 32768.

Användning:
  python make-terrain-tiles.py --name gaseborg --bbox 17.78,59.39,17.90,59.45 --minzoom 11 --maxzoom 15
"""
import argparse, os, glob, math, sys
import numpy as np
import rasterio
from rasterio.merge import merge
from rasterio.warp import reproject, Resampling
from rasterio.transform import from_bounds
import mercantile
from PIL import Image

SRC_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'hojd-staging', 'malaren')
TILE = 256

def build_mosaic(bbox):
    """Slå ihop källtiles som skär bbox (WGS84) till en mosaik i källans CRS."""
    from rasterio.warp import transform_bounds
    src_files = []
    for f in glob.glob(os.path.join(SRC_DIR, '*.tif')):
        with rasterio.open(f) as ds:
            wb = transform_bounds(ds.crs, 'EPSG:4326', *ds.bounds)
            if wb[2] < bbox[0] or wb[0] > bbox[2] or wb[3] < bbox[1] or wb[1] > bbox[3]:
                continue
            src_files.append(f)
    if not src_files:
        sys.exit('Inga käll-DEM-tiles skär bbox.')
    datasets = [rasterio.open(f) for f in src_files]
    mosaic, transform = merge(datasets)
    crs = datasets[0].crs
    nodata = datasets[0].nodata
    for d in datasets:
        d.close()
    print(f'  mosaik ur {len(src_files)} käll-tiles, form {mosaic.shape}, CRS {crs}')
    return mosaic[0].astype('float32'), transform, crs, nodata

def encode_terrarium(elev):
    """float32 höjd (m) -> (256,256,3) uint8 Terrarium."""
    e = np.where(np.isfinite(elev), elev, 0.0)  # nodata/NaN -> havsnivå 0
    e2 = e + 32768.0
    r = np.floor(e2 / 256.0)
    g = np.floor(e2 - r * 256.0)
    b = np.floor((e2 - np.floor(e2)) * 256.0)
    rgb = np.stack([r, g, b], axis=-1)
    return np.clip(rgb, 0, 255).astype('uint8')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--name', required=True)
    ap.add_argument('--bbox', required=True, help='minlng,minlat,maxlng,maxlat (WGS84)')
    ap.add_argument('--minzoom', type=int, default=11)
    ap.add_argument('--maxzoom', type=int, default=15)
    ap.add_argument('--out', default=None)
    a = ap.parse_args()
    bbox = tuple(float(x) for x in a.bbox.split(','))
    out_root = a.out or os.path.join(os.path.dirname(__file__), '..', '..', 'terrain-tiles', a.name)

    print(f'Bygger mosaik för {a.name} {bbox} ...')
    mosaic, src_transform, src_crs, src_nodata = build_mosaic(bbox)

    written = 0
    for z in range(a.minzoom, a.maxzoom + 1):
        for t in mercantile.tiles(bbox[0], bbox[1], bbox[2], bbox[3], z):
            b = mercantile.xy_bounds(t)  # EPSG:3857
            dst_transform = from_bounds(b.left, b.bottom, b.right, b.top, TILE, TILE)
            dst = np.full((TILE, TILE), np.nan, dtype='float32')
            reproject(
                source=mosaic, destination=dst,
                src_transform=src_transform, src_crs=src_crs,
                dst_transform=dst_transform, dst_crs='EPSG:3857',
                src_nodata=src_nodata, dst_nodata=np.nan,
                resampling=Resampling.bilinear,
            )
            if not np.isfinite(dst).any():
                continue  # tile utanför DEM -> hoppa (ingen tom PNG)
            rgb = encode_terrarium(dst)
            d = os.path.join(out_root, str(z), str(t.x))
            os.makedirs(d, exist_ok=True)
            Image.fromarray(rgb, 'RGB').save(os.path.join(d, f'{t.y}.png'))
            written += 1
    print(f'Klart: {written} tiles -> {out_root}')
    print(f'Ladda upp {out_root}/  ->  public_html/terrain/{a.name}/  via FTP')

if __name__ == '__main__':
    main()
