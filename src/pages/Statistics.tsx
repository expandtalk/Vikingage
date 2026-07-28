import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { BarChart3, MapPin, Hammer, Landmark, Image as ImageIcon, Loader2, ScrollText, Church, Crown, Coins as CoinsIcon, Dna, Database, Compass, Fingerprint, FlaskConical, Boxes } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Plattformsöversikt (Daniel 2026-07-28): wow-siffror över ALLA dataset (platform_stats),
// därefter runstensdatabasens bläddra-per-X (runestone_stats_v1). Allt är verklig räknad data.

interface Row { name: string; count: number; id?: string; }
interface Stats { totals: Record<string, number>; by_landscape: Row[]; by_country: Row[]; top_parishes: Row[]; top_hundreds: Row[]; top_carvers: Row[]; }
type Platform = Record<string, number>;
const sb = supabase as unknown as { rpc: (fn: string) => any };

const Statistics = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const fmt = (n: number) => (n ?? 0).toLocaleString(sv ? 'sv-SE' : 'en-US');

  const { data: plat } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => { const { data, error } = await sb.rpc('platform_stats'); if (error) throw error; return data as Platform; },
  });
  const { data, isLoading } = useQuery({
    queryKey: ['runestone-stats'],
    queryFn: async () => { const { data, error } = await sb.rpc('runestone_stats_v1'); if (error) throw error; return data as Stats; },
  });

  const grandTotal = plat ? (['runic_total', 'carvers', 'churches', 'heritage_sites', 'place_names', 'coins', 'hillforts', 'fortresses', 'thing_sites', 'beacon_sites', 'harbors', 'ore_sources', 'genetic_individuals', 'kings', 'sources', 'estates', 'picture_stone_reuse'].reduce((s, k) => s + (plat[k] ?? 0), 0)) : 0;

  // grupperade wow-siffror
  const GROUPS: { title: string; titleEn: string; icon: React.ReactNode; items: [string, string, string, string?][] }[] = [
    { title: 'Runologi', titleEn: 'Runology', icon: <ScrollText className="h-5 w-5 text-gold" />, items: [
      ['runic_total', 'Runinskrifter', 'Runic inscriptions'], ['runestones', 'varav runstenar', 'of which runestones'],
      ['runic_with_cross', 'med kors', 'with a cross'], ['runic_dated', 'numeriskt daterade', 'numerically dated'],
      ['runic_christian', 'kristna åkallanden', 'Christian invocations'], ['carvers', 'ristare', 'carvers'],
      ['picture_stone_reuse', 'bildstens-återbruk', 'reused picture stones'] ] },
    { title: 'Kyrka & kristnande', titleEn: 'Church & Christianization', icon: <Church className="h-5 w-5 text-gold" />, items: [
      ['churches', 'kyrkor & kloster', 'churches & monasteries'], ['saints', 'skyddshelgon (katalog)', 'patron saints (catalogue)'] ] },
    { title: 'Makt, ting & försvar', titleEn: 'Power, assembly & defense', icon: <Crown className="h-5 w-5 text-gold" />, items: [
      ['kings', 'historiska kungar', 'historical kings'], ['sources', 'historiska källor', 'historical sources'],
      ['estates', 'gods & innehav', 'estates'], ['fortresses', 'vikingaborgar', 'Viking fortresses'],
      ['hillforts', 'fornborgar', 'hillforts'], ['thing_sites', 'tingsplatser', 'assembly sites'],
      ['beacon_sites', 'vårdkasar', 'beacons'], ['harbors', 'hamnar', 'harbours'] ] },
    { title: 'Kulturarv & ortnamn', titleEn: 'Heritage & place names', icon: <Landmark className="h-5 w-5 text-gold" />, items: [
      ['heritage_sites', 'kulturarvslämningar', 'heritage sites'], ['place_names', 'ortnamn (gazetteer)', 'place names'] ] },
    { title: 'Fynd, metall & DNA', titleEn: 'Finds, metal & DNA', icon: <Dna className="h-5 w-5 text-gold" />, items: [
      ['coins', 'mynt & ädelmetallfynd', 'coins & precious-metal finds'], ['ore_sources', 'malmkällor (proveniens)', 'ore sources'],
      ['genetic_individuals', 'genetiska individer', 'genetic individuals'] ] },
  ];

  const regionLink = (name: string) => `/explore?searchQuery=${encodeURIComponent(name)}`;
  const Bars: React.FC<{ title: string; icon: React.ReactNode; rows: Row[]; hrefKind: 'region' | 'carver' }> = ({ title, icon, rows, hrefKind }) => {
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
        title="Statistik — hela forskningsplattformen"
        titleEn="Statistics — the whole research platform"
        description="Översikt över all data i Viking Age: runinskrifter, kyrkor, helgon, ristare, kulturarvslämningar, ortnamn, mynt, fornborgar, genetik och mer. Räknad, källförd data."
        descriptionEn="Overview of all data in Viking Age: runic inscriptions, churches, saints, carvers, heritage sites, place names, coins, hillforts, genetics and more."
        keywords="vikingatid statistik, runstenar, kyrkor, kulturarv, ortnamn, forskningsdata"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-gold" />{sv ? 'Forskningsplattformen i siffror' : 'The research platform in numbers'}
          </h1>
          {plat && (
            <p className="text-muted-foreground text-lg">
              {sv ? <>Totalt <strong className="text-gold">{fmt(grandTotal)}</strong> dokumenterade, källförda poster över {GROUPS.length} kunskapsområden — från runinskrifter och kyrkor till ortnamn, genetik och metallproveniens.</>
                  : <>In total <strong className="text-gold">{fmt(grandTotal)}</strong> documented, sourced records across {GROUPS.length} domains — from runic inscriptions and churches to place names, genetics and metal provenance.</>}
            </p>
          )}
        </div>

        {/* WOW — plattformsöversikt per kunskapsområde */}
        {plat && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
            {GROUPS.map((g) => (
              <section key={g.title} className="viking-card rounded-lg border border-border p-5">
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">{g.icon}{sv ? g.title : g.titleEn}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {g.items.map(([k, svL, enL]) => (
                    <div key={k} className="text-center">
                      <div className="text-2xl font-bold text-gold tabular-nums">{fmt(plat[k])}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{sv ? svL : enL}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* METODER & SYSTEM — hur plattformen arbetar (ärligt flaggat efter mognad) */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-1"><Compass className="h-6 w-6 text-gold" />{sv ? 'Metoder & system' : 'Methods & systems'}</h2>
          <p className="text-sm text-muted-foreground mb-4">{sv ? 'Fyra arbetssätt ovanpå datat. Statusen är ärlig: vad som är i drift och vad som är en riktning.' : 'Four methods layered on the data. Status is honest: what is live vs a direction.'}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <Compass className="h-5 w-5 text-gold" />, t: 'Explorer View', d: sv ? 'Interaktiv karta med togglebara lager, räckvidds-/piltavleverktyg (cirkel, kvadrat, dagsmaskvidd) och export till GeoJSON/CSV. Utforska materialet rumsligt.' : 'Interactive map with toggleable layers, a reach probe and GeoJSON/CSV export.', s: sv ? 'I drift' : 'Live', live: true },
              { icon: <Fingerprint className="h-5 w-5 text-gold" />, t: 'Forensik & Digital Fingerprinting', d: sv ? 'Identifierar och daterar runstenar ur en "fingeravtryck": ristarhand (1 017 attributioner), korstypologi (Gräslund), numerisk datering (7 142 termini), runstil och kristna markörer.' : 'Identifies and dates runestones from a fingerprint: carver hand, cross typology, numeric dating, style, Christian markers.', s: sv ? 'Datalager i drift · analys växer' : 'Data live · analysis growing', live: true },
              { icon: <FlaskConical className="h-5 w-5 text-gold" />, t: 'Stress test (hypotesprövning)', d: sv ? 'Prövar rumsliga samband mot en kontrollgrupp — ortnamnskluster kring centralorter, kyrktäthet över tid — alltid med redovisade osäkerheter, aldrig en naken siffra.' : 'Tests spatial correlations against a control group, always with stated uncertainty.', s: sv ? 'I drift' : 'Live', live: true },
              { icon: <Boxes className="h-5 w-5 text-gold" />, t: 'Digitala tvillingar', d: sv ? 'Simuleringar mot dåtidens landskap — strandförskjutning, dagsräckvidd, farleder. Delar finns (räckvidd, strandlinje); full simulering är en riktning, inte färdig.' : 'Simulations against the past landscape — shoreline, daily reach, sailing routes. Partly built; full simulation is a direction.', s: sv ? 'Riktning · delar byggda' : 'Direction · partly built', live: false },
            ].map((m) => (
              <section key={m.t} className="viking-card rounded-lg border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">{m.icon}{m.t}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${m.live ? 'border-emerald-500/50 text-emerald-300' : 'border-amber-500/50 text-amber-300'}`}>{m.s}</span>
                </div>
                <p className="text-sm text-muted-foreground">{m.d}</p>
              </section>
            ))}
          </div>
        </div>

        {/* RUNSTENSDATABASEN — bläddra per X */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"><Database className="h-6 w-6 text-gold" />{sv ? 'Runstensdatabasen — bläddra' : 'The runestone database — browse'}</h2>
          <p className="text-sm text-muted-foreground mt-1">{sv ? 'Antal per landskap, socken, härad och ristare. Klicka en rad för att utforska vidare på kartan.' : 'Counts per province, parish, hundred and carver. Click a row to explore on the map.'}</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />{sv ? 'Laddar…' : 'Loading…'}
          </div>
        )}
        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {([['inscriptions', sv ? 'Runinskrifter' : 'Inscriptions'], ['with_coordinates', sv ? 'Med koordinater' : 'With coordinates'], ['with_image', sv ? 'Med foto' : 'With photo'], ['named', sv ? 'Namngivna stenar' : 'Named stones'], ['carvers', sv ? 'Ristare' : 'Carvers'], ['parishes', sv ? 'Socknar' : 'Parishes'], ['hundreds', sv ? 'Härader' : 'Hundreds'], ['landscapes', sv ? 'Landskap' : 'Landscapes']] as [string, string][]).map(([k, label]) => (
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
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-gold" />{sv ? 'Källor' : 'Sources'}</h2>
                <p className="text-sm text-muted-foreground">
                  {sv ? 'Bygger på Samnordisk runtextdatabas, Riksantikvarieämbetets öppna data (Fornsök/Bebyggelseregistret), Svenskt ortnamnslexikon, Wikidata/Wikipedia m.fl. Foton huvudsakligen via Wikimedia Commons (Kulturmiljöbild, RAÄ).'
                      : 'Based on the Scandinavian Runic-text Database, the Swedish National Heritage Board open data, the Swedish Place-Name Dictionary, Wikidata/Wikipedia and more. Photos mainly via Wikimedia Commons.'}
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
