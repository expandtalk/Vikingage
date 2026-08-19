import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ZoomIn, X, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';

// Bläddringsbar utgåva av Hrabanus Maurus "Liber de laudibus Sanctae Crucis" (814) — de 94 PD-bladen
// ur Bern, Burgerbibliothek Cod. 9 (historical_depictions, subject_type='manuscript'). Klicka fram/
// tillbaka + pilar/tangentbord; klick på bladet → större vy för att läsa detaljerna. Bilder hotlänkas
// (PD), rehostas aldrig. Källkritik: karolingiskt manuskript, ingår i plattformen som förlaga-spår
// (jfr Birkakrucifixet, Trotzig 2025).

interface Leaf { id: string; title: string; image_url: string; thumb_url: string | null; }

// Folio-nyckel ur titeln ("… f. 10r – …") → sorteringsordning. Omslag/tekniska blad hamnar sist.
const folioKey = (title: string): number => {
  const m = title.match(/f\.\s*(\d+)\s*([rv])/i);
  if (m) return parseInt(m[1], 10) * 2 + (m[2].toLowerCase() === 'v' ? 1 : 0);
  if (/front cover|främre pärm/i.test(title)) return -2;
  if (/back cover|bakre pärm/i.test(title)) return 100000;
  return 99999; // colorchecker o.d. sist
};
const shortLabel = (title: string): string => {
  const m = title.match(/(f\.\s*\d+\s*[rv])/i); if (m) return m[1].replace(/\s+/g, ' ');
  if (/back cover/i.test(title)) return 'Bakre pärm';
  if (/front cover/i.test(title)) return 'Främre pärm';
  if (/colorchecker/i.test(title)) return 'Färgkarta';
  return title.split('–')[0].trim();
};

