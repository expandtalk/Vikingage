import { buildRegionGroups } from '@/components/regions/regionGrouping';

/**
 * Runstenstäthet per härad — ett aggregat (GIS-analysresultat) som kan ritas som
 * ett eget kartlager. Återanvänder buildRegionGroups('hundreds') så grupperingen
 * (med landskaps-disambiguering) är identisk med härads-listvyn.
 */
export interface HaradDensity {
  name: string;        // häradsnamn
  landscape: string;   // majoritets-landskap (tom om spretigt)
  count: number;       // antal runstenar med koordinat i häradet
  centroidLat: number; // medelvärde av medlemmarnas latitud
  centroidLng: number; // medelvärde av medlemmarnas longitud
}

const coordOf = (i: any): { lat: number; lng: number } | null => {
  const lat = i?.coordinates?.lat ?? i?.latitude;
  const lng = i?.coordinates?.lng ?? i?.longitude;
  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;
};

/**
 * Beräkna täthet + centroid per härad. Centroiden är medelvärdet av medlemsstenarnas
 * koordinater; stenar utan koordinat hoppas över (härader utan någon koordinatsatt
 * sten faller bort helt).
 */
export const computeHaradDensity = (inscriptions: any[]): HaradDensity[] => {
  const groups = buildRegionGroups(inscriptions ?? [], 'hundreds');
  const out: HaradDensity[] = [];
  for (const g of groups) {
    let sumLat = 0;
    let sumLng = 0;
    let n = 0;
    for (const i of g.inscriptions) {
      const c = coordOf(i);
      if (!c) continue;
      sumLat += c.lat;
      sumLng += c.lng;
      n += 1;
    }
    if (n === 0) continue;
    out.push({
      name: g.name,
      landscape: g.landscape,
      count: n,
      centroidLat: sumLat / n,
      centroidLng: sumLng / n,
    });
  }
  return out;
};
