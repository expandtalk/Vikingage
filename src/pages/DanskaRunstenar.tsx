import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, BookOpen, Info, ExternalLink, Landmark } from 'lucide-react';

// /sv/danska-runstenar + /en/danish-runestones — kunskapshubb om den danska runtraditionen,
// byggd på DR/DK-materialet i vår corpus (~1075 inskrifter, ~1002 med koordinat). DR-korpuset
// (Jacobsen & Moltke 1941–42) omfattar även Skåne, Halland, Blekinge + tidigare danska områden.
// Hederlighet: featurade stenar beskrivs på BELAGDA fakta; signum-referensen är fakta (CC-BY-SA).
// Deep-länk /inscription/:signum. Källor nederst (Danmarks Runeindskrifter, runer.ku.dk).

interface Sig { p: string; sv: string; en: string }
const SIGNA: Sig[] = [
  { p: 'DR', sv: 'Danmarks Runeindskrifter (Jacobsen & Moltke 1942) — huvudnumreringen.', en: 'Danmarks Runeindskrifter (Jacobsen & Moltke 1942) — the main numbering.' },
  { p: 'DK', sv: 'Nyare regional beteckning (databasen Danske Runeindskrifter): DKBh Bornholm, DKSj Själland, DKFyn Fyn, DKMJy/DKNJy/DKSJy Jylland, DKSk Skåne, DKSl Slesvig, DKSyd Lolland.', en: 'Newer regional signum (Danske Runeindskrifter database): DKBh Bornholm, DKSj Zealand, DKFyn Funen, DKMJy/DKNJy/DKSJy Jutland, DKSk Skåne, DKSl Schleswig, DKSyd Lolland.' },
  { p: 'IK', sv: 'Ikonographischer Katalog — guldbrakteater (folkvandringstid).', en: 'Ikonographischer Katalog — gold bracteates (Migration Period).' },
  { p: 'BR / M', sv: 'BR = brakteat; M = mynt (runmynt).', en: 'BR = bracteate; M = coin (runic coinage).' },
  { p: 'Schl', sv: 'Schleswig (Hedeby/Slesvig).', en: 'Schleswig (Hedeby/Slesvig).' },
  { p: 'EM85 · AUD · NOR', sv: 'Publikationsbeteckningar (Erik Moltke 1985; Arkæologiske udgravninger i Danmark; Nytt om runer).', en: 'Publication signa (Erik Moltke 1985; Arkæologiske udgravninger i Danmark; Nytt om runer).' },
];

