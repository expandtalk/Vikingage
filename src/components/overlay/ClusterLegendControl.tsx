import React, { useState } from 'react';
import { HelpCircle, X, GripVertical } from 'lucide-react';
import { useDraggable } from '@/hooks/useDraggable';

// Liten hjälpruta som förklarar vad kartklustren betyder. Hopfälld pill som standard.
// Två klustersystem finns: runstenar (grå ᛘ) och Kulturlager (färgad disk = familj).

const FAMILIES: { color: string; label: string }[] = [
  { color: '#1c1917', label: 'Kyrkligt (kyrka, kloster, ruin)' },
  { color: '#7c3aed', label: 'Folktradition & sägen' },
  { color: '#78350f', label: 'Gravar & monument' },
  { color: '#0369a1', label: 'Marinarkeologi (vrak, spärrar)' },
  { color: '#92600e', label: 'Vägar & stenar' },
  { color: '#0ea5e9', label: 'Källor & vatten' },
  { color: '#f59e0b', label: 'Vårdkasar' },
  { color: '#9a3412', label: 'Hällristningar' },
];

const Dot: React.FC<{ color: string; children?: React.ReactNode }> = ({ color, children }) => (
  <span style={{ background: color }} className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-200 shrink-0 text-[9px] text-white font-bold">
    {children}
  </span>
);

export const ClusterLegendControl: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const { rootRef, dragHandleProps, style } = useDraggable();

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute bottom-4 left-4 z-[1100] flex items-center gap-1.5 bg-slate-900 border border-slate-600 rounded-full shadow-2xl px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
      >
        <HelpCircle className="h-3.5 w-3.5" />Vad betyder klustren?
      </button>
    );
  }

  return (
    <div ref={rootRef} style={style} className="absolute bottom-4 left-4 z-[1100] w-72 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl text-slate-200">
      <div {...dragHandleProps} className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing select-none">
        <GripVertical className="h-3.5 w-3.5 text-slate-500" />
        <HelpCircle className="h-4 w-4 text-amber-300" />
        <span className="text-white text-xs font-medium flex-1">Vad betyder klustren?</span>
        <button onClick={() => setCollapsed(true)} className="text-slate-400 hover:text-white" title="Fäll ihop">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pb-3 space-y-3">
        <div className="flex items-start gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[11px] font-bold text-slate-100"
            style={{ background: 'radial-gradient(circle at 40% 32%, #64748b 0%, #334155 70%, #1e293b 100%)', border: '1.5px solid #e2e8f0' }}>ᛘ</span>
          <div className="text-[11px] leading-snug">
            <span className="text-white font-medium">Runstenar</span> — grå bubbla med ᛘ. Eget lager, <em>på som standard</em>. Släcks via <span className="text-slate-100">”ᛘ Runstenar”</span> i teckenförklaringen.
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Dot color="#78350f">7</Dot>
          <div className="text-[11px] leading-snug">
            <span className="text-white font-medium">Kulturlager</span> — färgad disk. <span className="text-slate-100">Färg = familj</span>, ikon = typ, siffra = antal i området. <span className="text-slate-100">Klicka för att zooma in</span> och se dem var för sig.
          </div>
        </div>

        <div className="border-t border-slate-700 pt-2">
          <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">Familjefärger</div>
          <div className="grid grid-cols-1 gap-1">
            {FAMILIES.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-[11px]">
                <Dot color={f.color} />
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-500 leading-snug">
          Glesa områden (färre än 5) visas som enskilda markörer i stället för bubbla.
        </p>
      </div>
    </div>
  );
};
