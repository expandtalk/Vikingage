import React from 'react';
import { Ruler, GripVertical } from 'lucide-react';
import { useRuler, toggleRuler, clearRuler, rulerKm } from '@/hooks/useRuler';
import { useDraggable } from '@/hooks/useDraggable';

// Steg 2d: knapp för punkt-till-punkt-linjalen + avståndsvisning. Flyttbar via greppet.
export const RulerControl: React.FC = () => {
  const { active, pts } = useRuler();
  const { rootRef, dragHandleProps, style } = useDraggable();
  return (
    <div ref={rootRef} style={style} className="absolute top-4 right-4 z-[1050] flex flex-col items-end gap-1">
      <div {...dragHandleProps} className="flex items-center gap-0.5 cursor-grab active:cursor-grabbing select-none">
        <GripVertical className="h-4 w-4 text-slate-400" />
        <button
          onClick={toggleRuler}
          title="Mät avstånd mellan två punkter"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border-2 shadow-lg backdrop-blur-md transition-colors ${
            active ? 'bg-amber-500/90 border-amber-400 text-white' : 'bg-slate-900/95 border-slate-500 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Ruler className="h-4 w-4" />{active ? 'Linjal på' : 'Linjal'}
        </button>
      </div>
      {active && (
        <div className="bg-slate-900/95 border border-slate-600 rounded-lg shadow-lg px-2.5 py-1.5 text-[11px] text-slate-200">
          {pts.length === 2
            ? <span><strong className="text-amber-300">{rulerKm(pts[0], pts[1]).toFixed(1)} km</strong> · <button onClick={clearRuler} className="text-slate-400 hover:text-white underline">rensa</button></span>
            : <span>Klicka {2 - pts.length} punkt{2 - pts.length === 1 ? '' : 'er'} till på kartan</span>}
        </div>
      )}
    </div>
  );
};
