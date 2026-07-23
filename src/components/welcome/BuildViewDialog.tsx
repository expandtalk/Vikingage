import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Layers } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

// "Bygg din vy" som en knapp i toppnavet: öppnar en dialog med färdiga kartvyer
// (focus-presets) och analysverktyg. Fristående (ingen panel, ingen dbStats) så
// den kan sitta globalt i Header. Additivt — rör inte Explore-layouten.
interface ViewCard { to: string; sv: string; en: string; dsv: string; den: string }
const CARDS: ViewCard[] = [
  { to: '/explore?focus=inscriptions', sv: 'Runstenar', en: 'Runestones', dsv: 'Alla runinskrifter på kartan.', den: 'All runic inscriptions on the map.' },
  { to: '/explore?focus=gods', sv: 'Kultplatser', en: 'Cult sites', dsv: 'Förkristna kultplatser per gud (Oden, Tor, Frö…).', den: 'Pre-Christian cult sites by deity.' },
  { to: '/explore?focus=geneticEvents', sv: 'Genetik & aDNA', en: 'Genetics & aDNA', dsv: 'aDNA-platser, migrationer och djur-DNA i djuptid.', den: 'aDNA sites, migrations and animal DNA in deep time.' },
  { to: '/explore?focus=churches', sv: 'Kyrkor & stift', en: 'Churches & dioceses', dsv: 'Medeltidskyrkor, stift och ruiner.', den: 'Medieval churches, dioceses and ruins.' },
  { to: '/explore?focus=rivers', sv: 'Vattenvägar', en: 'Waterways', dsv: 'Floder, handelsvägar och farleder.', den: 'Rivers, trade routes and sea-lanes.' },
  { to: '/explore?focus=eriksgatan', sv: 'Eriksgatan', en: 'Eriksgatan', dsv: 'Kungavalets riksrunda genom landskapen.', den: 'The royal election progress through the provinces.' },
  { to: '/explore?focus=fortresses', sv: 'Fornborgar', en: 'Hillforts', dsv: 'Fornborgar med datering (kol-14, morfologi).', den: 'Hillforts with dating (14C, morphology).' },
  { to: '/sv/ortnamn', sv: 'Ortnamn & hypoteser', en: 'Place names & hypotheses', dsv: 'Bygg egna avstånds-/räckviddstest (Agnetas 9 km).', den: 'Build your own distance/reach tests.' },
  { to: '/sv/historiska-handelser', sv: 'Tidslinje', en: 'Timeline', dsv: 'Händelser, klimat, pest, arter — en tidsaxel.', den: 'Events, climate, plague, species — one timeline.' },
  { to: '/ontologi', sv: 'Ontologi', en: 'Ontology', dsv: 'Kontraktet: entiteter, mätmetoder, dateringar, källor.', den: 'The contract: entities, measures, datings, sources.' },
];

export const BuildViewDialog: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  return (
    <Dialog>
      <DialogTrigger className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-slate-900 font-semibold text-sm hover:bg-amber-400 transition-colors">
        <Compass className="h-4 w-4" /><span className="hidden md:inline">{sv ? 'Bygg din vy' : 'Build your view'}</span>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2"><Layers className="h-5 w-5 text-gold" />{sv ? 'Bygg din vy' : 'Build your view'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {sv ? 'Välj en färdig vy för att komma igång. I Utforska kan du sedan slå på/av lager i legenden och spara din vy.' : 'Pick a ready-made view. In Explore you can then toggle layers and save your view.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {CARDS.map((c) => (
            <Link key={c.to} to={c.to}
              className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-lg transition-colors p-4 flex flex-col">
              <span className="text-white font-semibold text-sm">{sv ? c.sv : c.en}</span>
              <span className="text-slate-400 text-xs mt-1 flex-1">{sv ? c.dsv : c.den}</span>
              <span className="text-gold text-xs mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {sv ? 'Öppna' : 'Open'} <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
