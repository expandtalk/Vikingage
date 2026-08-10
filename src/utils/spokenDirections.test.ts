import { describe, it, expect } from 'vitest';
import { announceForManeuver } from './spokenDirections';
import type { Maneuver } from '@/services/routing';
const m = (o: Partial<Maneuver>): Maneuver => ({ type: 'turn', modifier: 'left', lat: 0, lng: 0, road: 'Väg 258', distanceM: 300, ...o });
describe('announceForManeuver', () => {
  it('left turn onto a named road', () => {
    expect(announceForManeuver(m({ modifier: 'left', road: 'Väg 258' }))).toBe('Sväng vänster, in på Väg 258.');
  });
  it('right with no road name omits the road clause', () => {
    expect(announceForManeuver(m({ modifier: 'right', road: '' }))).toBe('Sväng höger.');
  });
  it('slight/sharp variants', () => {
    expect(announceForManeuver(m({ modifier: 'slight left', road: '' }))).toBe('Håll vänster.');
    expect(announceForManeuver(m({ modifier: 'sharp right', road: '' }))).toBe('Sväng skarpt höger.');
  });
  it('straight = continue', () => {
    expect(announceForManeuver(m({ type: 'continue', modifier: 'straight', road: 'E22' }))).toBe('Fortsätt rakt fram, in på E22.');
  });
  it('roundabout', () => {
    expect(announceForManeuver(m({ type: 'roundabout', modifier: null, road: 'Storgatan' }))).toBe('Kör in i rondellen, in på Storgatan.');
  });
  it('uturn', () => {
    expect(announceForManeuver(m({ modifier: 'uturn', road: '' }))).toBe('Gör en U-sväng.');
  });
  it('unknown modifier falls back to a safe generic', () => {
    expect(announceForManeuver(m({ type: 'x', modifier: 'weird', road: '' }))).toBe('Fortsätt.');
  });
});
