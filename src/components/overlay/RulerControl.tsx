import React from 'react';
import { Ruler, GripVertical, Target, Undo2 } from 'lucide-react';
import { useRuler, toggleRuler, clearRuler, rulerKm, rulerPathKm, setRulerMode, undoRulerPoint } from '@/hooks/useRuler';
import { setProbe, setProbeRadiusKm, TRANSPORT_MODES } from '@/hooks/useProximityProbe';
import { useDraggable } from '@/hooks/useDraggable';

// Gör linjalens två punkter till ett hypotes-område: sond i mittpunkten med radie = halva
// avståndet (så formen spänner mellan punkterna). Namn + hypotes fylls sen i sond-panelen.
const rulerToProbe = (a: { lat: number; lng: number }, b: { lat: number; lng: number }, km: number) => {
  const mid = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
  setProbe(mid.lat, mid.lng, `Linjal-område (${km.toFixed(1)} km)`);
  setProbeRadiusKm(Math.max(1, Math.round(km / 2)));
};

// Dagsresor för de färdsätt som gäller på Långhundraleden: gå eller ro/paddla.
// radiusKm i TRANSPORT_MODES = km/dag → dagsresor = sträcka / km-per-dag.
const TRAVEL = ['foot', 'boat_row'] as const;

// Steg 2d: knapp för punkt-till-punkt-linjalen + avståndsvisning. Flyttbar via greppet.
// Två lägen: "Enkel" (A→B, → hypotes-område) och "Sträcka" (N punkter, kumulativ längd
// + dagsresor — som informationstavlans 0–10 km-skala fast även uttryckt i restid).
export const RulerControl: React.FC = () => {
  const { active, mode, pts } = useRuler();
  const { rootRef, dragHandleProps, style } = useDraggable();
  const pathKm = rulerPathKm(pts);
  const days = (kmPerDay: number) => pathKm / kmPerDay;
  return (
    <div ref={rootRef} style={style} className="absolute top-4 right-4 z-[1050] flex flex-col items-end gap-1">
      <div {...dragHandleProps} className="flex items-center gap-0.5 cursor-grab active:cursor-grabbing select-none">
        <GripVertical className="h-4 w-4 text-slate-400" />
        <button
          onClick={toggleRuler}
          title="Mät avstånd mellan två punkter, eller en sträcka längs leden"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border-2 shadow-lg backdrop-blur-md transition-colors ${
            active ? 'bg-amber-500/90 border-amber-400 text-white' : 'bg-slate-900/95 border-slate-500 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Ruler className="h-4 w-4" />{active ? 'Linjal på' : 'Linjal'}
        </button>
      </div>
      {active && (
        <div className="bg-slate-900/95 border border-slate-600 rounded-lg shadow-lg px-2.5 py-2 text-[11px] text-slate-200 flex flex-col items-stretch gap-1.5 w-52">
          {/* Lägesväljare: Enkel (A→B) eller Sträcka (bana) */}
          <div className="flex gap-1">
            {([['simple', 'Enkel'], ['path', 'Sträcka']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRulerMode(key)}
                title={key === 'simple' ? 'Rakt avstånd mellan två punkter' : 'Klicka flera punkter längs leden → kumulativ sträcka + dagsresor'}
                className={`flex-1 py-1 rounded border text-[11px] transition-colors ${
                  mode === key ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'simple' ? (
            pts.length === 2 ? (
              <div className="flex flex-col items-end gap-1.5">
                <span className="self-stretch text-right"><strong className="text-amber-300">{rulerKm(pts[0], pts[1]).toFixed(1)} km</strong> · <button onClick={clearRuler} className="text-slate-400 hover:text-white underline">rensa</button></span>
                <button
                  onClick={() => rulerToProbe(pts[0], pts[1], rulerKm(pts[0], pts[1]))}
                  title="Gör om sträckan till ett hypotes-område: sätt form, radie och skriv din hypotes i sond-panelen"
                  className="flex items-center gap-1 px-2 py-1 rounded border border-amber-600/60 text-amber-200 hover:bg-amber-500/15"
                >
                  <Target className="h-3 w-3" />Gör hypotes-område
                </button>
              </div>
            ) : (
              <span className="text-slate-300">Klicka {2 - pts.length} punkt{2 - pts.length === 1 ? '' : 'er'} till på kartan</span>
            )
          ) : (
            pts.length >= 2 ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <strong className="text-amber-300 text-sm">{pathKm.toFixed(1)} km</strong>
                  <span className="text-slate-500">{pts.length} punkter</span>
                </div>
                {/* Restid i dagsresor — leden gick till fots eller med kanot/rodd */}
                <div className="text-slate-300 leading-snug">
                  {TRAVEL.map((k) => {
                    const m = TRANSPORT_MODES.find((t) => t.key === k)!;
                    return (
                      <div key={k} className="flex justify-between">
                        <span title={m.note}>{m.labelSv}</span>
                        <span className="text-amber-200 font-medium">{days(m.radiusKm).toFixed(1)} dagsresor</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-2 pt-0.5">
                  <button onClick={undoRulerPoint} className="flex items-center gap-1 text-slate-400 hover:text-white"><Undo2 className="h-3 w-3" />ångra</button>
                  <button onClick={clearRuler} className="text-slate-400 hover:text-white underline">rensa</button>
                </div>
              </div>
            ) : (
              <span className="text-slate-300">Klicka punkter längs leden — sträckan och restiden räknas upp efterhand.</span>
            )
          )}
        </div>
      )}
    </div>
  );
};
