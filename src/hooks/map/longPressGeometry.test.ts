// src/hooks/map/longPressGeometry.test.ts
import { describe, it, expect } from 'vitest';
import { exceedsMoveThreshold, LONG_PRESS_MOVE_CANCEL_PX } from './longPressGeometry';

describe('exceedsMoveThreshold', () => {
  it('is false when the finger has not moved', () => {
    expect(exceedsMoveThreshold(0, 0)).toBe(false);
  });
  it('is false just under the default threshold', () => {
    expect(exceedsMoveThreshold(LONG_PRESS_MOVE_CANCEL_PX - 1, 0)).toBe(false);
  });
  it('is true once the diagonal distance clears the default threshold', () => {
    expect(exceedsMoveThreshold(LONG_PRESS_MOVE_CANCEL_PX, LONG_PRESS_MOVE_CANCEL_PX)).toBe(true);
  });
  it('honors a custom threshold', () => {
    expect(exceedsMoveThreshold(5, 0, 3)).toBe(true);
    expect(exceedsMoveThreshold(2, 0, 3)).toBe(false);
  });
});
