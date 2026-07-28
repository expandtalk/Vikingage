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

interface RcDate { cal_from: number | null; cal_to: number | null; cal_sigma: string | null; material: string | null; context: string | null; source: string | null; note: string | null; }
interface Geochem { element: string; higher_in: string | null; significant: boolean | null; interpretation: string | null; }
interface MetalAn { find_ref?: string | null; system: string; value: number | null; unit: string | null; note: string | null; }
interface MaterialAn { find_ref: string | null; material: string | null; method: string | null; result: string | null; provenance_interpretation: string | null; }
interface Inv { title: string; year_from: number | null; investigation_type: string | null; source_institution: string | null; }

const yr = (n: number | null | undefined) => n == null ? '' : n < 0 ? `${-n} f.Kr.` : `${n} e.Kr.`;

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
  const [rc, setRc] = useState<RcDate[]>([]);
  const [geochem, setGeochem] = useState<Geochem[]>([]);
  const [metal, setMetal] = useState<MetalAn[]>([]);
  const [material, setMaterial] = useState<MaterialAn[]>([]);
  const [invs, setInvs] = useState<Inv[]>([]);
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

  // Forensik-lager (14C, geokemi, arkeometri, undersökningshistorik) — var för sig, tål tomt/fel.
  useEffect(() => {
    if (!id) return;
    (async () => {
      const sb = supabase as any;
      const [rcR, gcR, maR, matR, relR] = await Promise.all([
        sb.from('radiocarbon_dates').select('cal_from,cal_to,cal_sigma,material,context,source,note').eq('object_id', id).order('cal_from'),
        sb.from('site_geochemistry').select('element,higher_in,significant,interpretation').eq('hillfort_id', id).order('element'),
        sb.from('metal_analyses').select('system,value,unit,note').eq('object_id', id),
        sb.from('material_analyses').select('find_ref,material,method,result,provenance_interpretation').eq('object_id', id),
        sb.from('relationship').select('object_id').eq('subject_id', id).eq('predicate', 'investigated_by'),
      ]);
      setRc(rcR.data ?? []);
      setGeochem(gcR.data ?? []);
      setMetal(maR.data ?? []);
      setMaterial(matR.data ?? []);
      const invIds = (relR.data ?? []).map((r: { object_id: string }) => r.object_id);
      if (invIds.length) {
        const { data } = await sb.from('archaeological_investigations')
          .select('title,year_from,investigation_type,source_institution').in('id', invIds).order('year_from');
        setInvs(data ?? []);
      }
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

            {/* Forensik: 14C, geokemi, arkeometri, undersökningshistorik */}
            {(rc.length > 0 || geochem.length > 0 || metal.length > 0 || material.length > 0 || invs.length > 0) && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {rc.length > 0 && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-2">{sv ? '¹⁴C-dateringar' : 'Radiocarbon dates'}</div>
                    <ul className="space-y-2">
                      {rc.map((d, i) => (
                        <li key={i} className="text-sm">
                          <span className="text-gold font-medium">{yr(d.cal_from)}–{yr(d.cal_to)}</span>
                          {d.cal_sigma && <span className="text-muted-foreground"> ({d.cal_sigma})</span>}
                          {d.material && <span className="text-muted-foreground"> · {d.material}</span>}
                          {d.context && <div className="text-xs text-muted-foreground">{d.context}</div>}
                          {d.note && <div className="text-xs text-muted-foreground italic">{d.note}</div>}
                        </li>
                      ))}
                    </ul>
                    {rc[0]?.source && <p className="text-[11px] text-muted-foreground mt-2">{sv ? 'Källa' : 'Source'}: {rc[0].source}</p>}
                  </div>
                )}

                {geochem.length > 0 && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-2">{sv ? 'Geokemi (XRF) — funktionsindelning' : 'Geochemistry (XRF)'}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {geochem.filter((g) => g.significant).map((g, i) => (
                        <span key={i} title={g.interpretation ?? ''}
                          className="text-xs px-2 py-0.5 rounded border border-border text-foreground">
                          {g.element} <span className="text-muted-foreground">↑ {g.higher_in}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">{sv ? 'Signifikant förhöjda grundämnen per borgdel (hovra för tolkning). Östra ringen: föda + kopparlegeringshantverk; mellersta: järn.' : 'Elements significantly enriched per fort segment (hover for interpretation).'}</p>
                  </div>
                )}

                {(metal.length > 0 || material.length > 0) && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-2">{sv ? 'Arkeometri' : 'Archaeometry'}</div>
                    {metal.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-muted-foreground mb-1">{sv ? 'Metallanalys (XRF)' : 'Metal analysis (XRF)'}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {metal.map((m, i) => (
                            <span key={i} title={m.note ?? ''} className="text-xs px-2 py-0.5 rounded border border-border text-foreground">
                              {m.system} {m.value != null ? `${m.value}${m.unit === 'mass%' ? '%' : ` ${m.unit ?? ''}`}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {material.map((m, i) => (
                      <div key={i} className="text-xs text-muted-foreground mb-1">
                        <span className="text-foreground">{m.find_ref} · {m.material}</span> ({m.method}): {m.provenance_interpretation ?? m.result}
                      </div>
                    ))}
                  </div>
                )}

                {invs.length > 0 && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-2">{sv ? 'Undersökningshistorik' : 'Investigation history'}</div>
                    <ul className="space-y-1">
                      {invs.map((v, i) => (
                        <li key={i} className="text-sm text-foreground">
                          <span className="text-gold">{v.year_from}</span> · {v.title}
                          {v.source_institution && <div className="text-[11px] text-muted-foreground">{v.source_institution}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FortressDetail;
