import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, FlaskConical, Info, Compass, Download, ExternalLink } from 'lucide-react';
import { useCentralPlaces, type CentralPlaceName, type CentralPlaceGroup } from '@/hooks/useCentralPlaces';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { MapLegend } from '@/components/map/MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';
import { useReliefOverlay } from '@/hooks/useReliefOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { supabase } from '@/integrations/supabase/client';
import { OrtnamnVerification } from '@/components/OrtnamnVerification';
import AngermanlandClusterResults from '@/components/placenames/AngermanlandClusterResults';
import { createPlaceMedallion, featureIcon } from '@/utils/map/placeMarker';

// Centralortsprojektet Ångermanland — delbar forskningssida. Läser central_places
// + central_place_names live. Medvetet tydlig med vad som saknas (koordinater/
// geokodning) och hur kollegor kan testa materialet (räckvidds-sonden på kartan).

const CAT = {
  sacral: { label: 'Sakralt', color: '#c084fc' },
  power: { label: 'Makt', color: '#3b82f6' },
} as const;
const catMeta = (c: string | null) => CAT[(c ?? '') as keyof typeof CAT] ?? { label: c ?? '—', color: '#94a3b8' };

const NameRow: React.FC<{ n: CentralPlaceName }> = ({ n }) => {
  const cat = catMeta(n.category);
  return (
    <div className="py-2 border-b border-slate-800/60 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-foreground font-medium text-sm">{n.name}</span>
        {n.attested_form && (
          <span className="text-xs text-muted-foreground italic">
            {n.attested_form}{n.attested_year ? ` (${n.attested_year})` : ''}
          </span>
        )}
        <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: cat.color + '22', color: cat.color }}>
          {cat.label}
        </Badge>
        {(n.element_keys ?? []).map((k) => (
          <span key={k} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-300">{k}</span>
        ))}
      </div>
      {n.interpretation && <p className="text-xs text-muted-foreground mt-1">{n.interpretation}</p>}
    </div>
  );
};

// Egen karta över klustret (imperativ Leaflet, samma mönster som Öland-sidan) — så man ser
// de inlagda positionerna direkt, i stället för att skickas till hela /explore.
const CAT_MARKER: Record<string, string> = { sacral: '#c084fc', power: '#3b82f6' };

const ANG_LEGEND: LegendLayerDef[] = [
  { key: 'central', label: 'Centralort', color: '#f59e0b', defaultOn: true },
  { key: 'power', label: 'Makt', color: '#3b82f6', defaultOn: true },
  { key: 'sacral', label: 'Sakralt', color: '#c084fc', defaultOn: true },
  { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap', defaultOn: true },
];

const AngMap: React.FC<{ groups: CentralPlaceGroup[] }> = ({ groups }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [shoreYear, setShoreYear] = useState<number | null>(950);
  const [relief, setRelief] = useState(false);
  useShorelineOverlay(mapRef, shoreYear);
  useReliefOverlay(mapRef, relief);
  const { enabled, toggle } = useMapLegendState(ANG_LEGEND);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [62.95, 17.7], zoom: 9, scrollWheelZoom: true });
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  // Baskarta på/av
  useEffect(() => {
    const map = mapRef.current, tile = tileRef.current;
    if (!map || !tile) return;
    if (enabled.osm) { if (!map.hasLayer(tile)) tile.addTo(map); }
    else if (map.hasLayer(tile)) map.removeLayer(tile);
  }, [enabled.osm]);

  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    const pts: [number, number][] = [];
    groups.forEach((g) => {
      if (enabled.central && g.lat != null && g.lng != null) {
        pts.push([g.lat, g.lng]);
        // Centralorten = klustrets huvud → medaljong med krona (central→crown) och PERMANENT namn.
        L.marker([g.lat, g.lng], { icon: createPlaceMedallion({ color: '#f59e0b', icon: featureIcon('central'), label: g.name, prominent: true, hairline: true }) })
          .bindPopup(`<b>${g.name}</b><br/><span style="font-size:11px">Centralort${g.confidence ? ` · ${g.confidence}` : ''}</span>${g.source ? `<br/><span style="font-size:10px;color:#94a3b8">Källa: ${g.source}</span>` : ''}<br/><span style="font-size:10px;color:#94a3b8">Data: central_places</span>`).addTo(layer);
      }
      g.names.forEach((n) => {
        if (n.lat == null || n.lng == null) return;
        const cat = n.category ?? '';
        // Bara power/sacral är togglebara; övriga kategorier visas alltid (som tidigare).
        if ((cat === 'power' || cat === 'sacral') && enabled[cat] === false) return;
        pts.push([n.lat, n.lng]);
        const color = CAT_MARKER[n.category ?? ''] ?? '#94a3b8';
        const core = n.evidence_tier === 'core';
        // Medaljong: färgen bär kategorin (matchar legenden), FORMEN bär den också (power→shield,
        // sacral→idol) → skiljs på form, ej bara färg (WCAG 1.4.1). Kärna = större disk. Hover-namn.
        L.marker([n.lat, n.lng], { icon: createPlaceMedallion({ color, icon: featureIcon(cat), label: n.name, prominent: false, hairline: true, size: core ? 30 : 24 }) })
          .bindPopup(`<b>${n.name}</b>${n.attested_form ? ` <i>(${n.attested_form}${n.attested_year ? ` ${n.attested_year}` : ''})</i>` : ''}<br/><span style="font-size:11px;color:#666">${n.category ?? ''}${core ? ' · kärna' : ' · utvidgad'}${n.interpretation ? `<br/>${n.interpretation}` : ''}</span>`).addTo(layer);
      });
    });
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [24, 24] });
  }, [groups, enabled]);

  return (
    <div>
      <div className="hidden sm:block"><ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} /></div>
      <div className="sm:hidden"><ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} variant="floating" /></div>
      <label className="inline-flex items-center gap-1.5 text-xs text-emerald-300 cursor-pointer mb-2"><input type="checkbox" checked={relief} onChange={(e) => setRelief(e.target.checked)} /> Höjdrelief (terräng — Höga kustens strandvallar)</label>
      <div className="relative">
        <div ref={containerRef} className="w-full h-[480px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 480 }} />
        <MapLegend defs={ANG_LEGEND} enabled={enabled} onToggle={toggle} mapRef={mapRef} />
      </div>
    </div>
  );
};

