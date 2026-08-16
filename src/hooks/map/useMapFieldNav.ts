// src/hooks/map/useMapFieldNav.ts
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useFieldNav, setFieldNavFollowing } from '@/hooks/useFieldNav';
import { coneRotationDeg, normalizeDeg } from '@/utils/fieldNav';
import { haversineKm } from '@/utils/geoDistance';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useTravelMode } from '@/hooks/useTravelMode';

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

// KILL-SWITCH: heading-up (kartrotation) är AVSTÄNGD tills grundföljningen är fixad. Daniels fälttest
// visade att kartan roterades men positionen inte uppdaterades → man såg inte sig själv (desorienterande
// under körning). Norr-upp är default igen. Slå på (true) först när follow/positionsuppdatering är
// verifierad live. Koden nedan behålls medvetet — det är bara denna flagga som gate:ar rotationen.
const HEADING_UP_ENABLED = false;

// Leaflet saknar rotation i typerna; leaflet-rotate lägger till setBearing/getBearing + rotate-option.
type RotatableMap = L.Map & {
  options: L.MapOptions & { rotate?: boolean };
  setBearing?: (deg: number) => void;
  getBearing?: () => number;
};

// "Här"-ikon: grön skiva + vit riktningspil. Alltid-på-markör (mobil/billäge) — oberoende av om
// fältläget (HUD) är aktivt. I heading-up (billäge) roteras HELA kartan så färdriktningen pekar upp
// → då pekar pilen rakt upp (rot=0, = framåt). I norr-upp roterar pilen i stället med kursen.
// headingDeg == null → pilen står still och pekar upp (norr).
const hereIcon = (headingDeg: number | null, headingUp: boolean) => {
  const rot = headingUp ? 0 : (headingDeg == null ? 0 : coneRotationDeg(headingDeg));
  return L.divIcon({
    className: 'here-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div class="here-wrap"><div class="here-disc"><div class="here-arrow" style="transform:rotate(${rot}deg)"></div></div></div>`,
  });
};

// Målmarkör för "Led mig hit" (amber). Egen färg/form så den inte förväxlas med min position.
const targetIcon = () => L.divIcon({
  className: 'field-nav-target',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  html: `<div style="width:16px;height:16px;margin:5px;border-radius:9999px;background:#f59e0b;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.3)"></div>`,
});

