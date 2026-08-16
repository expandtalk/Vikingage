import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScrollText, MapPin, Hammer, Castle, Flame, Anchor, Waves, Landmark,
  Mountain, Droplets, Footprints, Church, Coins, FileText, BookOpen, Podcast,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Kvantifierad kategoriöversikt för startsidan (16 gyllene sifferkort).
 *
 * Visar plattformens BREDD som kort, där varje kort bär en LIVE-räkning direkt ur
 * databasen (aldrig hårdkodade tal — talen växer) och länkar till rätt vy. Detta är
 * det ENDA kortrutnätet på startsidan; den gamla sifferlösa ViewLauncherGrid är
 * absorberad hit så kategorierna inte dubbleras.
 *
 * Tillgänglighet (WCAG 2.2 AA):
 * - Semantisk lista (<ul role="list"> med <li>), rubrik kopplad via aria-labelledby.
 * - Varje kort är en riktig <Link> (fokuserbar, Enter aktiverar) med aria-label som
 *   läser rubrik + antal + enhet, så skärmläsaren inte läser en naken siffra först.
 * - Siffrorna renderas i --gold (≈8:1 mot korten, WCAG 1.4.3 AA/AAA per index.css),
 *   brödtext i white/slate-300 (>7:1). Synligt fokus via focus-visible:ring-gold.
 *   Träffyta = hela kortet (≫ 24×24 px, WCAG 2.5.8).
 * - Dekorativa ikoner är aria-hidden.
 *
 * Formatering: tusentalsavskiljare = MELLANSLAG (aldrig komma), på BÅDA språk, via
 * egen formatterare med non-breaking space (svensk standard SS-ISO 31-0).
 *
 * Källkritik: ett kort visas bara om dess räkning gick att hämta OCH är > 0. En
 * misslyckad räkning fäller bara sitt eget kort — övriga står kvar. Hellre utelämna
 * ett kort än visa en gissad eller nollställd siffra.
 */

