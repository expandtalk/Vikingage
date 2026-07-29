import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

// Hypotestestare: runiska ORD. Ligger inskrifter med ett visst ord (i translittereringen) tätare
// vid ett referenslager än runstenar i allmänhet? T.ex. trik (drengR), þiakn (þegn), sun (son).
// runic_word_nn: median NN match vs slumpbaslinje. OBS: substrängmatchning — korta ord matchar brett.

const REFERENCES: { key: string; sv: string; en: string }[] = [
  { key: 'town', sv: 'Centralorter', en: 'Central places' },
  { key: 'church', sv: 'Kyrkor', en: 'Churches' },
  { key: 'fornborg', sv: 'Fornborgar', en: 'Hillforts' },
  { key: 'thing', sv: 'Tingsplatser', en: 'Assembly sites' },
  { key: 'gravfalt', sv: 'Gravfält', en: 'Grave fields' },
];
const SUGGEST = ['trik', 'þiakn', 'sun', 'faþur', 'kuþ', 'trkʀ'];
const km = (m: number) => (m / 1000).toFixed(1);

export const RunicWordCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const [input, setInput] = useState('trik');
  const [term, setTerm] = useState('trik');
  const [reference, setReference] = useState('town');

  const { data, isFetching } = useQuery({
    queryKey: ['runic-word-nn', term, reference], enabled: term.length >= 2, staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('runic_word_nn', { p_term: term, p_reference: reference });
      if (error) throw error;
      const m: Record<string, { n: number; median_m: number }> = {};
      (data as { cohort: string; n: number; median_m: number }[]).forEach((r) => { m[r.cohort] = r; });
      return m;
    },
  });
  const mt = data?.match, b = data?.baseline;
  const ratio = mt && b ? mt.median_m / b.median_m : null;
  const verdict = !mt || !b ? null
    : mt.n < 8 ? { c: '#94a3b8', t: sv ? `Få inskrifter (n=${mt.n}) — tolka försiktigt` : `Few (n=${mt.n})` }
    : ratio! <= 0.7 ? { c: '#22c55e', t: sv ? 'Tätare vid referensen än väntat' : 'Closer than expected' }
    : ratio! >= 1.3 ? { c: '#ef4444', t: sv ? 'Längre från referensen än väntat' : 'Farther than expected' }
    : { c: '#eab308', t: sv ? 'Som väntat' : 'As expected' };

  return (
    <Card className="viking-card mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold"><Search className="h-5 w-5" /> {sv ? 'Runiska ord i landskapet' : 'Runic words in the landscape'}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setTerm(input.trim())}
            placeholder={sv ? 'ord i runtext, t.ex. trik' : 'runic word'} className="h-8 w-40" />
          <span>{sv ? 'nära' : 'near'}</span>
          <select value={reference} onChange={(e) => setReference(e.target.value)} className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-foreground">
            {REFERENCES.map((r) => <option key={r.key} value={r.key}>{sv ? r.sv : r.en}</option>)}
          </select>
          <Button size="sm" className="h-8" onClick={() => setTerm(input.trim())}>{sv ? 'Testa' : 'Test'}</Button>
          {isFetching && <span className="opacity-60">…</span>}
        </div>
        <div className="flex flex-wrap gap-1 text-[11px]">
          <span className="opacity-60">{sv ? 'exempel:' : 'e.g.:'}</span>
          {SUGGEST.map((w) => <button key={w} onClick={() => { setInput(w); setTerm(w); }} className="rounded border border-slate-700 px-1.5 hover:border-slate-500 font-mono">{w}</button>)}
        </div>
        {mt && b && (
          <>
            <div className="space-y-1.5">
              {([[`"${term}"`, mt, '#f59e0b'], [sv ? 'Alla runstenar' : 'All runestones', b, '#38bdf8']] as [string, { n: number; median_m: number }, string][]).map(([lbl, r, col]) => (
                <div key={lbl} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 text-xs font-mono">{lbl}</span>
                  <div className="flex-1 bg-slate-800/60 rounded"><div style={{ width: `${Math.max(4, (r.median_m / Math.max(mt.median_m, b.median_m, 1)) * 100)}%`, background: col }} className="h-2 rounded" /></div>
                  <span className="w-16 shrink-0 text-right tabular-nums text-foreground">{km(r.median_m)} km</span>
                  <span className="w-12 shrink-0 text-right text-[11px] opacity-60">n={r.n}</span>
                </div>
              ))}
            </div>
            {verdict && <div className="flex items-center gap-2 text-sm"><span style={{ width: 12, height: 12, borderRadius: 9999, background: verdict.c, boxShadow: `0 0 6px ${verdict.c}` }} /><span className="text-foreground">{verdict.t}</span></div>}
            <p className="text-[11px] opacity-70">{sv
              ? 'Söker substräng i inskrifternas translitteration (~6 800 med text + koord) → median till närmaste referens vs slumpbaslinje. Korta ord matchar brett (t.ex. "þur" fångar alla Tor-namn) — läs som utforskande, inte bevis.'
              : 'Substring search in inscription transliterations vs random baseline. Short terms match broadly — exploratory, not proof.'}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
