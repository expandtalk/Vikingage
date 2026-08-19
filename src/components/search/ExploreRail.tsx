import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Compass } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAnswerContext } from '@/hooks/useAnswerContext';
import { useLanguage } from '@/contexts/LanguageContext';

// "Utforska & upplev"-railen — region + utflykter + svamp (säsong). BOR i den YTTRE höger-kolumnen
// (GlobalSearch, ovanför runverktyget), INTE i svarspanelens mittkolumn (Daniel: "Svampkartan ska
// inte ligga i main överhuvudtaget"). Självförsörjande: återanvänder useAnswerContext(query):s
// cachade center (react-query dedupar) → pages_near för regionsidor.
export const ExploreRail: React.FC<{ query: string; onGo: (route: string) => void }> = ({ query, onGo }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data } = useAnswerContext(query);
  const center = data?.center;

  const { data: regionPages = [] } = useQuery({
    queryKey: ['rail-region-pages', center?.lat, center?.lng],
    enabled: !!(center && center.lat != null && center.lng != null),
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<{ title: string; url: string }[]> => {
      const { data: rows } = await (supabase as any).rpc('pages_near', { p_lat: center!.lat, p_lng: center!.lng, radius_m: 60000 });
      return ((rows ?? []) as any[]).map((r) => ({ title: r.title_sv, url: r.url })).slice(0, 5);
    },
  });

  if (query.trim().length < 2) return null;
  const m = new Date().getMonth() + 1; const inSeason = m >= 8 && m <= 11;

  return (
    <div className="space-y-4 px-3 pt-3 text-left">
      {regionPages.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-gold">
            <BookOpen className="h-3.5 w-3.5" /> {sv ? 'Utforska regionen' : 'Explore the region'}
          </h3>
          <div className="flex flex-col gap-1.5">
            {regionPages.map((p) => (
              <button key={p.url} onClick={() => onGo(p.url)}
                className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-left text-sm font-medium text-amber-100 hover:bg-gold/20">
                {p.title} →
              </button>
            ))}
          </div>
        </section>
      )}
      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-emerald-300">
          <Compass className="h-3.5 w-3.5" /> {sv ? 'Utforska & upplev' : 'Explore & experience'}
        </h3>
        <div className="flex flex-col gap-1.5 text-sm">
          <button onClick={() => onGo(sv ? '/sv/utflykter' : '/excursions')}
            className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-left font-medium text-slate-100 hover:border-emerald-500/50 hover:text-emerald-100">
            {sv ? 'Utflykter i trakten' : 'Excursions nearby'} →
          </button>
          <button onClick={() => onGo('/sv/svamp')}
            className={`rounded-lg border px-3 py-1.5 text-left font-medium ${inSeason ? 'border-amber-500/50 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20' : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-amber-500/40'}`}>
            🍄 {sv ? 'Svampkarta' : 'Mushroom map'} {inSeason ? (sv ? '· i säsong nu' : '· in season now') : (sv ? '· säsong aug–nov' : '· season Aug–Nov')} →
          </button>
        </div>
      </section>
    </div>
  );
};
