import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { itemEnabled } from '@/hooks/legend/itemEnabled';
import { computeHaradDensity, HaradDensity } from './runeDensity';

// Runstenstäthet per härad — GIS-analysresultat som eget, togglingsbart kartlager.
// En graderad cirkel per härad vid dess centroid; radie + färg skalar med antalet
// runstenar. Proof-of-concept för "analysoutput som kartlager".
// Gate: legendknappen 'runestone_density' (opt-in, av som standard).

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
  inscriptions: any[];
}

// Färgramp (choropleth-liknande) per antal — mörkare/varmare = tätare.
const colorForCount = (count: number): string => {
  if (count >= 50) return '#7f1d1d'; // mörkröd
  if (count >= 25) return '#b91c1c';
  if (count >= 10) return '#ea580c'; // orange
  if (count >= 5) return '#f59e0b';  // bärnsten
  return '#fbbf24';                  // ljusgul
};

// Graderad radie (px) — kvadratrotsskala så arean ~ antalet, klampad för läsbarhet.
const radiusForCount = (count: number): number => {
  const r = 6 + Math.sqrt(count) * 3;
  return Math.max(6, Math.min(30, r));
};

const esc = (s: string) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

const popupHtml = (d: HaradDensity): string => {
  const landscape = d.landscape ? ` · ${esc(d.landscape)}` : '';
  return `<div style="min-width:160px">
    <strong>${esc(d.name)}</strong>${landscape}
    <div style="font-size:13px;color:#475569;margin-top:4px">${d.count} runstenar</div>
  </div>`;
};

export const useRuneDensityLayer = ({ map, enabledLegendItems, isMapReady, safelyAddLayer, inscriptions }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  // safelyAddLayer nyskapas varje render (ingen useCallback i föräldern) → HÅLL i ref
  // och håll UTANFÖR beroendelistan, annars trigg­ar den oändlig refetch/omritning
  // (jfr river/inscription-frysningsfixarna).
  const addLayerRef = useRef(safelyAddLayer);
  addLayerRef.current = safelyAddLayer;

  // STABIL primitiv i beroendelistan — inte hela enabledLegendItems-objektet.
  const enabled = itemEnabled(enabledLegendItems, 'runestone_density');

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup();
    const layer = layerRef.current;
    layer.clearLayers();

    if (!enabled) {
      if (map.hasLayer(layer)) map.removeLayer(layer);
      return;
    }

    if (!map.hasLayer(layer)) addLayerRef.current(layer);

    const densities = computeHaradDensity(inscriptions);
    densities.forEach((d) => {
      L.circleMarker([d.centroidLat, d.centroidLng], {
        radius: radiusForCount(d.count),
        color: '#1e293b',
        weight: 1,
        fillColor: colorForCount(d.count),
        fillOpacity: 0.6,
      })
        .bindPopup(popupHtml(d), { maxWidth: 260, className: 'rune-density-popup' })
        .bindTooltip(`${d.name}: ${d.count}`, { direction: 'top' })
        .addTo(layer);
    });

    return () => { layer.clearLayers(); };
  }, [map, enabled, isMapReady, inscriptions]);

  // Slutstädning: ta bort lagret från kartan när komponenten avmonteras.
  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch (e) { console.warn('rune density layer cleanup', e); }
  }, [map]);
};
