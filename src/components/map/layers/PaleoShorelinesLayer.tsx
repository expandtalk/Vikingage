import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { usePaleoShorelines } from '@/hooks/map/usePaleoShorelines';

/**
 * Dåtida strandlinje (SGU strandförskjutningsmodell, CC-BY).
 * Ritar hav/insjö-utbredning för tidsskivan närmast vald tidsperiod, som ett
 * halvtransparent bakgrundslager UNDER punktlagren. Gate: legendknappen 'paleo_shoreline'
 * (av som standard, === true). Regionalt avgränsat (Mälardalen/Uppland).
 */

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  selectedTimePeriod: string;
  isVisible: boolean;
}

const STYLE: Record<string, L.PathOptions> = {
  sea: { color: '#1e40af', weight: 1, fillColor: '#3b82f6', fillOpacity: 0.28 },
  lake: { color: '#0e7490', weight: 1, fillColor: '#22d3ee', fillOpacity: 0.22 },
};

export const PaleoShorelinesLayer: React.FC<Props> = ({
  map,
  enabledLegendItems,
  selectedTimePeriod,
  isVisible,
}) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const features = usePaleoShorelines(enabledLegendItems, selectedTimePeriod, isVisible);

  useEffect(() => {
    if (!map) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!features.length) return;

    features.forEach((f) => {
      try {
        const geo = JSON.parse(f.geojson);
        L.geoJSON(geo, { style: STYLE[f.water_body_type] || STYLE.sea })
          .bindTooltip(`Dåtida ${f.water_body_type === 'sea' ? 'hav' : 'insjö'} · ${f.period_label}`, { sticky: true })
          .bindPopup(
            `<strong>Strandlinje — ${f.period_label}</strong><br/>` +
              `<span style="font-size:11px;color:#475569">Relativ havsnivå enligt SGU:s strandförskjutningsmodell. ` +
              `Källa: Sveriges geologiska undersökning (SGU), CC-BY 4.0. Regionalt (Mälardalen/Uppland).</span>`,
          )
          .addTo(layer);
      } catch (e) {
        console.warn('⚠️ paleo shoreline parse:', e);
      }
    });

    // Strandlinjen ska ligga UNDER punktlager (runstenar, kyrkor m.m.).
    layer.eachLayer((l: unknown) => {
      (l as { bringToBack?: () => void }).bringToBack?.();
    });

    return () => {
      layer.clearLayers();
    };
  }, [map, features]);

  // Säker cleanup när komponenten unmountas.
  useEffect(() => {
    return () => {
      try {
        if (layerRef.current && map && map.hasLayer && map.hasLayer(layerRef.current)) {
          map.removeLayer(layerRef.current);
        }
      } catch (e) {
        console.warn('⚠️ paleo shoreline cleanup:', e);
      }
    };
  }, [map]);

  return null;
};