interface Stone { signum: string; name: string; sv: string; en: string }
const FEATURED: Stone[] = [
  { signum: 'DR 42', name: 'Jellingstenen (Harald Blåtand)',
    sv: 'Haralds stora sten i Jelling — rest efter Gorm och Tyra; Harald "vann sig hela Danmark och Norge och gjorde danerna kristna". Kallas Danmarks dopattest.',
    en: "Harald's great stone at Jelling — in memory of Gorm and Thyra; Harald 'won for himself all Denmark and Norway and made the Danes Christian'. Denmark's baptismal certificate." },
  { signum: 'DR 41', name: 'Jellingstenen (Gorm)',
    sv: 'Den äldre Jellingstenen — kung Gorm efter Tyra, "Danmarks prydnad/bot". Ett av de tidigaste belägg där namnet Danmark nämns.',
    en: "The older Jelling stone — King Gorm in memory of Thyra, 'Denmark's adornment'. Among the earliest attestations of the name Denmark." },
  { signum: 'DR 230', name: 'Tryggevældestenen',
    sv: 'Ragnhild, Ulfs syster, reste stenen och gjorde hög och skeppssättning efter sin man Gunulv — en ovanligt mäktig kvinnlig resare, med förbannelse mot den som skadar minnesmärket.',
    en: 'Ragnhildr, Ulfr’s sister, raised the stone and made a mound and ship-setting in memory of her husband Gunnulfr — an unusually powerful female sponsor, with a curse against anyone damaging the monument.' },
  { signum: 'DR 295', name: 'Hällestadsstenarna',
    sv: 'Ur Hällestad-gruppen i Skåne (medeltida danskt): Eskil reste stenen efter Toke Gormsson, sin hulde herre, "som inte flydde vid Uppsala" — en av Fyrisvalla-kretsens stenar (DR 295–297).',
    en: 'From the Hällestad group in Skåne (medieval Danish territory): Áskell raised the stone in memory of Tóki Gormsson, his faithful lord, who "did not flee at Uppsala" — one of the Fyrisvellir-circle stones (DR 295–297).' },
  { signum: 'DR 1', name: 'Hedebystenen (Skarde)',
    sv: 'Thorulv, Svens hirdman, efter Erik, sin fälle, som föll när "drengiar" belägrade Hedeby — han var styrman (skeppshövding).',
    en: "Þórulfr, Sveinn’s retainer, in memory of Eiríkr, his partner, who died when warriors besieged Hedeby — he was a ship's captain." },
  { signum: 'DR 2', name: 'Sigtrygg-stenarna (Hedeby)',
    sv: 'Asfrid, Odinkars dotter, efter kung Sigtrygg, hennes och Gnupas son — vittnar om en kungaätt vid Hedeby ca 900.',
    en: 'Ásfríðr, Óðinkárr’s daughter, in memory of King Sigtryggr, her son and Gnúpa’s — attesting a royal line at Hedeby c. 900.' },
  { signum: 'DR 209', name: 'Glavendrupstenen',
    sv: 'Danmarks längsta runinskrift (Fyn). Ragnhild reste stenen efter sin man Alle och sönerna gjorde monumentet. Avslutas med en Tor-vigning ("Thor vige dessa runor") och en förbannelse mot den som fördärvar stenen.',
    en: "Denmark's longest runic inscription (Funen). Ragnhildr raised the stone in memory of her husband Alli; the sons made the monument. It ends with a Thor-consecration ('May Thor hallow these runes') and a curse against whoever damages the stone." },
  { signum: 'DR 239', name: 'Gørlevstenen',
    sv: 'Sjælland, tidig vikingatid. Þjóðví reste stenen efter Oðinkárr. Bär hela futharken och den magiska þistil-formeln samt "njut väl kumlet" — en av de äldsta danska stenarna med runradens fullständiga alfabet.',
    en: 'Zealand, early Viking Age. Þjóðví raised the stone in memory of Óðinkárr. It carries the full futhark and the magical þistill formula plus "make good use of the monument" — one of the oldest Danish stones with the complete runic alphabet.' },
  { signum: 'DR 248', name: 'Snoldelevstenen',
    sv: 'Sjælland (ca 800). Gunnvalds sten, Roalds son, "þul på Salhøje" — ett tidigt belägg för titeln þul (kultisk talare). Pryds av en triskele av dryckeshorn och ett solhjul.',
    en: "Zealand (c. 800). Gunnvaldr's stone, son of Hróaldr, 'þulr at Salhaugar' — an early attestation of the title þulr (cultic orator). Decorated with a triskele of drinking horns and a sun-wheel." },
];

