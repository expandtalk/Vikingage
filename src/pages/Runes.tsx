import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRunicCorpusStats } from '@/hooks/useRunicCorpusStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, ScrollText, Users, ChevronRight } from 'lucide-react';
import { YOUNGER, ELDER } from '@/data/futhark';
import { RuneWriter } from '@/components/runes/RuneWriter';

// /sv/runor + /en/runes — kunskapshubb om runor & futharken, byggd på HELA runstenskorpusen
// (count_runestones() = sanningskälla via runic_atlas_stats). Evergreen-innehåll (futhark, hur
// man läser, FAQ) är STATISKT i komponenten så det kan indexeras; korpus-siffrorna hämtas live.
// Hederlighet: rundikts-tolkningar och urnordiska namn är rekonstruktioner/omdiskuterade →
// märks som sådana. Källor anges nederst. Deep-links går till riktiga inskrifter i korpusen.

// Futhark-tabellerna (YOUNGER/ELDER) flyttade till @/data/futhark — delad sanningskälla
// för både runsidans tabeller och skrivverktyget (RuneWriter).

// Utvalda runstenar ur korpusen — deep-link till /inscription/:signum. Belagda enrads-fakta.
const FEATURED: { signum: string; name: string; sv: string; en: string }[] = [
  { signum: 'Ög 136', name: 'Rökstenen', sv: 'Världens längsta kända runinskrift, tidigt 800-tal.', en: "The world's longest known runic inscription, early 9th century." },
  { signum: 'Sö 101', name: 'Sigurdsristningen', sv: 'Ramsundsristningen — bildberättelsen om Sigurd Fafnesbane, 1000-tal.', en: 'The Ramsund carving — the tale of Sigurd the dragon-slayer, 11th century.' },
  { signum: 'Sö 179', name: 'Gripsholmsstenen', sv: 'Rest till minne av Ingvar den vittfarnes olyckliga österledsfärd.', en: "In memory of Ingvar the Far-travelled's ill-fated expedition east." },
  { signum: 'U 344', name: 'Yttergärdestenen', sv: 'Ulf i Borresta tog tre danagälder i England.', en: 'Ulf of Borresta took three Danegelds in England.' },
  { signum: 'U 112', name: 'Flyttblocket i Ed', sv: 'Ragnvald, hövding över ett väringalag i Grekland (Miklagård).', en: 'Ragnvald, captain of a Varangian retinue in Greece (Constantinople).' },
  { signum: 'Vg 119', name: 'Sparlösastenen', sv: 'En av de mest innehållsrika och omdiskuterade, 800-tal.', en: 'One of the richest and most debated inscriptions, 9th century.' },
  { signum: 'DR 42', name: 'Jellingestenarna', sv: "Harald Blåtands sten i Jelling — 'gjorde danerna kristna'.", en: "Harald Bluetooth's stone at Jelling — 'made the Danes Christian'." },
  { signum: 'Öl 28', name: 'Gårdbystenen', sv: 'Öländsk vikingatida runsten.', en: 'A Viking-age runestone on Öland.' },
];

