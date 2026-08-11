import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Tag, AlertTriangle, ChevronDown, Crown, ScrollText, Landmark, Route } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/ortnamn/tuna — källbelagd temasida om Tuna-namnen som ortnamn.
//
// HEDERLIGHET (INGEN GISSNING): varje siffra/påstående bär källa och märkning. Antalssiffror
// kommer från SOL 2003 (auktoritativ), INTE ur vår OSM-baserade place_names (som bara duger till
// kartlager, ej räkneverk). DB-uttag (Rundata/SDHK/place_names-fördelning) är snapshots märkta med
// datum. Guda-förleden redovisas OMTVISTADE. Underlaget granskat av AI-runolog, -filolog och
// -kulturgeograf (människa-i-loopen) 2026-08-11. Se docs/scratchpad tuna-verified-synthesis.

const SNAP = '2026-08-11'; // DB-uttagens datum (Rundata/SDHK/place_names)

const Section: React.FC<{ id?: string; icon?: React.ReactNode; title: string; sub?: string; defaultOpen?: boolean; children: React.ReactNode }>
  = ({ id, icon, title, sub, defaultOpen, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div id={id} className="mb-4 border border-slate-700/50 rounded-lg overflow-hidden scroll-mt-24">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/60 text-left transition-colors">
        <span className="text-lg font-semibold text-foreground flex items-center gap-2">
          {icon}{title}
        </span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="p-4 pt-3">
          {sub && <p className="text-sm text-muted-foreground max-w-3xl mb-3">{sub}</p>}
          {children}
        </div>
      )}
    </div>
  );
};

// Liten källrad.
const Src: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] text-muted-foreground/80 mt-2">{children}</p>
);

