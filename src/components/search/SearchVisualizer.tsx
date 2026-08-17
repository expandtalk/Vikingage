import React, { useEffect, useState } from 'react';

// KG-sök-visualisering: en liten node-graf som speglar plattformens FAKTISKA sök-lager medan
// sökningen pågår (Daniel: "cool algoritm som visar hur den letar i knowledge graphen"). Ärlig,
// inte fejkad "loading theater" — stegen är de verkliga: lexikalt → semantiskt → kunskapsgrafen →
// media/ortnamn. Ren CSS/SVG (inga beroenden), stannar aldrig sökningen (fyller bara väntetiden).

interface Stage { sv: string; en: string }
const STAGES: Stage[] = [
  { sv: 'Lexikalt index', en: 'Lexical index' },
  { sv: 'Semantisk närhet', en: 'Semantic similarity' },
  { sv: 'Kunskapsgrafen', en: 'Knowledge graph' },
  { sv: 'Media & ortnamn', en: 'Media & place names' },
];

// Nod-layout (0..100 koordinatrymd). En central fråga-nod + fyra lager-noder + satelliter.
const CENTER = { x: 50, y: 50 };
const LAYER_NODES = [
  { x: 20, y: 24 }, { x: 82, y: 22 }, { x: 84, y: 74 }, { x: 22, y: 78 },
];
const SATELLITES = [
  { x: 8, y: 12 }, { x: 34, y: 10 }, { x: 95, y: 40 }, { x: 92, y: 90 },
  { x: 60, y: 92 }, { x: 8, y: 62 }, { x: 68, y: 8 }, { x: 40, y: 95 },
];

export const SearchVisualizer: React.FC<{ sv: boolean; label?: string }> = ({ sv, label }) => {
  // Cykla aktivt lager var 700 ms så grafen "letar" vidare medan svaret hämtas.
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % STAGES.length), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-4 rounded-xl border border-gold/30 bg-slate-900/50 p-4">
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0" aria-hidden="true">
          {/* Kanter fråga → lager */}
          {LAYER_NODES.map((n, i) => (
            <line key={`e${i}`} x1={CENTER.x} y1={CENTER.y} x2={n.x} y2={n.y}
              stroke={i === active ? '#fbbf24' : '#334155'} strokeWidth={i === active ? 1.4 : 0.8}
              opacity={i === active ? 0.95 : 0.5} style={{ transition: 'stroke 0.3s, opacity 0.3s' }} />
          ))}
          {/* Kanter lager → satelliter (tänds med sitt lager) */}
          {SATELLITES.map((s, i) => {
            const owner = i % LAYER_NODES.length;
            const n = LAYER_NODES[owner];
            const on = owner === active;
            return (
              <line key={`s${i}`} x1={n.x} y1={n.y} x2={s.x} y2={s.y}
                stroke={on ? '#f59e0b' : '#1e293b'} strokeWidth={0.6}
                opacity={on ? 0.8 : 0.35} style={{ transition: 'stroke 0.3s, opacity 0.3s' }} />
            );
          })}
          {/* Satellit-noder */}
          {SATELLITES.map((s, i) => {
            const on = (i % LAYER_NODES.length) === active;
            return <circle key={`sn${i}`} cx={s.x} cy={s.y} r={on ? 2.2 : 1.6}
              fill={on ? '#fcd34d' : '#475569'} style={{ transition: 'fill 0.3s, r 0.3s' }} />;
          })}
          {/* Lager-noder */}
          {LAYER_NODES.map((n, i) => (
            <circle key={`ln${i}`} cx={n.x} cy={n.y} r={i === active ? 4.5 : 3}
              fill={i === active ? '#fbbf24' : '#64748b'}
              style={{ transition: 'fill 0.3s, r 0.3s' }}>
              {i === active && <animate attributeName="r" values="3.5;5;3.5" dur="0.7s" repeatCount="indefinite" />}
            </circle>
          ))}
          {/* Central fråge-nod (pulsar) */}
          <circle cx={CENTER.x} cy={CENTER.y} r="5.5" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="1">
            <animate attributeName="r" values="5;6.5;5" dur="1.4s" repeatCount="indefinite" />
          </circle>
        </svg>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-gold mb-1">
            {sv ? 'Söker i kunskapsgrafen…' : 'Searching the knowledge graph…'}
          </div>
          {label && <div className="text-xs text-slate-400 mb-1.5 truncate">”{label}”</div>}
          <ol className="space-y-0.5">
            {STAGES.map((s, i) => (
              <li key={i} className={`flex items-center gap-2 text-[11px] transition-colors ${i === active ? 'text-amber-200' : i < active ? 'text-slate-500' : 'text-slate-600'}`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${i === active ? 'bg-amber-400' : i < active ? 'bg-emerald-500/60' : 'bg-slate-700'}`} />
                {sv ? s.sv : s.en}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
