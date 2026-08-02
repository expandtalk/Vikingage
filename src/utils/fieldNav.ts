// src/utils/fieldNav.ts
// Ren logik för fältlägets riktningspil (steg 1: bil/vägföljning).
// Inga sidoeffekter — ingen Leaflet, DOM eller geolocation här, så allt kan enhetstestas.

export type HeadingSource = 'gps' | 'compass' | null;

export interface HeadingInputs {
  gpsHeading: number | null;     // coords.heading — grader medurs från norr; null när man står still
  gpsSpeed: number | null;       // coords.speed — m/s; null om otillgängligt
  compassHeading: number | null; // enhetens kompass — grader medurs från norr; null om otillgänglig
}

export interface ResolvedHeading { deg: number | null; source: HeadingSource; }

// Minsta hastighet (m/s) för att lita på GPS-kursen. Under detta är coords.heading brus/null.
export const GPS_HEADING_MIN_SPEED = 0.5; // ~1,8 km/h

// Normalisera valfri grad till [0, 360).
export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// GPS-kurs primär när man rör sig; kompass som fallback när man står still; annars null.
// (Bil-smaken lutar i praktiken helt på GPS-kursen; kompassen behövs främst till fots.)
export function resolveHeading({ gpsHeading, gpsSpeed, compassHeading }: HeadingInputs): ResolvedHeading {
  if (gpsHeading != null && Number.isFinite(gpsHeading) && (gpsSpeed ?? 0) >= GPS_HEADING_MIN_SPEED) {
    return { deg: normalizeDeg(gpsHeading), source: 'gps' };
  }
  if (compassHeading != null && Number.isFinite(compassHeading)) {
    return { deg: normalizeDeg(compassHeading), source: 'compass' };
  }
  return { deg: null, source: null };
}

// Kartan är norr-upp och SVG-käglan ritas pekande UPP (mot norr). Rotera medurs = kurs medurs
// från norr → samma tal. null (ingen riktning) → 0 (käglan döljs av useMapFieldNav).
export function coneRotationDeg(headingDeg: number | null): number {
  return headingDeg == null ? 0 : normalizeDeg(headingDeg);
}