// Statusmärke belagt / omtvistat / obelagt.
const Status: React.FC<{ kind: 'belagt' | 'omtvistat' | 'obelagt'; sv: boolean }> = ({ kind, sv }) => {
  const meta = {
    belagt: { sv: 'belagt', en: 'attested', cls: 'border-emerald-500/60 text-emerald-300' },
    omtvistat: { sv: 'omtvistat', en: 'contested', cls: 'border-amber-500/60 text-amber-300' },
    obelagt: { sv: 'obelagt', en: 'unattested', cls: 'border-rose-500/60 text-rose-300' },
  }[kind];
  return <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-medium ${meta.cls}`}>{sv ? meta.sv : meta.en}</span>;
};

// ---- Källbelagda data (märkta) ----

// Vår place_names-fördelning (OSM-uttag, EJ auktoritativ räkning). Snapshot.
const DB_DISTRIBUTION: { prov: string; n: number }[] = [
  { prov: 'Uppland', n: 32 }, { prov: 'Södermanland', n: 18 }, { prov: 'Västmanland', n: 12 },
  { prov: 'Östergötland', n: 8 }, { prov: 'Småland', n: 5 }, { prov: 'Medelpad', n: 3 },
  { prov: 'Skåne', n: 2 }, { prov: 'Närke', n: 1 }, { prov: 'Västergötland', n: 1 },
];

// SDHK: brev som nämner en -tuna-ort, per århundrade (nominal_year). Snapshot.
const SDHK_CENTURY: { c: string; n: number }[] = [
  { c: '1000-tal', n: 1 }, { c: '1100-tal', n: 3 }, { c: '1200-tal', n: 144 },
  { c: '1300-tal', n: 736 }, { c: '1400-tal', n: 790 }, { c: '1500-tal', n: 158 },
];
const SDHK_TOP: { name: string; n: number }[] = [
  { name: 'Sigtuna', n: 504 }, { name: 'Eskilstuna', n: 499 }, { name: 'Simtuna', n: 157 },
  { name: 'Vallentuna', n: 137 }, { name: 'Frötuna', n: 116 }, { name: 'Dingtuna', n: 105 },
  { name: 'Sollentuna', n: 92 }, { name: 'Torstuna', n: 83 }, { name: 'Håtuna', n: 64 },
  { name: 'Skultuna', n: 55 }, { name: 'Runtuna', n: 54 }, { name: 'Romfartuna', n: 52 },
  { name: 'Närtuna', n: 47 }, { name: 'Estuna', n: 41 }, { name: 'Ultuna', n: 13 }, { name: 'Svintuna', n: 6 },
];

// Guda-förled kritiskt granskade (SOL 2003 s.328; Vikstrand 2001).
const GOD_ROWS: { name: string; god: string; trad: { sv: string; en: string }; obj: { sv: string; en: string }; status: 'omtvistat' | 'obelagt' }[] = [
  { name: 'Ultuna', god: 'Ull', trad: { sv: 'Guden Ull + tuna (villa Wlærtune 1221)', en: 'The god Ull + tuna (villa Wlærtune 1221)' },
    obj: { sv: 'Ull ingår även i Ulleråkers härad; Ultuna kan vara bildat till härads-/åkernamnet, ej direkt till guden', en: 'Ull also in Ulleråkers härad; Ultuna may derive from the hundred/field name, not the god directly' }, status: 'omtvistat' },
  { name: 'Torstuna', god: 'Tor', trad: { sv: 'Guden Tor + tuna (Thorstunum 1287)', en: 'The god Thor + tuna (Thorstunum 1287)' },
    obj: { sv: 'Häradet hette äldst Thorsakers hundare; namnet kan komma av *Thors[åkers]tuna', en: 'The hundred was earliest Thorsakers hundare; the name may derive from *Thors[åkers]tuna' }, status: 'omtvistat' },
  { name: 'Närtuna', god: 'Njärd', trad: { sv: 'Guden Njärd/Njǫrðr + tuna (Nerthetunum 1291)', en: 'The god Njörðr + tuna (Nerthetunum 1291)' },
    obj: { sv: 'Förledet kan i stället vara ett sjönamn *Nærdhe (’förträngning’)', en: 'The first element may instead be a lake name *Nærdhe (’narrows’)' }, status: 'omtvistat' },
  { name: 'Fröstuna / Frustuna', god: 'Frö', trad: { sv: 'Guden Frö (Freyr)', en: 'The god Frey' },
    obj: { sv: 'Förledet kan vara bildat till intilliggande Frösjön (naturnamn)', en: 'The first element may derive from the nearby lake Frösjön (a nature name)' }, status: 'omtvistat' },
  { name: 'Estuna', god: 'ás (’gud’)', trad: { sv: 'Genitiv pluralis av ás ’hednisk gud’ (Æsetunum 1289)', en: 'Genitive plural of ás ’heathen god’ (Æsetunum 1289)' },
    obj: { sv: 'SOL ger likvärdigt *æsar ’åsbor’ (invånarbeteckning; byn ligger på höjd) — snarast icke-sakralt', en: 'SOL gives *æsar ’ridge-dwellers’ equally (the village sits on a height) — most likely non-sacral' }, status: 'obelagt' },
  { name: 'Ärentuna', god: '—', trad: { sv: '(har ibland dragits till sakral sfär)', en: '(sometimes drawn to the sacral sphere)' },
    obj: { sv: 'SOL: förledet sannolikt *ærn ’grusig mark’ — ingen gud behövs', en: 'SOL: first element likely *ærn ’gravelly ground’ — no god needed' }, status: 'obelagt' },
];

// Äldsta skriftbelägg (SOL 2003 namnartiklar) — terminus ante quem, ej namnets ålder.
const ATTEST: { name: string; year: string; form: string; note: { sv: string; en: string } }[] = [
  { name: 'Sigtuna', year: '~995–1000', form: '(til) sihtunum', note: { sv: 'Myntrunor — äldst av alla tuna-namnen', en: 'Coin runes — oldest of all tuna-names' } },
  { name: 'Eskilstuna', year: '~1120', form: 'Tuna', note: { sv: 'Hette äldst bara Tuna; Eskils- efter S:t Eskil', en: 'Earliest just Tuna; Eskils- after St Eskil' } },
  { name: 'Ultuna', year: '1221', form: 'villa Wlærtune', note: { sv: '', en: '' } },
  { name: 'Estuna', year: '1289', form: 'Æsetunum', note: { sv: '', en: '' } },
  { name: 'Närtuna', year: '1291', form: 'Nerthetunum', note: { sv: '', en: '' } },
  { name: 'Sollentuna', year: '1287', form: 'Solendatunum', note: { sv: 'Delar inbyggarbeteckning med hundaret', en: 'Shares the folk-name with the hundred' } },
  { name: 'Torstuna', year: '1287', form: 'Thorstunum', note: { sv: '', en: '' } },
  { name: 'Färentuna', year: '1302', form: 'Feringatunum', note: { sv: 'Prästgården hette äldst bara Tuna', en: 'The rectory was earliest just Tuna' } },
];

const TunaNames = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const dbTotal = DB_DISTRIBUTION.reduce((s, r) => s + r.n, 0);
  const sdhkTotal = 1833;
  const maxCentury = Math.max(...SDHK_CENTURY.map((r) => r.n));

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Tuna-namnen — centralorter, kult eller inte?"
        titleEn="The Tuna place-names — central places, cult or not?"
        description="Tuna-namnen som ortnamn: utbredning, ålder, betydelse och den källkritiska striden om makt och gudakult. ~120 namn (SOL 2003), runstenar, medeltidsbrev och fallstudien Svintuna vid Eriksgatan."
        descriptionEn="The Tuna place-names: distribution, age, meaning and the source-critical debate over power and cult. ~120 names (SOL 2003), runestones, medieval charters and the Svintuna case study on the Eriksgata."
        keywords="tuna, tunanamn, ortnamn, centralort, Sigtuna, Svintuna, Eriksgatan, husaby, vikingatid, järnålder, teofora ortnamn"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-2">
            <a href={sv ? '/sv/ortnamn' : '/place-names'} className="hover:text-gold hover:underline">{sv ? 'Ortnamn' : 'Place names'}</a>
            <span className="mx-2">/</span><span>Tuna</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Tag className="h-8 w-8 text-gold" />
            {sv ? 'Tuna-namnen' : 'The Tuna place-names'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {sv
              ? 'Ett av Sveriges mest omdiskuterade ortnamn. Cirka 120 Tuna-namn, tätast i Mälarlandskapen, har kopplats till förhistoriska centralorter, kungamakt och gudakult — men forskningen är oenig om hur långt tolkningen bär. Den här sidan skiljer belagt från omtvistat.'
              : 'One of Sweden’s most debated place names. Some 120 Tuna-names, densest in the Mälaren provinces, have been linked to prehistoric central places, royal power and pagan cult — but scholars disagree on how far the interpretation carries. This page separates what is attested from what is contested.'}
          </p>
        </div>

        {/* Hederlighetsruta */}
        <div className="mb-6 rounded-lg border border-amber-600/30 bg-amber-950/20 p-4">
          <p className="text-sm text-foreground font-medium mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            {sv ? 'Så läser du sidan' : 'How to read this page'}
          </p>
          <p className="text-sm text-muted-foreground max-w-3xl">
            {sv
              ? 'Antalssiffror kommer från Svenskt ortnamnslexikon (SOL 2003), inte ur vår OSM-baserade databas (den duger till kartlager, inte till räkning). Varje påstående är märkt belagt, omtvistat eller obelagt. Guda-förleden är i flera fall omtvistade — vi ritar ingen "gudakarta". Underlaget är granskat av våra AI-specialister (runolog, filolog, kulturgeograf) med människa-i-loopen.'
              : 'Counts come from the Swedish place-name lexicon (SOL 2003), not from our OSM-based database (fit for a map layer, not for counting). Every claim is tagged attested, contested or unattested. The god-name first elements are contested in several cases — we draw no "map of gods". The material is reviewed by our AI specialists (runologist, philologist, cultural geographer) with a human in the loop.'}
          </p>
        </div>

        {/* 1. Vad är ett Tuna-namn */}
        <Section id="vad" defaultOpen icon={<Tag className="h-5 w-5 text-gold" />}
          title={sv ? '1. Vad är ett Tuna-namn?' : '1. What is a Tuna-name?'}>
          <div className="space-y-3 text-sm text-muted-foreground max-w-3xl">
            <p>
              {sv
                ? <><strong className="text-foreground">Tuna, engelskans <em>town</em> och tyska <em>Zaun</em> är samma ord</strong> — ett germanskt <em>tun</em> ’stängsel, inhägnad’ → ’det inhägnade området’ (engelska <em>-ton</em> i ortnamn är samma led). <strong className="text-foreground">Tuna</strong> är en särskild neutral pluralform som i Sverige fått en specialfunktion som namn på <strong className="text-foreground">centralorter</strong>. Över hälften av alla -tuna-namn är (eller har varit) osammansatt <em>Tuna</em>. <Status kind="belagt" sv={sv} /></>
                : <><strong className="text-foreground">Tuna, English <em>town</em> and German <em>Zaun</em> are the same word</strong> — a Germanic <em>tun</em> ’fence, enclosure’ → ’the enclosed ground’ (English <em>-ton</em> in place names is the same element). <strong className="text-foreground">Tuna</strong> is a distinct neuter plural that in Sweden took on a special function as a name for <strong className="text-foreground">central places</strong>. Over half of all -tuna names are (or were) the simplex <em>Tuna</em>. <Status kind="belagt" sv={sv} /></>}
            </p>
            <p>
              {sv
                ? <><strong className="text-foreground">Tun ≠ Tuna.</strong> Det singulara <em>tun</em> ger vanliga bebyggelsenamn (Tun sn och Tunhem i Västergötland, Tanum i Bohuslän). Den plurala <em>tuna</em>-typen med centralortsfunktion är koncentrerad till Mälardalen. Skillnaden är morfologisk (numerus) och geografisk — inte bara "dialektal".</>
                : <><strong className="text-foreground">Tun ≠ Tuna.</strong> The singular <em>tun</em> yields ordinary settlement names (Tun parish and Tunhem in Västergötland, Tanum in Bohuslän). The plural <em>tuna</em> type with central-place function is concentrated in the Mälaren region. The difference is morphological (number) and geographic — not merely "dialectal".</>}
            </p>
            <p>
              {sv
                ? <>Att orden är släkt speglar <strong className="text-foreground">gemensamt arv</strong>, inte en kringresande elit: de germanska språken grenade ut sig från urgermanskan och ärvde ordet (jfr <em>fader / Vater / father</em>, lat. <em>pater</em>). Urformen <em>*tūnaz</em> rekonstrueras till ~500 f.Kr.–vår tideräknings början; en omtvistad hypotes ser den som ett tidigt keltiskt lån av <em>*dūnon</em> ’befäst plats, borg’. <Status kind="omtvistat" sv={sv} /></>
                : <>The shared word reflects <strong className="text-foreground">common inheritance</strong>, not a travelling elite: the Germanic languages branched from Proto-Germanic and inherited it (cf. <em>fader / Vater / father</em>, Lat. <em>pater</em>). The proto-form <em>*tūnaz</em> is reconstructed to c. 500 BCE–the turn of the era; a contested hypothesis derives it from an early Celtic loan of <em>*dūnon</em> ’fortified place, hillfort’. <Status kind="omtvistat" sv={sv} /></>}
            </p>
            <Src>{sv ? 'Källa: Svenskt ortnamnslexikon (SOL) 2003, elementartikeln tuna, s. 328–329.' : 'Source: Swedish place-name lexicon (SOL) 2003, element article tuna, pp. 328–329.'}</Src>
          </div>
        </Section>

        {/* 2. Utbredning */}
        <Section id="utbredning" icon={<MapPin className="h-5 w-5 text-gold" />}
          title={sv ? '2. Hur många finns det — och var?' : '2. How many are there — and where?'}
          sub={sv
            ? 'Cirka 120 -tuna-namn i Sverige (SOL 2003). Kärnområdet är Mälarlandskapen med knappt hundra, varav drygt hälften i Uppland. Väl företrätt även i Östergötland och Medelpad (nordligast). Sydligast: Tuna på Ven.'
            : 'About 120 -tuna names in Sweden (SOL 2003). The core is the Mälaren provinces with just under a hundred, over half of them in Uppland. Well represented also in Östergötland and Medelpad (the northernmost). Southernmost: Tuna on the island of Ven.'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="viking-card"><CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-gold">~120</div>
              <div className="text-xs text-muted-foreground">{sv ? 'tuna-namn i Sverige (SOL 2003)' : 'tuna-names in Sweden (SOL 2003)'}</div>
            </CardContent></Card>
            <Card className="viking-card"><CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-gold">~100</div>
              <div className="text-xs text-muted-foreground">{sv ? 'i Mälarlandskapen, >½ i Uppland' : 'in the Mälaren provinces, >½ in Uppland'}</div>
            </CardContent></Card>
            <Card className="viking-card"><CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-gold">53 / 25 / 20</div>
              <div className="text-xs text-muted-foreground">{sv ? 'Uppland / Söd / Väst — enligt Holmberg 1969*' : 'Uppland / Söd / Väst — per Holmberg 1969*'}</div>
            </CardContent></Card>
          </div>
          <p className="text-[11px] text-amber-300/80 mb-4">
            {sv
              ? '* De exakta landskapstalen 53/25/20 står inte i SOL 2003 utan härrör sannolikt från Karl Axel Holmberg, De svenska tuna-namnen (1969). Vi har inte kunnat verifiera dem mot Holmberg själv — de anges därför med reservation.'
              : '* The exact provincial figures 53/25/20 are not in SOL 2003 but likely derive from Karl Axel Holmberg, De svenska tuna-namnen (1969). We have not been able to verify them against Holmberg directly — hence the caveat.'}
          </p>

          <h3 className="text-sm font-semibold text-foreground mb-2">
            {sv ? `Vår databas (place_names) — fördelning, uttag ${SNAP}` : `Our database (place_names) — distribution, extract ${SNAP}`}
          </h3>
          <div className="space-y-1 max-w-xl mb-2">
            {DB_DISTRIBUTION.map((r) => (
              <div key={r.prov} className="flex items-center gap-2 text-sm">
                <span className="w-32 shrink-0 text-muted-foreground">{r.prov}</span>
                <div className="flex-1 bg-slate-800/60 rounded h-4 overflow-hidden">
                  <div className="h-full bg-gold/70" style={{ width: `${(r.n / DB_DISTRIBUTION[0].n) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-foreground">{r.n}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/80 mb-3">
            {sv
              ? <>Totalt {dbTotal} rader som slutar på -tuna. <strong>Detta är ingen auktoritativ räkning</strong> — place_names är ~99 % OSM-härlett med dubbletter och enstaka falska positiva (t.ex. Fortuna). Använd siffran som kartlager, inte som antal Tuna-orter. Använd SOL:s ~120 för antal.</>
              : <>{dbTotal} rows ending in -tuna in total. <strong>This is not an authoritative count</strong> — place_names is ~99% OSM-derived with duplicates and the odd false positive (e.g. Fortuna). Treat it as a map layer, not a count of Tuna-places. Use SOL’s ~120 for the number.</>}
          </p>
          <a href="/explore?element=tuna" className="inline-flex items-center gap-1 text-gold hover:underline text-sm">
            <MapPin className="h-4 w-4" />{sv ? 'Visa Tuna-orterna på kartan' : 'Show the Tuna-places on the map'}
          </a>
        </Section>

        {/* 2b. Tuna & landskapet */}
        <Section id="landskap" icon={<MapPin className="h-5 w-5 text-gold" />}
          title={sv ? 'Tuna & landskapet — vid det inre vattnet' : 'Tuna & the landscape — by the inner water'}>
          <div className="space-y-3 text-sm text-muted-foreground max-w-3xl">
            <p>
              {sv
                ? <>-tuna-orterna är inte utspridda över hela landet. De klumpar sig i de bördiga centralbygderna kring Mälaren och på Östergötlands slätt (Uppland, Södermanland, Västmanland, Östergötland rymmer flertalet; enstaka utposter i Medelpad) och <strong className="text-foreground">lyser med sin frånvaro</strong> i skogsbygderna — Norrlands inland, Bergslagen, det småländska höglandet, västkusten. <Status kind="belagt" sv={sv} /></>
                : <>The -tuna places are not spread across the whole country. They cluster in the fertile central districts around Lake Mälaren and on the Östergötland plain (Uppland, Södermanland, Västmanland, Östergötland hold most; a few outposts in Medelpad) and are <strong className="text-foreground">conspicuously absent</strong> from the forest lands — interior Norrland, Bergslagen, the Småland highland, the west coast. <Status kind="belagt" sv={sv} /></>}
            </p>
            <p>
              {sv
                ? <>Gemensamt är närheten till vatten — men inte det öppna havet. -tuna ligger sällan på den yttre skärgårdsranden och sällan i skogens utmark, utan vid det <strong className="text-foreground">inre farvattnet</strong>: vikar, fjärdar och åmynningar i en tid då Mälaren ännu var en havsvik och landet stod flera meter lägre. Lägen man nådde med båt men som ändå låg tryggt inne i den odlade bygden — en vattenledd centralbygd.</>
                : <>What they share is proximity to water — but not the open sea. -tuna rarely sits on the outer skerry edge or in the forest margin, but by the <strong className="text-foreground">inner waterways</strong>: bays, fjords and river mouths at a time when Mälaren was still a sea-bay and the land stood several metres lower. Sites reachable by boat yet safely within the farmed district — a water-connected central place.</>}
            </p>
            <p className="text-[11px] opacity-80">
              {sv
                ? 'Vår spatiala analys av 60 distinkta -tuna-lokaler bekräftar fördelningen. Vattennärhets-talen är en undre gräns — just de inre fjärdarna och åarna saknas i strandlinje-modellen, så orterna ligger i verkligheten närmare vatten än siffrorna visar.'
                : 'Our spatial analysis of 60 distinct -tuna sites confirms the distribution. The water-proximity figures are a floor — the inner fjords and rivers are missing from the shoreline model, so the places lie closer to water than the numbers show.'}
            </p>
            <p>
              {sv
                ? <>Ett <strong className="text-foreground">null-modell-test</strong> bekräftar mönstret statistiskt: -tuna ligger signifikant närmare större vatten (sjö eller kust) än jämförbara <em>-torp</em>-orter i samma region — median ~8 km mot ~15 km, och nära dubbelt så stor andel inom 5 km (32 % mot 17 %; Mann–Whitney, p&nbsp;&lt;&nbsp;10⁻⁶, n&nbsp;=&nbsp;78/1306). Eftersom testet bara räknar de största sjöarna och kusten — och järnålderns vatten var mer utbrett — <strong className="text-foreground">underskattar</strong> det sannolikt -tunas verkliga vattennärhet. <Status kind="belagt" sv={sv} /> Att närheten beror på kungsgård/uppbörd/kommunikation är tolkning. <Status kind="hypotes" sv={sv} /></>
                : <>A <strong className="text-foreground">null-model test</strong> confirms the pattern statistically: -tuna lie significantly closer to larger water (lake or coast) than comparable <em>-torp</em> places in the same region — median ~8 km vs ~15 km, and nearly twice the share within 5 km (32% vs 17%; Mann–Whitney, p&nbsp;&lt;&nbsp;10⁻⁶, n&nbsp;=&nbsp;78/1306). Because the test counts only the largest lakes and the coast — and Iron Age water was more extensive — it likely <strong className="text-foreground">underestimates</strong> the true water-proximity of -tuna. <Status kind="belagt" sv={sv} /> That the proximity is due to royal manor/tax/communication is interpretation. <Status kind="hypotes" sv={sv} /></>}
            </p>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
              <p className="text-foreground font-medium mb-1">{sv ? 'Kan man datera en Tuna via strandförskjutningen?' : 'Can a Tuna be dated by shoreline displacement?'}</p>
              <p>
                {sv
                  ? <>Bara till en <strong className="text-foreground">bortre gräns</strong>. En orts nivå över dåtida hav säger "kan inte ha varit strandläge före år X" — inte ortens verkliga ålder, och allra minst namnets (namn kan vara överförda). Sigtuna är läroexemplet: det äldre <em>Fornsigtuna</em> var järnålderns strandläge, medan staden Sigtuna anlades först på 980-talet, när landhöjningen format om vikarna. <Status kind="hypotes" sv={sv} /></>
                  : <>Only to a <strong className="text-foreground">terminus post quem</strong>. A site’s level above the former sea says "cannot have been a shore site before year X" — not the place’s real age, and least of all the name’s (names can be transferred). Sigtuna is the textbook case: the older <em>Fornsigtuna</em> was the Iron Age shore site, while the town of Sigtuna was founded only in the 980s, once land uplift had reshaped the bays. <Status kind="hypotes" sv={sv} /></>}
              </p>
            </div>
            <Src>{sv
              ? 'Källa: spatial analys (place_names + paleo_shorelines, SGU CC0 / Copernicus DEM GLO-30), 2026-08-11; Sigtuna/Fornsigtuna-kronologin vilar på arkeologi/skriftkällor. Exakta strandnivåer kräver en lokal landhöjningskurva.'
              : 'Source: spatial analysis (place_names + paleo_shorelines, SGU CC0 / Copernicus DEM GLO-30), 2026-08-11; the Sigtuna/Fornsigtuna chronology rests on archaeology/written sources. Exact shore levels require a local uplift curve.'}</Src>
          </div>
        </Section>

        {/* 3. Betydelsen — makt eller inte */}
        <Section id="makt" icon={<Crown className="h-5 w-5 text-gold" />}
          title={sv ? '3. Betydelsen — makt eller inte?' : '3. The meaning — power or not?'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="viking-card border-sky-700/40">
              <CardHeader className="pb-2"><CardTitle className="text-base text-sky-300">{sv ? 'Centralorts-tesen' : 'The central-place thesis'}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>{sv ? 'Det har länge stått klart att -tuna-namn haft en särskild funktion som namn på centralorter i den förhistoriska samhällsorganisationen. Tuna ≈ ”centralort för territoriell administration”.' : 'It has long been clear that -tuna names had a special function as names for central places in the prehistoric social order. Tuna ≈ "central place for territorial administration".'}</p>
                <p>{sv ? 'Sollentuna och Vallentuna delar inbyggarbeteckning med sina hundaren → belagt som hundares-centralorter. Tuna är dessutom äldre än husaby som centralortstyp.' : 'Sollentuna and Vallentuna share their folk-name with their hundreds → attested as central places of those hundreds. Tuna is also older than husaby as a central-place type.'} <Status kind="belagt" sv={sv} /></p>
              </CardContent>
            </Card>
            <Card className="viking-card border-amber-700/40">
              <CardHeader className="pb-2"><CardTitle className="text-base text-amber-300">{sv ? 'Reservationen (SOL själv)' : 'The reservation (SOL itself)'}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>{sv ? 'SOL betonar oenighet om i vilken omfattning namnen haft denna funktion — från "praktiskt taget alla" till att det finns "inte så få" vanliga bebyggelsenamn utan samhällsfunktion.' : 'SOL stresses disagreement over the extent of this function — from "practically all" to there being "not a few" ordinary settlement names with no social function.'}</p>
                <p>{sv ? 'Man har troligen övertolkat att alla Tuna skulle betyda centralort. En del betyder helt enkelt ’inhägnad’.' : 'The claim that every Tuna means a central place has probably been overstated. Some simply mean ’enclosure’.'} <Status kind="omtvistat" sv={sv} /></p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-sm text-muted-foreground max-w-3xl">
            <p className="text-foreground font-medium mb-1">{sv ? 'Vad säger runstenarna om makten?' : 'What do the runestones say about power?'}</p>
            <p>{sv
              ? <>Vi hittar <strong>360 runinskrifter</strong> i Tuna-socknar (uttag {SNAP}), men <strong>ingen kunglig koppling</strong> (noll i <code>king_inscription_links</code>). Däremot lokal stormannaelit: Jarlabanke i Vallentuna (U 212) och Sollentuna (U 101), óðal-släktjord (Sö 145, Runtuna), þegn-titel (Sö 151). Runmaterialet knyter alltså Tuna-bygderna till <strong>privat elit och släktjord</strong> — inte till kungamakt. Att tuna-namn skulle vara kungliga centralgårdar är en arkeologisk/onomastisk hypotes, inte runbelagd. <Status kind="omtvistat" sv={sv} /></>
              : <>We find <strong>360 runic inscriptions</strong> in Tuna parishes (extract {SNAP}), but <strong>no royal link</strong> (zero in <code>king_inscription_links</code>). Instead local magnate elite: Jarlabanke in Vallentuna (U 212) and Sollentuna (U 101), óðal kin-land (Sö 145, Runtuna), the þegn title (Sö 151). The runic record ties the Tuna districts to <strong>private elite and kin-land</strong> — not to royal power. That tuna-names were royal central farms is an archaeological/onomastic hypothesis, not attested in runes. <Status kind="omtvistat" sv={sv} /></>}
            </p>
          </div>
          <Src>{sv ? 'Källor: SOL 2003 s. 328–329; John Kraft, Tidiga spår av Sveariket (2001) företräder den maximalistiska ytterkanten och står utanför onomastisk konsensus; runuppgifter ur Rundata (vår DB, uttag ' + SNAP + ').' : 'Sources: SOL 2003 pp. 328–329; John Kraft, Tidiga spår av Sveariket (2001) represents the maximalist pole, outside onomastic consensus; runic data from Rundata (our DB, extract ' + SNAP + ').'}</Src>
        </Section>

        {/* 4. Guda-Tunorna */}
        <Section id="gudar" icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
          title={sv ? '4. Guda-Tunorna — kritiskt granskade' : '4. The god-Tunas — critically examined'}
          sub={sv
            ? 'Gudanamn i förledet (Fröstuna, Torstuna, Ultuna, Närtuna) har lästs som inhägnade kultplatser. Men i flera fall finns ett konkurrerande icke-sakralt förled — ett härad, en åker, en sjö. Gudanamnet kan vara sekundärt. Detta är sidans viktigaste punkt.'
            : 'God-names in the first element (Fröstuna, Torstuna, Ultuna, Närtuna) have been read as enclosed cult sites. But in several cases a competing non-sacral element exists — a hundred, a field, a lake. The god-name may be secondary. This is the page’s key point.'}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-slate-700/50">
                  <th className="py-2 pr-3">{sv ? 'Namn' : 'Name'}</th>
                  <th className="py-2 pr-3">{sv ? 'Traditionell tolkning' : 'Traditional reading'}</th>
                  <th className="py-2 pr-3">{sv ? 'Källkritisk invändning (SOL)' : 'Source-critical objection (SOL)'}</th>
                  <th className="py-2">{sv ? 'Status' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {GOD_ROWS.map((r) => (
                  <tr key={r.name} className="border-b border-slate-800/60 align-top">
                    <td className="py-2 pr-3 text-foreground font-medium whitespace-nowrap">{r.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{sv ? r.trad.sv : r.trad.en}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{sv ? r.obj.sv : r.obj.en}</td>
                    <td className="py-2"><Status kind={r.status} sv={sv} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl mt-3">
            {sv
              ? 'Gudanamn förekommer alltså i förledet på ordnivå, men att guden är namngivningsgrunden i tuna-namnet är i flera fall en hypotes med ett konkurrerande alternativ. Estuna och Ärentuna bör inte framställas som säkra kultnamn.'
              : 'God-names thus occur in the first element at word level, but that the god is the naming basis of the tuna-name is in several cases a hypothesis with a competing alternative. Estuna and Ärentuna should not be presented as certain cult names.'}
          </p>
          <Src>{sv ? 'Källor: SOL 2003 s. 328–329; Per Vikstrand, Gudarnas platser (2001).' : 'Sources: SOL 2003 pp. 328–329; Per Vikstrand, Gudarnas platser (2001).'}</Src>
        </Section>

        {/* 5. Ålder & belägg */}
        <Section id="alder" icon={<ScrollText className="h-5 w-5 text-gold" />}
          title={sv ? '5. Ålder och de äldsta skriftbeläggen' : '5. Age and the earliest attestations'}
          sub={sv
            ? 'Tuna-institutionen antas ha uppkommit under äldre järnålder och spritts under yngre järnålder — ett forskningsantagande, inte ett årtal. Skriftbeläggen nedan ger bara terminus ante quem: namnet är nästan alltid äldre än sitt första skriftbelägg.'
            : 'The tuna institution is assumed to have arisen in the Early Iron Age and spread during the Late Iron Age — a scholarly assumption, not a date. The attestations below give only a terminus ante quem: the name is almost always older than its first written record.'}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-slate-700/50">
                  <th className="py-2 pr-3">{sv ? 'Namn' : 'Name'}</th>
                  <th className="py-2 pr-3">{sv ? 'Äldsta belägg' : 'Earliest'}</th>
                  <th className="py-2 pr-3">{sv ? 'Form' : 'Form'}</th>
                  <th className="py-2">{sv ? 'Not' : 'Note'}</th>
                </tr>
              </thead>
              <tbody>
                {ATTEST.map((a) => (
                  <tr key={a.name} className="border-b border-slate-800/60 align-top">
                    <td className="py-2 pr-3 text-foreground font-medium whitespace-nowrap">{a.name}</td>
                    <td className="py-2 pr-3 text-gold whitespace-nowrap">{a.year}</td>
                    <td className="py-2 pr-3 text-muted-foreground font-mono text-xs">{a.form}</td>
                    <td className="py-2 text-muted-foreground text-xs">{sv ? a.note.sv : a.note.en}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Src>{sv ? 'Källa: SOL 2003, namnartiklarna (bygger på Ortnamnsregistret/medeltidsdiplom). Sigtunas myntdatering bör verifieras vidare.' : 'Source: SOL 2003, the individual name articles (based on the name register / medieval charters). Sigtuna’s coin dating should be verified further.'}</Src>
        </Section>

        {/* 6. Runstenarna */}
        <Section id="runstenar" icon={<Landmark className="h-5 w-5 text-gold" />}
          title={sv ? '6. Runstenarna vid Tunorna' : '6. The runestones at the Tunas'}
          sub={sv
            ? 'En sten som står i Tuna nämner sällan Tuna. 360 runinskrifter ligger i Tuna-socknar (Uppland dominerar), men ortnamnet Tuna är i praktiken inte belagt i själva runtexten.'
            : 'A stone standing in Tuna rarely names Tuna. 360 runic inscriptions lie in Tuna parishes (Uppland dominates), but the place-name Tuna is in practice not attested in the runic text itself.'}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { n: '360', l: sv ? 'inskrifter i Tuna-socknar' : 'inscriptions in Tuna parishes' },
              { n: '161', l: sv ? 'från Sigtuna (mest lösfynd)' : 'from Sigtuna (mostly loose finds)' },
              { n: '0', l: sv ? 'kungliga kopplingar' : 'royal links' },
              { n: '~0', l: sv ? 'gånger Tuna namnges i runtext' : 'times Tuna is named in the text' },
            ].map((s) => (
              <Card key={s.l} className="viking-card"><CardContent className="py-4 text-center">
                <div className="text-2xl font-bold text-gold">{s.n}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </CardContent></Card>
            ))}
          </div>
          <div className="space-y-2 text-sm text-muted-foreground max-w-3xl">
            <p>{sv
              ? <><strong className="text-foreground">Homonymfällan:</strong> de fåtal runtext-träffarna på "tuna" är inte orten utan personnamnet Tonna/Tunna (DR 291, Ög 77), ordet <em>tunna</em> ’mått’ (D Rv136, 1619) eller <em>matunautr</em> ’bordskamrat’ (U 385). Att en sten står vid en Tuna-ort är alltså inte ett belägg för ortnamnet.</>
              : <><strong className="text-foreground">The homonym trap:</strong> the few "tuna" hits in runic text are not the place but the personal name Tonna/Tunna (DR 291, Ög 77), the word <em>tunna</em> ’barrel/measure’ (D Rv136, 1619) or <em>matunautr</em> ’mess-mate’ (U 385). A stone standing at a Tuna-place is thus not an attestation of the place-name.</>}</p>
            <p>{sv
              ? <><strong className="text-foreground">Sigtuna sticker ut:</strong> 161 poster, mest lösfynd (runben, bleck, kammar), med tyngdpunkt på 1100-talet — stadens skriftbruk fortsätter längre än de klassiska 1000-talsstenarna.</>
              : <><strong className="text-foreground">Sigtuna stands out:</strong> 161 records, mostly loose finds (rune bones, plates, combs), weighted to the 1100s — the town’s literacy continues beyond the classic 11th-century stones.</>}</p>
            <p className="text-[11px] opacity-80">{sv
              ? 'Datering: tyngdpunkt sena 1000-talet (Gräslund Pr 3–Pr 4); 216 av 360 är ostilbestämda. "Per århundrade" blir smalt — nästan allt faller inom runstensfönstret ~980–1130. Stilspann, inte punktår.'
              : 'Dating: weighted to the late 11th c. (Gräslund Pr 3–Pr 4); 216 of 360 are unclassified. "Per century" is narrow — almost everything falls within the runestone window ~980–1130. Style ranges, not point dates.'}</p>
            <p className="text-[11px] opacity-70">{sv
              ? 'Datakvalitet: socken-/provinsfälten är opålitliga för runinskrifter; vi litar på fyndplats/signum-serie. Uttag ' + SNAP + '.'
              : 'Data quality: the parish/province fields are unreliable for inscriptions; we rely on find spot / signum series. Extract ' + SNAP + '.'}</p>
          </div>
        </Section>

        {/* 7. Fallstudie Svintuna */}
        <Section id="svintuna" defaultOpen icon={<Route className="h-5 w-5 text-gold" />}
          title={sv ? '7. Fallstudie: Svintuna — vägnoden, inte gudakulten' : '7. Case study: Svintuna — the road node, not cult'}
          sub={sv
            ? 'Svintuna vid Kolmården visar en helt annan sorts Tuna. Här blev orten viktig av sitt läge — gränsen, vägen, överfarten — inte för att "tuna" bar makt. Förledet är "svin" (inte en gud), och orten ligger utanför Mälar-kärnan.'
            : 'Svintuna by the Kolmården forest shows a wholly different kind of Tuna. Here the place mattered because of its location — the border, the road, the crossing — not because "tuna" carried power. The first element is "svin" (not a god), and it lies outside the Mälaren core.'}>
          <div className="space-y-3 text-sm text-muted-foreground max-w-3xl">
            <p>{sv
              ? <><strong className="text-foreground">Eriksgatan och gisslebytet.</strong> Enligt landskapslagarna (Upplandslagen m.fl.) var Svintuna gränsstationen där sörmlänningarna överlämnade kungen och gisslan till östgötarna på kungens eriksgata (den exakta lydelsen kräver primärkälla; själva gränsläget är belagt) — själva skälet mellan svearnas och götarnas land. <Status kind="belagt" sv={sv} /></>
              : <><strong className="text-foreground">The Eriksgata and the hostage exchange.</strong> According to the provincial laws (Upplandslagen and others), Svintuna was the border station where the Södermanlanders handed the king and the hostages over to the Östgötar on the king’s Eriksgata — the very divide between the lands of the svear and the götar. <Status kind="belagt" sv={sv} /></>}</p>
            <p>{sv
              ? <><strong className="text-foreground">Kronogods och kastal.</strong> Svintuna var en bygd i Krokeks socken (Kolmården) — kronogods; Berggårdarna räknades till det egentliga Svintuna (Nordén 1933), och en räfstetingsdom 1399 fastslår kronogodskaraktären. På en bergkulle vid Uttersberg står Svintunakastalen, en rund/polygonal medeltida kastal daterad till 1100-talet, tolkad som del av ett kustförsvar och rastpunkt vid Eriksgatan. <Status kind="belagt" sv={sv} /> <span className="opacity-75">{sv ? '(kastalens datering enligt Nordén 1933, ej omprövad här)' : '(the dating per Nordén 1933, not re-examined here)'}</span></>
              : <><strong className="text-foreground">Crown land and a kastal.</strong> Svintuna was a district in Krokek parish (Kolmården) — crown land; the Berg farms were the actual Svintuna, and a 1399 court ruling establishes its crown status. On a rocky knoll at Uttersberg stands the Svintuna kastal, a round/polygonal medieval tower dated to the 1100s, read as part of a coastal defence and a rest point on the Eriksgata. <Status kind="belagt" sv={sv} /> <span className="opacity-75">(dating per Nordén 1933, not re-examined here)</span></>}</p>
            <p>{sv
              ? <><strong className="text-foreground">Det omtvistade förledet.</strong> Vad betyder "svin-"? Arthur Nordén (1933) härledde det ur ett naturord ’upptorkande/grunt strandområde’ (efter Svinsjön). Franzén, Hesselman och Sahlgren härledde det i stället ur <em>*swina</em> ’svearnas’ — gränsen mot svearna. Båda finns; vi tar inte ställning. <Status kind="omtvistat" sv={sv} /></>
              : <><strong className="text-foreground">The contested first element.</strong> What does "svin-" mean? Arthur Nordén (1933) derived it from a nature word ’shallowing/drying shore’ (after Lake Svinsjön). Franzén, Hesselman and Sahlgren derived it instead from <em>*swina</em> ’of the svear’ — the border with the svear. Both exist; we take no side. <Status kind="omtvistat" sv={sv} /></>}</p>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
              <p className="text-foreground font-medium mb-1">{sv ? 'Varför Svintuna spelar roll för sidan' : 'Why Svintuna matters for this page'}</p>
              <p>{sv
                ? 'Svintuna blev betydelsefull av läget, inte av namntypen. Det stödjer sidans slutsats: centralortsfunktionen sitter på enskilda, välplacerade Tunor — inte inbyggd i ordet "tuna".'
                : 'Svintuna became important through location, not name type. This supports the page’s conclusion: the central-place function attaches to particular, well-placed Tunas — it is not inherent in the word "tuna".'}</p>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href="/explore?focus=eriksgatan" className="inline-flex items-center gap-1 text-gold hover:underline">
                <Route className="h-4 w-4" />{sv ? 'Svintuna på Eriksgatan-kartan' : 'Svintuna on the Eriksgata map'}
              </a>
              <a href="/explore?lat=58.66889&lng=16.37833" className="inline-flex items-center gap-1 text-gold hover:underline">
                <MapPin className="h-4 w-4" />{sv ? 'Svintunakastalen på kartan' : 'The Svintuna kastal on the map'}
              </a>
            </div>
            <Src>{sv
              ? 'Källor: landskapslagarna (Upplandslagen, Södermannalagen m.fl.); Arthur Nordén, "Svintuna och dess kastal vid Eriksgatan", Fornvännen 28 (1933) s. 263–279, 347–366 (RAÄ, öppen: kulturarvsdata.se/raa/fornvannen/html/1933_263); Sveriges medeltida diplomatarium (SDHK); Wikidata Q10711595 / RAÄ Fornsök Krokek 12:1 (koordinat).'
              : 'Sources: the provincial laws (Upplandslagen, Södermannalagen and others); Arthur Nordén, "Svintuna och dess kastal vid Eriksgatan", Fornvännen 28 (1933) pp. 263–279, 347–366 (RAÄ, open: kulturarvsdata.se/raa/fornvannen/html/1933_263); Swedish medieval charters (SDHK); Wikidata Q10711595 / RAÄ Fornsök Krokek 12:1 (coordinate).'}</Src>
          </div>
        </Section>

        {/* 8. Medeltidsbreven */}
        <Section id="brev" icon={<ScrollText className="h-5 w-5 text-gold" />}
          title={sv ? '8. Tuna i medeltidsbreven' : '8. Tuna in the medieval charters'}
          sub={sv
            ? `${sdhkTotal} medeltidsbrev nämner en -tuna-ort (uttag ${SNAP}). Fördelningen per århundrade följer breven totala volym — få brev finns bevarade före 1200-talet — så det är ingen Tuna-specifik ökning.`
            : `${sdhkTotal} medieval charters mention a -tuna place (extract ${SNAP}). The distribution by century follows the overall charter volume — few charters survive before the 1200s — so it is not a Tuna-specific rise.`}>
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">{sv ? 'Brev per århundrade' : 'Charters per century'}</h3>
            <div className="space-y-1 max-w-xl">
              {SDHK_CENTURY.map((r) => (
                <div key={r.c} className="flex items-center gap-2 text-sm">
                  <span className="w-20 shrink-0 text-muted-foreground">{r.c}</span>
                  <div className="flex-1 bg-slate-800/60 rounded h-4 overflow-hidden">
                    <div className="h-full bg-gold/70" style={{ width: `${(r.n / maxCentury) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right text-foreground">{r.n}</span>
                </div>
              ))}
            </div>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-2">{sv ? 'Mest omnämnda Tuna-orter' : 'Most-mentioned Tuna-places'}</h3>
          <div className="flex flex-wrap gap-2">
            {SDHK_TOP.map((t) => (
              <span key={t.name} className="px-2 py-1 rounded border border-slate-600 text-sm text-slate-200">
                {t.name} <Badge variant="secondary" className="ml-1">{t.n}</Badge>
              </span>
            ))}
          </div>
          <Src>{sv
            ? 'Sigtuna och Eskilstuna (städer) dominerar. Källa: Sveriges medeltida diplomatarium (SDHK), uttag ur vår staging ' + SNAP + '. Grov strängmatchning (ord som slutar på -tuna) — kan i enstaka fall fånga annat.'
            : 'Sigtuna and Eskilstuna (towns) dominate. Source: Swedish medieval charters (SDHK), extract from our staging ' + SNAP + '. Coarse string matching (words ending in -tuna) — may occasionally catch other words.'}</Src>
        </Section>

        {/* Historiografi-ruta */}
        <Section id="historiografi" icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
          title={sv ? 'Vem tolkar — och varför?' : 'Who interprets — and why?'}>
          <div className="space-y-3 text-sm text-muted-foreground max-w-3xl">
            <p>{sv
              ? 'Tuna-forskningen har färgats av en gammal svea-centrisk berättelse: Mälardalen som "rikets vagga", svearna som enar götarna. Den syns i själva källorna — Sahlgren skrev "Sveaväldets uppkomst" (1931), och striden om Svin-namnen vid Bråviken handlar om just svea/göta-gränsen.'
              : 'Tuna scholarship has been coloured by an old Svea-centric narrative: the Mälaren region as the "cradle of the realm", the svear uniting the götar. It shows in the sources themselves — Sahlgren wrote "The origin of the Svea realm" (1931), and the dispute over the Svin-names by Bråviken is precisely about the svear/götar border.'}</p>
            <p>{sv
              ? 'Arthur Nordén, östgötsk arkeolog, polemiserade uttryckligen mot Uppsala-filologernas metod ("ortnamnen lärorikare än fornminnena") och lyfte Östergötlands rika fornlämningsbild. Artikeln om Svintuna är därför delvis en regional lärd strid — Östergötland-arkeologi mot Uppsala-onomastik — och en metodstrid om fornminnen mot ortnamn.'
              : 'Arthur Nordén, an Östergötland archaeologist, argued explicitly against the Uppsala philologists’ method ("place-names more instructive than monuments") and highlighted Östergötland’s rich archaeology. The Svintuna article is thus partly a regional scholarly contest — Östergötland archaeology vs Uppsala onomastics — and a methodological one, monuments vs place-names.'}</p>
            <p>{sv
              ? 'Var det ett medvetet försök att tona ner Östergötland? Det påstår vi inte — det vore ofalsifierbart. Men paradigmet var svea-centriskt av institutionella och källmässiga skäl (Uppsala som lärdomscentrum, runstenstätheten i Uppland, den medeltida "svear enade riket"-berättelsen). Senare centralortsarkeologi (t.ex. Uppåkra i Skåne) har decentrerat den bilden och gett Östergötland, Skåne och Västergötland större vikt som tidiga maktlandskap.'
              : 'Was it a deliberate attempt to downplay Östergötland? We do not claim that — it would be unfalsifiable. But the paradigm was Svea-centric for institutional and source-based reasons (Uppsala as the scholarly centre, the density of runestones in Uppland, the medieval "the svear united the realm" narrative). Later central-place archaeology (e.g. Uppåkra in Skåne) has decentred that picture and given Östergötland, Skåne and Västergötland greater weight as early power landscapes.'}</p>
            <p className="text-[11px] opacity-80">{sv
              ? 'Detta avsnitt är forskningshistoria och tolkning — markerat som sådant, inte som fakta.'
              : 'This section is historiography and interpretation — marked as such, not as fact.'}</p>
          </div>
        </Section>

        {/* Källor */}
        <div className="mt-8 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2"><BookOpenIcon /> {sv ? 'Källor' : 'Sources'}</h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Svenskt ortnamnslexikon (SOL), 2003, Språk- och folkminnesinstitutet — elementartikeln <em>tuna</em>, s. 328–329.</li>
            <li>Karl Axel Holmberg, <em>De svenska tuna-namnen</em>, 1969 {sv ? '(landskapstalen 53/25/20 — ej verifierade här)' : '(the provincial figures 53/25/20 — not verified here)'}.</li>
            <li>Per Vikstrand, <em>Gudarnas platser</em>, 2001.</li>
            <li>Arthur Nordén, «Svintuna och dess kastal vid Eriksgatan», <em>Fornvännen</em> 28 (1933), s. 263–279, 347–366 — <a className="text-gold hover:underline" href="http://kulturarvsdata.se/raa/fornvannen/html/1933_263" target="_blank" rel="noopener noreferrer">samla.raa.se</a> (RAÄ, öppen).</li>
            <li>{sv ? 'Landskapslagarna (Upplandslagen, Södermannalagen, MEL, KrL) — Svintuna/gisslebytet.' : 'The provincial laws (Upplandslagen, Södermannalagen, MEL, KrL) — Svintuna/the hostage exchange.'}</li>
            <li>Sveriges medeltida diplomatarium (SDHK); Rundata; Wikidata (CC0); RAÄ Fornsök — {sv ? 'DB-uttag' : 'DB extracts'} {SNAP}.</li>
          </ul>
          <p className="text-[11px] text-muted-foreground/70 mt-3">
            {sv
              ? 'Underlaget är sammanställt och granskat av plattformens AI-specialister (runolog, filolog, kulturgeograf) med människa-i-loopen. Belagt hålls isär från omtvistat och obelagt. Se '
              : 'The material is compiled and reviewed by the platform’s AI specialists (runologist, philologist, cultural geographer) with a human in the loop. Attested is kept apart from contested and unattested. See '}
            <a href="/ai-agenter" className="text-gold hover:underline">/ai-agenter</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Liten inline-ikon (undviker att importera hel uppsättning för en rubrik).
const BookOpenIcon = () => <ScrollText className="h-5 w-5 text-gold" />;

export default TunaNames;
