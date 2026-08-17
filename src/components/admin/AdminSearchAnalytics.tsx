import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MousePointerClick, AlertTriangle, Loader2 } from 'lucide-react';

// Sök-analys (admin): vad folk söker på + vad de klickar → vi lär oss vad vi ska bygga.
// Läser BARA aggregat (GDPR: ingen individdata). Admin-RLS på tabellerna. Skrivning sker via RPC.
const sb = supabase as unknown as { from: (t: string) => any };

interface TermStat { term: string; searches: number; with_hits: number; last_seen: string }
interface ClickStat { term: string; entity_type: string; entity_id: string; clicks: number }

export const AdminSearchAnalytics: React.FC = () => {
  const { data: terms = [], isLoading: lt } = useQuery({
    queryKey: ['admin-search-terms'],
    queryFn: async (): Promise<TermStat[]> => {
      const { data } = await sb.from('search_term_stat').select('*').order('searches', { ascending: false }).limit(100);
      return (data ?? []) as TermStat[];
    },
  });
  const { data: clicks = [], isLoading: lc } = useQuery({
    queryKey: ['admin-search-clicks'],
    queryFn: async (): Promise<ClickStat[]> => {
      const { data } = await sb.from('search_click').select('*').order('clicks', { ascending: false }).limit(100);
      return (data ?? []) as ClickStat[];
    },
  });

  // Innehållsluckor: termer som söks men sällan ger träff (with_hits lågt relativt searches).
  const gaps = useMemo(
    () => terms.filter((t) => t.searches >= 2 && t.with_hits / t.searches < 0.5)
      .sort((a, b) => b.searches - a.searches).slice(0, 40),
    [terms],
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-300">
        Aggregerad sök-statistik (ingen individdata sparas — GDPR). Visar vad folk söker på, vad de
        klickar på, och vilka termer som ofta saknar träff (innehållsluckor att skriva om).
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mest sökta termer */}
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Search className="h-4 w-4 text-sky-400" /> Mest sökta termer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lt ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : terms.length === 0 ? (
              <p className="text-sm text-slate-400">Ingen sökdata än (samlas in när sidan används).</p>
            ) : (
              <ul className="max-h-96 space-y-0.5 overflow-y-auto text-sm">
                {terms.map((t) => (
                  <li key={t.term} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="truncate text-slate-200">{t.term}</span>
                    <span className="shrink-0 tabular-nums text-slate-400">
                      {t.searches} <span className="text-[10px] text-slate-500">sök</span>
                      {t.searches > t.with_hits && <span className="ml-1 text-amber-400/80">· {Math.round((1 - t.with_hits / t.searches) * 100)}% miss</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Mest klickade träffar */}
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <MousePointerClick className="h-4 w-4 text-emerald-400" /> Mest klickade träffar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lc ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : clicks.length === 0 ? (
              <p className="text-sm text-slate-400">Inga klick än (samlas in när sökträffar klickas).</p>
            ) : (
              <ul className="max-h-96 space-y-0.5 overflow-y-auto text-sm">
                {clicks.map((c) => (
                  <li key={`${c.term}-${c.entity_type}-${c.entity_id}`} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="min-w-0 truncate text-slate-200">
                      <span className="text-slate-400">”{c.term}”</span> → <span className="text-[11px] text-slate-500">{c.entity_type}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-emerald-300">{c.clicks}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Innehållsluckor */}
      <Card className="bg-slate-800/50 border-amber-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Innehållsluckor — söks men saknar ofta träff
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gaps.length === 0 ? (
            <p className="text-sm text-slate-400">Inga tydliga luckor än — bra täckning, eller för lite data.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {gaps.map((t) => (
                <span key={t.term} className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-100">
                  {t.term} <span className="text-amber-400/70">· {t.searches}×</span>
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-[11px] text-slate-500">
            Detta är signal, inte order. Skriv innehåll där det finns verklig, källbelagd substans — aldrig
            för att jaga en sökterm. Klick och sökningar styr synlighet, aldrig fakta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
