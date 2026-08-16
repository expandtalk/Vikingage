import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScrollText, MapPin, Anchor, Waves, BookOpen, Church, Landmark, Coins,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Kvantifierad kategoriöversikt för startsidan.
 *
 * Visar plattformens BREDD som kort, där varje kort bär en LIVE-räkning direkt ur
 * databasen (aldrig hårdkodade tal — talen växer) och länkar till rätt vy.
 *
 * Tillgänglighet:
 * - Semantisk lista (<ul role="list"> med <li>), rubrik kopplad via aria-labelledby.
 * - Varje kort är en riktig <Link> (fokuserbar, Enter aktiverar) med aria-label som
 *   läser rubrik + antal, så skärmläsaren inte läser en naken siffra först.
 * - Siffrorna renderas i --gold (≈8:1 mot korten, WCAG 1.4.3 AA/AAA per index.css),
 *   brödtext i white/slate-300 (>7:1). Synligt fokus via focus-visible:ring-gold.
 * - Dekorativa ikoner är aria-hidden.
 *
 * Källkritik: ett kort visas bara om dess räkning gick att hämta OCH är > 0. Hellre
 * utelämna ett kort än visa en gissad eller nollställd siffra.
 */

interface CategoryCounts {
  runestones: number | null;
  placeNames: number | null;
  shipwrecks: number | null;
  waterways: number | null; // floder + handelsvägar + farleder (summa av tillgängliga)
  sources: number | null;
  churches: number | null;
  heritage: number | null;
  coins: number | null;
}

/** Head-count (billig, ingen radhämtning). Returnerar null vid fel. */
const headCount = async (table: string): Promise<number | null> => {
  const { count, error } = await supabase
    .from(table as never)
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.error(`CategoryOverview: räkning misslyckades för ${table}:`, error.message);
    return null;
  }
  return count ?? null;
};

const loadCategoryCounts = async (): Promise<CategoryCounts> => {
  // Runstenar = kurerad delmängd (object_type = runsten). Sanningskällan är
  // DB-funktionen count_runestones() (migration 20260724200000) så definitionen
  // aldrig divergerar mot HeroStatsGrid/ViewLauncherGrid.
  const runestonesPromise = supabase
    .rpc('count_runestones')
    .then(({ data, error }) => {
      if (error) {
        console.error('CategoryOverview: count_runestones misslyckades:', error.message);
        return null;
      }
      return (data as number | null) ?? null;
    });

  const [
    runestones,
    placeNames,
    shipwrecks,
    rivers,
    tradeRoutes,
    fairways,
    sources,
    churches,
    heritage,
    coins,
  ] = await Promise.all([
    runestonesPromise,
    headCount('place_names'),
    headCount('shipwrecks'),
    headCount('river_systems'),
    headCount('trade_routes'),
    headCount('fairways'),
    headCount('historical_sources'),
    headCount('ecclesiastical_sites'),
    headCount('heritage_sites'),
    headCount('coins'),
  ]);

  // Vattenvägar = floder + handelsvägar + farleder. Summera de delar som gick att
  // hämta; null bara om samtliga tre saknas.
  const waterParts = [rivers, tradeRoutes, fairways].filter(
    (n): n is number => typeof n === 'number'
  );
  const waterways = waterParts.length > 0 ? waterParts.reduce((a, b) => a + b, 0) : null;

  return {
    runestones,
    placeNames,
    shipwrecks,
    waterways,
    sources,
    churches,
    heritage,
    coins,
  };
};

