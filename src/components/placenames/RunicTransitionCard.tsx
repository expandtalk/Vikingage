import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cross, Ship } from 'lucide-react';

// Omvandlingsanalys: runstenarna som kristna transitionsmonument. Per landskap kristen-markör-% +
// median-datering (≈ när stenresandet kulminerade = kristnandet blev synligt), + expeditionsstenar
// (män som dog österut/Grekland/England, minnesmärkta i kristen form). Stöder tesen: den gamla
// ledungs-/färdordningen (död utomlands) ersätts av en kristen ordning, inristad i sten.

interface Region { province: string; n: number; christian_pct: number; median_dating: number | null; expedition_n: number }
interface Exp { destination: string; n: number; christian_pct: number; median_dating: number | null }

export const RunicTransitionCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const { data: regions } = useQuery({
    queryKey: ['runic-transition-region'], staleTime: 60 * 60 * 1000,
    queryFn: async () => { const { data, error } = await (supabase.rpc as any)('runic_transition_by_region'); if (error) throw error; return (data as Region[]); },
  });
  const { data: exps } = useQuery({
    queryKey: ['runic-expedition-stats'], staleTime: 60 * 60 * 1000,
    queryFn: async () => { const { data, error } = await (supabase.rpc as any)('runic_expedition_stats'); if (error) throw error; return (data as Exp[]); },
  });
  if (!regions) return null;
  const top = regions.filter((r) => r.n >= 20).slice(0, 12);

  return (
    <Card className="viking-card mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold"><Cross className="h-5 w-5" /> {sv ? 'Kristnandet i sten — omvandlingsanalys' : 'Christianisation in stone'}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p className="text-xs">{sv
          ? 'Runstenarna är till stor del kristna minnesmärken från omvändelsen. Andelen med kors/kristen bön + median-datering per landskap visar när stenresandet — och därmed kristnandet — blev synligt.'
          : 'Runestones are largely Christian memorials from the conversion. Share with a cross/prayer + median dating per province.'}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70"><span className="w-24">{sv ? 'Landskap' : 'Province'}</span><span className="flex-1">{sv ? 'Kristen markör' : 'Christian marker'}</span><span className="w-20 text-right">{sv ? 'datering' : 'dating'}</span><span className="w-16 text-right">exp.</span></div>
          {top.map((r) => (
            <div key={r.province} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0 text-foreground">{r.province}</span>
              <div className="flex-1 bg-slate-800/60 rounded"><div style={{ width: `${Math.max(2, r.christian_pct)}%`, background: '#eab308' }} className="h-2 rounded" /></div>
              <span className="w-9 text-right tabular-nums">{r.christian_pct}%</span>
              <span className="w-16 text-right tabular-nums opacity-80">{r.median_dating ? '~' + r.median_dating : '–'}</span>
              <span className="w-8 text-right tabular-nums opacity-70">{r.expedition_n || ''}</span>
            </div>
          ))}
        </div>
        {exps && exps.length > 0 && (
          <div>
            <div className="text-foreground font-medium mb-1 flex items-center gap-1.5"><Ship className="h-4 w-4 text-sky-400" /> {sv ? 'Männen som dog utomlands' : 'The men who died abroad'}</div>
            {exps.map((e) => (
              <div key={e.destination} className="flex items-center gap-2 text-xs py-0.5">
                <span className="w-44 shrink-0">{e.destination}</span>
                <span className="tabular-nums">{e.n} {sv ? 'stenar' : 'stones'}</span>
                <span className="opacity-70">· {sv ? 'kristna' : 'Christian'} {e.christian_pct}%</span>
                <span className="opacity-70">· ~{e.median_dating || '?'} e.Kr.</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] opacity-75">{sv
          ? <><strong className="text-foreground">Tolkning:</strong> stenboomen i Uppland/Södermanland (~1000–1010, 43–49 % kristna) är kristnandet gjort synligt; expeditionsstenarna (Grekland 72 %, Ingvar 56 %) minns den gamla färd-/ledungsordningens fallna — i kristen form. Den nya ordningen (skatt till kyrka och kung) ersätter färderna österut. <strong className="text-amber-300">Förbehåll:</strong> median-dateringen dras neråt i söder av äldre urnordiska stenar (Skåne/Blekinge); kristen-andelen är en undre gräns (alla kristna stenar bär inte kors).</>
          : <><strong>Reading:</strong> the Uppland/Söd boom (~1000–1010) is the conversion in stone; expedition stones memorialise the old order’s fallen in Christian form. Caveat: southern median dating is pulled down by older elder-futhark stones.</>}</p>
      </CardContent>
    </Card>
  );
};
