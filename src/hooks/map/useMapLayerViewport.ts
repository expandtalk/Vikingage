import { useEffect } from 'react';
import L from 'leaflet';
import { focusLayerViewport } from '@/utils/map/layerViewport';

// Exponerar window.__focusLayerViewport(layerId) så legenden (och andra ytor utanför React-
// trädet) kan zooma kartan till ett lagers "rätta" betraktningsläge — punktlager in, linje-/
// nätverkslager ut. Följer samma window-bro-mönster som __nearMeFlyTo/__nearMeFitFeatures.
export const useMapLayerViewport = ({ map }: { map: L.Map | null }) => {
  useEffect(() => {
    if (!map) return;
    (window as unknown as { __focusLayerViewport?: (id: string) => void }).__focusLayerViewport = (id) => focusLayerViewport(map, id);
    return () => { try { delete (window as unknown as { __focusLayerViewport?: unknown }).__focusLayerViewport; } catch { /* noop */ } };
  }, [map]);
};
