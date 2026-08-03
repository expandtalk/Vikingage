import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cross, Church, Ship, Waves, MapPin, AlertTriangle, Info, Anchor } from 'lucide-react';

// /sv/sankt-olof — tvärgående tema om Olav den helige (Olav Haraldsson, †Stiklestad 1030): kult,
// kyrkoruin, seglingen genom Mälaren, offerkällor och Nidaros som gravkyrka/pilgrimsmål.
// Hederlighet: helgonkult och legend redovisas SOM sådana; kung Olof Skötkonung hålls isär från
// helgonet; Olsan-härledningen (Kalmar) avfärdas som folketymologi. Koordinater verifierade.

interface Node {
  name: string; lat: number; lng: number; kind: 'shrine' | 'ruin' | 'spring' | 'sound' | 'church';
  note: string;
}
// Verifierade koordinater (Wikipedia P625 / christian_sites / religiousPlacesData). Ingen gissning.
const NODES: Node[] = [
  { name: 'S:t Olofs kyrkoruin, Sigtuna', lat: 59.6183611, lng: 17.7212, kind: 'ruin',
    note: 'Ruin av romansk gråstenskyrka invigd till S:t Olof; grundmurar från 1000-talets mitt gör den till en av Nordens äldsta stenkyrkor. Käll-/brunnshus med hagioskåp. Runstenen U 385 i ruinen.' },
  { name: 'Sigtuna', lat: 59.6173, lng: 17.7236, kind: 'church',
    note: 'Enligt S:t Olofslegenden passerade Olav Haraldsson Sigtuna på återvägen från Gårdarike (Kiev-Rus) till Norge. Legend — märkt som sådan.' },
  { name: 'Stäksundet (Mälaren)', lat: 59.4808, lng: 17.7950, kind: 'sound',
    note: 'Sagans smala "Stocksund" där Olav enligt Heimskringla seglade ut på havet 1007–08. Se den egna Stäket-sidan.' },
  { name: 'Sankt Olofs källa, Skokloster', lat: 59.7333, lng: 17.6333, kind: 'spring',
    note: 'Kristnad hednisk offerkälla helgad åt Sankt Olof (Uppland).' },
  { name: 'Sankt Olofs källa, Själevad', lat: 63.1500, lng: 18.5667, kind: 'spring',
    note: 'Kristnad offerkälla helgad åt Sankt Olof (Ångermanland) — visar kultens räckvidd norrut.' },
  { name: 'Källa gamla kyrka, Öland', lat: 57.1113694, lng: 16.9863389, kind: 'church',
    note: 'Källa socken har namn efter en offerkälla helgad åt S:t Olof, sjöfararnas helgon, vid en av Ölands viktigaste vikingatida hamnar.' },
  { name: 'Nidaros (Nidarosdomen), Trondheim', lat: 63.4269, lng: 10.3969, kind: 'shrine',
    note: 'Olavs gravkyrka. Efter slaget vid Stiklestad 1030 blev Nidaros Nordens största pilgrimsmål (Sankt Olavs skrin).' },
];
const KIND: Record<Node['kind'], { color: string; label: string }> = {
  shrine: { color: '#d4a63c', label: 'Gravkyrka / pilgrimsmål' },
  ruin: { color: '#b45309', label: 'Kyrkoruin (helgad åt S:t Olof)' },
  spring: { color: '#3f7f93', label: 'Offerkälla helgad åt S:t Olof' },
  sound: { color: '#38bdf8', label: 'Sund (Mälaren-seglingen)' },
  church: { color: '#a24b4b', label: 'Kyrka / ort i legenden' },
};

const OlofMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    NODES.forEach((n) => {
      const c = KIND[n.kind].color;
      const big = n.kind === 'shrine' || n.kind === 'ruin';
      L.circleMarker([n.lat, n.lng], { radius: big ? 8 : 6, color: c, weight: 2, fillColor: c, fillOpacity: big ? 0.55 : 0.65 })
        .bindTooltip(n.name, { permanent: big, direction: 'top', offset: [0, -8], className: 'ang-clabel' })
        .bindPopup(`<b>${n.name}</b><br/><span style="font-size:11px">${n.note}</span>`)
        .addTo(layer);
    });
    map.fitBounds(L.latLngBounds(NODES.map((n) => [n.lat, n.lng] as [number, number])).pad(0.15));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div>
      <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 520 }} />
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
        {Object.values(KIND).map((k) => (
          <span key={k.label} className="inline-flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, borderRadius: 9999, background: k.color, display: 'inline-block' }} /> {k.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const SanktOlof = () => (
  <div className="min-h-screen viking-bg">
    <PageMeta
      title="Sankt Olof — kult, kyrkor och pilgrimsvägar i Norden"
      titleEn="Saint Olav — cult, churches and pilgrim routes in the North"
      description="Tvärgående tema om Olav den helige (Olav Haraldsson, fallen vid Stiklestad 1030): S:t Olofs kyrkoruin i Sigtuna, seglingen genom Mälaren, offerkällor helgade åt honom och Nidaros som gravkyrka och pilgrimsmål. Med källkritik: helgonkult och legend märks som sådana, och kung Olof Skötkonung hålls isär från helgonet."
      descriptionEn="A cross-cutting theme on Saint Olav (Olav Haraldsson, fallen at Stiklestad 1030): the St Olof church ruin in Sigtuna, the voyage through Lake Mälaren, holy springs dedicated to him, and Nidaros as his shrine and pilgrimage destination. With source criticism throughout."
      keywords="Sankt Olof, Olav den helige, Olav Haraldsson, Nidaros, Stiklestad, S:t Olofs kyrkoruin, Sigtuna, offerkälla, sjöfararhelgon, pilgrim, kult"
    />
    <Header />
    <Breadcrumbs />
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Cross className="h-8 w-8 text-gold" />
          Sankt Olof — helgonet över Norden
        </h1>
        <p className="text-gold/90 text-sm font-medium mb-3">Olav Haraldsson: kung, missionär, sjöfararnas helgon</p>
        <p className="text-muted-foreground text-lg">
          <strong>Olav Haraldsson</strong>, Norges kung, föll i slaget vid <strong>Stiklestad den 29 juli 1030</strong> och
          vördades snart som helgon — <strong>Olav den helige</strong>. Hans kult blev en av de starkaste i Norden och
          satte spår i landskapet långt utanför Norge: kyrkor invigda i hans namn, källor helgade åt honom, och
          pilgrimsvägar mot hans grav i Nidaros. Den här sidan knyter ihop de spåren — och skiljer belagd historia
          från legend.
        </p>
      </div>

      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> S:t Olof i landskapet</CardTitle>
        </CardHeader>
        <CardContent>
          <OlofMap />
          <p className="text-xs text-muted-foreground mt-2 opacity-75">
            Kurerade noder på verifierade koordinater (Wikipedia P625, projektets <code>christian_sites</code> och
            offerkälle-data). Kartan spänner från Öland till Nidaros — kultens faktiska räckvidd.
          </p>
        </CardContent>
      </Card>

      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Church className="h-5 w-5" /> S:t Olofs kyrkoruin i Sigtuna</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
          <p>
            Ruinen av den <strong>S:t Olof</strong>-invigda gråstenskyrkan i Sigtuna döljer en sensation: undersökningar
            2001–2004 påvisade äldre grundmurar med en murkonstruktion som i Norden bara förekommer vid
            <strong> 1000-talets mitt</strong> (jämförbar med Helgakorskyrkan i Dalby, ca 1060) — vilket gör den till
            <strong> en av Nordens äldsta kända stenkyrkor</strong>.
          </p>
          <p>
            Vid södra kormuren finns ett litet fristående <strong>käll-/brunnshus i sten</strong> med ett
            <em> hagioskåp</em> — en öppning för att från kyrkorummet se en förmodad <strong>helig källa</strong> knuten
            till S:t Olofskulten; det enda kända tidigmedeltida käll- och brunnshuset i sten i Norden. I ruinen står
            runstenen <strong>U 385</strong>. Långhusets grundmurar löper ut under dagens Olofsgata; kyrkan kan ha
            påbörjats som en biskopskyrka men bygget avbröts — troligen när biskopssätet flyttade till Gamla Uppsala på
            1130-talet.
          </p>
          <p className="opacity-80">Källa: Svenska kyrkan Sigtuna; Tesch 2006; Wikström 2006; Ros 2009.</p>
        </CardContent>
      </Card>

      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Ship className="h-5 w-5" /> Seglingen genom Mälaren</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
          <p>
            Innan han blev helgon var Olav en vikingahövding. <strong>Heimskringla</strong> berättar att han 1007–08 blev
            instängd i Mälaren (då en havsvik) och seglade ut på havet genom ett smalt "Stocksund". Var det hände är
            omtvistat — <strong>Norrström i Stockholm</strong> (traditionellt) eller <strong>Stäksundet</strong> (Sandéns
            tes). Vi har en egen sida som prövar frågan mot en DEM-härledd strandlinje:
            {' '}<a href="/sv/staket" className="text-gold hover:underline">Stäket och Mälaren →</a>.
          </p>
          <p className="opacity-80">
            Enligt S:t Olofslegenden passerade Olav också Sigtuna på återvägen från Gårdarike (Kiev-Rus). Det är en
            <strong> legenduppgift</strong>, inte ett belägg — märkt som sådan.
          </p>
        </CardContent>
      </Card>

      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Waves className="h-5 w-5" /> Kulten och offerkällorna</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
          <p>
            Som <strong>sjöfararnas helgon</strong> fick S:t Olof en stark ställning längs kusterna och vattenvägarna.
            Ett återkommande drag är att <strong>äldre heliga källor kristnades och helgades åt honom</strong> — belagt
            bl.a. i <strong>Skokloster</strong> (Uppland) och <strong>Själevad</strong> (Ångermanland). På Öland gav en
            S:t Olofskälla socknen <strong>Källa</strong> dess namn, vid en av öns viktigaste vikingatida hamnar.
          </p>
          <p className="opacity-80">Kult- och källuppgifter bygger på kyrkliga/arkeologiska källor och redovisas som traditions- och kultbelägg, inte som naturvetenskaplig datering.</p>
        </CardContent>
      </Card>

      <Card className="viking-card mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold"><Anchor className="h-5 w-5" /> Nidaros — gravkyrka och pilgrimsmål</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
          <p>
            Olav gravlades i <strong>Nidaros</strong> (Trondheim), och över hans grav restes den kyrka som blev
            <strong> Nidarosdomen</strong>. Skrinet gjorde staden till <strong>Nordens största pilgrimsmål</strong> under
            medeltiden, målet för leder från hela Skandinavien.
          </p>
        </CardContent>
      </Card>

      <Card className="viking-card mb-4 border-amber-600/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Källkritik (redovisad)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1 text-xs">
          <p>• <strong>Helgonet ≠ kungen Olof Skötkonung.</strong> Sveriges Olof Skötkonung (dopet i Husaby, tidigt 1000-tal) är en annan person — sammanblandas lätt eftersom båda hette Olof och verkade samtidigt.</p>
          <p>• <strong>"Olsan" i Kalmar &lt; "S:t Olofs vik" — avfärdat.</strong> Onomastiskt osannolikt (ett <em>vik</em>-efterled ger <em>-viken</em>, inte <em>-an</em>); ingen S:t Olofskult belagd vid Stensö. En traditionsuppgift/folketymologi, inte ett belägg.</p>
          <p>• <strong>Legend vs historia.</strong> Sagornas seglats och legendens Sigtuna-passage är berättelser; kyrkoruinen, källorna och Nidaros-graven är däremot belagda platser.</p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Källor: Svenska kyrkan Sigtuna (S:t Olofs ruin); Tesch 2006 (Hikuin 33); Wikström 2006; Ros 2009 (OPIA 45); Snorre Sturlasson, <em>Heimskringla</em>; projektets <code>christian_sites</code> och offerkälle-data. Koordinater: Wikipedia (P625) och verifierade DB-poster. Se även <a href="/sv/staket" className="text-gold hover:underline">Stäket och Mälaren</a>.</span>
      </p>
    </main>
    <Footer />
  </div>
);

export default SanktOlof;
