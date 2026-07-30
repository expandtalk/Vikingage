#!/usr/bin/env python3
"""
DEM-härledd paleo-strandlinje (finupplöst) för en region — komplement till SGU:s grova
strandförskjutningsraster där det ser kantigt/statiskt ut (t.ex. Kalmar).

Metod (ingen fabricering — allt ur öppna, citérbara källor + projektets egen RSL-modell):
  * Höjd: Copernicus DEM GLO-30 (© ESA, fri/CC-BY), ~30 m, EPSG:4326, orthometrisk (EGM2008).
  * Relativ havsnivå per år: projektets paleo_rsl() (kalibrerad mot strandkontroll; för Kalmar
    kontrollpunkt "Kalmar fastl.", 1,2 mm/år, konfidens hög). RSL_höjd(år) matas in via --rsl.
  * En cell var VATTEN år Y om dagens höjd < RSL_höjd(Y). Hav = vatten anslutet till kartkanten
    (öppet hav); Sjö = inneslutet vatten. Öar (höjd > tröskel inuti vatten) blir hål i polygonen.
  * Kustlinjen Chaikin-utjämnas (tar bort pixel-trappstegen).

VARNINGAR (medvetna, redovisas — inte dolda):
  * Copernicus är en YTMODELL (DSM): hus/träd kan läsas som hög mark inne i stadskärnan.
  * Modern UTFYLLNAD (t.ex. Nya hamnen/Tjärhovsgatan i Kalmar) ligger som land i dagens DEM →
    tröskelmetoden kan INTE återskapa att det var vatten. Kräver historisk karta / utfyllnads-mask.
  * Vertikalt datum: EGM2008 ≠ RH2000 (~decimeter-skillnad i regionen). Inom RSL-osäkerheten.

Kör:
  python scripts/data/derive-shoreline-dem.py --bbox 16.26,56.55,16.44,56.71 \
      --out <dir> --preview --rsl 50:2.34,250:2.10,450:1.86,750:1.50,950:1.26
"""
import argparse, json, os, sys
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from rasterio.features import shapes as rio_shapes
from scipy import ndimage
from scipy.ndimage import gaussian_filter
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

# Copernicus GLO-30 kaklas per 1°×1° på SW-hörnet (t.ex. N56 E016 = 56–57°N, 16–17°E).
# Rätt tile(s) väljs automatiskt ur bboxen; flera tiles mosaikeras.
import math as _math

def _tile_url(la, lo):
    name = f"Copernicus_DSM_COG_10_N{la:02d}_00_E{lo:03d}_00_DEM"
    return f"/vsicurl/https://copernicus-dem-30m.s3.amazonaws.com/{name}/{name}.tif"

def tiles_for_bbox(bbox):
    lng0, lat0, lng1, lat1 = bbox
    urls = []
    for la in range(_math.floor(lat0), _math.floor(lat1 - 1e-9) + 1):
        for lo in range(_math.floor(lng0), _math.floor(lng1 - 1e-9) + 1):
            urls.append(_tile_url(la, lo))
    return urls


def chaikin_ring(coords, iters=2):
    pts = np.asarray(coords, dtype=float)
    if len(pts) < 4:
        return coords
    closed = np.allclose(pts[0], pts[-1])
    p = pts[:-1] if closed else pts
    for _ in range(iters):
        n = len(p)
        if n < 3:
            break
        nxt = np.roll(p, -1, axis=0)
        q = np.empty((2 * n, 2))
        q[0::2] = 0.75 * p + 0.25 * nxt
        q[1::2] = 0.25 * p + 0.75 * nxt
        p = q
    return np.vstack([p, p[0]]) if closed else p


def smooth_polygon(geom, iters=2):
    from shapely.geometry import Polygon, MultiPolygon
    def do(poly):
        ext = chaikin_ring(list(poly.exterior.coords), iters)
        ints = [chaikin_ring(list(r.coords), iters) for r in poly.interiors if len(r.coords) >= 4]
        return Polygon(ext, ints)
    if geom.geom_type == "Polygon":
        out = do(geom)
    else:
        out = MultiPolygon([do(g) for g in geom.geoms])
    return out.buffer(0)  # laga ev. självskärning från utjämningen


