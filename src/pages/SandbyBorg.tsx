import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MapPin, Coins, AlertTriangle, ScrollText, ExternalLink, Landmark, Mountain, BookOpen, Microscope, Bot, Users, Swords, CalendarClock, Layers, ScanSearch } from 'lucide-react';

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
    const map = L.map(containerRef.current, { preferCanvas: true, center: [LAT, LNG], zoom: 13, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    L.circleMarker([LAT, LNG], { radius: 9, color: '#7c2d12', weight: 3, fillColor: '#d4a63c', fillOpacity: 0.9 })
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
        Ölands sydöstra kust, mot Östersjön. Koordinat verifierad i databasen (RAÄ Sandby 45:1) —
        ej ur minnet. <Link to={`/explore?center=${LAT},${LNG}&zoom=15`} className="text-gold hover:underline">Öppna i utforskaren →</Link>
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
          <p className="text-xs opacity-75">
            Källor: St. Fleur / NYT 2018; Current World Archaeology; Viberg et al. 2014 (georadar).
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
            <strong className="text-foreground">Hus 4.</strong> Hus 4 rymde Sveriges äldsta kända
            glas-/pärlverkstad med ädelmetallhantverk.
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
          <p className="text-xs opacity-75">
            Terrängvärdena är härledda ur höjdmodell (elevation/relativ höjd) och SGU:s jordartsdata, samplade mot
            borgens verifierade koordinat — inte uppskattade.
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

      {/* Getsymbolik — källkritik: håll isär fornnordisk kontext från anakronistisk djävuls-läsning */}
      <Card className="viking-card mb-4 border-amber-600/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-300"><ScrollText className="h-5 w-5" /> Geten som symbol — och varför tänderna INTE är &quot;djävulen&quot;</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Att får-/gettänder lades i munnen på vissa döda (postmortem) tolkas som en <strong>rituell förnedring/avhumanisering</strong> —
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
