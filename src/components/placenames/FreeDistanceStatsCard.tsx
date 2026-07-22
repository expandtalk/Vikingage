import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FlaskConical } from 'lucide-react';
import { useFreeDistanceStats } from '@/hooks/useFreeDistanceStats';
import { useShapeReachStats } from '@/hooks/useShapeReachStats';
import { getElement } from '@/utils/placeNameElements';

// Bygg ett eget test: välj namnled för test- och baslinjegrupp, och antingen
// (1) mät avståndet till närmaste målobjekt, eller (2) räkna hur många målobjekt
// som ligger inom en form (cirkel/fyrkant/hexagon) — en dagsresa — kring varje ort.
const ELEMENTS = ['tuna', 'sala', 'husby', 'karleby', 'sätuna', 'vi', 'frö', 'tor', 'oden', 'ull', 'lund', 'harg', 'hov', 'by', 'sta', 'torp', 'hem', 'inge'];
const TARGETS: { key: string; sv: string; en: string }[] = [
  { key: 'church', sv: 'sockenkyrka', en: 'parish church' },
  { key: 'fortress', sv: 'fornborg', en: 'hillfort' },
  { key: 'heritage', sv: 'kulturlager', en: 'heritage site' },
  { key: 'runestone', sv: 'runsten', en: 'runestone' },
  { key: 'spolia', sv: 'spolia-kyrka (Gotland)', en: 'spolia church (Gotland)' },
];
const SHAPES: { key: string; sv: string; en: string }[] = [
  { key: 'circle', sv: 'Cirkel', en: 'Circle' },
  { key: 'square', sv: 'Fyrkant', en: 'Square' },
  { key: 'hexagon', sv: 'Hexagon', en: 'Hexagon' },
];
// Dagsresa per färdsätt (samma tal som omkrets-sonden). Radie = så långt man tar sig på en dag.
const REACH: { key: string; sv: string; en: string; km: number }[] = [
  { key: 'wagon', sv: 'Häst & vagn', en: 'Horse & wagon', km: 15 },
  { key: 'foot', sv: 'Gång', en: 'On foot', km: 30 },
  { key: 'row', sv: 'Rodd', en: 'Rowing', km: 40 },
  { key: 'horse', sv: 'Häst i sadel', en: 'Horse (saddle)', km: 50 },
  { key: 'sail', sv: 'Segel', en: 'Sail', km: 100 },
];
const km = (m: number) => (m / 1000).toFixed(1);
const label = (k: string) => getElement(k)?.label ?? (k.charAt(0).toUpperCase() + k.slice(1));