export const useMapFieldNav = ({ map, isMapReady }: Props) => {
  const { active, pos, following, target } = useFieldNav();
  const isMobile = useIsMobile();
  const mode = useTravelMode();
  const layerRef = useRef<L.LayerGroup | null>(null);
  const flownRef = useRef(false); // första fixen per session → zooma in en gång
  const bearingRef = useRef<number | null>(null); // senast satta kart-bäring (grader), null = orörd

  // Användaren drar kartan själv → sluta följ (kontrollen visar då "Centrera").
  useEffect(() => {
    if (!map) return;
    const onDragStart = () => setFieldNavFollowing(false);
    map.on('dragstart', onDragStart);
    return () => { map.off('dragstart', onDragStart); };
  }, [map]);

  // Nollställ "har zoomat in"-flaggan när läget stängs av, så nästa start zoomar in igen.
  useEffect(() => { if (!active) flownRef.current = false; }, [active]);

  // Norr-upp-vakt: så fort vi INTE är i aktivt bil-följe (mode-byte, fältläge av, eller följning av
  // via drag) → snap tillbaka till bäring 0, även om ingen ny GPS-fix kommer. Så kartan aldrig
  // lämnas roterad i vanligt läge/på andra vyer.
  useEffect(() => {
    if (!map) return;
    const rot = map as RotatableMap;
    if (!rot.options.rotate || typeof rot.setBearing !== 'function') return;
    const inCarFollow = mode === 'car' && active && following;
    if (!inCarFollow && bearingRef.current) {
      try { rot.setBearing(0); bearingRef.current = 0; } catch { /* noop */ }
    }
  }, [map, mode, active, following]);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!pos) return;

    // "Här"-markören (grön/vit pil) visas alltid på mobil/i billäge, oberoende av om fältläget
    // (HUD) är aktivt — det är den alltid-på nuvarande-position-markören. Annars, i aktivt
    // fältläge på icke-mobil/icke-bil, blå prick + riktningskägla (som tidigare). ALDRIG båda
    // samtidigt — det ska bara finnas EN positionsmarkör.
    const showHereMarker = isMobile || mode === 'car';

    // Heading-up: rotera kartan så färdriktningen pekar UPP. Bara i aktivt billäge + följning + när
    // vi har en kurs (pos.headingDeg). Botar sjösjukan vid färd söderut (norr-upp → allt rör sig mot
    // en). Gå/cykla och desktop = norr-upp som förr. Kräver leaflet-rotate (rotate:true på kartan).
    const rot = map as RotatableMap;
    const canRotate = HEADING_UP_ENABLED && !!rot.options.rotate && typeof rot.setBearing === 'function';
    const headingUp = canRotate && mode === 'car' && active && following && pos.headingDeg != null;

    // GPS-noggrannhetsring (hederlighet: visa hur säker positionen är) — så fort vi har en fix.
    if (pos.accuracy != null) {
      L.circle([pos.lat, pos.lng], { radius: pos.accuracy, color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: 0.12, dashArray: '4 3', interactive: false }).addTo(layer);
    }
    // Position (icke-interaktiv — ska inte fånga klick)
    if (showHereMarker) {
      L.marker([pos.lat, pos.lng], { icon: hereIcon(pos.headingDeg, headingUp), interactive: false, keyboard: false }).addTo(layer);
    } else if (active) {
      L.marker([pos.lat, pos.lng], { icon: positionIcon(pos.headingDeg), interactive: false, keyboard: false }).addTo(layer);
    }

    if (!active) return; // Följning/zoom/"led mig hit" hör bara till det opt-in aktiva fältläget (HUD)

    // Sätt kart-bäringen: heading-up → färdriktningen upp (kartan roteras −kurs så kursen hamnar
    // överst); annars norr-upp (0). Står man still i billäge (ingen kurs) → behåll senaste bäring,
    // snap INTE till norr. Deadband ~3° dämpar GPS-jitter så kartan inte skakar.
    if (canRotate) {
      let desired: number | null;
      if (headingUp) {
        desired = normalizeDeg(-(pos.headingDeg as number));
      } else if (mode === 'car' && active && following && pos.headingDeg == null && bearingRef.current != null) {
        desired = null; // står still under färd → lämna bäringen orörd
      } else {
        desired = 0; // norr-upp
      }
      if (desired != null && desired !== bearingRef.current) {
        const cur = bearingRef.current ?? 0;
        const delta = Math.abs(((desired - cur + 540) % 360) - 180);
        if (!headingUp || bearingRef.current == null || delta >= 3) {
          try { rot.setBearing!(desired); bearingRef.current = desired; } catch { /* noop */ }
        }
      }
    }

    // Följ-läge (mobil/billäge): lägg MIN position i nedre tredjedelen så det mesta av skärmen är
    // "framåt" (nav-app-mönster, Daniel). Räknas i SKÄRMRYMD via container-punkter → korrekt även
    // när kartan är roterad (heading-up). Desktop = centrera som förr.
    const followCenter = (): L.LatLng => {
      const ll = L.latLng(pos.lat, pos.lng);
      if (!showHereMarker) return ll;
      try {
        const size = map.getSize();
        const targetCp = L.point(size.x / 2, size.y * 0.75); // dit min position ska på skärmen
        const centerCp = L.point(size.x / 2, size.y / 2);
        const meCp = map.latLngToContainerPoint(ll);
        return map.containerPointToLatLng(centerCp.add(meCp.subtract(targetCp)));
      } catch { return ll; }
    };
    // Första fixen: zooma in läges-medvetet (Daniel: gångläge MYCKET mer inzoomat så man ser vad man
    // står på när man klickar). Gå = kvartersnivå (18), cykel mellan (17), bil = översikt (16).
    // Därefter bara panorera (behåll användarens egen zoom).
    if (!flownRef.current) {
      flownRef.current = true;
      const minZoom = mode === 'foot' ? 18 : mode === 'bike' ? 17 : 16;
      const z = Math.max(map.getZoom(), minZoom);
      try { map.flyTo(followCenter(), z, { duration: 0.6 }); } catch { /* noop */ }
    } else if (following) {
      try { map.panTo(followCenter(), { animate: true, duration: 0.4 }); } catch { /* noop */ }
    }

    // "Led mig hit"-mål: amber markör + streckad ledlinje från min position till målet.
    if (target) {
      L.marker([target.lat, target.lng], { icon: targetIcon(), interactive: false, keyboard: false }).addTo(layer);
      if (pos) {
        L.polyline([[pos.lat, pos.lng], [target.lat, target.lng]], {
          color: '#f59e0b', weight: 2, dashArray: '6 5', opacity: 0.85,
        }).addTo(layer);
        // Avstånd vid ledlinjens mitt — så "vägen dit" syns direkt på kartan (fågelväg), inte bara i panelen.
        const km = haversineKm(pos, target);
        const distTxt = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
        L.marker([(pos.lat + target.lat) / 2, (pos.lng + target.lng) / 2], {
          interactive: false, keyboard: false,
          icon: L.divIcon({
            className: 'field-nav-dist',
            html: `<div style="background:#78350f;color:#fef3c7;padding:1px 7px;border-radius:9px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.45)">${distTxt}</div>`,
            iconSize: [0, 0] as unknown as L.PointExpression, iconAnchor: [0, 0],
          }),
        }).addTo(layer);
      }
    }

    return () => { layer.clearLayers(); };
  }, [map, isMapReady, active, pos, following, target, isMobile, mode]);

  // Städa lagret när kartan byts/avmonteras.
  useEffect(() => () => {
    try {
      if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    catch { /* noop */ }
  }, [map]);
};
