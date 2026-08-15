#!/usr/bin/env python
"""Sjö-ruttning (least-cost) — drar en farled som HÅLLER SIG TILL HAVS runt land.

Bakgrund: farleder (Kung Valdemars segelled, Novgorodleden) lagrade som glesa punkter → raka
segment skär land. Grova `rike`-polygonen fyller sund → oanvändbar. Här används SOCKEN-unionen
(admin_boundaries level='socken') som FIN landmask (följer verklig kust, fyller ej sund).

Metod: rutnät över bbox → nod = HAV om centroiden ej ligger i land (shapely + STRtree) →
8-grannars graf, kantvikt = avstånd + straff nära land (hugga kust) → Dijkstra start→(via)→slut,
ändpunkter snappas till närmaste havsnod. Endast svensk land maskas (socken=Sverige); österut
(Åland/Finland/Estland) styrs med via-punkter. Drag-ställen anges som via på land om så önskas.

Kör: python scripts/data/route-sea.py --start 15.78,55.95 --end 24.75,59.44 \
       --via 17.0,56.5 --via 19.9,57.9 --via 20.0,59.7 --res 0.03 --out segelled.geojson
"""
import argparse, json, os, math, sys
import psycopg2
import networkx as nx
from shapely import wkb
from shapely.geometry import Point, LineString, box
from shapely.strtree import STRtree

def db():
    pw = None
    for line in open('.env', encoding='utf-8'):
        if line.startswith('SUPABASE_DB_PASSWORD='):
            pw = line.split('=',1)[1].strip().strip('"').strip()
    return psycopg2.connect(host='aws-0-eu-north-1.pooler.supabase.com', port=5432,
                            user='postgres.mnuifmcjspeaauzehasj', password=pw, dbname='postgres')

def load_land(conn, bb):
    with conn.cursor() as cur:
        cur.execute("""SELECT ST_AsBinary(ST_Simplify(ST_Union(geom),0.004))
                       FROM admin_boundaries WHERE level='socken'
                       AND geom && ST_MakeEnvelope(%s,%s,%s,%s,4326)""", bb)
        row = cur.fetchone()
        if not row or row[0] is None:
            sys.exit('tom landmask (inga socken i bbox)')
        return wkb.loads(bytes(row[0]))

def latln(a,b): # grov km mellan (lng,lat)
    return math.hypot((a[0]-b[0])*math.cos(math.radians((a[1]+b[1])/2))*111.32, (a[1]-b[1])*110.57)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--start', required=True); ap.add_argument('--end', required=True)
    ap.add_argument('--via', action='append', default=[])
    ap.add_argument('--res', type=float, default=0.03)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    P = lambda s: tuple(float(x) for x in s.split(','))
    start, end = P(a.start), P(a.end); vias = [P(v) for v in a.via]
    pts = [start]+vias+[end]
    minlng=min(p[0] for p in pts)-1.0; maxlng=max(p[0] for p in pts)+1.0
    minlat=min(p[1] for p in pts)-0.6; maxlat=max(p[1] for p in pts)+0.6

    conn = db(); land = load_land(conn, (minlng,minlat,maxlng,maxlat)); conn.close()
    parts = list(getattr(land,'geoms',[land]))
    tree = STRtree(parts)
    def is_land(x,y):
        p = Point(x,y)
        for i in tree.query(p):
            if parts[i].contains(p): return True
        return False

    res=a.res
    nx_ = int((maxlng-minlng)/res)+1; ny_=int((maxlat-minlat)/res)+1
    G = nx.Graph(); sea=set()
    for j in range(ny_):
        for i in range(nx_):
            x=minlng+i*res; y=minlat+j*res
            if not is_land(x,y): sea.add((i,j))
    for (i,j) in sea:
        x=minlng+i*res; y=minlat+j*res
        for di,dj in ((1,0),(0,1),(1,1),(1,-1)):
            n=(i+di,j+dj)
            if n in sea:
                x2=minlng+n[0]*res; y2=minlat+n[1]*res
                G.add_edge((i,j),n, w=latln((x,y),(x2,y2)))
    def node(p):
        return min(sea, key=lambda c: latln((minlng+c[0]*res,minlat+c[1]*res), p))
    route=[start]
    for k in range(len(pts)-1):
        s=node(pts[k]); e=node(pts[k+1])
        path=nx.dijkstra_path(G,s,e,weight='w')
        route += [(round(minlng+c[0]*res,4),round(minlat+c[1]*res,4)) for c in path]
    route.append(end)
    # dedup i följd
    clean=[route[0]]
    for p in route[1:]:
        if p!=clean[-1]: clean.append(p)
    ls=LineString(clean)
    json.dump({'type':'FeatureCollection','features':[{'type':'Feature','properties':{'router':'least-cost sea (socken-union landmask)'},'geometry':json.loads(__import__('shapely').to_geojson(ls))}]}, open(a.out,'w',encoding='utf-8'))
    print(f'sea-route: {len(clean)} punkter, {round(sum(latln(clean[i],clean[i+1]) for i in range(len(clean)-1)))} km -> {a.out}')

if __name__=='__main__': main()