const DanskaRunstenar: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const L = (sv: string, e: string) => (en ? e : sv);
  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Danska runstenar — Danmarks runeindskrifter"
        titleEn="Danish runestones — Danmarks runeindskrifter"
        description="Den danska runtraditionen: Jellingstenarna, Tryggevælde, Hällestad och Hedeby, plus signum-systemen (DR, DK, IK). Byggd på DR/DK-materialet i den skandinaviska runstenskorpusen — inklusive Skåne, Halland och Blekinge. Källkritik och kartlänk."
        descriptionEn="The Danish runic tradition: the Jelling stones, Tryggevælde, Hällestad and Hedeby, plus the signum systems (DR, DK, IK). Built on the DR/DK material in the Scandinavian runestone corpus — including Skåne, Halland and Blekinge."
        keywords="danska runstenar, Danmarks runeindskrifter, Jellingstenen, Harald Blåtand, Tryggevælde, Hällestad, Hedeby, DR, runinskrifter Danmark, Danish runestones"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
          <Landmark className="h-8 w-8 text-gold" />
          {L('Danska runstenar', 'Danish runestones')}
        </h1>
        <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
          {L(
            'Den danska runtraditionen är samlad i korpusverket Danmarks Runeindskrifter (Jacobsen & Moltke 1941–42) — som även omfattar Skåne, Halland och Blekinge samt tidigare danska områden. På kartan finns nu drygt 1 000 danska runinskrifter.',
            'The Danish runic tradition is gathered in the corpus work Danmarks Runeindskrifter (Jacobsen & Moltke 1941–42) — which also covers Skåne, Halland and Blekinge and former Danish areas. Over 1,000 Danish runic inscriptions are on the map.',
          )}
        </p>

        {/* Stat + kartlänk */}
        <Card className="viking-card mb-8">
          <CardContent className="py-4 flex flex-wrap items-center gap-6">
            <div><div className="text-3xl font-bold text-gold">1075</div><div className="text-xs text-muted-foreground">{L('danska inskrifter (DR/DK) i korpusen', 'Danish inscriptions (DR/DK) in the corpus')}</div></div>
            <div><div className="text-3xl font-bold text-gold">1002</div><div className="text-xs text-muted-foreground">{L('med koordinat på kartan', 'located on the map')}</div></div>
            <Link to="/explore?center=56.0,10.5&zoom=7" className="ml-auto inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">
              <Map className="h-4 w-4" /> {L('Visa på kartan', 'Show on the map')}
            </Link>
          </CardContent>
        </Card>

        {/* Signum-referens */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gold mb-1 flex items-center gap-2"><BookOpen className="h-5 w-5" /> {L('Signum — så läser du beteckningarna', 'Signum — reading the labels')}</h2>
          <p className="text-sm text-muted-foreground mb-4">{L('Danska inskrifter kan ha flera historiska signum. De vanligaste:', 'Danish inscriptions can carry several historical signa. The most common:')}</p>
          <div className="space-y-2">
            {SIGNA.map((s) => (
              <div key={s.p} className="rounded-lg border border-border bg-card/60 p-3">
                <span className="font-semibold text-gold">{s.p}</span>
                <span className="text-sm text-muted-foreground"> — {L(s.sv, s.en)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Kända stenar */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gold mb-4">{L('Kända danska runstenar', 'Famous Danish runestones')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURED.map((s) => (
              <Link key={s.signum} to={`/inscription/${encodeURIComponent(s.signum)}`} className="rounded-lg border border-border bg-card/60 p-4 hover:bg-card transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gold">{s.name}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0">{s.signum}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{L(s.sv, s.en)}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Källor */}
        <Card className="viking-card">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold"><ExternalLink className="h-5 w-5" /> {L('Källor', 'Sources')}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="space-y-1.5 text-muted-foreground">
              <li>Lis Jacobsen &amp; Erik Moltke, <em>Danmarks Runeindskrifter</em> (København 1941–42) — standardverket.</li>
              <li>
                <a href="https://runer.ku.dk/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">Danske Runeindskrifter (runer.ku.dk) <ExternalLink className="h-3 w-3" /></a>
                <span> — Nationalmuseet &amp; Københavns Universitet.</span>
              </li>
              <li>
                <a href="https://sv.wikipedia.org/wiki/Danmarks_runeindskrifter" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">Wikipedia — Danmarks runeindskrifter <ExternalLink className="h-3 w-3" /></a>
                <span> — signum-översikt (CC-BY-SA).</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground opacity-75 flex items-start gap-2 mt-2">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {L('Featurade stenar beskrivs på belagda fakta ur standardverken; inskrifternas fullständiga texter finns via länk till varje sten. Enskilda översättningar i databasen kan behöva verifieras.',
                 'Featured stones are described from established scholarship; full inscription texts are available via the link on each stone. Individual database translations may require verification.')}
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DanskaRunstenar;
