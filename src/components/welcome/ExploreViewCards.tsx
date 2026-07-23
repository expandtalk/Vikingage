import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Layers } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DbStats } from '@/hooks/useRunicData/types';
import { NORSE_GODS_EXPANDED } from '@/utils/godNameUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

// Antal fornnordiska gudar som gudnamns-matchningen täcker (delad källa m. HeroStatsGrid).
const GOD_COUNT = Object.keys(NORSE_GODS_EXPANDED).length;

// "Bygg din vy" som MODAL: en knapp på förstasidan öppnar en dialog med kort
// (conversation starters). Korten är transparenta i samma stil som HeroStatsGrid:
// siffran är visuell ankare, ingen ikon. Varje kort öppnar en färdig GIS-vy
// (focus-preset) eller ett analysverktyg. Additivt — rör inte Explore-layouten.
interface ViewCard {
  to: string;
  sv: string;
  en: string;
  dsv: string;
  den: string;
  // Räknare hämtas ur den delade stats-källan; utelämnas där siffra saknas.
  count?: (s: DbStats) => number | undefined;
}
const CARDS: ViewCard[] = [
  { to: '/explore?focus=inscriptions', sv: 'Runstenar', en: 'Runestones', dsv: 'Alla runinskrifter på kartan.', den: 'All runic inscriptions on the map.', count: (s) => s.totalInscriptions },
  { to: '/explore?focus=gods', sv: 'Kultplatser', en: 'Cult sites', dsv: 'Förkristna kultplatser per gud (Oden, Tor, Frö…).', den: 'Pre-Christian cult sites by deity.', count: () => GOD_COUNT },
  { to: '/explore?focus=geneticEvents', sv: 'Genetik & aDNA', en: 'Genetics & aDNA', dsv: 'aDNA-platser, migrationer och djur-DNA i djuptid.', den: 'aDNA sites, migrations and animal DNA in deep time.', count: (s) => s.totalGeneticEvents },
  { to: '/explore?focus=churches', sv: 'Kyrkor & stift', en: 'Churches & dioceses', dsv: 'Medeltidskyrkor, stift och ruiner.', den: 'Medieval churches, dioceses and ruins.', count: (s) => s.layerCounts?.churches },
  { to: '/explore?focus=rivers', sv: 'Vattenvägar', en: 'Waterways', dsv: 'Floder, handelsvägar och farleder.', den: 'Rivers, trade routes and sea-lanes.', count: (s) => s.totalRivers },
  { to: '/explore?focus=eriksgatan', sv: 'Eriksgatan', en: 'Eriksgatan', dsv: 'Kungavalets riksrunda genom landskapen.', den: 'The royal election progress through the provinces.' },
  { to: '/explore?focus=fortresses', sv: 'Fornborgar', en: 'Hillforts', dsv: 'Fornborgar med datering (kol-14, morfologi).', den: 'Hillforts with dating (14C, morphology).', count: (s) => s.totalFortresses },
  { to: '/sv/ortnamn', sv: 'Ortnamn & hypoteser', en: 'Place names & hypotheses', dsv: 'Bygg egna avstånds-/räckviddstest (Agnetas 9 km).', den: 'Build your own distance/reach tests.' },
  { to: '/sv/historiska-handelser', sv: 'Tidslinje', en: 'Timeline', dsv: 'Händelser, klimat, pest, arter — en tidsaxel.', den: 'Events, climate, plague, species — one timeline.' },
  { to: '/ontologi', sv: 'Ontologi', en: 'Ontology', dsv: 'Kontraktet: entiteter, mätmetoder, dateringar, källor.', den: 'The contract: entities, measures, datings, sources.' },
];

interface ExploreViewCardsProps {
  dbStats: DbStats;
}

export const ExploreViewCards: React.FC<ExploreViewCardsProps> = ({ dbStats }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const numberLocale = sv ? 'sv-SE' : 'en-US';
  const fmt = (n: number) => n.toLocaleString(numberLocale);
  return (
    <section className="container mx-auto px-4 py-8 -mt-6 relative z-10">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-gold" />{sv ? 'Bygg din vy' : 'Build your view'}
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            {sv
              ? 'Öppna panelen och välj en färdig kartvy — eller gå till Utforska och slå på egna lager i legenden. Allt är källfört; osäkerheter redovisas.'
              : 'Open the panel and pick a ready-made map view — or go to Explore and toggle your own layers.'}
          </p>
        </div>
        <Dialog>
          <DialogTrigger className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">
            <Compass className="h-5 w-5" />{sv ? 'Bygg din vy' : 'Build your view'}
          </DialogTrigger>
          <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2"><Layers className="h-5 w-5 text-gold" />{sv ? 'Bygg din vy' : 'Build your view'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {sv ? 'Välj en färdig vy för att komma igång. I Utforska kan du sedan slå på/av lager i legenden och spara din vy.' : 'Pick a ready-made view. In Explore you can then toggle layers and save your view.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {CARDS.map((c) => {
                const raw = c.count?.(dbStats);
                const showCount = typeof raw === 'number' && raw > 0;
                return (
                  <Link key={c.to} to={c.to}
                    className="group text-left bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/15 hover:border-white/30 transition-colors p-4 flex flex-col">
                    {showCount && (
                      <span className="text-2xl font-bold text-white tabular-nums leading-none mb-1.5">{fmt(raw)}</span>
                    )}
                    <span className="text-white font-semibold text-sm">{sv ? c.sv : c.en}</span>
                    <span className="text-slate-400 text-xs mt-1 flex-1">{sv ? c.dsv : c.den}</span>
                    <span className="text-gold text-xs mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {sv ? 'Öppna' : 'Open'} <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
