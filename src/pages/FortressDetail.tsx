import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArrowLeft, MapPin, Layers, Info, Mountain } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Generisk fornborgs-detaljvy (mall för samtliga borgar), testad på Mossberga.
// Kartan staplar AUKTORITATIVA, öppna lager: OSM-bas + SGU jordarter (geomorfologiskt material)
// + SGU berggrund — verifierade öppna WMS (CC-BY, ingen Geotorget-gate). Kommer: LiDAR-
// terrängskuggning (vallprofiler), RAÄ lämningsavgränsning (polygon via raa_number), ortofoto, bilder.

interface Fort {
  id: string; name: string; coordinates: { x: number; y: number } | string | null;
  raa_number: string | null; landscape: string; parish: string | null; municipality: string | null;
  fortress_type: string | null; description: string | null; period: string | null;
  cultural_significance: string | null; source_reference: string | null;
  dating_basis: string | null; dating_confidence: string | null; nearby_runestones: number | null;
}

const parseLatLng = (co: Fort['coordinates']): [number, number] | null => {
  if (!co) return null;
  if (typeof co === 'string') { const m = co.match(/\(([^,]+),([^)]+)\)/); return m ? [parseFloat(m[2]), parseFloat(m[1])] : null; }
  if (typeof co === 'object' && 'y' in co && 'x' in co) return [co.y, co.x];
  return null;
};

const SGU_JORD = 'https://resource.sgu.se/service/wms/130/jordarter-25-100-tusen';
const SGU_BERG = 'https://resource.sgu.se/service/wms/130/berggrund-50-250-tusen';

