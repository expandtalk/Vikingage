import { useEffect, useRef } from "react";
import L from "leaflet";
import { getBasemapConfig, type BasemapId } from "@/config/exploreCapabilities";

interface UseMapTileLayerProps {
  map: L.Map | null;
  basemap: BasemapId;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.MutableRefObject<boolean>;
  mapContainer: React.RefObject<HTMLDivElement>;
  safelyAddLayer: (layer: L.Layer) => boolean;
}

export const useMapTileLayer = ({
  map,
  basemap,
  isMapReady,
  mapContainer,
  safelyAddLayer,
}: UseMapTileLayerProps) => {
  const currentTileLayer = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!map || !isMapReady.current || !mapContainer.current) return;
    if (!document.contains(mapContainer.current)) return;

    if (currentTileLayer.current) {
      try {
        currentTileLayer.current.remove();
      } catch (error) {
        console.error("Error removing tile layer:", error);
      }
    }

    const cfg = getBasemapConfig(basemap);
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      // Skala upp bortom källans sista tile-nivå istället för att visa felrutor
      // ("Map data not available") vid inzoomning.
      maxNativeZoom: cfg.maxNativeZoom,
      opacity: 1.0,
      className: cfg.className,
    });

    if (safelyAddLayer(tileLayer)) {
      currentTileLayer.current = tileLayer;
    }

    return () => {
      if (currentTileLayer.current) {
        try {
          currentTileLayer.current.remove();
        } catch (error) {
          console.error("Error removing tile layer on cleanup:", error);
        }
      }
    };
  }, [map, basemap, isMapReady, mapContainer, safelyAddLayer]);

  return { currentTileLayer };
};
