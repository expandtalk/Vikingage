// EXPERIMENT — SEGEL-AI Fas 1 (skarpt): rutta VATTEN-vägen mellan Valdemarsledens waypoints.
//
// Vad detta gör:
//   1. Hämtar waypoints ur prod-DB (valdemar_route_points, ordnade på seq).
//   2. Bygger en land/vatten-mask ur en PUBLIK kustlinje (Natural Earth 10m land, GeoJSON) med
//      ren ray-casting point-in-polygon (inga externa geo-libs). isWater = ej inuti någon landpolygon.
//   3. Portar seaRouter.ts kärnlogik till JS (VESSEL_PROFILES + routeBetween, A* över lat/lng-rutnät)
//      och kör den mellan varje par av waypoints med profilen 'vikingaskepp', stepKm=5.
//
// KÄLLKRITIK / ÄRLIGHET (viktigt — ingen gissning):
//   - Natural Earth 10m är GENERALISERAD kustlinje (~1:10 milj). Den duger för öppna sjöstycken men
//     är för GROV för skärgård: smala sund (Baggensstäket, Yxlösundet, Dalarösund), små öar och
//     grund finns helt enkelt inte i geometrin. Där mask+5 km-rutnät inte hittar vatten RAPPORTERAS
//     det som felflagga — vi HITTAR INTE PÅ en rutt.
//   - Vind/djup injiceras INTE i Fas 1 (env.windAt/depthM saknas) → skrovet "ror" i praktiken
//     (rowKnots), restiderna är en NEDRE kalm-vatten-baslinje, inte segeltid med förhärskande vind.
//   - Rutten är en MODELL/hypotes, inte den historiska leden.
//
// Enda avvikelsen mot TS-originalet är att open-set använder en binär min-heap (samma A*-resultat,
// men snabbt nog för öppet vatten) i stället för linjär min-sökning.

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const COAST_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson';
const COAST_CACHE = path.join(__dir, '.cache-ne_10m_land.geojson');

// ---------- 1. Waypoints ur prod-DB ----------
const dotenv = Object.fromEntries(
  fs.readFileSync(path.join(__dir, '..', '..', '.env'), 'utf8')
    .split('\n').filter((l) => l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
  user: 'postgres.mnuifmcjspeaauzehasj', password: dotenv.SUPABASE_DB_PASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false },
});
await client.connect();
const pts = (await client.query(
  `select seq, name, lat::float8 lat, lng::float8 lng from valdemar_route_points
   where lat is not null and lng is not null order by seq asc nulls last`,
)).rows;
await client.end();
console.log(`Waypoints: ${pts.length}`);

// Arbets-bbox (waypoints + marginal) för att bara behålla relevanta landpolygoner.
let minLat = 99, maxLat = -99, minLng = 99, maxLng = -99;
for (const p of pts) { minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat); minLng = Math.min(minLng, p.lng); maxLng = Math.max(maxLng, p.lng); }
const PAD = 0.6;
const WB = { minLat: minLat - PAD, maxLat: maxLat + PAD, minLng: minLng - PAD, maxLng: maxLng + PAD };

