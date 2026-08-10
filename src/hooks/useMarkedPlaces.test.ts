import { describe, it, expect } from 'vitest';
import { parsePlaces, makePlace } from './useMarkedPlaces';

describe('marked places', () => {
  it('parsePlaces ignores malformed JSON → []', () => {
    expect(parsePlaces('not json')).toEqual([]);
    expect(parsePlaces(null)).toEqual([]);
  });
  it('parsePlaces keeps only well-formed rows', () => {
    const raw = JSON.stringify([{ id:'a', lat:57, lng:16, createdAt:1 }, { id:'bad' }, { lat:1, lng:2 }]);
    expect(parsePlaces(raw)).toEqual([{ id:'a', lat:57, lng:16, createdAt:1 }]);
  });
  it('makePlace builds a finite-coord place with id+createdAt', () => {
    const p = makePlace({ lat: 57.1, lng: 16.2, label: 'X' }, 1234, 'id1');
    expect(p).toEqual({ id:'id1', lat:57.1, lng:16.2, label:'X', createdAt:1234 });
  });
  it('makePlace rejects non-finite coords', () => {
    expect(() => makePlace({ lat: NaN, lng: 1 }, 0, 'x')).toThrow();
  });
});
