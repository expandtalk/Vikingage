import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Anchor, Crown, ScrollText, Info, AlertTriangle, MapPin, Ship } from 'lucide-react';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { MapLegend } from '@/components/map/MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';

// /sv/staket — forskningssida om Mälaren som havsvik ~1000 e.Kr. och frågan om var Olav
// Haraldssons seglats 1007–08 ägde rum (Almarestäket kontra Norrström/Stockholm).
// Strandlinjen är DEM-härledd (Copernicus GLO-30 + projektets paleo_rsl, 4,7 mm/år i Mälardalen
// → havet ~+5 m år 950). Kurerade platser på VERIFIERADE koordinater (Wikipedia/Fornsök/place_names).
// Hederlighet: Sandéns Stäket-tes redovisas som HYPOTES jämte den traditionella Stockholm-tolkningen.

// Vidgad västerut (17.38) så de centrala Mälaröarna (Adelsö/Björkö/Kurön/Ridön) hamnar i den
// rekonstruerade havsviken — poängen med sidan (de var öar när Mälaren var en vik).
const MALAREN_BBOX: [number, number, number, number] = [17.38, 59.18, 18.80, 59.72];

interface Site {
  name: string; lat: number; lng: number; kind: 'royal' | 'sound' | 'fort' | 'city' | 'island' | 'holme';
  note: string; todayM?: number;
}
// Verifierade koordinater (Wikipedia P625 / Upplandsmuseet / place_names). Ingen gissning.
const SITES: Site[] = [
  { name: 'Fornsigtuna (Signhildsberg)', lat: 59.6236, lng: 17.6528, kind: 'royal', todayM: 13.2,
    note: 'Kungsgård vid Håtunaviken, vendel–vikingatid. Namnet ("gamla Sigtuna") övertogs av staden Sigtuna ~980. RAÄ L2016:1229 m.fl.' },
  { name: 'Sigtuna (stad ~980)', lat: 59.6173, lng: 17.7236, kind: 'royal', todayM: 8.7,
    note: 'Rikets första stad, anlagd ~980 av Erik Segersäll. Strandstad vid samma vik.' },
  { name: 'Stäksundet', lat: 59.4808, lng: 17.7950, kind: 'sound', todayM: 4.5,
    note: 'Det smala sundet — sagans "Stocksund … smalare än mången å". Enda utloppet för Svitjods vårflod.' },
  { name: 'Almarestäkets borg', lat: 59.4686, lng: 17.7936, kind: 'fort',
    note: 'S:t Eriks slott / Biskoparnas borg vid sundet — "kastali var fire vestan sundit" (väster om sundet), som sagan säger.' },
  { name: 'Stockholm / Gamla stan', lat: 59.325, lng: 18.064, kind: 'city',
    note: 'Anlagt ~1250. Vid Olavs tid ett brett, förgrenat sundsystem — inte ett enda smalt sund.' },
  { name: 'Telge hus (Ragnhildsborg)', lat: 59.2181, lng: 17.6100, kind: 'fort',
    note: 'Borg i Linasundet, Södertälje — låset för den södra sjövägen (Himmerfjärden) in i Mälaren.' },
  // Mälaröarna — land som stack upp som öar när Mälaren var en havsvik. Koordinater ur Isof
  // ortnamnsregistret / Fornsök (verifierade). Ingen gissning.
  { name: 'Adelsö (Hovgården)', lat: 59.3654, lng: 17.5205, kind: 'island',
    note: 'Kungsö i Mälaren; Hovgården var Birka-kungarnas gård (Alsnö hus, Alsnö stadga 1280). Isof / Fornsök.' },
  { name: 'Björkö (Birka)', lat: 59.3355, lng: 17.5460, kind: 'island',
    note: 'Ö med handelsstaden Birka (~750–970), Sveriges första stad. Isof / Fornsök.' },
  { name: 'Munsö', lat: 59.3977, lng: 17.5667, kind: 'island',
    note: 'Ö i Färentuna härad; medeltida rundkyrka. Belägg 1533 (Isof).' },
  { name: 'Kurön', lat: 59.3201, lng: 17.4895, kind: 'island',
    note: 'Ö i Mälaren väster om Adelsö. Isof.' },
  { name: 'Ridön', lat: 59.3312, lng: 17.4135, kind: 'island',
    note: 'Ö i Mälaren (Strängnäs kommun). Isof.' },
  { name: 'Lovön', lat: 59.3310, lng: 17.8260, kind: 'island',
    note: 'Ö i Färentuna härad (Lovö sn); senare Drottningholm. Isof.' },
  { name: 'Kungshatt', lat: 59.3008, lng: 17.8929, kind: 'island',
    note: 'Ö i Mälaren (Lovö sn); äldre form Kongshatt. Isof.' },
  { name: 'Kärsön', lat: 59.3205, lng: 17.9195, kind: 'island',
    note: 'Ö vid Drottningholm/Ekerö, öster om Lovön. Isof.' },
  { name: 'Krankholmen', lat: 59.3130, lng: 17.9290, kind: 'island',
    note: 'Liten holme i Mälaren vid Kärsön/Grönvik — mellersta Mälaren, ej innerstad. Isof.' },
  { name: 'Björnholmen', lat: 59.3108, lng: 17.9427, kind: 'island',
    note: 'Liten holme i Mälaren nära Kärsön. Isof.' },
  { name: 'Fläsket', lat: 59.3044, lng: 17.9327, kind: 'island',
    note: 'Skär/holme i Mälaren vid Skärholmen. Isof.' },
  // Norrström-sidan: holmar i Stockholms breda, förgrenade innersund — den geografi som gör
  // den traditionella Norrström-tolkningen (ett ENDA smalt utlopp) svår. Isof (verifierade koord).
  { name: 'Reimersholme', lat: 59.3182, lng: 18.0228, kind: 'holme',
    note: 'Holme vid Södermalm i Stockholms förgrenade innersund. En av flera holmar som visar att utloppet vid Gamla stan var brett och grenat — inte ett enda smalt sund. Isof.' },
  { name: 'Årsta holmar', lat: 59.3072, lng: 18.0443, kind: 'holme',
    note: 'Holmar i Årstaviken, del av Stockholms förgrenade innersund. Isof.' },
];
const KIND: Record<Site['kind'], { color: string; label: string }> = {
  royal: { color: '#d4a63c', label: 'Kungsgård / stad' },
  sound: { color: '#38bdf8', label: 'Sund (sagans Stocksund)' },
  fort: { color: '#b45309', label: 'Borg / spärr' },
  city: { color: '#94a3b8', label: 'Senare stad' },
  island: { color: '#6b8f71', label: 'Mälarö (Isof)' },
  holme: { color: '#7c9cb5', label: 'Innerstadsholme (Norrström-sidan)' },
};