// ---------- 2. Kustlinje → land/vatten-mask ----------
async function loadCoast() {
  if (!fs.existsSync(COAST_CACHE)) {
    console.log('Hämtar kustlinje (Natural Earth 10m land)…');
    const res = await fetch(COAST_URL);
    if (!res.ok) throw new Error(`Kustlinje-nedladdning misslyckades: HTTP ${res.status}`);
    fs.writeFileSync(COAST_CACHE, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(COAST_CACHE, 'utf8'));
}
const overlaps = (bb) => !(bb.maxLng < WB.minLng || bb.minLng > WB.maxLng || bb.maxLat < WB.minLat || bb.minLat > WB.maxLat);
function ringBbox(ring) {
  let a = 99, b = -99, c = 199, d = -199;
  for (const [lng, lat] of ring) { a = Math.min(a, lat); b = Math.max(b, lat); c = Math.min(c, lng); d = Math.max(d, lng); }
  return { minLat: a, maxLat: b, minLng: c, maxLng: d };
}
// Sutherland–Hodgman: klipp en ring mot arbets-rektangeln. Landmassorna (t.ex. Eurasien) har jättelika
// ringar (100 000-tals punkter) → klippning ner till lokala kustsegment gör point-in-polygon snabbt
// OCH korrekt (punkt inuti klippt ring ⇔ inuti original ∩ rektangel, för punkter i rektangeln).
function clipToBox(ring, box) {
  const edges = [
    { in: (p) => p[0] >= box.minLng, x: (a, b) => interp(a, b, box.minLng, 0) },
    { in: (p) => p[0] <= box.maxLng, x: (a, b) => interp(a, b, box.maxLng, 0) },
    { in: (p) => p[1] >= box.minLat, x: (a, b) => interp(a, b, box.minLat, 1) },
    { in: (p) => p[1] <= box.maxLat, x: (a, b) => interp(a, b, box.maxLat, 1) },
  ];
  function interp(a, b, val, axis) {
    const t = (val - a[axis]) / (b[axis] - a[axis]);
    return axis === 0 ? [val, a[1] + t * (b[1] - a[1])] : [a[0] + t * (b[0] - a[0]), val];
  }
  let out = ring;
  for (const e of edges) {
    if (out.length === 0) break;
    const next = [];
    for (let i = 0; i < out.length; i++) {
      const cur = out[i], prev = out[(i + out.length - 1) % out.length];
      const curIn = e.in(cur), prevIn = e.in(prev);
      if (curIn) { if (!prevIn) next.push(e.x(prev, cur)); next.push(cur); }
      else if (prevIn) next.push(e.x(prev, cur));
    }
    out = next;
  }
  return out;
}

// Land-polygoner (ring-nivå), klippta till arbets-bbox: {rings:[outer, ...holes], bbox}
const gj = await loadCoast();
const box = { minLng: WB.minLng, maxLng: WB.maxLng, minLat: WB.minLat, maxLat: WB.maxLat };
const polys = [];
let ringCount = 0;
for (const f of gj.features) {
  const g = f.geometry;
  const list = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const poly of list) {
    if (!overlaps(ringBbox(poly[0]))) continue;
    const clipped = poly.map((r) => clipToBox(r, box)).filter((r) => r.length >= 3);
    if (clipped.length === 0 || clipped[0].length < 3) continue; // ytterringen försvann → inget land här
    const rings = clipped.map((r) => ({ coords: r, bbox: ringBbox(r) }));
    polys.push({ rings, bbox: rings[0].bbox });
    ringCount += rings.length;
  }
}
console.log(`Landpolygoner i arbetsområdet (klippta): ${polys.length} (${ringCount} ringar, ${polys.reduce((s, p) => s + p.rings.reduce((t, r) => t + r.coords.length, 0), 0)} punkter)`);

