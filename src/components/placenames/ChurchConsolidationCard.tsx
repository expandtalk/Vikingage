import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Kyrkoutbyggnad per landskap: täthet (kyrkor/100 km²) + t50 (median byggår = konsolideringens
// mitt). Svarar på kritikens punkt 4 (byt normalisering) + 3 (t50). OBS: mäter KONSOLIDERING
// (stenkyrkor 1100+), inte kristnandet (~950–1100). landscape KNN-backfilld; dating gles i vissa.
const AREA: Record<string, number> = { Skåne: 11027, Öland: 1342, Uppland: 12676, Södermanland: 8388, Ångermanland: 19800, Västergötland: 16873, Östergötland: 10545, Gotland: 3140, Halland: 4838, Blekinge: 2931, Småland: 29330 };
interface Row { region: string; n_churches: number; n_dated: number; t50: number | null; t25: number | null; t75: number | null }

export function ChurchConsolidationCard({ sv }: { sv: boolean }) {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    let a = true;
    (supabase.rpc as any)('church_consolidation_by_region').then(({ data }: { data: Row[] }) => {
      if (!a) return;
      setRows((data ?? []).filter(r => AREA[r.region]).map(r => ({ ...r, dens: r.n_churches / AREA[r.region] * 100 })).sort((x: any, y: any) => y.dens - x.dens));
    });
    return () => { a = false; };
  }, []);
  if (!rows.length) return null;
  const maxDens = Math.max(...rows.map((r: any) => r.dens));
  const yearX = (y: number) => ((y - 1075) / (1350 - 1075)) * 100; // 1075–1350

  return (
    <div className="mb-4 viking-card rounded-lg border border-border p-4">
      <div className="text-sm font-semibold text-foreground mb-1">{sv ? 'Kyrkoutbyggnad per landskap — täthet & tidpunkt' : 'Church-building per province — density & timing'}</div>
      <p className="text-[11px] text-muted-foreground mb-2">{sv ? 'Täthet = kyrkor per 100 km² landyta (Skåne/Öland = odlingsbygd, tätast). t50 = median byggår (linjen; band = 25–75 %). Mäter KONSOLIDERING, ej kristnandet (~950–1100).' : 'Density = churches per 100 km²; t50 = median build year.'}</p>
      <div className="space-y-1">
        {rows.map((r: any) => (
          <div key={r.region} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 text-foreground">{r.region}</span>
            <div className="w-24 shrink-0 bg-slate-800/60 rounded" title={`${r.dens.toFixed(1)} kyrkor/100 km²`}><div className="h-2 rounded bg-gold" style={{ width: `${Math.max(4, r.dens / maxDens * 100)}%` }} /></div>
            <span className="w-16 shrink-0 tabular-nums opacity-80">{r.dens.toFixed(1)}/100</span>
            {/* t50-tidslinje 1075–1350 */}
            <div className="relative flex-1 h-3 border-l border-r border-border/40">
              {r.t25 != null && r.t75 != null && <div className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-emerald-500/25 rounded" style={{ left: `${yearX(r.t25)}%`, width: `${Math.max(2, yearX(r.t75) - yearX(r.t25))}%` }} />}
              {r.t50 != null && <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-400" style={{ left: `${yearX(r.t50)}%` }} title={`t50 ${r.t50}`} />}
            </div>
            <span className="w-24 shrink-0 text-right tabular-nums opacity-80">{r.t50 ? `t50 ~${r.t50}` : '?'} <span className="opacity-50">n={r.n_dated}</span></span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground/70 mt-0.5 ml-[calc(6rem+6rem+4rem+0.5rem)]"><span>1075</span><span>1200</span><span>1350</span></div>
      <p className="text-[11px] text-muted-foreground mt-2">{sv
        ? 'Gradient: Skåne/Öland tidigast & tätast (t50 ~1150–1200), Uppland senast (~1240) — syd→nord-kristnandet i sten. Förbehåll: täthet mot TOTAL yta (odlingsbygd skulle skärpa Skåne ytterligare); t50 vilar på daterade kyrkor (n varierar, Halland/Blekinge tunt). Gravskiftes-proxyn (kremering→skelett) går EJ att bygga — inga rit-daterade gravar i vår data.'
        : 'Gradient: Skåne/Öland earliest & densest, Uppland latest — the south-to-north conversion in stone. Caveats: density vs total area; t50 rests on dated churches; a grave-rite proxy is not buildable (no rite-dated graves).'}</p>
    </div>
  );
}
