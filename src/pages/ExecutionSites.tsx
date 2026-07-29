import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skull, AlertTriangle, Info, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExecutionSites, type ExecutionEvent, type ExecutionPlace } from '@/hooks/useExecutionSites';

// /forskning/avrattningsplatser — tvålagerskarta: RAÄ-platser (Fornsök CC0) + daterade händelser
// (execution_events, Wikidata CC0 m.fl.). Årsreglaget filtrerar HÄNDELSER (tidsdimensionen bärs av
// dem; platserna saknar oftast per-plats brukningsspann). rotter.se används ALDRIG (katalogskydd).

const PLACE_COLOR = '#f59e0b';   // guld = registrerad plats (arkeologi)
const EVENT_COLOR = '#ef4444';   // röd = daterad händelse (person/brott)
const MIN_YEAR = 1200, MAX_YEAR = 1910;

const ExecMap: React.FC<{ places: ExecutionPlace[]; events: ExecutionEvent[]; year: number; show: Record<string, boolean>; sv: boolean }> = ({ places, events, year, show, sv }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [61.5, 15.5], zoom: 5, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const layer = layerRef.current, map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    const pts: [number, number][] = [];
    if (show.places) {
      places.forEach((p) => {
        if (p.lat == null || p.lng == null) return;
        pts.push([p.lat, p.lng]);
        L.circleMarker([p.lat, p.lng], { radius: 3, color: PLACE_COLOR, weight: 1, fillColor: PLACE_COLOR, fillOpacity: 0.55 })
          .bindPopup(`<b>${p.name || (sv ? 'Avrättningsplats' : 'Execution site')}</b><br/><span style="font-size:11px;color:#666">${p.raa_type || ''}${p.parish ? ' · ' + p.parish : ''}${p.landscape ? ', ' + p.landscape : ''}${p.period ? '<br/>' + (sv ? 'Datering' : 'Dating') + ': ' + p.period : ''}</span><br/><span style="font-size:10px;color:#94a3b8">RAÄ Fornsök (CC0)</span>`)
          .addTo(layer);
      });
    }
    if (show.events) {
      events.forEach((e) => {
        if (e.lat == null || e.lng == null) return;
        if (e.event_year != null && e.event_year > year) return; // kumulativ avslöjning t.o.m. valt år
        pts.push([e.lat, e.lng]);
        L.circleMarker([e.lat, e.lng], { radius: 6, color: EVENT_COLOR, weight: 2, fillColor: EVENT_COLOR, fillOpacity: 0.8 })
          .bindPopup(`<b>${e.executed_person || (sv ? 'Avrättad (okänd)' : 'Executed (unknown)')}</b>${e.event_year ? ` <span style="color:#999">${e.event_date || e.event_year}</span>` : ''}<br/><span style="font-size:11px;color:#666">${[e.crime, e.method, e.place_name].filter(Boolean).join(' · ')}${e.executioner ? '<br/>' + (sv ? 'Bödel' : 'Executioner') + ': ' + e.executioner : ''}</span>${e.source_url ? `<br/><a href="${e.source_url}" target="_blank" rel="noopener" style="font-size:10px">${e.source_ref || 'källa'}</a>` : e.source_ref ? `<br/><span style="font-size:10px;color:#94a3b8">${e.source_ref}</span>` : ''}`)
          .addTo(layer);
      });
    }
    if (pts.length && map.getZoom() <= 5) map.fitBounds(L.latLngBounds(pts), { padding: [20, 20], maxZoom: 6 });
  }, [places, events, year, show, sv]);

  return <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 520 }} />;
};

