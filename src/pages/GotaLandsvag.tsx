import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Route as RouteIcon, ScrollText, Info, AlertTriangle, MapPin, Footprints, Landmark } from 'lucide-react';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/gota-landsvag — forskningssida + utflyktsmål om Göta landsväg, den medeltida landsvägen
// Stockholm–Södertälje över Södertörn. Sträckningen speglar road_waypoints i DB (9 verifierade
// punkter + approximativa ändpunkter). Koordinater: ecclesiastical_sites (kyrkor), runkorpus
// (Sö 300/304, Rundata), sv.wikipedia (Årstafältet/Flottsbro), RAÄ (Botkyrka 389:1). Endpoints approx.

const CORRIDOR_BBOX: [number, number, number, number] = [17.55, 59.15, 18.15, 59.35];

type Kind = 'endpoint' | 'bridge' | 'thing' | 'rune' | 'church';
interface Node { name: string; lat: number; lng: number; kind: Kind; note: string; }

// Vägordning N→S (mirror av road_waypoints + start/slut). Verifierade koordinater.
const NODES: Node[] = [
  { name: 'Skanstull (start, approx.)', lat: 59.3045, lng: 18.0765, kind: 'endpoint',
    note: 'Vägens infart mot Södermalm/Stockholm. Ändpunkt approximativ.' },
  { name: 'Årstafältet – Valla å', lat: 59.2907, lng: 18.0450, kind: 'bridge',
    note: 'Bäst bevarade sträckan (RAÄ Brännkyrka 34:1), ~730 m över fältet; korsade Valla å (rekonstruerad stenvalvbro 1998). Band samman järnåldersgårdarna Valla/Bägersta och Östberga/Ersta.' },
  { name: 'Brännkyrka kyrka', lat: 59.28194, lng: 18.02306, kind: 'church',
    note: 'Medeltida sockenkyrka. Brännkyrka socken låg i Svartlösa härad t.o.m. 1913.' },
  { name: 'Glömstahällen (Sö 300)', lat: 59.2347, lng: 17.9146, kind: 'rune',
    note: '"Sverker lät göra bron efter Ärengunn, sin goda moder" — ett brobyggnadsmonument som daterar vägen över den sanka Glömstadalen till minst 1000-talet. RAÄ Huddinge 24:1.' },
  { name: 'Flottsbro (flottbron)', lat: 59.23139, lng: 17.88083, kind: 'bridge',
    note: 'Smalaste sundet mellan Albysjön och Tullingesjön; resande fördes över på en flottbro. Använd till 1660-talet; vägen flyttades 1669 till Fittjanäset.' },
  { name: 'Svartlötens tingsplats', lat: 59.2400, lng: 17.83639, kind: 'thing',
    note: 'Häradsting för Svartlösa härad (RAÄ Botkyrka 389:1), vid Alby/Hallunda. Ligger idag delvis under E4/E20 — därför löper vägen här parallellt med motorvägen. Föregångaren kallades Tingsvägen just för att den ledde hit.' },
  { name: 'Botkyrka kyrka', lat: 59.23908, lng: 17.81839, kind: 'church',
    note: 'Medeltidskyrka i S:t Botvid-miljön (härifrån Botkyrkamonumentet Sö 286). Ungefär halvvägs Stockholm–Södertälje — ofta första dagsetappen.' },
  { name: 'Salems kyrka', lat: 59.21852, lng: 17.77046, kind: 'church',
    note: 'Medeltida sockenkyrka; vägen viker sedan förbi Aspen och öster/söder om Bornsjön.' },
  { name: 'Bornsjön – Oxelbystenen (Sö 304)', lat: 59.2339, lng: 17.6941, kind: 'rune',
    note: 'Vägen gick öster/söder om Bornsjön, förbi Söderby fornminnesområde; här står runstenen Oxelbystenen.' },
  { name: 'Sankta Ragnhilds kyrka', lat: 59.1985, lng: 17.6261, kind: 'church',
    note: 'Efter en sväng sydväst norr om sjön Tullan kom vägen in i Södertälje från öster, ca ett kvarter söder om kyrkan, och slutade vid Stora Torget.' },
  { name: 'Södertälje – Stora Torget (slut, approx.)', lat: 59.1955, lng: 17.6253, kind: 'endpoint',
    note: 'Vägens södra ände vid Tälje-näset — den obligatoriska passagen mellan Mälaren och Östersjön. Ändpunkt approximativ.' },
];

