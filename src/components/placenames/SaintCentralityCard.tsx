import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Anchor } from 'lucide-react';

// Helgon-hypotesen (Daniel): ligger kyrkor helgade åt ett visst helgon närmare centralorterna
// än kyrkor i allmänhet? Sjöfararhelgon (Nikolaus, Olof, Clemens) förväntas i handels-/centralorter.
// saint_centrality: median NN till närmaste viking_city, kohort helgon vs alla kyrkor.

const SEAFARER = new Set(['Nikolaus', 'Olof', 'Clemens', 'Gertruds', 'Görans', 'Örjans']);
const km = (m: number) => (m / 1000).toFixed(0);

export const SaintCentralityCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const [saint, setSaint] = useState('Nikolaus');
  const { data: options = [] } = useQuery({
    queryKey: ['saint-options'], staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('saint_options');
      if (error) throw error;
      return (data as { patron_saint: string; n: number }[]);
    },
  });
  const { data, isFetching } = useQuery({
    queryKey: ['saint-centrality', saint], enabled: !!saint, staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('saint_centrality', { p_saint: saint });
      if (error) throw error;
      const m: Record<string, { n: number; median_m: number }> = {};
      (data as { cohort: string; n: number; median_m: number }[]).forEach((r) => { m[r.cohort] = r; });
      return m;
    },
  });
  const s = data?.saint, b = data?.baseline;
  const ratio = s && b ? s.median_m / b.median_m : null;
  const verdict = !s || !b ? null
    : s.n < 5 ? { c: '#94a3b8', t: sv ? `Få kyrkor (n=${s.n}) — tolka försiktigt` : `Few (n=${s.n})` }
    : ratio! <= 0.6 ? { c: '#22c55e', t: sv ? 'Klart närmare centralort än snittet' : 'Much closer to central places' }
    : ratio! <= 0.85 ? { c: '#84cc16', t: sv ? 'Närmare centralort än snittet' : 'Closer than average' }
    : ratio! >= 1.15 ? { c: '#ef4444', t: sv ? 'Längre från centralort än snittet' : 'Farther than average' }
    : { c: '#eab308', t: sv ? 'Som snittet' : 'Around average' };

  return (
    <Card className="viking-card mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold"><Anchor className="h-5 w-5" /> {sv ? 'Helgon i centralorterna' : 'Saints and central places'}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span>{sv ? 'Kyrkor helgade åt' : 'Churches dedicated to'}</span>
          <select value={saint} onChange={(e) => setSaint(e.target.value)} className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-foreground">
            {options.map((o) => <option key={o.patron_saint} value={o.patron_saint}>{o.patron_saint} ({o.n}){SEAFARER.has(o.patron_saint) ? ' ⚓' : ''}</option>)}
          </select>
          {isFetching && <span className="opacity-60">{sv ? 'räknar…' : '…'}</span>}
        </div>
        {s && b && (
          <>
            <div className="space-y-1.5">
              {([[`${saint}${SEAFARER.has(saint) ? ' ⚓' : ''}`, s, '#f59e0b'], [sv ? 'Alla kyrkor' : 'All churches', b, '#38bdf8']] as [string, { n: number; median_m: number }, string][]).map(([lbl, r, col]) => (
                <div key={lbl} className="flex items-center gap-2">
                  <span className="w-32 shrink-0 text-xs">{lbl}</span>
                  <div className="flex-1 bg-slate-800/60 rounded"><div style={{ width: `${Math.max(4, (r.median_m / Math.max(s.median_m, b.median_m, 1)) * 100)}%`, background: col }} className="h-2 rounded" /></div>
                  <span className="w-16 shrink-0 text-right tabular-nums text-foreground">{km(r.median_m)} km</span>
                  <span className="w-12 shrink-0 text-right text-[11px] opacity-60">n={r.n}</span>
                </div>
              ))}
            </div>
            {verdict && <div className="flex items-center gap-2 text-sm"><span style={{ width: 12, height: 12, borderRadius: 9999, background: verdict.c, boxShadow: `0 0 6px ${verdict.c}` }} /><span className="text-foreground">{verdict.t}</span></div>}
            <p className="text-[11px] opacity-70">{sv
              ? 'Median till närmaste centralort (viking_cities). ⚓ = sjöfarar-/handelshelgon. Bara 161/4146 kyrkor har belagd patronus — n är litet, så läs som indikation. Att helgade kyrkor generellt ligger centralt speglar att de ofta var bygdens huvudkyrkor.'
              : 'Median distance to the nearest central place (viking towns). ⚓ = seafarer/trade saints. Only 161/4146 churches have a recorded patron — treat as indicative.'}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
