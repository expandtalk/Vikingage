import React from 'react';
import { Mountain, Shield, Building2, Crown, Home, Landmark } from 'lucide-react';

// Källförd typologi-ryggrad för /sv/borgar: de svenska befästningarnas kronologiska/funktionella
// kategorier (fornborg → vikingaborg → kastal → riksborg → adelsborg/fast hus → fästning).
// Källor (FAKTA, egen formulering): RAÄ Fornsök-definitioner; M. Hansson, Medeltida borgar (2011);
// Länsstyrelsen Skåne, kulturmiljöprogram "Medeltida borgar och fasta hus"; SAOB/SAOL; Wikipedia (CC BY-SA).
// INGEN GISSNING: klasser vi ännu inte har egen data för märks "under uppbyggnad", inte påhittade.

export interface TypologyCounts {
  fornborg?: number; vikingaborg?: number; kastal?: number;
  riksborg?: number; adelsborg?: number; fastning?: number;
}

interface Cat {
  key: keyof TypologyCounts;
  icon: React.ReactNode;
  sv: { title: string; epoch: string; desc: string; ex: string };
  en: { title: string; epoch: string; desc: string; ex: string };
  href?: string;
}

const CATS: Cat[] = [
  {
    key: 'fornborg', icon: <Mountain className="h-5 w-5" />,
    sv: { title: 'Fornborgar', epoch: 'Förhistorisk tid – tidig medeltid',
      desc: 'Sveriges äldsta befästningar: murar, vallar och palissader kring svårtillgängliga höjder eller uddar. Delas i tillflyktsborgar (skydd i orostid) och farledsborgar (bevakning vid vattenvägar), ofta i system med vårdkasar.',
      ex: 'Ismantorps borg (Öland)' },
    en: { title: 'Hillforts', epoch: 'Prehistory – early Middle Ages',
      desc: "Sweden's oldest fortifications: ramparts and walls around inaccessible heights or headlands. Split into refuge forts and sea-route forts, often part of a beacon system.",
      ex: 'Ismantorp (Öland)' },
    href: '#fornborgar',
  },
  {
    key: 'vikingaborg', icon: <Shield className="h-5 w-5" />,
    sv: { title: 'Vikingatida ringborgar & befästningar', epoch: 'Vikingatid (ca 700–1000-tal)',
      desc: 'Geometriskt anlagda ringborgar (Trelleborgar), longphorts och befästa handelsplatser — militär och administrativ makt vid farleder och centralorter.',
      ex: 'Trelleborg-typen; befästa handelsplatser' },
    en: { title: 'Viking ring fortresses & strongholds', epoch: 'Viking Age (c. 700–1000)',
      desc: 'Geometric ring fortresses (Trelleborg type), longphorts and fortified trading posts — military and administrative power at sea-routes and central places.',
      ex: 'Trelleborg type; fortified trading posts' },
    href: '#vikingaborgar',
  },
  {
    key: 'kastal', icon: <Landmark className="h-5 w-5" />,
    sv: { title: 'Kastaler', epoch: 'Tidig medeltid (1100–1200-tal)',
      desc: 'Fristående, kraftiga stentorn som vakttorn, tillflykt och magasin. Ofta rest av en stormansgård (kopplingen till en intilliggande kyrka är omdiskuterad). Utgjorde ibland kärnan i senare, större borgar.',
      ex: 'Gotländska kyrkkastaler; Svintunakastalen' },
    en: { title: 'Kastals (tower keeps)', epoch: 'Early Middle Ages (12th–13th c.)',
      desc: 'Free-standing stone towers serving as watchtower, refuge and storehouse — often the remnant of a magnate farm, and sometimes the core of a later, larger castle.',
      ex: 'Gotland church kastals; the Svintuna kastal' },
    href: '/sv/plats/svintuna',
  },
  {
    key: 'riksborg', icon: <Crown className="h-5 w-5" />,
    sv: { title: 'Riksborgar', epoch: 'Medeltid (1200-tal och framåt)',
      desc: 'Kungliga/statliga anläggningar med fast besättning och tjänstemän — administrativt centrum i ett slottslän under en av kungen utsedd länsherre/fogde. Byggda för att kontrollera vägar, gränser och skatteuppbörd (ej tillflykt för allmogen).',
      ex: 'Kalmar slott; Näs borg (Visingsö)' },
    en: { title: 'Royal castles (riksborgar)', epoch: 'Middle Ages (13th c. onward)',
      desc: 'Royal/state strongholds with a permanent garrison — the administrative centre of a castle-county under a royally appointed lord/bailiff, built to control routes, borders and taxation.',
      ex: 'Kalmar Castle; Näs (Visingsö)' },
    href: '/sv/medeltidsborgar',
  },
  {
    key: 'adelsborg', icon: <Home className="h-5 w-5" />,
    sv: { title: 'Adelsborgar & fasta hus', epoch: 'Senmedeltid (1400-tal)',
      desc: 'Privata stenhus och herresäten som adeln uppförde för att skydda egendom och markera makt. Rektangulär plan, tjocka murar och vallgravar. "Fasta hus" var ett sätt att kringgå borgbyggarförbudet 1396–1483.',
      ex: 'Glimmingehus; Torpa stenhus' },
    en: { title: 'Noble castles & fortified houses', epoch: 'Late Middle Ages (15th c.)',
      desc: 'Private stone houses and manors raised by the nobility to protect estates and mark power — rectangular plan, thick walls, moats. "Fortified houses" circumvented the 1396–1483 castle ban.',
      ex: 'Glimmingehus; Torpa stone house' },
  },
  {
    key: 'fastning', icon: <Building2 className="h-5 w-5" />,
    sv: { title: 'Senare fästningar', epoch: 'Vasatid & stormaktstid (1500–1600-tal och framåt)',
      desc: 'Betydligt större anläggningar ombyggda för att stå emot artilleri — jordvallar, bastioner och stjärnformade försvarsverk.',
      ex: 'Bohus, Varbergs och Carlstens fästningar' },
    en: { title: 'Later fortresses', epoch: 'Vasa & Great-Power era (16th–17th c. onward)',
      desc: 'Much larger works rebuilt to withstand artillery — earthen ramparts, bastions and star-shaped defences.',
      ex: 'Bohus, Varberg and Carlsten fortresses' },
  },
];

