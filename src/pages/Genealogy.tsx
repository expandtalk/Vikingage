import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, ShieldCheck, MapPin, ScrollText, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { parseGedcom, parishOf, yearOf, type GPerson } from '@/utils/gedcom';

interface Parish { name: string; lat: number; lng: number; persons: { name: string; year: number | null }[]; }

const GenMap: React.FC<{ parishes: Parish[]; onSelect: (p: Parish) => void; shoreYear: number | null; selected: Parish | null; radius: number }> = ({ parishes, onSelect, shoreYear, selected, radius }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  useShorelineOverlay(mapRef, shoreYear);

  // Räckviddscirkel (~gångavstånd) runt vald socken
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }
    if (selected) {
      circleRef.current = L.circle([selected.lat, selected.lng], { radius, color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: 0.08 }).addTo(map);
      map.fitBounds(circleRef.current.getBounds(), { padding: [30, 30] });
    }
  }, [selected, radius]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [59, 15], zoom: 5, scrollWheelZoom: true });
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
    parishes.forEach((p) => {
      pts.push([p.lat, p.lng]);
      const r = Math.min(14, 5 + p.persons.length);
      const names = p.persons.slice(0, 12).map((x) => `${x.name}${x.year ? ` (${x.year})` : ''}`).join('<br>');
      L.circleMarker([p.lat, p.lng], { radius: r, color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.35 })
        .bindTooltip(`${p.name} · ${p.persons.length}`, { direction: 'top' })
        .bindPopup(`<b>${p.name}</b> — ${p.persons.length} anfäder<br><span style="font-size:11px;color:#666">${names}</span><br><a href="#" style="font-size:11px" data-parish="${p.name}">Visa bygd-dossier →</a>`)
        .on('popupopen', () => setTimeout(() => { const a = document.querySelector(`a[data-parish="${p.name}"]`); if (a) a.addEventListener('click', (e) => { e.preventDefault(); onSelect(p); }); }, 30))
        .addTo(layer);
    });
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 9 });
  }, [parishes, onSelect]);

  return <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 520 }} />;
};

