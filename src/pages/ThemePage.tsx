import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { Loader2, Network, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Temasida (/tema/:slug): "se hela temat" — temats beskrivning + alla noder i
// kunskapsgrafen som är kopplade via has_theme (graph_neighborhood), grupperade
// per entitetstyp med länk till respektive vy.

interface Theme { id: string; name: string; name_en: string | null; description: string | null; description_en: string | null; slug: string | null; }
interface Edge { direction: string; predicate: string; other_id: string; other_type: string; other_label: string; notes: string | null; }

const sb = supabase as unknown as { from: (t: string) => any; rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };
const enc = encodeURIComponent;

const TYPE_LABEL: Record<string, { sv: string; en: string }> = {
  god: { sv: 'Gudar', en: 'Gods' }, city: { sv: 'Platser & gravar', en: 'Places & graves' },
  fortress: { sv: 'Anläggningar', en: 'Fortresses' }, inscription: { sv: 'Runinskrifter', en: 'Inscriptions' },
  king: { sv: 'Kungar', en: 'Kings' }, source: { sv: 'Källor', en: 'Sources' },
  carver: { sv: 'Ristare', en: 'Carvers' }, landscape: { sv: 'Landskap', en: 'Landscapes' },
  artefact: { sv: 'Artefakttyper', en: 'Artefact types' }, coin: { sv: 'Mynt', en: 'Coins' },
};

const routeFor = (type: string, label: string, id: string): string => {
  switch (type) {
    case 'god': return '/explore?focus=gods';
    case 'fortress': case 'hillfort': return '/fortresses';
    case 'king': case 'dynasty': return '/royal-chronicles';
    case 'source': return `/sources/${id}`;
    case 'carver': return `/carvers?carver=${id}`;
    case 'coin': return '/coins';
    case 'landscape': return `/explore?searchQuery=${enc(label)}`;
    default: return `/explore?searchQuery=${enc(label)}`; // city, place, inscription m.fl.
  }
};

const ThemePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data: theme, isLoading } = useQuery({
    queryKey: ['theme-page', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await sb.from('themes').select('id,name,name_en,description,description_en,slug').eq('slug', slug).maybeSingle();
      if (error) throw error;
      return data as Theme | null;
    },
  });

  const { data: edges } = useQuery({
    queryKey: ['theme-graph', theme?.id],
    enabled: !!theme?.id,
    queryFn: async () => {
      const { data, error } = await sb.rpc('graph_neighborhood', { p_id: theme!.id });
      if (error) throw error;
      return (data ?? []) as Edge[];
    },
  });

  const members = (edges ?? []).filter((e) => e.predicate === 'has_theme');
  const byType = members.reduce<Record<string, Edge[]>>((acc, e) => { (acc[e.other_type] ??= []).push(e); return acc; }, {});
  const typeOrder = Object.keys(byType).sort((a, b) => byType[b].length - byType[a].length);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={theme ? `${theme.name} — tema` : 'Tema'}
        titleEn={theme ? `${theme.name_en ?? theme.name} — theme` : 'Theme'}
        description={theme?.description ?? 'Tema i kunskapsgrafen.'}
        descriptionEn={theme?.description_en ?? theme?.description ?? 'Theme in the knowledge graph.'}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />{sv ? 'Laddar tema…' : 'Loading theme…'}
          </div>
        )}
        {!isLoading && !theme && <p className="text-muted-foreground py-16 text-center">{sv ? 'Temat hittades inte.' : 'Theme not found.'}</p>}
        {theme && (
          <>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-gold" />{sv ? theme.name : (theme.name_en ?? theme.name)}
            </h1>
            {(sv ? theme.description : (theme.description_en ?? theme.description)) && (
              <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">{sv ? theme.description : (theme.description_en ?? theme.description)}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Network className="h-4 w-4 text-gold" />
              {sv ? `${members.length} kopplade noder i kunskapsgrafen` : `${members.length} connected nodes in the knowledge graph`}
            </div>

            {typeOrder.map((type) => (
              <section key={type} className="mb-6">
                <h2 className="text-sm font-semibold text-gold/80 uppercase tracking-wide mb-2">
                  {(TYPE_LABEL[type]?.[sv ? 'sv' : 'en']) ?? type} <span className="text-gray-600">({byType[type].length})</span>
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {byType[type].map((e) => (
                    <Link key={e.other_id} to={routeFor(e.other_type, e.other_label, e.other_id)}
                      className="rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 hover:border-gold/50 hover:bg-slate-800 transition-colors">
                      <div className="text-sm text-gray-100">{e.other_label}</div>
                      {e.notes && <div className="text-xs text-gray-500 leading-snug mt-0.5">{e.notes}</div>}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
            {members.length === 0 && <p className="text-muted-foreground py-8 text-center">{sv ? 'Inga kopplade noder ännu.' : 'No connected nodes yet.'}</p>}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ThemePage;