const Angermanland = () => {
  const { data: groups = [], isLoading } = useCentralPlaces();
  const totalNames = groups.reduce((s, g) => s + g.names.length, 0);
  // Sambandsstyrka (config-driven, beräknad av ledparsern) — visas MED förbehåll, aldrig naken.
  const [enrich, setEnrich] = useState<Record<string, number | string | null> | null>(null);
  useEffect(() => {
    (supabase.from('ortnamn_enrichment_results') as any).select('*').eq('region', 'Ångermanland').maybeSingle()
      .then(({ data }: { data: Record<string, number | string | null> | null }) => setEnrich(data));
  }, []);
  // Agneta Nyholms SOL-diff (förberedd, obeslutad — hon äger besluten).
  const [solDiff, setSolDiff] = useState<Record<string, string>[]>([]);
  useEffect(() => {
    (supabase.from('ortnamn_sol_comparison') as any).select('*').like('owner', 'Agneta%')
      .then(({ data }: { data: Record<string, string>[] }) => setSolDiff(data ?? []));
  }, []);

  // Attribution/proveniens — DB-driven (research_scholars + sources), EN sanningskälla.
  // PDF-länken byter namn när Agneta uppdaterar studien; då räcker det att ändra
  // sources.url (live direkt, inget ombygge) — sidan + /forskare följer med.
  const [attribution, setAttribution] = useState<{ instituteUrl: string; workTitle: string | null; pdfUrl: string | null } | null>(null);
  useEffect(() => {
    (async () => {
      const { data: sch } = await (supabase.from('research_scholars') as any)
        .select('id, external_ref').ilike('name', '%Nyholm%').maybeSingle();
      if (!sch) return;
      const { data: work } = await (supabase.from('sources') as any)
        .select('title, url').eq('scholar_id', sch.id).eq('source_type', 'research_document').maybeSingle();
      setAttribution({
        instituteUrl: sch.external_ref ?? 'https://www.sofiainstitutet.se',
        workTitle: work?.title ?? null,
        pdfUrl: work?.url ?? null,
      });
    })();
  }, []);

  const tierNames = (names: CentralPlaceName[], tier: string) =>
    names.filter((n) => n.evidence_tier === tier).sort((a, b) => a.name.localeCompare(b.name, 'sv'));

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Centralortsprojektet Ångermanland"
        titleEn="The Ångermanland central-places project"
        description="Forskningssida: ortnamnskluster kring maktens och kultens noder i Ångermanland (Nora, Torsåker, Härnösand–Säbrå). Reproducerbar metod, källförd, med redovisade osäkerheter."
        descriptionEn="Research page: place-name clusters around the nodes of power and cult in Ångermanland."
        keywords="Ångermanland, centralort, ortnamn, ortnamnskluster, Nora, Torsåker, Säbrå, sakrala ortnamn, vikingatid"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-gold" />
            Centralortsprojektet Ångermanland
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Ortnamnskluster kring maktens och kultens noder</p>
          <p className="text-muted-foreground text-lg">
            Tre centralorter i Ångermanland — <strong>Nora</strong>, <strong>Torsåker</strong> och{' '}
            <strong>Härnösand–Säbrå</strong> — där sakrala och maktrelaterade ortnamn tätnar kring en nod
            (en sockenkyrka på tidigare hovplats, en kungsgård). Hypotesen: kyrkorna restes vid maktens och
            kultens redan etablerade centrum. Materialet är en <em>hypotes</em> — en reproducerbar,
            källförd metod, inte en färdig slutsats.
          </p>
        </div>

        {/* ATTRIBUTION — sidan är en del av Agneta Nyholms forskning; PDF:en är primärkällan
            med rikare material. Länkar DB-drivna (sources.url / external_ref). */}
        {attribution && (
          <Card className="viking-card mb-4 border-gold/40">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 text-sm text-foreground">
                  En del av <strong>Agneta Nyholms</strong> forskning vid{' '}
                  <a href={attribution.instituteUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline inline-flex items-center gap-1">
                    Sofiainstitutet <ExternalLink className="h-3 w-3" />
                  </a>.
                  {attribution.workTitle && (
                    <> Sidan bygger på studien <em>”{attribution.workTitle}”</em> — hela PDF:en har rikare material än sammanfattningen här.</>
                  )}
                </div>
                {attribution.pdfUrl && (
                  <a
                    href={attribution.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400 transition-colors shrink-0"
                  >
                    <Download className="h-4 w-4" /> Ladda ner hela studien (PDF)
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KARTA — egen karta över klustret med tänd/släck-filter (Daniel: inte skicka till /explore) */}
        {!isLoading && groups.length > 0 && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> Kartan över klustret</CardTitle>
            </CardHeader>
            <CardContent>
              <AngMap groups={groups} />
              <p className="text-xs text-muted-foreground mt-2 opacity-75"><strong>Data:</strong> <code>central_places</code> + <code>central_place_names</code> (Agneta Nyholms forskning, SWEREF99 TM → WGS84; verifierad mot Länsstyrelsen/RAÄ <em>Y 24</em>). <strong>Färg</strong> = kategori (lila = sakralt, blått = makt, guld = centralort). <strong>Fylld ring</strong> = kärna (starkast belägg), tunn = utvidgad hypotes. Klicka en punkt för källa, tolkning + belägg-år.</p>
            </CardContent>
          </Card>
        )}

        {/* SAMBANDSSTYRKA — trafikljus med obligatoriska förbehåll (aldrig naken siffra) */}
        {enrich && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold"><FlaskConical className="h-5 w-5" /> Sambandsstyrka (preliminär)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {(() => {
                const ratio = Number(enrich.ratio), n = Number(enrich.cult_n), cE = Number(enrich.cult_enrichment);
                const weak = n < 10;
                const light = weak ? { c: '#94a3b8', t: 'För få (n<10) — tolka försiktigt' }
                  : ratio >= 2 ? { c: '#22c55e', t: 'Tätare än väntat' }
                  : ratio >= 1.2 ? { c: '#eab308', t: 'Svagt' } : { c: '#ef4444', t: 'Typiskt/glesare' };
                return (
                  <div className="flex items-start gap-3">
                    <span style={{ width: 16, height: 16, borderRadius: 9999, background: light.c, marginTop: 3, flex: '0 0 auto', boxShadow: `0 0 6px ${light.c}` }} />
                    <div>
                      <div className="text-foreground"><strong>{cE.toFixed(1)}×</strong> — kult-namnen ligger ~{cE.toFixed(1)} gånger tätare kring centralorterna än genomsnittsnamnet (kvot {ratio.toFixed(1)} mot neutrala namn). <span style={{ color: light.c }}>{light.t}.</span></div>
                      <div className="text-xs mt-1 opacity-80">n = {n} kult-namn · radie {enrich.radius_km} km · led som räknas: {enrich.included_elements}</div>
                    </div>
                  </div>
                );
              })()}
              {enrich.ratio_core != null && (
                <p className="text-xs"><strong className="text-foreground">Robusthet:</strong> med alla led {Number(enrich.ratio).toFixed(1)}×, med bara de säkra leden (tor/frö/sal) {Number(enrich.ratio_core).toFixed(1)}× (n={String(enrich.cult_core_n)}). {Number(enrich.ratio_core) >= Number(enrich.ratio) * 0.7
                  ? <span className="text-emerald-300">Signalen håller — den rider inte på de omtvistade leden (härn/ross).</span>
                  : <span className="text-amber-300">Signalen försvagas utan de omtvistade leden — tolka försiktigt.</span>}</p>
              )}
              {enrich.per_element && typeof enrich.per_element === 'object' && (
                <div className="text-xs"><strong className="text-foreground">Per led:</strong> {Object.entries(enrich.per_element as Record<string, number>).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}${['härn', 'ross', 'hov', 'vang'].includes(k) ? '*' : ''}`).join(' · ')} <span className="opacity-70">(* = omtvistad etymologi)</span></div>
              )}
              <p className="text-xs"><strong className="text-amber-300">Förbehåll:</strong> {enrich.caveat}</p>
              <p className="text-xs"><strong className="text-foreground">Beslut:</strong> {enrich.owner_note}. Ändrar forskaren vilka led som räknas och analysen körs om, uppdateras siffran här.</p>
            </CardContent>
          </Card>
        )}

        {/* Per-nod klusterresultat (live), skarp kant + nollkontroll — attribution + förbehåll. */}
        <AngermanlandClusterResults sv />

        {/* ATT GRANSKA MOT SOL — forskarens arbetslista (hon äger besluten, SOL är referens) */}
        {solDiff.length > 0 && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold"><Info className="h-5 w-5" /> Att granska mot Svenskt ortnamnslexikon ({solDiff.filter((d) => d.diff === 'ja').length})</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p className="text-xs opacity-80">Din läsning står bredvid SOL 2003. SOL är en referens — <strong>du bestämmer</strong>. Inget ändras utan att du väljer det.</p>
              {solDiff.map((d) => {
                const col = d.diff === 'ja' ? '#ef4444' : (d.diff || '').includes('saknar') ? '#eab308' : '#22c55e';
                const label = d.diff === 'ja' ? 'granska' : (d.diff || '').includes('saknar') ? 'SOL saknar uppslag' : 'SOL håller med';
                return (
                  <div key={d.name} className="border-l-2 pl-3 py-1" style={{ borderColor: col }}>
                    <div className="text-foreground font-medium">{d.name} <span style={{ color: col }} className="text-xs">· {label}</span></div>
                    <div className="text-xs mt-0.5"><strong>Din läsning:</strong> {d.our_reading}</div>
                    <div className="text-xs"><strong>SOL:</strong> {d.sol_reading}</div>
                  </div>
                );
              })}
              <p className="text-[11px] opacity-70">Vid granskning: korrigera din studie enligt SOL, eller behåll din läsning och dokumentera varför (en avvikelse är ett giltigt utfall — SOL har inte alltid rätt).</p>
            </CardContent>
          </Card>
        )}

        {/* VERIFIERING — Agneta skiljer kult från homonym per namnträff (ren kvot) */}
        <OrtnamnVerification region="Ångermanland" />

        {/* STATUS — vad som finns och vad som saknas (tydligt, medvetet) */}
        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300">
              <AlertTriangle className="h-5 w-5" /> Status: vad som finns och vad som saknas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Finns:</strong> {groups.length} centralorter och {totalNames} kluster-namn, klassade efter namnled (sakralt/makt), evidensnivå (kärna/utvidgad) och tolkning. <strong className="text-foreground">Nu koordinatsatta</strong> (SWEREF99 TM ur Agneta Nyholms forskning, transformerade till WGS84).</p>
            <p><strong className="text-foreground">Verifierat mot auktoritativ källa:</strong> Länsstyrelsen Västernorrland / RAÄ:s riksintressebeskrivning <em>Nora-Rossvik [Y 24]</em> bekräftar Nora som en av Ångermanlands tätaste järnåldersbygder, storhögar vid Nora prästbord, Holshögen och <strong>fyra vikingatida silverskatter</strong> (bl.a. Frök med 373 silvermynt) — nu inlagda som källförda fynd.</p>
            <p><strong className="text-amber-300">Källkritik (viktigt):</strong> mainstream ortnamnsforskning (Länsstyrelsen/RAÄ; Vikstrand, <em>Gudarnas platser</em> 2001) läser flera av klustrets namn annorlunda än kulttolkningen: <em>-om/-um</em>-namn (Nora, Torrom, Salom, Grötom) som "hem/gård" (~år 0), och <em>-sta</em>-namn (Ärsta) som "plats + personnamn". <strong>Centralorts-statusen är belagd; flera enskilda kult-etymologier (Ross/häst, Härna/Fröja, Ed/ed, Hammar/ting) är omtvistade</strong> och ska läsas som hypotes.</p>
            <p><strong className="text-foreground">Saknas (nästa steg):</strong> en karta direkt på sidan (koordinaterna finns nu men renderas inte här ännu); baslinjetest per landskap; belägg-år för många namn.</p>
          </CardContent>
        </Card>

        {/* SÅ TESTAR DU — hur kollegor jobbar med materialet */}
        <Card className="viking-card mb-4 border-sky-700/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-sky-300">
              <FlaskConical className="h-5 w-5" /> Så testar du materialet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Materialet går att pröva rumsligt redan nu, utan att namnen är geokodade:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Öppna <Link to="/explore?center=62.95,18.0&zoom=9&central=1" className="text-gold hover:underline">kartan (Utforska)</Link> — den öppnas centrerad på Ångermanland.</li>
              <li><strong>Högerklicka</strong> på platsen (eller klicka på ett objekt) → välj <em>“Mät räckvidd härifrån”</em>.</li>
              <li>Välj <strong>form</strong> (cirkel/fyrkant/hexagon) och <strong>radie</strong> — t.ex. knappen <em>“Daglig maskvidd 9 km”</em> (gångavstånd från ett centrum).</li>
              <li>Läs antalet objekt inuti formen, och <strong>exportera</strong> resultatet till GeoJSON (QGIS) eller CSV för att jobba vidare i egna verktyg.</li>
            </ol>
            <p>Vill du bidra med data? En komplett, geokodad ortnamnslista (Lantmäteriet via Geotorget, CC0) låter oss placera alla namn på kartan och köra baslinjetest per landskap.</p>
            <p className="flex items-start gap-2 text-xs bg-slate-800/40 rounded p-2 mt-1">
              <Info className="h-4 w-4 text-sky-300 shrink-0 mt-0.5" />
              <span><strong className="text-foreground">Åtkomst:</strong> sidan och kartan är öppna — ingen inloggning behövs för att läsa, mäta räckvidd eller exportera. Inloggning krävs bara om du vill <em>spara</em> dina egna hypotes-ytor till ett konto.</span>
            </p>
            <div className="pt-1">
              <Link to="/explore?center=62.95,18.0&zoom=9&central=1" className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">
                <Compass className="h-4 w-4" /> Öppna kartan
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* CENTRALORTERNA */}
        {isLoading ? (
          <p className="text-muted-foreground">Laddar…</p>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => {
              const core = tierNames(g.names, 'core');
              const extended = tierNames(g.names, 'extended');
              return (
                <Card key={g.id} className="viking-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gold" /> {g.name}
                      <Badge variant="secondary" className="text-xs ml-1">{g.names.length} namn</Badge>
                    </CardTitle>
                    {g.description && <p className="text-sm text-muted-foreground mt-1">{g.description}</p>}
                  </CardHeader>
                  <CardContent>
                    {core.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-foreground mb-1">Kärna (starkast belägg)</div>
                        {core.map((n) => <NameRow key={n.id} n={n} />)}
                      </div>
                    )}
                    {extended.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-foreground mb-1">Utvidgad hypotes {`(⚠ = mest osäker)`}</div>
                        {extended.map((n) => <NameRow key={n.id} n={n} />)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6 opacity-75">
          Forskning: <strong>Agneta Nyholm</strong> (
          <a href={attribution?.instituteUrl ?? 'https://www.sofiainstitutet.se'} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Sofiainstitutet</a>, Härnösand) — ortnamnskluster i
          Ångermanlands vikingatida centralorter (se{' '}
          <Link to="/forskare" className="text-gold hover:underline">forskare &amp; källor</Link>). Metoden
          (namnledskatalog, hypotestestare) delas med{' '}
          <Link to="/sv/ortnamn" className="text-gold hover:underline">ortnamnssidan</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Angermanland;
