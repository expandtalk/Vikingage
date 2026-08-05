import React from 'react';
import type { LucideIcon } from 'lucide-react';

// Liten radiell "mindmap": mittnod = träffen, ekrar = dess kunskapsgraf-grannar.
// Ren SVG + absolut-positionerade knappar (ingen extern lib → CSP-säker). Klickbar navigering.
// Höger-hjärna-komplementet till den vänster-hjärna-lista/panel som visar samma grannar som chips.
export interface MindNode {
  label: string;
  route: string;
  icon?: LucideIcon;
}

interface Props {
  center: string;
  nodes: MindNode[];
  onGo: (route: string) => void;
  sv: boolean;
}

export const RelationMindmap: React.FC<Props> = ({ center, nodes, onGo, sv }) => {
  const shown = nodes.slice(0, 8);
  if (shown.length < 2) return null; // en ensam ekre är ingen karta

  // Placera noderna på en cirkel. Start uppåt (-90°) så första noden hamnar i topp.
  const R = 39; // radie i % av rutan (lämnar marginal för etiketterna)
  const pts = shown.map((n, i) => {
    const ang = (-90 + (360 / shown.length) * i) * (Math.PI / 180);
    return { n, x: 50 + R * Math.cos(ang), y: 50 + R * Math.sin(ang) };
  });

  return (
    <div className="px-4 py-3 border-t border-slate-800">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {sv ? 'Relationskarta' : 'Relation map'}
      </div>
      <div className="relative mx-auto w-full max-w-[300px]" style={{ aspectRatio: '1 / 1' }}>
        {/* Linjer mitt → nod */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
          {pts.map((p, i) => (
            <line key={i} x1={50} y1={50} x2={p.x} y2={p.y} stroke="#475569" strokeWidth={0.4} />
          ))}
        </svg>

        {/* Mittnod */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/15 border border-amber-500/50 px-2.5 py-1 text-center text-[11px] font-semibold text-amber-100 shadow max-w-[46%] truncate"
          style={{ left: '50%', top: '50%' }}
          title={center}
        >
          {center}
        </div>

        {/* Grann-noder */}
        {pts.map((p, i) => {
          const Icon = p.n.icon;
          return (
            <button
              key={i}
              onClick={() => onGo(p.n.route)}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-200 hover:border-amber-500/60 hover:text-amber-100 max-w-[42%]"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              title={p.n.label}
            >
              {Icon && <Icon className="h-2.5 w-2.5 shrink-0 text-amber-400" />}
              <span className="truncate">{p.n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
