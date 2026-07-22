import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Dna, Church, Waves, Crown, Castle, Tag, CalendarClock, Share2, ArrowRight, Layers } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

// "Bygg din vy" som MODAL: en knapp på förstasidan öppnar en dialog med kort
// (conversation starters). Varje kort öppnar en färdig GIS-vy (focus-preset) eller
// ett analysverktyg. Additivt — rör inte Explore-layouten.
interface ViewCard { to: string; sv: string; en: string; dsv: string; den: string; icon: typeof Compass; color: string }
const CARDS: ViewCard[] = [
  { to: '/explore?focus=inscriptions', sv: 'Runstenar', en: 'Runestones', dsv: 'Alla runinskrifter på kartan.', den: 'All runic inscriptions on the map.', icon: Compass, color: '#ef4444' },
  { to: '/explore?focus=gods', sv: 'Kultplatser', en: 'Cult sites', dsv: 'Förkristna kultplatser per gud (Oden, Tor, Frö…).', den: 'Pre-Christian cult sites by deity.', icon: Sparkles, color: '#fbbf24' },
  { to: '/explore?focus=geneticEvents', sv: 'Genetik & aDNA', en: 'Genetics & aDNA', dsv: 'aDNA-platser, migrationer och djur-DNA i djuptid.', den: 'aDNA sites, migrations and animal DNA in deep time.', icon: Dna, color: '#a855f7' },
  { to: '/explore?focus=churches', sv: 'Kyrkor & stift', en: 'Churches & dioceses', dsv: 'Medeltidskyrkor, stift och ruiner.', den: 'Medieval churches, dioceses and ruins.', icon: Church, color: '#e11d48' },
  { to: '/explore?focus=rivers', sv: 'Vattenvägar', en: 'Waterways', dsv: 'Floder, handelsvägar och farleder.', den: 'Rivers, trade routes and sea-lanes.', icon: Waves, color: '#1e40af' },
  { to: '/explore?focus=eriksgatan', sv: 'Eriksgatan', en: 'Eriksgatan', dsv: 'Kungavalets riksrunda genom landskapen.', den: 'The royal election progress through the provinces.', icon: Crown, color: '#d97706' },
  { to: '/explore?focus=fortresses', sv: 'Fornborgar', en: 'Hillforts', dsv: 'Fornborgar med datering (kol-14, morfologi).', den: 'Hillforts with dating (14C, morphology).', icon: Castle, color: '#dc2626' },
  { to: '/sv/ortnamn', sv: 'Ortnamn & hypoteser', en: 'Place names & hypotheses', dsv: 'Bygg egna avstånds-/räckviddstest (Agnetas 9 km).', den: 'Build your own distance/reach tests.', icon: Tag, color: '#65a30d' },
  { to: '/sv/historiska-handelser', sv: 'Tidslinje', en: 'Timeline', dsv: 'Händelser, klimat, pest, arter — en tidsaxel.', den: 'Events, climate, plague, species — one timeline.', icon: CalendarClock, color: '#0891b2' },
  { to: '/ontologi', sv: 'Ontologi', en: 'Ontology', dsv: 'Kontraktet: entiteter, mätmetoder, dateringar, källor.', den: 'The contract: entities, measures, datings, sources.', icon: Share2, color: '#c084fc' },
];

export const ExploreViewCards: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
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
              {CARDS.map((c) => (
                <Link key={c.to} to={c.to}
                  className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-colors p-4 flex flex-col">
                  <c.icon className="h-6 w-6 mb-2" style={{ color: c.color }} />
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
      </div>
    </section>
  );
};
