import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Coins, Ship, Church, Scale, Anchor, MapPin, ScrollText, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Sveriges tidiga ekonomiska historia — läsbar syntes av maktgeografi-arbetet.
// Front-dörr till bryte-temat, Maktsäten-lagret och lagarna i /texter. Ren prosasida,
// ingen egen datahämtning. Källkritiskt skiktad (koncept ~839 / distrikt 1065 / lag 1290).

interface Era {
  year: string;
  sv: string;
  en: string;
  icon: React.ElementType;
}

const TIMELINE: Era[] = [
  { year: '~750', icon: Anchor, sv: 'Birka grundas i Mälaren. Seglet når Norden (skeppsfynd, gotländska bildstenar) — roddflottorna får segel.', en: 'Birka founded in Lake Mälaren. The sail reaches Scandinavia (ship finds, Gotland picture stones) — the rowing fleets gain sails.' },
  { year: '~839', icon: Ship, sv: 'Rhos-sändebuden i Annales Bertiniani — tidigaste belägget för "roddarfolket" (róðr → Ruotsi → Rus), roten till Roden och ledungen.', en: 'The Rhos envoys in the Annals of St Bertin — earliest trace of "the rowing people" (róðr → Ruotsi → Rus), the root of Roden and the naval levy.' },
  { year: '~1041', icon: Ship, sv: 'Ingvarståget — en enorm flotta i Österled, dokumenterad på ett trettiotal runstenar. Ledungens mobiliseringskraft.', en: 'The Ingvar expedition — a huge fleet eastward, recorded on some thirty runestones. The mobilising power of the levy.' },
  { year: '~1065', icon: MapPin, sv: 'Hovgårdsstenen (U 11) på Adelsö: "Tolir bryti i roþ" — kungens fogde i Roden. Tidigaste inhemska belägget för roþ som skattedistrikt.', en: 'The Hovgården stone (U 11) on Adelsö: "Tólir the steward in roþ" — the king\'s bailiff in Roden. Earliest domestic evidence of roþ as a fiscal district.' },
  { year: '~1250', icon: Coins, sv: 'Mynt och stadsskatt växer (Sigtuna, Lödöse, Stockholm). Kyrkans tionde etableras socken för socken.', en: 'Coinage and urban taxation grow (Sigtuna, Lödöse, Stockholm). The Church\'s tithe is established parish by parish.' },
  { year: '1280', icon: Scale, sv: 'Alsnö stadga (Magnus Ladulås), utfärdad i Alsnö hus på Adelsö — samma kungssäte som U 11. Grundar frälset: skattefrihet mot rusttjänst. Sjöburen ledung börjar bli landburen frälseadel.', en: 'The Alsnö Statute (Magnus Ladulås), issued at Alsnö on Adelsö — the same royal seat as U 11. It founds the frälse: tax exemption for cavalry service. The sea-borne levy starts becoming a land-based nobility.' },
  { year: '~1290', icon: ScrollText, sv: 'Östgötalagen kodifierar tre-bo-ordningen: konungs bryti i Uppsala bo, jarls bryti i Rodz bo, biskops bryti i staf ok stols bo — krona, ledung och kyrka sida vid sida.', en: 'The Law of Östergötland codifies the threefold order: king\'s steward in Uppsala bo, jarl\'s in Rodz bo, bishop\'s in staff-and-see estate — crown, levy and Church side by side.' },
  { year: '~1350', icon: ScrollText, sv: 'Magnus Erikssons landslag ersätter landskapslagarna. Ledungen har blivit en permanent skatt (ledungslame).', en: 'Magnus Eriksson\'s national law replaces the provincial laws. The levy has become a permanent tax (ledungslame).' },
  { year: '1397', icon: Church, sv: 'Kalmarunionen — en praktisk mötesplats, inte ett maktcentrum. Den ekonomiska tyngdpunkten låg kvar i Mälardalen, stödd österut av Finland och Åland.', en: 'The Kalmar Union — a practical meeting place, not a centre of power. The economic centre of gravity remained in the Mälaren region, supported eastward by Finland and Åland.' },
];

