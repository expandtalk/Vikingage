import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SearchCheck } from 'lucide-react';
import { useMatchPreview } from '@/hooks/useMatchPreview';

// Förädla ett sökord: se hur många ortnamn (OSM-registret) det träffar + exempel, och
// tuna gräns/uteslutningar tills sökningen blir rätt. Ex: gull → 71 träffar; uteslut
// gullig/gullviva för att rensa bort växtnamn.
const BOUNDS: { key: string; sv: string }[] = [
  { key: 'prefix', sv: 'förled (börjar med)' },
  { key: 'suffix', sv: 'efterled (slutar på)' },
  { key: 'substring', sv: 'delsträng (var som helst)' },
];
const split = (s: string) => s.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);

export const WordRefineCard: React.FC<{ sv: boolean }> = ({ sv }) => {
  const [stem, setStem] = useState('gull, gyll');
  const [excl, setExcl] = useState('gullig, gullviva, gullregn, gyllene');
  const [boundary, setBoundary] = useState('prefix');
  const patterns = useMemo(() => split(stem), [stem]);
  const excludes = useMemo(() => split(excl), [excl]);
  const { data, isFetching } = useMatchPreview(patterns, excludes, boundary, patterns.length > 0);

  return (
    <Card className="viking-card mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-base flex items-center gap-2">
          <SearchCheck className="h-5 w-5 text-gold" />
          {sv ? 'Förfina ett sökord' : 'Refine a search word'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {sv
            ? 'Innan du gör ett led till hypotes: se hur många ortnamn i registret (OSM) det faktiskt träffar, och rensa bort falska träffar. Så blir sökningen reproducerbar i stället för en gissning.'
            : 'Before turning a word into a hypothesis: see how many register (OSM) place names it actually hits, and strip false positives.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">{sv ? 'Stam(mar), komma-separerat' : 'Stem(s), comma-separated'}</div>
            <Input value={stem} onChange={(e) => setStem(e.target.value)} className="bg-slate-800/60 border-slate-600 text-white h-8 text-sm" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">{sv ? 'Uteslut (falska träffar)' : 'Exclude (false hits)'}</div>
            <Input value={excl} onChange={(e) => setExcl(e.target.value)} className="bg-slate-800/60 border-slate-600 text-white h-8 text-sm" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {BOUNDS.map((b) => (
            <Button key={b.key} variant={boundary === b.key ? 'default' : 'outline'} size="sm" onClick={() => setBoundary(b.key)}>{b.sv}</Button>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-700/50">
          {patterns.length === 0 ? (
            <p className="text-xs text-muted-foreground">{sv ? 'Skriv en stam.' : 'Enter a stem.'}</p>
          ) : isFetching ? (
            <p className="text-xs text-muted-foreground">{sv ? 'Räknar…' : 'Counting…'}</p>
          ) : (
            <>
              <div className="text-sm text-foreground mb-1">
                <strong className="text-gold">{data?.n ?? 0}</strong> {sv ? 'ortnamn matchar i registret' : 'place names match'}
              </div>
              <div className="flex flex-wrap gap-1">
                {(data?.samples ?? []).map((s) => <Badge key={s} variant="outline" className="text-[11px] border-slate-600 text-slate-300">{s}</Badge>)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 opacity-80">
                {sv
                  ? 'Obs: träff ≠ betydelse. gull- kan vara guld, färgen gul, "gull" (kär), personnamn eller topografi — förfina med uteslutningar och jämför sedan med maktnoder/fornborgar i hypotestestaren.'
                  : 'Note: a match is not a meaning. Refine with exclusions, then compare against power nodes/hillforts in the tester.'}
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
