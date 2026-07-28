import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

// Kristnandetempo: hur snabbt fylldes landskapen med kyrkor? Två mått, samma motor
// (church_nn_by_period, inkl. sockenkyrka+kapell+kloster):
//   "Andel byggda" = kumulativ % av regionens daterade kyrkor som stod vid varje snittår.
//   "Täthet" = median grannavstånd (km) — lägre = tätare.
// Datakälla: ecclesiastical_sites.built_from (Wikipedia/Wikidata som speglar BeBR/Sveriges kyrkor).

type Row = { cutoff: number; n: number; median_km: number };
type Region = { key: string; label: string; color: string; args: Record<string, unknown> };

const REGIONS: Region[] = [
  { key: 'oland', label: 'Öland', color: '#f59e0b', args: { p_minlat: 56.2, p_minlng: 16.38, p_maxlat: 57.35, p_maxlng: 17.1 } },
  { key: 'uppland', label: 'Uppland', color: '#3b82f6', args: { p_landscape: 'Uppland' } },
  { key: 'angermanland', label: 'Ångermanland', color: '#22c55e', args: { p_landscape: 'Ångermanland' } },
];
const YEARS = [1100, 1150, 1200, 1250, 1300, 1350];

export const ChristianizationChart: React.FC = () => {
  const [mode, setMode] = useState<'pct' | 'km'>('pct');
  const [data, setData] = useState<Record<string, Row[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: Record<string, Row[]> = {};
      for (const r of REGIONS) {
        const { data: rows } = await (supabase.rpc as any)('church_nn_by_period', r.args);
        out[r.key] = (rows ?? []) as Row[];
      }
      if (!cancelled) { setData(out); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Bygg en rad per år, en kolumn per region (värde beroende på läge).
  const chart = YEARS.map((year) => {
    const row: Record<string, number | string> = { year };
    for (const r of REGIONS) {
      const rows = data[r.key] ?? [];
      const at = rows.find((x) => x.cutoff === year);
      if (mode === 'km') {
        row[r.key] = at ? Number(at.median_km) : (null as unknown as number);
      } else {
        const maxN = rows.length ? Math.max(...rows.map((x) => x.n)) : 0;
        row[r.key] = at && maxN ? Math.round((at.n / maxN) * 100) : (null as unknown as number);
      }
    }
    return row;
  });

  if (loading) return <p className="text-sm text-muted-foreground">Laddar kurvor…</p>;

  return (
    <div>
      <div className="flex gap-2 mb-3 text-xs">
        {([['pct', 'Andel byggda (%)'], ['km', 'Täthet (median km)']] as const).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setMode(k)}
            className={`rounded border px-2 py-1 transition-colors ${mode === k ? 'border-gold text-gold' : 'border-slate-700 text-muted-foreground'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickFormatter={(y) => `~${y}`} />
            <YAxis stroke="#94a3b8" fontSize={12}
              domain={mode === 'pct' ? [0, 100] : [0, 'auto']}
              tickFormatter={(v) => (mode === 'pct' ? `${v}%` : `${v} km`)} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number, key: string) => [mode === 'pct' ? `${v}%` : `${v} km`, REGIONS.find((r) => r.key === key)?.label ?? key]}
              labelFormatter={(y) => `~år ${y}`} />
            <Legend formatter={(key) => REGIONS.find((r) => r.key === key)?.label ?? key} wrapperStyle={{ fontSize: 12 }} />
            {REGIONS.map((r) => (
              <Line key={r.key} type="monotone" dataKey={r.key} stroke={r.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2 opacity-75">
        {mode === 'pct'
          ? 'Andel av regionens daterade kyrkor som stod vid varje snittår. Brant tidig kurva = snabbt kristnande.'
          : 'Median grannavstånd mellan kyrkor (lägre = tätare). '}
        Motor: <code>church_nn_by_period</code> (sockenkyrka + kapell + kloster). Datering: Wikipedia/Wikidata (speglar BeBR/Sveriges kyrkor), flaggad "verifiera". Öland ännu ej 100&nbsp;% daterat; Ångermanlands 1100-punkt är grov.
      </p>
    </div>
  );
};
