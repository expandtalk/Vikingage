
import React, { useState } from 'react';
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
import { Loader2, Package, Search, ScrollText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Artefaktsidan visar VAD som är intressant: vilka runinskrifter som bär varje
// artefakttyp (12 995 has_artefact-kanter ur kunskapsgrafen), inte interna ID:n.
// Data via RPC artefact_types_v1 + get_artefact_inscriptions (20260720040000).

interface ArtefactType {
  id: string;
  name: string;
  category: string | null;
  inscription_count: number;
}

interface ArtefactInscription {
  id: string;
  signum: string;
  name: string | null;
  socken: string | null;
  landscape: string | null;
  translation_sv: string | null;
}

const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => any };

const CATEGORY_LABEL: Record<string, { sv: string; en: string }> = {
  'memorial-stones': { sv: 'Minnestenar', en: 'Memorial stones' },
  'household': { sv: 'Hushåll', en: 'Household' },
  'structural': { sv: 'Byggnadsdelar', en: 'Structural' },
  'religious-ritual': { sv: 'Religiöst & rituellt', en: 'Religious & ritual' },
  'jewelry-personal': { sv: 'Smycken & personligt', en: 'Jewellery & personal' },
  'weapons-tools': { sv: 'Vapen & verktyg', en: 'Weapons & tools' },
  'currency-trade': { sv: 'Mynt & handel', en: 'Currency & trade' },
  'other': { sv: 'Övrigt', en: 'Other' },
};

const CATEGORY_COLOR: Record<string, string> = {
  'memorial-stones': 'bg-stone-100 text-stone-800',
  'household': 'bg-amber-100 text-amber-800',
  'structural': 'bg-cyan-100 text-cyan-800',
  'religious-ritual': 'bg-purple-100 text-purple-800',
  'jewelry-personal': 'bg-pink-100 text-pink-800',
  'weapons-tools': 'bg-red-100 text-red-800',
  'currency-trade': 'bg-green-100 text-green-800',
  'other': 'bg-gray-100 text-gray-800',
};

const ArtefactsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selected, setSelected] = useState<ArtefactType | null>(null);
  const { t, language } = useLanguage();
  const sv = language === 'sv';

  const catLabel = (c: string | null) =>
    c ? (CATEGORY_LABEL[c]?.[sv ? 'sv' : 'en'] ?? c) : (sv ? 'Okategoriserad' : 'Uncategorised');
  const catColor = (c: string | null) => (c ? CATEGORY_COLOR[c] ?? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800');

  const { data: artefacts, isLoading, error } = useQuery({
    queryKey: ['artefact-types-v1'],
    queryFn: async () => {
      const { data, error } = await sb.rpc('artefact_types_v1');
      if (error) throw error;
      return (data ?? []) as ArtefactType[];
    },
  });

  // Inskrifterna för vald typ — det forskaren faktiskt vill se.
  const { data: inscriptions, isLoading: inscLoading } = useQuery({
    queryKey: ['artefact-inscriptions', selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await sb.rpc('get_artefact_inscriptions', { p_artefact_id: selected!.id });
      if (error) throw error;
      return (data ?? []) as ArtefactInscription[];
    },
  });

  const filtered = (artefacts ?? [])
    .filter((a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || a.category === selectedCategory))
    // Mest belagda typerna först — det är informationen, inte alfabetet.
    .sort((a, b) => b.inscription_count - a.inscription_count || a.name.localeCompare(b.name, 'sv'));

  const categories = Array.from(new Set((artefacts ?? []).map((a) => a.category).filter(Boolean))) as string[];
  const totalEdges = (artefacts ?? []).reduce((n, a) => n + Number(a.inscription_count), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen viking-bg">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">{t('loadingArtefacts')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen viking-bg">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center py-12">
          <p className="text-red-400">{t('errorLoadingArtefacts')}: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Artefakter"
        titleEn="Artefacts"
        description="Utforska artefakttyper med runinskrifter — från runstenar och brakteater till kammar och relikskrin, med alla belagda inskrifter per typ."
        descriptionEn="Explore artefact types bearing runic inscriptions — from runestones and bracteates to combs and reliquaries, with every attested inscription per type."
        keywords="artefakter, arkeologi, vikingatid, fornnordiska föremål, runologi, brakteat"
      />
      <Header />
      <Breadcrumbs />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Package className="h-8 w-8" />
            {t('artefactsTitle')}
          </h1>
          <p className="text-slate-300 text-lg">
            {sv
              ? 'Föremålstyperna som bär runinskrifter — klicka en typ för att se alla belagda inskrifter.'
              : 'The object types that carry runic inscriptions — click a type to see every attested inscription.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {filtered.length} {sv ? 'typer' : 'types'}
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1 text-slate-300 border-slate-500">
              {totalEdges.toLocaleString(sv ? 'sv-SE' : 'en-US')} {sv ? 'inskriftskopplingar' : 'inscription links'}
            </Badge>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder={t('searchArtefacts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/50 pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
            >
              <option value="all">{t('allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="text-black">{catLabel(cat)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((a) => (
            <Card
              key={a.id}
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              onClick={() => setSelected(a)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-white text-lg">{a.name}</CardTitle>
                  <Badge className={catColor(a.category)}>{catLabel(a.category)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <ScrollText className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-sm">
                    {Number(a.inscription_count).toLocaleString(sv ? 'sv-SE' : 'en-US')}{' '}
                    {sv ? 'inskrifter' : 'inscriptions'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detalj: inskrifterna som bär typen */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="h-6 w-6" />
                {selected?.name}
                <Badge className={catColor(selected?.category ?? null)}>{catLabel(selected?.category ?? null)}</Badge>
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  {Number(selected.inscription_count).toLocaleString(sv ? 'sv-SE' : 'en-US')}{' '}
                  {sv ? 'runinskrifter är belagda på denna föremålstyp (Samnordisk runtextdatabas).'
                      : 'runic inscriptions are attested on this object type (Scandinavian Runic-text Database).'}
                </p>
                {inscLoading && (
                  <div className="flex items-center gap-2 text-slate-400 py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />{sv ? 'Hämtar inskrifter…' : 'Loading inscriptions…'}
                  </div>
                )}
                {inscriptions && inscriptions.length > 0 && (
                  <ul className="max-h-[50vh] overflow-y-auto divide-y divide-slate-800 pr-1">
                    {inscriptions.map((i) => (
                      <li key={i.id}>
                        <Link
                          to={`/inscription/${encodeURIComponent(i.signum)}`}
                          onClick={() => setSelected(null)}
                          className="block px-1 py-2 hover:bg-amber-500/10 rounded"
                        >
                          <span className="text-amber-100 font-medium">
                            {i.signum}{i.name && i.name !== i.signum ? ` — ${i.name}` : ''}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            {[i.socken, i.landscape].filter(Boolean).join(' · ')}
                          </span>
                          {i.translation_sv && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 italic">"{i.translation_sv}"</p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {inscriptions && inscriptions.length === 0 && !inscLoading && (
                  <p className="text-sm text-slate-500 py-2">
                    {sv ? 'Inga inskrifter kopplade till denna typ ännu.' : 'No inscriptions linked to this type yet.'}
                  </p>
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
