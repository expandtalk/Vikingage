import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { BarChart3, MapPin, Hammer, Landmark, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Statistik/bläddra-hub (Daniel 2026-07-20): ingång till materialet per landskap,
// land, socken, härad och ristare — samma bläddra-per-X som runkartan, byggt på
// runestone_stats_v1. Varje rad länkar vidare (regionsök / ristarsida).

interface Row { name: string; count: number; id?: string; }
interface Stats {
  totals: Record<string, number>;
  by_landscape: Row[]; by_country: Row[];
  top_parishes: Row[]; top_hundreds: Row[]; top_carvers: Row[];
}

const sb = supabase as unknown as { rpc: (fn: string) => any };

const Statistics = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const fmt = (n: number) => (n ?? 0).toLocaleString(sv ? 'sv-SE' : 'en-US');

  const { data, isLoading } = useQuery({
    queryKey: ['runestone-stats'],
    queryFn: async () => {
      const { data, error } = await sb.rpc('runestone_stats_v1');
      if (error) throw error;
      return data as Stats;
    },
  });

  const TOTALS: Array<[string, string]> = [
    ['inscriptions', sv ? 'Runinskrifter' : 'Inscriptions'],
    ['with_coordinates', sv ? 'Med koordinater' : 'With coordinates'],
    ['with_image', sv ? 'Med foto' : 'With photo'],
    ['named', sv ? 'Namngivna stenar' : 'Named stones'],
    ['carvers', sv ? 'Ristare' : 'Carvers'],
    ['parishes', sv ? 'Socknar' : 'Parishes'],
    ['hundreds', sv ? 'Härader' : 'Hundreds'],
    ['landscapes', sv ? 'Landskap' : 'Landscapes'],
  ];

  // region/carver-rader länkar vidare
  const regionLink = (name: string) => `/explore?searchQuery=${encodeURIComponent(name)}`;

  const Bars: React.FC<{ title: string; icon: React.ReactNode; rows: Row[]; hrefKind: 'region' | 'carver' }> =
    ({ title, icon, rows, hrefKind }) => {
      const max = Math.max(1, ...rows.map((r) => r.count));
      return (
        <section className="viking-card rounded-lg border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">{icon}{title}</h2>
          <ul className="space-y-1.5">
            {rows.map((r) => {
              const href = hrefKind === 'carver' && r.id ? `/carvers?carver=${r.id}` : regionLink(r.name);
              return (
                <li key={r.id ?? r.name}>
                  <Link to={href} className="group block">
                    <div className="flex items-center justify-between text-sm mb-0.5">
                      <span className="text-foreground group-hover:text-gold transition-colors truncate">{r.name}</span>
                      <span className="text-muted-foreground tabular-nums shrink-0 ml-2">{fmt(r.count)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div className="h-full bg-gold/70 rounded-full" style={{ width: `${(r.count / max) * 100}%` }} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      );
    };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Statistik"
        titleEn="Statistics"
        description="Statistik över runinskrifterna: antal per landskap, land, socken, härad och runristare. Bläddra materialet och hoppa vidare till kartan."
        descriptionEn="Statistics on the runic inscriptions: counts per province, country, parish, hundred and carver. Browse the material and jump to the map."
        keywords="runstenar statistik, runinskrifter per landskap, runristare, socken, härad"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-gold" />
            {sv ? 'Statistik' : 'Statistics'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {sv ? 'Bläddra materialet — antal per landskap, socken, härad och ristare. Klicka en rad för att utforska vidare.'
                : 'Browse the material — counts per province, parish, hundred and carver. Click a row to explore further.'}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />{sv ? 'Laddar statistik…' : 'Loading statistics…'}
          </div>
        )}

        {data && (
          <>
            {/* Totalsiffror */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {TOTALS.map(([k, label]) => (
                <div key={k} className="viking-card rounded-lg border border-border p-4 text-center">
                  <div className="text-2xl font-bold text-gold">{fmt(data.totals[k])}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Bars title={sv ? 'Per landskap' : 'By province'} icon={<MapPin className="h-5 w-5 text-gold" />} rows={data.by_landscape} hrefKind="region" />
              <Bars title={sv ? 'Per land' : 'By country'} icon={<MapPin className="h-5 w-5 text-gold" />} rows={data.by_country} hrefKind="region" />
              <Bars title={sv ? 'Socknar med flest' : 'Top parishes'} icon={<Landmark className="h-5 w-5 text-gold" />} rows={data.top_parishes} hrefKind="region" />
              <Bars title={sv ? 'Härader med flest' : 'Top hundreds'} icon={<Landmark className="h-5 w-5 text-gold" />} rows={data.top_hundreds} hrefKind="region" />
              <Bars title={sv ? 'Ristare med flest inskrifter' : 'Most prolific carvers'} icon={<Hammer className="h-5 w-5 text-gold" />} rows={data.top_carvers} hrefKind="carver" />
              <section className="viking-card rounded-lg border border-border p-5">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gold" />{sv ? 'Källor' : 'Sources'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {sv ? 'Faktauppgifterna bygger på Samnordisk runtextdatabas och Riksantikvarieämbetets öppna data. Fotografier huvudsakligen via Wikimedia Commons (Kulturmiljöbild, RAÄ) samt egen dokumentation.'
                      : 'Data is based on the Scandinavian Runic-text Database and the Swedish National Heritage Board open data. Photographs mainly via Wikimedia Commons (Kulturmiljöbild, RAÄ) and own documentation.'}
                </p>
              </section>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Statistics;
