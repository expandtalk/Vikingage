import { describe, it, expect } from 'vitest';
import { mapNeighbor } from '@/config/entityDestinations';

describe('mapNeighbor', () => {
  it('estate-granne -> destination med grannens etikett', () => {
    const d = mapNeighbor({ direction: 'out', predicate: 'has_estate', other_id: 'e1', other_type: 'estate', other_label: 'Nyköpingshus' });
    expect(d?.label).toBe('Nyköpingshus');
    expect(d?.destination.route).toContain('focus=fortresses');
    expect(d?.predicate).toBe('has_estate');
  });
  it('dynasty-granne -> royal-chronicles', () => {
    const d = mapNeighbor({ direction: 'out', predicate: 'belongs_to_dynasty', other_id: 'd1', other_type: 'dynasty', other_label: 'Ätten Grip' });
    expect(d?.destination.route).toBe('/royal-chronicles');
  });
  it('okänd other_type -> null', () => {
    expect(mapNeighbor({ direction: 'out', predicate: 'x', other_id: 'y', other_type: 'nonsense', other_label: 'z' })).toBeNull();
  });
});