def polygonize(mask, transform, min_px, simplify_deg, smooth_iters):
    geoms = [shape(g) for g, v in rio_shapes(mask.astype("uint8"), mask=mask, transform=transform) if v == 1]
    if not geoms:
        return None
    g = unary_union(geoms).buffer(0)
    if simplify_deg:
        g = g.simplify(simplify_deg)
    g = smooth_polygon(g, smooth_iters)
    if g.is_empty:
        return None
    return g


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bbox", required=True, help="lng0,lat0,lng1,lat1")
    ap.add_argument("--rsl", required=True, help="year:rise_m,year:rise_m,... (rise = havet HÖGRE än idag)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--min-lake-px", type=int, default=4)
    ap.add_argument("--simplify-deg", type=float, default=0.00006)  # ~6 m
    ap.add_argument("--smooth-iters", type=int, default=2)
    ap.add_argument("--sigma", type=float, default=0.8, help="gaussian px-utjämning av höjden (dämpar DSM-brus)")
    ap.add_argument("--points", default="", help="verifierade etiketter: 'lng,lat,namn;lng,lat,namn'")
    ap.add_argument("--title", default="Kalmar")
    args = ap.parse_args()

    bbox = tuple(float(x) for x in args.bbox.split(","))
    rsl = {}
    for part in args.rsl.split(","):
        y, r = part.split(":")
        rsl[int(y)] = float(r)
    os.makedirs(args.out, exist_ok=True)

    tiles = tiles_for_bbox(bbox)
    print(f"DEM-tiles: {len(tiles)}")
    dss = [rasterio.open(t) for t in tiles]
    if len(dss) == 1:
        win = from_bounds(*bbox, dss[0].transform)
        elev = dss[0].read(1, window=win).astype("float32")
        tr = dss[0].window_transform(win)
    else:
        from rasterio.merge import merge
        mosaic, tr = merge(dss, bounds=bbox)
        elev = mosaic[0].astype("float32")
    for d in dss:
        d.close()
    H, W = elev.shape
    elev_s = gaussian_filter(elev, sigma=args.sigma) if args.sigma > 0 else elev

    # Validerings-anker: högsta punkten (åskrönet) + dess läge
    mi = np.unravel_index(np.argmax(elev), elev.shape)
    max_lng, max_lat = rasterio.transform.xy(tr, mi[0], mi[1])
    print(f"DEM {W}x{H} px  höjd {elev.min():.1f}..{elev.max():.1f} m  "
          f"| högsta punkt {elev.max():.1f} m @ ({max_lat:.4f},{max_lng:.4f})")

    summary = []
    fc_by_year = {}
    for year in sorted(rsl, reverse=True):
        thr = rsl[year]
        water = elev_s < thr
        lbl, _ = ndimage.label(water)
        border = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
        border.discard(0)
        sea = np.isin(lbl, list(border)) if border else np.zeros_like(water)
        lake = water & ~sea
        # rensa mikro-sjöar (brus)
        ll, ln = ndimage.label(lake)
        if ln:
            sizes = ndimage.sum(np.ones_like(ll), ll, range(1, ln + 1))
            drop = [i + 1 for i, s in enumerate(sizes) if s < args.min_lake_px]
            if drop:
                lake[np.isin(ll, drop)] = False

        feats = []
        for wtype, mask in (("sea", sea), ("lake", lake)):
            g = polygonize(mask, tr, args.min_lake_px, args.simplify_deg, args.smooth_iters)
            if g is None:
                continue
            n_islands = sum(len(p.interiors) for p in (g.geoms if g.geom_type == "MultiPolygon" else [g]))
            feats.append({"type": "Feature",
                          "properties": {"year_ce": year, "water_body_type": wtype, "islands": n_islands},
                          "geometry": mapping(g)})
        fc = {"type": "FeatureCollection", "features": feats}
        fc_by_year[year] = fc
        with open(os.path.join(args.out, f"kalmar_shoreline_{year}.geojson"), "w", encoding="utf-8") as fh:
            json.dump(fc, fh)
        sea_km2 = float((sea.sum()) * cell_km2(tr))
        isl = sum(f["properties"]["islands"] for f in feats)
        summary.append((year, thr, round(sea_km2, 1), int(lake.sum()), isl))

    print("\nÅr | RSL(m) | hav_km2 | sjö_px | öar(hål)")
    for row in summary:
        print(f"{row[0]:>4} | {row[1]:>5} | {row[2]:>7} | {row[3]:>6} | {row[4]:>3}")
    # landhöjnings-signal: hur mycket krymper havet 950→50 (SGU visade <0,3%)
    if 950 in rsl and max(rsl) in rsl:
        a950 = next(r[2] for r in summary if r[0] == 950)
        aold = next(r[2] for r in summary if r[0] == max(rsl))
        if a950:
            print(f"\nHav-areaförändring {max(rsl)}→950: {(aold - a950)/aold*100:.1f}%  (SGU vid Kalmar: <0,3%)")

    pts = []
    for chunk in args.points.split(";"):
        chunk = chunk.strip()
        if chunk:
            a, b, *lab = chunk.split(",")
            pts.append((float(a), float(b), ",".join(lab)))
    if args.preview:
        make_preview(elev, tr, bbox, fc_by_year, (max_lat, max_lng), elev.max(), args.out, pts, args.title)
    print(f"\nKlart → {args.out}")


