import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';
import { PLACE_NAME_ELEMENTS } from '@/utils/placeNameElements';

// Hypotestestare v2: ligger ett namnled tätare vid ett fornlämningslager än väntat?
// Jämför ledens närmaste-grann-avstånd (NN) mot kontroll-led (-inge) OCH slumpbaslinje
// (alla ortnamn) via RPC element_reference_nn. Aldrig naken siffra — alltid mot baslinje.

const REFERENCES: { key: string; sv: string; en: string }[] = [
  { key: 'church', sv: 'Kyrkor', en: 'Churches' },
  { key: 'gravfalt', sv: 'Gravfält', en: 'Grave fields' },
  { key: 'fornborg', sv: 'Fornborgar', en: 'Hillforts' },
  { key: 'thing', sv: 'Tingsplatser', en: 'Assembly sites' },
  { key: 'runestone', sv: 'Runstenar', en: 'Runestones' },
  { key: 'execution', sv: 'Avrättningsplatser', en: 'Execution sites' },
];
const km = (m: number) => (m / 1000).toFixed(1);

interface Row { cohort: string; n: number; mean_m: number; median_m: number }

export const HeritageProximityCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const [element, setElement] = useState('tor');
  const [reference, setReference] = useState('fornborg');

  const { data, isFetching } = useQuery({
    queryKey: ['element-reference-nn', element, reference],
    enabled: !!element && !!reference,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('element_reference_nn', { p_element: element, p_reference: reference });
      if (error) throw error;
      const m: Record<string, Row> = {};
      (data as Row[]).forEach((r) => { m[r.cohort] = r; });
      return m;
    },
  });

  const el = data?.element, ctrl = data?.control, base = data?.baseline;
  const elLabel = PLACE_NAME_ELEMENTS.find((e) => e.key === element)?.label ?? element;
  const refLabel = (r: string) => { const x = REFERENCES.find((z) => z.key === r); return sv ? x?.sv : x?.en; };

  const verdict = useMemo(() => {
    if (!el || !base) return null;
    if (el.n < 10) return { c: '#94a3b8', t: sv ? `För få (n=${el.n}) — tolka försiktigt` : `Too few (n=${el.n})` };
    const vsBase = el.median_m / base.median_m;
    const closerThanCtrl = ctrl ? el.median_m < ctrl.median_m : true;
    if (vsBase <= 0.8 && closerThanCtrl) return { c: '#22c55e', t: sv ? 'Tätare än väntat — signal' : 'Closer than expected — signal' };
    if (vsBase >= 1.2) return { c: '#ef4444', t: sv ? 'Glesare än väntat — undviker referensen' : 'Farther than expected' };
    return { c: '#eab308', t: sv ? 'Som väntat — ingen tydlig signal' : 'As expected — no clear signal' };
  }, [el, ctrl, base, sv]);

  const bar = (r?: Row, color = '#38bdf8') => {
    if (!r || !base) return null;
    const max = Math.max(el?.median_m ?? 0, ctrl?.median_m ?? 0, base?.median_m ?? 0, 1);
    return <div style={{ width: `${Math.max(4, (r.median_m / max) * 100)}%`, background: color }} className="h-2 rounded" />;
  };

  return (
    <Card className="viking-card mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold"><FlaskConical className="h-5 w-5" /> {sv ? 'Ligger leden vid en fornlämningstyp?' : 'Does the element cluster near a heritage type?'}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select value={element} onChange={(e) => setElement(e.target.value)} className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-foreground">
            {[...PLACE_NAME_ELEMENTS].sort((a, b) => a.label.localeCompare(b.label, 'sv')).map((e) => (
              <option key={e.key} value={e.key}>{e.label} ({e.category})</option>
            ))}
          </select>
          <span>{sv ? 'nära' : 'near'}</span>
          <select value={reference} onChange={(e) => setReference(e.target.value)} className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-foreground">
            {REFERENCES.map((r) => <option key={r.key} value={r.key}>{sv ? r.sv : r.en}</option>)}
          </select>
          {isFetching && <span className="opacity-60">{sv ? 'räknar…' : 'computing…'}</span>}
        </div>

        {el && base && (
          <>
            <p className="text-xs">{sv ? 'Median till närmaste' : 'Median distance to nearest'} <strong className="text-foreground">{refLabel(reference)}</strong> — {sv ? 'jämfört mot kontroll-led (-inge) och slumpbaslinje (alla ortnamn):' : 'vs control (-inge) and random baseline:'}</p>
            <div className="space-y-1.5">
              {([['element', `${elLabel}`, el, '#f59e0b'], ['control', sv ? 'Kontroll (-inge)' : 'Control', ctrl, '#64748b'], ['baseline', sv ? 'Slumpbaslinje' : 'Baseline', base, '#38bdf8']] as [string, string, Row | undefined, string][]).map(([k, lbl, r, col]) => r && (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-32 shrink-0 text-xs" style={{ color: k === 'element' ? '#f59e0b' : undefined }}>{lbl}</span>
                  <div className="flex-1 bg-slate-800/60 rounded"><div style={{ width: `${Math.max(4, (r.median_m / Math.max(el.median_m, ctrl?.median_m ?? 0, base.median_m, 1)) * 100)}%`, background: col }} className="h-2 rounded" /></div>
                  <span className="w-20 shrink-0 text-right tabular-nums text-foreground">{km(r.median_m)} km</span>
                  <span className="w-14 shrink-0 text-right text-[11px] opacity-60">n={r.n}</span>
                </div>
              ))}
            </div>
            {verdict && (
              <div className="flex items-center gap-2 text-sm">
                <span style={{ width: 12, height: 12, borderRadius: 9999, background: verdict.c, boxShadow: `0 0 6px ${verdict.c}` }} />
                <span className="text-foreground">{verdict.t}</span>
              </div>
            )}
            <p className="text-[11px] opacity-70">{sv
              ? 'Metod: geodetiskt närmaste-grann-avstånd över hela ortnamnsregistret (~42 000). "Signal" = leden ligger ≥20 % närmare än slumpbaslinjen OCH närmare än den neutrala kontrollen. Ett medelvärde är aldrig ett bevis — läs mot evidensskikt och källkritik ovan.'
              : 'Method: geodesic nearest-neighbour over the full ~42,000 place-name register, vs a neutral control and random baseline.'}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
