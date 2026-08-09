import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shapes, Info } from 'lucide-react';
import { createPlaceMedallion, MARKER_ICONS, MARKER_COLORS, markerColor, FEATURE_ICON } from '@/utils/map/placeMarker';

// /sv/kartsymboler — förhandsvisning av kartsymbol-glyferna (UX-agent). Visar de nya
// Lantmäteri-omritade streck-glyferna som medaljonger i olika storlekar (zoom) + live-karta
// mot ljus/mörk baskarta (hairline-poängen), så man ser hur de läser innan app-bred utrullning.

const NEW_GLYPHS: { key: string; label: string }[] = [
  { key: 'fornlamning', label: 'Fornlämning' }, { key: 'kulturminne', label: 'Kulturminne' },
  { key: 'begravningsplats', label: 'Begravningsplats' }, { key: 'bebyggelselamning', label: 'Bebyggelselämning' },
  { key: 'gruva', label: 'Gruva' }, { key: 'gruvhal', label: 'Gruvhål' },
  { key: 'bro', label: 'Bro' }, { key: 'vad', label: 'Vadställe' },
  { key: 'milstolpe', label: 'Milstolpe' }, { key: 'hus_herrgard', label: 'Herrgård' },
  { key: 'hus_slott', label: 'Slott' }, { key: 'torn', label: 'Torn' },
  { key: 'ruin', label: 'Ruin' }, { key: 'vaderkvarn', label: 'Väderkvarn' },
  { key: 'riksrose', label: 'Gränsröse' }, { key: 'sevardhet', label: 'Sevärdhet' },
  { key: 'badplats', label: 'Badplats' }, { key: 'fyr', label: 'Fyr' },
];
const NEW_KEYS = new Set(NEW_GLYPHS.map((g) => g.key));
const EXISTING = Object.keys(MARKER_ICONS).filter((k) => !NEW_KEYS.has(k));
const SIZES = [24, 30, 34, 40, 48];

// Rå medaljong-HTML utan etikett (vi ritar namnet själva så vi styr kontrast per bakgrund).
const medHtml = (key: string, size: number, hairline: boolean) =>
  (createPlaceMedallion({ color: markerColor(key), icon: key, label: '', size, hairline }) as unknown as { options: { html: string } }).options.html;

const Med: React.FC<{ icon: string; size: number; hairline: boolean }> = ({ icon, size, hairline }) => (
  <div style={{ width: size, height: size, position: 'relative' }} dangerouslySetInnerHTML={{ __html: medHtml(icon, size, hairline) }} />
);

const PreviewMap: React.FC<{ dark: boolean; hairline: boolean }> = ({ dark, hairline }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const layerRef = useRef<L.LayerGroup>(L.layerGroup());

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { center: [57.0, 16.55], zoom: 9, scrollWheelZoom: true });
    layerRef.current.addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Baskarta (ljus OSM / mörk CartoDB) + markörer ritas om vid ändrat läge.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) { map.removeLayer(tileRef.current); tileRef.current = null; }
    tileRef.current = L.tileLayer(
      dark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: dark ? '© OpenStreetMap, © CARTO' : '© OpenStreetMap contributors', maxZoom: 18 },
    ).addTo(map);
    layerRef.current.clearLayers();
    // Sprid glyferna på ett rutnät så man kan zooma in/ut och se läsbarheten.
    NEW_GLYPHS.forEach((g, i) => {
      const row = Math.floor(i / 6), col = i % 6;
      const lat = 57.12 - row * 0.09, lng = 16.30 + col * 0.11;
      L.marker([lat, lng], {
        icon: createPlaceMedallion({ color: markerColor(g.key), icon: g.key, label: g.label, hairline }),
        title: g.label,
      }).addTo(layerRef.current);
    });
  }, [dark, hairline]);

  return <div ref={ref} className="w-full h-[440px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 440 }} />;
};

