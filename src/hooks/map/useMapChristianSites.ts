import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { createPlaceMedallion, MARKER_COLORS } from '@/utils/map/placeMarker';

// Kurerat kyrkolager ur christian_sites (~84 platser): den RIKA per-kyrka-berättelsen
// (description + historical_notes med källor, t.ex. Boström & Göransson för Runstens gamla
// kyrka) i popupen — "det man vill läsa om en specifik kyrka". Skilt från det täta,
// opt-in ecclesiastical_sites-lagret (useMapChurches).
//
// Gate: periodtogglarna i teckenförklaringen (christianSitesLegend), default PÅ:
//   early_christian → early_christian_sites, medieval → medieval_monasteries,
//   late_medieval → late_medieval_sites. Perioder utan egen toggle (post_medieval/okänd)
//   visas när lagret alls är på. Slås ALLA tre av → lagret släcks.
//
// Försvunna kyrkor (status ruin/kyrkorester/arkeologisk) får egen grå glyf (church_ruin)
// skild från stående kyrka — "byggnaden borta, platsen syns ännu i landskapet".

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

interface CSite {
  id: string;
  name: string;
  name_en: string | null;
  coordinates: unknown; // native Postgres point → sträng "(lng,lat)" via PostgREST
  site_type: string;
  religious_order: string | null;
  period: string | null;
  status: string | null;
  founded_year: number | null;
  dissolved_year: number | null;
  description: string | null;
  historical_notes: string | null;
  significance_level: string | null;
  region: string | null;
  province: string | null;
  county: string | null;
}

const LABEL_ZOOM = 7; // under: liten prick (översikt); över: medaljong m. etikett
const GONE = new Set(['ruins', 'church_remains', 'archaeological']); // syns men byggnaden borta

const isGone = (s: CSite) => GONE.has(s.status ?? '');
const colorFor = (s: CSite) => (isGone(s) ? '#6b7280' : MARKER_COLORS.christian);
const iconKeyFor = (s: CSite) => (isGone(s) ? 'church_ruin' : 'church');

// Native point kommer normalt som "(lng,lat)"; hantera även "POINT(lng lat)" och {x,y}.
const parseCoord = (c: unknown): [number, number] | null => {
  if (c && typeof c === 'object' && 'x' in (c as Record<string, unknown>) && 'y' in (c as Record<string, unknown>)) {
    const o = c as { x: number; y: number };
    return Number.isFinite(o.x) && Number.isFinite(o.y) ? [o.x, o.y] : null;
  }
  if (typeof c !== 'string') return null;
  const m = /\(([^)]+)\)/.exec(c);
  if (!m) return null;
  const parts = m[1].split(/[,\s]+/).map(Number).filter((n) => !Number.isNaN(n));
  return parts.length >= 2 ? [parts[0], parts[1]] : null; // [lng, lat]
};

const esc = (s: string) =>
  String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

const TYPE_SV: Record<string, string> = { monastery: 'Kloster', church: 'Kyrka', holy_place: 'Helig plats', bishopric: 'Biskopssäte', hospital: 'Hospital' };
const STATUS_SV: Record<string, string> = { active: 'I bruk', ruins: 'Ruin', church_remains: 'Kyrkorester', historical: 'Historisk', archaeological: 'Arkeologisk (under mark)' };
const PERIOD_SV: Record<string, string> = { early_christian: 'Tidig kristendom', medieval: 'Medeltid', late_medieval: 'Senmedeltid', post_medieval: 'Efterreformatorisk' };

const chip = (t: string) =>
  `<span style="display:inline-block;font-size:10.5px;padding:1px 7px;border-radius:10px;background:#eef1f4;color:#33414d;margin:0 4px 4px 0">${esc(t)}</span>`;

