import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, Sprout, Skull, ZoomIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SvampMap } from '@/components/svamp/SvampMap';

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

interface Gift {
  id: string; svenskt_namn: string; vetenskapligt_namn: string; allvarlighet: number;
  toxin: string | null; symtom: string | null; kanne_pa: string | null; forvaxlas_med: string | null;
  bild_url: string | null; bild_licens: string | null; bild_kredit: string | null; bild_kalla: string | null;
}

// Ett giftsvamps-kort: bilden är DOLD (suddad) tills man klickar — man avslöjar medvetet hur den
// farliga svampen ser ut (Daniel: "klicka fram de giftiga så man ser hur de ser ut"). Toxin + symtom
// + skiljande drag alltid synliga (källbelagda).
// Klick-för-större-bild (lightbox) — delas av ätliga och giftiga korten.
type Zoom = { url: string; title: string; credit?: string | null; licens?: string | null; kalla?: string | null };
const SvampLightbox: React.FC<{ z: Zoom | null; onClose: () => void; sv: boolean }> = ({ z, onClose, sv }) => {
  if (!z) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={z.title} onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 p-4">
      <div className="max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <img src={z.url} alt={z.title} className="mx-auto max-h-[82vh] w-auto rounded-lg object-contain" />
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-300">
          <span className="font-medium text-white">{z.title}{z.credit ? <span className="font-normal text-slate-400"> · {z.credit}{z.licens ? ` · ${z.licens}` : ''}</span> : null}</span>
          <button type="button" onClick={onClose} className="rounded border border-slate-600 px-2 py-1 hover:border-gold/60">{sv ? 'Stäng' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
};

// Giftsvamp: bilden visas nu ÖPPET (Daniel: "visa alla svampar även de giftiga") med tydlig GIFTIG-
// märkning; klick → större bild.
const GiftCard: React.FC<{ g: Gift; sv: boolean; onZoom: (z: Zoom) => void }> = ({ g, sv, onZoom }) => {
  const deadly = g.allvarlighet >= 4;
  return (
    <article className={`rounded-lg border p-4 ${deadly ? 'border-red-500/60 bg-red-950/30' : 'border-orange-500/40 bg-orange-950/20'}`}>
      <div className="flex items-start gap-4">
        {g.bild_url && (
          <button type="button" onClick={() => onZoom({ url: g.bild_url!, title: g.svenskt_namn, credit: g.bild_kredit, licens: g.bild_licens, kalla: g.bild_kalla })}
            aria-label={sv ? 'Visa större bild' : 'View larger image'}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border">
            <img src={g.bild_url} alt={g.svenskt_namn} loading="lazy" className="h-full w-full object-cover" />
            <span className={`absolute left-0 top-0 px-1 py-0.5 text-[9px] font-bold text-white ${deadly ? 'bg-red-600' : 'bg-orange-600'}`}>{sv ? 'GIFTIG' : 'TOXIC'}</span>
            <span className="absolute bottom-0 right-0 bg-black/55 p-0.5 text-white opacity-0 group-hover:opacity-100"><ZoomIn className="h-3 w-3" /></span>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-base font-semibold text-foreground">{g.svenskt_namn}</h3>
            <span className="text-sm italic text-muted-foreground">{g.vetenskapligt_namn}</span>
            <Badge variant="outline" className={`text-[10px] ${deadly ? 'border-red-500/60 text-red-200' : 'border-orange-500/50 text-orange-200'}`}>
              {sv ? 'allvarlighet' : 'severity'} {g.allvarlighet}/5
            </Badge>
          </div>
          {g.toxin && <p className="mt-1 text-xs text-foreground/70"><span className="font-medium">{sv ? 'Gift:' : 'Toxin:'}</span> {g.toxin}</p>}
          {g.symtom && <p className="mt-1 text-sm text-red-100/90 leading-relaxed">{g.symtom}</p>}
          {g.kanne_pa && (
            <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed">
              <span className="font-medium text-amber-200">{sv ? 'Så skiljer du:' : 'Tell it apart:'}</span> {g.kanne_pa}
              {g.forvaxlas_med && <span className="text-muted-foreground"> ({sv ? 'förväxlas med' : 'confused with'} {g.forvaxlas_med})</span>}
            </p>
          )}
          {g.bild_url && g.bild_kredit && (
            <p className="mt-1 text-[10px] text-muted-foreground/70">
              {sv ? 'Bild:' : 'Image:'} {g.bild_kredit}{g.bild_licens ? ` · ${g.bild_licens}` : ''}
              {g.bild_kalla ? <> · <a href={g.bild_kalla} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Wikimedia</a></> : null}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

const GiftSvampSection: React.FC<{ sv: boolean; onZoom: (z: Zoom) => void }> = ({ sv, onZoom }) => {
  const { data: gift = [] } = useQuery({
    queryKey: ['svamp-giftsvamp'], staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Gift[]> => {
      const { data, error } = await (supabase as any).rpc('svamp_giftsvamplista');
      if (error) throw error;
      return (data ?? []) as Gift[];
    },
  });
  if (!gift.length) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-foreground">
        <Skull className="h-6 w-6 text-red-400" />{sv ? 'Giftiga förväxlingssvampar' : 'Poisonous look-alikes'}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {sv
          ? 'De farligaste förväxlingssvamparna — lär dig dem lika väl som matsvamparna. Klicka på en bild för större format.'
          : 'The most dangerous look-alikes — learn them as well as the edible ones. Click an image to enlarge.'}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {gift.map((g) => <GiftCard key={g.id} g={g} sv={sv} onZoom={onZoom} />)}
      </div>
    </section>
  );
};

const SvampGuide: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  const [zoom, setZoom] = useState<Zoom | null>(null);
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

        {/* Platsmedveten karta + SMHI-nederbörd (svampens främsta signal). Efter säkerhetsrutan. */}
        <SvampMap sv={sv} />

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <div className="space-y-4">
            {arter.map((a) => (
              <article key={a.id} className="viking-card rounded-lg border border-border bg-card/40 p-4">
                <div className="flex items-start gap-4">
                  {a.bild_url && (
                    <button type="button" aria-label={sv ? 'Visa större bild' : 'View larger image'}
                      onClick={() => setZoom({ url: a.bild_url!, title: a.svenskt_namn, credit: a.bild_kredit, licens: a.bild_licens, kalla: a.bild_kalla })}
                      className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border">
                      <img src={a.bild_url} alt={a.svenskt_namn} loading="lazy" className="h-full w-full object-cover" />
                      <span className="absolute bottom-0 right-0 bg-black/55 p-0.5 text-white opacity-0 group-hover:opacity-100"><ZoomIn className="h-3 w-3" /></span>
                    </button>
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

        <GiftSvampSection sv={sv} onZoom={setZoom} />

        <p className="mt-6 text-[11px] text-muted-foreground/70">
          {sv
            ? 'Data: plattformens svampmodell (art, kännetecken, förväxlingsrisk). Bilder: fria (Wikimedia CC/PD) där de finns. Guiden ersätter inte auktoritativ svampkunskap.'
            : 'Data: the platform mushroom model. Images: free (Wikimedia CC/PD) where available. This guide does not replace authoritative expertise.'}
        </p>
      </main>
      <SvampLightbox z={zoom} onClose={() => setZoom(null)} sv={sv} />
      <Footer />
    </div>
  );
};

export default SvampGuide;
