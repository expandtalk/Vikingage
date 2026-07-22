import React from 'react';
import { X, Circle, Square, Hexagon } from 'lucide-react';
import {
  useProximityProbe,
  setProbeRadiusKm,
  setProbeShape,
  setProbeMode,
  clearProbe,
  TRANSPORT_MODES,
  type ProbeShape,
} from '@/hooks/useProximityProbe';

// Flytande kontroll som visas när en räckvidds-sond är aktiv (klick på kyrka/fornborg).
// Form (cirkel/fyrkant/hexagon), transport-preset (dagsresa) och fri radie.
const SHAPES: { key: ProbeShape; label: string; Icon: typeof Circle }[] = [
  { key: 'circle', label: 'Cirkel', Icon: Circle },
  { key: 'square', label: 'Fyrkant', Icon: Square },
  { key: 'hexagon', label: 'Hexagon', Icon: Hexagon },
];

export const ProximityControl: React.FC = () => {
  const { probe, radiusKm, shape, modeKey } = useProximityProbe();
  if (!probe) return null;
  const activeMode = TRANSPORT_MODES.find((m) => m.key === modeKey);
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] w-80 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-xs font-medium truncate">Räckvidd: {probe.label}</span>
        <button onClick={clearProbe} aria-label="Stäng" className="text-slate-300 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form */}
      <div className="flex gap-1 mb-2">
        {SHAPES.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setProbeShape(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[11px] border transition-colors ${
              shape === key ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Transport-presets (dagsresa) */}
      <div className="text-[10px] text-slate-400 mb-1">Dagsresa (sätter radien):</div>
      <div className="flex flex-wrap gap-1 mb-2">
        {TRANSPORT_MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setProbeMode(m.key)}
            title={m.note}
            className={`px-2 py-1 rounded text-[10px] border transition-colors ${
              modeKey === m.key ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {m.labelSv} {m.radiusKm}km
          </button>
        ))}
      </div>
      {activeMode && <div className="text-[10px] text-slate-500 mb-2">{activeMode.note}</div>}

      {/* Fri radie */}
      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
        <span>Radie</span>
        <span className="font-semibold text-white">{radiusKm} km <span className="text-slate-500">(⌀ {radiusKm * 2} km)</span></span>
      </div>
      <input
        type="range" min={1} max={120} step={1} value={radiusKm}
        onChange={(e) => setProbeRadiusKm(Number(e.target.value))}
        className="w-full accent-amber-500 cursor-pointer"
        aria-label="Radie i kilometer"
      />
      <div className="mt-1 text-[10px] text-slate-500">Ortnamn (grön) · kulturlager (lila) · runstenar (röd) · fornborg (orange)</div>
    </div>
  );
};