const Runes: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const L = (sv: string, e: string) => (en ? e : sv);
  const { data: stats } = useRunicCorpusStats();

  const faqs: { q: string; a: string }[] = en
    ? [
        { q: 'What are runes?', a: 'Runes are the letters of the futhark, the alphabet used by Germanic and Nordic peoples from roughly 150 CE into the Middle Ages. They were carved into stone, wood, bone and metal, and are named futhark after their first six characters: f, u, þ, a, r, k.' },
        { q: 'What is the difference between the Elder and Younger Futhark?', a: 'The Elder Futhark has 24 runes and was used c. 150–800 CE. The Younger Futhark, used across the Viking Age (c. 800–1100), was reduced to 16 runes — so each rune often stands for several sounds. Nearly all Viking-age runestones use the Younger Futhark.' },
        { q: 'Is the futhark an alphabet?', a: 'Yes — it is a phonetic writing system where each rune represents a sound, ordered in its own sequence (f-u-þ-a-r-k…) rather than a-b-c. The Younger Futhark has 16 runes; later medieval runes added dots to mark more sounds.' },
        { q: 'How many runestones are there?', a: 'Sweden alone has the largest concentration in the world, most of them in Uppland and Södermanland. This site maps the Scandinavian corpus of close to 3,000 runestones and around 8,000 runic inscriptions in total.' },
        { q: 'What do the runes mean?', a: 'Each rune had a name (e.g. fé "wealth", úr, þurs "giant", týr the god) known from later rune poems. Those name-meanings are traditional and sometimes debated; on runestones the runes are used simply as letters to spell words.' },
        { q: 'Can I write my name in runes?', a: 'You transliterate the sounds of the name into Younger Futhark runes, not letter-by-letter — the 16-rune futhark had no separate signs for many sounds, so k also served g, t also d, and so on. There is no single "correct" spelling; it depends on the sounds.' },
      ]
    : [
        { q: 'Vad är runor?', a: 'Runor är tecknen i futharken, det alfabet som germanska och nordiska folk använde från omkring 150 e.Kr. in i medeltiden. De ristades i sten, trä, ben och metall, och kallas futhark efter sina sex första tecken: f, u, þ, a, r, k.' },
        { q: 'Vad är skillnaden mellan äldre och yngre futharken?', a: 'Äldre futharken har 24 runor och användes ca 150–800 e.Kr. Yngre futharken, som användes under hela vikingatiden (ca 800–1100), reducerades till 16 runor — så en runa står ofta för flera ljud. Nästan alla vikingatida runstenar använder den yngre futharken.' },
        { q: 'Är futharken ett alfabet?', a: 'Ja — det är ett fonetiskt skriftsystem där varje runa står för ett ljud, ordnat i egen följd (f-u-þ-a-r-k…) i stället för a-b-c. Yngre futharken har 16 runor; senare medeltida runor lade till punkter (stungna runor) för att skilja fler ljud.' },
        { q: 'Hur många runstenar finns det?', a: 'Sverige har världens största koncentration, flest i Uppland och Södermanland. Den här sajten kartlägger den skandinaviska korpusen på närmare 3 000 runstenar och omkring 8 000 runinskrifter totalt.' },
        { q: 'Vad betyder runorna?', a: 'Varje runa hade ett namn (t.ex. fé "rikedom", úr, þurs "jätte", týr guden) som vi känner från senare runramsor/rundikter. De namnbetydelserna är traderade och ibland omtvistade; på runstenar används runorna helt enkelt som bokstäver för att stava ord.' },
        { q: 'Kan man skriva sitt namn med runor?', a: 'Man translittererar namnets ljud till runor i yngre futharken, inte bokstav för bokstav — de 16 runorna saknade egna tecken för många ljud, så k fick även stå för g, t för d osv. Det finns ingen enda "rätt" stavning; det beror på ljuden.' },
      ];

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  const insLink = (signum: string) => `/inscription/${encodeURIComponent(signum)}`;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Runor och futharken — vikingatidens skrift"
        titleEn="Runes and the futhark — the writing of the Viking Age"
        description="Vad är runor? Yngre och äldre futharken, hur man läser en runsten, och hela den skandinaviska runstenskorpusen — närmare 3 000 runstenar och omkring 8 000 inskrifter på karta."
        descriptionEn="What are runes? The Younger and Elder Futhark, how to read a runestone, and the full Scandinavian runestone corpus — close to 3,000 runestones and around 8,000 inscriptions on a map."
        keywords="runor, runes, viking runes, futhark, yngre futharken, äldre futharken, elder futhark, younger futhark, runalfabet, runic alphabet, rune alphabet, norse runes, runstenar, runinskrifter, hur man läser runor, vad betyder runorna"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>
      <Header />
      <Breadcrumbs />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          {L('Runor och futharken', 'Runes and the futhark')}
        </h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          {L(
            'Runorna är vikingatidens skrift — tecknen i futharken. Här förklaras vad runor är, de två futharkarna och hur man läser en runsten, kopplat till hela den skandinaviska runstenskorpusen på kartan.',
            'Runes are the writing of the Viking Age — the characters of the futhark. This page explains what runes are, the two futharks, and how to read a runestone, linked to the full Scandinavian runestone corpus on the map.',
          )}
        </p>

        {/* Skrivverktyg — translitterera latin → runor, PNG/SVG-export */}
        <RuneWriter />

        {/* Vad är runor */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gold mb-3">{L('Vad är runor?', 'What are runes?')}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {L(
              'Runor är bokstäverna i futharken, det alfabet som germanska och nordiska folk använde från omkring 150 e.Kr. in i medeltiden. Namnet futhark kommer av de sex första tecknen: f, u, þ, a, r, k. Runorna ristades i sten, trä, ben och metall — de raka, kantiga formerna passade att skära i hårt material.',
              'Runes are the letters of the futhark, the alphabet used by Germanic and Nordic peoples from around 150 CE into the Middle Ages. The word futhark comes from its first six characters: f, u, þ, a, r, k. Runes were carved into stone, wood, bone and metal — their straight, angular shapes suited cutting into hard materials.',
            )}
          </p>
        </section>

        {/* Yngre futharken */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gold mb-1">{L('Yngre futharken (vikingatiden)', 'The Younger Futhark (Viking Age)')}</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {L(
              '16 tecken, använd ca 800–1100. Eftersom runorna är färre än ljuden står en runa ofta för flera ljud (k även för g, t även för d). Det är den här futharken nästan alla runstenar på sajten bär.',
              '16 characters, used c. 800–1100. Because there are fewer runes than sounds, one rune often stands for several sounds (k also for g, t also for d). This is the futhark used by almost every runestone on this site.',
            )}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {YOUNGER.map((x) => (
              <div key={x.name} className="rounded-lg border border-border bg-card/60 p-3 text-center">
                <div className="text-4xl leading-none text-foreground mb-1" aria-hidden="true">{x.r}</div>
                <div className="text-sm font-semibold text-gold">{x.t}</div>
                <div className="text-[11px] text-muted-foreground italic">{x.name}</div>
                <div className="text-[11px] text-muted-foreground">{L(x.sv, x.en)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Äldre futharken */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gold mb-1">{L('Äldre futharken', 'The Elder Futhark')}</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {L(
              '24 tecken, använd ca 150–800 e.Kr. — före vikingatiden. Namnen nedan är urnordiska rekonstruktioner. Vid övergången till vikingatid förenklades systemet till den yngre futharkens 16 runor.',
              '24 characters, used c. 150–800 CE — before the Viking Age. The names below are Proto-Norse reconstructions. At the start of the Viking Age the system was simplified to the 16 runes of the Younger Futhark.',
            )}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ELDER.map((x) => (
              <div key={x.name} className="rounded-lg border border-border bg-card/60 p-2 text-center">
                <div className="text-3xl leading-none text-foreground" aria-hidden="true">{x.r}</div>
                <div className="text-xs font-semibold text-gold">{x.t}</div>
                <div className="text-[10px] text-muted-foreground italic truncate">{x.name}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/80 mt-3 leading-relaxed">
            {L(
              'Vid sidan av dessa finns kortkvistrunor (en enklare variant av yngre futharken) och medeltida stungna runor, där punkter lades till för att skilja fler ljud (t.ex. g från k, e från i).',
              'Alongside these are the short-twig runes (a simpler variant of the Younger Futhark) and medieval dotted runes, where dots were added to distinguish more sounds (e.g. g from k, e from i).',
            )}
          </p>
        </section>

        {/* Hur man läser en runsten */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gold mb-3">{L('Hur man läser en runsten', 'How to read a runestone')}</h2>
          <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed list-disc pl-5">
            <li>{L('Texten löper oftast i ett "rundjur" — ett slingrande band som avslutas med ett djurhuvud. Följ bandet från huvudet.', 'The text usually runs inside a "rune animal" — a winding band ending in a beast\'s head. Follow the band from the head.')}</li>
            <li>{L('De flesta stenar bär en minnesformel: "N reste denna sten efter M, sin fader/broder…". De restes till minne av döda, inte som gravstenar.', 'Most stones carry a memorial formula: "N raised this stone in memory of M, his father/brother…". They commemorate the dead rather than marking graves.')}</li>
            <li>{L('Många vikingatida stenar bär ett kristet kors — de restes under kristnandet, ofta invid vägar och broar.', 'Many Viking-age stones bear a Christian cross — they were raised during the conversion, often beside roads and bridges.')}</li>
            <li>{L('En del signerades av sin ristare (t.ex. Öpir, Balle, Åsmund). Ristare kan spåras mellan stenar.', 'Some are signed by their carver (e.g. Öpir, Balle, Ásmundr). Carvers can be traced from stone to stone.')}</li>
            <li>{L('Runologer återger runorna med fetstil gemener (translitteration) innan de tolkas till fornnordiska och översätts.', 'Runologists render the runes in bold lowercase (transliteration) before interpreting them into Old Norse and translating.')}</li>
          </ul>
        </section>

        {/* Korpusen */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gold mb-3">{L('Runstenskorpusen på kartan', 'The runestone corpus on the map')}</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {L(
              'Sajten kartlägger den skandinaviska korpusen — närmare 3 000 runstenar och omkring 8 000 runinskrifter totalt, nästan alla med koordinat. Flest finns i Uppland och Södermanland.',
              'The site maps the Scandinavian corpus — close to 3,000 runestones and around 8,000 runic inscriptions in total, nearly all with coordinates. Most are found in Uppland and Södermanland.',
            )}
          </p>

          {stats && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg border border-border bg-card/60 p-3 text-center">
                <div className="text-2xl font-bold text-gold tabular-nums">{stats.runestones.toLocaleString('sv-SE')}</div>
                <div className="text-[11px] text-muted-foreground">{L('runstenar', 'runestones')}</div>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-3 text-center">
                <div className="text-2xl font-bold text-gold tabular-nums">{stats.inscriptions.toLocaleString('sv-SE')}</div>
                <div className="text-[11px] text-muted-foreground">{L('runinskrifter', 'inscriptions')}</div>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-3 text-center">
                <div className="text-2xl font-bold text-gold tabular-nums">{stats.with_coords.toLocaleString('sv-SE')}</div>
                <div className="text-[11px] text-muted-foreground">{L('på kartan', 'mapped')}</div>
              </div>
            </div>
          )}

          {stats?.by_landscape && (
            <div className="mb-5">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{L('Runstenar per landskap', 'Runestones by province')}</h3>
              <div className="space-y-1">
                {stats.by_landscape.filter((x) => x.landscape !== 'okänt').slice(0, 8).map((x) => {
                  const max = Math.max(...stats.by_landscape.filter((y) => y.landscape !== 'okänt').map((y) => y.c));
                  return (
                    <div key={x.landscape} className="flex items-center gap-2 text-xs">
                      <span className="w-28 shrink-0 text-muted-foreground truncate">{x.landscape}</span>
                      <div className="flex-1 h-3 rounded bg-slate-800 overflow-hidden">
                        <div className="h-full bg-gold/70" style={{ width: `${Math.round((x.c / max) * 100)}%` }} />
                      </div>
                      <span className="w-12 text-right tabular-nums text-muted-foreground">{x.c}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link to="/explore" className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold hover:bg-gold/20">
              <Map className="h-4 w-4" /> {L('Utforska på kartan', 'Explore on the map')} <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to={en ? '/carvers' : '/sv/ristare'} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-card">
              <Users className="h-4 w-4" /> {L('Runristare', 'Rune carvers')}
            </Link>
            <Link to={en ? '/inscriptions' : '/sv/runinskrifter'} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-card">
              <ScrollText className="h-4 w-4" /> {L('Alla inskrifter', 'All inscriptions')}
            </Link>
          </div>
        </section>

        {/* Utvalda runstenar */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gold mb-3">{L('Utvalda runstenar', 'Notable runestones')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURED.map((f) => (
              <Card key={f.signum} className="viking-card">
                <CardHeader className="pb-1">
                  <CardTitle className="text-base text-gold">
                    <Link to={insLink(f.signum)} className="hover:underline">{f.name}</Link>
                    <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">{f.signum}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="text-xs leading-relaxed">{L(f.sv, f.en)}</p>
                  <Link to={insLink(f.signum)} className="mt-1 inline-block text-xs text-gold hover:underline">{L('Läs inskriften →', 'Read the inscription →')}</Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gold mb-3">{L('Vanliga frågor', 'Frequently asked questions')}</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-muted-foreground/80 border-t border-border/60 pt-4 leading-relaxed">
          {L('Källor: Samnordisk runtextdatabas (Rundata), Sveriges runinskrifter (KVHAA/RAÄ), Enoksen, Runor (1998), Barnes, Runes: A Handbook (2012). Rundikts-tolkningar och urnordiska namn är rekonstruktioner och ibland omtvistade — de redovisas som sådana.',
            'Sources: Scandinavian Runic-text Database (Rundata), Sveriges runinskrifter (KVHAA/RAÄ), Enoksen, Runor (1998), Barnes, Runes: A Handbook (2012). Rune-poem meanings and Proto-Norse names are reconstructions and sometimes debated — presented as such.')}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Runes;
