
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { PageMeta } from '@/components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Loader2, Package, Search, ScrollText, ArrowLeft,
  Landmark, Home, Building2, Sparkles, Gem, Swords, Coins as CoinsIcon, Boxes,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Kategori-först UX (Daniel 2026-07-20): 8 kategorikort → typlista i kategorin →
// inskrifter per typ. Kategorikorten bär IKONER, inte foton — vi saknar äkta
// objektbilder, och en påhittad bild skulle antyda dokumentation vi inte har.
// Data via artefact_types_v1 + get_artefact_inscriptions.

interface ArtefactType { id: string; name: string; category: string | null; inscription_count: number; }
interface ArtefactInscription { id: string; signum: string; name: string | null; socken: string | null; landscape: string | null; translation_sv: string | null; }

const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => any };
const OTHER = 'other';

const CAT: Record<string, { sv: string; en: string; icon: LucideIcon; color: string; descSv: string; descEn: string }> = {
  'memorial-stones': { sv: 'Minnesmärken', en: 'Memorials', icon: Landmark, color: 'text-stone-300', descSv: 'Runstenar, hällar och gravmonument', descEn: 'Runestones, rock faces and grave monuments' },
  'religious-ritual': { sv: 'Religiöst & rituellt', en: 'Religious & ritual', icon: Sparkles, color: 'text-purple-300', descSv: 'Kors, amuletter och kultföremål', descEn: 'Crosses, amulets and cult objects' },
  'household': { sv: 'Hushåll', en: 'Household', icon: Home, color: 'text-amber-300', descSv: 'Redskap och husgeråd', descEn: 'Tools and household goods' },
  'structural': { sv: 'Byggnadsdelar', en: 'Structural', icon: Building2, color: 'text-cyan-300', descSv: 'Byggnadssten och konstruktionsdelar', descEn: 'Building stone and structural parts' },
  'jewelry-personal': { sv: 'Smycken & personligt', en: 'Jewellery & personal', icon: Gem, color: 'text-pink-300', descSv: 'Spännen, ringar och personliga föremål', descEn: 'Brooches, rings and personal items' },
  'weapons-tools': { sv: 'Vapen & verktyg', en: 'Weapons & tools', icon: Swords, color: 'text-red-300', descSv: 'Vapen, redskap och verktyg', descEn: 'Weapons, implements and tools' },
  'currency-trade': { sv: 'Mynt & handel', en: 'Currency & trade', icon: CoinsIcon, color: 'text-green-300', descSv: 'Mynt, vikter och handelsföremål', descEn: 'Coins, weights and trade objects' },
  [OTHER]: { sv: 'Övrigt & ej kategoriserat', en: 'Other & uncategorised', icon: Boxes, color: 'text-slate-300', descSv: 'Föremål som ännu inte förts till en kategori', descEn: 'Objects not yet assigned to a category' },
};
const catKey = (c: string | null) => (c && CAT[c] ? c : OTHER);

const ArtefactsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<ArtefactType | null>(null);
  const { t, language } = useLanguage();
  const sv = language === 'sv';

  const { data: artefacts, isLoading, error } = useQuery({
    queryKey: ['artefact-types-v1'],
    queryFn: async () => {
      const { data, error } = await sb.rpc('artefact_types_v1');
      if (error) throw error;
      return (data ?? []) as ArtefactType[];
    },
  });

  const { data: inscriptions, isLoading: inscLoading } = useQuery({
    queryKey: ['artefact-inscriptions', selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await sb.rpc('get_artefact_inscriptions', { p_artefact_id: selected!.id });
      if (error) throw error;
      return (data ?? []) as ArtefactInscription[];
    },
  });

  // Kategoriaggregat för nivå 0
  const categories = useMemo(() => {
    const m = new Map<string, { types: number; inscriptions: number }>();
    for (const a of artefacts ?? []) {
      const k = catKey(a.category);
      const e = m.get(k) ?? { types: 0, inscriptions: 0 };
      e.types += 1; e.inscriptions += Number(a.inscription_count);
      m.set(k, e);
    }
    // Kända kategorier i fast ordning, "other" sist
    return Object.keys(CAT)
      .filter((k) => m.has(k))
      .map((k) => ({ key: k, ...m.get(k)! }))
      .sort((a, b) => (a.key === OTHER ? 1 : b.key === OTHER ? -1 : b.inscriptions - a.inscriptions));
  }, [artefacts]);

  // Typerna i vald kategori (eller sökträffar globalt)
  const q = searchTerm.trim().toLowerCase();
  const typesInView = useMemo(() => {
    if (!artefacts) return [];
    return artefacts
      .filter((a) => (q ? a.name.toLowerCase().includes(q) : (activeCat ? catKey(a.category) === activeCat : false)))
      .sort((a, b) => b.inscription_count - a.inscription_count || a.name.localeCompare(b.name, 'sv'));
  }, [artefacts, activeCat, q]);

  const fmt = (n: number) => Number(n).toLocaleString(sv ? 'sv-SE' : 'en-US');

  if (isLoading) {
    return (
      <div className="min-h-screen viking-bg"><Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white" /><span className="ml-2 text-white">{t('loadingArtefacts')}</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen viking-bg"><Header />
        <div className="container mx-auto px-4 py-8 text-center py-12"><p className="text-red-400">{t('errorLoadingArtefacts')}: {(error as Error).message}</p></div>
      </div>
    );
  }

  const showTypes = !!activeCat || q.length > 0;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Artefakter"
        titleEn="Artefacts"
        description="Föremålstyper som bär runinskrifter, ordnade i kategorier — från runstenar och brakteater till kammar och relikskrin, med alla belagda inskrifter per typ."
        descriptionEn="Object types bearing runic inscriptions, arranged by category — from runestones and bracteates to combs and reliquaries, with every attested inscription per type."
        keywords="artefakter, arkeologi, vikingatid, fornnordiska föremål, runologi, brakteat"
      />
      <Header />
      <Breadcrumbs />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <Package className="h-8 w-8" />{t('artefactsTitle')}
          </h1>
          <p className="text-slate-300 text-lg">
            {sv ? 'Föremålstyperna som bär runinskrifter, ordnade i kategorier. Välj en kategori — eller sök direkt.'
                : 'The object types that carry runic inscriptions, arranged by category. Pick a category — or search directly.'}
          </p>
        </div>

        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            placeholder={t('searchArtefacts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder-white/50 pl-10"
          />
        </div>

        {/* Nivå 0: kategorikort */}
        {!showTypes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => {
              const meta = CAT[c.key];
              const Icon = meta.icon;
              return (
                <button key={c.key} onClick={() => setActiveCat(c.key)}
                  className="viking-card rounded-lg border border-border p-5 text-left hover:bg-card/80 transition-colors group">
                  <Icon className={`h-8 w-8 ${meta.color} mb-3`} />
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-gold transition-colors">{sv ? meta.sv : meta.en}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">{sv ? meta.descSv : meta.descEn}</p>
                  <div className="flex items-center gap-1.5 text-sm text-slate-300">
                    <ScrollText className="h-3.5 w-3.5 text-amber-400" />
                    {fmt(c.inscriptions)} {sv ? 'inskrifter' : 'inscriptions'}
                    <span className="text-muted-foreground/60">· {c.types} {sv ? 'typer' : 'types'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Nivå 1: typerna i kategorin (eller sökträffar) */}
        {showTypes && (
          <>
            <div className="flex items-center gap-3 mb-5">
              {!q && (
                <button onClick={() => setActiveCat(null)} className="inline-flex items-center gap-1 text-sm text-gold hover:underline">
                  <ArrowLeft className="h-4 w-4" />{sv ? 'Alla kategorier' : 'All categories'}
                </button>
              )}
              <h2 className="text-2xl font-bold text-white">
                {q ? (sv ? `Sökträffar för "${searchTerm}"` : `Results for "${searchTerm}"`)
                   : (sv ? CAT[activeCat!].sv : CAT[activeCat!].en)}
                <span className="text-base font-normal text-slate-400"> · {typesInView.length}</span>
              </h2>
            </div>

            {typesInView.length === 0 ? (
              <p className="text-slate-400 py-8">{sv ? 'Inga föremålstyper hittades.' : 'No object types found.'}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {typesInView.map((a) => (
                  <Card key={a.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors cursor-pointer" onClick={() => setSelected(a)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">{a.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <ScrollText className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-sm">{fmt(a.inscription_count)} {sv ? 'inskrifter' : 'inscriptions'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Detalj: inskrifterna som bär typen */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="h-6 w-6" />{selected?.name}
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  {fmt(selected.inscription_count)} {sv ? 'runinskrifter är belagda på denna föremålstyp (Samnordisk runtextdatabas).'
                    : 'runic inscriptions are attested on this object type (Scandinavian Runic-text Database).'}
                </p>
                {inscLoading && (<div className="flex items-center gap-2 text-slate-400 py-4"><Loader2 className="h-4 w-4 animate-spin" />{sv ? 'Hämtar inskrifter…' : 'Loading inscriptions…'}</div>)}
                {inscriptions && inscriptions.length > 0 && (
                  <ul className="max-h-[50vh] overflow-y-auto divide-y divide-slate-800 pr-1">
                    {inscriptions.map((i) => (
                      <li key={i.id}>
                        <Link to={`/inscription/${encodeURIComponent(i.signum)}`} onClick={() => setSelected(null)} className="block px-1 py-2 hover:bg-amber-500/10 rounded">
                          <span className="text-amber-100 font-medium">{i.signum}{i.name && i.name !== i.signum ? ` — ${i.name}` : ''}</span>
                          <span className="text-xs text-slate-400 ml-2">{[i.socken, i.landscape].filter(Boolean).join(' · ')}</span>
                          {i.translation_sv && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 italic">"{i.translation_sv}"</p>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {inscriptions && inscriptions.length === 0 && !inscLoading && (
                  <p className="text-sm text-slate-500 py-2">{sv ? 'Inga inskrifter kopplade till denna typ ännu.' : 'No inscriptions linked to this type yet.'}</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default ArtefactsPage;
