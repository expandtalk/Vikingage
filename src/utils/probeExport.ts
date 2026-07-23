import type { Probe, ProbeShape, ProbeResult } from '@/hooks/useProximityProbe';
import { probeShapeLatLngs } from './probeGeometry';

// Serialiserar ett sond-resultat till GeoJSON (formens polygon + punkterna inuti,
// öppnas direkt i QGIS) och CSV (objektlistan för kalkylark). Rena funktioner —
// UI:t (ProximityControl) sköter nedladdningen.
type Row = { layer: string; name: string; type: string; lat: number; lng: number };

const rowsFromResult = (result: ProbeResult | null): Row[] => {
  if (!result) return [];
  const out: Row[] = [];
  (result.place_names ?? []).forEach((r) => out.push({ layer: 'ortnamn', name: r.name, type: r.category ?? '', lat: r.lat, lng: r.lng }));
  (result.kulturlager ?? []).forEach((r) => out.push({ layer: 'kulturlager', name: r.name, type: r.type ?? '', lat: r.lat, lng: r.lng }));
  (result.runestones ?? []).forEach((r) => out.push({ layer: 'runsten', name: r.signum, type: 'runsten', lat: r.lat, lng: r.lng }));
  (result.fortresses ?? []).forEach((r) => out.push({ layer: 'fornborg', name: r.name, type: r.type ?? '', lat: r.lat, lng: r.lng }));
  return out.filter((r) => r.lat != null && r.lng != null);
};

export const probeToGeoJSON = (probe: Probe, shape: ProbeShape, radiusKm: number, result: ProbeResult | null): string => {
  const ring = probeShapeLatLngs(probe.lat, probe.lng, radiusKm, shape).map(([la, ln]) => [ln, la]);
  if (ring.length) ring.push(ring[0]); // slut ringen (GeoJSON kräver stängd polygon)
  const features: unknown[] = [{
    type: 'Feature',
    properties: { kind: 'probe-area', label: probe.label, shape, radius_km: radiusKm, diameter_km: radiusKm * 2 },
    geometry: { type: 'Polygon', coordinates: [ring] },
  }];
  rowsFromResult(result).forEach((r) => features.push({
    type: 'Feature',
    properties: { layer: r.layer, name: r.name, type: r.type },
    geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
  }));
  return JSON.stringify({ type: 'FeatureCollection', features }, null, 2);
};

const csvCell = (v: unknown) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const probeToCSV = (result: ProbeResult | null): string => {
  const rows = rowsFromResult(result);
  const head = ['layer', 'name', 'type', 'lat', 'lng'];
  return [head.join(','), ...rows.map((r) => [r.layer, r.name, r.type, r.lat, r.lng].map(csvCell).join(','))].join('\n');
};
