import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Hexagon, GripVertical } from 'lucide-react';
import { useCustomPoints, addCustomPoint, removeCustomPoint } from '@/hooks/useCustomPoints';
import { useProximityProbe, setProbe, setProbeShape, setProbeRadiusKm } from '@/hooks/useProximityProbe';
import { useDraggable } from '@/hooks/useDraggable';

// "Mina punkter": lägg in egna ortnamn + position (lokalt), analysera 9 km runt dem.
// Flyttbar via greppet i rubriken.
export const CustomPointsControl: React.FC = () => {
  const points = useCustomPoints();
  const { probe } = useProximityProbe();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const { rootRef, dragHandleProps, style } = useDraggable();

  const add = () => {
    const la = parseFloat(lat.replace(',', '.')), ln = parseFloat(lng.replace(',', '.'));
    if (!isFinite(la) || !isFinite(ln)) return;
    addCustomPoint(name, la, ln);
    setName(''); setLat(''); setLng('');
  };
  const analyse9 = (la: number, ln: number, label: string) => {
    setProbe(la, ln, label); setProbeShape('hexagon'); setProbeRadiusKm(9);
  };

  return (
    <div ref={rootRef} style={style} className="absolute bottom-4 left-4 z-[1100] w-72 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl">
      <div {...dragHandleProps} className="flex items-center cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-slate-500 ml-1.5 shrink-0" />
        <button onClick={() => setOpen((o) => !o)} className="flex-1 flex items-center justify-between px-2 py-2 text-white text-xs font-medium">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-amber-400" />Mina punkter {points.length > 0 && `(${points.length})`}</span>
          <span className="text-slate-400">{open ? '▾' : '▸'}</span>
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3">
          <p className="text-[10px] text-slate-400 mb-2">Lägg in egna ortnamn + position (sparas lokalt i din webbläsare). Analysera vad som finns inom 9 km.</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Namn"
            className="w-full mb-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs" />
          <div className="flex gap-1 mb-1">
            <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="lat (59.62)"
              className="flex-1 min-w-0 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs" />
            <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="lng (17.72)"
              className="flex-1 min-w-0 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs" />
          </div>
          <div className="flex gap-1 mb-2">
            <button onClick={add} className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs">
              <Plus className="h-3 w-3" />Lägg till
            </button>
            {probe && (
              <button onClick={() => { setLat(String(probe.lat.toFixed(5))); setLng(String(probe.lng.toFixed(5))); if (!name) setName(probe.label); }}
                title="Fyll i från sondens punkt" className="px-2 py-1 rounded border border-slate-700 text-slate-300 text-xs hover:bg-slate-800">
                ← sond
              </button>
            )}
          </div>
          {points.length === 0 ? (
            <p className="text-[10px] text-slate-500">Inga punkter än. Tips: klicka en kyrka/fornborg på kartan, tryck "← sond", spara.</p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {points.map((p) => (
                <li key={p.id} className="flex items-center gap-1 text-xs">
                  <span className="flex-1 min-w-0 truncate text-slate-200" title={`${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`}>{p.name}</span>
                  <button onClick={() => analyse9(p.lat, p.lng, p.name)} title="Analysera 9 km (hexagon)"
                    className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500 text-amber-200"><Hexagon className="h-3 w-3" /></button>
                  <button onClick={() => removeCustomPoint(p.id)} title="Ta bort" className="px-1 text-slate-500 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
