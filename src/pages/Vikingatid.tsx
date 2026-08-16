import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArticleProvenance } from '../components/ArticleProvenance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// /sv/vikingatid (en: /en/viking-age) — källkritisk begrepps-/historiografisida:
// "Vad menar vi med vikingatid?". Bygger på utredningar 2026-08-16 (historiker + filolog).
// Skiljer BELAGT från TOLKNING från HYPOTES; oberoende/icke fackgranskade läsningar
// (Fredrik Ousbäck/FORMAT HISTORIA) märks tydligt. INGEN GISSNING.

type Status = 'belagt' | 'tolkning' | 'hypotes' | 'oberoende';
const STATUS: Record<Status, { sv: string; en: string; color: string }> = {
  belagt:    { sv: 'Belagt',            en: 'Attested',      color: '#22c55e' },
  tolkning:  { sv: 'Tolkning',          en: 'Interpretation',color: '#38bdf8' },
  hypotes:   { sv: 'Hypotes',           en: 'Hypothesis',    color: '#f59e0b' },
  oberoende: { sv: 'Oberoende (ej fackgranskad)', en: 'Independent (non‑peer‑reviewed)', color: '#a855f7' },
};

const StatusBadge: React.FC<{ s: Status; sv: boolean }> = ({ s, sv }) => (
  <Badge variant="secondary" className="text-[10px] align-middle"
    style={{ backgroundColor: STATUS[s].color + '22', color: STATUS[s].color, borderColor: STATUS[s].color + '55' }}>
    {sv ? STATUS[s].sv : STATUS[s].en}
  </Badge>
);