const FortressDetail = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { id } = useParams<{ id: string }>();
  const [fort, setFort] = useState<Fort | null>(null);
  const [similar, setSimilar] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await (supabase.from('swedish_hillforts') as any)
        .select('id,name,coordinates,raa_number,landscape,parish,municipality,fortress_type,description,period,cultural_significance,source_reference,dating_basis,dating_confidence,nearby_runestones')
        .eq('id', id).maybeSingle();
      if (error) { setErr(error.message); setLoading(false); return; }
      if (!data) { setErr('Borgen hittades inte'); setLoading(false); return; }
      setFort(data as Fort);
      const { count } = await (supabase.from('swedish_hillforts') as any)
        .select('id', { count: 'exact', head: true }).eq('landscape', (data as Fort).landscape);
      setSimilar(count ?? null);
      setLoading(false);
    })();
  }, [id]);

  // Karta + auktoritativt lager-stack (SGU öppna WMS som togglebara overlays).
  useEffect(() => {
    if (!fort || !containerRef.current || mapRef.current) return;
    const ll = parseLatLng(fort.coordinates);
    if (!ll) return;
    const map = L.map(containerRef.current, { center: ll, zoom: 15, scrollWheelZoom: true });
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    const jord = L.tileLayer.wms(SGU_JORD, { layers: 'JORD_25K_Grundlager', format: 'image/png', transparent: true, opacity: 0.55, attribution: 'Jordarter © SGU (CC-BY)' } as any);
    const berg = L.tileLayer.wms(SGU_BERG, { layers: 'BERG_50K_geologisk_enhet_yta', format: 'image/png', transparent: true, opacity: 0.55, attribution: 'Berggrund © SGU (CC-BY)' } as any);
    L.control.layers({ 'OpenStreetMap': osm }, {
      [sv ? 'Jordarter (SGU) — material' : 'Quaternary deposits (SGU)']: jord,
      [sv ? 'Berggrund (SGU)' : 'Bedrock (SGU)']: berg,
    }, { collapsed: false }).addTo(map);
    L.marker(ll).addTo(map).bindPopup(`<b>${fort.name}</b>`).openPopup();
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 80);
    return () => { map.remove(); mapRef.current = null; };
  }, [fort, sv]);

  const row = (label: string, val: React.ReactNode) => val ? (
    <div className="flex gap-2 text-sm"><span className="text-muted-foreground min-w-[130px]">{label}</span><span className="text-foreground">{val}</span></div>
  ) : null;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta title={fort ? `${fort.name} — fornborg` : 'Fornborg'} titleEn={fort ? `${fort.name} — hillfort` : 'Hillfort'}
        description={fort?.description ?? 'Fornborg i Viking Age-plattformen.'} descriptionEn={fort?.description ?? 'Hillfort.'} />
      <Header /><Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <Link to="/fortresses" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />{sv ? 'Till borgarna' : 'To fortresses'}
        </Link>

        {loading && <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>}
        {err && <p className="text-red-400">{err}</p>}

        {fort && (
          <>
            <h1 className="text-4xl font-bold text-foreground mb-1">{fort.name}</h1>
            <p className="text-muted-foreground mb-6">
              {[fort.fortress_type === 'ring_fortress' ? (sv ? 'Ringborg' : 'Ring fort') : (sv ? 'Fornborg' : 'Hillfort'),
                fort.period, fort.parish && `${fort.parish} sn`, fort.landscape].filter(Boolean).join(' · ')}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Karta med lager-stack */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 text-sm text-foreground mb-2"><Layers className="h-4 w-4 text-gold" />
                  {sv ? 'Karta — tänd SGU-lager för geomorfologi (material) och berggrund' : 'Map — toggle SGU layers for geomorphology and bedrock'}</div>
                <div ref={containerRef} className="w-full rounded-lg border border-border" style={{ height: '58vh', minHeight: 420 }} />
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><Mountain className="h-3 w-3" />
                  {sv ? 'Kommande lager: LiDAR-terrängskuggning (vallprofiler entydigt), RAÄ lämningsavgränsning (polygon via raa_number), ortofoto, foton. Kustnära borgar: SGU maringeologi/djup.' : 'Coming: LiDAR hillshade, RAÄ site boundary, orthophoto, photos.'}</p>
              </div>

              {/* Faktapanel */}
              <div className="space-y-4">
                <div className="viking-card rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold"><Info className="h-4 w-4 text-gold" />{sv ? 'Fakta' : 'Facts'}</div>
                  {row(sv ? 'Typ' : 'Type', fort.fortress_type)}
                  {row(sv ? 'Ålder' : 'Age', fort.period)}
                  {row(sv ? 'Dateringsgrund' : 'Dating basis', fort.dating_basis && `${fort.dating_basis}${fort.dating_confidence ? ` (${fort.dating_confidence})` : ''}`)}
                  {row(sv ? 'Socken' : 'Parish', [fort.parish, fort.municipality, fort.landscape].filter(Boolean).join(' · '))}
                  {row('RAÄ', fort.raa_number)}
                  {row(sv ? 'Runstenar i närheten' : 'Nearby runestones', fort.nearby_runestones != null ? String(fort.nearby_runestones) : null)}
                  {row(sv ? 'Läge' : 'Location', (() => { const ll = parseLatLng(fort.coordinates); return ll ? `${ll[0].toFixed(5)}°N ${ll[1].toFixed(5)}°E` : null; })())}
                </div>

                {similar != null && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm text-foreground"><MapPin className="h-4 w-4 text-gold inline mr-1" />
                      {sv ? <>Det finns <strong>{similar}</strong> borgar i {fort.landscape}.</> : <><strong>{similar}</strong> forts in {fort.landscape}.</>}</div>
                    <Link to="/fortresses" className="text-xs text-gold hover:underline">{sv ? 'Se alla borgar' : 'See all forts'} →</Link>
                  </div>
                )}

                {fort.description && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-1">{sv ? 'Beskrivning' : 'Description'}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{fort.description}</p>
                  </div>
                )}
                {fort.cultural_significance && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-1">{sv ? 'Varför den är intressant' : 'Significance'}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{fort.cultural_significance}</p>
                  </div>
                )}
                {fort.source_reference && <p className="text-[11px] text-muted-foreground">{sv ? 'Källa' : 'Source'}: {fort.source_reference}</p>}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FortressDetail;
