import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MapPin, Coins, AlertTriangle, ScrollText, ExternalLink, Landmark, Mountain, BookOpen } from 'lucide-react';

// /sv/sandby-borg — forskningssida + utflyktsmål om Sandby borg, ringborgen på sydöstra Öland
// där en massaker ca 480 e.Kr. lämnade de dödade obegravda och platsen övergiven.
//
// KÄLLKRITIK: alla hårda fakta nedan är belagda i vår DB (swedish_hillforts, "Sandby borg"):
//   koordinat (16.63926,56.55253) → 56.55253/16.63926, RAÄ Sandby 45:1, Sandby sn/Mörbylånga,
//   datering folkvandringstid 400–550 + massaker ca 480 (dating_basis "14C + massakerfynden",
//   dating_confidence "belagd", dating_source "Kalmar läns museum; Victor et al. (DiVA)"),
//   fort_function "defense", terräng (elevation ~1,16 m, rel_height −1,77 m, on_height=false,
//   jordart "Svallsediment, grus", bördighet "mager" — samplat 2026-08-04).
// Massaker/tabu-övergivning = TOLKNING ur fynden (Kalmar läns museum) — märkt som sådan.

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
      title="Sandby borg — ringborgen på Öland där tiden stannade ~480 e.Kr."
      titleEn="Sandby borg — the Öland ring fort frozen at ~480 AD"
      description="Forskningssida om Sandby borg på sydöstra Öland (RAÄ Sandby 45:1). En folkvandringstida ringborg där en massaker ca 480 e.Kr. lämnade de dödade obegravda och platsen övergiven — med gömda skatter av förgyllda spännen och romerska guldmynt. Belagd datering, källkritik och läge."
      descriptionEn="Research page on Sandby borg, a Migration-Period ring fort on south-eastern Öland (RAÄ Sandby 45:1). A massacre around 480 AD left the dead unburied and the fort abandoned — with hidden hoards of gilded brooches and Roman gold coins. Sourced dating, source criticism and location."
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
        <p className="text-gold/90 text-sm font-medium mb-3">Ringborgen på sydöstra Öland där tiden stannade omkring 480 e.Kr.</p>
        <p className="text-muted-foreground text-lg">
          Sandby borg är en <strong>folkvandringstida ringborg</strong> vid Ölands sydöstra kust. Vid en
          arkeologisk undersökning påträffades <strong>obegravda människor liggande där de föll</strong> —
          husen återbeboddes aldrig, och borgen lämnades orörd. Fynden gör platsen till ett av Sveriges
          mest omtalade järnåldersfynd: en nedfrusen ögonblicksbild av en katastrof omkring år 480.
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
            <Fact label="Datering">Folkvandringstid, ca 400–550 e.Kr.</Fact>
            <Fact label="Katastrofen">Massaker ca 480 e.Kr.</Fact>
            <Fact label="Dateringsgrund">¹⁴C + massakerfynden (belagd)</Fact>
          </div>
          <p className="text-xs text-muted-foreground mt-4 opacity-75">
            Datering enligt Kalmar läns museum (Victor et al., DiVA). Koordinat och RAÄ-nummer verifierade i
            plattformens databas.
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

      {/* Massakern */}
      <Card id="massakern" className="viking-card mb-4 scroll-mt-24">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><AlertTriangle className="h-5 w-5" /> Vad hände</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Kalmar läns museums undersökningar (från metallsökarfynd 2010 och grävningar därefter) visade att
            borgens invånare <strong>dödades och lämnades obegravda</strong> i och mellan husen — från spädbarn
            till åldringar. Kropparna blev liggande, djur släpptes eller dog kvar, och husen städades eller
            återanvändes aldrig. Att ingen kom tillbaka för att begrava de döda eller bärga värdesaker är själva
            nyckeln: platsen tycks ha <strong>undvikits</strong> efteråt.
          </p>
          <p className="text-xs bg-amber-950/20 border border-amber-900/30 rounded p-3">
            <strong className="text-gold">Belagt vs tolkning.</strong> Att individerna är obegravda och att
            dateringen ligger kring 480 e.Kr. är belagt (osteologi, ¹⁴C, fyndkontext). <em>Att</em> det var en
            massaker och <em>varför</em> borgen sedan lämnades — övergrepp, hämnd, tabu — är forskningens
            tolkning av fynden, inte ett dokumenterat händelseförlopp. Gärningsmän och motiv är okända.
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
            I husen har depåer av värdeföremål påträffats — bland annat <strong>förgyllda reliefspännen</strong>,
            guldringar, glaspärlor och <strong>romerska guldmynt (solidi)</strong>, delvis gömda under golv. Att
            dyrbarheterna aldrig hämtades ut stärker bilden av en plats som lämnades i hast och sedan undveks.
            Solidi-fynden knyter Sandby borg till Ölands påfallande rika guldhorisont under folkvandringstid —
            samma sammanhang som öns övriga skattfynd.
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
          <p className="text-xs opacity-75">
            Terrängvärdena är härledda ur höjdmodell (elevation/relativ höjd) och SGU:s jordartsdata, samplade mot
            borgens verifierade koordinat — inte uppskattade.
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
              Antiquity 92:362. — osteologin och tolkningen av massakern.
            </li>
            <li>
              Kalmar läns museums undersökningsrapporter (2011–) med fyndredovisning och dateringar —{' '}
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
              <span className="text-muted-foreground"> — översikt med referenser.</span>
            </li>
            <li>
              <a href="https://www.oland.se/sandby-borg" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">
                oland.se — Sandby borg <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-muted-foreground"> — besöksinformation (öppettider, guidningar).</span>
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