export const FreeDistanceStatsCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const [mode, setMode] = useState<'distance' | 'reach'>('distance');
  const [test, setTest] = useState<string[]>(['tuna']);
  const [baseline, setBaseline] = useState<string[]>(['by', 'sta', 'torp']);
  const [target, setTarget] = useState('church');
  const [shape, setShape] = useState('hexagon');
  const [radiusKm, setRadiusKm] = useState(15);

  const { data: dist = [], isFetching: dFetch } = useFreeDistanceStats(test, baseline, target);
  const { data: reach = [], isFetching: rFetch } = useShapeReachStats(test, baseline, target, shape, radiusKm, mode === 'reach');
  const isFetching = mode === 'distance' ? dFetch : rFetch;

  const toggle = (arr: string[], set: (v: string[]) => void, other: string[], k: string) => {
    if (other.includes(k)) return; // ett led kan inte vara i båda grupperna
    set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);
  };

  const chipRow = (title: string, arr: string[], set: (v: string[]) => void, other: string[]) => (
    <div className="mb-3">
      <div className="text-xs font-medium text-muted-foreground mb-1">{title}</div>
      <div className="flex flex-wrap gap-1">
        {ELEMENTS.map((k) => {
          const on = arr.includes(k);
          const inOther = other.includes(k);
          return (
            <button
              key={k}
              disabled={inOther}
              onClick={() => toggle(arr, set, other, k)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                on ? 'bg-gold/20 border-gold text-gold' : inOther ? 'border-slate-800 text-slate-600 cursor-not-allowed' : 'border-slate-600 text-slate-300 hover:border-slate-400'
              }`}
            >
              {label(k)}
            </button>
          );
        })}
      </div>
      {arr.length > 0 && (
        <div className="text-[11px] text-muted-foreground mt-1">
          {sv ? 'Ingår' : 'Included'}: {arr.map(label).join(', ')}
        </div>
      )}
    </div>
  );

  const distByGrp = Object.fromEntries(dist.map((s) => [s.grp, s]));
  const reachByGrp = Object.fromEntries(reach.map((s) => [s.grp, s]));
  const tgtLabel = (TARGETS.find((t) => t.key === target) ?? TARGETS[0]);

  return (
    <Card className="viking-card mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-lg flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-gold" />
          {sv ? 'Bygg ett eget test' : 'Build your own test'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {sv
            ? 'Välj vilka namnled som är test respektive baslinje, och vad du mäter mot. Två lägen: avstånd till närmaste mål, eller antal mål inom en dagsresa (cirkel/fyrkant/hexagon).'
            : 'Pick which name elements form the test and baseline sets, and what you measure against. Two modes: distance to nearest target, or number of targets within a day’s travel (circle/square/hexagon).'}
        </p>
      </CardHeader>
      <CardContent>
        {/* Läge */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Button variant={mode === 'distance' ? 'default' : 'outline'} size="sm" onClick={() => setMode('distance')}>
            {sv ? 'Avstånd till närmaste' : 'Distance to nearest'}
          </Button>
          <Button variant={mode === 'reach' ? 'default' : 'outline'} size="sm" onClick={() => setMode('reach')}>
            {sv ? 'Antal inom en dagsresa' : 'Count within a day’s travel'}
          </Button>
        </div>

        {/* Mål */}
        <div className="text-xs font-medium text-muted-foreground mb-1">{sv ? 'Mät mot:' : 'Measure against:'}</div>
        <div className="flex flex-wrap gap-1 mb-3">
          {TARGETS.map((tg) => (
            <Button key={tg.key} variant={target === tg.key ? 'default' : 'outline'} size="sm" onClick={() => setTarget(tg.key)}>
              {sv ? tg.sv : tg.en}
            </Button>
          ))}
        </div>
        {target === 'spolia' && (
          <p className="text-xs text-amber-300/90 mb-3">
            {sv
              ? 'Spolia-kyrkorna ligger alla på Gotland — meningsfullt främst för gotländska led, annars mäts avståndet till Gotland.'
              : 'The spolia churches are all on Gotland — meaningful mainly for Gotlandic elements.'}
          </p>
        )}

        {/* Form + dagsresa (endast i räkna-läget) */}
        {mode === 'reach' && (
          <div className="mb-3 p-3 rounded border border-slate-700/50 bg-slate-800/30">
            <div className="text-xs font-medium text-muted-foreground mb-1">{sv ? 'Form:' : 'Shape:'}</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {SHAPES.map((s) => (
                <Button key={s.key} variant={shape === s.key ? 'default' : 'outline'} size="sm" onClick={() => setShape(s.key)}>
                  {sv ? s.sv : s.en}
                </Button>
              ))}
            </div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {sv ? 'Radie = en dagsresa med:' : 'Radius = one day’s travel by:'} <span className="text-gold">{radiusKm} km</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {REACH.map((r) => (
                <Button key={r.key} variant={radiusKm === r.km ? 'default' : 'outline'} size="sm" onClick={() => setRadiusKm(r.km)}>
                  {sv ? r.sv : r.en} <Badge variant="secondary" className="ml-1">{r.km} km</Badge>
                </Button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {sv
                ? 'Formen speglar tre räckviddsprinciper: cirkel = jämn radie, fyrkant = kardinalriktningar, hexagon = effektiv yttäckning. Stora radier (segel) tar längre tid att räkna.'
                : 'The shape reflects three reach principles: circle = uniform radius, square = cardinal directions, hexagon = efficient tiling. Large radii (sail) take longer to compute.'}
            </p>
          </div>
        )}

        {chipRow(sv ? 'Testgrupp (led):' : 'Test set (elements):', test, setTest, baseline)}
        {chipRow(sv ? 'Baslinje (led):' : 'Baseline (elements):', baseline, setBaseline, test)}

        {/* Resultat */}
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          {test.length === 0 || baseline.length === 0 ? (
            <p className="text-xs text-muted-foreground">{sv ? 'Välj minst ett led i vardera gruppen.' : 'Pick at least one element in each group.'}</p>
          ) : isFetching ? (
            <p className="text-xs text-muted-foreground">{sv ? 'Räknar…' : 'Computing…'}</p>
          ) : mode === 'distance' ? (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-1">
                {sv ? `Medianavstånd till närmaste ${tgtLabel.sv}:` : `Median distance to nearest ${tgtLabel.en}:`}
              </div>
              {(['test', 'baseline'] as const).map((g) => {
                const s = distByGrp[g];
                if (!s) return null;
                return (
                  <div key={g} className="flex items-center justify-between text-sm">
                    <span className={g === 'test' ? 'text-gold font-medium' : 'text-slate-300'}>
                      {g === 'test' ? (sv ? 'Test' : 'Test') : (sv ? 'Baslinje' : 'Baseline')}
                    </span>
                    <span className="text-foreground">
                      <strong>{km(s.median)} km</strong>
                      <span className="text-muted-foreground text-xs"> · n={s.n.toLocaleString()} · {sv ? 'medel' : 'mean'} {km(s.mean)} km</span>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-1">
                {sv ? `Antal ${tgtLabel.sv} inom en ${shape === 'circle' ? 'cirkel' : shape === 'square' ? 'fyrkant' : 'hexagon'} på ${radiusKm} km (median):` : `Number of ${tgtLabel.en} within ${radiusKm} km (median):`}
              </div>
              {(['test', 'baseline'] as const).map((g) => {
                const s = reachByGrp[g];
                if (!s) return null;
                return (
                  <div key={g} className="flex items-center justify-between text-sm">
                    <span className={g === 'test' ? 'text-gold font-medium' : 'text-slate-300'}>
                      {g === 'test' ? 'Test' : (sv ? 'Baslinje' : 'Baseline')}
                    </span>
                    <span className="text-foreground">
                      <strong>{s.median_cnt} st</strong>
                      <span className="text-muted-foreground text-xs"> · n={s.n.toLocaleString()} · {sv ? 'medel' : 'mean'} {s.mean_cnt.toFixed(1)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground mt-3 opacity-90">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              {sv
                ? 'Koordinaten är ortnamnets OSM-bebyggelsepunkt, inte kyrkan/sockencentroiden — annars blir avståndet cirkulärt ~0.'
                : 'The coordinate is the OSM settlement point, not the church/parish centroid — otherwise the distance would be circular ~0.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