const Vikingatid: React.FC = () => {
  const sv = !useLocation().pathname.toLowerCase().includes('viking-age');

  const etymologier: { form: string; sv: string; en: string; scholars: string; status: Status }[] = [
    { form: 'vík ’vik/bukt’', status: 'tolkning',
      sv: 'Den som ligger i/utgår från vikar. Läroboks-standard men semantiskt svag.',
      en: 'One who lurks in / sets out from bays. The textbook default, but semantically weak.',
      scholars: 'Elof Hellquist (1922); Jan de Vries (1962)' },
    { form: 'vika ’roddarpass, rodd sträcka mellan ombyten’', status: 'hypotes',
      sv: 'víkingr = ”den som ror sitt skifte”. Språkligt mest sammanhängande och livaktigast i debatten sedan 2005 — men omstridd (kritiserad av bl.a. Harald Bjorvand, Bernard Mees).',
      en: 'víkingr = “the one who rows his shift”. Linguistically the most coherent and the liveliest strand since 2005 — but contested (criticised by Harald Bjorvand, Bernard Mees among others).',
      scholars: 'Bertil Daggfeldt (Fornvännen 78, 1983); Eldar Heide (ANF 120, 2005)' },
    { form: 'lån ur fornengelska wīc / lat. vicus ’handelsplats, läger’', status: 'hypotes',
      sv: 'Ordet är tidigast belagt på engelsk mark (wīcing ~700), men härledningen har betydelse- och riktningsproblem.',
      en: 'The word is first attested on English soil (wīcing ~700), but the derivation has semantic and direction-of-borrowing problems.',
      scholars: '(diskuterad; ingen enskild förespråkare dominerar)' },
    { form: 'verbet víkja ’vika av, röra sig’', status: 'hypotes',
      sv: 'I praktiken uppgången i roddarskiftes-hypotesen.',
      en: 'In practice absorbed into the rowing-shift hypothesis.',
      scholars: 'Fritz Askeberg (1944)' },
  ];

  const runbelagg = [
    { sv: '”í víkingu” (på vikingafärd) — om själva plundringsfärden', en: '“í víkingu” (on a viking voyage) — of the raiding expedition itself', ref: 'DR 330, DR 334, Vg 61' },
    { sv: '”vikinga vörðr” (vikingavakt) — appellativet', en: '“vikinga vörðr” (viking-watch) — the appellative', ref: 'U 617 Bro' },
    { sv: '”Tóki víkingr” — som tillnamn/mansnamn', en: '“Tóki víkingr” — as a byname / personal name', ref: 'Sm 10' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title={sv ? 'Vad menar vi med vikingatid?' : 'What do we mean by the Viking Age?'}
        titleEn="What do we mean by the Viking Age?"
        description={sv
          ? 'Periodiseringens ursprung, ordet vikings etymologi och de nedtonade dimensionerna — källkritiskt, med belagt skilt från tolkning och hypotes.'
          : 'The origin of the periodisation, the etymology of the word viking, and the downplayed dimensions — source-critical, separating what is attested from interpretation and hypothesis.'}
        descriptionEn="The origin of the periodisation, the etymology of the word viking, and the downplayed dimensions — source-critical."
        keywords={sv ? 'vikingatid, periodisering, viking etymologi, Geijer, Sutton Hoo, historiografi' : 'Viking Age, periodisation, viking etymology, Geijer, Sutton Hoo, historiography'}
      />
      <Header />
      <Breadcrumbs />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {sv ? 'Vad menar vi med vikingatid?' : 'What do we mean by the Viking Age?'}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {sv
              ? 'Begreppet ”vikingatid” känns självklart — men det är till stor del en ram byggd på engelsk historia och präglad av 1800-talets nationalism. Den här sidan visar var ramen kommer ifrån, vad ordet viking faktiskt betyder, och vad som tonats bort. Varje påstående är märkt: belagt, tolkning eller hypotes.'
              : 'The term “Viking Age” feels self-evident — but it is largely a frame built on English history and shaped by 19th-century nationalism. This page shows where the frame comes from, what the word viking actually means, and what has been edited out. Every claim is labelled: attested, interpretation or hypothesis.'}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {(Object.keys(STATUS) as Status[]).map((s) => <StatusBadge key={s} s={s} sv={sv} />)}
          </div>
        </header>

        {/* 1. Periodisering */}
        <Card>
          <CardHeader><CardTitle className="text-xl">
            {sv ? '1. Var kommer periodiseringen ifrån?' : '1. Where does the periodisation come from?'}
          </CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              {sv
                ? 'Den populära ramen 793 (överfallet på Lindisfarne) → 1066 (slaget vid Stamford Bridge) är händelser i engelsk historia, inte skandinavisk. '
                : 'The popular frame 793 (the raid on Lindisfarne) → 1066 (the Battle of Stamford Bridge) marks events in English history, not Scandinavian. '}
              <StatusBadge s="belagt" sv={sv} />
            </p>
            <p>
              {sv
                ? 'Skandinavien har en egen kronologi, byggd på treperiodssystemet (Oscar Montelius) och arkeologin: vendeltid följd av vikingatid ca 750/800–1050, med kristnandet som slutpunkt. Att den engelska ramen dominerar den anglofona och populära framställningen är '
                : 'Scandinavia has its own chronology, built on the three-age system (Oscar Montelius) and archaeology: the Vendel Period followed by the Viking Age c. 750/800–1050, with Christianisation as the endpoint. That the English frame dominates the anglophone and popular presentation is '}
              <StatusBadge s="belagt" sv={sv} />
              {sv ? '; att den skulle ha ”importerats och blivit ramverket” även i den skandinaviska forskningen är en ' : '; that it was “imported and became the framework” within Scandinavian scholarship too is an '}
              <StatusBadge s="hypotes" sv={sv} />.
            </p>
            <p>
              {sv
                ? 'Att själva begreppet vikingatid är en 1800-talskonstruktion präglad av nationalism är väl belagt (Fredrik Svanberg, Decolonizing the Viking Age, 2003). Danmark har däremot en genuin förbindelse med Englands historia (Danelagen, Knut den store, 1066).'
                : 'That the very concept of a Viking Age is a 19th-century construction shaped by nationalism is well established (Fredrik Svanberg, Decolonizing the Viking Age, 2003). Denmark, by contrast, does have a genuine link to English history (the Danelaw, Cnut the Great, 1066).'}
            </p>
          </CardContent>
        </Card>

        {/* 2. Ordet viking */}
        <Card>
          <CardHeader><CardTitle className="text-xl">
            {sv ? '2. Ordet ”viking”' : '2. The word “viking”'}
          </CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              {sv
                ? 'Fornnordiskan skiljer på två ord: víkingr (maskulinum) = personen/sjökrigaren — även ett vanligt mansnamn och tillnamn — och víking (femininum) = själva färden eller härnadståget. Båda är belagda i runsvenskan:'
                : 'Old Norse distinguishes two words: víkingr (masculine) = the person / sea-warrior — also a common personal name and byname — and víking (feminine) = the voyage or raiding expedition itself. Both are attested in runic Swedish:'}
            </p>
            <ul className="space-y-1.5">
              {runbelagg.map((r) => (
                <li key={r.ref} className="flex flex-wrap items-baseline gap-2">
                  <span className="text-foreground">{sv ? r.sv : r.en}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-300">{r.ref}</span>
                </li>
              ))}
            </ul>
            <p>
              {sv
                ? 'Ordet är äldre än sina runbelägg (900–1000-tal): fornengelska wīcing finns redan omkring år 700 (Épinal-Erfurt-glossariet), där det översätter latinets piraticum ’sjörövare’.'
                : 'The word is older than its runic attestations (900s–1000s): Old English wīcing appears already around 700 (the Épinal-Erfurt glossary), translating Latin piraticum “pirate”.'}
            </p>
            <div className="rounded-lg border border-amber-800/50 bg-amber-950/20 p-3">
              <p className="text-amber-200/90">
                {sv
                  ? 'Det finns ingen fastställd etymologi — frågan är öppen. Fyra härledningar konkurrerar:'
                  : 'There is no settled etymology — the question is open. Four derivations compete:'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {etymologier.map((e) => (
                <div key={e.form} className="rounded-lg border border-slate-700 p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-foreground font-medium italic">{e.form}</span>
                    <StatusBadge s={e.status} sv={sv} />
                  </div>
                  <p>{sv ? e.sv : e.en}</p>
                  <p className="text-[11px] text-slate-400">{e.scholars}</p>
                </div>
              ))}
            </div>
            <p>
              {sv
                ? 'Att ordet skulle betyda ”ung man i grupp” är rimlig historisk sociologi men inte ordets lexikala betydelse — ordet för ung, duglig kämpe var drengr, ett annat ord. Och ”viking” var en roll, inte ett folknamn.'
                : 'That the word means “young man in a band” is reasonable social history but not its lexical meaning — the word for a young, able warrior was drengr, a different word. And “viking” was a role, not the name of a people.'}
            </p>
            <p>
              {sv
                ? 'Den romantiserade vikingen är ung: Erik Gustaf Geijer publicerade dikten ”Vikingen” i Iduna 1811 (Götiska förbundet). Geijer myntade inte ordet — han romantiserade figuren.'
                : 'The romantic viking is young: Erik Gustaf Geijer published the poem “Vikingen” in Iduna in 1811 (the Geatish Society). Geijer did not coin the word — he romanticised the figure.'}
              {' '}<StatusBadge s="belagt" sv={sv} />
            </p>
          </CardContent>
        </Card>

        {/* 3. Samtida beteckningar */}
        <Card>
          <CardHeader><CardTitle className="text-xl">
            {sv ? '3. Vad kallades de av samtiden?' : '3. What did contemporaries call them?'}
          </CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              {sv
                ? 'Nästan ingen samtida källa kallade dem ”vikingar” som folk. De omtalades i stället efter härkomst eller som ”hedningar”:'
                : 'Almost no contemporary source called them “vikings” as a people. They were named by origin or as “heathens”:'}
              {' '}<StatusBadge s="belagt" sv={sv} />
            </p>
            <ul className="space-y-1 list-disc pl-5">
              <li>{sv ? 'Fornengelska: hæðne (hedningar), Dene (daner), Norðmenn (nordmän)' : 'Old English: hæðne (heathens), Dene (Danes), Norðmenn (Northmen)'}</li>
              <li>{sv ? 'Frankiska annaler: Nortmanni, Dani' : 'Frankish annals: Nortmanni, Dani'}</li>
              <li>{sv ? 'Grekiska (Bysans): Rhōs, Varangoi (väringar)' : 'Greek (Byzantium): Rhōs, Varangoi (Varangians)'}</li>
              <li>{sv ? 'Slaviska: Rus’ · Arabiska: al-Majūs, al-Rūs' : 'Slavic: Rus’ · Arabic: al-Majūs, al-Rūs'}</li>
            </ul>
            <p className="text-[12px] text-slate-400">
              {sv ? 'Källor: Clare Downham (2012); Judith Jesch (2015).' : 'Sources: Clare Downham (2012); Judith Jesch (2015).'}
            </p>
          </CardContent>
        </Card>

        {/* 4. Nedtonade dimensioner */}
        <Card>
          <CardHeader><CardTitle className="text-xl">
            {sv ? '4. Det som tonats bort' : '4. What has been edited out'}
          </CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              {sv
                ? 'Den populära bilden lyfter fram västerled (England) och tonar ned det frankiska (Aachen, det karolingiska riket) och österled (Rus, Novgorod, Gotland). Att dessa dimensioner är underbetonade i den populära framställningen är '
                : 'The popular image foregrounds the west (England) and downplays the Frankish (Aachen, the Carolingian empire) and the east (Rus, Novgorod, Gotland). That these dimensions are underplayed in the popular presentation is '}
              <StatusBadge s="belagt" sv={sv} />
              {sv ? ' (Władysław Duczko; Fedir Androshchuk). Att orsaken skulle vara medvetet ideologisk är en ' : ' (Władysław Duczko; Fedir Androshchuk). That the cause is deliberately ideological is a '}
              <StatusBadge s="hypotes" sv={sv} />.
            </p>
            <p>
              {sv
                ? 'Vendeltidens elitmiljöer (Vendel, Valsgärde i Uppland) har starka paralleller till det engelska Sutton Hoo — hjälm, skeppsgrav, praktföremål (Rupert Bruce-Mitford). '
                : 'The Vendel-Period elite milieus (Vendel, Valsgärde in Uppland) have strong parallels to England’s Sutton Hoo — helmet, ship burial, prestige objects (Rupert Bruce-Mitford). '}
              <StatusBadge s="belagt" sv={sv} />
              {sv ? ' Nyans: exakt tillverkningsort är omdebatterad — skriv aldrig ”svensktillverkad hjälm”.' : ' Nuance: the exact place of manufacture is debated — never write “Swedish-made helmet”.'}
            </p>
          </CardContent>
        </Card>

        {/* Oberoende läsningar */}
        <Card className="border-purple-800/50">
          <CardHeader><CardTitle className="text-lg">
            {sv ? 'Om oberoende läsningar' : 'On independent readings'}
          </CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
            <p>
              {sv
                ? 'Delar av den folkliga debatten (t.ex. Fredrik Ousbäck / YouTube-kanalen FORMAT HISTORIA) driver egna, icke fackgranskade läsningar av vikingatiden och av enskilda inskrifter. De redovisas på plattformen '
                : 'Parts of the popular debate (e.g. Fredrik Ousbäck / the YouTube channel FORMAT HISTORIA) advance their own, non-peer-reviewed readings of the Viking Age and of individual inscriptions. On this platform they are shown '}
              <StatusBadge s="oberoende" sv={sv} />
              {sv ? ' och hålls tydligt åtskilda från fackgranskad forskning — aldrig som ”fakta”.' : ' and kept clearly apart from peer-reviewed scholarship — never as “fact”.'}
            </p>
            <p className="text-[12px]">
              {sv ? 'Se t.ex. de konkurrerande läsningarna av ' : 'See for instance the competing readings of the '}
              <Link to={sv ? '/sv/runinskrifter?q=Ög 136' : '/en/runinscriptions?q=Ög 136'} className="text-amber-500 hover:underline">
                {sv ? 'Rökstenen (Ög 136)' : 'the Rök runestone (Ög 136)'}
              </Link>.
            </p>
          </CardContent>
        </Card>

        {/* Fördjupning: samhällets militär-territoriella organisation (egna temasidor) */}
        <Card>
          <CardHeader><CardTitle className="text-lg">
            {sv ? 'Fördjupning: samhällets organisation' : 'Deep dive: how society was organised'}
          </CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground space-y-2">
            <p>{sv
              ? 'Tre sammanhängande temasidor om det militär-territoriella system som band samman kust och kungamakt — källkritiskt, med belagt skilt från hypotes:'
              : 'Three connected theme pages on the military-territorial system that bound coast and kingship — source-critical, with the attested kept apart from the hypothetical:'}</p>
            <ul className="space-y-1.5 pl-1">
              <li>
                <Link to={sv ? '/sv/ledung' : '/en/leidang'} className="text-amber-500 hover:underline font-medium">
                  {sv ? 'Ledung' : 'Leidang'} →
                </Link>{' '}
                <span className="text-[13px]">{sv ? '— sjökrigsorganisationen: skeppslag, roddarlag, skatteledung.' : '— the naval levy: ship-districts, oarsman crews, the shift to a tax.'}</span>
              </li>
              <li>
                <Link to={sv ? '/sv/hundare' : '/en/hundred'} className="text-amber-500 hover:underline font-medium">
                  {sv ? 'Hundare' : 'The hundare'} →
                </Link>{' '}
                <span className="text-[13px]">{sv ? '— Svealands indelningsenhet före häradet, och dess koppling till ledungen.' : '— Svealand’s division before the härad, and its link to the levy.'}</span>
              </li>
              <li>
                <Link to={sv ? '/sv/snacknamn' : '/en/snack-names'} className="text-amber-500 hover:underline font-medium">
                  {sv ? 'Snäck-ortnamn' : 'Snäck place-names'} →
                </Link>{' '}
                <span className="text-[13px]">{sv ? '— ortnamn på Snäck- och deras omtvistade koppling till skeppshamnar.' : '— place-names in Snäck- and their disputed link to ship harbours.'}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <ArticleProvenance
          sv={sv}
          reviewedDate="2026-08-16"
          sources={[
            'Fredrik Svanberg, Decolonizing the Viking Age (2003)',
            'Clare Downham (2012)', 'Judith Jesch (2015)',
            'Bertil Daggfeldt, Fornvännen 78 (1983)', 'Eldar Heide, ANF 120 (2005)',
            'Elof Hellquist, Svensk etymologisk ordbok (1922)', 'Jan de Vries (1962)', 'Fritz Askeberg (1944)',
            'Rupert Bruce-Mitford', 'Władysław Duczko', 'Fedir Androshchuk',
            'Erik Gustaf Geijer, ”Vikingen”, Iduna (1811)',
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Vikingatid;
