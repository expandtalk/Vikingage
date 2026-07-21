
import L from 'leaflet';
import { globalMarkerManager, getMarkerPriority } from '@/utils/markerPriority';

interface StakeBarrier {
  name: string;
  coordinates: { lat: number; lng: number };
  description: string;
  timePeriod: string;
  type: 'underwater_defense' | 'harbor_barrier' | 'river_defense';
}

const STAKE_BARRIERS: StakeBarrier[] = [
  {
    name: 'Norrström pålspärr',
    coordinates: { lat: 59.3273, lng: 18.0717 },
    description: 'Undervattenshinder i Norrström för att skydda Stockholm mot fientliga skepp under vikingatiden.',
    timePeriod: 'viking_age',
    type: 'river_defense'
  },
  {
    name: 'Birka undervattenshinder',
    coordinates: { lat: 59.3356, lng: 17.5419 },
    description: 'Pålspärrar och undervattenshinder som skyddade Birkas hamn mot attack från sjösidan.',
    timePeriod: 'viking_age',
    type: 'harbor_barrier'
  },
  {
    name: 'Sigtuna pålspärr',
    coordinates: { lat: 59.6192, lng: 17.7286 },
    description: 'Försvarshinder i vattnet vid Sigtuna för att kontrollera sjötrafik och försvara staden.',
    timePeriod: 'viking_age',
    type: 'river_defense'
  },
  {
    name: 'Hedeby hamnspärr',
    coordinates: { lat: 54.4894, lng: 9.5644 },
    description: 'Undervattenshinder och pålspärrar som skyddade Hedebys viktiga handelshamn.',
    timePeriod: 'viking_age',
    type: 'harbor_barrier'
  },
  {
    // Verifierad fornlämning (RAÄ Stockholm 660 / Fornsök L2013:4298), till skillnad
    // från övriga poster ovan. Koordinat ur Fornsök (SWEREF 99 TM → WGS84), lägesosäkerhet 45 m.
    name: 'Årstaviken spärranordning',
    coordinates: { lat: 59.306738, lng: 18.048976 },
    description: 'Möjlig fornlämning: tät pålrad/stockspärr vid Årstaholmarna som kontrollerade passagen mellan holmarna i Årstaviken. Trolig datering 900–1200-tal (ej dendrokronologiskt bestämd). Källa: Riksantikvarieämbetet, Fornsök L2013:4298 (RAÄ Stockholm 660).',
    timePeriod: 'viking_age',
    type: 'harbor_barrier'
  }
];

// Export function to get stake barriers data for legend
export const getStakeBarriers = (): StakeBarrier[] => {
  return STAKE_BARRIERS;
};

// Spärrarna är fysiskt små hamn-/älvhinder. På översiktszoom blir de stora
// etikett-pillren "blaffiga" och överlappar; vi visar dem då som en liten prick
// och fäller ut den fulla etiketten först när kartan är ordentligt inzoomad.
const FULL_LABEL_ZOOM = 11;

const fullLabelIcon = (barrier: StakeBarrier): L.DivIcon =>
  L.divIcon({
    html: `<div style="
      background: rgba(71, 85, 105, 0.95);
      height: 32px;
      border-radius: 16px;
      border: 2px solid #475569;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: #ffffff;
      text-align: center;
      padding: 0 10px;
      white-space: nowrap;
      gap: 4px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    ">
      <span style="font-size: 12px;">🛡️</span>
      <span>${barrier.name.replace('pålspärr', 'spärr').replace('undervattenshinder', 'hinder')}</span>
    </div>`,
    className: 'stake-barrier-marker',
    iconSize: [0, 32] as any,
    iconAnchor: [0, 16],
  });

const dotIcon = (): L.DivIcon =>
  L.divIcon({
    html: `<div style="
      background: rgba(71, 85, 105, 0.95);
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    "></div>`,
    className: 'stake-barrier-marker-dot',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const iconForZoom = (barrier: StakeBarrier, zoom: number): L.DivIcon =>
  zoom >= FULL_LABEL_ZOOM ? fullLabelIcon(barrier) : dotIcon();

export const addStakeBarrierMarkers = (
  map: L.Map | null,
  enabled: boolean = true
): L.Marker[] => {
  if (!map || !enabled) return [];

  const markers: L.Marker[] = [];
  const barrierByMarker: Array<{ marker: L.Marker; barrier: StakeBarrier }> = [];
  const markerType = 'stake_barriers';
  const priority = getMarkerPriority(markerType);

  STAKE_BARRIERS.forEach(barrier => {
    // Check with deduplication manager
    const shouldShow = globalMarkerManager.addMarker({
      location: { lat: barrier.coordinates.lat, lng: barrier.coordinates.lng },
      type: markerType,
      priority,
      name: barrier.name,
      data: barrier
    });

    if (!shouldShow) {
      console.log(`⏭️ Skipping stake barrier ${barrier.name} - higher priority marker exists`);
      return;
    }

    const marker = L.marker([barrier.coordinates.lat, barrier.coordinates.lng], {
      icon: iconForZoom(barrier, map.getZoom()),
    })
      .bindPopup(`
        <div style="background: rgba(30, 41, 59, 0.98) !important; color: white !important; padding: 14px; border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,0.4); border: 3px solid #475569; backdrop-filter: blur(6px); min-width: 280px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid #475569; background: rgba(71, 85, 105, 0.95); display: flex; align-items: center; justify-content: center; font-size: 16px;">
              <span style="color: #ffffff;">🛡️</span>
            </div>
            <div>
              <h3 style="font-weight: bold; font-size: 16px; color: #ffffff !important; margin: 0;">${barrier.name}</h3>
              <p style="font-size: 12px; color: rgba(255,255,255,0.7) !important; margin: 2px 0 0 0;">Försvarshinder</p>
            </div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <p style="color: rgba(255,255,255,0.9) !important; font-size: 13px; line-height: 1.5; margin: 0;">${barrier.description}</p>
          </div>
          
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; background: rgba(71, 85, 105, 0.8); color: #ffffff !important; border: 1px solid #475569;">
              🛡️ Undervattenshinder
            </span>
            <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; background: rgba(139, 69, 19, 0.6); color: #ffffff !important; border: 1px solid #8B4513;">
              ⚔️ Vikingatiden
            </span>
          </div>
          
          <div style="padding-top: 12px; border-top: 1px solid rgba(75, 85, 99, 0.5);">
            <p style="font-size: 11px; color: rgba(255,255,255,0.6) !important; margin: 0;">Strategisk försvarsposition från 800-1000-talen</p>
          </div>
        </div>
      `, {
        maxWidth: 320,
        className: 'stake-barrier-popup'
      });

    map.addLayer(marker);
    markers.push(marker);
    barrierByMarker.push({ marker, barrier });
  });

  // Zoom-reaktiv etikett: byt mellan prick och full etikett vid zoomend.
  // Handlern sparas på kartan så useMapLayers kan koppla bort den vid rensning.
  const existing = (map as any).__stakeBarrierZoom as (() => void) | undefined;
  if (existing) map.off('zoomend', existing);
  const onZoom = () => {
    const z = map.getZoom();
    barrierByMarker.forEach(({ marker, barrier }) => marker.setIcon(iconForZoom(barrier, z)));
  };
  map.on('zoomend', onZoom);
  (map as any).__stakeBarrierZoom = onZoom;

  console.log(`Added ${markers.length} stake barrier markers (after deduplication)`);
  return markers;
};
