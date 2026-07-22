import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Ruler } from 'lucide-react';
import { useDistanceStats, type DistanceStat } from '@/hooks/useDistanceStats';

// Steg 1: fast baslinjetest (makt/kontroll/sakralt → avstånd till sockenkyrka).
// Enkelt horisontellt box-plot i ren CSS (inget chart-bibliotek → self-contained).

const GROUP_META: Record<string, { sv: string; en: string; color: string; desc: string; descEn: string }> = {
  makt: { sv: 'Makt', en: 'Power', color: '#3b82f6', desc: 'centralortsled (tuna, sala, husby, karleby, sätuna)', descEn: 'central-place elements (tuna, sala, husby…)' },
  kontroll: { sv: 'Kontroll', en: 'Control', color: '#94a3b8', desc: 'bebyggelsesuffix (-by, -sta, -torp) — baslinjen', descEn: 'settlement suffixes (-by, -sta, -torp) — the baseline' },
  sakralt: { sv: 'Sakralt', en: 'Sacral', color: '#c084fc', desc: 'teofora/kultled (oden, tor, frö, ull, lund, harg, hov, vi)', descEn: 'theophoric/cult elements (oden, tor, frö, ull, lund…)' },
};
const ORDER = ['makt', 'kontroll', 'sakralt'];

const km = (m: number) => (m / 1000).toFixed(1);

const BoxPlotRow: React.FC<{ s: DistanceStat; scaleMax: number; sv: boolean }> = ({ s, scaleMax, sv }) => {
  const meta = GROUP_META[s.grp];
  const pct = (v: number) => `${Math.min(100, (v / scaleMax) * 100)}%`;
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-foreground">{sv ? meta.sv : meta.en}</span>
        <span className="text-xs text-muted-foreground">
          {sv ? 'median' : 'median'} <strong className="text-foreground">{km(s.median)} km</strong> · n={s.n.toLocaleString()}
        </span>
      </div>
      {/* Spår */}
      <div className="relative h-6 rounded bg-slate-800/60 border border-slate-700/50">
        {/* Morrhår min→p90 */}
        <div className="absolute top-1/2 h-px bg-slate-500" style={{ left: pct(s.min_m), right: `calc(100% - ${pct(s.p90)})` }} />
        {/* Box q1→q3 */}
        <div
          className="absolute top-1 bottom-1 rounded-sm opacity-80"
          style={{ left: pct(s.q1), width: `calc(${pct(s.q3)} - ${pct(s.q1)})`, backgroundColor: meta.color }}
        />
        {/* Median-tick */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white" style={{ left: pct(s.median) }} />
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{sv ? meta.desc : meta.descEn}</div>
    </div>
  );
};

export const DistanceStatsCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const { data: stats = [], isLoading } = useDistanceStats();
  if (isLoading) return null;
  if (stats.length === 0) return null;

  const byGrp = Object.fromEntries(stats.map((s) => [s.grp, s]));
  const ordered = ORDER.map((g) => byGrp[g]).filter(Boolean) as DistanceStat[];
  const scaleMax = Math.max(...ordered.map((s) => s.p90)) * 1.05;

  const makt = byGrp['makt'], sakralt = byGrp['sakralt'];
  const secular = makt && sakralt && makt.median < sakralt.median;

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Ruler className="h-6 w-6 text-gold" />
        {sv ? 'Hypotestest: avstånd till sockenkyrkan' : 'Hypothesis test: distance to the parish church'}
      </h2>
      <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
      <p className="text-sm text-muted-foreground max-w-3xl mb-4">
        {sv
          ? 'För varje ortnamn i tre grupper mäts avståndet till närmaste sockenkyrka. Frågan: ligger sakrala led (kult) närmare kyrkorna än väntat (kult-kontinuitet), eller är det maktleden som drar kyrkorna? Box = kvartilerna (25–75 %), vitt streck = median, morrhår = min→90:e percentilen. n visas alltid.'
          : 'For each place name in three groups we measure the distance to the nearest parish church. The question: do sacral (cult) elements lie closer to churches than expected (cult continuity), or is it the power elements that attract churches? Box = quartiles (25–75%), white line = median, whiskers = min→90th percentile. n is always shown.'}
      </p>
      <Card className="viking-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-base">
            {sv ? 'Avstånd till närmaste kyrka (km)' : 'Distance to nearest church (km)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordered.map((s) => <BoxPlotRow key={s.grp} s={s} scaleMax={scaleMax} sv={sv} />)}
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0 km</span>
            <span>{km(scaleMax)} km</span>
          </div>
          {secular && (
            <p className="text-sm text-foreground mt-4 border-t border-slate-700/50 pt-3">
              {sv
                ? `Resultat: maktleden ligger närmast kyrkorna (median ${km(makt.median)} km) och de sakrala längst bort (${km(sakralt.median)} km). Det talar för en sekulär läsning — kyrkor följer maktens noder, inte de förkristna kultplatserna. Ingen signal för kult-kontinuitet på det gruppade materialet.`
                : `Result: power elements lie closest to the churches (median ${km(makt.median)} km) and sacral ones farthest (${km(sakralt.median)} km). This favours a secular reading — churches follow the nodes of power, not pre-Christian cult sites. No signal of cult continuity in the grouped material.`}
            </p>
          )}
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground mt-3 opacity-90">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              {sv
                ? 'Metod: koordinaten är ortnamnets OSM-bebyggelsepunkt (ej sockencentroiden/kyrkan) — annars skulle avståndet bli cirkulärt ~0. Underlag: hela OSM-gazetteern klassad på efterled. Avstånd via PostGIS geodetisk KNN.'
                : 'Method: the coordinate is the place name’s OSM settlement point (not the parish centroid/church) — otherwise the distance would be circular ~0. Corpus: the full OSM gazetteer classified by suffix. Distance via PostGIS geodesic KNN.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