// Ray-casting: punkt inuti en ring (ring = [[lng,lat],...])
function inRing(lat, lng, ring) {
  let inside = false;
  const c = ring.coords;
  for (let i = 0, j = c.length - 1; i < c.length; j = i++) {
    const yi = c[i][1], xi = c[i][0], yj = c[j][1], xj = c[j][0];
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function onLand(lat, lng) {
  for (const poly of polys) {
    const bb = poly.bbox;
    if (lat < bb.minLat || lat > bb.maxLat || lng < bb.minLng || lng > bb.maxLng) continue;
    const rb = poly.rings[0].bbox;
    if (lat < rb.minLat || lat > rb.maxLat || lng < rb.minLng || lng > rb.maxLng) continue;
    if (!inRing(lat, lng, poly.rings[0])) continue;      // ej i ytterring
    let inHole = false;
    for (let h = 1; h < poly.rings.length; h++) {
      const hb = poly.rings[h].bbox;
      if (lat < hb.minLat || lat > hb.maxLat || lng < hb.minLng || lng > hb.maxLng) continue;
      if (inRing(lat, lng, poly.rings[h])) { inHole = true; break; }
    }
    if (!inHole) return true;                            // i ytterring, ej i hål → land
  }
  return false;
}
const isWater = (p) => !onLand(p.lat, p.lng);

// ---------- 3. seaRouter-kärnan (portad från src/utils/sailing/seaRouter.ts) ----------
const squareSailPolar = (base) => (angle, wind) => {
  const a = Math.min(180, Math.abs(((angle % 360) + 360) % 360 > 180 ? 360 - (angle % 360) : angle % 360));
  if (a < 50) return 0;
  const f = a < 90 ? (a - 50) / 40 * 0.6 : a < 135 ? 0.6 + (a - 90) / 45 * 0.4 : 1.0;
  const windFactor = Math.max(0.2, Math.min(1.3, wind / 12));
  return base * f * windFactor;
};
const VESSEL_PROFILES = {
  forntidsbat: { mode: 'forntidsbat', label: 'Forntidsbåt (rodd, för-köl)', rowKnots: 2.5, minDepthM: 0.3, canPortage: true, sailKnots: () => 0 },
  vikingaskepp: { mode: 'vikingaskepp', label: 'Vikingaskepp (köl, råsegel + åror)', rowKnots: 3, minDepthM: 0.8, canPortage: true, sailKnots: squareSailPolar(9) },
  kogg: { mode: 'kogg', label: 'Kogg (Hansa, djup, seglar)', rowKnots: null, minDepthM: 2.5, canPortage: false, sailKnots: squareSailPolar(7) },
};
function bearingDeg(a, b) {
  const φ1 = a.lat * Math.PI / 180, φ2 = b.lat * Math.PI / 180, Δλ = (b.lng - a.lng) * Math.PI / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
function haversineKm(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function effectiveSpeedKnots(v, courseDeg, wind) {
  const rel = Math.abs((((wind.dirFromDeg - courseDeg) % 360) + 540) % 360 - 180);
  const sail = v.sailKnots(rel, wind.knots);
  const row = v.rowKnots ?? 0;
  return Math.max(sail, row > 0 ? row : 0.0001);
}
// Binär min-heap (perf-fix mot TS-originalets linjära open-scan; A*-resultatet är detsamma).
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(n) { const a = this.a; a.push(n); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p].f <= a[i].f) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a; const top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let s = i; if (l < a.length && a[l].f < a[s].f) s = l; if (r < a.length && a[r].f < a[s].f) s = r; if (s === i) break; [a[s], a[i]] = [a[i], a[s]]; i = s; } } return top; }
}
function routeBetween(from, to, v, env, stepKm = 5, maxNodes = 80000) {
  const latStep = stepKm / 111;
  const lngStep = (p) => stepKm / (111 * Math.cos(p * Math.PI / 180));
  const key = (p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
  const passable = (p) => {
    if (!env.isWater(p)) return !!(v.canPortage && env.portagePoints?.some((q) => haversineKm(p, q) < stepKm));
    if (env.depthM && env.depthM(p) < v.minDepthM) return false;
    return true;
  };
  const stepHours = (a, b) => {
    const wind = env.windAt?.(b) ?? { dirFromDeg: 0, knots: 0 };
    const spd = effectiveSpeedKnots(v, bearingDeg(a, b), wind);
    const nm = haversineKm(a, b) / 1.852;
    let h = nm / Math.max(0.05, spd);
    if (!env.isWater(b)) h += 3;
    return h;
  };
  const bestSpeed = Math.max(v.rowKnots ?? 0, v.sailKnots(160, 12));
  const heur = (p) => (haversineKm(p, to) / 1.852) / Math.max(0.5, bestSpeed);
  const open = new MinHeap();
  const came = new Map();
  const gScore = new Map();
  const start = { lat: from.lat, lng: from.lng };
  open.push({ p: start, g: 0, f: heur(start) });
  gScore.set(key(start), 0);
  let nodes = 0;
  while (open.size) {
    const cur = open.pop();
    const curKey = key(cur.p);
    if (cur.g > (gScore.get(curKey) ?? Infinity)) continue; // förlegad heap-post
    if (haversineKm(cur.p, to) < stepKm) {
      const path = [to]; let node = cur.p; let k = curKey;
      while (node) { path.unshift(node); const pk = came.get(k); if (!pk) break; k = key(pk); node = pk; }
      return { ok: true, path, hours: cur.g + stepHours(cur.p, to), nodes };
    }
    if (++nodes > maxNodes) return { ok: false, path: [], hours: 0, reason: 'sökrymden slut (för långt/oåtkomligt vid denna upplösning)', nodes };
    const ls = lngStep(cur.p.lat);
    for (const [dLat, dLng] of [[latStep, 0], [-latStep, 0], [0, ls], [0, -ls], [latStep, ls], [latStep, -ls], [-latStep, ls], [-latStep, -ls]]) {
      const nb = { lat: cur.p.lat + dLat, lng: cur.p.lng + dLng };
      if (!passable(nb)) continue;
      const tentative = cur.g + stepHours(cur.p, nb);
      const nk = key(nb);
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        came.set(nk, cur.p); gScore.set(nk, tentative);
        open.push({ p: nb, g: tentative, f: tentative + heur(nb) });
      }
    }
  }
  return { ok: false, path: [], hours: 0, reason: 'ingen vatten-väg hittad (waypoint på land / instängd vid denna upplösning)', nodes };
}