const KIND: Record<Kind, { color: string; label: string }> = {
  endpoint: { color: '#94a3b8', label: 'Ändpunkt (approx.)' },
  bridge: { color: '#38bdf8', label: 'Bro / vadställe' },
  thing: { color: '#d4a63c', label: 'Tingsplats' },
  rune: { color: '#b45309', label: 'Runsten (brobygge)' },
  church: { color: '#7b3f00', label: 'Medeltidskyrka' },
};

const GotaLandsvagMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [shoreYear, setShoreYear] = useState<number | null>(null);
  useShorelineOverlay(mapRef, shoreYear, 'get_paleo_shorelines_dem', CORRIDOR_BBOX);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [59.245, 17.84], zoom: 11, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    const layer = L.layerGroup().addTo(map);

    // Väglinjen genom noderna
    L.polyline(NODES.map((n) => [n.lat, n.lng] as [number, number]), {
      color: '#d4a63c', weight: 3, opacity: 0.85, dashArray: '6 6',
    }).addTo(layer);

    NODES.forEach((n) => {
      const c = KIND[n.kind].color;
      L.circleMarker([n.lat, n.lng], { radius: 6, color: c, weight: 2, fillColor: c, fillOpacity: 0.7 })
        .bindTooltip(n.name, { direction: 'top', offset: [0, -8], className: 'ang-clabel' })
        .bindPopup(`<b>${n.name}</b><br/><span style="font-size:11px">${n.note}</span>`)
        .addTo(layer);
    });

    map.fitBounds(L.latLngBounds(NODES.map((n) => [n.lat, n.lng] as [number, number])), { padding: [30, 30] });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div>
      <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} />
      <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 520 }} />
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
        {Object.values(KIND).map((k) => (
          <span key={k.label} className="inline-flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, borderRadius: 9999, background: k.color, display: 'inline-block' }} /> {k.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5"><span style={{ width: 16, height: 3, background: '#d4a63c', display: 'inline-block' }} /> Göta landsväg (~31,9 km)</span>
      </div>
    </div>
  );
};

const GotaLandsvag = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Göta landsväg — medeltida landsvägen Stockholm–Södertälje"
        titleEn="Göta landsväg — the medieval highroad Stockholm–Södertälje"
        description="Forskningssida och utflyktsmål om Göta landsväg, den medeltida landsvägen från Skanstull över Södertörn till Södertälje. Sträckning med 9 verifierade hållpunkter — Årstafältet, Glömstahällen (Sö 300), Flottsbro, Svartlötens tingsplats, Botkyrka kyrka — och dess föregångare Tingsvägen."
        descriptionEn="Research page and excursion on Göta landsväg, the medieval highroad from Skanstull across Södertörn to Södertälje. Route with 9 verified waypoints — Årstafältet, the Glömsta rune ledge (Sö 300), Flottsbro, the Svartlöten assembly site, Botkyrka church — and its predecessor Tingsvägen."
        keywords="Göta landsväg, Tingsvägen, Svartlöten, Svartlösa härad, Årstafältet, Glömstahällen, Sö 300, Flottsbro, Botkyrka, Södertälje, medeltida vägar, Södertörn, utflykt"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <RouteIcon className="h-8 w-8 text-gold" />
            Göta landsväg
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Den medeltida landsvägen Stockholm–Södertälje över Södertörn</p>
          <p className="text-muted-foreground text-lg">
            Göta landsväg var medeltidens landsväg från <strong>Skanstull</strong> över Södertörn mot
            Götalandskapen. Före Stockholm fanns här den forntida <strong>Tingsvägen</strong> som ledde till{' '}
            <strong>Svartlötens tingsplats</strong>; när staden grundades på 1250-talet infogades den i
            tillfartsvägen och kom att kallas Göta landsväg. Vägen är ~31,9 km; vid Botkyrka kyrka var man
            ungefär halvvägs — ofta första dagsetappen.
          </p>
        </div>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> Sträckningen</CardTitle>
          </CardHeader>
          <CardContent>
            <GotaLandsvagMap />
            <p className="text-xs text-muted-foreground mt-2 opacity-75">
              Nio verifierade hållpunkter (kyrkor ur <code>ecclesiastical_sites</code>, runstenar ur runkorpusen,
              Årstafältet/Flottsbro ur sv.wikipedia, Svartlöten ur RAÄ Botkyrka 389:1). Start-/slutpunkter approximativa.
              Reglaget kan lägga på en <strong>paleo-strandlinje</strong> — vid vikingatida havsnivå var stråket delvis vattenland.
            </p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><ScrollText className="h-5 w-5" /> Tingsväg → Göta landsväg</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Namnet minner om att vägens föregångare ledde till <strong>Svartlötens</strong> tingsplats vid Alby/Hallunda i
              norra Botkyrka (RAÄ Botkyrka 389:1) — häradstinget för <strong>Svartlösa härad</strong>. När Stockholm
              grundades på 1250-talet blev tingsvägen stadens infartsväg söderifrån och fick namnet Göta landsväg.
            </p>
            <p>
              Vid <strong>Glömsta</strong> bekräftar runhällen <strong>Sö 300</strong> ("lät göra bron") att vägen över den
              sanka Glömstadalen är minst från 1000-talet — ett typiskt vikingatida väghållningsmonument. Vid{' '}
              <strong>Flottsbro</strong> fördes resenärer över det smalaste sundet mellan Albysjön och Tullingesjön på en
              flottbro, fram till 1660-talet.
            </p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Landmark className="h-5 w-5" /> Landskapet: sprickdalsterräng och landhöjning</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
            <p>
              Hela stråket är klassisk sprickdalsterräng — bergsryggar (Östberga, Solberga, Tullingeberg) med lerdalar och
              våtmarker emellan. Vägen klättrar på ryggarna och tvingas ner i dalarna bara där den måste korsa vatten
              (Valla å, Glömstadalen) — och det är just där brostenarna sitter.
            </p>
            <p>
              Under vikingatiden var Mälaren ännu en <strong>havsvik</strong>; landhöjningen slöt den till insjö först på
              1100–1200-talet. Göta landsväg som <em>landväg</em> hör därför i grunden till medeltiden — den tar över när
              vattenvägen (Birkas era) sluts. Reglaget på kartan visar strandlinjen vid dåtida havsnivå.
            </p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Footprints className="h-5 w-5" /> Hållpunkter längs vägen</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
              {NODES.filter((n) => n.kind !== 'endpoint').map((n) => (
                <li key={n.name}>
                  <span className="text-foreground font-medium">{n.name}</span> — <span className="text-xs">{n.note}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Förbehåll (redovisade)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1 text-xs">
            <p>• <strong>Start-/slutpunkter (Skanstull, Södertälje) är approximativa</strong> — endast mellanpunkterna är koordinatverifierade.</p>
            <p>• <strong>Långsjön/Korkskruven</strong> är utelämnad som hållpunkt tills en verifierad koordinat finns (den bracketas av Brännkyrka kyrka och Glömsta).</p>
            <p>• Paleo-strandlinjen är DEM-härledd (Copernicus GLO-30 + landhöjningsmodell) och ungefärlig i stadskärnan.</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Källor: sv.wikipedia (Gamla Göta landsväg, Svartlöten, Svartlösa härad, Årstafältet, Flottsbro); RAÄ Botkyrka 389:1 & Brännkyrka 34:1 (Fornsök); Stockholms läns museum; runkorpus (Rundata, Sö 300/286/304). Strandlinjemetoden delas med <a href="/sv/staket" className="text-gold hover:underline">Stäket-sidan</a>.</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default GotaLandsvag;
