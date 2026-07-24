import { describe, it, expect } from 'vitest';
import { destinationFor } from './entityDestinations';

describe('destinationFor', () => {
  it('king -> royal-chronicles', () => {
    const d = destinationFor('king', { entity_id: 'k1', label: 'Magnus Eriksson' });
    expect(d?.route).toBe('/royal-chronicles');
    expect(d?.labelSv).toBe('Kungar');
  });
  it('church -> /kyrkor (ny typ)', () => {
    const d = destinationFor('church', { entity_id: 'c1', label: 'Hossmo kyrka' });
    expect(d?.route).toBe('/kyrkor');
  });
  it('estate -> maktsäten-fokus (ny typ)', () => {
    const d = destinationFor('estate', { entity_id: 'e1', label: 'Kalmar (slott)' });
    expect(d?.route).toContain('focus=fortresses');
  });
  it('cult_site -> cultSites-fokus (ny typ)', () => {
    const d = destinationFor('cult_site', { entity_id: 'cs1', label: 'Klinta' });
    expect(d?.route).toContain('focus=cultSites');
  });
  it('okänd typ -> null', () => {
    expect(destinationFor('nonsense', { entity_id: 'x', label: 'y' })).toBeNull();
  });
});
