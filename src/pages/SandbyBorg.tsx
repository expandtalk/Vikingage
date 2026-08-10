import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MapPin, Coins, AlertTriangle, ScrollText, ExternalLink, Landmark, Mountain, BookOpen, Microscope, Bot, Users, Swords, CalendarClock, Layers, ScanSearch, Utensils, Bone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// /sv/sandby-borg — forskningssida + utflyktsmål om Sandby borg, ringborgen på sydöstra Öland
// där en massaker under folkvandringstid lämnade de dödade obegravda och platsen övergiven.
//
// DATERING (omtvistad, redovisas som TVÅ rader):
//   Äldre uppskattning ~480 e.Kr. (typologi + myntens TPQ + Roms fall 476).
//   Ny, starkare ¹⁴C-datering ca 500–540 e.Kr. (29 dateringar, dietkorrigerade + Bayesiansk
//   modellering, RJ-projekt P15-0138:1). Den nyare ligger senare än den äldre typologiska.
//
// KÄLLKRITIK: alla hårda fakta nedan är belagda i vår DB (swedish_hillforts, "Sandby borg"):
//   koordinat (16.63926,56.55253) → 56.55253/16.63926, RAÄ Sandby 45:1, Sandby sn/Mörbylånga,
//   datering folkvandringstid 400–550 (dating_source "Kalmar läns museum; Victor et al. (DiVA)"),
//   fort_function "defense", terräng (elevation ~1,16 m, rel_height −1,77 m, on_height=false,
//   jordart "Svallsediment, grus", bördighet "mager" — samplat 2026-08-04).
// Massaker/avrättning/tabu-övergivning = TOLKNING ur fynden (Kalmar läns museum) — märkt som sådan.
// Undersökningsgrad: endast 3 av 53 georadar-kartlagda hus helt undersökta (<10 % av innerytan).

const LAT = 56.55253;
const LNG = 16.63926;

const SandbyBorgMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [LAT, LNG], zoom: 16, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
    // Schematiskt omfång av ringvallen (~104×70 m). Cirkeln är UNGEFÄRLIG — de ~53 husen
    // (radiellt + centralkvarter) kan inte placeras exakt utan georadar-data (Viberg et al. 2014).
    L.circle([LAT, LNG], { radius: 52, color: '#7c2d12', weight: 2, dashArray: '5 5', fill: false })
      .bindPopup('Ringvallens ungefärliga omfång (schematiskt, ~104×70 m). Exakta huslägen ritas ej ut — kräver georadar-data.')
      .addTo(map);
    L.circleMarker([LAT, LNG], { radius: 7, color: '#7c2d12', weight: 3, fillColor: '#d4a63c', fillOpacity: 0.9 })
      .bindPopup('<b>Sandby borg</b><br/><span style="font-size:11px">Ringborg, folkvandringstid. RAÄ Sandby 45:1.</span>')
      .addTo(map)
      .openPopup();
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div>
      <div ref={containerRef} className="w-full h-[420px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 420 }} />
      <p className="text-xs text-muted-foreground mt-2 opacity-75">
        Ölands sydöstra kust, mot Östersjön. Den streckade cirkeln är ringvallens <strong>ungefärliga omfång</strong>{' '}
        (schematiskt); borgens ~53 hus (radiellt längs muren + centralkvarter) går <strong>inte</strong> att rita ut
        exakt utan georadar-data (Viberg et al. 2014). Portar: huvudport i NV, sjöport mot öster.{' '}
        <strong>Vattenlinjen:</strong> Ölands landhöjning sedan folkvandringstid är liten, så kustlinjen låg nära
        dagens — borgen låg <em>vid vattnet</em> (rapporten: &quot;alldeles ovanför stranden&quot;). Exakt dåtida strandlinje
        kräver strandförskjutningsmodell. Koordinat verifierad i DB (RAÄ Sandby 45:1).{' '}
        <Link to={`/explore?center=${LAT},${LNG}&zoom=16`} className="text-gold hover:underline">Öppna i utforskaren →</Link>
      </p>
    </div>
  );
};

const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
    <span className="text-sm text-foreground">{children}</span>
  </div>
);

// forensic_individuals är inte i genererade types än → otypad cast (jfr övriga sidor).
const sb = supabase as unknown as { from: (t: string) => any };

interface ForensicRow {
  individual_label: string | null;
  find_number: string | null;
  age: string | null;
  sex_dna: string | null;
  sex_osteo: string | null;
  stature_cm: string | null;
  trauma_type: string | null;
  trauma_description: string | null;
  interpretation: string | null;
}

// Färg per traumaklass — differentialbedömning, ej dom.
const TRAUMA_COLOR: Record<string, string> = {
  skarp: 'text-red-300',
  trubbig: 'text-orange-300',
  'trubbig/skarp (mix)': 'text-amber-300',
  oklar: 'text-slate-400',
  'ingen påvisad': 'text-slate-500',
};
// Sortera efter livsstadium (yngst→äldst) — lyfter demografin: få i stridbar ålder.
const ageRank = (r: ForensicRow): number => {
  const a = (r.age ?? '').toLowerCase();
  if (a.includes('spädbarn') || a.includes('mån')) return 0;
  if (a.includes('barn') || a.includes('2–5')) return 1;
  if (a.includes('12') || a.includes('13') || a.includes('tonår')) return 2;
  if (a.includes('17') || a.includes('ung')) return 3;
  if (a.includes('äldre') || a.includes('35')) return 5;
  return 4; // vuxen, ospecificerad
};

