import { getEnhancedCoordinates } from '@/utils/coordinateMappingEnhanced';
import { BaseInscription } from '@/types/inscription';

export const processInscriptionCoordinates = (
  inscriptions: any[],
  isVikingMode: boolean
): BaseInscription[] => {
  console.log('🔧 Processing inscriptions with enhanced coordinates...');
  
  const enhancedInscriptions = inscriptions.map(inscription => {
    // Ensure we have required properties for BaseInscription type
    const inscriptionWithId: BaseInscription = {
      id: inscription.id || inscription.signum || 'unknown',
      signum: inscription.signum || 'unknown',
      name: inscription.name,
      latitude: inscription.latitude,
      longitude: inscription.longitude,
      country: inscription.country,
      landscape: inscription.landscape,
      period: inscription.period,
      status: inscription.status,
      object_type: inscription.object_type,
      location: inscription.location,
      coordinates: inscription.coordinates,
      // Bär med konfidens/källa/virtuell-flagga så kartan kan tona osäkra markörer.
      coord_confidence: inscription.coord_confidence,
      coord_source: inscription.coord_source,
      virtual_inscription: inscription.virtual_inscription
    };

    if (!inscriptionWithId.coordinates && (!inscriptionWithId.latitude || !inscriptionWithId.longitude)) {
      const coords = getEnhancedCoordinates(inscriptionWithId, isVikingMode);
      if (coords) {
        return {
          ...inscriptionWithId,
          coordinates: coords,
          latitude: coords.lat,
          longitude: coords.lng
        };
      }
    }
    return inscriptionWithId;
  });

  const inscriptionsWithCoords = enhancedInscriptions.filter(i => 
    (i.coordinates && i.coordinates.lat && i.coordinates.lng) || 
    (i.latitude && i.longitude)
  );

  console.log(`📊 Coordinate processing results:`);
  console.log(`  - Original inscriptions: ${inscriptions.length}`);
  console.log(`  - After coordinate enhancement: ${enhancedInscriptions.length}`);
  console.log(`  - With valid coordinates: ${inscriptionsWithCoords.length}`);

  return inscriptionsWithCoords;
};
