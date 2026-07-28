import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChristianizationChart } from '@/components/ChristianizationChart';
import { MapPin, Route, AlertTriangle, Compass } from 'lucide-react';
import { useOlandModel, type OlandPoint } from '@/hooks/useOlandModel';

// Öland-modellen — forskningssida. Testar hypotesen om vikingatidens vägnät och
// centralplatser via runstenar, fornborgar, guldfynd, Frö-namn och kyrkor. Imperativ
// Leaflet (samma mönster som ExcursionsMap → undviker react-leaflet-versionskrångel).

const KIND_STYLE: Record<string, { color: string; radius: number; label: string }> = {
  runestone: { color: '#ef4444', radius: 3, label: 'Runsten' },
  church: { color: '#64748b', radius: 3, label: 'Kyrka' },
  hillfort: { color: '#1e3a8a', radius: 5, label: 'Fornborg' },
  fro_name: { color: '#a855f7', radius: 5, label: 'Frö-namn' },
  find: { color: '#d4af37', radius: 6, label: 'Guld-/silverfynd' },
  cult: { color: '#14b8a6', radius: 5, label: 'Kult/offerplats' },
};

// Förbindelser (kurerat, schematiskt — Öland definieras av sina länkar till fastland + Gotland).
const CONN_NODES: { name: string; lat: number; lng: number; note: string }[] = [
  { name: 'Kalmar', lat: 56.663, lng: 16.366, note: 'fastland — stad & slott' },
  { name: 'Revsudden', lat: 56.747, lng: 16.553, note: 'smalaste Kalmarsund — överfart' },
  { name: 'Hossmo', lat: 56.632, lng: 16.437, note: 'fastland — tidigt center' },
  { name: 'Ottenby', lat: 56.198, lng: 16.398, note: 'Ölands sydspets — kungsgård' },
];
const CONN_LINES: { name: string; coords: [number, number][] }[] = [
  { name: 'Kalmar–Färjestaden (sund + landväg österut)', coords: [[56.663, 16.366], [56.545, 16.462], [56.60, 16.52], [56.67, 16.60]] },
  { name: 'Revsudden-överfarten', coords: [[56.747, 16.553], [56.752, 16.62]] },
  { name: 'Hossmo–Karlevi', coords: [[56.632, 16.437], [56.608, 16.440]] },
  { name: 'Ölands norra udde → Gotland', coords: [[57.355, 17.05], [57.45, 17.55]] },
];

const OlandMap: React.FC<{ points: OlandPoint[]; showConnections: boolean }> = ({ points, showConnections }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [56.7, 16.55], zoom: 9, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    // Köpingsvik-hubben
    L.circle([56.885, 16.727], { radius: 4000, color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.08 })
      .bindPopup('<b>Köpingsvik</b><br/><span style="font-size:11px">Öns dominerande vikingatida nod — 89 av 190 runstenar inom 4 km.</span>')
      .addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    points.forEach((p) => {
      const s = KIND_STYLE[p.kind] ?? { color: '#94a3b8', radius: 3, label: p.kind };
      L.circleMarker([p.lat, p.lng], {
        radius: s.radius,
        color: s.color,
        weight: p.kind === 'find' ? 2 : 1,
        fillColor: s.color,
        fillOpacity: p.kind === 'find' ? 0.9 : 0.55,
      })
        .bindPopup(`<b>${p.name}</b><br/><span style="font-size:11px;color:#666">${s.label}${p.note ? ` · ${p.note}` : ''}</span>`)
        .addTo(layer);
    });
    if (showConnections) {
      CONN_LINES.forEach((l) => L.polyline(l.coords, { color: '#f59e0b', weight: 2, dashArray: '6 6', opacity: 0.75 })
        .bindPopup(`<b>${l.name}</b><br/><span style="font-size:11px">Schematisk förbindelse (ej uppmätt väg)</span>`).addTo(layer));
      CONN_NODES.forEach((n) => L.circleMarker([n.lat, n.lng], { radius: 6, color: '#f59e0b', weight: 2, fillColor: '#ffffff', fillOpacity: 0.9 })
        .bindPopup(`<b>${n.name}</b><br/><span style="font-size:11px;color:#666">${n.note}</span>`).addTo(layer));
    }
  }, [points, showConnections]);

  return <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 520 }} />;
};

const Legend: React.FC<{ on: Record<string, boolean>; toggle: (k: string) => void }> = ({ on, toggle }) => (
  <div className="flex flex-wrap gap-2 text-xs mb-3">
    {Object.entries(KIND_STYLE).map(([k, s]) => {
      const active = on[k] !== false;
      return (
        <button key={k} type="button" onClick={() => toggle(k)}
          className={`inline-flex items-center gap-1 rounded border px-2 py-1 transition-colors ${active ? 'border-slate-500 text-foreground' : 'border-slate-700 text-muted-foreground opacity-50'}`}>
          <span style={{ width: 10, height: 10, borderRadius: 9999, background: s.color, display: 'inline-block' }} /> {s.label}
        </button>
      );
    })}
    <button type="button" onClick={() => toggle('connection')}
      className={`inline-flex items-center gap-1 rounded border px-2 py-1 transition-colors ${on['connection'] !== false ? 'border-slate-500 text-foreground' : 'border-slate-700 text-muted-foreground opacity-50'}`}>
      <span style={{ width: 14, height: 0, borderTop: '2px dashed #f59e0b', display: 'inline-block' }} /> Förbindelser
    </button>
    <span className="inline-flex items-center gap-1 text-muted-foreground"><span style={{ width: 10, height: 10, borderRadius: 9999, border: '2px solid #f59e0b', display: 'inline-block' }} /> Köpingsvik-hub</span>
  </div>
);

