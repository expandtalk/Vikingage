import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useCarRoute, type CarRouteFeature } from '@/hooks/useCarRoute';
import {
  createPlaceMedallion, markerColor, featureIcon, isRoyalSeat,
} from '@/utils/map/placeMarker';

// Ritar bil-lägets rutt-korridor: väg-linjen (casing + linje) och objekten längs vägen som
// medaljonger i ett markercluster (täta stråk → kluster; >99 av samma → "99+"). Läser
// useCarRoute-store; ritar inget förrän en rutt valts. Zoomar EN gång så hela rutten ryms.
interface Props { map: L.Map | null; isMapReady: React.RefObject<boolean> }

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDist = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);
const HERITAGE_SEP = ' – ';

// feature_type/raa_type → glyf + färg. Heritage bär "raa_type – namn"; härled glyf ur raa_type
// (återanvänder featureIcon+markerColor). Övriga typer får en fast, dov domänfärg.
const TYPE_STYLE: Record<string, { icon: string; color: string }> = {
  runestone: { icon: 'rune', color: '#8a7a5c' },
  church: { icon: 'church', color: '#8b8578' },
  cult_site: { icon: 'idol', color: '#7a6aa0' },
  estate: { icon: 'house', color: '#9a7b3c' },
  museum: { icon: 'amphora', color: '#3f7f93' },
  maritime_node: { icon: 'ship', color: '#3f7f93' },
};
const styleFor = (f: CarRouteFeature): { icon: string; color: string } => {
  if (f.feature_type === 'heritage') {
    const raa = f.name?.split(HERITAGE_SEP)[0]?.trim() || 'lämning';
    const ic = featureIcon(raa);
    return { icon: ic, color: markerColor(ic) };
  }
  return TYPE_STYLE[f.feature_type] ?? { icon: featureIcon(f.feature_type), color: markerColor(f.feature_type) };
};
// Medaljong-etikett: heritage → namn om det finns, annars lämningstypen (Versal).
const labelFor = (f: CarRouteFeature): string => {
  if (f.feature_type !== 'heritage') return f.name || '';
  const i = f.name?.indexOf(HERITAGE_SEP) ?? -1;
  const nm = i >= 0 ? f.name.slice(i + HERITAGE_SEP.length).trim() : '';
  if (nm) return nm;
  const raa = f.name?.split(HERITAGE_SEP)[0]?.trim() || 'lämning';
  return raa.charAt(0).toUpperCase() + raa.slice(1);
};

// "Läs mer →" (runstenar) via den rika InscriptionModal-bron.
const detailButton = (f: CarRouteFeature): string =>
  f.feature_type === 'runestone' && f.feature_id
    ? `<br/><button type="button" onclick="window.__openInscriptionById && window.__openInscriptionById('${esc(f.feature_id)}')" style="margin-top:6px;padding:4px 8px;border:1px solid #38bdf8;border-radius:6px;background:transparent;color:#38bdf8;cursor:pointer;font-size:11px">Läs mer →</button>`
    : '';

export const useMapCarRoute = ({ map, isMapReady }: Props) => {
  const { open, route, line, features } = useCarRoute();
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fitRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!open || !route || line.length < 2) { fitRef.current = null; return; }

    // Väg-linjen: mörk casing + guldlinje (skiljer sig från roadtrip-bläget som är blått).
    L.polyline(line, { color: '#0f172a', weight: 8, opacity: 0.35, lineJoin: 'round' }).addTo(layer);
    L.polyline(line, { color: '#b5892f', weight: 4, opacity: 0.95, lineJoin: 'round' }).addTo(layer);

    // Objekten längs vägen: medaljonger i ett kluster. >99 barn → "99+" (annars exakt antal).
    const cluster = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 13,
      iconCreateFunction: (c: any) => {
        const n = c.getChildCount();
        const txt = n > 99 ? '99+' : String(n);
        const size = n > 99 ? 40 : n > 9 ? 34 : 30;
        return L.divIcon({
          html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:rgba(33,44,53,.92);border:2px solid #b5892f;color:#f4ecd8;font:600 12px 'Inter',system-ui,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.5)">${txt}</div>`,
          className: 'vp-carroute-cluster',
          iconSize: [size, size],
        });
      },
    }) as L.LayerGroup;

    features.forEach((f) => {
      if (f.lat == null || f.lng == null) return;
      const st = styleFor(f);
      const label = labelFor(f);
      const icon = createPlaceMedallion({
        color: st.color,
        icon: st.icon,
        label,
        size: f.prominent ? 34 : 28,
        royal: isRoyalSeat(label),
        prominent: f.prominent,
        hairline: true,
        className: 'vp-medallion--carroute',
      });
      L.marker([f.lat, f.lng], { icon })
        .bindPopup(
          `<strong>${esc(label || f.feature_type)}</strong><br/><span style="font-size:11px;color:#666">${esc(f.feature_type)} · ${fmtDist(f.dist_m)} från vägen</span>${detailButton(f)}`,
        )
        .addTo(cluster);
    });
    layer.addLayer(cluster);

    // Zooma en gång så hela rutten ryms (fitRef-vakt → inte varje render).
    const key = `${route.id}:${line.length}`;
    if (fitRef.current !== key) {
      fitRef.current = key;
      try { map.flyToBounds(L.latLngBounds(line), { padding: [50, 50], maxZoom: 13, duration: 0.8 }); } catch { /* noop */ }
    }
    return () => { layer.clearLayers(); };
  }, [map, isMapReady, open, route, line, features]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); } catch { /* noop */ }
  }, [map]);
};
