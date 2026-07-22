import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, Sparkles, BookOpen, PenTool, Footprints, Crown,
  Dna, Church, Waves, Castle, Tag, ArrowRight, LayoutGrid,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DbStats } from '@/hooks/useRunicData/types';
import { NORSE_GODS_EXPANDED } from '@/utils/godNameUtils';
import { RELIGIOUS_PLACES } from '@/utils/religiousLocations/religiousPlacesData';
import { EXCURSIONS } from '@/data/excursions';

// Antal fornnordiska gudar som gudnamns-matchningen täcker (delad källa m. HeroStatsGrid).
const GOD_COUNT = Object.keys(NORSE_GODS_EXPANDED).length;
// Hedniska heliga källor/kultplatser (ej kristna).
const CULT_SITE_COUNT = RELIGIOUS_PLACES.filter((p) => p.deity !== 'christian').length;
// Från den delade utflyktslistan så kortet aldrig hamnar ur synk.
const EXCURSION_COUNT = EXCURSIONS.length;

// En rik "välj din lins"-launcher på förstasidan. Återanvänder EXAKT samma kort-
// design som ExploreViewCards ("Välj en färdig vy": ikon + titel + beskrivning +
// Öppna-knapp). Additivt — ExploreViewCards-modalen och HeroStatsGrid rörs inte.
interface LauncherCard {
  to: string;
  sv: string;
  en: string;
  dsv: string;
  den: string;
  icon: typeof Compass;
  color: string;
  // Räknare hämtas ur den delade stats-källan; utelämnas där siffra saknas.
  count?: (s: DbStats) => number | undefined;
}

const CARDS: LauncherCard[] = [
  { to: '/explore?focus=inscriptions', sv: 'Runstenar', en: 'Runestones', dsv: 'Alla runinskrifter på kartan.', den: 'All runic inscriptions on the map.', icon: Compass, color: '#ef4444', count: (s) => s.totalInscriptions },
  { to: '/explore?focus=cultSites', sv: 'Kultplatser', en: 'Cult sites', dsv: 'Förkristna heliga källor och kultplatser.', den: 'Pre-Christian holy springs and cult sites.', icon: Sparkles, color: '#fbbf24', count: () => CULT_SITE_COUNT },
  { to: '/explore?focus=gods', sv: 'Gudnamn', en: 'God names', dsv: 'Kultplatser per gud (Oden, Tor, Frö…).', den: 'Cult sites by deity (Odin, Thor, Freyr…).', icon: BookOpen, color: '#f59e0b', count: () => GOD_COUNT },
  { to: '/carvers', sv: 'Ristare', en: 'Carvers', dsv: 'Runristare och deras signerade verk.', den: 'Rune carvers and their signed works.', icon: PenTool, color: '#f97316', count: (s) => s.totalCarvers },
  { to: '/excursions', sv: 'Utflykter', en: 'Excursions', dsv: 'Kuraterade rundturer till platserna i fält.', den: 'Curated field trips to the sites.', icon: Footprints, color: '#22c55e', count: () => EXCURSION_COUNT },
  { to: '/royal-chronicles', sv: 'Kungalängd', en: 'Royal chronicle', dsv: 'Nordiska kungar, dynastier och källor.', den: 'Nordic kings, dynasties and sources.', icon: Crown, color: '#d97706', count: (s) => s.totalRoyalChronicles },
  { to: '/explore?focus=geneticEvents', sv: 'Genetik & aDNA', en: 'Genetics & aDNA', dsv: 'aDNA-platser, migrationer och djur-DNA i djuptid.', den: 'aDNA sites, migrations and animal DNA in deep time.', icon: Dna, color: '#a855f7', count: (s) => s.totalGeneticEvents },
  { to: '/explore?focus=churches', sv: 'Kyrkor & stift', en: 'Churches & dioceses', dsv: 'Medeltidskyrkor, stift och ruiner.', den: 'Medieval churches, dioceses and ruins.', icon: Church, color: '#e11d48', count: (s) => s.layerCounts?.churches },
  { to: '/explore?focus=rivers', sv: 'Vattenvägar', en: 'Waterways', dsv: 'Floder, handelsvägar och farleder.', den: 'Rivers, trade routes and sea-lanes.', icon: Waves, color: '#1e40af', count: (s) => s.totalRivers },
  { to: '/explore?focus=eriksgatan', sv: 'Eriksgatan', en: 'Eriksgatan', dsv: 'Kungavalets riksrunda genom landskapen.', den: 'The royal election progress through the provinces.', icon: Crown, color: '#0891b2' },
  { to: '/explore?focus=fortresses', sv: 'Fornborgar', en: 'Hillforts', dsv: 'Fornborgar med datering (kol-14, morfologi).', den: 'Hillforts with dating (14C, morphology).', icon: Castle, color: '#dc2626', count: (s) => s.totalFortresses },
  { to: '/sv/ortnamn', sv: 'Ortnamn & hypoteser', en: 'Place names & hypotheses', dsv: 'Bygg egna avstånds-/räckviddstest.', den: 'Build your own distance/reach tests.', icon: Tag, color: '#65a30d' },
];

interface ViewLauncherGridProps {
  dbStats: DbStats;
}

export const ViewLauncherGrid: React.FC<ViewLauncherGridProps> = ({ dbStats }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const numberLocale = sv ? 'sv-SE' : 'en-US';
  const fmt = (n: number) => n.toLocaleString(numberLocale);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-gold" />{sv ? 'Välj din lins' : 'Choose your lens'}
        </h2>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">
          {sv
            ? 'Varje kort öppnar en färdig vy in i materialet. Allt är källfört; osäkerheter redovisas.'
            : 'Each card opens a ready-made view into the material. Everything is sourced; uncertainties are shown.'}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {CARDS.map((c) => {
          const raw = c.count?.(dbStats);
          const showCount = typeof raw === 'number' && raw > 0;
          return (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-colors p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <c.icon className="h-6 w-6" style={{ color: c.color }} />
                {showCount && (
                  <span className="text-white/90 font-bold text-sm tabular-nums">{fmt(raw)}</span>
                )}
              </div>
              <span className="text-white font-semibold text-sm">{sv ? c.sv : c.en}</span>
              <span className="text-slate-400 text-xs mt-1 flex-1">{sv ? c.dsv : c.den}</span>
              <span className="text-gold text-xs mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {sv ? 'Öppna' : 'Open'} <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
