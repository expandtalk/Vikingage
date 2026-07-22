import { describe, it, expect } from 'vitest';
import { computeHaradDensity } from './runeDensity';

describe('computeHaradDensity', () => {
  it('aggregerar per härad med korrekt antal och centroid', () => {
    const inscriptions = [
      // Vallentuna härad — 2 stenar, koordinat via coordinates.lat/lng
      { signum: 'U 1', harad: 'Vallentuna härad', landscape: 'Uppland', coordinates: { lat: 59.5, lng: 18.0 } },
      { signum: 'U 2', harad: 'Vallentuna härad', landscape: 'Uppland', coordinates: { lat: 59.6, lng: 18.2 } },
      // Bro härad — 3 stenar, koordinat via latitude/longitude (fallback)
      { signum: 'U 3', harad: 'Bro härad', landscape: 'Uppland', latitude: 59.5, longitude: 17.5 },
      { signum: 'U 4', harad: 'Bro härad', landscape: 'Uppland', latitude: 59.5, longitude: 17.7 },
      { signum: 'U 5', harad: 'Bro härad', landscape: 'Uppland', latitude: 59.5, longitude: 17.9 },
      // Utan koordinat och utan härad — ska hoppas över
      { signum: 'U 6', harad: 'Bro härad', landscape: 'Uppland' },
      { signum: 'U 7', harad: '', landscape: 'Uppland', coordinates: { lat: 60.0, lng: 15.0 } },
    ];

    const result = computeHaradDensity(inscriptions);

    // Två härader (sorterade A–Ö: Bro före Vallentuna)
    expect(result.map((r) => r.name)).toEqual(['Bro härad', 'Vallentuna härad']);

    const bro = result.find((r) => r.name === 'Bro härad')!;
    expect(bro.count).toBe(3);
    expect(bro.landscape).toBe('Uppland');
    expect(bro.centroidLat).toBeCloseTo(59.5, 6);
    expect(bro.centroidLng).toBeCloseTo(17.7, 6);

    const vallentuna = result.find((r) => r.name === 'Vallentuna härad')!;
    expect(vallentuna.count).toBe(2);
    expect(vallentuna.centroidLat).toBeCloseTo(59.55, 6);
    expect(vallentuna.centroidLng).toBeCloseTo(18.1, 6);

    // De två häradernas centroider skiljer sig åt
    expect(bro.centroidLng).not.toBeCloseTo(vallentuna.centroidLng, 3);
  });

  it('returnerar tom lista utan indata', () => {
    expect(computeHaradDensity([])).toEqual([]);
    expect(computeHaradDensity(undefined as any)).toEqual([]);
  });
});
