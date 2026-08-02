// src/hooks/map/useMapFieldNav.ts
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useFieldNav, setFieldNavFollowing } from '@/hooks/useFieldNav';
import { coneRotationDeg } from '@/utils/fieldNav';

// Ritar fältlägets position: noggrannhetsring + blå prick med en riktningskägla som roterar med
// färdriktningen. Pannar kartan med mig när `following`. Norr-upp; ingen kartrotation.
interface Props { map: L.Map | null; isMapReady: React.MutableRefObject<boolean> }

// Kägle-ikon. Rotationen sitter på ett INRE element (.fn-cone) så den inte krockar med Leaflets
// transform på ikon-roten (positionering). headingDeg == null → bara pricken, ingen kägla.
const positionIcon = (headingDeg: number | null) => {
  const cone = headingDeg == null
    ? ''
    : `<div class="fn-cone" style="transform:rotate(${coneRotationDeg(headingDeg)}deg)"></div>`;
  return L.divIcon({
    className: 'field-nav-cone',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<div class="fn-wrap">${cone}<div class="fn-dot"></div></div>`,
  });
};

export const useMapFieldNav = ({ map, isMapReady }: Props) => {
  const { active, pos, following } = useFieldNav();
  const layerRef = useRef<L.LayerGroup | null>(null);
  const flownRef = useRef(false); // första fixen per session → zooma in en gång

  // Användaren drar kartan själv → sluta följ (kontrollen visar då "Centrera").
  useEffect(() => {
    if (!map) return;
    const onDragStart = () => setFieldNavFollowing(false);
    map.on('dragstart', onDragStart);
    return () => { map.off('dragstart', onDragStart); };
  }, [map]);

  // Nollställ "har zoomat in"-flaggan när läget stängs av, så nästa start zoomar in igen.
  useEffect(() => { if (!active) flownRef.current = false; }, [active]);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!active || !pos) return;

    // GPS-noggrannhetsring (hederlighet: visa hur säker positionen är)
    if (pos.accuracy != null) {
      L.circle([pos.lat, pos.lng], { radius: pos.accuracy, color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: 0.12, dashArray: '4 3', interactive: false }).addTo(layer);
    }
    // Position + riktningskägla (icke-interaktiv — ska inte fånga klick)
    L.marker([pos.lat, pos.lng], { icon: positionIcon(pos.headingDeg), interactive: false, keyboard: false }).addTo(layer);

    // Första fixen: zooma in till körnivå. Därefter bara panorera (behåll användarens zoom).
    if (!flownRef.current) {
      flownRef.current = true;
      try { map.flyTo([pos.lat, pos.lng], Math.max(map.getZoom(), 16), { duration: 0.6 }); } catch { /* noop */ }
    } else if (following) {
      try { map.panTo([pos.lat, pos.lng], { animate: true, duration: 0.4 }); } catch { /* noop */ }
    }

    return () => { layer.clearLayers(); };
  }, [map, isMapReady, active, pos, following]);

  // Städa lagret när kartan byts/avmonteras.
  useEffect(() => () => {
    try {
      if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    catch { /* noop */ }
  }, [map]);
};
