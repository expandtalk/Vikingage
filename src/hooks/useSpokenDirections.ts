import { useEffect, useRef, useState } from 'react';
import type { RouteResult } from '@/services/routing';
import { nextManeuver, type LatLng } from '@/utils/navHud';
import { announceForManeuver } from '@/utils/spokenDirections';

// Stigande ordning är AVSIKTLIGT — .find() nedan tar första träffen där distanceM <= t, dvs.
// den MINSTA tröskeln som är >= avståndet (den tröskel man just passerat). Med fallande ordning
// ([500,200,50]) hade 500 alltid matchat först för allt <=500 m, dedupe-nyckeln hade permanent
// blivit "...@500" och 200/50-utropen hade aldrig triggat (bugg hittad i review av Task 6).
const THRESHOLDS = [50, 200, 500]; // meter

// Läser upp nästa manöver vid fasta avståndströsklar, en gång per (manöver, tröskel).
// Web Speech API (sv-SE), OS-röst. Mute stänger av. Ingen ny backend.
export function useSpokenDirections(route: RouteResult | null, pos: LatLng | null) {
  const [muted, setMuted] = useState(false);
  const spoken = useRef<Set<string>>(new Set());
  // Mute ska tysta en redan pågående fras direkt, inte bara förhindra nya — egen effekt som
  // bara reagerar på muted-flankar (annars skulle varje positionsuppdatering under mute avbryta
  // tal i onödan).
  useEffect(() => {
    if (muted && typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, [muted]);
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
