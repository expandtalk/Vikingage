import type { ProbeShape } from '@/hooks/useProximityProbe';

// Delad geometri för räckvidds-sondens form → polygon-ring som [lat, lng]-par.
// Lokal ekvirektangulär approximation (exakt nog på dessa avstånd, tiotal km).
// Cirkel approximeras som 64-hörning (för export/GeoJSON). Samma formel som
// kartlagret ritar med, så bild och export stämmer.
export const probeShapeLatLngs = (
  lat: number,
  lng: number,
  radiusKm: number,
  shape: ProbeShape,
): [number, number][] => {
  const n = shape === 'square' ? 4 : shape === 'hexagon' ? 6 : 64;
  const rotDeg = shape === 'square' ? 45 : 0;
  const latR = radiusKm / 111.32;
  const lngR = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = ((rotDeg + (i * 360) / n) * Math.PI) / 180;
    out.push([lat + latR * Math.cos(a), lng + lngR * Math.sin(a)]);
  }
  return out;
};