interface CategoryCounts {
  inscriptions: number | null;   // runic_inscriptions total (kort 1, stor siffra)
  runestones: number | null;     // count_runestones() (kort 1, underrad)
  placeNames: number | null;
  carvers: number | null;
  hillforts: number | null;
  cultSites: number | null;
  shipwrecks: number | null;
  waterways: number | null;      // river_systems + trade_routes + fairways (summa)
  heritage: number | null;
  caves: number | null;          // heritage_sites där raa_type ilike '%grott%'
  baths: number | null;          // experiences där category = 'badplats'
  excursions: number | null;
  churches: number | null;
  coins: number | null;
  charters: number | null;       // Σ n från medieval_charters_stats()
  sources: number | null;
  media: number | null;
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

/** Head-count med filter uttryckt som PostgREST-fråga (för raa_type/category m.m.). */
const headCountFiltered = async (
  table: string,
  apply: (q: ReturnType<typeof supabase.from>) => unknown,
): Promise<number | null> => {
  const base = supabase.from(table as never).select('*', { count: 'exact', head: true });
  const { count, error } = (await apply(base as never)) as { count: number | null; error: { message: string } | null };
  if (error) {
    console.error(`CategoryOverview: filtrerad räkning misslyckades för ${table}:`, error.message);
    return null;
  }
  return count ?? null;
};

const loadCategoryCounts = async (): Promise<CategoryCounts> => {
  // Runstenar = kurerad delmängd (object_type = runsten). Sanningskällan är
  // DB-funktionen count_runestones() (migration 20260724200000) så definitionen
  // aldrig divergerar mot HeroStatsGrid.
  const runestonesPromise = supabase
    .rpc('count_runestones')
    .then(({ data, error }) => {
      if (error) {
        console.error('CategoryOverview: count_runestones misslyckades:', error.message);
        return null;
      }
      return (data as number | null) ?? null;
    });

  // Medeltidsbrev = summan av n per århundrade ur medieval_charters_stats().
  const chartersPromise = supabase
    .rpc('medieval_charters_stats')
    .then(({ data, error }) => {
      if (error) {
        console.error('CategoryOverview: medieval_charters_stats misslyckades:', error.message);
        return null;
      }
      const rows = (data as { n: number | null }[] | null) ?? [];
      if (rows.length === 0) return null;
      return rows.reduce((sum, r) => sum + (typeof r.n === 'number' ? r.n : 0), 0);
    });

  const [
    inscriptions,
    runestones,
    placeNames,
    carvers,
    hillforts,
    cultSites,
    shipwrecks,
    rivers,
    tradeRoutes,
    fairways,
    heritage,
    caves,
    baths,
    excursions,
    churches,
    coins,
    charters,
    sources,
    media,
  ] = await Promise.all([
    headCount('runic_inscriptions'),
    runestonesPromise,
    headCount('place_names'),
    headCount('carvers'),
    headCount('swedish_hillforts'),
    headCount('cult_sites'),
    headCount('shipwrecks'),
    headCount('river_systems'),
    headCount('trade_routes'),
    headCount('fairways'),
    headCount('heritage_sites'),
    // Grottor: raa_type innehåller "grott" (grotta/grottbildning m.fl.).
    headCountFiltered('heritage_sites', (q: any) => q.ilike('raa_type', '%grott%')),
    // Badplatser: experiences-kategorin 'badplats'. OBS: 'bath_kind' finns bara i
    // RPC-returer (nearby_experiences m.fl.), inte som kolumn på experiences — den
    // riktiga kolumnen är category.
    headCountFiltered('experiences', (q: any) => q.eq('category', 'badplats')),
    headCount('excursions'),
    headCount('ecclesiastical_sites'),
    headCount('coins'),
    chartersPromise,
    headCount('historical_sources'),
    headCount('media_sources'),
  ]);

  // Vattenvägar = floder + handelsvägar + farleder. Summera de delar som gick att
  // hämta; null bara om samtliga tre saknas.
  const waterParts = [rivers, tradeRoutes, fairways].filter(
    (n): n is number => typeof n === 'number'
  );
  const waterways = waterParts.length > 0 ? waterParts.reduce((a, b) => a + b, 0) : null;

  return {
    inscriptions,
    runestones,
    placeNames,
    carvers,
    hillforts,
    cultSites,
    shipwrecks,
    waterways,
    heritage,
    caves,
    baths,
    excursions,
    churches,
    coins,
    charters,
    sources,
    media,
  };
};

interface CategoryDef {
  key: keyof CategoryCounts;
  to: string;
  icon: LucideIcon;
  sv: string;
  en: string;
  /** kort förklaring under rubriken */
  descSv: string;
  descEn: string;
  /** substantiv för aria-label ("… runinskrifter", "… ortnamn") */
  unitSv: string;
  unitEn: string;
  /** valfri underrad med en andra räkning (kort 1: "varav N runstenar") */
  subKey?: keyof CategoryCounts;
  subPrefixSv?: string;
  subPrefixEn?: string;
  subUnitSv?: string;
  subUnitEn?: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'inscriptions', to: '/sv/runinskrifter', icon: ScrollText,
    sv: 'Runinskrifter', en: 'Runic inscriptions',
    descSv: 'Translitterering, datering och karta.',
    descEn: 'Transliteration, dating and map.',
    unitSv: 'runinskrifter', unitEn: 'runic inscriptions',
    subKey: 'runestones',
    subPrefixSv: 'varav', subPrefixEn: 'of which',
    subUnitSv: 'runstenar', subUnitEn: 'runestones',
  },
  {
    key: 'placeNames', to: '/sv/ortnamn', icon: MapPin,
    sv: 'Ortnamn', en: 'Place names',
    descSv: 'Namnled, tidsskikt och belägg i landskapet.',
    descEn: 'Name elements, time strata and attestations.',
    unitSv: 'ortnamn', unitEn: 'place names',
  },
  {
    key: 'carvers', to: '/carvers', icon: Hammer,
    sv: 'Runristare', en: 'Rune carvers',
    descSv: 'Mästare och deras signerade verk.',
    descEn: 'Masters and their signed works.',
    unitSv: 'ristare', unitEn: 'carvers',
  },
  {
    key: 'hillforts', to: '/sv/borgar', icon: Castle,
    sv: 'Fornborgar', en: 'Hillforts',
    descSv: 'Fornborgar med datering och morfologi.',
    descEn: 'Hillforts with dating and morphology.',
    unitSv: 'fornborgar', unitEn: 'hillforts',
  },
  {
    key: 'cultSites', to: '/explore', icon: Flame,
    sv: 'Kultplatser', en: 'Cult sites',
    descSv: 'Förkristna heliga platser och offerplatser.',
    descEn: 'Pre-Christian holy and sacrificial sites.',
    unitSv: 'kultplatser', unitEn: 'cult sites',
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
    key: 'heritage', to: '/explore', icon: Landmark,
    sv: 'Fornlämningar', en: 'Ancient monuments',
    descSv: 'Kulturlager ur RAÄ Fornsök — tänds i kartlegenden.',
    descEn: 'Heritage layer from the national register — toggle in the map legend.',
    unitSv: 'fornlämningar', unitEn: 'monuments',
  },
  {
    key: 'caves', to: '/grottor', icon: Mountain,
    sv: 'Grottor', en: 'Caves',
    descSv: 'Grottor och grottbildningar i landskapet.',
    descEn: 'Caves and cave formations in the landscape.',
    unitSv: 'grottor', unitEn: 'caves',
  },
  {
    key: 'baths', to: '/explore', icon: Droplets,
    sv: 'Badplatser', en: 'Bathing spots',
    descSv: 'Bad i sjö, hav och vattendrag — säsongsmedvetet.',
    descEn: 'Lake, sea and river bathing — season-aware.',
    unitSv: 'badplatser', unitEn: 'bathing spots',
  },
  {
    key: 'excursions', to: '/excursions', icon: Footprints,
    sv: 'Utflykter', en: 'Excursions',
    descSv: 'Kuraterade rundturer till platserna i fält.',
    descEn: 'Curated field trips to the sites.',
    unitSv: 'utflykter', unitEn: 'excursions',
  },
  {
    key: 'churches', to: '/sv/kyrkor', icon: Church,
    sv: 'Kyrkor & stift', en: 'Churches & dioceses',
    descSv: 'Medeltidskyrkor, kloster och stift.',
    descEn: 'Medieval churches, monasteries and dioceses.',
    unitSv: 'kyrkor', unitEn: 'churches',
  },
  {
    key: 'coins', to: '/coins', icon: Coins,
    sv: 'Mynt', en: 'Coins',
    descSv: 'Solidi, denarer och silverflöden i djuptid.',
    descEn: 'Solidi, denarii and silver flows in deep time.',
    unitSv: 'mynt', unitEn: 'coins',
  },
  {
    key: 'charters', to: '/sv/medeltidsbrev', icon: FileText,
    sv: 'Medeltidsbrev', en: 'Medieval charters',
    descSv: 'Diplom ur SDHK — utfärdare, orter och datering.',
    descEn: 'Charters from the SDHK — issuers, places and dating.',
    unitSv: 'brev', unitEn: 'charters',
  },
  {
    key: 'sources', to: '/texter', icon: BookOpen,
    sv: 'Källbibliotek', en: 'Source library',
    descSv: 'Krönikor, lagar och forskningslitteratur.',
    descEn: 'Chronicles, laws and scholarly literature.',
    unitSv: 'källor', unitEn: 'sources',
  },
  {
    key: 'media', to: '/podcast', icon: Podcast,
    sv: 'Poddar & video', en: 'Podcasts & video',
    descSv: 'Poddavsnitt och film om nordisk historia.',
    descEn: 'Podcast episodes and film on Nordic history.',
    unitSv: 'källor', unitEn: 'sources',
  },
];

