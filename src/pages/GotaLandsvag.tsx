import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Route as RouteIcon, ScrollText, Info, AlertTriangle, MapPin, Footprints, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { MapLegend } from '@/components/map/MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { createPlaceMedallion, featureIcon } from '@/utils/map/placeMarker';

// /sv/gota-landsvag — forskningssida + utflyktsmål om Göta landsväg, den medeltida landsvägen
// Stockholm–Södertälje över Södertörn. Hållpunkterna ligger i DB (road_waypoints) — INTE hårdkodade —
// och läses via RPC get_road_waypoints. Koordinater: ecclesiastical_sites (kyrkor), runkorpus
// (Sö 300/304/306/311/312, Rundata), sv.wikipedia (Årstafältet/Flottsbro/Björns trädgård),
// RAÄ (Botkyrka 389:1, Östertälje 220:1), Stockholmskällan (Björns trädgård, Fennö 2004, CC-BY).

const CORRIDOR_BBOX: [number, number, number, number] = [17.55, 59.15, 18.15, 59.35];
const GOTA_ROAD_ID = '97b4a769-7eed-4d64-b97e-978d5b957e7d';

type Kind = 'endpoint' | 'bridge' | 'thing' | 'rune' | 'church' | 'fort';
// Noden bär sekvens + väg-not (ur DB). ENTITETERNA (kyrka/runsten) resolveras dessutom live via
// signum → runic_inscriptions / church → ecclesiastical_sites för thumbnail, byggår och "Läs mer"-länk.
interface Node { name: string; lat: number; lng: number; kind: Kind; note: string; signum?: string; church?: string; offRoute?: boolean; }

// Läs vägens kurerade hållpunkter (N→S) ur road_waypoints via RPC. Enda källa — ingen hårdkodad rutt.
function useGotaLandsvagNodes(): Node[] {
  const [nodes, setNodes] = useState<Node[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      // RPC ännu ej i genererade types.ts → cast (samma mönster som övriga otypade anrop i koden).
      const { data, error } = await (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)(
        'get_road_waypoints', { p_road_id: GOTA_ROAD_ID });
      if (!alive || error || !Array.isArray(data)) return;
      setNodes((data as Array<Record<string, unknown>>).map((r) => ({
        name: String(r.name),
        lat: Number(r.lat),
        lng: Number(r.lng),
        kind: r.kind as Kind,
        note: (r.note as string) ?? '',
        signum: (r.signum as string) ?? undefined,
        church: (r.church_name as string) ?? undefined,
        offRoute: (r.off_route as boolean) ?? undefined,
      })));
    })();
    return () => { alive = false; };
  }, []);
  return nodes;
}

interface Enrich { thumb?: string; attribution?: string; link?: string; built?: number | null; dating?: string | null; }

const KIND: Record<Kind, { color: string; label: string }> = {
  endpoint: { color: '#94a3b8', label: 'Ändpunkt (approx.)' },
  bridge: { color: '#38bdf8', label: 'Bro / vadställe' },
  thing: { color: '#d4a63c', label: 'Tingsplats' },
  rune: { color: '#b45309', label: 'Runsten (brobygge)' },
  church: { color: '#7b3f00', label: 'Medeltidskyrka' },
  fort: { color: '#8b5cf6', label: 'Borg (kontrollpunkt)' },
};

const GL_KIND_KEYS = Object.keys(KIND) as Kind[];

