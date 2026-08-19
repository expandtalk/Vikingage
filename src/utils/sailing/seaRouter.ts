// SEGEL-AI — Fas 1: kostnadsbaserad ruttmotor för historisk sjöfart.
// Ren modul (ingen I/O) som seglar VATTEN-BARA mellan waypoints med A* över ett rutnät.
// Kärnan är skrov-/vind-kostnadsmodellen; land/vatten och djup INJICERAS (isWater/depthM) så att
// samma motor kan drivas av vilken kustlinje-/batymetrikälla som helst (Fas 2 kopplar OSM water +
// batymetri + paleo-kust). Rutten är en MODELL/hypotes — inte den historiska leden.
//
// Källkritik: skrov-polarerna är MODELLERADE intervall ur experimentell arkeologi (Roskilde-
// rekonstruktioner, Oseberg/Gokstad) — inga påhittade exakta tal. Vind ur SMHI-klimatologi.

export type VesselMode = 'forntidsbat' | 'vikingaskepp' | 'kogg';

export interface VesselProfile {
  mode: VesselMode;
  label: string;
  rowKnots: number | null;      // roddfart (null = kan ej ros, t.ex. kogg)
  minDepthM: number;            // minsta segelbara djup (draft-spärr)
  canPortage: boolean;          // kan dras över ed/drag (grund + lätt)
  // Polardiagram: fart (knop) som funktion av vindvinkel mot kursen (0=rakt emot, 180=läns).
  // Modellerad, ej mätt exakt. Råsegel → mycket dålig kryss, bäst i läns/halvvind.
  sailKnots: (windAngleDeg: number, windKnots: number) => number;
}

// Råsegel-polar (fyrkantssegel): ~0 uppför vind (<50°), stiger till max i halvvind/läns.
const squareSailPolar = (base: number) => (angle: number, wind: number): number => {
  const a = Math.min(180, Math.abs(((angle % 360) + 360) % 360 > 180 ? 360 - (angle % 360) : angle % 360));
  if (a < 50) return 0;                         // kryssar inte — måste slå eller ta åror
  const f = a < 90 ? (a - 50) / 40 * 0.6        // bidevind → halvvind: 0..0.6
          : a < 135 ? 0.6 + (a - 90) / 45 * 0.4 // halvvind → nära läns: 0.6..1.0
          : 1.0;                                // läns
  const windFactor = Math.max(0.2, Math.min(1.3, wind / 12)); // svag vind → mindre fart
  return base * f * windFactor;
};

export const VESSEL_PROFILES: Record<VesselMode, VesselProfile> = {
  // För-köl: endast rodd, mycket grund, lätt att dra. Vind irrelevant för framdrift (men se exponering).
  forntidsbat: { mode: 'forntidsbat', label: 'Forntidsbåt (rodd, för-köl)', rowKnots: 2.5, minDepthM: 0.3, canPortage: true, sailKnots: () => 0 },
  // Köl + råsegel + åror: seglar med vind, ROR uppför/stiltje, grund → nästan överallt, kan DRAS över ed.
  vikingaskepp: { mode: 'vikingaskepp', label: 'Vikingaskepp (köl, råsegel + åror)', rowKnots: 3, minDepthM: 0.8, canPortage: true, sailKnots: squareSailPolar(9) },
  // Hansakogg: djupt → låst till djupa leder, kan EJ dras, seglar bara (stiltje = stopp).
  kogg: { mode: 'kogg', label: 'Kogg (Hansa, djup, seglar)', rowKnots: null, minDepthM: 2.5, canPortage: false, sailKnots: squareSailPolar(7) },
};

export interface LatLng { lat: number; lng: number }
export interface WindField { dirFromDeg: number; knots: number }  // förhärskande vind (varifrån), ur roserna

// Effektiv fart (knop) för ett skrov längs en kurs givet vind. Seglar när det lönar sig, annars ror.
export function effectiveSpeedKnots(v: VesselProfile, courseDeg: number, wind: WindField): number {
  // Vindvinkel mot kursen: 0 = rakt emot (seglar man MOT den riktning vinden kommer från).
  const rel = Math.abs((((wind.dirFromDeg - courseDeg) % 360) + 540) % 360 - 180); // 0=emot,180=läns
  const sail = v.sailKnots(rel, wind.knots);
  const row = v.rowKnots ?? 0;
  return Math.max(sail, row > 0 ? row : 0.0001);  // kogg utan vind ≈ stopp (litet ε)
}

