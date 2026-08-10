// src/hooks/map/useMapMarkedPlaces.ts
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { toast } from 'sonner';
import { useMarkedPlaces, removeMarkedPlace, type MarkedPlace } from '@/hooks/useMarkedPlaces';
import { useFieldNav } from '@/hooks/useFieldNav';
import { route } from '@/services/routing';
import { setRoadtripResult, setRoadtripSearching, setRoadtripError } from '@/hooks/useRoadtrip';

// Ritar användarens egna markerade platser (localStorage, Task 1: useMarkedPlaces) som röda nålar.
// Alltid synligt — inget legend-gate, precis som useMapCustomPoints. Popup: geoposition + kopiera,
// "Väg hit" (bilrutt via samma roadtrip-lager som NearMeControl använder) och "Ta bort".
interface Props { map: L.Map | null; isMapReady: React.RefObject<boolean> }

const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

const fmtCoord = (lat: number, lng: number) => `${lat.toFixed(5)}° N / ${lng.toFixed(5)}° Ö`;

// Röd nål — egen klass/CSS (index.css: .marked-place-marker) så den är visuellt SKILD från den
// gröna "här"-markören (.here-marker, Task 2) och den amber "led mig hit"-målmarkören
// (.field-nav-target). Ingen av dessa tre får kunna förväxlas.
const markerIcon = () => L.divIcon({
  className: 'marked-place-marker',
  html: `<div class="marked-place-pin"></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export const useMapMarkedPlaces = ({ map, isMapReady }: Props) => {
  const places = useMarkedPlaces();
  // useFieldNav().pos = här-positionen (Task 2). "Väg hit" läser den vid klicktillfället —
  // ALDRIG en hårdkodad/gissad koordinat. route() (services/routing.ts) har inget färdsätt-
  // parameter (ren OSRM driving-profil, samma som NearMeControls goRoadtrip/goHem) — travel-mode
  // styr därför inte själva ruttberäkningen, bara om/när roadtrip-panelen visas i UI:t.
  const { pos } = useFieldNav();
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Popup-HTML byggs som sträng (utanför React, samma mönster som useMapCustomPoints/
  // useFieldNavTargetTriggers) och kan därför inte läsa hooks direkt. En window-brygga läser
  // ALLTID färskast state via en ref — sätts en gång, inte per popup/render.
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    const w = window as unknown as { __markedPlaceRouteHere?: (id: string, lat: number, lng: number, label: string) => void };
    w.__markedPlaceRouteHere = (_id, lat, lng, label) => {
      const here = posRef.current;
      if (!here) {
        toast.error('Aktivera plats för att se vägen dit.');
        return;
      }
      setRoadtripSearching();
      route({ lat: here.lat, lng: here.lng }, { lat, lng })
        .then((result) => {
          if (!result) {
            setRoadtripError('Ingen rutt hittades.');
            toast.error('Ingen rutt hittades.');
            return;
          }
          setRoadtripResult({ lat, lng, label }, result);
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : 'Ruttberäkningen misslyckades.';
          setRoadtripError(msg);
          toast.error(msg);
        });
      if (map) map.closePopup();
    };
    return () => {
      try { delete (window as unknown as { __markedPlaceRouteHere?: unknown }).__markedPlaceRouteHere; } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bryggan läser refs, inte deps
  }, [map]);

  useEffect(() => {
    const w = window as unknown as { __markedPlaceRemove?: (id: string) => void };
    w.__markedPlaceRemove = (id) => { removeMarkedPlace(id); if (map) map.closePopup(); };
    return () => {
      try { delete (window as unknown as { __markedPlaceRemove?: unknown }).__markedPlaceRemove; } catch { /* noop */ }
    };
  }, [map]);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();

    places.forEach((p: MarkedPlace) => {
      const label = p.label && p.label.trim() ? p.label : fmtCoord(p.lat, p.lng);
      const coordTxt = fmtCoord(p.lat, p.lng);
      L.marker([p.lat, p.lng], { icon: markerIcon() })
        .bindPopup(
          `<div style="min-width:190px">
             <strong>${esc(label)}</strong>
             <div style="font-size:11px;color:#64748b;margin-top:2px">
               ${coordTxt}
               <button onclick='navigator.clipboard && navigator.clipboard.writeText(${JSON.stringify(`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`)})'
                 title="Kopiera koordinater"
                 style="margin-left:4px;border:none;background:none;cursor:pointer;font-size:11px">📋</button>
             </div>
             <div style="display:flex;gap:6px;margin-top:8px">
               <button onclick='window.__markedPlaceRouteHere && window.__markedPlaceRouteHere(${JSON.stringify(p.id)}, ${p.lat}, ${p.lng}, ${JSON.stringify(label)})'
                 style="flex:1;padding:5px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">
                 🚗 Väg hit
               </button>
               <button onclick='window.__markedPlaceRemove && window.__markedPlaceRemove(${JSON.stringify(p.id)})'
                 style="flex:1;padding:5px;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:4px;cursor:pointer;font-size:12px">
                 🗑️ Ta bort
               </button>
             </div>
           </div>`,
          { maxWidth: 240 },
        ).addTo(layer);
    });

    return () => { layer.clearLayers(); };
  }, [map, isMapReady, places]);

  // Städa lagret när kartan byts/avmonteras.
  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