def cell_km2(tr):
    import math
    dx = abs(tr.a) * 111.32 * math.cos(math.radians(56.6))
    dy = abs(tr.e) * 110.57
    return dx * dy


def make_preview(elev, tr, bbox, fc_by_year, peak, peak_h, out, pts=None, title="Kalmar"):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.colors import LightSource
    lng0, lat0, lng1, lat1 = bbox
    ls = LightSource(azdeg=315, altdeg=45)
    hs = ls.hillshade(elev, vert_exag=8, dx=30, dy=30)
    fig, ax = plt.subplots(figsize=(9, 9), dpi=130)
    # höjdfärg (0–30 m) blandad med hillshade så både relief och absoluta höjder syns
    terr = ax.imshow(np.clip(elev, 0, 30), extent=[lng0, lng1, lat0, lat1], origin="upper",
                     cmap="terrain", vmin=0, vmax=30, alpha=0.55)
    ax.imshow(hs, cmap="gray", extent=[lng0, lng1, lat0, lat1], origin="upper", alpha=0.45)
    cb = fig.colorbar(terr, ax=ax, fraction=0.035, pad=0.02)
    cb.set_label("höjd idag (m ö.h.)", fontsize=8)
    colors = {950: "#1e6fd0", 450: "#d08a1e", 50: "#8a1e8a"}
    for year in sorted(fc_by_year):
        col = colors.get(year, "#444")
        for f in fc_by_year[year]["features"]:
            g = shape(f["geometry"])
            for poly in (g.geoms if g.geom_type == "MultiPolygon" else [g]):
                xs, ys = poly.exterior.xy
                ax.plot(xs, ys, color=col, lw=1.4, label=f"{year} e.Kr." if f is fc_by_year[year]["features"][0] and poly is (g.geoms[0] if g.geom_type=='MultiPolygon' else g) else None)
                for r in poly.interiors:
                    xs, ys = r.xy
                    ax.plot(xs, ys, color=col, lw=0.7, ls=":")
    ax.plot(peak[1], peak[0], "^", color="#c0392b", ms=11, mec="white", label=f"högsta punkt {peak_h:.0f} m")
    for (lng, lat, lab) in (pts or []):
        ax.plot(lng, lat, "o", color="#111", ms=6, mec="white")
        ax.annotate(lab, (lng, lat), textcoords="offset points", xytext=(6, 4),
                    fontsize=8, color="#111", fontweight="bold",
                    path_effects=[__import__("matplotlib.patheffects", fromlist=["withStroke"]).withStroke(linewidth=2, foreground="white")])
    ax.set_xlim(lng0, lng1); ax.set_ylim(lat0, lat1)
    ax.set_title(f"{title} — DEM-härledd strandlinje (Copernicus GLO-30 + projektets RSL)\n"
                 "höjdfärg/hillshade = dagens relief; linjer = havsnivå per år", fontsize=10)
    ax.legend(loc="upper right", fontsize=8)
    ax.set_xlabel("longitud"); ax.set_ylabel("latitud")
    fig.tight_layout()
    p = os.path.join(out, "kalmar_shoreline_preview.png")
    fig.savefig(p); plt.close(fig)
    print(f"förhandsvisning → {p}")


if __name__ == "__main__":
    from shapely.geometry import shape as _s  # noqa
    main()
