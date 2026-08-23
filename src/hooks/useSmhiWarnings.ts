import { useEffect, useState } from 'react';

// Aktiva vädervarningar ur SMHI:s öppna, nyckelfria IBWW-API (impact-based weather warnings).
// Samma nyckelfria mönster som SvampMap (SMHI open data). SMHI utfärdar varningar per
// OMRÅDE/LÄN (samt hav/vattendrag) — inte per enskild kommun — så vi visar per område.
// Källa: https://opendata-download-warnings.smhi.se/ibww/api/version/1/warning.json (CC-BY, SMHI).

export type SmhiLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'MESSAGE';

// En polygon = array av ringar; ring[0] = ytterkontur, ev. följande = hål. Punkter [lng, lat].
type PolyRings = number[][][];

export interface SmhiWarning {
  id: string;
  event: string;        // event.sv (t.ex. "Risk för vattenbrist")
  eventEn: string;
  level: SmhiLevel;     // warningLevel.code
  levelLabel: string;   // warningLevel.sv (t.ex. "Meddelande")
  area: string;         // areaName.sv (t.ex. "Skåne län")
  affected: string[];   // affectedAreas[].sv
  start?: string;
  end?: string;
  description?: string; // descriptions[0].text.sv
  polys: PolyRings[];   // område-geometri (GeoJSON), för point-in-polygon-filtrering
}

// Ray-casting: ligger punkten (lat,lng) inuti ringen? ring = [[lng,lat], …].
function ringContains(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = (yi > lat) !== (yj > lat) &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Täcker varningens område punkten? Ytterkontur måste träffa, hål exkluderar.
export function warningCoversPoint(w: SmhiWarning, lat: number, lng: number): boolean {
  return w.polys.some((poly) => {
    if (!poly.length || !ringContains(lat, lng, poly[0])) return false;
    for (let k = 1; k < poly.length; k++) {
      if (ringContains(lat, lng, poly[k])) return false; // i ett hål
    }
    return true;
  });
}

const URL = 'https://opendata-download-warnings.smhi.se/ibww/api/version/1/warning.json';
const LEVEL_ORDER: Record<SmhiLevel, number> = { RED: 0, ORANGE: 1, YELLOW: 2, MESSAGE: 3 };

let _cache: { at: number; data: SmhiWarning[] } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 min — varningar ändras inte per sekund

export function useSmhiWarnings() {
  const [warnings, setWarnings] = useState<SmhiWarning[] | null>(_cache?.data ?? null);
  const [loading, setLoading] = useState(!_cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (_cache && Date.now() - _cache.at < TTL_MS) {
      setWarnings(_cache.data); setLoading(false); return;
    }
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(URL, { headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const out: SmhiWarning[] = [];
        for (const w of Array.isArray(data) ? data : []) {
          const event = w?.event?.sv ?? w?.event?.code ?? 'Varning';
          const eventEn = w?.event?.en ?? event;
          for (const a of w?.warningAreas ?? []) {
            const level = (a?.warningLevel?.code ?? 'MESSAGE') as SmhiLevel;
            // area = GeoJSON-Feature; geometry är Polygon eller MultiPolygon.
            const geom = a?.area?.geometry;
            let polys: number[][][][] = [];
            if (geom?.type === 'Polygon' && Array.isArray(geom.coordinates)) {
              polys = [geom.coordinates];
            } else if (geom?.type === 'MultiPolygon' && Array.isArray(geom.coordinates)) {
              polys = geom.coordinates;
            }
            out.push({
              id: `${w?.id}-${a?.id}`,
              event, eventEn, level,
              levelLabel: a?.warningLevel?.sv ?? level,
              area: a?.areaName?.sv ?? '',
              affected: (a?.affectedAreas ?? []).map((x: any) => x?.sv).filter(Boolean),
              start: a?.approximateStart,
              end: a?.approximateEnd,
              description: a?.descriptions?.[0]?.text?.sv ?? undefined,
              polys,
            });
          }
        }
        out.sort((x, y) => (LEVEL_ORDER[x.level] - LEVEL_ORDER[y.level]) || x.area.localeCompare(y.area, 'sv'));
        _cache = { at: Date.now(), data: out };
        if (alive) { setWarnings(out); setLoading(false); }
      } catch (e: any) {
        if (alive) { setError(e?.message ?? 'fetch error'); setLoading(false); }
      }
    })();
    return () => { alive = false; };
  }, []);

  return { warnings, loading, error };
}