const EconomicHistory = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const Section: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-gold" />{title}
      </h2>
      <div className="space-y-3 text-slate-300 leading-relaxed">{children}</div>
    </section>
  );

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Sveriges ekonomiska historia — det första skattesystemet"
        titleEn="Sweden's economic history — the first tax system"
        description="Hur Sveriges första skattesystem växte fram: den sjöburna ledungen (roþ/Roden), bryteorganisationen och kyrkans tionde — från roddarfolket ~839 till Kalmarunionen 1397."
        descriptionEn="How Sweden's first tax system emerged: the sea-borne levy (roþ/Roden), the steward organisation and the Church's tithe — from the rowing people c. 839 to the Kalmar Union of 1397."
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
            <Coins className="h-8 w-8 text-gold" />
            {sv ? 'Sveriges ekonomiska historia' : "Sweden's economic history"}
          </h1>
          <p className="text-lg text-slate-300">
            {sv
              ? 'Hur det första skattesystemet växte fram — och konkurrerade med ett andra.'
              : 'How the first tax system emerged — and competed with a second.'}
          </p>
        </div>

        <Section icon={Scale} title={sv ? 'Två konkurrerande skattesystem' : 'Two competing fiscal systems'}>
          <p>
            {sv
              ? 'Sveriges tidiga ekonomiska historia kan läsas som en konkurrens mellan två sätt att dra in resurser till makten. Det äldre var sjöbaserat: ledungen, en flott- och krigstjänst organiserad kustvis i roddardistrikt. Det yngre var landbaserat: kyrkans tionde och kronans jordskatt, organiserat socken för socken. Maktgeografin på den här plattformen visar skiftet — hur tyngdpunkten vandrar från roddarkusten till jordägandet.'
              : 'Sweden\'s early economic history reads as a competition between two ways of extracting resources for power. The older was sea-based: the ledung, a fleet and military levy organised along the coast in rowing districts. The younger was land-based: the Church\'s tithe and the crown\'s land tax, organised parish by parish. The power geography on this platform shows the shift — how the centre of gravity moves from the rowing coast to landholding.'}
          </p>
        </Section>

        <Section icon={Ship} title={sv ? 'Det första skattesystemet: ledungen och roþ' : 'The first tax system: the levy and roþ'}>
          <p>
            {sv
              ? 'Det tidigaste skattesystemet vi kan spåra är ledungen — en skyldighet att ställa upp med skepp, manskap och proviant. Det organiserades i roddarenheter: varje distrikt bemannade en roddbänk (hamna) på ett skepp. Ordet för kustdistriktet var roþ — samma rot som gav Roden, Roslagen och, via finskans Ruotsi, namnet Rus.'
              : 'The earliest tax system we can trace is the ledung — an obligation to provide a ship, crew and provisions. It was organised in rowing units: each district manned a rowing bench (hamna) on a ship. The word for the coastal district was roþ — the same root that gave Roden, Roslagen and, via Finnish Ruotsi, the name Rus.'}
          </p>
          <p>
            {sv
              ? 'Beläggen bildar en kedja bakåt i tiden — men med olika styrka. Roddarfolket är namngivet redan ~839 (Rhos-sändebuden i den frankiska Annales Bertiniani, en samtida källa). Roþ som formaliserat skattedistrikt möter oss först på Hovgårdsstenen (U 11, ~1065): "Tolir bryti i roþ", kungens fogde i Roden. Och hela ordningen kodifieras först i landskapslagarna på 1200-talet.'
              : 'The evidence forms a chain back in time — but of differing strength. The rowing people are named already c. 839 (the Rhos envoys in the Frankish Annals of St Bertin, a contemporary source). Roþ as a formalised fiscal district first meets us on the Hovgården stone (U 11, c. 1065): "Tólir the steward in roþ", the king\'s bailiff in Roden. And the whole order is only codified in the provincial laws of the 13th century.'}
          </p>
        </Section>

        <Section icon={MapPin} title={sv ? 'Förvaltarna: bryte, landdrótt, landhirðir' : 'The stewards: bryti, landdrótt, landhirðir'}>
          <p>
            {sv
              ? 'Systemet sköttes av förvaltare som styrde gods åt en frånvarande ägare — kung, jarl, storman eller biskop. Fem runstenar vittnar om institutionen på 1000-talet (U 11, Sö 42, DR 40, DR 107, DR 134). Titeln varierar regionalt — bryti, landdrótt, landhirðir — men funktionen är identisk. En gemensam förvaltningsordning med lokala namn, precis som ledung/leding/leiðangr.'
              : 'The system was run by stewards managing estates for an absent owner — king, jarl, magnate or bishop. Five runestones attest the institution in the 11th century (U 11, Sö 42, DR 40, DR 107, DR 134). The title varies regionally — bryti, landdrótt, landhirðir — but the function is identical. A common administration with local names, just like ledung/leding/leiðangr.'}
          </p>
          <p>
            <Link to="/tema/bryte-forvaltningsorganisation" className="text-gold hover:underline">
              {sv ? '→ Utforska temat "Bryte och förvaltningsorganisation"' : '→ Explore the theme "The bryti and estate administration"'}
            </Link>
          </p>
        </Section>

        <Section icon={Church} title={sv ? 'Det andra systemet: tionde och Uppsala öd' : 'The second system: tithe and the crown demesne'}>
          <p>
            {sv
              ? 'Östgötalagen (~1290) beskriver en tredelad ordning som fångar hela konkurrensen: konungs bryti i Uppsala bo (kronans oförytterliga gods), jarls bryti i Rodz bo (Roden — ledungsledet) och biskops bryti i staf ok stols bo (biskopsbordet — tiondet). Tre skattebaser, tre förvaltare, samma titel. Krona, ledung och kyrka sida vid sida.'
              : 'The Law of Östergötland (c. 1290) describes a threefold order that captures the whole competition: the king\'s steward in Uppsala bo (the crown\'s inalienable estate), the jarl\'s in Rodz bo (Roden — the levy arm) and the bishop\'s in staff-and-see estate (the episcopal mensa — the tithe). Three tax bases, three stewards, the same title. Crown, levy and Church side by side.'}
          </p>
        </Section>

        <Section icon={Scale} title={sv ? 'Vändpunkten: Alsnö stadga 1280' : 'The turning point: the Alsnö Statute, 1280'}>
          <p>
            {sv
              ? 'Alsnö stadga grundade frälset: skattefrihet mot rusttjänst (beriden krigstjänst). Det är ögonblicket då den sjöburna ledungsskatten börjar konverteras till en landburen, riddarburen frälseadel. Och den utfärdades i Alsnö hus på Adelsö — samma kungssäte där Hovgårdsstenen restes 215 år tidigare. Platsen binder ihop hela berättelsen: från ledungens fogde till frälsets grundande, på samma strand vid Mälaren.'
              : 'The Alsnö Statute founded the frälse: tax exemption in return for cavalry service. It is the moment the sea-borne levy begins converting into a land-based, knightly nobility. And it was issued at Alsnö on Adelsö — the same royal seat where the Hovgården stone was raised 215 years earlier. The place ties the whole story together: from the levy\'s bailiff to the founding of the nobility, on the same shore of Lake Mälaren.'}
          </p>
        </Section>

        <Section icon={Anchor} title={sv ? 'Tidslinje' : 'Timeline'}>
          <ol className="relative border-l border-slate-700 ml-2 space-y-5">
            {TIMELINE.map((e) => {
              const Icon = e.icon;
              return (
                <li key={e.year} className="ml-5">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 border border-slate-600">
                    <Icon className="h-3.5 w-3.5 text-gold" />
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-gold font-semibold text-sm">{e.year}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-0.5">{sv ? e.sv : e.en}</p>
                </li>
              );
            })}
          </ol>
        </Section>

        <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 p-4 mb-10">
          <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-1.5">
            <AlertTriangle className="h-4 w-4" />{sv ? 'Källkritik' : 'Source criticism'}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {sv
              ? 'Institutionen är sannolikt äldre än beläggen — folkvandringstida stormannagods (Uppåkra, Gudme, Helgö) hade självklart förvaltare. Men titlarna och skatteapparaten är dokumenterade först från ~1000, och lagarna nedtecknades på 1200-talet — de är de yngsta vittnena, inte de äldsta. Den försvarbara kontinuiteten är förankrad i platsen (Adelsö/Hovgården) och i roddarfolkets namn (~839), inte i en obelagd linje bakåt till 400-talet.'
              : 'The institution is probably older than the evidence — Migration-period magnate estates (Uppåkra, Gudme, Helgö) obviously had stewards. But the titles and the fiscal apparatus are documented only from c. 1000, and the laws were written down in the 13th century — they are the youngest witnesses, not the oldest. The defensible continuity is anchored in a place (Adelsö/Hovgården) and in the name of the rowing people (c. 839), not in an unproven line back to the 5th century.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/explore" className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
            <MapPin className="h-4 w-4 text-gold" />{sv ? 'Kartan (slå på "Maktsäten" i teckenförklaringen)' : 'The map (enable "Seats of power" in the legend)'}
          </Link>
          <Link to="/texter" className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
            <ScrollText className="h-4 w-4 text-gold" />{sv ? 'Lagarna i fulltext' : 'The laws in full text'}
          </Link>
          <Link to="/tema/bryte-forvaltningsorganisation" className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
            <Coins className="h-4 w-4 text-gold" />{sv ? 'Bryte-temat' : 'The steward theme'}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EconomicHistory;
