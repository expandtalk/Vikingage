import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

// Forskar-översikt över runkorpusen: hur många inskrifter, och hur urvalet kategoriseras i
// "rena" vs risk-stenar (flyttade / på samlingspunkt) + medium. Ramar in test-korten nedan:
// välj urval → se risk → testerna använder som standard bara de "rena".

interface Stats { with_coords: number; moved: number; collection: number; clean: number; stones: number; portable: number; coins: number; plaster: number }

export const RunicCorpusCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const { data } = useQuery({
    queryKey: ['runic-corpus-stats'], staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('runic_corpus_stats');
      if (error) throw error;
      return (data as Stats[])[0];
    },
  });
  if (!data) return null;
  const risk = data.with_coords - data.clean;
  const pct = (n: number) => Math.round((n / data.with_coords) * 100);
  const seg = (n: number, color: string, label: string) => (
    <div className="flex items-center gap-2 text-xs">
      <span style={{ width: 11, height: 11, borderRadius: 3, background: color }} className="shrink-0" />
      <span className="w-40 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-800/60 rounded"><div style={{ width: `${Math.max(3, pct(n))}%`, background: color }} className="h-2 rounded" /></div>
      <span className="w-24 shrink-0 text-right tabular-nums text-foreground">{n.toLocaleString('sv-SE')} <span className="opacity-50">{pct(n)}%</span></span>
    </div>
  );

  return (
    <Card className="viking-card mb-4 border-slate-600/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold"><Database className="h-5 w-5" /> {sv ? 'Runkorpusen — välj och förfina urvalet' : 'The runic corpus — select & refine'}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p className="text-xs">{sv
          ? <><strong className="text-foreground">{data.with_coords.toLocaleString('sv-SE')}</strong> runinskrifter med koordinat. Innan man testar geografiskt bör risk-stenarna bort — de som flyttats eller klumpats på en samlingspunkt förvanskar läget:</>
          : <><strong className="text-foreground">{data.with_coords.toLocaleString('sv-SE')}</strong> inscriptions with coordinates. Risk stones (relocated or piled at a collection point) distort geography:</>}</p>
        <div className="space-y-1.5">
          {seg(data.clean, '#22c55e', sv ? 'Rena (pålitligt läge)' : 'Clean (reliable position)')}
          {seg(data.collection, '#ef4444', sv ? 'På samlingspunkt (Bergen/Uppsala…)' : 'At a collection point')}
          {seg(data.moved, '#eab308', sv ? 'Flyttade (kyrka m.m.)' : 'Relocated')}
        </div>
        <p className="text-[11px] opacity-80">{sv
          ? <>Testerna nedan använder som standard <strong className="text-emerald-300">bara de {data.clean.toLocaleString('sv-SE')} rena</strong> (~{pct(data.clean)} %). Slå av "uteslut flyttade" för att inkludera risk-stenarna. <em>Rена/risk kan överlappa (en sten kan vara både flyttad och på samling).</em></>
          : <>Tests below use only the {data.clean.toLocaleString('sv-SE')} clean by default.</>}</p>
        <div>
          <div className="text-xs text-foreground mb-1">{sv ? 'Medium (hur skriften användes)' : 'Medium'}</div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {([['Runstenar/hällar', data.stones], [sv ? 'Bärbara (kävle/ben)' : 'Portable', data.portable], ['Mynt', data.coins], [sv ? 'Putsinskrifter' : 'Plaster', data.plaster]] as [string, number][]).map(([l, n]) => (
              <span key={l} className="inline-flex items-center gap-1 rounded border border-slate-700 px-2 py-0.5 text-muted-foreground">{l} <span className="text-foreground font-medium">{n.toLocaleString('sv-SE')}</span></span>
            ))}
          </div>
        </div>
        <p className="text-[11px] opacity-60">{sv ? 'Immobila lämningar (hällristningar, fornborgar, gravfält) har alltid pålitligt läge — de flyttas inte. Runstenarnas TEXT är giltig även om stenen flyttats; det är bara positionen som är osäker.' : 'Immovable monuments always have reliable positions; a stone’s text is valid even if relocated.'}</p>
      </CardContent>
    </Card>
  );
};