const KartsymbolerPreview = () => {
  const [hairline, setHairline] = useState(true);
  const [dark, setDark] = useState(false);

  // glyf → vilka feature_type/raa_type som mappar dit (reverse av FEATURE_ICON).
  const byGlyph = useMemo(() => {
    const m: Record<string, string[]> = {};
    Object.entries(FEATURE_ICON).forEach(([type, glyph]) => { (m[glyph] ??= []).push(type); });
    return m;
  }, []);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta title="Kartsymboler — förhandsvisning" titleEn="Map symbols — preview"
        description="Förhandsvisning av kartsymbol-glyferna (medaljong-stil) i olika storlekar och mot ljus/mörk baskarta." />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Shapes className="h-8 w-8 text-gold" /> Kartsymboler — förhandsvisning
          </h1>
          <p className="text-muted-foreground text-lg">
            De nya Lantmäteri-omritade streck-glyferna i medaljong-stil. Se hur de läser i olika storlekar
            (zoom) och mot ljus resp. mörk baskarta. Inget är utrullat i appen ännu — detta är för granskning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hairline} onChange={(e) => setHairline(e.target.checked)} />
            <span className="text-foreground">Hairline (ljus ytterkant — läsbar mot mörk baskarta)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Baskarta:</span>
            <button onClick={() => setDark(false)} className={`px-3 py-1 rounded ${!dark ? 'bg-gold text-slate-900 font-semibold' : 'border border-border text-muted-foreground'}`}>Ljus</button>
            <button onClick={() => setDark(true)} className={`px-3 py-1 rounded ${dark ? 'bg-gold text-slate-900 font-semibold' : 'border border-border text-muted-foreground'}`}>Mörk</button>
          </div>
        </div>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold"><Shapes className="h-5 w-5" /> Live-karta (zoombar)</CardTitle></CardHeader>
          <CardContent>
            <PreviewMap dark={dark} hairline={hairline} />
            <p className="text-xs text-muted-foreground mt-2 opacity-75">
              Zooma och panorera. Testa mörk baskarta med hairline av/på — poängen: en platt ringfärg räcker inte
              för kontrast mot både ljus och mörk karta, men diskens ljusa ytterkant (hairline) löser det (WCAG SC 1.4.11).
            </p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold">Storleksstege (26 → 48 px)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {NEW_GLYPHS.map((g) => (
                <div key={g.key} className="flex items-center gap-4 border-b border-border/40 pb-2">
                  <div className="w-32 shrink-0 text-sm text-foreground">{g.label}<div className="text-[10px] text-muted-foreground font-mono">{g.key}</div></div>
                  <div className="flex items-end gap-4 flex-1 bg-stone-100 rounded px-3 py-2">
                    {SIZES.map((s) => (<Med key={s} icon={g.key} size={s} hairline={hairline} />))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Card className="viking-card">
            <CardHeader className="pb-2"><CardTitle className="text-base text-gold">Mot ljus baskarta</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-3 bg-stone-100 rounded p-3">
              {NEW_GLYPHS.map((g) => (<div key={g.key} className="flex flex-col items-center gap-1 w-16"><Med icon={g.key} size={34} hairline={hairline} /><span className="text-[10px] text-slate-700 text-center leading-tight">{g.label}</span></div>))}
            </div></CardContent>
          </Card>
          <Card className="viking-card">
            <CardHeader className="pb-2"><CardTitle className="text-base text-gold">Mot mörk baskarta</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-3 rounded p-3" style={{ background: '#262626' }}>
              {NEW_GLYPHS.map((g) => (<div key={g.key} className="flex flex-col items-center gap-1 w-16"><Med icon={g.key} size={34} hairline={hairline} /><span className="text-[10px] text-stone-300 text-center leading-tight">{g.label}</span></div>))}
            </div></CardContent>
          </Card>
        </div>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold">Mappning: feature_type → glyf</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
              {NEW_GLYPHS.map((g) => (
                <div key={g.key} className="flex gap-2 border-b border-border/30 py-1">
                  <span className="shrink-0" style={{ color: MARKER_COLORS[g.key] }}>{g.label}</span>
                  <span className="text-muted-foreground truncate">{(byGlyph[g.key] || []).join(', ') || '—'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-base text-gold">Befintliga glyfer (för jämförelse)</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-3 bg-stone-100 rounded p-3">
            {EXISTING.map((k) => (<div key={k} className="flex flex-col items-center gap-1 w-16"><Med icon={k} size={34} hairline={hairline} /><span className="text-[10px] text-slate-700 text-center font-mono leading-tight">{k}</span></div>))}
          </div></CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Glyferna är omritade i medaljong-husstil (ej konverterade ur EPS). Färgtonerna är mätta för ≥3:1;
          hairline bär kontrasten mot mörk baskarta. Godkänner du dem rullar vi ut dem app-brett (MARKER_ICONS +
          FEATURE_ICON i legend och kartlager) och fixar tillhörande WCAG-brister.</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default KartsymbolerPreview;
