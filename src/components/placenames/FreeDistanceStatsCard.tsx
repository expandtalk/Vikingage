import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, AlertTriangle } from 'lucide-react';
import { useFreeDistanceStats } from '@/hooks/useFreeDistanceStats';

// Fria hypotesväljare: valfri testmängd/baslinje (ortnamnsled) + mål. Box-plot av resultatet.
const ELEMENTS = ['tuna', 'sala', 'husby', 'karleby', 'sätuna', 'vi', 'frö', 'tor', 'oden', 'ull', 'lund', 'harg', 'hov', 'by', 'sta', 'torp', 'hem', 'inge'];
const TARGETS: { key: string; sv: string }[] = [
  { key: 'church', sv: 'sockenkyrka' }, { key: 'fortress', sv: 'fornborg' },
  { key: 'heritage', sv: 'kulturlager' }, { key: 'runestone', sv: 'runsten' },
  { key: 'spolia', sv: 'spolia-kyrka (Gotland)' },
];
const km = (m: number) => (m / 1000).toFixed(1);

export const FreeDistanceStatsCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const [test, setTest] = useState<string[]>(['tuna']);
  const [baseline, setBaseline] = useState<string[]>(['by', 'sta', 'torp']);
  const [target, setTarget] = useState('church');
  const { data: stats = [], isFetching } = useFreeDistanceStats(test, baseline, target);

  const toggle = (set: string[], setter: (v: string[]) => void, k: string) =>
    setter(set.includes(k) ? set.filter((x) => x !== k) : [...set, k]);

  const byGrp = Object.fromEntries(stats.map((s) => [s.grp, s]));
  const t = byGrp['test'], b = byGrp['baseline'];
  const scaleMax = Math.max(t?.p90 ?? 0, b?.p90 ?? 0) * 1.05 || 1;
  const pct = (v: number) => `${Math.min(100, (v / scaleMax) * 100)}%`;

  const chipRow = (label: string, set: string[], setter: (v: string[]) => void, other: string[]) => (
    <div className="mb-2">
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {ELEMENTS.map((k) => (
          <button key={k} onClick={() => toggle(set, setter, k)} disabled={other.includes(k)}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              set.includes(k) ? 'bg-gold/25 border-gold text-gold'
              : other.includes(k) ? 'border-slate-800 text-slate-600 cursor-not-allowed'
              : 'border-slate-600 text-slate-300 hover:bg-slate-800'}`}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );

  const row = (s: typeof t, color: string, name: string) => s && (
    <div className="mb-3">
      <div className="flex items-baseline justify-between mb-1 text-xs">
        <span className="font-semibold text-foreground">{name}</span>
        <span className="text-muted-foreground">median <strong className="text-foreground">{km(s.median)} km</strong> · n={s.n.toLocaleString()}</span>
      </div>
      <div className="relative h-5 rounded bg-slate-800/60 border border-slate-700/50">
        <div className="absolute top-1/2 h-px bg-slate-500" style={{ left: pct(s.q1), right: `calc(100% - ${pct(s.p90)})` }} />
        <div className="absolute top-1 bottom-1 rounded-sm opacity-80" style={{ left: pct(s.q1), width: `calc(${pct(s.q3)} - ${pct(s.q1)})`, backgroundColor: color }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-white" style={{ left: pct(s.median) }} />
      </div>
    </div>
  );

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <FlaskConical className="h-6 w-6 text-gold" />
        {sv ? 'Fri hypotesprövning' : 'Free hypothesis test'}
      </h2>
      <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
      <p className="text-sm text-muted-foreground max-w-3xl mb-4">
        {sv
          ? 'Välj egna namnled för testmängd och baslinje, och vad avståndet mäts till. Medianavståndet jämförs — ligger testmängden signifikant närmare målet än baslinjen? Koordinat = OSM-bebyggelsepunkt (ej kyrkan → ej cirkulärt).'
          : 'Pick your own name elements for the test set and baseline, and what distance is measured to. Coordinate = OSM settlement point (not the church → not circular).'}
      </p>
      <Card className="viking-card">
        <CardHeader className="pb-2"><CardTitle className="text-foreground text-base">{sv ? 'Avstånd till närmaste' : 'Distance to nearest'}:</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1 mb-3">
            {TARGETS.map((tg) => (
              <Button key={tg.key} variant={target === tg.key ? 'default' : 'outline'} size="sm" onClick={() => setTarget(tg.key)}>{tg.sv}</Button>
            ))}
          </div>
          {target === 'spolia' && (
            <p className="text-xs text-amber-300/90 mb-3">
              {sv
                ? 'Kultplatskontinuitet: mål = de 17 gotländska kyrkor med återanvänd hednisk bildsten (spolia). OBS: alla ligger på Gotland — meningsfullt främst för gotländska ortnamnsled, annars mäts avståndet till Gotland.'
                : 'Cult-site continuity: target = the 17 Gotland churches with re-used pagan picture stones (spolia). Note: all are on Gotland, so this is meaningful mainly for Gotlandic name elements.'}
            </p>
          )}
          {chipRow(sv ? 'Testmängd (led):' : 'Test set:', test, setTest, baseline)}
          {chipRow(sv ? 'Baslinje (led):' : 'Baseline:', baseline, setBaseline, test)}
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            {test.length === 0 || baseline.length === 0 ? (
              <p className="text-xs text-muted-foreground">{sv ? 'Välj minst ett led i vardera gruppen.' : 'Pick at least one element in each group.'}</p>
            ) : isFetching ? (
              <p className="text-xs text-muted-foreground">{sv ? 'Räknar…' : 'Computing…'}</p>
            ) : (
              <>
                {row(t, '#3b82f6', sv ? `Testmängd (${test.join(', ')})` : `Test (${test.join(', ')})`)}
                {row(b, '#94a3b8', sv ? `Baslinje (${baseline.join(', ')})` : `Baseline (${baseline.join(', ')})`)}
                <div className="flex justify-between text-[10px] text-slate-500"><span>0 km</span><span>{km(scaleMax)} km</span></div>
                {t && b && (
                  <p className="text-sm text-foreground mt-3">
                    {t.median < b.median
                      ? (sv ? `Testmängden ligger närmare (${km(t.median)} vs ${km(b.median)} km) — förenligt med att leden dras till målet.` : `Test set is closer (${km(t.median)} vs ${km(b.median)} km).`)
                      : (sv ? `Testmängden ligger INTE närmare (${km(t.median)} vs ${km(b.median)} km) — ingen dragningssignal.` : `Test set is not closer (${km(t.median)} vs ${km(b.median)} km).`)}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground mt-3 opacity-90">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{sv ? 'n visas alltid. Litet n (t.ex. sällsynta led) → osäker median. Mäter man mot kyrka med kyrko-koordinerade namn blir det cirkulärt — därför OSM-punkt.' : 'n always shown; small n → uncertain median.'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
