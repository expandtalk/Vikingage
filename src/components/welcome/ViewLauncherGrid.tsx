import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DbStats } from '@/hooks/useRunicData/types';
import { RELIGIOUS_PLACES } from '@/utils/religiousLocations/religiousPlacesData';
import { EXCURSIONS } from '@/data/excursions';

// Antal namngivna fornnordiska gudar (inte namnvarianter) — kuraterad siffra.
const NORSE_GOD_COUNT = 25;
// Hedniska heliga källor/kultplatser (ej kristna).
const CULT_SITE_COUNT = RELIGIOUS_PLACES.filter((p) => p.deity !== 'christian').length;
// Från den delade utflyktslistan så kortet aldrig hamnar ur synk.
const EXCURSION_COUNT = EXCURSIONS.length;

// Kompakt "välj din lins"-launcher: transparenta kort. Kort med siffra visar bara
// rubrik + siffra (ingen mellanrubrik); kort utan siffra visar rubrik + beskrivning.
// Kort med siffra först, kort utan siffra sist.
interface LauncherCard {
  to: string;
  sv: string;
  en: string;
  dsv: string;
  den: string;
  count?: (s: DbStats) => number | undefined;
}

const CARDS: LauncherCard[] = [
  { to: '/explore?focus=inscriptions', sv: 'Runstenar', en: 'Runestones', dsv: 'Alla runinskrifter på kartan.', den: 'All runic inscriptions on the map.', count: (s) => s.totalInscriptions },
  { to: '/explore?focus=gods', sv: 'Nordiska gudar', en: 'Norse gods', dsv: 'Kultplatser per gud (Oden, Tor, Frö…).', den: 'Cult sites by deity (Odin, Thor, Freyr…).', count: () => NORSE_GOD_COUNT },
  { to: '/explore?focus=fortresses', sv: 'Fornborgar', en: 'Hillforts', dsv: 'Fornborgar med datering (kol-14, morfologi).', den: 'Hillforts with dating (14C, morphology).', count: (s) => s.totalFortresses },
  { to: '/explore?focus=cultSites', sv: 'Kultplatser', en: 'Cult sites', dsv: 'Förkristna heliga källor och kultplatser.', den: 'Pre-Christian holy springs and cult sites.', count: () => CULT_SITE_COUNT },
  { to: '/carvers', sv: 'Ristare', en: 'Carvers', dsv: 'Runristare och deras signerade verk.', den: 'Rune carvers and their signed works.', count: (s) => s.totalCarvers },
  { to: '/excursions', sv: 'Utflykter', en: 'Excursions', dsv: 'Kuraterade rundturer till platserna i fält.', den: 'Curated field trips to the sites.', count: () => EXCURSION_COUNT },
  { to: '/royal-chronicles', sv: 'Kungalängd', en: 'Royal chronicle', dsv: 'Nordiska kungar, dynastier och källor.', den: 'Nordic kings, dynasties and sources.', count: (s) => s.totalRoyalChronicles },
  { to: '/explore?focus=churches', sv: 'Kyrkor & stift', en: 'Churches & dioceses', dsv: 'Medeltidskyrkor, stift och ruiner.', den: 'Medieval churches, dioceses and ruins.', count: (s) => s.layerCounts?.churches },
  // Utan siffra — hamnar sist automatiskt vid rendering.
  { to: '/explore?focus=geneticEvents', sv: 'Genetik & aDNA', en: 'Genetics & aDNA', dsv: 'aDNA-platser, migrationer och djur-DNA i djuptid.', den: 'aDNA sites, migrations and animal DNA in deep time.' },
  { to: '/explore?focus=rivers', sv: 'Vattenvägar', en: 'Waterways', dsv: 'Floder, handelsvägar och farleder.', den: 'Rivers, trade routes and sea-lanes.' },
  { to: '/explore?focus=eriksgatan', sv: 'Eriksgatan', en: 'Eriksgatan', dsv: 'Kungavalets riksrunda genom landskapen.', den: 'The royal election progress through the provinces.' },
  { to: '/sv/ortnamn', sv: 'Ortnamn & hypoteser', en: 'Place names & hypotheses', dsv: 'Bygg egna avstånds-/räckviddstest.', den: 'Build your own distance/reach tests.' },
];

interface ViewLauncherGridProps {
  dbStats: DbStats;
}

export const ViewLauncherGrid: React.FC<ViewLauncherGridProps> = ({ dbStats }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const numberLocale = sv ? 'sv-SE' : 'en-US';
  const fmt = (n: number) => n.toLocaleString(numberLocale);

  // Kort med siffra först, utan siffra sist.
  const withNum: { c: LauncherCard; n: number }[] = [];
  const without: LauncherCard[] = [];
  CARDS.forEach((c) => {
    const raw = c.count?.(dbStats);
    if (typeof raw === 'number' && raw > 0) withNum.push({ c, n: raw });
    else without.push(c);
  });

  const Card: React.FC<{ c: LauncherCard; n?: number }> = ({ c, n }) => (
    <Link
      to={c.to}
      className="group flex flex-col text-center bg-white/[0.07] backdrop-blur-md border border-white/10 rounded-lg hover:bg-white/[0.12] hover:border-white/25 transition-colors p-3"
    >
      <span className="text-white font-semibold text-base leading-tight">{sv ? c.sv : c.en}</span>
      {typeof n === 'number' ? (
        <span className="text-2xl font-bold text-white tabular-nums leading-none mt-1.5">{fmt(n)}</span>
      ) : (
        <>
          <span className="text-slate-400 text-xs mt-1 leading-snug">{sv ? c.dsv : c.den}</span>
          <span className="text-gold text-xs mt-1.5 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {sv ? 'Öppna' : 'Open'} <ArrowRight className="h-3 w-3" />
          </span>
        </>
      )}
    </Link>
  );

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {withNum.map(({ c, n }) => <Card key={c.to} c={c} n={n} />)}
        {without.map((c) => <Card key={c.to} c={c} />)}
      </div>
    </section>
  );
};