const KIND_KEYS = Object.keys(KIND) as Site['kind'][];

const StaketMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const groupsRef = useRef<Record<string, L.LayerGroup>>({});
  const [shoreYear, setShoreYear] = useState<number | null>(950);
  useShorelineOverlay(mapRef, shoreYear, 'get_paleo_shorelines_dem', MALAREN_BBOX);

  // Återanvändbar legend: en togglebar grupp per platstyp + baskarta.
  const LEGEND: LegendLayerDef[] = [
    ...KIND_KEYS.map((k) => ({ key: k, label: KIND[k].label, color: KIND[k].color, defaultOn: true })),
    { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap' as const, defaultOn: true },
  ];
  const { enabled, toggle } = useMapLegendState(LEGEND);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [59.47, 17.92], zoom: 10, scrollWheelZoom: true });
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    KIND_KEYS.forEach((k) => { groupsRef.current[k] = L.layerGroup(); });
    const pts: [number, number][] = [];
    SITES.forEach((s) => {
      const c = KIND[s.kind].color;
      const royal = s.kind === 'royal';
      pts.push([s.lat, s.lng]);
      L.circleMarker([s.lat, s.lng], {
        radius: royal ? 8 : 6, color: c, weight: 2, fillColor: c, fillOpacity: royal ? 0.5 : 0.65,
      })
        .bindTooltip(s.name, { permanent: royal, direction: 'top', offset: [0, -8], className: 'ang-clabel' })
        .bindPopup(`<b>${s.name}</b><br/><span style="font-size:11px">${s.note}</span>${s.todayM != null ? `<br/><span style="font-size:10px;color:#888">höjd idag ${s.todayM} m ö.h.</span>` : ''}`)
        .addTo(groupsRef.current[s.kind]);
    });
    mapRef.current = map;
    // Inzoomad på noderna (fitBounds) i st.f. en fast utzoomad vy.
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 12 });
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Baskarta på/av
  useEffect(() => {
    const map = mapRef.current, tile = tileRef.current;
    if (!map || !tile) return;
    if (enabled.osm) { if (!map.hasLayer(tile)) tile.addTo(map); }
    else if (map.hasLayer(tile)) map.removeLayer(tile);
  }, [enabled.osm]);

  // Togglar per platstyp enligt legenden
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    KIND_KEYS.forEach((k) => {
      const g = groupsRef.current[k];
      if (!g) return;
      if (enabled[k]) { if (!map.hasLayer(g)) map.addLayer(g); }
      else if (map.hasLayer(g)) map.removeLayer(g);
    });
  }, [enabled]);

  return (
    <div>
      <div className="hidden sm:block">
        <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} />
      </div>
      <div className="relative">
        {/* Mobil: flytande strandlinje-kontroll (frigör kartytan) — inline på desktop ovan. */}
        <div className="sm:hidden absolute left-2 top-16 z-[1105]">
          <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} variant="floating" />
        </div>
        <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 520 }} />
        <MapLegend defs={LEGEND} enabled={enabled} onToggle={toggle} mapRef={mapRef} />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span style={{ width: 12, height: 3, background: '#38bdf8', display: 'inline-block' }} /> blå yta = hav vid vald tid</span>
      </div>
    </div>
  );
};

