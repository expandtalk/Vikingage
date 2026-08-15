import { describe, it, expect } from 'vitest';
import { DEFAULT_PLACE_LAYERS, resolvePlaceLayers, placeLayerStyleMap } from './placeLayers';

describe('placeLayers', () => {
  it('resolvePlaceLayers returnerar default utan argument', () => {
    expect(resolvePlaceLayers()).toBe(DEFAULT_PLACE_LAYERS);
  });
  it('resolvePlaceLayers returnerar custom när given', () => {
    const custom = [{ key: 'runsten', label: 'R', color: '#f00', radius: 4, defaultOn: true }];
    expect(resolvePlaceLayers(custom)).toBe(custom);
  });
  it('default innehåller runsten-lagret med defaultOn', () => {
    expect(DEFAULT_PLACE_LAYERS.find((l) => l.key === 'runsten')?.defaultOn).toBe(true);
  });
  it('placeLayerStyleMap nycklar på layer-key', () => {
    const m = placeLayerStyleMap(DEFAULT_PLACE_LAYERS);
    expect(m.runsten.color).toBe(DEFAULT_PLACE_LAYERS.find((l) => l.key === 'runsten')!.color);
  });
});
