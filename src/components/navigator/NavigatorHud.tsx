import React from 'react';
import { hudModel } from '@/utils/navHud';
import { useRoadtrip } from '@/hooks/useRoadtrip';
import { useFieldNav } from '@/hooks/useFieldNav';
import { useDrivingMode } from '@/hooks/useDrivingMode';

// OSRM-modifier → pil-glyf. Default (okänd/null) = rakt fram.
export function turnGlyph(modifier: string | null): string {
  switch (modifier) {
    case 'left': return '↰';
    case 'right': return '↱';
    case 'slight left': return '↖';
    case 'slight right': return '↗';
    case 'sharp left': return '↰';
    case 'sharp right': return '↱';
    case 'uturn': return '↩';
    case 'straight':
    default: return '↑';
  }
}

const fmtM = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);

// HUD i billäget: överst aktuell väg + nästa manöver; nederst pil + vägnamn + klocka + ETA + km.
// Ren vy — all härledning i hudModel(). Nu-tid läses en gång per render (billäget re-renderar
// vid varje positionsuppdatering från useFieldNav).
export const NavigatorHud: React.FC = () => {
  const driving = useDrivingMode();
  const { route } = useRoadtrip();
  const { pos } = useFieldNav();
  if (!driving || !route) return null;
  const nowMs = new Date().getTime();
  const m = hudModel(route, pos ? { lat: pos.lat, lng: pos.lng } : null, nowMs);

  return (
    <>
      {/* Överst: aktuell väg + nästa manöver */}
      <div className="fixed top-0 inset-x-0 z-[1200] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 flex items-center gap-3">
        {m.nextTurn && <span className="text-3xl leading-none" aria-hidden>{turnGlyph(m.nextTurn.modifier)}</span>}
        <div className="min-w-0">
          {m.nextTurn
            ? <div className="text-base font-semibold truncate">{m.nextTurn.road || 'Fortsätt'} <span className="text-slate-300 font-normal">om {fmtM(m.nextTurn.inM)}</span></div>
            : <div className="text-base font-semibold truncate">{m.currentRoad || 'Kör'}</div>}
          {m.currentRoad && <div className="text-xs text-slate-400 truncate">på {m.currentRoad}</div>}
        </div>
      </div>

      {/* Nederst: pil + vägnamn + klocka + ETA + kvarvarande km */}
      <div className="fixed bottom-0 inset-x-0 z-[1200] bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-4xl leading-none" aria-hidden>{m.nextTurn ? turnGlyph(m.nextTurn.modifier) : '↑'}</span>
          <span className="text-lg font-semibold truncate">{m.currentRoad || '—'}</span>
        </div>
        <div className="shrink-0 text-right leading-tight">
          <div className="text-lg font-bold tabular-nums">{m.arrival}</div>
          <div className="text-xs text-slate-300 tabular-nums">{m.remaining} · {m.remainingKm}</div>
        </div>
      </div>
    </>
  );
};