// Tusentalsavskiljare = non-breaking space, aldrig komma, på båda språk.
const NBSP = ' ';
const fmt = (n: number) =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);

export const CategoryOverview: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data, isLoading } = useQuery({
    queryKey: ['category-overview-counts-v2'],
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
            ? 'Belagt innehåll, hämtat live ur databasen. Välj en kategori för att utforska den.'
            : 'Attested content, loaded live from the database. Pick a category to explore it.'}
        </p>

        <ul role="list" className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {isLoading
            ? // Skeleton: samma antal som kategorierna så layouten inte hoppar.
              CATEGORIES.map((c) => (
                <li key={c.key} aria-hidden="true">
                  <div className="h-[8.5rem] rounded-lg bg-white/[0.05] border border-white/10 animate-pulse" />
                </li>
              ))
            : CATEGORIES.map((c) => {
                const count = data?.[c.key];
                // Källkritik: hoppa över kortet hellre än att visa en trasig/nollställd siffra.
                if (typeof count !== 'number' || count <= 0) return null;

                const label = sv ? c.sv : c.en;
                const unit = sv ? c.unitSv : c.unitEn;
                const Icon = c.icon;

                // Valfri underrad (kort 1: "varav N runstenar") — endast om giltig siffra.
                const subVal = c.subKey ? data?.[c.subKey] : undefined;
                const hasSub = typeof subVal === 'number' && subVal > 0;
                const subText = hasSub
                  ? `${sv ? c.subPrefixSv : c.subPrefixEn} ${fmt(subVal as number)} ${sv ? c.subUnitSv : c.subUnitEn}`
                  : null;

                // aria-label: rubrik + huvudantal + ev. underantal, så skärmläsaren
                // aldrig läser en naken siffra utan sammanhang.
                const ariaLabel = subText
                  ? `${label}: ${fmt(count)} ${unit}, ${subText}`
                  : `${label}: ${fmt(count)} ${unit}`;

                return (
                  <li key={c.key}>
                    <Link to={c.to} aria-label={ariaLabel} className={cardClass}>
                      <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                      <span className="mt-2 text-2xl font-bold text-gold tabular-nums leading-none">
                        {fmt(count)}
                      </span>
                      <span className="mt-1.5 font-semibold text-white leading-tight">
                        {label}
                      </span>
                      {subText && (
                        <span className="mt-0.5 text-xs text-gold/80 tabular-nums leading-snug">
                          {subText}
                        </span>
                      )}
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
