import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Church } from 'lucide-react';
import { useChurchNNStats } from '@/hooks/useChurchNNStats';

// Avstånd mellan kyrkorna: fördelning av varje kyrkas avstånd till närmaste andra kyrka.
const km = (m: number) => (m / 1000).toFixed(1);

export const ChurchDistanceCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const { data, isLoading } = useChurchNNStats();
  if (isLoading || !data) return null;
  return (
    <Card className="viking-card mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-base flex items-center gap-2">
          <Church className="h-5 w-5 text-gold" />
          {sv ? 'Avstånd mellan kyrkorna' : 'Distance between churches'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {sv
            ? `Varje kyrkas avstånd till närmaste andra kyrka (${data.n.toLocaleString()} kyrkor i ecklesiastika lagret). Visar hur tätt sockenkyrkorna ligger — nätets maskvidd.`
            : `Each church’s distance to the nearest other church (${data.n.toLocaleString()} churches). Shows how densely the parish churches are spread.`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: sv ? 'Median' : 'Median', v: data.median },
            { l: sv ? 'Undre kvartil' : 'Lower quartile', v: data.q1 },
            { l: sv ? 'Övre kvartil' : 'Upper quartile', v: data.q3 },
            { l: sv ? '90:e percentil' : '90th percentile', v: data.p90 },
          ].map((x) => (
            <div key={x.l} className="text-center">
              <div className="text-2xl font-bold text-gold">{km(x.v)}</div>
              <div className="text-[11px] text-muted-foreground">{x.l} (km)</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 opacity-80">
          {sv
            ? 'Tolkning: hälften av kyrkorna har en granne inom ~' + km(data.median) + ' km. Det är kortare än en dagsresa till fots (30 km) — sockennätet var tätt, byggt för att nås till fots. Avstånd via PostGIS geodetisk KNN.'
            : 'Half the churches have a neighbour within ~' + km(data.median) + ' km — well under a day’s walk (30 km). Distances via PostGIS geodesic KNN.'}
        </p>
      </CardContent>
    </Card>
  );
};