const Staket = () => (
  <div className="min-h-screen viking-bg">
    <PageMeta
      title="Stäket och Mälaren — var seglade Olav den helige 1007?"
      titleEn="Stäket and Lake Mälaren — where did St Olav sail in 1007?"
      description="Forskningssida om Mälaren som havsvik omkring år 1000 och frågan om Olav Haraldssons seglats 1007–08 ägde rum vid Almarestäket eller vid Norrström i Stockholm. DEM-härledd strandlinje (Copernicus GLO-30 + landhöjning) visar landskapet vid ~5 m högre havsnivå."
      descriptionEn="Research page on Lake Mälaren as a sea bay around AD 1000 and the debate over whether St Olav's 1007–08 voyage took place at Almarestäket or at Norrström in Stockholm. A DEM-derived shoreline (Copernicus GLO-30 + land uplift) reconstructs the landscape at ~5 m higher sea level."
      keywords="Stäket, Almarestäket, Mälaren, Olav den helige, Stocksund, Sigtuna, Fornsigtuna, landhöjning, strandförskjutning, Börje Sandén, vikingatid, Långhundraleden"
    />
    <Header />
    <Breadcrumbs />
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Ship className="h-8 w-8 text-gold" />
          Stäket och Mälaren — var seglade Olav 1007?
        </h1>
        <p className="text-gold/90 text-sm font-medium mb-3">Mälaren som havsvik, och sagans smala Stocksund</p>
        <p className="text-muted-foreground text-lg">
          För tusen år sedan var hela nuvarande Mälaren en <strong>vik av havet</strong>. Landet har sedan dess
          höjts omkring <strong>5 meter</strong> (i Mälardalen ~4,7 mm/år). Reglaget nedan höjer havet till dåtidens
          nivå så du ser vilket land som stack upp. Det gör en gammal stridsfråga testbar: seglade Olav Haraldsson
          ("den helige") ut på havet vid <strong>Almarestäket</strong> — eller vid <strong>Norrström</strong> i det
          som blev Stockholm?
        </p>
      </div>

      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> Mälaren vid dåtida havsnivå</CardTitle>
        </CardHeader>
        <CardContent>
          <StaketMap />
          <p className="text-xs text-muted-foreground mt-2 opacity-75">
            Strandlinjen är <strong>härledd ur höjddata</strong> (Copernicus DEM GLO-30, ~30 m) tröskad mot projektets
            landhöjningsmodell (<code>paleo_rsl</code>, 4,7 mm/år, kontrollpunkt "Mälaren", konfidens hög). Vid år 950
            stod havet ~+4,9 m. Öar återges som hål i vattnet. De namngivna <strong>Mälaröarna</strong> (Adelsö, Björkö/Birka,
            Munsö, Kurön, Ridön, Lovön, Kungshatt, Kärsön; koordinater ur Isof) visar vilket land som stack upp.
            Reglaget växlar mellan tidsskivorna.
          </p>
        </CardContent>
      </Card>

      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><ScrollText className="h-5 w-5" /> Stridsfrågan: Stäket eller Norrström?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            Sagan (Snorres Särskilda saga / Heimskringla) berättar att Olav blev instängd i ett vatten i Svitjod och
            kom ut på havet genom ett <em>Stocksund</em> som var "smalare än mången å" — det <strong>enda</strong>
            utloppet, där vårfloden forsade. Den <strong>traditionella</strong> tolkningen (sedan Rudbeck på 1600-talet)
            är att detta är <strong>Norrström</strong> i Stockholm. Hembygdsforskaren <strong>Börje Sandén</strong> (UKF)
            har argumenterat för att det i stället är <strong>Stäksundet</strong> vid Almarestäket.
          </p>
          <p className="text-xs">Höjddatan gör argumenten prövbara. Vad den visar vid ~+5 m havsnivå:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Almarestäket är en smal midja</strong> mellan norra bassängen (Skarven/Håtunaviken) och söder — förenligt med sagans smala Stocksund.</li>
            <li><strong>Gamla stan låg i ett brett, förgrenat sundsystem</strong> (flera 1–2 km breda sund) — svårare att förena med ett <em>enda smalt</em> utlopp. Holmarna på Norrström-sidan (Reimersholme, Årsta holmar) markerar just denna förgrening.</li>
            <li>Höjdkoll: Fornsigtuna 13 m och Sigtuna 9 m = land ovan stranden; <strong>Almarestäket 4,5 m = vid själva vattenlinjen</strong> (dvs ett sund), som tesen kräver.</li>
          </ul>
          <p className="text-xs opacity-80">
            <strong>Detta bevisar inte saken</strong> — det visar att Stäket-tolkningen är geografiskt möjlig och att den
            traditionella Norrström-tolkningen har en verklig svårighet (bredden). Frågan är fortsatt omtvistad bland forskare.
          </p>
        </CardContent>
      </Card>

      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Anchor className="h-5 w-5" /> Sjövägarna in i Mälaren</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
          <p>När Mälaren var en havsvik fanns flera farleder från Östersjön in mot Birka, Sigtuna och Uppsala:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Stäket-leden</strong> — norrut via det smala Stäksundet, förbi Almarestäkets spärr, in i Skarven.</li>
            <li><strong>Södertälje / Himmerfjärden</strong> — den södra, skyddade leden; låstes av Telge hus (Ragnhildsborg) i Linasundet.</li>
            <li><strong>Långhundraleden</strong> — den östra vattenvägen (Åkersberga–Garnsviken–Vada) mot Uppsala, i dag delvis torrlagd av landhöjningen.</li>
          </ul>
          <p className="opacity-80">Exakta ruttlinjer ritas inte ut här — de kräver verifierade waypoints. Noderna ovan är däremot koordinatsatta.</p>
        </CardContent>
      </Card>

      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /> Fornsigtuna → Sigtuna: centralorten flyttar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
          <p>
            <strong>Fornsigtuna</strong> (Signhildsberg) var den äldre <em>kungsgården</em> vid Håtunaviken, med anor i
            vendel–vikingatid. När kung Erik Segersäll ~980 anlade den nya <strong>staden Sigtuna</strong> 4 km österut
            övertogs namnet ("Forn-Sigtuna" = gamla Sigtuna) och vissa funktioner. Ett återkommande mönster:
            <strong> en gammal maktnod ersätts av en ny, och de gamla namnen/vägarna byts ut</strong> — jämför Kalmar,
            där Husbyvägen (mellan slottet och kyrkan) ersattes av Kungsvägen.
          </p>
          <p className="opacity-80">Samma kungsgård är scenen för <strong>Håtunaleken 1306</strong>, statskuppen då hertigarna Erik och Valdemar grep sin bror kung Birger.</p>
        </CardContent>
      </Card>

      <Card className="viking-card mb-4 border-amber-600/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Förbehåll (redovisade)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1 text-xs">
          <p>• <strong>Copernicus DEM är en ytmodell</strong> — hus/skog kan läsas som mark; inne i stadskärnan är strandlinjen ungefärlig.</p>
          <p>• <strong>Ingen batymetri</strong> — metoden kan inte gå under dagens havsyta, och modern utfyllnad visas som land.</p>
          <p>• <strong>Vertikalt datum</strong> (EGM2008) skiljer sig någon decimeter från RH2000; landhöjningen är en linjär förstaordningsmodell.</p>
          <p>• <strong>Sandéns Stäket-tes är en hypotes</strong>, inte konsensus — sidan visar geografin, inte en dom.</p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Höjd: Copernicus DEM GLO-30 © ESA (fri/CC-BY). Landhöjning: projektets <code>paleo_rsl</code> (SGU-kalibrerad). Koordinater: Wikipedia (P625), RAÄ Fornsök, Upplandsmuseets rapport 2022:15, <code>place_names</code>, Isof ortnamnsregistret. Tolkningsdiskussion: Börje Sandén / UKF (ukforsk.se) samt Nils Ahnlund, <em>Stockholms historia före Gustav Vasa</em>. Metoden delas med <a href="/sv/kalmar" className="text-gold hover:underline">Kalmar-sidan</a>.</span>
      </p>
    </main>
    <Footer />
  </div>
);

export default Staket;
