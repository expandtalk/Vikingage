import { describe, it, expect } from 'vitest';
import { turnGlyph } from './NavigatorHud';

describe('turnGlyph', () => {
  it('maps OSRM modifiers to arrow glyphs', () => {
    expect(turnGlyph('left')).toBe('↰');
    expect(turnGlyph('right')).toBe('↱');
    expect(turnGlyph('straight')).toBe('↑');
    expect(turnGlyph(null)).toBe('↑'); // default rakt fram
    expect(turnGlyph('slight left')).toBe('↖');
    expect(turnGlyph('slight right')).toBe('↗');
  });
});