export const FortificationTypology: React.FC<{ sv: boolean; counts?: TypologyCounts }> = ({ sv, counts }) => {
  return (
    <section className="mb-8" aria-label={sv ? 'Befästningstypologi' : 'Fortification typology'}>
      <h2 className="text-xl font-semibold text-foreground mb-1">
        {sv ? 'Befästningstyper genom tiderna' : 'Fortification types through the ages'}
      </h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
        {sv
          ? 'Svenska befästningar delas vanligen i kronologisk-funktionella klasser. Definitionerna glider in i varandra — samma plats kan ha varit borg i en period och slott i en annan.'
          : 'Swedish fortifications are usually grouped into chronological-functional classes. The definitions overlap — one site could be a castle in one period and a palace in another.'}
      </p>
      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATS.map((c, i) => {
          const t = sv ? c.sv : c.en;
          const n = counts?.[c.key];
          const inner = (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gold shrink-0">{c.icon}</span>
                <span className="font-semibold text-foreground text-sm leading-tight">{i + 1}. {t.title}</span>
                {n != null && n > 0
                  ? <span className="ml-auto shrink-0 text-[11px] tabular-nums text-gold/80">{n}</span>
                  : <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground/60">{sv ? 'under uppbyggnad' : 'in progress'}</span>}
              </div>
              <div className="text-[11px] font-medium text-amber-300/80 mb-1">{t.epoch}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1.5">{sv ? 'Exempel:' : 'Example:'} <span className="italic">{t.ex}</span></p>
            </>
          );
          const cls = 'block rounded-lg border border-border bg-card/40 p-3 h-full';
          return (
            <li key={c.key}>
              {c.href
                ? <a href={c.href} className={`${cls} hover:border-gold/50 transition-colors`}>{inner}</a>
                : <div className={cls}>{inner}</div>}
            </li>
          );
        })}
      </ol>
      <p className="text-[11px] text-muted-foreground/60 mt-3 max-w-3xl">
        {sv
          ? 'Källor: RAÄ Fornsök; M. Hansson, Medeltida borgar (2011); Länsstyrelsen Skåne (kulturmiljöprogram); SAOB. Klasser märkta "under uppbyggnad" saknar ännu egen kurerad data hos oss.'
          : 'Sources: RAÄ Fornsök; M. Hansson, Medieval Castles (2011); County Board of Skåne; SAOB. Classes marked "in progress" lack curated data here so far.'}
      </p>
    </section>
  );
};

export default FortificationTypology;
