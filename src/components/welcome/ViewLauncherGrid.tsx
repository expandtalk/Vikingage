import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';
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

// En kompakt "välj din lins"-launcher. Kort med självklar bild (foto + mörk
// gradient för läsbarhet) läggs överst; därefter kort med siffra, sist kort utan.
// Bilderna serveras redan komprimerade under /excursion-photos/.
interface LauncherCard {
  to: string;
  sv: string;
  en: string;
  dsv: string;
  den: string;
  image?: string;
  count?: (s: DbStats) => number | undefined;
}

const CARDS: LauncherCard[] = [
  { to: '/explore?focus=inscriptions', sv: 'Runstenar', en: 'Runestones', dsv: 'Alla runinskrifter på kartan.', den: 'All runic inscriptions on the map.', image: '/excursion-photos/karlevistenen/thumb.jpg', count: (s) => s.totalInscriptions },
  { to: '/explore?focus=gods', sv: 'Nordiska gudar', en: 'Norse gods', dsv: 'Kultplatser per gud (Oden, Tor, Frö…).', den: 'Cult sites by deity (Odin, Thor, Freyr…).', image: '/excursion-photos/gudar/gudar.jpg', count: () => NORSE_GOD_COUNT },
  { to: '/explore?focus=fortresses', sv: 'Fornborgar', en: 'Hillforts', dsv: 'Fornborgar med datering (kol-14, morfologi).', den: 'Hillforts with dating (14C, morphology).', image: '/excursion-photos/ismantorp-borg-oland/thumb.jpg', count: (s) => s.totalFortresses },
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

  // Ordning: bild-kort överst, sedan kort med siffra, sist kort utan siffra.
  const images: { c: LauncherCard; n?: number }[] = [];
  const withNum: { c: LauncherCard; n: number }[] = [];
  const without: LauncherCard[] = [];
  CARDS.forEach((c) => {
    const raw = c.count?.(dbStats);
    const n = typeof raw === 'number' && raw > 0 ? raw : undefined;
    if (c.image) images.push({ c, n });
    else if (n !== undefined) withNum.push({ c, n });
    else without.push(c);
  });

  const Footer: React.FC<{ n?: number; onImage?: boolean }> = ({ n, onImage }) => (
    <div className="mt-auto pt-2">
      {typeof n === 'number' ? (
        <span className={`block text-xl font-bold tabular-nums leading-none ${onImage ? 'text-white drop-shadow' : 'text-white'}`}>{fmt(n)}</span>
      ) : (
        <span className="text-gold text-[11px] inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {sv ? 'Öppna' : 'Open'} <ArrowRight className="h-3 w-3" />
        </span>
      )}
    </div>
  );

  const PlainCard: React.FC<{ c: LauncherCard; n?: number }> = ({ c, n }) => (
    <Link
      to={c.to}
      className="group flex flex-col text-center bg-white/[0.07] backdrop-blur-md border border-white/10 rounded-lg hover:bg-white/[0.12] hover:border-white/25 transition-colors p-2.5"
    >
      <span className="text-white font-semibold text-[13px] leading-tight">{sv ? c.sv : c.en}</span>
      <span className="text-slate-400 text-[11px] mt-0.5 leading-snug">{sv ? c.dsv : c.den}</span>
      <Footer n={n} />
    </Link>
  );

  const ImageCard: React.FC<{ c: LauncherCard; n?: number }> = ({ c, n }) => (
    <Link
      to={c.to}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-white/10 hover:border-white/30 transition-colors min-h-[132px]"
    >
      <img src={c.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
      <div className="relative flex flex-col h-full text-center p-2.5">
        <span className="text-white font-semibold text-[13px] leading-tight drop-shadow">{sv ? c.sv : c.en}</span>
        <span className="text-slate-200 text-[11px] mt-0.5 leading-snug drop-shadow">{sv ? c.dsv : c.den}</span>
        <Footer n={n} onImage />
      </div>
    </Link>
  );

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {images.map(({ c, n }) => <ImageCard key={c.to} c={c} n={n} />)}
        {withNum.map(({ c, n }) => <PlainCard key={c.to} c={c} n={n} />)}
        {without.map((c) => <PlainCard key={c.to} c={c} />)}
      </div>
    </section>
  );
};