const ExecutionSites = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data, isLoading } = useExecutionSites();
  const places = data?.places ?? [];
  const events = data?.events ?? [];
  const [year, setYear] = useState(MAX_YEAR);
  const [show, setShow] = useState<Record<string, boolean>>({ places: true, events: true });
  const toggle = (k: string) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const shownEvents = useMemo(() => events.filter((e) => e.event_year == null || e.event_year <= year), [events, year]);
  const byLandscape = useMemo(() => {
    const m = new Map<string, number>();
    places.forEach((p) => m.set(p.landscape || '—', (m.get(p.landscape || '—') || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [places]);
  const dated = places.filter((p) => p.period).length;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Avrättningsplatser i Sverige"
        titleEn="Execution sites in Sweden"
        description="Forskningskarta: alla registrerade avrättnings- och galgplatser i Sverige (RAÄ Fornsök) plus daterade avrättningshändelser. Tidsreglage — platsen kan ha flyttat, händelsen är daterad."
        descriptionEn="Research map: all registered execution and gallows sites in Sweden (RAÄ Fornsök) plus dated execution events, with a time slider."
        keywords="avrättningsplats, galgbacke, galgplats, stegling, bödel, Fornsök, avrättning, Sverige, rättshistoria"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Skull className="h-8 w-8 text-gold" />
            {sv ? 'Avrättningsplatser i Sverige' : 'Execution sites in Sweden'}
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">{sv ? 'Plats och tid — arkeologi möter arkiv' : 'Place and time — archaeology meets archive'}</p>
          <p className="text-muted-foreground text-lg">
            {sv
              ? <>Kartan visar <strong>två lager</strong>: <span style={{ color: PLACE_COLOR }}>registrerade avrättnings- och galgplatser</span> ur RAÄ Fornsök (arkeologisk lämning) och <span style={{ color: EVENT_COLOR }}>daterade avrättningshändelser</span> (person, brott, år) ur öppna källor. Platsen kan ha flyttat över seklerna; händelsen bär tiden. Dra i årsreglaget för att se avrättningarna växa fram.</>
              : <>The map shows <strong>two layers</strong>: <span style={{ color: PLACE_COLOR }}>registered execution and gallows sites</span> from the Swedish national heritage register (archaeological remains) and <span style={{ color: EVENT_COLOR }}>dated execution events</span> (person, crime, year) from open sources. Places moved over the centuries; the event carries the time.</>}
          </p>
        </div>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Clock className="h-5 w-5" /> {sv ? 'Kartan' : 'The map'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
              {([['places', sv ? `Platser (${places.length})` : `Sites (${places.length})`, PLACE_COLOR], ['events', sv ? `Händelser (${shownEvents.length}/${events.length})` : `Events (${shownEvents.length}/${events.length})`, EVENT_COLOR]] as [string, string, string][]).map(([k, label, color]) => (
                <button key={k} type="button" onClick={() => toggle(k)}
                  className={`inline-flex items-center gap-1 rounded border px-2 py-1 transition-colors ${show[k] ? 'border-slate-500 text-foreground' : 'border-slate-700 text-muted-foreground opacity-50'}`}>
                  <span style={{ width: 10, height: 10, borderRadius: 9999, background: color, display: 'inline-block' }} /> {label}
                </button>
              ))}
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="inline-flex items-center gap-1 text-red-300"><Clock className="h-3.5 w-3.5" /> {sv ? 'Avrättningar t.o.m. år' : 'Executions up to year'}</span>
                <span className="font-mono text-foreground">{year}</span>
              </div>
              <input type="range" min={MIN_YEAR} max={MAX_YEAR} step={1} value={year}
                onChange={(e) => setYear(Number(e.target.value))} className="w-full accent-red-500" />
              <div className="flex justify-between text-[10px] text-muted-foreground opacity-70"><span>{MIN_YEAR}</span><span>{MAX_YEAR}</span></div>
            </div>
            {!isLoading && <ExecMap places={places} events={shownEvents} year={year} show={show} sv={sv} />}
            {isLoading && <p className="text-muted-foreground text-sm py-8 text-center">{sv ? 'Laddar…' : 'Loading…'}</p>}
            <p className="text-xs text-muted-foreground mt-2 opacity-75">
              <strong>{sv ? 'Data' : 'Data'}:</strong> <code>heritage_sites</code> (RAÄ Fornsök, CC0) + <code>execution_events</code> (Wikidata CC0 m.fl.). <span style={{ color: PLACE_COLOR }}>●</span> {sv ? 'plats' : 'site'} · <span style={{ color: EVENT_COLOR }}>●</span> {sv ? 'daterad händelse' : 'dated event'}.
            </p>
          </CardContent>
        </Card>

        {/* Per landskap */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base text-gold">{sv ? 'Platser per landskap' : 'Sites per province'}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {byLandscape.map(([l, n]) => (
                <span key={l} className="inline-flex items-center gap-1 rounded border border-slate-700 px-2 py-0.5 text-muted-foreground">
                  {l} <span className="text-foreground font-medium">{n}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Källdisciplin — viktig transparens */}
        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> {sv ? 'Källor och gränser' : 'Sources and limits'}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">{sv ? 'Platser' : 'Sites'}:</strong> {places.length} {sv ? `registrerade avrättnings-/galgplatser ur RAÄ Fornsök (fri CC0). Varav ${dated} har en brukningsdatering ur RAÄ; övriga är odaterade (RAÄ daterar sällan avrättningsplatser).` : `registered execution/gallows sites from the national heritage register (CC0). ${dated} carry a dating; most are undated.`}</p>
            <p><strong className="text-foreground">{sv ? 'Händelser' : 'Events'}:</strong> {events.length} {sv ? 'daterade avrättningar ur öppna källor (Wikidata CC0 m.fl.), i egna ord.' : 'dated executions from open sources (Wikidata CC0 etc.).'}</p>
            <p><strong className="text-amber-300">{sv ? 'Vad vi INTE gör' : 'What we do NOT do'}:</strong> {sv
              ? <>vi kopierar inte sammanställda databaser som rotter.se faktabank — de skyddas av <em>katalogskydd</em> (49 § URL). Enskilda fakta är fria; vi följer i stället deras källhänvisning till primärkällan (Riksarkivet, public domain) och skriver i egna ord.</>
              : <>we do not copy compiled databases — they are protected by database right. We follow citations to the public-domain primary source instead.</>}</p>
            <p><strong className="text-amber-300">{sv ? 'Temporal lucka' : 'Temporal gap'}:</strong> {sv
              ? <>medeltida avrättningsplatser saknar ofta registrering (jfr SCB 2021). Ex: <em>Bägby galgbacke</em> (Runsten, Öland) finns i kyrkoböckerna men inte i Fornsök — en oregistrerad historisk plats.</>
              : <>medieval execution sites are often unregistered. E.g. Bägby gallows hill exists in parish records but not in the heritage register.</>}</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 text-sky-300 shrink-0 mt-0.5" />
          {sv ? 'Metoden följer SCB:s genomgång av galg- och avrättningsplatser (2021): flera sökfält i Fornsök, dubblettgallring, temporal medvetenhet.' : 'Method follows Statistics Sweden’s 2021 survey of gallows and execution sites.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default ExecutionSites;
