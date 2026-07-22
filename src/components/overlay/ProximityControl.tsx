import React from 'react';
import { X, Circle, Square, Hexagon } from 'lucide-react';
import {
  useProximityProbe,
  setProbeRadiusKm,
  setProbeShape,
  setProbeMode,
  setProbeNote,
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
  const { probe, radiusKm, shape, modeKey, counts, note } = useProximityProbe();
  if (!probe) return null;
  const activeMode = TRANSPORT_MODES.find((m) => m.key === modeKey);
  const shapeSv = shape === 'circle' ? 'cirkeln' : shape === 'square' ? 'fyrkanten' : 'hexagonen';
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

      {/* Agnetas 9 km — daglig maskvidd (Christallers administrativa princip) */}
      <button
        onClick={() => { setProbeShape('hexagon'); setProbeRadiusKm(9); }}
        title="Agneta Nyholms tes: allt ett samhälle behöver finns inom ~9 km. Matchar sockennätets maskvidd (kyrka→kyrka p90 = 9,4 km) och Christallers administrativa princip (k=7)."
        className={`w-full mb-2 px-2 py-1.5 rounded text-[11px] border transition-colors ${
          shape === 'hexagon' && radiusKm === 9 ? 'bg-amber-500/25 border-amber-500 text-amber-100' : 'border-amber-700/60 text-amber-200 hover:bg-slate-800'
        }`}
      >
        ⬡ Daglig maskvidd 9 km (Agnetas tes)
      </button>
      <div className="text-[10px] text-slate-500 mb-2 leading-snug">
        <strong className="text-slate-400">Christallers centralortsteori:</strong> hexagonen är den administrativa
        principen (k=7) — en centralort + 6 beroende bygder. ~9 km = sockennätets maskvidd och en daglig tur-retur
        till fots. Jfr härad/fylke som ledungs-/skattedistrikt (troligen romerskinspirerat).
      </div>

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

      {/* Hypotes / anteckning knuten till området (namn = platsen, hypotes = fri text) */}
      <textarea
        value={note}
        onChange={(e) => setProbeNote(e.target.value)}
        placeholder="Hypotes / vad testar du här? (t.ex. 'kungsgård kontrollerar allt inom en dagsresa till fots')"
        rows={2}
        className="w-full mt-2 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-[11px] placeholder:text-slate-500 resize-y"
      />

      {/* Antal INUTI formen (punkt-i-polygon) — det analytiska värdet */}
      {counts && (
        <div className="mt-2 pt-2 border-t border-slate-700/60">
          <div className="text-[10px] text-slate-400 mb-1">Inuti {shapeSv} ({counts.area_km2.toLocaleString()} km²):</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            <span className="text-slate-300">Runstenar</span><span className="text-right font-semibold text-red-300">{counts.runestones.toLocaleString()}</span>
            <span className="text-slate-300">Kulturlager</span><span className="text-right font-semibold text-purple-300">{counts.kulturlager.toLocaleString()}</span>
            <span className="text-slate-300">Ortnamn (kurerade)</span><span className="text-right font-semibold text-emerald-300">{counts.place_names_curated.toLocaleString()}</span>
            <span className="text-slate-300">Ortnamn (registret)</span><span className="text-right font-semibold text-emerald-200">{counts.place_names_osm.toLocaleString()}</span>
            <span className="text-slate-300">Fornborgar</span><span className="text-right font-semibold text-orange-300">{counts.fortresses.toLocaleString()}</span>
          </div>
        </div>
      )}
      <div className="mt-2 text-[10px] text-slate-500">Prickar: ortnamn (grön) · kulturlager (lila) · runstenar (röd) · fornborg (orange). Registrets ortnamn (OSM) räknas men ritas ej.</div>
    </div>
  );
};
