import L from 'leaflet';

// Per-lager "betraktningsavsikt": punktlager vill zoomas IN (annars ser man inget, t.ex.
// viewport-laddade kyrkor), linje-/nätverkslager vill zoomas UT så hela utbredningen syns
// (farleder, floder, rutter). Delad funktion + window-bro (__focusLayerViewport) så legenden
// och andra ytor kan trigga rätt zoom. Jfr __nearMeFitFeatures (samma flyToBounds-mekanik).
type Intent = { kind: 'zoomIn'; minZoom: number } | { kind: 'fitExtent'; maxZoom: number };

const INTENT: Record<string, Intent> = {
  fairways_modern: { kind: 'fitExtent', maxZoom: 9 },
  fairways_historical: { kind: 'fitExtent', maxZoom: 9 },
  water_routes: { kind: 'fitExtent', maxZoom: 9 },
  river_routes: { kind: 'fitExtent', maxZoom: 9 },
  swedish_rivers: { kind: 'fitExtent', maxZoom: 9 },
  european_rivers: { kind: 'fitExtent', maxZoom: 8 },
  valdemar_route: { kind: 'fitExtent', maxZoom: 8 },
  eriksgatan: { kind: 'fitExtent', maxZoom: 8 },
  trade_routes: { kind: 'fitExtent', maxZoom: 7 },
  land_routes: { kind: 'fitExtent', maxZoom: 8 },
};
// Default = punktlager → zooma in till minst z10.
export const getLayerIntent = (id: string): Intent => INTENT[id] ?? { kind: 'zoomIn', minZoom: 10 };

// Lagerspecifika bounds-getters registreras av respektive kart-hook när lagret ritats,
// så fitExtent kan rama in den faktiska geometrin (annars faller vi tillbaka på zoom-ut).
const boundsGetters = new Map<string, () => L.LatLngBounds | null>();
export const registerLayerBounds = (id: string, getter: () => L.LatLngBounds | null) => {
  boundsGetters.set(id, getter);
  return () => { if (boundsGetters.get(id) === getter) boundsGetters.delete(id); };
};

export const focusLayerViewport = (map: L.Map, id: string) => {
  const intent = getLayerIntent(id);
  try {
    if (intent.kind === 'fitExtent') {
      const b = boundsGetters.get(id)?.();
      if (b && b.isValid()) { map.flyToBounds(b, { maxZoom: intent.maxZoom, padding: [40, 40], duration: 0.8 }); return; }
      // Ingen registrerad geometri → zooma åtminstone ut till lagrets max så nätet ryms.
      if (map.getZoom() > intent.maxZoom) map.flyTo(map.getCenter(), intent.maxZoom, { duration: 0.6 });
      return;
    }
    // Punktlager: säkerställ minst minZoom (zooma in), rör inte om redan tillräckligt nära.
    if (map.getZoom() < intent.minZoom) map.flyTo(map.getCenter(), intent.minZoom, { duration: 0.6 });
  } catch { /* noop */ }
};