const GotaLandsvagMap: React.FC<{ nodes: Node[] }> = ({ nodes }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const groupsRef = useRef<Record<string, L.LayerGroup>>({});
  const roadRef = useRef<L.LayerGroup>(L.layerGroup());
  const [shoreYear, setShoreYear] = useState<number | null>(null);
  useShorelineOverlay(mapRef, shoreYear, 'get_paleo_shorelines_dem', CORRIDOR_BBOX);

  // Återanvändbar legend: väglinje + en togglebar grupp per nodtyp + baskarta.
  const LEGEND: LegendLayerDef[] = [
    { key: 'road', label: 'Göta landsväg (~31,9 km)', color: '#d4a63c', defaultOn: true },
    ...GL_KIND_KEYS.map((k) => ({ key: k, label: KIND[k].label, color: KIND[k].color, defaultOn: true })),
    { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap' as const, defaultOn: true },
  ];
  const { enabled, toggle } = useMapLegendState(LEGEND);

  // Init kartan en gång (utan noder — de kommer asynkront ur DB).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [59.245, 17.84], zoom: 11, scrollWheelZoom: true });
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    GL_KIND_KEYS.forEach((k) => { groupsRef.current[k] = L.layerGroup(); });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Rita väglinje + noder när DB-noderna kommit (eller ändrats).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !nodes.length) return;
    roadRef.current.clearLayers();
    GL_KIND_KEYS.forEach((k) => groupsRef.current[k]?.clearLayers());

    // Väglinjen genom noderna (utom off-route-punkter) → egen togglebar grupp
    L.polyline(nodes.filter((n) => !n.offRoute).map((n) => [n.lat, n.lng] as [number, number]), {
      color: '#d4a63c', weight: 3, opacity: 0.85, dashArray: '6 6',
    }).addTo(roadRef.current);

    nodes.forEach((n) => {
      const c = (KIND[n.kind] ?? KIND.endpoint).color;
      // Medaljong: färgen bär nodtypen (matchar legenden), FORMEN (kind→glyf via featureIcon:
      // rune→rune, church→church, bridge→bro, fort→hus_slott, thing→scales, endpoint→dot) bär typen
      // också → skiljs på form, ej bara färg (WCAG 1.4.1). Hover-namn (tät rutt, ej permanent).
      L.marker([n.lat, n.lng], { icon: createPlaceMedallion({ color: c, icon: featureIcon(n.kind), label: n.name, prominent: false, hairline: true }) })
        .bindPopup(`<b>${n.name}</b><br/><span style="font-size:11px">${n.note}</span>`)
        .addTo(groupsRef.current[n.kind] ?? roadRef.current);
    });

    map.fitBounds(L.latLngBounds(nodes.map((n) => [n.lat, n.lng] as [number, number])), { padding: [30, 30] });
  }, [nodes]);

  // Baskarta på/av
  useEffect(() => {
    const map = mapRef.current, tile = tileRef.current;
    if (!map || !tile) return;
    if (enabled.osm) { if (!map.hasLayer(tile)) tile.addTo(map); }
    else if (map.hasLayer(tile)) map.removeLayer(tile);
  }, [enabled.osm]);

  // Togglar vägen + nodtyperna enligt legenden
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const toggleG = (on: boolean, g: L.LayerGroup | null) => {
      if (!g) return;
      if (on) { if (!map.hasLayer(g)) map.addLayer(g); }
      else if (map.hasLayer(g)) map.removeLayer(g);
    };
    toggleG(enabled.road, roadRef.current);
    GL_KIND_KEYS.forEach((k) => toggleG(enabled[k], groupsRef.current[k]));
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
    </div>
  );
};

