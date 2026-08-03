import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { HISTORICAL_MAP_LAYERS, tileUrl } from '@/config/historicalMapLayers';
import { useMapOverlaySettings, getMapOverlaySettings } from '@/hooks/useMapOverlaySettings';

// Lägger/tar bort historiska Lantmäteri-rastrar som overlay-tiles per legend-toggle.
// Opt-in (allt AV som default). Statiska tiles från FTP (se historicalMapLayers.ts).
// Gate: en nyckel per lager (histmap_*). Ligger UNDER vektorlagren (zIndex lågt).
interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

// 1×1 genomskinlig PNG → inga brutna tile-ikoner innan tiles finns/utanför täckning.
const TRANSPARENT_PX =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const useMapHistoricalOverlays = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layersRef = useRef<Map<string, L.TileLayer>>(new Map());
  // Stabil nyckel: bara relevanta togglar → effekten körs bara när en historisk karta tänds/släcks.
  const activeKey = HISTORICAL_MAP_LAYERS.map((c) => (enabledLegendItems[c.key] === true ? '1' : '0')).join('');
  const settings = useMapOverlaySettings();

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    for (const cfg of HISTORICAL_MAP_LAYERS) {
      const on = enabledLegendItems[cfg.key] === true;
      const existing = layersRef.current.get(cfg.key);
      if (on && !existing) {
        const s = getMapOverlaySettings();
        const tl = L.tileLayer(tileUrl(cfg.tilesFolder), {
          attribution: cfg.attribution,
          opacity: s.opacity[cfg.key] ?? cfg.opacity,
          maxNativeZoom: cfg.maxNativeZoom,
          maxZoom: 20,
          minZoom: cfg.minZoom ?? 0,
          errorTileUrl: TRANSPARENT_PX,
          zIndex: 250, // ovanför baslagret, under vektor-overlays
          className: 'historical-overlay',
        });
        try {
          tl.addTo(map); layersRef.current.set(cfg.key, tl);
          const el = tl.getContainer(); if (el && s.tone[cfg.key] === 'grayscale') el.style.filter = 'grayscale(1)';
        } catch { /* map ej redo */ }
      } else if (!on && existing) {
        try { map.removeLayer(existing); } catch { /* noop */ }
        layersRef.current.delete(cfg.key);
      }
    }
  }, [map, isMapReady, activeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync opacitet + ton (Färg/Gråskala) på redan tända lager när Kartor-kontrollen ändras.
  useEffect(() => {
    for (const cfg of HISTORICAL_MAP_LAYERS) {
      const tl = layersRef.current.get(cfg.key);
      if (!tl) continue;
      tl.setOpacity(settings.opacity[cfg.key] ?? cfg.opacity);
      const el = tl.getContainer();
      if (el) el.style.filter = settings.tone[cfg.key] === 'grayscale' ? 'grayscale(1)' : '';
    }
  }, [settings]);

  useEffect(() => () => {
    for (const tl of layersRef.current.values()) { try { map?.removeLayer(tl); } catch { /* noop */ } }
    layersRef.current.clear();
  }, [map]);
};
