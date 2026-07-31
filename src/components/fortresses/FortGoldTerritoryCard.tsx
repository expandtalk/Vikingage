import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, AlertTriangle, Compass } from 'lucide-react';
import { useGoldPerFortTerritory } from '@/hooks/useGoldPerFortTerritory';

// Guld per borgterritorium (Öland). Låter forskaren jämföra borgars teoretiska
// upptagningsområden mot varandra i folkvandringstida guld. Källkritik synlig.
export const FortGoldTerritoryCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const { data = [], isLoading } = useGoldPerFortTerritory();
  if (isLoading || data.length === 0) return null;

  const withGold = data.filter((d) => d.solidi_count > 0);
  const totalSolidi = data.reduce((s, d) => s + d.solidi_count, 0);
  const totalGrams = Math.round(data.reduce((s, d) => s + d.gold_grams, 0));
  const denarii = (totalSolidi * 1000).toLocaleString('sv-SE');
  const max = Math.max(1, ...withGold.map((d) => d.solidi_count));

  return (
    <Card className="viking-card mb-6 border-amber-600/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-amber-300">
          <Coins className="h-5 w-5" /> {sv ? 'Guld per borgterritorium (Öland)' : 'Gold per fort territory (Öland)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p>
          {sv
            ? <>Varje Ölands-borg får ett teoretiskt upptagningsområde (Voronoi-cell). Här räknas folkvandringstida <strong className="text-foreground">solidi</strong> inom varje cell — ett sätt att jämföra borgarnas guldtyngd mot varandra. Totalt <strong className="text-foreground">{totalSolidi}</strong> solidi ≈ <strong className="text-foreground">{totalGrams} g</strong> guld ≈ {denarii} denarer (Diocletianus).</>
            : <>Each Öland fort gets a theoretical catchment (Voronoi cell). Migration-period <strong className="text-foreground">solidi</strong> are counted inside each cell — a way to weigh forts against each other. Total <strong className="text-foreground">{totalSolidi}</strong> solidi ≈ <strong className="text-foreground">{totalGrams} g</strong> gold.</>}
        </p>

        <ul className="space-y-1">
          {withGold.slice(0, 12).map((d) => (
            <li key={d.fort_name} className="flex items-center gap-2">
              <span className="w-40 shrink-0 truncate text-foreground">
                {d.fort_name}
                {d.dated && <span className="ml-1 text-[10px] text-amber-300" title={sv ? 'daterad borg' : 'dated fort'}>◆</span>}
              </span>
              <span className="flex-1 h-2 rounded bg-slate-800 overflow-hidden">
                <span className="block h-full bg-amber-500" style={{ width: `${(d.solidi_count / max) * 100}%` }} />
              </span>
              <span className="w-24 shrink-0 text-right tabular-nums text-amber-300">
                {d.solidi_count} <span className="text-muted-foreground">({d.gold_grams} g)</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2 text-xs bg-amber-950/20 border border-amber-700/30 rounded p-2">
          <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
          <p>
            {sv
              ? <><strong className="text-amber-200">Källkritik:</strong> fyndplatserna ligger på socken-/bynivå, inte exakt, och Voronoi-cellerna är olika stora — en stor cell fångar mer guld oavsett borgen. Att <em>Högkullbacken</em> toppar (inte massaker-borgen Sandby) speglar cellstorlek och fyndprecision snarare än en säker koppling. Läs som hypotes, inte slutsats.</>
              : <><strong className="text-amber-200">Caveat:</strong> find-places are parish/village level, and Voronoi cells differ in size — a large cell captures more gold regardless of the fort. Read as a hypothesis, not a conclusion.</>}
          </p>
        </div>

        <a href="/sv/oland" className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 text-xs font-medium">
          <Compass className="h-3.5 w-3.5" /> {sv ? 'Se territorierna + solidi-lagret på Öland-kartan' : 'See territories + solidi layer on the Öland map'}
        </a>
      </CardContent>
    </Card>
  );
};
