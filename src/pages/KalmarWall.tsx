import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArrowLeft, Anchor, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Dedikerad Kalmar-sida: medeltida stadsmur med tidsslider (fyrdatumsmodell → opacitet),
// osäkerhetshalo och evidensstyrd linjestil. Template för Visby/Stockholm/Viborg.

const SITE = 'Kalmar gamla stad';
const CENTER: [number, number] = [56.6598, 16.3520];

// Evidens = hederlighetsaxeln: färg + streckmönster.
const EVIDENCE: Record<string, { color: string; dash?: string; sv: string; en: string }> = {
  utgravd:      { color: '#22c55e', dash: undefined, sv: 'Utgrävd', en: 'Excavated' },
  dokumenterad: { color: '#0ea5e9', dash: '8 6',    sv: 'Dokumenterad', en: 'Documented' },
  rekonstruerad:{ color: '#eab308', dash: '3 7',    sv: 'Rekonstruerad', en: 'Reconstructed' },
  hypotetisk:   { color: '#94a3b8', dash: '1 8',    sv: 'Hypotetisk', en: 'Hypothetical' },
};

interface FortFeature {
  type: 'Feature';
  geometry: GeoJSON.Geometry;
  properties: {
    name: string | null; type: string; evidence: string; accuracy_m: number | null;
    certainty: number; span: string; halo: GeoJSON.Geometry | null;
    sources: { citation: string | null; archive: string | null; url: string | null }[];
  };
}