const DeLaudibus = ({ forceLang }: { forceLang?: 'sv' | 'en' }) => {
  const { language } = useLanguage();
  const sv = (forceLang ?? language) === 'sv';
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['de-laudibus-leaves'],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<Leaf[]> => {
      const { data } = await (supabase as any).from('historical_depictions')
        .select('id, title, image_url, thumb_url')
        .eq('subject_type', 'manuscript').ilike('work_ref', '%laudibus%').not('image_url', 'is', null);
      // exkludera rent tekniska blad (färgkarta) ur bläddringen; behåll pärmar
      return ((data ?? []) as Leaf[])
        .filter((l) => !/colorchecker/i.test(l.title))
        .sort((a, b) => folioKey(a.title) - folioKey(b.title));
    },
  });

  const total = leaves.length;
  const cur = leaves[idx];
  const go = useMemo(() => (d: number) => setIdx((i) => Math.max(0, Math.min(total - 1, i + d))), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Escape') setZoom(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Liber de laudibus Sanctae Crucis"
        titleEn="Liber de laudibus Sanctae Crucis"
        description="Bläddringsbar utgåva av Hrabanus Maurus verk 'Liber de laudibus Sanctae Crucis' (814) — 94 blad ur Bern, Burgerbibliothek Cod. 9, public domain. Bläddra blad för blad och zooma för detaljerna."
        descriptionEn="A page-turning edition of Hrabanus Maurus's 'Liber de laudibus Sanctae Crucis' (814) — 94 leaves from Bern, Burgerbibliothek Cod. 9, public domain."
        keywords="Hrabanus Maurus, De laudibus sanctae crucis, karolingiskt manuskript, Bern Burgerbibliothek, carmina figurata, Viking Age"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 max-w-3xl">
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-foreground">
            <BookOpen className="h-7 w-7 text-gold" />
            Liber de laudibus Sanctae Crucis
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {sv ? (
              <>Hrabanus Maurus, <em>De laudibus sanctae crucis</em>. Verket i sin första form ~810–814,
              slutversionen (två böcker) efter 831; de bevarade praktexemplaren är från 800-talet. Bladen här
              kommer från <strong>Wikimedia Commons (public domain)</strong> och härrör från olika handskrifter
              (bl.a. Paris, BnF, Latin 2422 via Gallica, och Bern, Burgerbibliothek, Cod. 9) — <em>proveniensen
              varierar per blad</em>. Sidorna är <em>carmina figurata</em>: bokstäverna ligger i ett kvadratiskt
              raster där de röda fälten bildar egna, självständiga verser (<em>versus intexti</em>) — formen är
              nyckeln. Bläddra med pilarna eller ←/→; klicka på bladet för detaljerna.</>
            ) : (
              <>Hrabanus Maurus, <em>De laudibus sanctae crucis</em>. First version c. 810–814, final version
              (two books) after 831; the surviving presentation copies are 9th-century. The leaves here come from
              <strong> Wikimedia Commons (public domain)</strong> and derive from several manuscripts (incl.
              Paris, BnF, Latin 2422 via Gallica, and Bern, Burgerbibliothek, Cod. 9) — <em>provenance varies per
              leaf</em>. The pages are <em>carmina figurata</em>: letters set in a square grid where the red fields
              form independent verses (<em>versus intexti</em>) — the form is the key. Turn pages with the arrows
              or ←/→; click a leaf for the detail.</>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">{sv ? 'Laddar bladen…' : 'Loading leaves…'}</div>
        ) : !cur ? (
          <div className="py-20 text-center text-muted-foreground">{sv ? 'Inga blad hittades.' : 'No leaves found.'}</div>
        ) : (
          <>
            {/* Uppslag */}
            <div className="relative mx-auto max-w-3xl">
              <button type="button" onClick={() => setZoom(true)}
                className="group relative block w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900"
                title={sv ? 'Förstora' : 'Enlarge'}>
                <img src={cur.image_url} alt={cur.title} loading="eager"
                  className="mx-auto max-h-[72vh] w-auto object-contain" />
                <span className="absolute right-3 top-3 rounded-lg bg-slate-900/80 p-2 text-slate-200 opacity-0 transition group-hover:opacity-100">
                  <ZoomIn className="h-5 w-5" />
                </span>
              </button>
              {/* Pilar */}
              <button type="button" onClick={() => go(-1)} disabled={idx === 0}
                aria-label={sv ? 'Föregående blad' : 'Previous leaf'}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-600 bg-slate-900/85 p-2 text-slate-100 backdrop-blur disabled:opacity-30 hover:border-gold/60">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={() => go(1)} disabled={idx >= total - 1}
                aria-label={sv ? 'Nästa blad' : 'Next leaf'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-600 bg-slate-900/85 p-2 text-slate-100 backdrop-blur disabled:opacity-30 hover:border-gold/60">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Bladräknare + etikett */}
            <div className="mx-auto mt-3 max-w-3xl text-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{shortLabel(cur.title)}</span>
              <span className="mx-2">·</span>{idx + 1} / {total}
              <span className="mx-2">·</span>Wikimedia Commons · public domain
            </div>

            {/* Miniatyr-remsa (hoppa direkt) */}
            <div className="mx-auto mt-4 flex max-w-5xl gap-1.5 overflow-x-auto pb-2">
              {leaves.map((l, i) => (
                <button key={l.id} type="button" onClick={() => setIdx(i)}
                  title={shortLabel(l.title)}
                  className={`shrink-0 overflow-hidden rounded border ${i === idx ? 'border-gold' : 'border-slate-700 opacity-70 hover:opacity-100'}`}>
                  <img src={l.thumb_url || l.image_url} alt={shortLabel(l.title)} loading="lazy"
                    className="h-16 w-12 object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Zoom-lightbox — läs detaljerna */}
      {zoom && cur && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-4" onClick={() => setZoom(false)}>
          <button type="button" onClick={() => setZoom(false)} aria-label={sv ? 'Stäng' : 'Close'}
            className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-2 text-slate-200 hover:text-white">
            <X className="h-6 w-6" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} disabled={idx === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-slate-100 disabled:opacity-30">
            <ChevronLeft className="h-7 w-7" />
          </button>
          <img src={cur.image_url} alt={cur.title} className="max-h-[92vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()} />
          <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} disabled={idx >= total - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-2 text-slate-100 disabled:opacity-30">
            <ChevronRight className="h-7 w-7" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200">
            {shortLabel(cur.title)} · {idx + 1}/{total} · Wikimedia Commons (PD)
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default DeLaudibus;
