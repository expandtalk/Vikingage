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

  // Popupens klick-hanterare läser ALLTID färskast position via en ref, oberoende av när
  // popupen/lagret senast ritades om.
  const posRef = useRef(pos);
  posRef.current = pos;

  // Popup-innehållet byggs som RIKTIGA DOM-noder (createElement/textContent/addEventListener) —
  // INTE en HTML-sträng med inline onclick="...". Ortnamn-etiketter (label) kommer från
  // användarinmatning/framtida objektnamn (Task 4) och kan innehålla citattecken, apostrofer m.m.
  // (t.ex. genitivformer som "Björkös udde"); en interpolerad onclick-sträng skulle då kunna bryta
  // ut ur attributet (attribut-injektion). textContent + slutna closures over p/label undviker
  // hela buggklassen — ingen sträng-escaping behövs eller kan glömmas bort.
  const buildPopupContent = (p: MarkedPlace, label: string, coordTxt: string): HTMLElement => {
    const container = document.createElement('div');
    container.style.minWidth = '190px';
    // Markerar containern så useMarkedPlaceTriggers.ts (Task 4) vet att INTE injicera sin egen
    // "📌 Markera"-knapp här — denna popup TILLHÖR redan en markerad plats, en till knapp skulle
    // bara skapa en dubblettnål på samma punkt.
    container.dataset.markedPlacePopup = 'true';

    const title = document.createElement('strong');
    title.textContent = label;
    container.appendChild(title);

    const coordRow = document.createElement('div');
    coordRow.style.cssText = 'font-size:11px;color:#64748b;margin-top:2px';
    coordRow.appendChild(document.createTextNode(`${coordTxt} `));
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.title = 'Kopiera koordinater';
    copyBtn.textContent = '📋';
    copyBtn.style.cssText = 'margin-left:4px;border:none;background:none;cursor:pointer;font-size:11px';
    copyBtn.addEventListener('click', () => {
      const txt = `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
      navigator.clipboard?.writeText(txt).catch(() => { /* privat läge/permission — icke-kritiskt */ });
    });
    coordRow.appendChild(copyBtn);
    container.appendChild(coordRow);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:6px;margin-top:8px';

    const routeBtn = document.createElement('button');
    routeBtn.type = 'button';
    routeBtn.textContent = '🚗 Väg hit';
    routeBtn.style.cssText = 'flex:1;padding:5px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px';
    routeBtn.addEventListener('click', () => {
      const here = posRef.current;
      if (!here) {
        toast.error('Aktivera plats för att se vägen dit.');
        return;
      }
      setRoadtripSearching();
      route({ lat: here.lat, lng: here.lng }, { lat: p.lat, lng: p.lng })
        .then((result) => {
          if (!result) {
            setRoadtripError('Ingen rutt hittades.');
            toast.error('Ingen rutt hittades.');
            return;
          }
          setRoadtripResult({ lat: p.lat, lng: p.lng, label }, result);
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : 'Ruttberäkningen misslyckades.';
          setRoadtripError(msg);
          toast.error(msg);
        });
      map?.closePopup();
    });
    btnRow.appendChild(routeBtn);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '🗑️ Ta bort';
    removeBtn.style.cssText = 'flex:1;padding:5px;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:4px;cursor:pointer;font-size:12px';
    removeBtn.addEventListener('click', () => {
      removeMarkedPlace(p.id);
      map?.closePopup();
    });
    btnRow.appendChild(removeBtn);

    container.appendChild(btnRow);
    return container;
  };

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();

    places.forEach((p: MarkedPlace) => {
      const label = p.label && p.label.trim() ? p.label : fmtCoord(p.lat, p.lng);
      const coordTxt = fmtCoord(p.lat, p.lng);
      L.marker([p.lat, p.lng], { icon: markerIcon() })
        .bindPopup(buildPopupContent(p, label, coordTxt), { maxWidth: 240 })
        .addTo(layer);
    });

    return () => { layer.clearLayers(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- buildPopupContent är stabil per render, inte en dep-källa i sig
  }, [map, isMapReady, places]);

  // Städa lagret när kartan byts/avmonteras.
  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