const Genealogy = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [persons, setPersons] = useState<GPerson[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [shoreYear, setShoreYear] = useState<number | null>(null);
  const [selected, setSelected] = useState<Parish | null>(null);
  const [radius, setRadius] = useState(4000);
  const [nearby, setNearby] = useState<{ kind: string; name: string; raa_type: string | null; lat: number; lng: number; dist_m: number }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const readFile = (f: File) => {
    setFileName(f.name);
    const r = new FileReader();
    r.onload = (e) => setPersons(parseGedcom(String(e.target?.result || '')));
    r.readAsText(f, 'UTF-8');
  };

  // Bygg socken-lista + geokoda mot publika place_names (RPC). Släktdata stannar i browsern.
  useEffect(() => {
    if (!persons.length) { setParishes([]); return; }
    const map = new Map<string, { name: string; persons: { name: string; year: number | null }[] }>();
    persons.forEach((p) => {
      [[p.birt.plac, yearOf(p.birt.date)], [p.deat.plac, yearOf(p.deat.date)]].forEach(([plac, yr]) => {
        const par = parishOf(plac as string); if (!par) return;
        const k = par.toLowerCase();
        if (!map.has(k)) map.set(k, { name: par, persons: [] });
        if (!map.get(k)!.persons.some((x) => x.name === (p.name || '?'))) map.get(k)!.persons.push({ name: p.name || '?', year: yr as number | null });
      });
    });
    const names = [...map.values()].map((v) => v.name);
    if (!names.length) { setParishes([]); return; }
    setLoading(true);
    (supabase.rpc as any)('geocode_places', { names }).then(({ data }: { data: { name: string; lat: number; lng: number }[] | null }) => {
      const coords = new Map((data ?? []).map((d) => [d.name.toLowerCase(), d]));
      const out: Parish[] = [];
      map.forEach((v, k) => { const c = coords.get(k); if (c) out.push({ name: v.name, lat: c.lat, lng: c.lng, persons: v.persons }); });
      setParishes(out);
      setLoading(false);
    });
  }, [persons]);

  // Räckvidd: vad kunde anfadern nå till fots (~5000 steg) från socknen?
  useEffect(() => {
    if (!selected) { setNearby(null); return; }
    (supabase.rpc as any)('features_near', { p_lat: selected.lat, p_lng: selected.lng, radius_m: radius })
      .then(({ data }: { data: { kind: string; name: string; raa_type: string | null; lat: number; lng: number; dist_m: number }[] | null }) => setNearby(data ?? []));
  }, [selected, radius]);

  const geocoded = parishes.length;
  const mappedPersons = useMemo(() => new Set(parishes.flatMap((p) => p.persons.map((x) => x.name))).size, [parishes]);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Släktforskning i landskapet"
        titleEn="Genealogy in the landscape"
        description="Släpp din GEDCOM och se anfäderna i sitt landskap: socknarna på kartan med forntida strandlinje och en bygd-dossier (runstenar, fornborgar, avrättningsplatser, kyrkor) ur vår databas. Klientsidigt — din släktdata lämnar aldrig webbläsaren."
        descriptionEn="Drop your GEDCOM and see your ancestors in their landscape: parishes on the map with ancient shorelines and a district dossier from our database. Client-side — your data never leaves the browser."
        keywords="släktforskning, genealogi, GEDCOM, anfäder, socken, landskap, runstenar, arkeologi"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3"><ScrollText className="h-8 w-8 text-gold" />{sv ? 'Släktforskning i landskapet' : 'Genealogy in the landscape'}</h1>
          <p className="text-gold/90 text-sm font-medium mb-3">{sv ? 'Se anfäderna i sin bygd och djuptid — inte bara som namn och datum' : 'See your ancestors in their district and deep time'}</p>
          <p className="text-muted-foreground text-lg">{sv
            ? <>Släpp din <b>GEDCOM</b>-fil så placerar vi varje anfaders <b>socken</b> på kartan, med bygdens <b>forntida strandlinje</b> (landhöjningen) och en <b>bygd-dossier</b> ur vår databas: runstenar, fornborgar, avrättningsplatser, tingsplatser, kyrkor. Det traditionell släktforskning inte ger — anfadern i sitt landskap.</>
            : <>Drop your <b>GEDCOM</b> and we place each ancestor's <b>parish</b> on the map with the district's ancient shoreline and a heritage dossier from our database.</>}</p>
        </div>

        <Card className="viking-card mb-4 border-emerald-700/40">
          <CardContent className="py-3 text-sm text-emerald-200 flex items-start gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{sv
              ? <><b>Integritet:</b> din släktfil läses <b>enbart i din webbläsare</b> och laddas aldrig upp. Vi slår bara upp publika sockennamn för att rita kartan. Ingen inloggning, inget sparas hos oss.</>
              : <><b>Privacy:</b> your file is read only in your browser and never uploaded. No login, nothing stored.</>}</span>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardContent className="py-5">
            <label className="block border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-gold transition-colors"
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); }}>
              <Upload className="h-7 w-7 text-gold mx-auto mb-2" />
              <div className="text-foreground font-medium">{sv ? 'Släpp en .ged-fil här, eller klicka för att välja' : 'Drop a .ged file, or click to choose'}</div>
              <div className="text-xs text-muted-foreground mt-1">{fileName ? `📄 ${fileName} · ${persons.length} personer` : (sv ? 'Exportera GEDCOM från ArkivDigital, MyHeritage, Disgen…' : 'Export GEDCOM from any genealogy program')}</div>
              <input type="file" accept=".ged,.gedcom" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
            </label>
            {persons.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">{loading ? (sv ? 'Geokodar socknar…' : 'Geocoding…') : (sv ? `${mappedPersons} av ${persons.length} anfäder placerade i ${geocoded} socknar. Klicka en socken för bygd-dossier.` : `${mappedPersons} of ${persons.length} ancestors placed in ${geocoded} parishes.`)}</p>
            )}
          </CardContent>
        </Card>

        {parishes.length > 0 && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> {sv ? 'Anfäderna på kartan' : 'Ancestors on the map'}</CardTitle></CardHeader>
            <CardContent>
              <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} />
              <GenMap parishes={parishes} onSelect={setSelected} shoreYear={shoreYear} selected={selected} radius={radius} />
              <p className="text-xs text-muted-foreground mt-2 opacity-75">{sv ? 'Guldring = socken där du har anfäder (större ring = fler). Strandlinjen visar bygdens forntida kustläge (SGU, 50–950 e.Kr.) — den djuptid gården ligger i.' : 'Gold = a parish with ancestors. Shoreline shows the district in deep time.'}</p>
            </CardContent>
          </Card>
        )}

        {selected && (
          <Card className="viking-card mb-4 border-gold/40">
            <CardHeader className="pb-2"><CardTitle className="text-base text-gold">{sv ? 'Inom gångavstånd från' : 'Within walking distance of'} {selected.name}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div>
                <div className="text-foreground font-medium mb-1">{sv ? 'Anfäder här' : 'Ancestors here'} ({selected.persons.length})</div>
                <div className="flex flex-wrap gap-1.5">{selected.persons.map((p, i) => <span key={i} className="inline-block bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs">{p.name}{p.year ? ` (${p.year})` : ''}</span>)}</div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-sky-300">{sv ? 'Räckvidd (dagsrörelse)' : 'Reach'}: ~{Math.round(radius / 0.75).toLocaleString('sv-SE')} {sv ? 'steg' : 'steps'} ({(radius / 1000).toFixed(1)} km)</span>
                </div>
                <input type="range" min={1000} max={10000} step={500} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-sky-500" />
                <p className="text-[11px] opacity-70">{sv ? 'En människa gick ~5000 steg om dagen — det här var anfaderns rimliga vardagsvärld.' : 'A person walked ~5000 steps a day — this was the ancestor’s everyday world.'}</p>
              </div>
              {!nearby ? <p>{sv ? 'Hämtar…' : 'Loading…'}</p> : nearby.length === 0 ? (
                <p className="text-xs opacity-70">{sv ? 'Inga registrerade lämningar inom radien ännu.' : 'Nothing registered within range yet.'}</p>
              ) : (
                <>
                  {(() => { const church = nearby.find((f) => f.kind === 'church' || /kyrka/i.test(f.raa_type || '')); return church ? (
                    <div className="text-foreground">⛪ <b>{sv ? 'Kyrkan' : 'The church'}:</b> {church.name} — {church.dist_m < 1000 ? `${church.dist_m} m` : `${(church.dist_m / 1000).toFixed(1)} km`} {sv ? 'bort' : 'away'}</div>
                  ) : null; })()}
                  <div>
                    <div className="text-foreground font-medium mb-1">{sv ? 'Att se inom räckvidd' : 'Within reach'} ({nearby.length})</div>
                    <div className="max-h-64 overflow-y-auto pr-1">
                      {nearby.map((f, i) => {
                        const isRune = f.kind === 'runestone';
                        const to = isRune ? `/inscription/${encodeURIComponent(f.raa_type || '')}` : `/explore?center=${f.lat},${f.lng}&zoom=14`;
                        const icon = f.kind === 'church' ? '⛪' : isRune ? 'ᚱ' : /hällrist/i.test(f.raa_type || '') ? '🪨' : '▪';
                        return (
                          <Link key={i} to={to} title={isRune ? (sv ? 'Öppna runinskriften' : 'Open the inscription') : (sv ? 'Öppna på kartan' : 'Open on the map')}
                            className="flex items-baseline gap-2 text-xs py-0.5 border-b border-slate-800/50 hover:bg-slate-800/40 rounded">
                            <span className="text-sky-300 font-mono shrink-0 w-14 text-right">{f.dist_m < 1000 ? f.dist_m + ' m' : (f.dist_m / 1000).toFixed(1) + ' km'}</span>
                            <span className="hover:underline"><span className={isRune ? 'text-amber-400' : ''}>{icon}</span> {f.name} {!isRune && <span className="opacity-60">{f.raa_type || ''}</span>} <span className="text-sky-400">↗</span></span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-[11px] opacity-70">{sv ? 'Ur vår publika databas (RAÄ Fornsök, kyrkor m.fl.). Fågelvägen från sockencentroiden.' : 'From our public database, as-the-crow-flies from the parish centroid.'}</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 text-sky-300 shrink-0 mt-0.5" />
          {sv ? 'Geokodning sker på sockennamn mot Lantmäteriets ortnamn — namnkrockar (t.ex. flera "Torslunda") kan ge ungefärligt läge. Lägg till län i din GEDCOM för bättre träff.' : 'Geocoding matches parish names; name clashes may be approximate.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Genealogy;