const GotaLandsvag = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const nodes = useGotaLandsvagNodes();
  const [enrich, setEnrich] = useState<Record<string, Enrich>>({});

  // Resolvera entiteterna (kyrkor/runstenar) från DB → thumbnail, byggår och "Läs mer"-länk
  // hämtas live i stället för att dupliceras i rutten.
  useEffect(() => {
    if (!nodes.length) return;
    let alive = true;
    (async () => {
      const out: Record<string, Enrich> = {};
      const churchNames = nodes.filter((n) => n.church).map((n) => n.church!);
      const signums = nodes.filter((n) => n.signum).map((n) => n.signum!);
      const [{ data: cs }, { data: ris }] = await Promise.all([
        supabase.from('ecclesiastical_sites').select('name,image_url,image_attribution,built_from,dating_class').in('name', churchNames),
        supabase.from('runic_inscriptions').select('id,signum').in('signum', signums),
      ]);
      (cs ?? []).forEach((c: any) => {
        const node = nodes.find((n) => n.church === c.name);
        if (node) out[node.name] = { thumb: c.image_url ?? undefined, attribution: c.image_attribution ?? undefined, built: c.built_from, dating: c.dating_class, link: '/sv/kyrkor' };
      });
      for (const ri of ((ris ?? []) as any[])) {
        const node = nodes.find((n) => n.signum === ri.signum);
        if (!node) continue;
        const { data: media } = await supabase.from('inscription_media').select('media_url').eq('inscription_id', ri.id).order('created_at').limit(1);
        out[node.name] = { thumb: (media?.[0] as any)?.media_url ?? undefined, link: `/inscription/${encodeURIComponent(ri.signum)}` };
      }
      if (alive) setEnrich(out);
    })();
    return () => { alive = false; };
  }, [nodes]);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Göta landsväg — medeltida landsvägen Stockholm–Södertälje"
        titleEn="Göta landsväg — the medieval highroad Stockholm–Södertälje"
        description="Forskningssida och utflyktsmål om Göta landsväg, den medeltida landsvägen från Skanstull över Södertörn till Södertälje. En väg belagd från 1000-talet (brobyggnadsrunstenarna Sö 300 och Holmfast Sö 311/312). Tolv verifierade hållpunkter — Årstafältet, Glömstahällen (Sö 300), Långsjön/Korkskruven, Flottsbro, Svartlötens tingsplats, Botkyrka kyrka, Holmfast Sö 311/312 och Ragnhildsborg/Telge hus — och dess föregångare Tingsvägen."
        descriptionEn="Research page and excursion on Göta landsväg, the medieval highroad from Skanstull across Södertörn to Södertälje. A road attested from the 11th century (the bridge-building rune stones Sö 300 and Holmfast Sö 311/312). Twelve verified waypoints — Årstafältet, the Glömsta rune ledge (Sö 300), Flottsbro, the Svartlöten assembly site, Botkyrka church, the Holmfast carvings (Sö 311/312) and Ragnhildsborg/Telge hus — and its predecessor Tingsvägen."
        keywords="Göta landsväg, Tingsvägen, Svartlöten, Svartlösa härad, Årstafältet, Glömstahällen, Sö 300, Korkskruven, Långsjön, Flottsbro, Botkyrka, Holmfast, Sö 311, Sö 312, Ragnhildsborg, Telge hus, Södertälje, medeltida vägar, Södertörn, utflykt"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
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
            <GotaLandsvagMap nodes={nodes} />
            <p className="text-xs text-muted-foreground mt-2 opacity-75">
              Tolv verifierade hållpunkter (kyrkor ur <code>ecclesiastical_sites</code>, runstenar ur runkorpusen — Sö 300/304/306/311/312,
              Årstafältet/Flottsbro ur sv.wikipedia, Svartlöten ur RAÄ Botkyrka 389:1, Ragnhildsborg ur RAÄ Östertälje 220:1). Start-/slutpunkter approximativa.
              Reglaget kan lägga på en <strong>paleo-strandlinje</strong> — vid vikingatida havsnivå var stråket delvis vattenland.
            </p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4 border-gold/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><ScrollText className="h-5 w-5" /> En väg från 1000-talet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
            <p>
              Att det gick väg och bro genom det här stråket redan på vikingatiden är belagt genom runstenarna:{' '}
              <strong>Sö 300</strong> vid Glömsta ("Sverker lät göra bron …") och <strong>Holmfast-ristningarna Sö 311/312</strong>{' '}
              i Södertälje-änden ("Holmfast lät röja väg och göra bro …") är väg- och brobyggnadsmonument från 1000-talet.
            </p>
            <p>
              Själva <em>namnet</em> Göta landsväg och rollen som Stockholms infartsväg söderut hör däremot till tiden efter
              stadens grundande omkring 1250, och de synliga, utgrävda vägbankarna (Årstafältet, Glömsta) dateras arkeologiskt
              till minst 1600-talet. Vägen är alltså äldre än sitt namn — en 1000-talsled som medeltiden och nya tiden byggde vidare på.
            </p>
            <p className="opacity-80">
              Källkritik: brofunktionen på 1000-talet är belagd via runstenarna (lämning + Rundata-datering); att just denna
              korridor var i <em>kontinuerligt</em> bruk 1000-tal→medeltid är sannolik tolkning, då den utgrävda banken bara går
              tillbaka till 1600-talet och medeltida fynd inte säkert kan knytas till linjen (SLM 2025).
            </p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Info className="h-5 w-5" /> Ortnamnet Johanneshov — en 1700-talsfälla</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
            <p>
              Namnet Johanneshov är ingen medeltida ort och syftar inte på någon "Johannes Hov". Det uppstod först på 1700-talet
              kring ett värdshus under Enskede gård (belagt 1772 som <em>Johannishof</em>), sägs enligt lokalhistorisk tradition
              vara uppkallat efter amiralitetslöjtnanten Johan Grund, och bär den då moderna, halvt skämtsamma herrgårdsändelsen{' '}
              <em>-hov</em>. Att Göta landsväg passerar här är alltså äldre än gatunamnet — den historiska vägen råkar bara följa
              ungefär dagens Johanneshovsvägens sträckning söderut från Skanstull.
            </p>
            <p className="opacity-80">
              Vid Johanneshov låg på 1700-talet en vägkrog — <strong>Johanneshovs gård</strong> (krogen grundad 1725), ett torp under
              Enskede gård. Det var en krog vid landsvägen, <em>inte</em> ett formellt gästgiveri/skjutshåll. Byggnaden låg vid dåvarande
              Dalarövägen, ungefär där Johanneshovs isstadion senare byggdes, och revs på 1950-talet. Exakt läge är inte koordinatverifierat.
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
              Söder om <strong>Brännkyrka kyrka</strong> lever vägen kvar i namnet — dagens <strong>Götalandsvägen</strong> genom
              Östberga och Örby. Vidare passerade leden <strong>Långsjön</strong> (i Herrängen/Älvsjö) på sjöns östra sida, där en
              brant, slingrande vägbacke kallades <strong>"Korkskruven"</strong>. (Det är Långsjön — <em>inte</em> Långbro/Långbrodal,
              ett annat område i Älvsjö utan belägg som vägläge.)
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
            <ul className="space-y-3 text-sm text-muted-foreground">
              {nodes.filter((n) => n.kind !== 'endpoint').map((n) => {
                const e = enrich[n.name];
                return (
                  <li key={n.name} className="flex gap-3">
                    {e?.thumb ? (
                      <img src={e.thumb} alt={n.name} loading="lazy" title={e.attribution || undefined}
                        className="w-16 h-16 object-cover rounded border border-border shrink-0 bg-slate-800" />
                    ) : (
                      <span className="w-16 h-16 rounded border border-dashed border-border shrink-0" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <span className="text-foreground font-medium">{n.name}</span>
                      {e?.built ? <span className="text-xs text-gold"> · byggd fr. {e.built}{e.dating ? ` (${e.dating})` : ''}</span> : null}
                      {e?.link ? <> · <Link to={e.link} className="text-xs text-sky-400 hover:underline">Läs mer →</Link></> : null}
                      <div className="text-xs mt-0.5">{n.note}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="text-[11px] text-muted-foreground/70 mt-2">Hållpunkterna läses live ur databasen (road_waypoints). Thumbnails ur ecclesiastical_sites (kyrkor) resp. inscription_media (runstenar). Bilder från Wikimedia Commons / RAÄ (CC) — full attribution på respektive objektsida.</p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Landmark className="h-5 w-5" /> Sex nyckelkategorier att läsa vägen genom</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p className="text-xs">
              Stockholms läns museum dokumenterade Göta landsvägs sträckning 2023 och pekade ut sex typer av
              lämningar och kulturmiljöer som särskilt viktiga pusselbitar för att förstå vägens historia:
            </p>
            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 list-disc pl-5 text-xs">
              <li>Medeltida kyrkor</li>
              <li>Historiska gårdar och byar</li>
              <li>Runstenar</li>
              <li>Förhistoriska gravfält</li>
              <li>Milstenar</li>
              <li>Hålvägar och historiska vägkonstruktioner</li>
            </ul>
            <p className="text-xs opacity-80">
              Vägspår återfinns ofta isolerade och utan historisk kontext; kategorierna binder ihop dem till vägens
              berättelse. Källa: Daniel Sahlén, Stockholms läns museum (2025).
            </p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><ScrollText className="h-5 w-5" /> Skriftliga &amp; kartografiska källor</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 text-xs">
            <p>• <strong>1494</strong> — äldsta skriftliga belägget: Stockholms stads jordebok (förteckning över jordtransaktioner). Nämner vägen men säger föga om den.</p>
            <p>• <strong>1609</strong> — beskrivningen av Karl IX:s eriksgata, som då gick Stockholm–Södertälje på Göta landsväg, ger en glimt av vägmiljön.</p>
            <p>• <strong>1716</strong> — <em>Charta öfwer Söder Törn</em> och andra 1700-talskartor visar sträckningen. Idag är vägen nästan helt borta utom fragment, återanvända avsnitt och ortnamn (moderna Götalandsvägen genom Östberga och Örby).</p>
            <p className="opacity-80">Källa: Stockholms läns museum (D. Sahlén 2025) + SLM:s skylt om Göta landsväg.</p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Förbehåll (redovisade)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1 text-xs">
            <p>• <strong>Start-/slutpunkter (Skanstull, Södertälje) är approximativa</strong> — endast mellanpunkterna är koordinatverifierade.</p>
            <p>• <strong>Långsjön/Korkskruven</strong> beskrivs i texten men saknar egen kartpunkt tills en verifierad koordinat finns (bracketas av Brännkyrka och Glömsta). Det är Långsjön — <em>inte</em> Långbro/Långbrodal, som saknar belägg som vägläge.</p>
            <p>• <strong>Historisk linje vs modern promenad:</strong> den historiska vägen följde ungefär Johanneshovsvägen; strandvägen längs Årstaviken (Årstavägen) är ett modernt, naturskönt alternativ, inte den gamla vägen.</p>
            <p>• <strong>Årstafältet – aktuellt:</strong> gc-vägen över fältet är permanent avstängd sedan 2 juni 2025 (stadsbygget); omledning via Åbyvägen och söder om Östbergavägen. Vallastråket öppnar tidigast hösten 2026.</p>
            <p>• <strong>Årstafältets vägbank</strong> dateras till minst 1600-talet; medeltida fynd finns men det är <em>osäkert</em> om de direkt kan kopplas till vägens medeltida sträckning (liknande vid Glömsta). Källa: SLM 2025.</p>
            <p>• <strong>Ragnhildsborg/Telge hus:</strong> koordinat verifierad (RAÄ Östertälje 220:1); "lås till Mälaren" är en källstödd funktionstolkning, inte primärkällecitat. Medeltida (1300–1400-tal), ej vikingatida. Aktuellt Fornsök-L-nummer ej bekräftat.</p>
            <p>• Paleo-strandlinjen är DEM-härledd (Copernicus GLO-30 + landhöjningsmodell) och ungefärlig i stadskärnan.</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Källor: sv.wikipedia (Gamla Göta landsväg, Svartlöten, Svartlösa härad, Årstafältet, Flottsbro); RAÄ Botkyrka 389:1 & Brännkyrka 34:1 (Fornsök); Stockholms läns museum (D. Sahlén, "Göta landsväg – vägen som historisk källa och kulturmiljö", 2025 + skylt-PDF); runkorpus (Rundata, Sö 300/286/304). Strandlinjemetoden delas med <a href="/sv/staket" className="text-gold hover:underline">Stäket-sidan</a>.</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default GotaLandsvag;
