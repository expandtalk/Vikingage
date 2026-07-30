
import { ArchaeologicalFind } from './types';

export interface FindCluster {
  id: string;
  finds: ArchaeologicalFind[];
  centerLat: number;
  centerLng: number;
  count: number;
}

export const clusterFinds = (finds: ArchaeologicalFind[], radiusKm: number = 5): (ArchaeologicalFind | FindCluster)[] => {
  const clusters: FindCluster[] = [];
  const processed = new Set<string>();
  const singleFinds: ArchaeologicalFind[] = [];

  finds.forEach(find => {
    if (processed.has(find.id)) return;

    const nearbyFinds = finds.filter(otherFind => {
      if (processed.has(otherFind.id) || find.id === otherFind.id) return false;
      
      const distance = calculateDistance(find.lat, find.lng, otherFind.lat, otherFind.lng);
      return distance <= radiusKm;
    });

    if (nearbyFinds.length > 0) {
      // Create cluster
      const allFinds = [find, ...nearbyFinds];
      const centerLat = allFinds.reduce((sum, f) => sum + f.lat, 0) / allFinds.length;
      const centerLng = allFinds.reduce((sum, f) => sum + f.lng, 0) / allFinds.length;
      
      clusters.push({
        id: `cluster_${find.id}`,
        finds: allFinds,
        centerLat,
        centerLng,
        count: allFinds.length
      });

      allFinds.forEach(f => processed.add(f.id));
    } else {
      // Single find
      singleFinds.push(find);
      processed.add(find.id);
    }
  });

  return [...clusters, ...singleFinds];
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);