const popupHtml = (s: CSite) => {
  const badges: string[] = [];
  if (s.site_type) badges.push(chip(TYPE_SV[s.site_type] ?? s.site_type));
  if (s.period) badges.push(chip(PERIOD_SV[s.period] ?? s.period));
  if (s.status) badges.push(chip(STATUS_SV[s.status] ?? s.status));
  const years = s.founded_year
    ? `<div style="font-size:12px;color:#475569">Grundad ${s.founded_year}${s.dissolved_year ? ` · riven/övergiven ${s.dissolved_year}` : ''}</div>`
    : '';
  const place = (s.region || s.province || s.county)
    ? `<div style="font-size:11px;color:#64748b">${esc([s.region, s.province, s.county].filter(Boolean).join(' · '))}</div>`
    : '';
  const desc = s.description
    ? `<p style="font-size:12.5px;color:#33414d;line-height:1.5;margin:8px 0 0">${esc(s.description)}</p>`
    : '';
  const notes = s.historical_notes
    ? `<div style="font-size:11px;color:#64748b;line-height:1.45;margin-top:8px;padding-top:6px;border-top:1px solid #e2e8f0">${esc(s.historical_notes)}</div>`
    : '';
  const histBtn = `<button type="button" onclick="window.__openChurchHistory&&window.__openChurchHistory('name:${encodeURIComponent(s.name)}')" style="margin-top:8px;padding:4px 8px;border:1px solid #b45309;border-radius:6px;background:transparent;color:#b45309;cursor:pointer;font-size:11px">Byggnadshistoria →</button>`;
  return `<div style="max-width:320px">
    <strong style="font-size:14px">${esc(s.name)}</strong>${s.name_en ? ` <span style="font-size:11px;color:#94a3b8;font-style:italic">${esc(s.name_en)}</span>` : ''}
    <div style="margin:6px 0 2px">${badges.join('')}</div>${years}${place}${desc}${notes}${histBtn}
  </div>`;
};

export const useMapChristianSites = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const dataRef = useRef<CSite[] | null>(null);
  const tokenRef = useRef(0);

  // Primitiva gate-booleans (INTE hela enabledLegendItems-objektet i deps — instabil
  // referens → oändlig re-render/refetch, se map-hook-refetch-loop).
  const earlyOn = enabledLegendItems.early_christian_sites !== false;
  const medOn = enabledLegendItems.medieval_monasteries !== false;
  const lateOn = enabledLegendItems.late_medieval_sites !== false;
  const anyOn = earlyOn || medOn || lateOn;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;

    if (!anyOn) { layer.clearLayers(); return; }

    // period → på/av (post_medieval/okänd faller på "visa när lagret är på").
    const gateOn: Record<string, boolean> = { early_christian: earlyOn, medieval: medOn, late_medieval: lateOn };
    const visible = (s: CSite) => (s.period && s.period in gateOn ? gateOn[s.period] : true);

    const render = () => {
      const sites = dataRef.current;
      if (!sites || !map) return;
      layer.clearLayers();
      const showLabel = map.getZoom() >= LABEL_ZOOM;
      // Kollisionsoffset: gammal + ny kyrka på identisk kyrkplats (t.ex. Runstens gamla &
      // nya, 16.6991/56.6993) skulle stapla → bara översta klickbar. Nudga dubbletter i spiral.
      const seen = new Map<string, number>();
      sites.forEach((s) => {
        if (!visible(s)) return;
        const c = parseCoord(s.coordinates);
        if (!c) return;
        let [lng, lat] = c;
        const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
        const n = seen.get(key) ?? 0;
        seen.set(key, n + 1);
        if (n > 0) { const a = n * 2.399; lng += Math.cos(a) * 0.00018; lat += Math.sin(a) * 0.00018; }
        const gone = isGone(s);
        const icon = showLabel
          ? createPlaceMedallion({
              color: colorFor(s), icon: iconKeyFor(s), label: s.name,
              sublabel: gone ? 'försvunnen kyrka' : undefined,
              className: gone ? 'vp-medallion--gone' : '',
            })
          : L.divIcon({
              html: `<div style="width:12px;height:12px;border-radius:50%;background:${colorFor(s)};border:1.5px solid #1e293b;box-shadow:0 1px 2px rgba(0,0,0,.45);${gone ? 'border-style:dashed;opacity:.8;' : ''}"></div>`,
              className: 'christian-dot', iconSize: [12, 12], iconAnchor: [6, 6], popupAnchor: [0, -7],
            });
        L.marker([lat, lng], { icon })
          .bindPopup(popupHtml(s), { maxWidth: 340, className: 'christian-site-popup' })
          .addTo(layer);
      });
    };

    const load = async () => {
      const myToken = ++tokenRef.current;
      if (!dataRef.current) {
        const { data, error } = await supabase
          .from('christian_sites')
          .select('id,name,name_en,coordinates,site_type,religious_order,period,status,founded_year,dissolved_year,description,historical_notes,significance_level,region,province,county');
        if (error || myToken !== tokenRef.current) return;
        dataRef.current = (data as unknown as CSite[]) ?? [];
      }
      render();
    };

    load();
    map.on('zoomend', render);
    return () => { map.off('zoomend', render); layer.clearLayers(); };
  }, [map, isMapReady, anyOn, earlyOn, medOn, lateOn]);

  // Slutstädning: ta bort lagergruppen när kartan rivs.
  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch (e) { console.warn('christian layer cleanup', e); }
  }, [map]);
};
