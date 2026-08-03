
import { useRef, useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import { useMapInstance } from './useMapInstance';
import { useMapTileLayer } from './useMapTileLayer';
import { useMapRiverSystems } from './useMapRiverSystems';
import { useMapValdemarsRoute } from './useMapValdemarsRoute';
import { useMapEriksgata } from './useMapEriksgata';
import { useMapBeaconSites } from './useMapBeaconSites';
import { useMapHeritageSites } from './useMapHeritageSites';
import { useMapThingSites } from './useMapThingSites';
import { useMapChurches } from './map/useMapChurches';
import { useMapChristianSites } from './map/useMapChristianSites';
import { useMapExperiences } from './map/useMapExperiences';
import { useMapOverlaySettings } from './useMapOverlaySettings';
import { useMapProximityProbe } from './map/useMapProximityProbe';
import { useMapHistoricalOverlays } from './map/useMapHistoricalOverlays';
import { useReachProbeTriggers } from './map/useReachProbeTriggers';
import { useMapSpeciesMarkers } from './map/useMapSpeciesMarkers';
import { useMapElementMarkers } from './map/useMapElementMarkers';
import { useMapRuler } from './map/useMapRuler';
import { useMapNearMe } from './map/useMapNearMe';
import { useMapRoadtrip } from './map/useMapRoadtrip';
import { useMapFieldNav } from './map/useMapFieldNav';
import { useFieldNavGeolocation } from './map/useFieldNavGeolocation';
import { useFieldNavWakeLock } from './map/useFieldNavWakeLock';
import { useFieldNavTargetTriggers } from './map/useFieldNavTargetTriggers';
import { useMapLayerViewport } from './map/useMapLayerViewport';
import { useMapMaritimeLayers } from './map/useMapMaritimeLayers';
import { useMapMuseums } from './map/useMapMuseums';
import { useMapFortTerritories } from './map/useMapFortTerritories';
import { useMapPictureStones } from './map/useMapPictureStones';
import { useMapCoins } from './map/useMapCoins';
import { useMapAncestrySites } from './map/useMapAncestrySites';
import { useMapSolidi } from './map/useMapSolidi';
import { useMapCustomPoints } from './map/useMapCustomPoints';
import { useRuneDensityLayer } from './map/useRuneDensityLayer';
import { useMapEstates } from './useMapEstates';
import { useMapCentralPlaces } from './map/useMapCentralPlaces';
import { useActiveExploreProfile } from './useExploreProfiles';

interface UseMapInitializationProps {
  isVikingMode: boolean;
  enabledLegendItems: { [key: string]: boolean };
  selectedPeriod: string;
  selectedTimePeriod: string;
  inscriptions?: any[];
  onRefreshRivers?: (refreshFn: () => void) => void; // Fix callback signature
}

export const useMapInitialization = ({
  isVikingMode,
  enabledLegendItems,
  selectedPeriod,
  selectedTimePeriod,
  inscriptions = [],
  onRefreshRivers
}: UseMapInitializationProps) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const [riverRefreshTrigger, setRiverRefreshTrigger] = useState(0);
  const isMapReadyRef = useRef<boolean>(false);
  
  const { mapContainer, map } = useMapInstance({ isVikingMode });
  const activeProfile = useActiveExploreProfile();

  const geoControlAdded = useRef(false);
  const geoMarker = useRef<L.CircleMarker | null>(null);

  // Wait for map to be initialized
  useEffect(() => {
    if (map.current) {
      setIsMapReady(true);
      isMapReadyRef.current = true;
    }
  }, [map]);

  // "Visa min plats" — geolokaliseringsknapp som zoomar till användarens position.
  useEffect(() => {
    if (!map.current || !isMapReady || geoControlAdded.current) return;
    geoControlAdded.current = true;

    const GeoControl = L.Control.extend({
      options: { position: 'topleft' as L.ControlPosition },
      onAdd: () => {
        const btn = L.DomUtil.create('a', 'leaflet-bar leaflet-control leaflet-control-custom');
        btn.href = '#';
        btn.title = 'Visa min plats / Show my location';
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', 'Visa min plats');
        btn.innerHTML = '📍';
        btn.style.cssText =
          'display:flex;align-items:center;justify-content:center;width:30px;height:30px;font-size:16px;background:#fff;text-decoration:none;cursor:pointer;';
        L.DomEvent.on(btn, 'click', (e: Event) => {
          L.DomEvent.stop(e);
          if (!navigator.geolocation || !map.current) return;
          btn.innerHTML = '⏳';
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              btn.innerHTML = '📍';
              const { latitude, longitude } = pos.coords;
              map.current!.setView([latitude, longitude], 12);
              if (geoMarker.current) geoMarker.current.remove();
              geoMarker.current = L.circleMarker([latitude, longitude], {
                radius: 8, color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.6, weight: 2,
              }).addTo(map.current!).bindPopup('Din plats').openPopup();
            },
            () => { btn.innerHTML = '📍'; },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
          );
        });
        return btn;
      },
    });

    const ctrl = new GeoControl();
    map.current.addControl(ctrl);
  }, [map, isMapReady]);

  // Safe layer addition function
  // useCallback (dep []) — annars nyskapas funktionen varje render och triggar
  // (via useEffect-deps i lager-hooksen) en teardown+refetch-loop mot Supabase
  // som fryser kartan när flera lager är på samtidigt.
  const safelyAddLayer = useCallback((layer: L.Layer): boolean => {
    if (!map.current || !isMapReadyRef.current) {
      return false;
    }

    try {
      map.current.addLayer(layer);
      return true;
    } catch (error) {
      console.error('Error adding layer:', error);
      return false;
    }
  }, []);

  // Expose refresh function via callback
  useEffect(() => {
    if (onRefreshRivers) {
      const refreshRivers = () => {
        setRiverRefreshTrigger(prev => prev + 1);
      };
      onRefreshRivers(refreshRivers);
    }
  }, [onRefreshRivers]);

  // Användarvald bakgrundskarta vinner över profilens default (Kartor-sektionens radio).
  const { basemapOverride } = useMapOverlaySettings();

  // Add tile layer with proper parameters
  useMapTileLayer({
    map: map.current,
    basemap: basemapOverride ?? activeProfile.basemap,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    mapContainer,
    safelyAddLayer,
  });

  // Add river systems only if enabled - pass object parameters with all required props
  useMapRiverSystems({
    map: map.current,
    isVikingMode,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    safelyAddLayer,
    selectedTimePeriod,
    refreshTrigger: riverRefreshTrigger
  });

  // Add Valdemar's route only if enabled
  useMapValdemarsRoute({
    map: map.current,
    isVikingMode,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    safelyAddLayer,
    selectedTimePeriod
  });

  // Eriksgatan (kungavalets riksrunda) — ritas från DB när legendknappen är på
  useMapEriksgata({
    map: map.current,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    safelyAddLayer,
  });

  // Vårdkasar (RAÄ-lämningar) — eget lager, klustrat, gate: legendknappen
  useMapBeaconSites({
    map: map.current,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    safelyAddLayer,
  });

  // Kulturarv (spatialt, viewport-laddat) — Steg 1 proof: sites_in_bbox/near.
  // Laddar bara det som är i vyn → tål obegränsat antal punkter.
  useMapHeritageSites({
    map: map.current,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    selectedTimePeriod,
  });

  // Rikt kyrkolager (ecclesiastical_sites: byggår/stift/socken/härad/ruin + Commons-bild).
  useMapChurches({
    map: map.current,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
  });

  // Kurerat kyrkolager (christian_sites: rik per-kyrka-berättelse m. källor + egen glyf
  // för försvunna kyrkor). Gate: periodtogglarna (default PÅ). Detta var det saknade
  // renderingslagret — ChristianSiteMarker fanns men monterades aldrig.
  useMapChristianSites({
    map: map.current,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
  });

  // Lokalguide/upplevelser (experiences: badplatser m.fl.) — säsongsmedvetet lager.
  useMapExperiences({
    map: map.current,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
  });

  // Historiska Lantmäteri-kartor som opt-in overlay-rastrar (tiles från FTP).
  useMapHistoricalOverlays({
    map: map.current,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
  });

  // Omkrets-sond: cirkel + närliggande lager kring vald kyrka/fornborg.
  useMapProximityProbe({ map: map.current, isMapReady: isMapReadyRef });

  // Räckvidds-sonden tillgänglig ÖVERALLT: injicerar knapp i alla popuper + högerklick.
  useReachProbeTriggers({ map: map.current });

  // Art-/innovationsintroduktioner (koordinatsatta), filtrerat på vald tidsepok.
  useMapSpeciesMarkers({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef, selectedTimePeriod });

  // Ortnamnsled-spotlight (2c): visar OSM-orter med valt led (URL ?element=tor).
  useMapElementMarkers({ map: map.current, isMapReady: isMapReadyRef });

  // Punkt-till-punkt-linjal (2d).
  useMapRuler({ map: map.current, isMapReady: isMapReadyRef });

  // "Near me": min position + sökradie + närhetsträffar (mobilt närhetsuppslag).
  useMapNearMe({ map: map.current, isMapReady: isMapReadyRef });

  // Roadtrip-läge (bil): ritar geokodad bilrutt + målmarkör. Store matas av NearMeControl.
  useMapRoadtrip({ map: map.current, isMapReady: isMapReadyRef });

  // Fältläge (steg 1: bil/vägföljning) — live-position + roterande riktningskägla, opt-in.
  useMapFieldNav({ map: map.current, isMapReady: isMapReadyRef });
  useFieldNavGeolocation();
  useFieldNavWakeLock();

  // "Led mig hit": popup-knapp (mobil) + window.__fieldNavTarget-brygga → sätter fältläge-mål.
  useFieldNavTargetTriggers({ map: map.current });

  // Per-lager zoom-avsikt (legendens "zooma hit"): punktlager in, farleder/rutter/floder ut.
  useMapLayerViewport({ map: map.current });

  // Marinarkeologi: maritima noder (fingerprint-popup), haverier, farleder, Hansa.
  useMapMaritimeLayers({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef, safelyAddLayer });
  useMapMuseums({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef, safelyAddLayer });

  // Förskatte-borgterritorier (Öland Voronoi) — hypotesgenererande lager.
  useMapFortTerritories({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef, safelyAddLayer });

  // Bildsten-spolia (picture_stone_reuse) — färg per Lindqvist-period, gate: legendknappen.
  useMapPictureStones({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef });

  // Mynt/fynd (coins) på fyndplats-koordinat — färg per metall, gate: legendknappen.
  useMapCoins({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef, selectedTimePeriod });
  useMapSolidi({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef, selectedTimePeriod });

  // Tingsplatser (thing_sites, Wildte 1926 m.fl.) — färg per tingstyp, gate: legendknappen.
  useMapThingSites({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef });

  // aDNA-platser (archaeological_sites + genetic_individuals) — gate: legendknappen.
  useMapAncestrySites({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef, selectedTimePeriod });

  // Mina punkter (localStorage) — användarens egna ortnamn, alltid synliga.
  useMapCustomPoints({ map: map.current, isMapReady: isMapReadyRef });

  // Runstenstäthet per härad (GIS-analyslager) — centroid-cirklar, gate: legendknappen.
  useRuneDensityLayer({
    map: map.current,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    safelyAddLayer,
    inscriptions,
  });

  // Maktsäten (estates + innehav över tid) — ekonomihistorikerns lager, gate: legendknappen.
  useMapEstates({
    map: map.current,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    safelyAddLayer,
  });

  // Centralorter + koordinatsatta ortnamn (Agnetas forskning) — tänds via ?central=1 (Öppna kartan
  // från /sv/angermanland) el. legendknappen 'central_places'. Annars fanns datan bara på AngMap.
  useMapCentralPlaces({ map: map.current, enabledLegendItems, isMapReady: isMapReadyRef });

  return {
    mapContainer, 
    map: map.current,
    isMapReady
  };
};