const KalmarWall = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [year, setYear] = useState(1400);
  const [count, setCount] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const reqIdRef = useRef(0);

  // Init karta + halo/mur-paner (halo under linjerna).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: CENTER, zoom: 15, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    map.createPane('halo'); map.getPane('halo')!.style.zIndex = '350';
    map.createPane('walls'); map.getPane('walls')!.style.zIndex = '400';
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 80);

    // Kalmar gamla hamn ur harbors-tabellen.
    (supabase.from('harbors') as unknown as { select: (c: string) => any }).select('name, name_en, lat, lng, shoreline_note')
      .then(({ data }: { data: { name: string; name_en: string | null; lat: number | null; lng: number | null; shoreline_note: string | null }[] | null }) => {
        (data ?? []).filter((h) => h.name.includes('Kalmar') && h.lat != null).forEach((h) => {
          L.marker([h.lat!, h.lng!]).addTo(map)
            .bindPopup(`<strong>⚓ ${sv ? h.name : (h.name_en || h.name)}</strong>${h.shoreline_note ? `<br/>${h.shoreline_note}` : ''}`);
        });
      });

    return () => { map.remove(); mapRef.current = null; };
  }, [sv]);

  // Rita om vid årsändring — debounce 150 ms + stale-guard (undvik race).
  useEffect(() => {
    const id = ++reqIdRef.current;
    const t = setTimeout(async () => {
      const { data, error } = await (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ data: { features: FortFeature[] } | null; error: unknown }>)(
        'fort_at', { p_year: year, p_site: SITE, p_min_certainty: 0.01 });
      if (id !== reqIdRef.current) return; // stale svar
      const map = mapRef.current, grp = layerRef.current;
      if (error || !data || !map || !grp) return;
      grp.clearLayers();
      setCount(data.features.length);
      for (const f of data.features) {
        const p = f.properties;
        const ev = EVIDENCE[p.evidence] ?? EVIDENCE.hypotetisk;
        const opacity = 0.25 + 0.75 * (p.certainty ?? 1);
        if (p.halo) {
          L.geoJSON(p.halo, { pane: 'halo', style: { stroke: false, fillColor: ev.color, fillOpacity: 0.1 * (p.certainty ?? 1) } }).addTo(grp);
        }
        const popup = `<strong>${p.name ?? p.type}</strong><br/>${(sv ? ev.sv : ev.en)} · ±${p.accuracy_m ?? '?'} m<br/><span style="opacity:.7">${p.span}</span>`
          + (p.sources?.length ? `<br/><small>${p.sources.map((s) => s.citation).filter(Boolean).join('; ')}</small>` : '');
        L.geoJSON(f.geometry, {
          pane: 'walls',
          style: { color: ev.color, weight: 3, opacity, dashArray: ev.dash },
          pointToLayer: (_ft, latlng) => L.circleMarker(latlng, { pane: 'walls', radius: 6, color: '#1c1917', weight: 1, fillColor: ev.color, fillOpacity: opacity }),
        }).bindPopup(popup).addTo(grp);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [year, sv]);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Kalmar medeltida stadsmur — tidskarta"
        titleEn="Kalmar medieval city wall — time map"
        description="Interaktiv rekonstruktion av Kalmar gamla stads medeltida stadsmur med tidsslider, källkritik och osäkerhetsband."
        descriptionEn="Interactive reconstruction of the medieval city wall of old Kalmar with a time slider, source criticism and uncertainty bands." />
      <Header /><Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />{sv ? 'Till kartan' : 'To the map'}
        </Link>
        <h1 className="text-4xl font-bold text-foreground mb-2">{sv ? 'Kalmar medeltida stadsmur' : 'Kalmar medieval city wall'}</h1>
        <p className="max-w-3xl text-muted-foreground mb-6">{sv
          ? 'Kalmars gamla stad låg på fastlandet vid slottet innan den flyttades till Kvarnholmen på 1640–1660-talen. Dra i tidsreglaget för att se stadsmuren växa fram och rivas. Linjens genomskinlighet speglar hur säker dateringen är just det året; det halvtransparenta bandet visar lägesosäkerheten — vi låtsas inte om skarpare precision än vi har.'
          : 'Old Kalmar lay on the mainland by the castle before it was moved to Kvarnholmen in the 1640s–1660s. Drag the time slider to watch the wall rise and be demolished. Line opacity reflects dating certainty for that year; the semi-transparent band shows positional uncertainty — we do not pretend to more precision than we have.'}</p>

        <div className="viking-card rounded-lg border border-border p-4 mb-4">
          <label htmlFor="yearslider" className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{sv ? 'År' : 'Year'}</span>
            <span className="text-2xl font-bold tabular-nums text-gold">{year}</span>
          </label>
          <input id="yearslider" type="range" min={1250} max={1700} step={5} value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-valuetext={`${year}`} className="w-full accent-[#eab308]" />
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1"><span>1250</span><span>1450</span><span>1700</span></div>
          <div aria-live="polite" className="sr-only">{count != null ? `${count} ${sv ? 'element synliga år' : 'elements visible in year'} ${year}` : ''}</div>
        </div>

        <div ref={containerRef} className="w-full rounded-lg border border-border mb-3" style={{ height: '60vh', minHeight: 420 }} />

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm mb-6">
          {Object.entries(EVIDENCE).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="inline-block w-6 border-t-2" style={{ borderColor: v.color, borderStyle: v.dash ? 'dashed' : 'solid' }} />
              {sv ? v.sv : v.en}
            </span>
          ))}
          <span className="inline-flex items-center gap-2 text-muted-foreground"><Anchor className="h-4 w-4" />{sv ? 'Gamla hamnen' : 'Old harbour'}</span>
        </div>

        <div className="viking-card rounded-lg border border-border p-4 flex gap-3 max-w-3xl">
          <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">{sv
            ? 'Geometrin är en preliminär rekonstruktion från bevarade landmärken (Skansgatan, kyrkogården, gatunät, slottet) och Arkeologernas beskrivning — inte georefererad precision. Den ersätts segment för segment av geometri georefererad i QGIS mot Pahrs karta 1585 och Lantmäteriets historiska kartor. Källa per segment visas i popupen.'
            : 'The geometry is a preliminary reconstruction from surviving landmarks (Skansgatan, the cemetery, the street grid, the castle) and the Arkeologerna account — not georeferenced precision. It will be replaced segment by segment with geometry georeferenced in QGIS against Pahr\'s 1585 map and the National Land Survey\'s historical maps. Per-segment sources appear in the popup.'}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KalmarWall;