export function bearingDeg(a: LatLng, b: LatLng): number {
  const φ1 = a.lat * Math.PI / 180, φ2 = b.lat * Math.PI / 180, Δλ = (b.lng - a.lng) * Math.PI / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface RouteEnv {
  isWater: (p: LatLng) => boolean;               // land/vatten-mask (INJICERAS — OSM water i Fas 2)
  depthM?: (p: LatLng) => number;                // batymetri (Fas 2); saknas → draft ignoreras
  windAt?: (p: LatLng) => WindField;             // vind per farvatten ur SMHI-roserna
  portagePoints?: LatLng[];                      // kända ed/drag (crossing_points) — tillåtna land-hopp
}
export interface RouteResult {
  ok: boolean;
  path: LatLng[];                                // vatten-följande väg (tom om ingen)
  hours: number;                                 // modellerad restid
  reason?: string;                               // varför den misslyckades (felflagga)
}

// A* mellan två waypoints över ett lat/lng-rutnät (stegupplösning stepKm). Kant tillåten om målcellen
// är vatten med tillräckligt djup — annars bara om det är en känd portage OCH skrovet kan dras.
export function routeBetween(
  from: LatLng, to: LatLng, v: VesselProfile, env: RouteEnv, stepKm = 2, maxNodes = 200000,
): RouteResult {
  const latStep = stepKm / 111;
  const lngStep = (p: number) => stepKm / (111 * Math.cos(p * Math.PI / 180));
  const key = (p: LatLng) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
  const passable = (p: LatLng): boolean => {
    if (!env.isWater(p)) {
      return !!(v.canPortage && env.portagePoints?.some((q) => haversineKm(p, q) < stepKm));
    }
    if (env.depthM && env.depthM(p) < v.minDepthM) return false; // för grunt för skrovet
    return true;
  };
  const stepHours = (a: LatLng, b: LatLng): number => {
    const wind = env.windAt?.(b) ?? { dirFromDeg: 0, knots: 0 };
    const spd = effectiveSpeedKnots(v, bearingDeg(a, b), wind);           // knop
    const nm = haversineKm(a, b) / 1.852;
    let h = nm / Math.max(0.05, spd);
    if (!env.isWater(b)) h += 3;                                          // portage-straff (dra över land)
    return h;
  };
  // Dijkstra/A* (heuristik = restid vid toppfart, luftlinje).
  const bestSpeed = Math.max(v.rowKnots ?? 0, v.sailKnots(160, 12));
  const heur = (p: LatLng) => (haversineKm(p, to) / 1.852) / Math.max(0.5, bestSpeed);
  const open = new Map<string, { p: LatLng; g: number; f: number }>();
  const came = new Map<string, LatLng>();
  const gScore = new Map<string, number>();
  const start = { lat: from.lat, lng: from.lng };
  open.set(key(start), { p: start, g: 0, f: heur(start) });
  gScore.set(key(start), 0);
  let nodes = 0;
  while (open.size) {
    let cur: { p: LatLng; g: number; f: number } | null = null, curKey = '';
    for (const [k, n] of open) if (!cur || n.f < cur.f) { cur = n; curKey = k; }
    if (!cur) break;
    if (haversineKm(cur.p, to) < stepKm) {
      const path: LatLng[] = [to]; let k = curKey; let node: LatLng | undefined = cur.p;
      while (node) { path.unshift(node); const pk = came.get(k); if (!pk) break; k = key(pk); node = pk; }
      return { ok: true, path, hours: cur.g + stepHours(cur.p, to) };
    }
    open.delete(curKey);
    if (++nodes > maxNodes) return { ok: false, path: [], hours: 0, reason: 'sökrymden slut (för långt/oåtkomligt)' };
    const ls = lngStep(cur.p.lat);
    for (const [dLat, dLng] of [[latStep,0],[-latStep,0],[0,ls],[0,-ls],[latStep,ls],[latStep,-ls],[-latStep,ls],[-latStep,-ls]]) {
      const nb = { lat: cur.p.lat + dLat, lng: cur.p.lng + dLng };
      if (!passable(nb)) continue;
      const tentative = cur.g + stepHours(cur.p, nb);
      const nk = key(nb);
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        came.set(nk, cur.p); gScore.set(nk, tentative);
        open.set(nk, { p: nb, g: tentative, f: tentative + heur(nb) });
      }
    }
  }
  return { ok: false, path: [], hours: 0, reason: 'ingen vatten-väg hittad (waypoint på land / oåtkomlig)' };
}
