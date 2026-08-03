import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNearMe, setNearMePos } from '@/hooks/useNearMe';
import { useDrivingMode } from '@/hooks/useDrivingMode';

// Ritar "Near me"-lagret på kartan: min position (blå prick + noggrannhetsring),
// sökradie-cirkel och träffmarkörer. Läser store; ritar inget förrän position finns.
// Exponerar window.__nearMeFlyTo så listan i kontrollen kan flyga till ett objekt.
interface Props { map: L.Map | null; isMapReady: React.RefObject<boolean> }

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dist = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

// Fornsök-länk ur heritage.source_uri: bara riktiga URL:er (kulturarvsdata.se/… eller http)
// blir klickbara; interna slugs ("raa:…") ger ingen länk.
const fornsokHref = (uri?: string | null): string | null => {
  if (!uri) return null;
  if (/^https?:\/\//.test(uri)) return uri;
  if (uri.startsWith('kulturarvsdata.se/')) return `https://${uri}`;
  return null;
};
// Extra popup-rader för en namnlös lämning: socken + ev. Fornsök-länk (svarar "vad är det för hög?").
const heritageExtra = (parish?: string | null, uri?: string | null): string => {
  const href = fornsokHref(uri);
  const p = parish ? `<br/><span style="font-size:11px;color:#94a3b8">${esc(parish)} sn</span>` : '';
  const l = href ? `<br/><a href="${esc(href)}" target="_blank" rel="noopener" style="font-size:11px;color:#38bdf8">Visa i Fornsök ↗</a>` : '';
  return p + l;
};
// "Läs mer →" för runstenar: öppnar den rika InscriptionModal via window-bron (__openInscriptionById).
// feature_id = runstenens uuid. Endast för runestone (andra typer saknar modal än).
const detailButton = (featureType?: string | null, featureId?: string | null): string => {
  if (featureType !== 'runestone' || !featureId) return '';
  return `<br/><button type="button" onclick="window.__openInscriptionById && window.__openInscriptionById('${esc(featureId)}')" style="margin-top:6px;padding:4px 8px;border:1px solid #38bdf8;border-radius:6px;background:transparent;color:#38bdf8;cursor:pointer;font-size:11px">Läs mer →</button>`;
};

export const useMapNearMe = ({ map, isMapReady }: Props) => {
  const { open, pos, radiusKm, results } = useNearMe();
  const driving = useDrivingMode();
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Flyg-till + öppna popup (VAR + VAD) för listobjekt (används av NearMeControl).
  // parish/uri (valfria) berikar namnlösa lämningar med socken + Fornsök-länk.
  useEffect(() => {
    if (!map) return;
    (window as unknown as { __nearMeFlyTo?: (a: number, b: number, label?: string, type?: string, dist?: string, parish?: string | null, uri?: string | null, featureType?: string | null, featureId?: string | null) => void }).__nearMeFlyTo =
      (lat, lng, label, type, dist, parish, uri, featureType, featureId) => {
        try {
          // Mjuk panorering: BEHÅLL zoomen och flytta bara om objektet ligger utanför vyn.
          // Ett listklick ska inte rycka bort dig, zooma hårt eller (via viewport-omladdning)
          // fälla ihop legenden (Daniel) — listan är en överblick du bläddrar utan att tappa kontext.
          if (!map.getBounds().pad(-0.15).contains([lat, lng])) {
            map.panTo([lat, lng], { animate: true, duration: 0.5 });
          }
          if (label) {
            L.popup({ offset: [0, -6] }).setLatLng([lat, lng])
              .setContent(`<strong>${esc(label)}</strong>${type ? `<br/><span style="font-size:11px;color:#666">${esc(type)}${dist ? ' · ' + esc(dist) : ''}</span>` : ''}${heritageExtra(parish, uri)}${detailButton(featureType, featureId)}`)
              .openOn(map);
          }
        } catch { /* noop */ }
      };
    // Zooma så att FLERA objekt ryms (klick på en kategori-/bandrubrik) — ser man flera stenar
    // som default istället för att dyka rakt ner på en enda. maxZoom bevarar ändå detaljnivå.
    (window as unknown as { __nearMeFitFeatures?: (pts: { lat: number; lng: number }[]) => void }).__nearMeFitFeatures =
      (pts) => {
        try {
          const valid = (pts ?? []).filter((p) => p.lat != null && p.lng != null);
          if (valid.length === 0) return;
          if (valid.length === 1) { map.flyTo([valid[0].lat, valid[0].lng], Math.max(map.getZoom(), 15), { duration: 0.6 }); return; }
          const b = L.latLngBounds(valid.map((p) => [p.lat, p.lng] as [number, number]));
          map.flyToBounds(b, { maxZoom: 15, padding: [50, 50], duration: 0.7 });
        } catch { /* noop */ }
      };
    // "Släpp en nål på kartan": nästa kartklick sätter min position (fallback när GPS nekas).
    // Ett-skotts click-handler + hårkors-markör; sätter pos = klickpunkten (accuracy 0 = ingen ring).
    (window as unknown as { __nearMePickLocation?: () => void }).__nearMePickLocation = () => {
      try {
        const c = map.getContainer();
        c.style.cursor = 'crosshair';
        const onClick = (e: L.LeafletMouseEvent) => {
          c.style.cursor = '';
          map.off('click', onClick);
          setNearMePos(e.latlng.lat, e.latlng.lng, 0);
        };
        map.on('click', onClick);
      } catch { /* noop */ }
    };
    return () => {
      try { delete (window as unknown as { __nearMeFlyTo?: unknown }).__nearMeFlyTo; } catch { /* noop */ }
      try { delete (window as unknown as { __nearMeFitFeatures?: unknown }).__nearMeFitFeatures; } catch { /* noop */ }
      try { delete (window as unknown as { __nearMePickLocation?: unknown }).__nearMePickLocation; } catch { /* noop */ }
    };
  }, [map]);

  // Zooma kartan till MIN position när en ny lokalisering kommer in (Daniel: på mobil ska
  // den flyga till platsen jag är på). Flyger EN gång per ny position (ej vid radie-byte).
  const flownRef = useRef<string | null>(null);
  useEffect(() => {
    if (!map || !isMapReady.current || !open || !pos) { if (!open) flownRef.current = null; return; }
    const key = `${pos.lat.toFixed(5)},${pos.lng.toFixed(5)}`;
    if (flownRef.current === key) return;
    flownRef.current = key;
    try {
      // Billäge (bil): zooma IN på min plats (körnära), inte ut till hela 40 km-radien.
      if (driving) { map.flyTo([pos.lat, pos.lng], 13, { duration: 0.8 }); return; }
      const b = L.circle([pos.lat, pos.lng], { radius: radiusKm * 1000 }).getBounds();
      map.flyToBounds(b, { maxZoom: 14, padding: [40, 40], duration: 0.8 });
    } catch { try { map.flyTo([pos.lat, pos.lng], 13, { duration: 0.8 }); } catch { /* noop */ } }
  }, [map, isMapReady, open, pos, radiusKm, driving]);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!open || !pos) return;

    // I billäget ritar Följ färd-käglan min live-position; hoppa över den stora 40 km-radien,
    // noggrannhetsringen och den statiska pricken (annars två positionsmarkörer + fult radie-lock).
    if (!driving) {
      // Sökradie (visar området listan täcker)
      L.circle([pos.lat, pos.lng], { radius: radiusKm * 1000, color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: 0.06 }).addTo(layer);
      // GPS-noggrannhetsring
      if (pos.accuracy) L.circle([pos.lat, pos.lng], { radius: pos.accuracy, color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: 0.12, dashArray: '4 3' }).addTo(layer);
      // Min position
      L.circleMarker([pos.lat, pos.lng], { radius: 7, color: '#ffffff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 })
        .bindTooltip('Du är här', { direction: 'top' }).addTo(layer);
    }
    // Träffmarkörer
    (results ?? []).forEach((f) => {
      L.circleMarker([f.lat, f.lng], { radius: 5, color: '#0c4a6e', weight: 1, fillColor: '#22d3ee', fillOpacity: 0.9 })
        .bindPopup(`<strong>${esc(f.label)}</strong><br/><span style="font-size:11px;color:#666">${esc(f.feature_type)} · ${dist(f.distance_km)}</span>${heritageExtra(f.parish, f.source_uri)}${detailButton(f.feature_type, f.feature_id)}`)
        .addTo(layer);
    });
    return () => { layer.clearLayers(); };
  }, [map, isMapReady, open, pos, radiusKm, results, driving]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