// ---------- 4. Kör mellan varje par ----------
const vessel = VESSEL_PROFILES.vikingaskepp;
const env = { isWater }; // Fas 1: ingen djup/vind/portage injicerad
const STEP = 5;

// Diagnostik: vilka waypoints faller på land i masken?
const wpOnLand = pts.filter((p) => onLand(p.lat, p.lng));

console.log(`\nProfil: ${vessel.label} · stepKm=${STEP} · mask=Natural Earth 10m land`);
console.log(`Waypoints som masken klassar som LAND: ${wpOnLand.length}`);
for (const p of wpOnLand) console.log(`   • seq ${p.seq} ${p.name} (${p.lat.toFixed(4)},${p.lng.toFixed(4)})`);

console.log('\n===== SEGMENT =====');
const results = [];
for (let i = 0; i < pts.length - 1; i++) {
  const a = pts[i], b = pts[i + 1];
  const dKm = haversineKm(a, b);
  const t0 = Date.now();
  const r = routeBetween({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }, vessel, env, STEP);
  const ms = Date.now() - t0;
  results.push({ a, b, dKm, r, ms });
  const tag = r.ok ? `OK  ${(r.hours).toFixed(1)} h · ${r.path.length} noder i väg` : `FLAGG (${r.reason})`;
  console.log(`${String(a.seq).padStart(2)}→${String(b.seq).padStart(2)} ${(a.name || '?').slice(0, 22).padEnd(22)}→ ${(b.name || '?').slice(0, 22).padEnd(22)} | ${dKm.toFixed(0).padStart(4)} km luft | ${tag} [${r.nodes}n ${ms}ms]`);
}

const ok = results.filter((x) => x.r.ok);
const bad = results.filter((x) => !x.r.ok);
console.log('\n===== SAMMANFATTNING =====');
console.log(`Segment totalt: ${results.length}`);
console.log(`Vatten-väg hittad: ${ok.length}`);
console.log(`Flaggade (ingen vatten-väg vid denna upplösning): ${bad.length}`);
if (ok.length) {
  const tot = ok.reduce((s, x) => s + x.r.hours, 0);
  console.log(`Summa modellerad restid (kalm/rodd-baslinje) för ${ok.length} ruttbara segment: ${tot.toFixed(1)} h (${(tot / 24).toFixed(1)} dygn)`);
}
if (bad.length) {
  console.log('\nFlaggade segment (RAPPORTERAS — ingen rutt påhittad):');
  for (const x of bad) console.log(`   • ${x.a.seq}→${x.b.seq} ${x.a.name}→${x.b.name}: ${x.r.reason}`);
}
console.log('\n(Experiment/rapport endast — inga DB- eller filändringar.)');
