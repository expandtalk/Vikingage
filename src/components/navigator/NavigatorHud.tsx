import React from 'react';
import { Navigation2, Volume2, VolumeX, X } from 'lucide-react';
import { hudModelLive } from '@/utils/routeProgress';
import { useRoadtrip, clearRoadtrip } from '@/hooks/useRoadtrip';
import { useFieldNav, startFieldNav, stopFieldNav } from '@/hooks/useFieldNav';
import { useDrivingMode, setDrivingMode } from '@/hooks/useDrivingMode';
import { useSpokenDirections } from '@/hooks/useSpokenDirections';
import { Compass } from '@/components/navigator/Compass';

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

// HUD i billäget: överst aktuell väg + nästa manöver (+ tal/avsluta); nederst kompass + pil +
// vägnamn + klocka + ETA + km. Ren vy — all härledning i hudModel(). v1: ETA pinnas vid
// ruttstart; remaining/km är helrutts-totaler — live nedräkning kommer i Plan 2 (rutt-progress).
// Utan pinning skulle nowMs läsas färskt vid varje positionsuppdatering från useFieldNav och
// ankomsttiden kryper då framåt i takt med klockan i stället för att stå still.
//
// Två lägen: (1) rutt finns men billäget är inte påslaget än → en explicit, alltid nåbar
// "Följ färd"-knapp (slås INTE bara på implicit av Near me-panelens "Kör"-läge längre — bug 3).
// (2) billäge + rutt → full HUD med kompass, talad vägledning och "Avsluta resa".
export const NavigatorHud: React.FC = () => {
  const driving = useDrivingMode();
  const { route } = useRoadtrip();
  const { pos, active } = useFieldNav();
  // useMemo keyad på de faktiska lat/lng-talen — annars fick useSpokenDirections en ny
  // objektreferens varje render (pos-objektet från useFieldNav byts ut vid varje GPS-tick) och
  // dess effekt trodde "pos" alltid hade ändrats.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const posLL = React.useMemo(() => (pos ? { lat: pos.lat, lng: pos.lng } : null), [pos?.lat, pos?.lng]);
  // Hook måste anropas ovillkorligt (Rules of Hooks) — den avlyssnar tyst tills muted/route/pos
  // säger annat, så det är säkert att alltid montera den här.
  const { muted, setMuted } = useSpokenDirections(route, posLL);

  if (!route) return null;

  if (!driving) {
    // Explicit, alltid nåbar entré till körläget — oberoende av Near me-panelens eget
    // öppen/stängd- och vy-tillstånd (det var den implicita kopplingen som var bug 3).
    return (
      <button
        onClick={() => { setDrivingMode(true); if (!active) startFieldNav(); }}
        title="Följ färd — visa rutt-HUD med kompass och talad vägledning"
        aria-label="Följ färd"
        className="fixed z-[1200] left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white border-2 border-emerald-400 shadow-2xl backdrop-blur-md"
        // Samma bottom-offset som den fulla HUD:ens nedre rad (se kommentar därnere): rensar
        // NearMeControls minimerade footer (bottom-0, ~64 px) OCH sitter ovanför FieldNavControls
        // "Kompass till punkt"-pill (bottom-2) — utan detta överlappade knapparna på mobil
        // (bugg hittad i review av Task 6).
        style={{ bottom: 'calc(88px + env(safe-area-inset-bottom))', minHeight: 44 }}
      >
        <Navigation2 className="h-5 w-5" aria-hidden />
        <span className="text-sm font-semibold">Följ färd</span>
      </button>
    );
  }

  // Färsk tid: hudModelLive räknar arrival = nu + kvarvarande sträcka (position-baserat, sjunker med
  // färden → ankomsttiden står stilla, ingen klock-creep). Manöver + väg + km avancerar via routeProgress.
  const nowMs = new Date().getTime();
  const m = hudModelLive(route, posLL, nowMs);
  const endTrip = () => { clearRoadtrip(); setDrivingMode(false); stopFieldNav(); };

  return (
    <>
      {/* Överst: aktuell väg + nästa manöver + tal-mute + avsluta resa */}
      <div className="fixed top-0 inset-x-0 z-[1200] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 flex items-center gap-3">
        {m.nextTurn && <span className="text-3xl leading-none" aria-hidden>{turnGlyph(m.nextTurn.modifier)}</span>}
        <div className="min-w-0 flex-1">
          {m.nextTurn
            ? <div className="text-base font-semibold truncate">{m.nextTurn.road || 'Fortsätt'} <span className="text-slate-300 font-normal">om {fmtM(m.nextTurn.inM)}</span></div>
            : <div className="text-base font-semibold truncate">{m.currentRoad || 'Kör'}</div>}
          {/* Fågelväg-avstånd till manöver, ej ruttprogress — honest microcopy (Task 6d). */}
          <div className="text-xs text-slate-400 truncate">{m.currentRoad ? `på ${m.currentRoad} · ` : ''}ungefärlig vägledning</div>
        </div>
        <button
          onClick={() => setMuted(!muted)}
          title={muted ? 'Slå på talad vägledning' : 'Stäng av talad vägledning'}
          aria-label={muted ? 'Slå på talad vägledning' : 'Stäng av talad vägledning'}
          // Synlig pill (ram + bakgrund) i st.f. naken ikon — Daniel hittade inte ljudknappen.
          className={`shrink-0 flex items-center justify-center rounded-full border ${muted ? 'border-slate-600 bg-slate-800/80 text-slate-300' : 'border-emerald-500/60 bg-emerald-600/20 text-emerald-200'} hover:text-white`}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <button
          onClick={endTrip}
          title="Avsluta resa"
          aria-label="Avsluta resa"
          className="shrink-0 flex items-center justify-center text-slate-200 hover:text-white"
          style={{ minWidth: 40, minHeight: 40 }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nederst: kompass + pil + vägnamn + klocka + ETA + kvarvarande km.
          bottom-offset (ej bottom-0): i billäge+rutt (samma tillstånd som visar HUD:en)
          minimerar NearMeControl (src/components/overlay/NearMeControl.tsx) sig själv till
          bara sin headerrad (minimera/stäng/kurs-upp) förankrad vid inset-x-0 bottom-0 (mobil)
          resp. right-4 bottom-4 (desktop), ~64 px hög + ev. dra-handtag (12 px, mobil) + safe-area.
          Utan offset målar HUD:en (z-[1200]) över den raden och gör knapparna otryckbara.
          88 px + safe-area-inset-bottom ger marginal över värsta fallet (mobil, notch). */}
      <div
        className="fixed inset-x-0 z-[1200] bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 flex items-center justify-between gap-4"
        style={{ bottom: 'calc(88px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Compass headingDeg={pos?.headingDeg ?? null} />
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
