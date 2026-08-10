import { useEffect, useRef, useState } from 'react';
import type { RouteResult } from '@/services/routing';
import { nextManeuver, type LatLng } from '@/utils/navHud';
import { announceForManeuver } from '@/utils/spokenDirections';

const THRESHOLDS = [500, 200, 50]; // meter

// Läser upp nästa manöver vid fasta avståndströsklar, en gång per (manöver, tröskel).
// Web Speech API (sv-SE), OS-röst. Mute stänger av. Ingen ny backend.
export function useSpokenDirections(route: RouteResult | null, pos: LatLng | null) {
  const [muted, setMuted] = useState(false);
  const spoken = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (muted || !route || !pos || typeof window === 'undefined' || !window.speechSynthesis) return;
    const nt = nextManeuver(route.maneuvers, pos);
    if (!nt) return;
    const crossed = THRESHOLDS.find((t) => nt.distanceM <= t);
    if (crossed == null) return;
    const key = `${nt.maneuver.lat},${nt.maneuver.lng}@${crossed}`;
    if (spoken.current.has(key)) return;
    spoken.current.add(key);
    const u = new SpeechSynthesisUtterance(announceForManeuver(nt.maneuver));
    u.lang = 'sv-SE';
    window.speechSynthesis.speak(u);
  }, [route, pos, muted]);
  return { muted, setMuted };
}