const Oland = () => {
  const { data: points = [], isLoading } = useOlandModel();
  const [on, setOn] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setOn((s) => ({ ...s, [k]: s[k] === false ? true : false }));
  const shown = points.filter((p) => on[p.kind] !== false);
  const count = (k: string) => points.filter((p) => p.kind === k).length;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Öland-modellen — vägnät och centralplatser under vikingatiden"
        titleEn="The Öland model — Viking-age roads and central places"
        description="Forskningssida: rekonstruktion av Ölands vikingatida vägnät och centralplatser ur runstenar, fornborgar, guldfynd, Frö-namn och kyrkor. Reproducerbar, källförd, med redovisade osäkerheter."
        descriptionEn="Research page: reconstructing Öland's Viking-age road network and central places."
        keywords="Öland, vikingatid, runstenar, fornborgar, Karlevi, Köpingsvik, Gråborg, Färjestadskragen, centralplats, vägnät"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-gold" /> Öland-modellen
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Vikingatidens vägnät och centralplatser</p>
          <p className="text-muted-foreground text-lg">
            Öland har inte ändrat form nämnvärt sedan järnåldern. Genom att lägga runstenar, fornborgar,
            guldfynd, Frö-namn och medeltidskyrkor på samma karta framträder ett troligt mönster för hur
            vägarna gick och var makten satt. Materialet är en <em>modell</em> — källförd och prövbar, inte en
            färdig slutsats.
          </p>
        </div>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Route className="h-5 w-5" /> Vad datan visar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Väst/Kalmarsund-korridoren</strong> är entydig: Karlevistenen (Öl 1), Frö-klungan (Stora/Lilla Frö), Färjestadskragen (folkvandringstida prestigeguld, SHM 108870) och en runstenslinje längs sundet — monument, kult, guld och runstenar på samma axel.</p>
            <p><strong className="text-foreground">Köpingsvik</strong> är öns dominerande nod: 89 av 190 runstenar inom 4 km.</p>
            <p><strong className="text-foreground">Fornborgs-spinen</strong> ligger i mitten (Gråborg, Ismantorp, Bårby…); Sandby borg östligare mot Östersjön.</p>
            <p><strong className="text-foreground">E–V-väg Färjestaden→Björnhovda→Gråborg:</strong> Björnhovda-skattens (36 solidi) läge på vägen som passerar Gråborg pekar på en gammal tvärförbindelse mellan kust och inre.</p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Ärliga förbehåll</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Östkusten är gles</strong> på runstenar — modellen är väst-dominerad, inte två jämnstarka N–S-vägar.</li>
              <li><strong>Kyrkorna står tätt</strong> (uppmätt median ~5,5 km öbrett; tätare i söder) — inte 7–15 km som dagsräckvidds-modellen ger för fastlandets glesbygd. Se kristnande-grafen nedan.</li>
              <li><strong>Tvär-sundskontext:</strong> Kalmar-bygden (Hossmo m.fl.) mittemot hör till samma system över det långgrunda Kalmarsund — men den är fastland och visas inte här.</li>
              <li>Väglinjerna är ännu inte inritade; 1700-talets milstenar (~137) är nästa verktyg för att spåra dem.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Route className="h-5 w-5" /> Kristnandet på Öland — tempo mot Uppland &amp; Ångermanland</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Öland kristnades fort:</strong> ~halva kyrkbeståndet stod redan på 1100-talet och var i stort klart till 1200. <strong>Uppland</strong> fylldes gradvis (16&nbsp;% vid 1100 → 58&nbsp;% vid 1200), och <strong>Ångermanland</strong> förblev glest (26 kyrkor, ~10 km isär, bara 3 fornborgar). Olika odlingslandskap och befolkning → olika tempo.
            </p>
            <ChristianizationChart />
            <p className="text-xs opacity-80"><strong className="text-amber-300">Tolkning (hypotes):</strong> ett snabbt, front-tungt kristnande tyder på att kyrkorna restes på redan etablerade centrum — övertagande av gamla kult-/maktplatser — eller på ett område som var kristet-influerat tidigare. Täthet ensam avgör inte vilket; det gör kyrkornas läge (på hednisk kultplats? vid runsten med kors?). Nästa steg: lägga 190 Öland-runstenar + spolia (återbrukade bildstenar i kyrkor) mot kyrkolägena.</p>
          </CardContent>
        </Card>

        <Legend on={on} toggle={toggle} />
        {isLoading ? (
          <p className="text-muted-foreground">Laddar kartan…</p>
        ) : (
          <OlandMap points={shown} showConnections={on['connection'] !== false} />
        )}
        <p className="text-xs text-muted-foreground mt-3 opacity-80">
          {points.length} punkter: {count('runestone')} runstenar · {count('hillfort')} fornborgar · {count('church')} kyrkor · {count('find')} guld-/silverfynd · {count('fro_name')} Frö-namn.
          Källor: Samnordisk runtextdatabas; RAÄ/Fornsök; Historiska museet (guldfynd); Ortnamnsregistret.
        </p>
        <div className="pt-4">
          <a href="/explore?center=56.7,16.6&zoom=9" className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">
            <Compass className="h-4 w-4" /> Öppna hela kartan (experimentera med fler lager)
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Oland;
