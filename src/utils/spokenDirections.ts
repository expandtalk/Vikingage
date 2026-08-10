import type { Maneuver } from '@/services/routing';

// Modifier → svensk kärnfras. OSRM-modifierare. 'straight' hanteras via type=continue nedan.
const DIR: Record<string, string> = {
  left: 'Sväng vänster', right: 'Sväng höger',
  'slight left': 'Håll vänster', 'slight right': 'Håll höger',
  'sharp left': 'Sväng skarpt vänster', 'sharp right': 'Sväng skarpt höger',
  uturn: 'Gör en U-sväng',
};

// Bygger en kort svensk instruktion ur en manöver. Rena data → ren funktion, ingen DOM.
export function announceForManeuver(m: Maneuver): string {
  const road = m.road?.trim();
  const onto = road ? `, in på ${road}` : '';
  let core: string;
  if (m.type === 'roundabout' || m.type === 'rotary') core = 'Kör in i rondellen';
  else if (m.modifier === 'uturn') core = 'Gör en U-sväng';
  else if (m.type === 'continue' || m.modifier === 'straight') core = 'Fortsätt rakt fram';
  else if (m.modifier && DIR[m.modifier]) core = DIR[m.modifier];
  else return 'Fortsätt.';
  // U-sväng nämner sällan väg meningsfullt → utan onto.
  if (core === 'Gör en U-sväng') return 'Gör en U-sväng.';
  return `${core}${onto}.`;
}
