import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Castle, Clock, MapPin, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMedievalCastles, type MedievalCastle } from '@/hooks/useMedievalCastles';
import { useFortificationPhases } from '@/hooks/useFortificationPhases';

// /sv/medeltidsborgar — medeltida borgar (heritage_sites) med intra-site-fas-tidslinje (fortification_phases).
// Löser den tidigare blockeringen: phases hade ingen detaljsida att visas på.

const FUNC: Record<string, { sv: string; en: string; color: string }> = {
  defense: { sv: 'Försvar', en: 'Defense', color: '#b45309' },
  control_trade: { sv: 'Handel & skatt', en: 'Trade & tax', color: '#0ea5e9' },
  administrative: { sv: 'Administrativ', en: 'Administrative', color: '#8b5cf6' },
  royal_residence: { sv: 'Kunglig residens', en: 'Royal residence', color: '#d4a63c' },
};
const SITING: Record<string, { sv: string; en: string }> = {
  defensible_height: { sv: 'på höjd', en: 'on a height' },
  logistics_hub: { sv: 'logistikläge', en: 'logistics hub' },
  island_chokepoint: { sv: 'ö/sund-strypning', en: 'island chokepoint' },
};
const yearFmt = (y?: number) => (y == null ? '' : y < 0 ? `${Math.abs(y)} f.Kr.` : `${y}`);

const CastleMap: React.FC<{ castles: MedievalCastle[]; onSelect: (c: MedievalCastle) => void; selectedId?: string }> = ({ castles, onSelect, selectedId }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect); onSelectRef.current = onSelect;

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { preferCanvas: true, center: [58.5, 15.5], zoom: 5, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const layer = layerRef.current, map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    castles.forEach((c) => {
      const hl = c.id === selectedId;
      L.circleMarker([c.coordinates.lat, c.coordinates.lng], { radius: hl ? 9 : 6, color: '#7b3f00', weight: 2, fillColor: hl ? '#d4a63c' : '#7b3f00', fillOpacity: 0.8 })
        .on('click', () => onSelectRef.current(c))
        .bindTooltip(c.name, { direction: 'top' })
        .addTo(layer);
    });
    if (castles.length) { try { map.fitBounds(L.latLngBounds(castles.map((c) => [c.coordinates.lat, c.coordinates.lng] as [number, number])), { padding: [40, 40], maxZoom: 8 }); } catch { /* ignore */ } }
  }, [castles, selectedId]);

  return <div ref={ref} className="w-full h-[480px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 480 }} />;
};

const PhaseTimeline: React.FC<{ castle: MedievalCastle }> = ({ castle }) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { phases } = useFortificationPhases(castle.id);
  return (
    <Card className="viking-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gold"><Castle className="h-5 w-5" /> {castle.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        {phases.length === 0 ? (
          <p className="text-xs">{sv ? 'Inga registrerade byggnadsfaser ännu för denna borg.' : 'No recorded building phases yet for this castle.'}</p>
        ) : (
          <ol className="border-l border-border pl-3 space-y-3">
            {phases.map((p, i) => {
              const fn = p.function ? FUNC[p.function] : undefined;
              const st = p.siting ? SITING[p.siting] : undefined;
              return (
                <li key={i}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gold font-medium">{yearFmt(p.period_start)}{p.period_end ? `–${yearFmt(p.period_end)}` : ''}</span>
                    <span className="text-foreground">{p.phase_name}</span>
                    {fn && <Badge variant="outline" className="text-[10px]" style={{ borderColor: fn.color, color: fn.color }}>{sv ? fn.sv : fn.en}</Badge>}
                    {st && <span className="text-[10px] text-muted-foreground">({sv ? st.sv : st.en})</span>}
                    {p.confidence === 'approximate' && <span className="text-[10px] text-amber-300">≈</span>}
                  </div>
                  {p.description && <p className="text-xs mt-1">{p.description}</p>}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

const Medeltidsborgar = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { castles } = useMedievalCastles(true);
  const [selected, setSelected] = useState<MedievalCastle | null>(null);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Medeltida borgar — byggnadsfaser och funktion"
        titleEn="Medieval castles — building phases and function"
        description="Sveriges medeltida borgar (Kalmar slott, Telge hus/Ragnhildsborg, Almarestäket, Kronobergs slott, Glimmingehus) med intra-site fas-tidslinje: hur platsen byggdes om över tid, och skiftande funktion (försvar / handel & skatt / administrativ / kunglig)."
        descriptionEn="Sweden's medieval castles with an intra-site phase timeline showing how each site was rebuilt over time and its shifting function (defense / trade & tax / administrative / royal)."
        keywords="medeltida borgar, Kalmar slott, Telge hus, Almarestäket, Kronobergs slott, Glimmingehus, byggnadsfaser, fästning"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Castle className="h-8 w-8 text-gold" />
            {sv ? 'Medeltida borgar' : 'Medieval castles'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {sv
              ? 'Klicka en borg för dess fas-tidslinje — hur platsen byggdes om över tid och hur funktionen skiftade (försvar → handel & skatt → kunglig residens). Skild kategori från förhistoriska fornborgar.'
              : 'Click a castle for its phase timeline — how the site was rebuilt over time and how its function shifted. A category distinct from prehistoric hillforts.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> {sv ? 'Karta' : 'Map'} ({castles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <CastleMap castles={castles} onSelect={setSelected} selectedId={selected?.id} />
                <div className="flex flex-wrap gap-2 mt-3">
                  {castles.map((c) => (
                    <button key={c.id} onClick={() => setSelected(c)}
                      className={`text-xs px-2 py-1 rounded border ${selected?.id === c.id ? 'bg-gold/20 border-gold text-gold' : 'border-border text-muted-foreground hover:border-gold/50'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            {selected ? (
              <PhaseTimeline castle={selected} />
            ) : (
              <Card className="viking-card">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  <Clock className="h-8 w-8 text-gold mx-auto mb-3 opacity-70" />
                  {sv ? 'Välj en borg för dess byggnadsfaser (kastal → borg → slott).' : 'Select a castle for its building phases.'}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{sv
            ? 'Faser ur fortification_phases (belagt/approximativt märkt). Funktion/läge kodar försvar-vs-handel/skatt-axeln. Källor i respektive borgpost (heritage_sites).'
            : 'Phases from fortification_phases (marked documented/approximate). Function/siting encode the defense-vs-trade axis.'}</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Medeltidsborgar;