// Per-individ forensik ur DB (forensic_individuals), Sandby borg / Hus 40.
const ForensicIndividualsTable: React.FC = () => {
  const [rows, setRows] = React.useState<ForensicRow[] | null>(null);
  React.useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await sb.from('forensic_individuals')
        .select('individual_label,find_number,age,sex_dna,sex_osteo,stature_cm,trauma_type,trauma_description,interpretation')
        .eq('site_name', 'Sandby borg');
      if (alive) setRows((data ?? []) as ForensicRow[]);
    })();
    return () => { alive = false; };
  }, []);

  if (rows === null) return <p className="text-xs text-muted-foreground">Laddar individdata…</p>;
  if (!rows.length) return null;
  const sorted = [...rows].sort((a, b) => ageRank(a) - ageRank(b));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
            <th className="py-2 pr-3 font-medium">Individ</th>
            <th className="py-2 pr-3 font-medium">Ålder</th>
            <th className="py-2 pr-3 font-medium">Kön</th>
            <th className="py-2 pr-3 font-medium">Längd</th>
            <th className="py-2 pr-3 font-medium">Trauma (perimortem)</th>
            <th className="py-2 font-medium">Tolkning</th>
          </tr>
        </thead>
        <tbody className="align-top">
          {sorted.map((r, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-2 pr-3 whitespace-nowrap text-foreground font-medium">
                {r.individual_label}
                {r.find_number && r.find_number !== '—' ? <span className="text-muted-foreground font-normal"> · {r.find_number}</span> : null}
              </td>
              <td className="py-2 pr-3 whitespace-nowrap">{r.age || '—'}</td>
              <td className="py-2 pr-3 whitespace-nowrap">{r.sex_dna || r.sex_osteo || '—'}</td>
              <td className="py-2 pr-3 whitespace-nowrap">{r.stature_cm ? `${r.stature_cm} cm` : '—'}</td>
              <td className="py-2 pr-3">
                {r.trauma_type ? <span className={`font-medium ${TRAUMA_COLOR[r.trauma_type] ?? 'text-slate-300'}`}>{r.trauma_type}</span> : '—'}
                {r.trauma_description ? <span className="text-muted-foreground"> — {r.trauma_description}</span> : null}
              </td>
              <td className="py-2 text-muted-foreground italic">{r.interpretation || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SandbyBorg = () => {
  // Hash-scroll: facett-chips i sökmotorn länkar hit med #massakern / #skatter.
  const location = useLocation();
  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
  <div className="min-h-screen viking-bg">
    <PageMeta
      title="Sandby borg — ringborgen på Öland och massakern under folkvandringstid"
      titleEn="Sandby borg — the Öland ring fort and its Migration-Period massacre"
      description="Forskningssida om Sandby borg på sydöstra Öland (RAÄ Sandby 45:1). En folkvandringstida ringborg där en massaker lämnade de dödade obegravda och platsen övergiven. Dateringen är omtvistad: äldre uppskattning ~480 e.Kr., nyare ¹⁴C-datering ca 500–540 e.Kr. Depåer med förgyllda spännen och enstaka romerska guldmynt — inte myntskatter. Belagd datering, källkritik och forensisk metod."
      descriptionEn="Research page on Sandby borg, a Migration-Period ring fort on south-eastern Öland (RAÄ Sandby 45:1). A massacre left the dead unburied and the fort abandoned. The dating is disputed: an older estimate of ~480 AD versus a newer radiocarbon date of c. 500–540 AD. Deposits of gilded brooches and a few Roman gold coins — not coin hoards. Sourced dating, source criticism and forensic method."
      keywords="Sandby borg, Öland, fornborg, ringborg, folkvandringstid, massaker, Kalmar läns museum, solidi, reliefspännen, RAÄ Sandby 45:1, utflykt Öland"
    />
    <Header />
    <Breadcrumbs />
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-gold" />
          Sandby borg
        </h1>
        <p className="text-gold/90 text-sm font-medium mb-3">Ringborgen på sydöstra Öland och massakern under folkvandringstid.</p>
        <p className="text-muted-foreground text-lg">
          Sandby borg är en <strong>folkvandringstida ringborg</strong> vid Ölands sydöstra kust. Vid en
          arkeologisk undersökning påträffades <strong>obegravda människor liggande där de föll</strong> —
          husen återbeboddes aldrig, och borgen lämnades. Fynden gör platsen till ett av Sveriges
          mest omtalade järnåldersfynd: en nedfrusen ögonblicksbild av en katastrof under
          folkvandringstid. <strong>Dateringen är omtvistad</strong> — den nyare ¹⁴C-baserade ligger
          senare än den äldre typologiska (se rutan nedan).
        </p>
      </div>

      {/* Faktaruta — allt belagt i databasen */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Landmark className="h-5 w-5" /> Fakta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Fact label="Läge">Sandby socken, Mörbylånga kommun, Öland</Fact>
            <Fact label="Fornlämning">RAÄ Sandby 45:1</Fact>
            <Fact label="Typ">Ringborg (fornborg)</Fact>
            <Fact label="Period">Folkvandringstid, ca 400–550 e.Kr.</Fact>
            <Fact label="Händelse">Massaker (avrättning — tolkning)</Fact>
            <Fact label="Undersökt">3 av 53 hus (&lt;10 % av innerytan)</Fact>
          </div>

          {/* Datering — TVÅ rader; omtvistad */}
          <div className="mt-4 rounded-lg border border-amber-900/30 bg-amber-950/20 p-3 space-y-2">
            <div className="flex items-center gap-2 text-gold text-sm font-medium">
              <CalendarClock className="h-4 w-4" /> Datering av massakern — omtvistad
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Äldre uppskattning</span>
                <span className="text-foreground">~480 e.Kr.</span>
                <span className="text-xs text-muted-foreground">Typologi + myntens TPQ + Roms fall 476.</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">¹⁴C-datering (ny, starkare)</span>
                <span className="text-foreground">ca 500–540 e.Kr.</span>
                <span className="text-xs text-muted-foreground">29 dateringar, dietkorrigerade + Bayesiansk modellering (RJ P15-0138:1).</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Dateringen är omtvistad; den nyare ¹⁴C-baserade ligger senare än den äldre typologiska.
            </p>
          </div>

          <p className="text-xs text-muted-foreground mt-4 opacity-75">
            Datering enligt Kalmar läns museum (Victor et al., DiVA) samt RJ-projektet P15-0138:1. Koordinat och
            RAÄ-nummer verifierade i plattformens databas.
          </p>
        </CardContent>
      </Card>

      {/* Karta */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> Läge</CardTitle>
        </CardHeader>
        <CardContent>
          <SandbyBorgMap />
        </CardContent>
      </Card>

      {/* Undersökningsgrad — kontext HÖGST UPP innan tolkningar */}
      <Card className="viking-card mb-4 border-amber-900/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Layers className="h-5 w-5" /> Hur mycket är egentligen undersökt?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <p>
            Endast <strong>3 av borgens 53 georadar-kartlagda hus</strong> är helt undersökta — knappt
            <strong> 10 % av innerytan</strong> (läget efter 2017). Över <strong>90 % ligger orört</strong>.
            Allt nedan bygger på det lilla, men exceptionellt välbevarade, urvalet.
          </p>
          <p>
            <strong className="text-foreground">Hur många döda?</strong> Totalt har <strong>~26 individer</strong>{' '}
            påträffats (samtliga säsonger). Grävrapporten <em>Sandby borg VII</em> (2011–2015) redovisar minst{' '}
            <strong>14–15 döda i fyra hus</strong>, varav <strong>9 i det helt undersökta Hus 40</strong>. Siffrorna
            är inte motstridiga — de speglar olika stora urval som växer för varje säsong.
          </p>
          <p className="text-xs opacity-75">
            Källor: St. Fleur / NYT 2018; Current World Archaeology; Viberg et al. 2014 (georadar);
            Gunnarsson, Victor &amp; Alfsdotter 2016 (Sandby borg VII).
          </p>
        </CardContent>
      </Card>

      {/* Så var borgen organiserad — layout, maktcentrum, portar, kroppar, motiv */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Landmark className="h-5 w-5" /> Så var borgen organiserad — och vad det säger om motivet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Georadar visar en tydlig plan: ~36–37 hus <strong>radiellt längs ringmuren</strong> och ~16–17 hus i ett
            samlat <strong>centralkvarter</strong>. Din intuition stämmer — <strong>makten satt i mitten</strong>: där
            låg <strong>hallen (Hus 52)</strong> med högsäte, guldgömma och romerskt glas, omgiven av de hus där
            smyckedepåerna och glashantverket (Hus 4) fanns.
          </p>
          <p>
            <strong className="text-foreground">Men ingen kyrka.</strong> Borgen är <strong>förkristen (~500 e.Kr.)</strong> —
            kristendomen når Sverige först ~500 år senare. Jämförelsen med hansastaden Kalmar (kyrka, gillestuga och
            torg i mitten) är en <em>medeltida stadsmodell</em> och blir anakronistisk här. Folkvandringstidens
            motsvarighet till &quot;maktcentrum i mitten&quot; är just <strong>hövdingahallen</strong>: fest, politik, rit och
            högsäte i ett — inte kyrka/torg. Ringmuren + portarna är försvars- och mobiliseringsdelen, precis som du är inne på.
          </p>
          <p>
            <strong className="text-foreground">Portarna:</strong> tre säkra portöppningar (+ möjligen en fjärde).
            Huvudporten var troligen den i <strong>nordväst</strong>; de norra/nordvästra portarna vetter mot{' '}
            <strong>samtida grannbygder</strong> på fastsidan, medan <strong>sjöporten</strong> mot Östersjön kan ha lett till en hamn.
          </p>
          <p>
            <strong className="text-foreground">Var låg de döda?</strong> De begravdes aldrig utan blev liggande{' '}
            <em>där de föll</em> — <strong>inne i husen och utspridda på gatorna</strong> mellan dem. Av tre helt
            undersökta hus kommer ~15 individer, och ungefär lika många ur ben spridda i gaturummet. Folk dräptes
            alltså <em>runt om i borgen</em>, inte samlat vid en port — vilket talar emot en snabb, samlad reträtt mot en enda utgång.
          </p>
          <p>
            <strong className="text-foreground">Kom de sjövägen?</strong> Läget vid vattnet + sjöporten gör din
            hypotes rimlig att ställa. Men signaturen (guldet lämnat orört, döda obegravda, platsen tabu) och att{' '}
            <strong>segel saknas i Norden före ~700</strong> (farkosterna var rodda) pekar snarare mot en{' '}
            <strong>lokal/regional gärningsman</strong> — grannar eller rivaler över land eller kort rodd — än en
            fjärran sjöburen flotta. De inlandsvända portarna stärker det. <em>Öppen fråga.</em>
          </p>
          <p>
            <strong className="text-foreground">Romartidskopplingen som motiv?</strong> Borgen bär tydliga{' '}
            <strong>senromerska trådar</strong>: <strong>guldsolidi</strong> — en <strong>Valentinianus III</strong>{' '}
            (Ravenna, ~425–455) och en <strong>Leo I</strong> (präglad februari 457; från Åby-lokalen intill) —{' '}
            <strong>romerskt glas</strong>, och romerska mynt tolkade som <strong>sold till hemvända legosoldater</strong>{' '}
            ur romersk tjänst (~476, Västroms fall). Enligt Alfsdotter påträffades tidigt <em>två unga män med mynt</em>{' '}
            (den säkert åldersbedömde är Ind 1, ~17–19 år; parets exakta koppling är obelagd). Att kontrollera sådana
            exotiska kontakter var en <strong>maktbas</strong> → en rimlig del av <em>varför</em> borgen blev måltavla.
            Skändningen — <strong>djurtänder i de dödas munnar</strong> — tolkas som en hånfull förvrängning av den{' '}
            <strong>romerska seden att lägga ett mynt i den dödes mun</strong>. Allt detta är <em>tolkning</em>; själva motivet förblir obelagt.
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Källor: Viberg et al. 2014 (georadar — radial- + centralkvarter, portar); Wikipedia / Current World
            Archaeology (kroppar i hus + gata; portar mot grannbygd/hav); Gunnarsson, Victor &amp; Alfsdotter 2016.
            Kyrkfrånvaron = kronologi (förkristet ~500). &quot;Segel före ~700&quot; + lokal gärningsman = plattformens agent-syntes.
          </p>
        </CardContent>
      </Card>

      {/* De andra husen — varje hus sin berättelse (senare säsonger 2016–17) */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Layers className="h-5 w-5" /> De andra husen — glasverkstad och en hövding i hallen</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Mycket här kretsar kring <strong>Hus 40</strong> (det enda helt utgrävda 2015), men de andra undersökta
            husen berättar var sitt — och tillsammans tecknar de en <strong>rik, specialiserad</strong> boplats:
          </p>
          <ul className="space-y-2">
            <li>
              <strong className="text-foreground">Hus 4 — glashantverk.</strong> Här påträffades belägg för{' '}
              <strong>glaspärletillverkning och ädelmetallhantverk</strong>: pärlor gjorda av en yrkesperson <em>samt</em>{' '}
              klumpar av råglas — verkstadsindikatorer. Det tolkas som ett <strong>ovanligt tidigt glashantverk för
              Norden</strong> (rapporterat som ett av Sveriges äldsta). Utgrävt 2016; ~10 individer i och utanför huset.
            </li>
            <li>
              <strong className="text-foreground">Hus 52 — hallen.</strong> En hallbyggnad med en <strong>guldgömma
              och romerskt glas</strong>. Vid högsätet låg en <strong>äldre man (möjligen en hövding)</strong> som
              slagits ned med trubbigt våld mot huvudet och fallit in i den <em>ännu brinnande</em> härden.
            </li>
            <li>
              <strong className="text-foreground">Hus 40 — festmåltiden.</strong> Lammen, vävstolen och nio döda (se ovan).
            </li>
          </ul>
          <p>
            <strong className="text-foreground">Gav hantverket dem makt — och gjorde dem till måltavla?</strong> Att
            kontrollera <em>exotiskt</em> hantverk och import (glas, guld, romerska kontakter) var en reell{' '}
            <strong>maktbas</strong> i folkvandringstidens prestigevaruekonomi. Att borgen var rik och specialiserad är
            därför en rimlig del av <em>varför</em> den blev måltavla (tolkning) — en demonstrativ utplåning av en
            välmående konkurrent passar signaturen (guldet lämnat orört, döda obegravda, platsen tabu). Att däremot
            döden skulle bero på <strong>vidskepelse eller &quot;magiskt&quot; glas är ren motivspekulation</strong> — inte
            prövbart ur fynden. Glaset gav <em>social och politisk</em> makt, inte övernaturlig.
          </p>
          <p className="text-xs opacity-80">
            Källkritik: glasverkstaden och hallen kommer ur <strong>senare säsonger (2016–2017)</strong>, inte rapport VII
            (2015). &quot;Hövding&quot; och &quot;Sveriges äldsta glasverkstad&quot; är rapporterade bedömningar/tolkningar, inte slutbevis.
            Källor: Current World Archaeology; National Geographic; Kalmar läns museum (Sandby borg VIII–XI).
          </p>
        </CardContent>
      </Card>

      {/* Massakern */}
      <Card id="massakern" className="viking-card mb-4 scroll-mt-24">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><AlertTriangle className="h-5 w-5" /> Vad hände</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Kalmar läns museums undersökningar (från metallsökarfynd 2010 och grävningar därefter) visade att
            borgens invånare <strong>dödades och lämnades obegravda</strong> i och mellan husen — från spädbarn
            till åldringar. Kropparna blev liggande och husen städades eller återanvändes aldrig. Att ingen kom
            tillbaka för att begrava de döda eller bärga värdesaker är själva nyckeln: platsen tycks ha
            <strong> undvikits</strong> efteråt.
          </p>

          <p className="flex gap-2">
            <Users className="h-4 w-4 mt-0.5 shrink-0 text-gold/80" />
            <span>
              <strong className="text-foreground">Vilka var de döda?</strong> Osteologiskt bedömdes de döda
              som enbart män, men aDNA 2023 (Cell 186; 15 provtagna, 9 könsbestämda) visade
              <strong> 8 män och 1 kvinna</strong>, utan nära släktband och med sydskandinavisk härkomst.
            </span>
          </p>

          <p className="flex gap-2">
            <Swords className="h-4 w-4 mt-0.5 shrink-0 text-gold/80" />
            <span>
              <strong className="text-foreground">Skador och vapen.</strong> 8 av de undersökta (31 %) har
              perimortem trauma (skarpt, trubbigt och penetrerande); en 10–13-åring var halshuggen. Hugg
              ovanifrån och bakifrån, och nästan inga vapen på platsen &mdash; detta <em>tolkas</em> som en
              avrättning, inte en tvåsidig strid.
            </span>
          </p>

          <p className="flex gap-2">
            <CalendarClock className="h-4 w-4 mt-0.5 shrink-0 text-gold/80" />
            <span>
              <strong className="text-foreground">När på året?</strong> Slaktade lamm (3–6 mån) och en
              halväten strömming daterar händelsen till <strong>sen vår–tidig höst</strong>, populärt beskrivet
              som &quot;kring midsommar&quot;.
            </span>
          </p>

          <p>
            <strong className="text-foreground">Djuren.</strong> Djur (lamm, svin, häst) lämnades instängda
            och dog kvar.
          </p>

          <p>
            <strong className="text-foreground">Var platsen helt orörd?</strong> Inte riktigt. Hus 4 visar
            två faser: massakerlagret och en rivning ca 100 år senare — platsen var inte helt orörd efteråt,
            även om de döda aldrig begravdes.
          </p>

          <p className="text-xs bg-amber-950/20 border border-amber-900/30 rounded p-3">
            <strong className="text-gold">Belagt vs tolkning.</strong> Att individerna är obegravda, deras
            skador (perimortem trauma) och fyndkontexten är belagt (osteologi, aDNA, ¹⁴C). <em>Att</em> det var
            en riktad avrättning och <em>varför</em> borgen sedan lämnades är forskningens tolkning av fynden,
            inte ett dokumenterat händelseförlopp. Gärningsmän och motiv är okända.
          </p>
        </CardContent>
      </Card>

      {/* Den frusna festmåltiden — lammen (finds A7868) */}
      <Card className="viking-card mb-4 border-gold/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Utensils className="h-5 w-5" /> Den frusna festmåltiden</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Längst in i Hus 40 låg en behållare med <strong>minst åtta slaktade och styckade lamm</strong> (A7868). Att
            slakta så många djur på en gång är inte ett vardagsmål — det är en <strong>festmåltid under förberedelse</strong>{' '}
            (tolkning). Lammens ålder, <strong>3–6 månader</strong>, pekar dessutom mot att massakern skedde under{' '}
            <strong>sommarhalvåret</strong>.
          </p>
          <p>
            Lamm i sig var inte elitmat — får var det vanligaste husdjuret. Men <em>mängden</em>, tillsammans med borgens
            högstatusfynd (brännförgyllda silverspännen, en romersk guldsolidus, peltahänget), tecknar ett <strong>välbärgat
            samhälle mitt i förberedelsen av en fest</strong>. Det är just det som gör platsen så gripande: ögonblicksbilden
            fryser i sekunden <em>före</em> katastrofen — överflöd och liv, avbrutet av våld.
          </p>
          <p className="text-xs opacity-80">
            Källkritik: &quot;festmåltid&quot; och &quot;sommar&quot; är rapportens <strong>tolkningar</strong> (byggda på antalet lamm, deras
            ålder, den marginella styckningen och det avbrutna målet) — inte belagda som datum. Bittert eko: samma djurslag
            (får/get) återkommer i skändningen, med tänder instoppade i de dödas munnar (se rutan om geten nedan).
          </p>
        </CardContent>
      </Card>

      {/* Varför — hypotesmatris (falsifierbara hypoteser, ej motivspekulation) */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><ScanSearch className="h-5 w-5" /> Varför? Tre prövbara hypoteser</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            I stället för att gissa ett motiv prövar vi <strong>falsifierbara hypoteser</strong> mot fynden. Var
            och en kan stärkas eller falla på nya data.
          </p>
          <div className="space-y-2">
            <div className="rounded border border-amber-900/30 p-3">
              <p><strong className="text-foreground">(a) Intern maktkamp</strong> — <span className="text-gold">svagt belagd.</span> Inget i materialet pekar särskilt mot en uppgörelse inifrån.</p>
            </div>
            <div className="rounded border border-amber-900/50 bg-amber-950/20 p-3">
              <p><strong className="text-foreground">(b) Extern eller beordrad avrättning</strong> — <span className="text-gold">starkast stödd.</span> Effektivt och riktat våld, guld och kroppar lämnade kvar, och platsen tabubelagd efteråt.</p>
            </div>
            <div className="rounded border border-amber-900/30 p-3">
              <p><strong className="text-foreground">(c) Klimatkris 536</strong> — <span className="text-gold">kontext, ej bevis.</span> Ger en möjlig historisk ram men bevisar ingen orsak här. (Notera: om ¹⁴C-dateringen 500–540 håller ligger händelsen nära 536.)</p>
            </div>
          </div>
          <p className="text-xs bg-amber-950/20 border border-amber-900/30 rounded p-3">
            <strong className="text-gold">Prövad och avförd: slavtagning.</strong> Slavtagning som motiv prövas
            men avförs — hela befolkningen dödades (inklusive barn) och guldet lämnades kvar.
          </p>
          <p>
            <strong className="text-foreground">Sammanfattning.</strong> Att våldet var organiserat och riktat
            är väl underbyggt; vem och varför är olöst och förblir tolkning.
          </p>
        </CardContent>
      </Card>

      {/* Skatterna */}
      <Card id="skatter" className="viking-card mb-4 scroll-mt-24">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Coins className="h-5 w-5" /> De gömda skatterna</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            I husen har <strong>fem depåer</strong> av värdeföremål påträffats. De består mest av
            <strong> förgyllda silverspännen, ringar, pärlor och bjällror</strong> — delvis gömda under golv.
            Att dyrbarheterna aldrig hämtades ut stärker bilden av en plats som lämnades i hast och sedan undveks.
          </p>
          <p>
            <strong className="text-foreground">Guldmynten — enstaka, inte skatter.</strong> I borgen påträffades
            enstaka romerska guldmynt — bland annat ett i ett stolphål och ett i hus 52:s lilla guldgömma —
            <strong> inte myntskatter</strong>. De fem depåerna består alltså mest av föremål, inte mynt.
          </p>
          <p>
            <strong className="text-foreground">Hus 4.</strong> Hus 4 rymde en glas-/pärlverkstad med
            ädelmetallhantverk — glaspärletillverkningen dateras till <strong>slutet av 400-talet</strong> och är det{' '}
            <strong>äldsta säkert daterade belägget för glaspärletillverkning i Skandinavien</strong> (RAÄ Fornsök).
          </p>
          <p className="flex gap-2">
            <Coins className="h-4 w-4 mt-0.5 shrink-0 text-gold/80" />
            <span>
              <strong className="text-foreground">Hus 52.</strong> I hus 52 låg en äldre man och en liten
              guldgömma med ett romerskt guldmynt. Vilka funktioner enskilda hus hade (hall, verkstad, bostad)
              är <em>rapportberoende</em> och sekundärkällorna spretar — se de elva delrapporterna
              <em> KLM Sandby borg I–XI</em>.
            </span>
          </p>

          <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-3 space-y-2">
            <p className="text-foreground font-medium text-sm">Ölands guldhorisont — belagda tal</p>
            <p>
              <strong>Åby</strong> i Sandby socken (~80 solidi, TPQ 477) och <strong>Björnhovda</strong> i
              Torslunda (36 solidi, TPQ 476) rymmer <strong>Ölands två största soliduskatter</strong> — Ölands,
              inte Sveriges. Torslundaplåtarna är yngre (vendeltid) och hör inte till massakern.
            </p>
            <p className="text-xs">
              <strong className="text-gold">TPQ-fälla.</strong> Ett mynt daterar bara <em>tidigast möjliga</em>
              nedläggning; guldets yngsta mynt (~475–477) säger inget om massakern — om ¹⁴C-dateringen 500–540
              håller, ligger guldet en generation före.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* RAÄ Fornsök — gravfält under borgen + lök från 600-talet */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Layers className="h-5 w-5" /> Ett gravfält under borgen — och en lök från 600-talet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            <strong className="text-foreground">Byggd på de dödas mark.</strong> 2017 visade sig ett av husen i
            centralkvarteret delvis ligga <strong>ovanpå ett gravfält daterat 100–200 e.Kr.</strong> — ett par sekel
            innan borgen byggdes. Boplatsen restes alltså delvis över äldre gravar; om det var medvetet (anknytning
            till förfäder) eller likgiltigt är <em>obelagt</em>.
          </p>
          <p>
            <strong className="text-foreground">Övergavs — men glömdes inte helt.</strong> En <strong>förkolnad lök
            daterad till 600-talet</strong> visar att borgen <strong>besöktes efter övergivandet</strong> (vendel- och
            vikingatid), tillsammans med enstaka senare lösfynd. Den <em>återbeboddes</em> aldrig som borg (till
            skillnad från Eketorp) — men var inte helt bortglömd. Det passar bilden av en <em>laddad, delvis undviken</em> plats.
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Källa: RAÄ Fornsök <strong>L1956:3453</strong> (Sandby 45:1), Kalmar läns museum 2010–2018.{' '}
            <a href="https://app.raa.se/open/fornsok/lamning/d1f52dbc-317e-47a9-bf9c-ea7fca7dc9c7" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">öppna posten <ExternalLink className="h-3 w-3" /></a>
          </p>
        </CardContent>
      </Card>

      {/* Formen & anfallsvägarna — oval borg, portar, landskap */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Shield className="h-5 w-5" /> Formen och anfallsvägarna</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            <strong className="text-foreground">Oval — men ingen kapplöpningsbana.</strong> Borgen är oval (~120×90 m,
            NV–SÖ), och formen kan påminna om en arena. Men insidan var <strong>fullpackad med ~53 hus</strong> bakom en
            försvarsmur — det är en tätbebyggd <strong>ringborg</strong>, inte en öppen bana. Den ovala formen följer
            strandvallen och försvarslogiken, inte en ceremoniell ellips. (Öländsk hästkult hör snarare till{' '}
            <strong>Skedemosse</strong> — en annan plats och kontext.)
          </p>
          <p>
            <strong className="text-foreground">Vägen in.</strong> Borgen ligger på den flacka kustremsan —{' '}
            <strong>Stora Alvaret i väster, Östersjön i öster</strong>. Huvudporten i NV och den norra porten vetter mot{' '}
            <strong>grannbygderna på land</strong>; sjöporten mot havet. Att <em>smyga</em> på borgen är svårt — den
            öppna betesmarken ger föga skydd, så ett överfall byggde rimligen på <strong>mörker och snabbhet</strong>,
            inte på att gömma sig i terrängen. En lokal/regional styrka kunde komma <strong>längs kusten (N/S) eller
            över alvarkanten (V)</strong>.
          </p>
          <p className="text-xs opacity-80">
            Källkritik: de vägar/stråk som syns på moderna kartor är till stor del <strong>odaterade</strong> (RAÄ
            färdvägar) — inte säkert 400-tal. Anfallsvägen är därför en <strong>topografisk hypotes</strong>, inte
            belagd. Att gärningsmannen var lokal/regional (inte en fjärran sjöflotta) följer av signaturen + att segel
            saknas i Norden före ~700.
          </p>
        </CardContent>
      </Card>

      {/* Vår forskningsvinkel: läget/terrängen */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Mountain className="h-5 w-5" /> En kustringborg — inte en höjdborg</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Sandby borg skiljer sig från de klassiska öländska höjdborgarna. Terrängdata i plattformen visar att
            borgen ligger <strong>lågt och kustnära</strong> (ca 1 m ö.h., något lägre än omgivningen) på
            <strong> mager svallsediment och grus</strong> — den utnyttjar alltså inte höjdläge för sitt försvar,
            till skillnad från exempelvis Gråborg. Försvaret vilar i stället på den kraftiga <strong>ringmuren</strong>
            och det strandnära läget mot Östersjön.
          </p>
          <p>
            Det gör Sandby borg intressant i jämförelsen mellan Ölands fornborgar: samma ö, samma tid, men olika
            anläggningslogik — höjd och sikt hos vissa, mur och kustkontroll hos andra.
          </p>
          <p>
            <strong className="text-foreground">Anläggningen:</strong> oval, inneryta ~5000 m², med en kraftig kallmurad{' '}
            <strong>skalmur</strong> av kalksten (~8 m bred vid landporten, ~4 m mitt på sidorna, bevarad 1–3,5 m). Två
            portar — en <strong>landport</strong> och en <strong>sjöport</strong> mot Östersjön (möjligen en tredje mitt
            på norra sidan). I nordväst ett <strong>yttre försvarsverk</strong> av satta stenar (≥150 m långt) och en
            sötvattenkälla strax utanför. Innanför murarna låg uppskattningsvis <strong>~54 radiellt ställda hus</strong>{' '}
            kring ett centralkvarter — jämförbart med Eketorp-II (53 hus).
          </p>
          <p className="text-xs opacity-75">
            Terrängvärdena är härledda ur höjdmodell (elevation/relativ höjd) och SGU:s jordartsdata, samplade mot
            borgens verifierade koordinat — inte uppskattade. Strukturmåtten: Gunnarsson, Victor &amp; Alfsdotter 2016
            (Sandby borg VII).
          </p>
        </CardContent>
      </Card>

      {/* Forensik som metod */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Microscope className="h-5 w-5" /> Forensik som metod</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Sandby borg har undersökts med uttalat <strong>forensisk arkeologi och osteoarkeologi</strong> samt
            <strong> 3D-dokumentation</strong> (Alfsdotter m.fl.). Metoden lånar begrepp från brottsplatsundersökning
            men landar i arkeologiska slutsatser — och den skiljer noga på observation och tolkning.
          </p>
          <ul className="space-y-2">
            <li>
              <strong className="text-foreground">Perimortem, postmortem och tafonomi.</strong> Skador
              <em> kring</em> dödsögonblicket (perimortem) skiljs från sådant som skedde <em>efter</em> döden
              (postmortem) och från nedbrytnings- och lagringsprocesser i marken (tafonomi). Bara det första
              säger något direkt om våldet.
            </li>
            <li>
              <strong className="text-foreground">Traumamorfologi → vapenklass.</strong> Ett huggmärkes form
              kan antyda <em>klass</em> av redskap (skarpt/trubbigt/penetrerande) som en
              <strong> differentialbedömning</strong> — en rangordning av möjligheter, inte en dom om ett
              specifikt vapen.
            </li>
            <li>
              <strong className="text-foreground">Brottsplatsen som spatialt dataset.</strong> Var kroppar,
              föremål och djur låg i förhållande till varandra behandlas som mätdata — läge och kontext bär
              lika mycket information som föremålen själva.
            </li>
            <li>
              <strong className="text-foreground">Observation skiljs från tolkning.</strong> &quot;Halshuggen
              10–13-åring&quot; är en observation; &quot;avrättning&quot; är en tolkning. Sidan håller isär dem
              genomgående.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Undersökningen bakom — crowdfunding, kadaverhund, forensikern */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Microscope className="h-5 w-5" /> Undersökningen bakom fynden</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            <strong className="text-foreground">Folkfinansierad grävning.</strong> 2015 års säsong — totalundersökningen
            av Hus 40 — bekostades genom en <strong>crowdfunding-kampanj på Kickstarter</strong> (dec 2014): 387 givare
            världen över samlade in <strong>465 619 kr</strong>. Enligt Kalmar läns museum den första crowdfundade
            arkeologiska undersökningen i Skandinavien (oberoende källor är försiktigare — &quot;en av de första&quot; / första i Sverige).
          </p>
          <p>
            <strong className="text-foreground">Kadaverhund i fält.</strong> Den certifierade arkeologihunden{' '}
            <strong>Fabel</strong> (tränad av Sophie Vallulv) användes för att lokalisera dolda människoben före
            grävning — en metod under utveckling; markeringarna mättes in och jämfördes mot de faktiska fynden.
          </p>
          <p>
            <strong className="text-foreground">Forensisk arkeolog.</strong> Osteologin leds av <strong>Clara Alfsdotter</strong>,
            forensisk arkeolog som till vardags arbetar inom rättsväsendet — en expertroll som kan kallas in vid
            brottsmisstanke för att läsa hur skelett och mark påverkats. Samma verktyg som på en modern brottsplats,
            applicerade på ett ~1 500-årigt fall.
          </p>
          <p className="text-xs opacity-75">
            Källor: Gunnarsson, Victor &amp; Alfsdotter 2016 (Sandby borg VII); Kickstarter &quot;Unveiling the Sandby borg massacre&quot;;
            intervju med Clara Alfsdotter (Per Grankvist, 2024).
          </p>
        </CardContent>
      </Card>

      {/* AI-forntidsforensikern — transparens */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Bot className="h-5 w-5" /> AI-forntidsforensikern</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            För transparensens skull: en <strong>AI-agent (en forntida forensiker)</strong> har gått igenom
            materialet källkritiskt som <strong>utrednings- och granskningsunderlag</strong>. Arbetssättet är
            <strong> människa-i-loopen</strong> — AI:n föreslår och strukturerar, en människa verifierar mot
            källa och beslutar.
          </p>
          <p>
            Dödsorsak, uppsåt och gärningsman redovisas alltid som <strong>tolkning med angiven konfidens</strong>,
            aldrig som ett &quot;löst fall&quot;. Där belägg saknas står det obelagt.
          </p>
          <p className="text-muted-foreground">
            Läs mer: <Link to="/ai-agenter" className="text-gold hover:underline">AI-agenterna</Link>{' '}
            och <Link to="/sv/vetenskapsmetodik" className="text-gold hover:underline">vår vetenskapsmetodik</Link>.
          </p>
        </CardContent>
      </Card>

      {/* Tre AI-agenters samlade fynd (forensiker + osteolog + marinarkeolog), källkritiskt */}
      <Card className="viking-card mb-4 border-gold/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><ScanSearch className="h-5 w-5" /> Vad de tre agenterna fann — belagt vs hypotes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p className="text-xs opacity-80">
            Forntidsforensiker, osteolog och marinarkeolog har gått igenom fallet källkritiskt mot vår data + publikationerna
            (Alfsdotter &amp; Kjellström 2019; Alfsdotter, Papmehl-Dufay &amp; Victor 2018). Osteologin är strukturerad i{' '}
            <code>osteology_observations</code>. Människa-i-loopen — inga tvärsäkra domar.
          </p>
          <ul className="space-y-2">
            <li><strong className="text-foreground">Tid på dygnet:</strong> <span className="text-slate-300">ej avgörbart</span> — härd/måltidsrester bär inte klockslag. <em>(Säsong går: sen vår–tidig höst, ur lamm 3–6 mån + avbrutet mål.)</em></li>
            <li><strong className="text-foreground">Antal angripare:</strong> <span className="text-slate-300">ej inferbart</span> — bara &quot;organiserad väpnad grupp&quot;. Varje siffra = spekulation.</li>
            <li><strong className="text-foreground">Land eller sjö:</strong> signaturen (kroppar kvar, guld gömt men aldrig hämtat, platsen tabu) pekar mot en <strong>lokal/regional gärningsman</strong>, ej en fjärran sjörövarflotta. Sista sträckan land/sjö = <em>olöst</em>.</li>
            <li><strong className="text-foreground">Segelbåtar ~500?</strong> Nej — nordiskt segel belagt först ~700-tal; farkosterna var <strong>rodda</strong>. Inget marinarkeologiskt stöd för sjövägen hit (ingen led före 700, inget folkvandringsvrak, ingen östkusthamn nära borgen).</li>
            <li><strong className="text-foreground">Mordvapen:</strong> eggvapen (svärd/kniv, ev. yxa) + trubbigt; <strong>halshuggning</strong> av en 10–13-åring; slag <em>bakifrån/ovanifrån</em>, inga försvarsskador → nedhuggna, värnlösa. Inga pilspetsar i ben.</li>
            <li><strong className="text-foreground">Kult / &quot;Jonestown&quot; / rituellt?</strong> Kultledarledd frivillig massdöd <strong>faller</strong> — förgiftning lämnar inga benspår, men här finns hugg-/trubbtrauma. Däremot en <em>symbolisk</em> dimension: <strong>får-/gettänder instoppade i munnen</strong> på vissa döda (postmortem, tolkas som hån), och guldet lämnat orört (ingen plundring → utplåning/bestraffning, ej rovdrift).</li>
            <li><strong className="text-foreground">Vilka:</strong> hela bosättningen (spädbarn→äldre). Osteologiskt kön = bara män, men aDNA visar minst en kvinna (snb018) → &quot;bara män&quot; är metodartefakt.</li>
          </ul>
          <p className="text-xs opacity-80">
            Dateringen förblir omtvistad (~480 typologi/numismatik vs ~500–540 ¹⁴C) och redovisas som öppen fråga.
            Full metod: <Link to="/ai-agenter" className="text-gold hover:underline">AI-agenterna</Link>.
          </p>
        </CardContent>
      </Card>

      {/* Per-individ forensik ur DB (forensic_individuals) — Hus 40 */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Bone className="h-5 w-5" /> Individerna i Hus 40 — forensisk översikt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Individ för individ (Sandby borg VII 2016), <strong>sorterad yngst→äldst</strong>. Traumaklassen är en
            forensisk differentialbedömning — inte en dom om ett specifikt vapen; kolumnen <em>Tolkning</em> är
            uttryckligen tolkning, inte fakta.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Åldersprofilen talar.</strong> De döda spänner från <strong>spädbarn
            (1,5–3 mån) till äldre vuxna</strong> — bara en handfull i <em>stridbar ålder</em>. Det var en <strong>hel
            bosättning med familjer</strong>, inte en garnison krigare; inga försvarsskador och hugg bakifrån/ovanifrån
            pekar mot <strong>avrättning av värnlösa</strong> (tolkning). Högst i status: <strong>hövdingen(?) i hallen</strong> (Hus 52).
          </p>
          <ForensicIndividualsTable />
          <p className="text-[11px] text-muted-foreground/70">
            Källa: Gunnarsson, Victor &amp; Alfsdotter 2016 (Sandby borg VII, Kalmar läns museum). Strukturerat i{' '}
            <code>forensic_individuals</code> — spädbarnet (Ind 25) är starkaste belägget för att kvinnor fanns i borgen.
          </p>
        </CardContent>
      </Card>

      {/* Peltahänget med runlika tecken → runologisk krok */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><span className="text-lg leading-none">ᚱ</span> Runlika tecken på peltahänget</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Bland fynden i Hus 40 finns ett <strong>peltaformat hänge i silver</strong> (F7151, 2015) med ristade{' '}
            <strong>runliknande tecken</strong>. Runologen <strong>Magnus Källström</strong> bedömer dem som ett{' '}
            <strong>medvetet runförsök — men inget läsbart ord</strong>. Det är alltså ingen inskrift att översätta,
            utan (tolkning) någon som imiterade runraden.
          </p>
          <p className="text-xs opacity-80">
            Källkritik: &quot;runförsök&quot; är Källströms bedömning; att tecknen skulle bära en betydelse är obelagt.
            Peltahängen är kända från bl.a. Uppåkra och Sösdala. Läs mer om{' '}
            <Link to="/sv/runor" className="text-gold hover:underline">runorna och futharken</Link>.
          </p>
        </CardContent>
      </Card>

      {/* Getsymbolik — källkritik: håll isär fornnordisk kontext från anakronistisk djävuls-läsning */}
      <Card className="viking-card mb-4 border-amber-600/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-300"><ScrollText className="h-5 w-5" /> Geten som symbol — och varför tänderna INTE är &quot;djävulen&quot;</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Att får-/gettänder lades i munnen på <strong>minst två av de döda</strong> (en med <strong>fyra gettänder</strong>;
            åtminstone en var en äldre man), postmortem, tolkas som en <strong>rituell förnedring/avhumanisering</strong> —
            att behandla de dräpta <em>som boskap</em>. Det är en <strong>tolkning</strong>; den djupare innebörden är obelagd. Vad det{' '}
            <strong>inte</strong> är: en koppling till &quot;geten som djävulen&quot;.
          </p>
          <p>
            <strong className="text-foreground">Anakronism-varning:</strong> get = ondska/djävul är en <strong>kristen och senare</strong> föreställning
            (Matt 25 &quot;fåren och getterna&quot;; syndabocken i 3 Mos 16; djävulens hornade/bockbenta bild lånar från antikens Pan/satyr).
            Sandby borg är <strong>förkristet (~500 e.Kr.)</strong> — den symboliken fanns inte här.
          </p>
          <p>
            I den <strong className="text-foreground">fornnordiska</strong> horisonten var geten tvärtom <strong>positiv</strong>: Tors bockar
            Tanngnjóstr &amp; Tanngrisnir (slaktas, äts och återuppstår ur skinnen) och Heidrún i Valhall = <strong>näring, fruktbarhet, förnyelse</strong>
            (Snorres Edda). En get vid Sandby pekar alltså mot Tor/näring — inte mot ondska.
          </p>
          <p className="text-xs opacity-80">
            <strong>Folktro att avfärda (ej belägg):</strong> att kyrkan &quot;demoniserade den gamla religionens hornade gud&quot; bygger på Margaret Murrays
            förkastade häxkult-tes; Wiccas &quot;hornade gud&quot; är ett 1900-talskonstrukt. Baphomet med gethuvud är modernt (Éliphas Lévi 1856), och
            tempelriddarnas &quot;get-dyrkan&quot; (1300-tal) räknas som framtvingade tortyrbekännelser. Inget av detta hör till Sandby.
          </p>
        </CardContent>
      </Card>

      {/* Relaterat på plattformen */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><ScrollText className="h-5 w-5" /> Utforska vidare</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="text-muted-foreground">
            <Link to="/sv/oland" className="text-gold hover:underline">Öland — vägnät och centralplatser</Link>{' '}
            · de andra öländska fornborgarna (Eketorp, Gråborg, Ismantorp, Bårby, Triberga) och{' '}
            <Link to="/explore?center=56.55253,16.63926&zoom=12" className="text-gold hover:underline">borglagret på kartan</Link>.
          </p>
          <p className="text-muted-foreground">
            Öns skriftliga guldhorisont: <Link to="/sv/runor" className="text-gold hover:underline">runstenarna</Link>,
            däribland Karlevistenen.
          </p>
        </CardContent>
      </Card>

      {/* Forskning & fördjupning — akademiska referenser om man vill läsa mer */}
      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><BookOpen className="h-5 w-5" /> Forskning &amp; fördjupning</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p className="text-muted-foreground leading-relaxed">
            Sandby borg har grävts systematiskt av Kalmar läns museum sedan 2010-talet och resultaten är
            publicerade. Vill du läsa mer på djupet:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <span className="text-foreground">Alfsdotter, C., Papmehl-Dufay, L. &amp; Victor, H. (2018).</span>{' '}
              <em>A moment frozen in time: evidence of a late fifth-century massacre at Sandby borg.</em>{' '}
              Antiquity 92:362, 421–436. — massakerns kontext och tolkning.
            </li>
            <li>
              <span className="text-foreground">Alfsdotter, C. &amp; Kjellström, A. (2019).</span>{' '}
              <em>The Sandby borg massacre: interpersonal violence and the demography of the dead.</em>{' '}
              European Journal of Archaeology 22:2. — trauma och demografi.
            </li>
            <li>
              <span className="text-foreground">Alfsdotter, C. (2019).</span>{' '}
              <em>An Osteological and Forensic Anthropological Study of the Sandby Borg Massacre.</em>{' '}
              Bioarchaeology International 3:4. — forensisk-osteologisk metod.
            </li>
            <li>
              <span className="text-foreground">Rodríguez-Varela, R. m.fl. (2023).</span>{' '}
              <em>The genetic history of Scandinavia …</em> Cell 186:1. — aDNA (kön, släktskap, härkomst).
            </li>
            <li>
              <span className="text-foreground">Riksbankens Jubileumsfond — slutrapport P15-0138:1.</span>{' '}
              ¹⁴C-dateringar (dietkorrigerade + Bayesiansk modellering).
            </li>
            <li>
              <span className="text-foreground">Forskningsprogrammet &quot;Kris, konflikt och klimat 300–700&quot;</span>{' '}
              (2023–2030) — pågående syntes.
            </li>
            <li>
              <span className="text-foreground">Gunnarsson, F., Victor, H. &amp; Alfsdotter, C. (2016).</span>{' '}
              <em>Sandby borg VII. Undersökningar 2015.</em> Sandby borgs skrifter 7. Kalmar läns museum.
              ISBN 978-91-982366-7-5. — totalundersökningen av Hus 40 (fyndredovisning, human- och animalosteologi).
            </li>
            <li>
              Kalmar läns museums delrapporter <em>Sandby borg I–XI</em> (2011–) med fyndredovisning —{' '}
              <a href="https://www.diva-portal.org/smash/resultList.jsf?query=Sandby+borg" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">
                sök &quot;Sandby borg&quot; i DiVA <ExternalLink className="h-3 w-3" />
              </a>.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground opacity-75">
            Referenser för fördjupning — verifiera aktuell utgåva och sidhänvisning hos utgivaren/DiVA.
          </p>
        </CardContent>
      </Card>

      {/* Källor & läs mer (utlänkning med attribuering) */}
      <Card className="viking-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><ExternalLink className="h-5 w-5" /> Källor &amp; besöksinfo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="space-y-2">
            <li>
              <a href="https://kalmarlansmuseum.se" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">
                Kalmar läns museum <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-muted-foreground"> — arkeologisk undersökare (datering, osteologi, fynd).</span>
            </li>
            <li>
              <a href="https://app.raa.se/open/fornsok/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">
                Riksantikvarieämbetet — Fornsök <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-muted-foreground"> — sök fornlämning <strong>Sandby 45:1</strong>.</span>
            </li>
            <li>
              <a href="https://sv.wikipedia.org/wiki/Sandby_borg" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">
                Wikipedia — Sandby borg <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-muted-foreground"> — översikt med referenser <em>(ej auktoritativ)</em>.</span>
            </li>
            <li>
              <a href="https://www.oland.se/sandby-borg" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">
                oland.se — Sandby borg <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-muted-foreground"> — besöksinformation, öppettider, guidningar <em>(ej auktoritativ)</em>.</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3 opacity-75">
            Fakta på denna sida är belagda i plattformens databas eller hos angivna källor. Tolkningar (massaker,
            övergivning) är märkta som sådana. Länkar går till respektive källa; texten är vår egen.
          </p>
        </CardContent>
      </Card>
    </main>
    <Footer />
  </div>
  );
};

export default SandbyBorg;
