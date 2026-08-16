import { useEffect, useRef, useState, type RefObject } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Ritar dåtida strandlinje (SGU strandförskjutningsmodell, CC-BY) som overlay på en IMPERATIV
// Leaflet-karta (forskningssidorna Öland/Kalmar/Ångermanland). RPC get_paleo_shorelines_nearest
// snappar till närmaste tillgängliga skiva (50–950 e.Kr., samt djuptid −6050…−9650 sedan Task 2).
// Havsytan visas halvtransparent blå. year=null → lagret av.
//
// HÄRDAT (2026-07-29): (1) väntar in kartan (init-effekten sätter mapRef.current efter denna hook),
// (2) validerar bort tomma/ogiltiga geometrier — en tom MultiPolygon fick Leaflet att projicera en
// null-latlng och krascha hela sidan, (3) try/catch som sista skydd.
//
// GUARD (Task 3, 2026-08-11): RPC:erna snappar ALLTID till närmaste skiva utan avståndsgräns —
// en efterfrågan på en period utan data (t.ex. Baltiska issjön ~-12600, ej ingested) fick tyst
// Yoldia (-9650) tillbaka, 2950 år fel. RPC:erna returnerar nu matched_year_ce; om
// |requested - matched| > SNAP_TOLERANCE_YEARS ritas INGET lager och status blir 'no-data' så
// UI kan visa "Ingen modellerad strandlinje för perioden" istället för att visa fel kust tyst.
// Tolerans 600 år: godtar den ~50–300 år skiften som redan finns mellan CE-skivorna/djuptids-
// knapparna (steg ~100 år) men avvisar en flera-tusenårig felsnappning.
const SNAP_TOLERANCE_YEARS = 600;

export type ShorelineOverlayStatus = 'idle' | 'loading' | 'ok' | 'no-data';

interface ShoreRow {
  id: string;
  period_label: string;
  year_ce: number;
  water_body_type: 'sea' | 'lake';
  geojson: string;
  matched_year_ce?: number;
}

const GEOM_TYPES = new Set(['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString', 'Point', 'MultiPoint', 'GeometryCollection']);
function validGeom(g: unknown): g is GeoJSON.Geometry {
  if (!g || typeof g !== 'object') return false;
  const t = (g as { type?: string }).type;
  if (!t || !GEOM_TYPES.has(t)) return false;
  const coords = (g as { coordinates?: unknown }).coordinates;
  if (!Array.isArray(coords) || coords.length === 0) return false;   // tom geometri → hoppa (kraschkällan)
  return true;
}

// rpcFn: 'get_paleo_shorelines_nearest' (SGU, default) eller 'get_paleo_shorelines_dem'
// (finupplöst Copernicus-DEM-modell, används på Kalmar-sidan). Båda returnerar samma form.
export function useShorelineOverlay(
  mapRef: RefObject<L.Map | null>,
  year: number | null,
  rpcFn: 'get_paleo_shorelines_nearest' | 'get_paleo_shorelines_dem' = 'get_paleo_shorelines_nearest',
  bbox?: [number, number, number, number],   // [minlng,minlat,maxlng,maxlat] — bara DEM-RPC:n; regionavgränsar
) {
  const layerRef = useRef<L.GeoJSON | null>(null);
  const bboxKey = bbox ? bbox.join(',') : '';
  const [status, setStatus] = useState<ShorelineOverlayStatus>('idle');

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    const clear = () => {
      const map = mapRef.current;
      if (map && layerRef.current) { try { map.removeLayer(layerRef.current); } catch { /* karta borttagen */ } }
      layerRef.current = null;
    };
    clear();
    if (year == null) { setStatus('idle'); return () => { cancelled = true; }; }
    setStatus('loading');

    (async () => {
      // vänta in kartan (init-effekten körs efter denna hook vid mount)
      let tries = 0;
      while (!mapRef.current && tries < 180 && !cancelled) {
        await new Promise<void>((r) => { raf = requestAnimationFrame(() => r()); });
        tries++;
      }
      if (cancelled || !mapRef.current) return;

      const { data, error } = await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
      }).rpc(rpcFn, bbox ? { p_year: year, p_bbox: bbox } : { p_year: year });
      if (cancelled) return;
      if (error || !data || (data as ShoreRow[]).length === 0) { setStatus('no-data'); return; }

      const rows = data as ShoreRow[];
      // matched_year_ce är samma på alla rader i svaret (samma snapp) — jämför mot begärt år.
      const matched = rows[0].matched_year_ce ?? rows[0].year_ce;
      if (Math.abs(year - matched) > SNAP_TOLERANCE_YEARS) {
        setStatus('no-data');   // felsnappning — rita INTE en missvisande kust
        return;
      }

      const features: GeoJSON.Feature[] = [];
      for (const r of rows) {
        if (!r.geojson) continue;
        let g: unknown;
        try { g = JSON.parse(r.geojson); } catch { continue; }
        if (!validGeom(g)) continue;
        features.push({ type: 'Feature', properties: { kind: r.water_body_type, label: r.period_label }, geometry: g as GeoJSON.Geometry });
      }
      if (cancelled || !mapRef.current || features.length === 0) { setStatus('no-data'); return; }

      try {
        // Tydlig dåtida KUSTLINJE: en faint blå fyllning (opacity 0.28) över baskartans redan blå hav
        // blev osynlig (bugg 2026-08-11, belagd i browser — Littorina "syntes inte" på Öland). Nu ritas
        // en kraftig kontrasterande amber kustkontur + mycket lätt fyllning, så strandförskjutningen
        // framträder mot både land (grönt) och nutida hav (blått). Sjöar streckade för att skiljas.
        // Dåtida hav ska LÄSA som vatten (blått), inte som en orange kontur. Tidigare dominerade
        // amber-konturen (weight 2.5) + för svag blå fyllning (0.12) → stora inlands-översvämmade
        // ytor (t.ex. /sv/staket, hav över grönt land) såg ut som en orange kladd. Nu: tydlig blå
        // fyllning som bär "vatten", + tunn amber kustkontur som markerar dåtida strandlinje mot
        // både land (grönt) och nutida hav (blått). Sjöar streckade för att skiljas från hav.
        const gj = L.geoJSON({ type: 'FeatureCollection', features } as GeoJSON.FeatureCollection, {
          style: (f) => f?.properties?.kind === 'lake'
            ? { color: '#f59e0b', weight: 1, dashArray: '5,4', fillColor: '#38bdf8', fillOpacity: 0.30 }
            : { color: '#f59e0b', weight: 1.2, fillColor: '#38bdf8', fillOpacity: 0.35 },
          interactive: false,
        });
        gj.addTo(mapRef.current);
        gj.bringToBack();
        layerRef.current = gj;
        setStatus('ok');
      } catch (e) {
        console.warn('⚠️ strandlinje-overlay hoppades (geometri):', (e as Error)?.message);
        setStatus('no-data');
      }
    })();

    return () => { cancelled = true; if (raf) cancelAnimationFrame(raf); clear(); };
  }, [mapRef, year, rpcFn, bboxKey]);   // bboxKey (ej bbox-arrayen) → stabil dep

  return { status };
}