interface CategoryDef {
  key: keyof CategoryCounts;
  to: string;
  icon: LucideIcon;
  sv: string;
  en: string;
  /** kort förklaring under siffran */
  descSv: string;
  descEn: string;
  /** substantiv för aria-label ("… runstenar", "… ortnamn") */
  unitSv: string;
  unitEn: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'runestones', to: '/inscriptions', icon: ScrollText,
    sv: 'Runinskrifter', en: 'Runic inscriptions',
    descSv: 'Runstenar med translitterering, datering och karta.',
    descEn: 'Runestones with transliteration, dating and map.',
    unitSv: 'runstenar', unitEn: 'runestones',
  },
  {
    key: 'placeNames', to: '/sv/ortnamn', icon: MapPin,
    sv: 'Ortnamn', en: 'Place names',
    descSv: 'Namnled, tidsskikt och belägg i landskapet.',
    descEn: 'Name elements, time strata and attestations.',
    unitSv: 'ortnamn', unitEn: 'place names',
  },
  {
    key: 'shipwrecks', to: '/explore?focus=marine', icon: Anchor,
    sv: 'Marinarkeologi', en: 'Marine archaeology',
    descSv: 'Skeppsvrak, hamnar och undervattenslämningar.',
    descEn: 'Shipwrecks, harbours and underwater remains.',
    unitSv: 'vrak', unitEn: 'wrecks',
  },
  {
    key: 'waterways', to: '/explore?focus=rivers', icon: Waves,
    sv: 'Vattenvägar', en: 'Waterways',
    descSv: 'Floder, handelsvägar och farleder.',
    descEn: 'Rivers, trade routes and sea-lanes.',
    unitSv: 'vattenvägar', unitEn: 'waterways',
  },
  {
    key: 'sources', to: '/texter', icon: BookOpen,
    sv: 'Texter & källor', en: 'Texts & sources',
    descSv: 'Källbibliotek: krönikor, lagar och forskning.',
    descEn: 'Source library: chronicles, laws and scholarship.',
    unitSv: 'källor', unitEn: 'sources',
  },
  {
    key: 'churches', to: '/sv/kyrkor', icon: Church,
    sv: 'Kyrkor & stift', en: 'Churches & dioceses',
    descSv: 'Medeltidskyrkor, kloster och stift.',
    descEn: 'Medieval churches, monasteries and dioceses.',
    unitSv: 'kyrkor', unitEn: 'churches',
  },
  {
    key: 'heritage', to: '/explore', icon: Landmark,
    sv: 'Fornlämningar', en: 'Ancient monuments',
    descSv: 'Kulturlager ur RAÄ Fornsök — tänds i kartlegenden.',
    descEn: 'Heritage layer from the national register — toggle in the map legend.',
    unitSv: 'fornlämningar', unitEn: 'monuments',
  },
  {
    key: 'coins', to: '/coins', icon: Coins,
    sv: 'Mynt', en: 'Coins',
    descSv: 'Solidi, denarer och silverflöden i djuptid.',
    descEn: 'Solidi, denarii and silver flows in deep time.',
    unitSv: 'mynt', unitEn: 'coins',
  },
];

export const CategoryOverview: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const numberLocale = sv ? 'sv-SE' : 'en-US';
  const fmt = (n: number) => n.toLocaleString(numberLocale);

  const { data, isLoading } = useQuery({
    queryKey: ['category-overview-counts-v1'],
    queryFn: loadCategoryCounts,
    staleTime: 5 * 60 * 1000,
  });

  const headingId = 'category-overview-heading';

  const cardClass =
    'group flex h-full flex-col items-start rounded-lg bg-white/[0.07] backdrop-blur-md ' +
    'border border-white/10 p-4 transition-colors hover:bg-white/[0.12] hover:border-white/25 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-transparent';

  return (
    <section aria-labelledby={headingId} className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h2 id={headingId} className="text-xl md:text-2xl font-bold text-white">
          {sv ? 'Plattformen i siffror' : 'The platform by the numbers'}
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          {sv
            ? 'Belagt innehåll, hämtat live ur databasen. Välj en kategori för att utforska den på kartan.'
            : 'Attested content, loaded live from the database. Pick a category to explore it on the map.'}
        </p>

        <ul role="list" className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {isLoading
            ? // Skeleton: samma antal som kategorierna så layouten inte hoppar.
              CATEGORIES.map((c) => (
                <li key={c.key} aria-hidden="true">
                  <div className="h-[7.5rem] rounded-lg bg-white/[0.05] border border-white/10 animate-pulse" />
                </li>
              ))
            : CATEGORIES.map((c) => {
                const count = data?.[c.key];
                // Källkritik: hoppa över kortet hellre än att visa en trasig/nollställd siffra.
                if (typeof count !== 'number' || count <= 0) return null;
                const label = sv ? c.sv : c.en;
                const unit = sv ? c.unitSv : c.unitEn;
                const Icon = c.icon;
                return (
                  <li key={c.key}>
                    <Link
                      to={c.to}
                      aria-label={`${label}: ${fmt(count)} ${unit}`}
                      className={cardClass}
                    >
                      <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                      <span className="mt-2 text-2xl font-bold text-gold tabular-nums leading-none">
                        {fmt(count)}
                      </span>
                      <span className="mt-1.5 font-semibold text-white leading-tight">
                        {label}
                      </span>
                      <span className="mt-1 text-xs text-slate-300 leading-snug">
                        {sv ? c.descSv : c.descEn}
                      </span>
                    </Link>
                  </li>
                );
              })}
        </ul>
      </div>
    </section>
  );
};

export default CategoryOverview;
