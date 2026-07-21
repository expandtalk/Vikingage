import React from 'react';
import { X } from 'lucide-react';
import { useProximityProbe, setProbeRadiusKm, clearProbe } from '@/hooks/useProximityProbe';

// Flytande kontroll som visas när en omkrets-sond är aktiv (klick på kyrka/fornborg).
// Justerar radien dynamiskt (1–20 km, default 9) och stänger sonden.
export const ProximityControl: React.FC = () => {
  const { probe, radiusKm } = useProximityProbe();
  if (!probe) return null;
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] w-72 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-xs font-medium truncate">Omkrets: {probe.label}</span>
        <button onClick={clearProbe} aria-label="Stäng omkrets" className="text-slate-300 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
        <span>Radie</span>
        <span className="font-semibold text-white">{radiusKm} km</span>
      </div>
      <input
        type="range"
        min={1}
        max={20}
        step={1}
        value={radiusKm}
        onChange={(e) => setProbeRadiusKm(Number(e.target.value))}
        className="w-full accent-amber-500 cursor-pointer"
        aria-label="Omkretsradie i kilometer"
      />
      <div className="mt-1 text-[10px] text-slate-500">Ortnamn (grön) · kulturlager (lila) · runstenar (röd) · fornborg (orange)</div>
    </div>
  );
};
