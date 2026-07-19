import L from 'leaflet';

interface RunicInscription {
  id?: string;
  signum?: string;
  name?: string;
  location?: string;
  country?: string;
  landscape?: string;
  period?: string;
  status?: string;
  object_type?: string;
  dating?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  coord_confidence?: string | null;
  coord_source?: string | null;
  virtual_inscription?: boolean;
}

/**
 * Approximativ koordinat = ska tonas ned. Ritas dämpat (ihåligt, halvgenomskinligt)
 * så forskaren ser vilka punkter som är exakta och vilka som är ungefärliga.
 * Approximativ om: virtuell (socken-centroid), ELLER explicit låg/medium/okänd
 * konfidens, ELLER geokodad källa (nominatim/regional_center/socken-lookup).
 * SÄKER FALLBACK: om vyn ännu inte exponerar coord_confidence/coord_source (båda
 * undefined) matchar inget → allt ritas solitt (ingen regression innan migrationen
 * 20260718150000 körts). Verifierat = rundata/RAÄ, manuellt, user-exakt.
 */
const isApproximate = (inscription: RunicInscription): boolean => {
  if (inscription.virtual_inscription === true) return true;
  const conf = (inscription.coord_confidence ?? '').toLowerCase();
  if (conf === 'low' || conf === 'medium' || conf === 'unknown') return true;
  const src = (inscription.coord_source ?? '').toLowerCase();
  return src.includes('nominatim') || src.includes('regional_center') || src.includes('location lookup');
};

const getPeriodColor = (period?: string): string => {
  if (!period) return '#6b7280'; // gray-500
  const p = period.toLowerCase();
  if (p.includes('urnordisk')) return '#a855f7'; // purple-500
  if (p.includes('vendel')) return '#3b82f6'; // blue-500
  if (p.includes('viking')) return '#22c55e'; // green-500
  if (p.includes('medeltid')) return '#f97316'; // orange-500
  return '#6b7280'; // gray-500
};

const createRuneIcon = (inscription: RunicInscription): L.DivIcon => {
  const color = getPeriodColor(inscription.period);
  const approximate = isApproximate(inscription);

  // Verifierad: fylld cirkel, solid vit kant. Approximativ: dämpad (halv opacitet,
  // ihålig med streckad kant, mindre) så exakta lägen syns tydligt bland ungefärliga.
  const iconHtml = approximate
    ? `
    <div title="Ungefärlig plats (ej verifierad koordinat)" style="
      background-color: transparent;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px dashed ${color};
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      opacity: 0.55;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: ${color};
      font-weight: bold;
      font-family: sans-serif;
      cursor: pointer;
    ">
      ᛘ
    </div>
  `
    : `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
      font-weight: bold;
      font-family: sans-serif;
      cursor: pointer;
    ">
      ᛘ
    </div>
  `;

  const size: [number, number] = approximate ? [18, 18] : [24, 24];
  return L.divIcon({
    html: iconHtml,
    className: approximate ? 'custom-rune-icon custom-rune-icon-approx' : 'custom-rune-icon',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  });
};

export const addRunicInscriptionMarkers = (
  map: L.Map,
  inscriptions: RunicInscription[],
  onMarkerClick?: (inscription: RunicInscription) => void
): L.Marker[] => {
  // OBS: ingen per-markör-loggning här — 6 000+ console.log per omritning
  // frös renderingen (prestandafix 2026-07-20). En summeringsrad i slutet räcker.
  const markers: L.Marker[] = [];
  let validCoordinatesCount = 0;
  let invalidCoordinatesCount = 0;

  inscriptions.forEach((inscription) => {
    let lat: number | undefined;
    let lng: number | undefined;

    // Extract coordinates from various possible formats
    if (inscription.coordinates) {
      lat = inscription.coordinates.lat;
      lng = inscription.coordinates.lng;
    } else if (inscription.latitude && inscription.longitude) {
      lat = inscription.latitude;
      lng = inscription.longitude;
    }

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      validCoordinatesCount++;
      
      // Create rune-based icon
      const icon = createRuneIcon(inscription);
      
      try {
        const marker = L.marker([lat, lng], { icon, riseOnHover: true })
          .addTo(map);

        // Enhanced popup content with better formatting
        const popupContent = `
          <div class="runic-popup min-w-[200px]">
            <div class="popup-header bg-slate-800 text-white p-2 rounded-t">
              <h3 class="font-bold text-sm">${inscription.signum || 'Unknown'}</h3>
              ${inscription.name ? `<p class="text-xs text-slate-300">${inscription.name}</p>` : ''}
            </div>
            <div class="popup-content bg-white p-2 rounded-b">
              ${inscription.location ? `<p class="text-xs mb-1"><strong>Plats:</strong> ${inscription.location}</p>` : ''}
              ${inscription.country ? `<p class="text-xs mb-1"><strong>Land:</strong> ${inscription.country}</p>` : ''}
              ${inscription.landscape ? `<p class="text-xs mb-1"><strong>Landskap:</strong> ${inscription.landscape}</p>` : ''}
              ${inscription.period ? `<p class="text-xs mb-1"><strong>Period:</strong> ${inscription.period}</p>` : ''}
              ${inscription.status ? `<p class="text-xs mb-1"><strong>Status:</strong> ${inscription.status}</p>` : ''}
              ${inscription.object_type ? `<p class="text-xs mb-1"><strong>Objekttyp:</strong> ${inscription.object_type}</p>` : ''}
              ${inscription.dating ? `<p class="text-xs mb-1"><strong>Datering:</strong> ${inscription.dating}</p>` : ''}
              <p class="text-xs mb-1"><strong>Koordinater:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'runic-inscription-popup'
        });

        if (onMarkerClick) {
          marker.on('click', () => {
            onMarkerClick({
              id: inscription.id,
              signum: inscription.signum,
              name: inscription.name,
              location: inscription.location,
              country: inscription.country,
              landscape: inscription.landscape,
              period: inscription.period,
              status: inscription.status,
              object_type: inscription.object_type,
              dating: inscription.dating,
              latitude: lat,
              longitude: lng,
              coordinates: { lat, lng }
            });
          });
        }

        markers.push(marker);
      } catch (error) {
        console.error(`❌ Error creating marker for ${inscription.signum}:`, error);
        invalidCoordinatesCount++;
      }
    } else {
      invalidCoordinatesCount++;
    }
  });

  // EN summeringsrad i stället för tusentals loggar; invalidateSize borttagen —
  // markörer kräver ingen container-omätning och timeouten bidrog till hoppandet.
  console.log(`🗺️ Markörer: ${markers.length} tillagda (${validCoordinatesCount} med koordinater, ${invalidCoordinatesCount} utan)`);

  return markers;
};
