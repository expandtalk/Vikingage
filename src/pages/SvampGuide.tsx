import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, Sprout } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/svamp — svampguide. SÄKERHETSKRITISK: verktyget är planerings-/utbildningsstöd, ALDRIG en
// ätlighetsdom. Data ur svamp.art + svamp.forvaxlingsrisk via RPC svamp_artlista(). Kännetecken +
// förväxlingsrisk (allvarlighet 1–5) surfas per art. Fria bilder (CC/PD) när de finns.

interface Forvaxling { art: string; allvarlighet: number; skilj: string }
interface Art {
  id: string; svenskt_namn: string; vetenskapligt_namn: string; sakerhetsklass: string;
  naringsstrategi: string | null; kannetecken: string | null; aktiv: boolean;
  bild_url: string | null; bild_licens: string | null; bild_kredit: string | null; bild_kalla: string | null;
  forvaxling: Forvaxling[];
}
const sb = supabase as unknown as { rpc: (fn: string) => Promise<{ data: any; error: any }> };

const KLASS: Record<string, string> = {
  A_taggsvamp: 'Taggsvamp', B_kantarell: 'Kantarell', C_sopp: 'Sopp', D_ticka: 'Ticka',
  E_riska: 'Riska', kraver_checklista: 'Kräver checklista',
};
// Allvarlighetsfärg för förväxlingsrisk (1 = ofarlig förväxling, 5 = livsfarlig).
const sevColor = (n: number) => n >= 4 ? 'border-red-500/60 bg-red-950/40 text-red-200'
  : n === 3 ? 'border-orange-500/50 bg-orange-950/30 text-orange-200'
  : 'border-slate-600 bg-slate-800/40 text-slate-300';

const SvampGuide: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  const { data: arter = [], isLoading } = useQuery({
    queryKey: ['svamp-artlista'], staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Art[]> => {
      const { data, error } = await sb.rpc('svamp_artlista');
      if (error) throw error;
      return (data ?? []) as Art[];
    },
  });

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Svampguide — igenkänning, förväxlingsrisk & säkerhet"
        titleEn="Mushroom guide — identification, look-alikes & safety"
        description="Svampguide med kännetecken, säkerhetsklass och förväxlingsrisker. Planerings- och utbildningsstöd — aldrig en ätlighetsdom."
        keywords="svamp, Karl Johan, stensopp, brunsopp, kantarell, förväxling, giftsvamp, säkerhet"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
          <Sprout className="h-8 w-8 text-emerald-400" />{sv ? 'Svampguide' : 'Mushroom guide'}
        </h1>

        {/* SÄKERHETS-DISCLAIMER (obligatorisk, överst) */}
        <div className="mb-6 rounded-lg border-2 border-red-500/60 bg-red-950/40 p-4">
          <div className="flex items-center gap-2 text-red-200 font-semibold mb-1">
            <ShieldAlert className="h-5 w-5" />{sv ? 'Läs detta först — säkerhet' : 'Read this first — safety'}
          </div>
          <p className="text-sm text-red-100/90 leading-relaxed">
            {sv
              ? 'Detta är ett planerings- och utbildningsstöd, INTE en ätlighetsdom. Ät aldrig en svamp du inte är 100 % säker på. En app kan aldrig ersätta säker artkunskap — verifiera alltid mot expert eller auktoritativ svampnyckel innan du äter. Blånande kött säger ingenting om giftighet. Vid misstänkt förgiftning: ring 112, eller Giftinformationscentralen 010-456 67 00.'
              : 'This is a planning and educational aid, NOT a verdict on edibility. Never eat a mushroom you are not 100 % sure of. An app can never replace secure species knowledge — always verify against an expert or an authoritative key before eating. Bluing flesh tells you nothing about toxicity. Suspected poisoning: call emergency services.'}
          </p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <div className="space-y-4">
            {arter.map((a) => (
              <article key={a.id} className="viking-card rounded-lg border border-border bg-card/40 p-4">
                <div className="flex items-start gap-4">
                  {a.bild_url && (
                    <img src={a.bild_url} alt={a.svenskt_namn} loading="lazy"
                      className="h-24 w-24 shrink-0 rounded-md object-cover border border-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <h2 className="text-lg font-semibold text-foreground">{a.svenskt_namn}</h2>
                      <span className="text-sm italic text-muted-foreground">{a.vetenskapligt_namn}</span>
                      <Badge variant="secondary" className="text-[10px]">{KLASS[a.sakerhetsklass] ?? a.sakerhetsklass}</Badge>
                      {!a.aktiv && <Badge variant="outline" className="text-[10px] text-muted-foreground">{sv ? 'referens' : 'reference'}</Badge>}
                    </div>
                    {a.kannetecken && <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed">{a.kannetecken}</p>}
                    {a.bild_url && a.bild_kredit && (
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        {sv ? 'Bild:' : 'Image:'} {a.bild_kredit}{a.bild_licens ? ` · ${a.bild_licens}` : ''}
                        {a.bild_kalla ? <> · <a href={a.bild_kalla} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Wikimedia</a></> : null}
                      </p>
                    )}
                  </div>
                </div>

                {a.forvaxling.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300/90">
                      <AlertTriangle className="h-3.5 w-3.5" />{sv ? 'Förväxlingsrisk' : 'Look-alikes'}
                    </div>
                    {a.forvaxling.map((f, i) => (
                      <div key={i} className={`rounded border px-2.5 py-1.5 text-xs ${sevColor(f.allvarlighet)}`}>
                        <span className="font-medium">{f.art}</span>
                        <span className="ml-1.5 text-[10px] opacity-80">{sv ? 'allvarlighet' : 'severity'} {f.allvarlighet}/5</span>
                        <p className="mt-0.5 opacity-90">{f.skilj}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <p className="mt-6 text-[11px] text-muted-foreground/70">
          {sv
            ? 'Data: plattformens svampmodell (art, kännetecken, förväxlingsrisk). Bilder: fria (Wikimedia CC/PD) där de finns. Guiden ersätter inte auktoritativ svampkunskap.'
            : 'Data: the platform mushroom model. Images: free (Wikimedia CC/PD) where available. This guide does not replace authoritative expertise.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default SvampGuide;
