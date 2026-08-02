// src/hooks/useFieldNav.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  startFieldNav, stopFieldNav, setFieldNavPos, setFieldNavError,
  setFieldNavFollowing, getFieldNavSnapshot,
} from './useFieldNav';

beforeEach(() => stopFieldNav()); // nollställ modulstate mellan testerna

describe('useFieldNav store', () => {
  it('starts inactive', () => {
    expect(getFieldNavSnapshot().active).toBe(false);
  });
  it('start activates and follows by default', () => {
    startFieldNav();
    const s = getFieldNavSnapshot();
    expect(s.active).toBe(true);
    expect(s.following).toBe(true);
    expect(s.pos).toBeNull();
  });
  it('setFieldNavPos stores the position and clears error', () => {
    startFieldNav();
    setFieldNavError('boom');
    setFieldNavPos({ lat: 56.6, lng: 16.4, accuracy: 12, headingDeg: 90, headingSource: 'gps', speed: 8 });
    const s = getFieldNavSnapshot();
    expect(s.pos?.lat).toBe(56.6);
    expect(s.pos?.headingSource).toBe('gps');
    expect(s.error).toBeNull();
  });
  it('setFieldNavFollowing toggles follow', () => {
    startFieldNav();
    setFieldNavFollowing(false);
    expect(getFieldNavSnapshot().following).toBe(false);
  });
  it('stop clears everything', () => {
    startFieldNav();
    setFieldNavPos({ lat: 1, lng: 2, accuracy: 3, headingDeg: null, headingSource: null, speed: null });
    stopFieldNav();
    const s = getFieldNavSnapshot();
    expect(s.active).toBe(false);
    expect(s.pos).toBeNull();
    expect(s.following).toBe(true);
  });
});
