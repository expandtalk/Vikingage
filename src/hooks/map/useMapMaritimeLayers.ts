import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { createPlaceMedallion } from '@/utils/map/placeMarker';

// Marinarkeologi-lager (Kalmarsund-forskningen): maritima noder (hamn/ö/grund) med
// FINGERPRINT-popup, skeppshaverier, farleder (moderna + historiska/Hansa) och
// Hansastäder + Kontor. Varje lager gate:as på sin egen legend-boolean (primitiv dep →
// ingen refetch-loop, jfr map-hook-refetch-loop). Läser via supabase (otypad cast).
interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
}
const sb = supabase as unknown as { from: (t: string) => any; rpc: (fn: string, args?: any) => any };
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const NODE_STYLE: Record<string, { icon: string; color: string }> = {
  harbor: { icon: 'amphora', color: '#22d3ee' },
  island: { icon: 'menhir', color: '#64748b' },
  shallow: { icon: 'dot', color: '#ef4444' },
  watch_point: { icon: 'beacon', color: '#f59e0b' },
  strait: { icon: 'dot', color: '#0ea5e9' },
  landing: { icon: 'amphora', color: '#14b8a6' },
};

export const useMapMaritimeLayers = ({ map, enabledLegendItems, isMapReady, safelyAddLayer }: Props) => {
  const nodesRef = useRef<L.Layer | null>(null);
  const lossesRef = useRef<L.Layer | null>(null);
  const fairwaysRef = useRef<L.Layer | null>(null);
  const hansaRef = useRef<L.Layer | null>(null);

  const onNodes = !!enabledLegendItems['maritime_nodes'];
  const onLosses = !!enabledLegendItems['ship_losses'];
  const onModern = !!enabledLegendItems['fairways_modern'];
  const onHist = !!enabledLegendItems['fairways_historical'];
  const onHansa = !!enabledLegendItems['hanseatic_cities'];

  // 1) Maritima noder + fingerprint-popup
  useEffect(() => {
    const m = map; if (!m || !isMapReady.current) return;
    if (nodesRef.current) { try { m.removeLayer(nodesRef.current); } catch { /* noop */ } nodesRef.current = null; }
    if (!onNodes) return;
    let cancelled = false;
    (async () => {
      const { data } = await sb.from('maritime_nodes').select('name,node_type,lat,lng,natural_harbor,shelter_index,enclosure,folklore_note,hazard_note,shoreline_note');
      if (cancelled || !data) return;
      const g = L.layerGroup();
      for (const n of data as any[]) {
        const st = NODE_STYLE[n.node_type] ?? NODE_STYLE.harbor;
        const mk = L.marker([n.lat, n.lng], { icon: createPlaceMedallion({ color: st.color, icon: st.icon, label: n.name, size: 30, className: 'vp-medallion--maritime' }) });
        // Fingerprint on demand: hämta täthet/epok-profil när popupen öppnas.
        mk.bindPopup(`<strong>${esc(n.name)}</strong> <em>(${esc(n.node_type)})</em><br/><span style="color:#666">Laddar fingerprint…</span>`);
        mk.on('popupopen', async () => {
          const { data: fp } = await sb.rpc('maritime_node_fingerprint', { p_lat: n.lat, p_lng: n.lng, p_radius_km: 3 });
          const rows = (fp ?? []) as any[];
          const total = rows.find(r => r.dim === 'total')?.n ?? 0;
          const ep = rows.filter(r => r.dim === 'epoch').sort((a, b) => b.n - a.n).slice(0, 4).map(r => `${esc(r.bucket)}: ${r.n}`).join('<br/>');
          const ty = rows.filter(r => r.dim === 'type').sort((a, b) => b.n - a.n).slice(0, 4).map(r => `${esc(r.bucket)}: ${r.n}`).join(', ');
          const extra = [n.enclosure && `Morfologi: ${esc(n.enclosure)}`, n.folklore_note && `Folktro: ${esc(n.folklore_note)}`, n.hazard_note && `Hazard: ${esc(n.hazard_note)}`, n.shoreline_note && esc(n.shoreline_note)].filter(Boolean).join('<br/>');
          mk.setPopupContent(`<div style="max-width:280px"><strong>${esc(n.name)}</strong> <em>(${esc(n.node_type)})</em><br/>
            <b>Fingerprint (3 km): ${total} lämningar</b><br/><u>Epok:</u><br/>${ep || '—'}<br/><u>Topp-typer:</u> ${ty || '—'}${extra ? '<br/><hr style="border-color:#0003"/>' + extra : ''}</div>`);
        });
        mk.addTo(g);
      }
      if (safelyAddLayer(g)) nodesRef.current = g;
    })();
    return () => { cancelled = true; if (nodesRef.current) { try { m.removeLayer(nodesRef.current); } catch { /* noop */ } nodesRef.current = null; } };
  }, [map, isMapReady, onNodes, safelyAddLayer]);

  // 2) Skeppshaverier
  useEffect(() => {
    const m = map; if (!m || !isMapReady.current) return;
    if (lossesRef.current) { try { m.removeLayer(lossesRef.current); } catch { /* noop */ } lossesRef.current = null; }
    if (!onLosses) return;
    let cancelled = false;
    (async () => {
      const { data } = await sb.from('ship_losses').select('name,lat,lng,cause,cause_confidence,cause_basis,ship_type,depth_m');
      if (cancelled || !data) return;
      const g = L.layerGroup();
      for (const w of data as any[]) {
        L.marker([w.lat, w.lng], { icon: createPlaceMedallion({ color: '#b91c1c', icon: 'ship', label: '', size: 24, className: 'vp-medallion--wreck' }) })
          .bindPopup(`<strong>${esc(w.name || 'Skeppslämning')}</strong><br/>Orsak: ${esc(w.cause)} <em>(${esc(w.cause_confidence)})</em>${w.cause_basis ? `<br/><span style="color:#666">${esc(w.cause_basis)}</span>` : ''}${w.depth_m != null ? `<br/>Djup: ${w.depth_m} m` : ''}`)
          .addTo(g);
      }
      if (safelyAddLayer(g)) lossesRef.current = g;
    })();
    return () => { cancelled = true; if (lossesRef.current) { try { m.removeLayer(lossesRef.current); } catch { /* noop */ } lossesRef.current = null; } };
  }, [map, isMapReady, onLosses, safelyAddLayer]);

  // 3) Farleder (moderna + historiska/Hansa) — GeoJSON via RPC, stil per fairway_kind
  useEffect(() => {
    const m = map; if (!m || !isMapReady.current) return;
    if (fairwaysRef.current) { try { m.removeLayer(fairwaysRef.current); } catch { /* noop */ } fairwaysRef.current = null; }
    if (!onModern && !onHist) return;
    let cancelled = false;
    (async () => {
      const { data } = await sb.rpc('fairways_geojson');
      if (cancelled || !data) return;
      const g = L.layerGroup();
      for (const f of data as any[]) {
        const modern = f.fairway_kind === 'modern_shipping_corridor';
        if (modern && !onModern) continue;
        if (!modern && !onHist) continue;
        let geom; try { geom = JSON.parse(f.geojson); } catch { continue; }
        const style = modern
          ? { color: '#0ea5e9', weight: 1, fillColor: '#0ea5e9', fillOpacity: 0.15 }
          : (f.fairway_kind === 'hanseatic'
            ? { color: '#eab308', weight: 3, dashArray: '8 5' }
            : { color: '#a855f7', weight: 3, dashArray: '4 4' });
        L.geoJSON(geom, { style: () => style as any })
          .bindPopup(`<strong>${esc(f.name || f.fairway_kind)}</strong><br/><em>${esc(f.period)}</em>${f.note ? `<br/><span style="color:#666;font-size:11px">${esc(f.note)}</span>` : ''}`)
          .addTo(g);
      }
      if (safelyAddLayer(g)) fairwaysRef.current = g;
    })();
    return () => { cancelled = true; if (fairwaysRef.current) { try { m.removeLayer(fairwaysRef.current); } catch { /* noop */ } fairwaysRef.current = null; } };
  }, [map, isMapReady, onModern, onHist, safelyAddLayer]);

  // 4) Hansastäder + Kontor
  useEffect(() => {
    const m = map; if (!m || !isMapReady.current) return;
    if (hansaRef.current) { try { m.removeLayer(hansaRef.current); } catch { /* noop */ } hansaRef.current = null; }
    if (!onHansa) return;
    let cancelled = false;
    (async () => {
      const { data } = await sb.from('hanseatic_cities').select('name,name_modern,lat,lng,role,kontor_name');
      if (cancelled || !data) return;
      const g = L.layerGroup();
      for (const c of data as any[]) {
        const kontor = c.role === 'kontor';
        const haupt = c.role === 'hauptstadt';
        const color = kontor ? '#eab308' : haupt ? '#f59e0b' : '#94a3b8';
        L.marker([c.lat, c.lng], { icon: createPlaceMedallion({ color, icon: kontor || haupt ? 'crown' : 'pillar', label: c.name, size: kontor || haupt ? 30 : 24, className: 'vp-medallion--hansa' }) })
          .bindPopup(`<strong>${esc(c.name)}</strong>${c.name_modern ? ` (${esc(c.name_modern)})` : ''}<br/>${esc(c.role)}${c.kontor_name ? ` · Kontor: ${esc(c.kontor_name)}` : ''}`)
          .addTo(g);
      }
      if (safelyAddLayer(g)) hansaRef.current = g;
    })();
    return () => { cancelled = true; if (hansaRef.current) { try { m.removeLayer(hansaRef.current); } catch { /* noop */ } hansaRef.current = null; } };
  }, [map, isMapReady, onHansa, safelyAddLayer]);
};
