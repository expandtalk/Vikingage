import React from 'react';
import { useTimeEpoch, setEpoch, EPOCHS } from '@/hooks/useTimeEpoch';

// Flytande tidsepok-väljare för arts-/introduktionslagret. Visas när lagret är på.
export const EpochControl: React.FC<{ visible: boolean }> = ({ visible }) => {
  const epoch = useTimeEpoch();
  if (!visible) return null;
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1050] bg-slate-900/95 border border-slate-600 rounded-lg shadow-2xl px-3 py-2">
      <div className="text-[10px] text-slate-400 mb-1 text-center">🐾 Tidsepok (arter & introduktioner)</div>
      <div className="flex flex-wrap gap-1 justify-center">
        {EPOCHS.map((e) => (
          <button
            key={e.key}
            onClick={() => setEpoch(e.key)}
            className={`px-2 py-1 rounded text-[11px] border transition-colors ${
              epoch === e.key ? 'bg-purple-500/25 border-purple-400 text-purple-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  );
};
