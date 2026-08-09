import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Church, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Nationellt hypotes-kort (Öland-mönstret): andel runstenar vars nuvarande plats nämner kyrka, per
// landskap, ur RPC runestone_church_by_landscape(). HYPOTESGENERERANDE — proxy, glest flytt-data,
// och skillnaderna speglar troligen olika fenomen per landskap. Se [[runsten-forensik-program]].
interface Row { landscape: string; n: number; at_church: number; pct: number }
const sb = supabase as unknown as { rpc: (fn: string) => Promise<{ data: Row[] | null; error: unknown }> };

export const RunestoneChurchHypothesis: React.FC = () => {
  const { language } = useLanguage();
  const sv = language !== 'en';
  const { data } = useQuery({
    queryKey: ['runestone-church-landscape'],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await sb.rpc('runestone_church_by_landscape');
      if (error) throw error;
      return (data ?? []);
    },
  });
  const rows = (data ?? []).filter((r) => Number(r.n) >= 10);
  if (!rows.length) return null;
  const max = Math.max(1, ...rows.map((r) => Number(r.pct)));

  return (
    <Card className="viking-card mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold">
          <Church className="h-5 w-5" />
          {sv ? 'Runstenar & kyrkan — en hypotes över landskapen' : 'Runestones & the church — a hypothesis across the provinces'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p>
          {sv
            ? 'Hypotes: när kyrkan restes på gamla central- och kultplatser kan runstenar som markerat gård och ägande ha dragits in till kyrkan — ett spår av att kyrkan tog över mark. Nedan andelen runstenar vars nuvarande plats nämner kyrka, per landskap.'
            : 'Hypothesis: where churches were built on old central and cult sites, runestones that marked farm and ownership may have been drawn to the church — a trace of the church taking over land. Below, the share of runestones whose current location mentions a church, by province.'}
        </p>
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.landscape}>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-foreground">{r.landscape}</span>
                <span className="text-muted-foreground tabular-nums shrink-0 ml-2">{r.pct}% · {r.at_church}/{r.n}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full bg-gold/70 rounded-full" style={{ width: `${(Number(r.pct) / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className="rounded-md border border-amber-600/40 p-3">
          <div className="flex items-center gap-2 text-amber-300 font-medium mb-1">
            <AlertTriangle className="h-4 w-4" />{sv ? 'Ärliga förbehåll' : 'Honest caveats'}
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>{sv ? 'Proxy: mätt på om platsfältet nämner ”kyrka” — nuvarande läge, inte bevisad flytt.' : 'Proxy: measured on whether the location field mentions a church — current placement, not proven relocation.'}</li>
            <li>{sv ? 'Dokumenterad flytt saknas nästan helt i datat — vi kan inte belägga relokering, bara nuvarande kyrkonärhet.' : 'Documented relocation is almost absent in the data — we cannot establish moves, only present-day church proximity.'}</li>
            <li>{sv ? 'Höga andelar (Hälsingland, Närke) vilar på mycket få stenar (n ≈ 20–40) → statistiskt bräckligt.' : 'High shares (Hälsingland, Närke) rest on very few stones (n ≈ 20–40) → statistically fragile.'}</li>
            <li>{sv ? 'Skillnaderna speglar troligen OLIKA fenomen: Gotlands medeltida gravhällar i kyrkan, Upplands återbruk som byggnadssten, Götalands stenar in situ — inte en enhetlig ”kyrkan tog marken”.' : 'The differences likely reflect DIFFERENT phenomena: Gotland’s medieval grave slabs inside churches, Uppland’s reuse as building stone, Götaland’s stones in situ — not one uniform “church took the land”.'}</li>
          </ul>
        </div>
        <p className="text-xs opacity-80">
          {sv ? 'Hypotesgenererande, inte belagt. Källa: Samnordisk runtextdatabas / RAÄ; kyrko-proxy ur platsfältet.' : 'Hypothesis-generating, not established. Source: Scandinavian Runic-text Database / RAÄ; church proxy from the location field.'}
        </p>
      </CardContent>
    </Card>
  );
};
