// src/hooks/map/canvasFeatureHitTest.ts
import L from 'leaflet';

// Kompletterar DOM-klasskollen i useMapCreateMarkedPlace.ts (isOnInteractiveTarget) för
// CANVAS-renderade vektorlager — kartan skapas med preferCanvas: true (useMapInstance.ts:37).
// En circleMarker/circle från t.ex. useRuneDensityLayer.ts eller useMapCentralPlaces.ts har INGEN
// egen DOM-nod per feature (bara HELA canvas-elementet är en DOM-nod), så en ren
// `target.closest('.leaflet-interactive, …')`-koll är blind för dem: ett Shift+klick rakt ovanpå
// en sådan cirkel skulle annars kunna släppa en dubblettnål på exakt samma punkt.
//
// Löser det genom att återanvända EXAKT samma privata primitiv som Leaflets EGEN Canvas-renderare
// använder för sin egen klick-hit-test (se node_modules/leaflet: Canvas.prototype._onClick anropar
// `layer._containsPoint(layerPoint)` för varje interaktivt lager — metoden är uttryckligen
// dokumenterad i Leaflets källa som "Needed by the Canvas renderer for interactivity" på
// CircleMarker/Circle/Polyline/Polygon/Rectangle, som alla ärver den från L.Path). Vi uppfinner
// alltså inget nytt hit-test, vi kör samma kod Leaflet redan kör internt.
//
// Konservativt (Daniel/review: "hellre missa en drop än stämpla en nål ovanpå ett befintligt
// objekt"): om metoden av någon anledning saknas eller kastar (den är intern/odokumenterad,
// skulle i teorin kunna försvinna i en framtida Leaflet-version) tolkas det som TRÄFF, inte miss.
export const hasInteractiveVectorLayerAt = (map: L.Map, layerPoint: L.Point): boolean => {
  let hit = false;
  map.eachLayer((layer) => {
    if (hit) return;
    if (!(layer instanceof L.Path)) return; // L.Marker (våra röda nålar m.fl.) är DOM-baserade — redan täckta
    if (layer.options?.interactive === false) return; // avsiktligt oklickbart/dekorativt lager
    const containsPoint = (layer as unknown as { _containsPoint?: (p: L.Point) => boolean })._containsPoint;
    try {
      if (typeof containsPoint !== 'function' || containsPoint.call(layer, layerPoint)) hit = true;
    } catch {
      hit = true; // kunde inte avgöra → anta träff (konservativt)
    }
  });
  return hit;
};
