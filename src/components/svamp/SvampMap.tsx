import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Search, Loader2, CloudRain, Compass } from 'lucide-react';

// Platsmedveten svampkarta för /sv/svamp. ÄRLIGHET / INGEN GISSNING: vi har INGEN egen svampfyndsdata
// (att strö ut gissade svampställen vore både källkritiskt otillåtet OCH en säkerhetsrisk). Kartan visar
// därför RIKTIGA FÖRHÅLLANDEN — nederbörd ur SMHI:s öppna prognos-API (pmp3g, nyckelfri) för den valda
// platsen — eftersom regn är svampens starkaste signal. Var svampen FAKTISKT växer beror även på skogstyp/
// marktäcke; det lagret (Naturvårdsverkets NMD) är ett kommande dataspår, inte något vi gissar här.

interface Props { sv: boolean }

interface Rain { next24: number; next72: number; tmax: number | null }

// SMHI snow1g v1 punktprognos (pmp3g v2 deprekerades 2026-03-31). timeSeries[].data bär
// precipitation_amount_mean (mm per intervall) + air_temperature. Ackumulerar nederbörd 24h/72h
// framåt och tar maxtemp 72h (varm mark = bättre svampförhållanden).
async function fetchRain(lat: number, lng: number): Promise<Rain | null> {
  const url = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${lng.toFixed(4)}/lat/${lat.toFixed(4)}/data.json`;
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    const d = await r.json();
    const ts: any[] = d?.timeSeries || [];
    if (!ts.length) return null;
    const now = new Date(ts[0].time).getTime();
    let next24 = 0, next72 = 0, tmax: number | null = null;
    for (const e of ts) {
      const hAhead = (new Date(e.time).getTime() - now) / 3.6e6;
      const mm = e.data?.precipitation_amount_mean ?? 0;   // mm för intervallet → summera
      const temp = e.data?.air_temperature;
      if (hAhead <= 24) next24 += mm;
      if (hAhead <= 72) { next72 += mm; if (typeof temp === 'number') tmax = tmax === null ? temp : Math.max(tmax, temp); }
    }
    return { next24: Math.round(next24 * 10) / 10, next72: Math.round(next72 * 10) / 10, tmax: tmax === null ? null : Math.round(tmax) };
  } catch { return null; }
}

// Svampomdöme (grov, ÄRLIG heuristik — regn = flush-signal, ej fyndgaranti). Väger in maxtemp:
// under ~8°C mognar det trögt oavsett regn.
const rainVerdict = (mm72: number, tmax: number | null, sv: boolean) => {
  if (tmax !== null && tmax < 8)
    return sv ? 'Kyligt: även med regn går tillväxten trögt under ~8 °C.' : 'Cold: growth is slow below ~8 °C even with rain.';
  return mm72 >= 15 ? (sv ? 'Gynnsamt: rejält regn väntas — bra flush-signal om marken är varm.' : 'Favourable: substantial rain expected.')
    : mm72 >= 5 ? (sv ? 'Ganska bra: en del regn väntas.' : 'Fairly good: some rain expected.')
    : (sv ? 'Torrt: lite regn väntas — vänta gärna på nästa regnperiod.' : 'Dry: little rain expected.');
};

export const SvampMap: React.FC<Props> = ({ sv }) => {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const rainLayerRef = useRef<L.LayerGroup | null>(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [rain, setRain] = useState<Rain | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [params] = useSearchParams();

  useEffect(() => {
    if (mapRef.current || !mapEl.current) return;
    const m = L.map(mapEl.current, { scrollWheelZoom: true }).setView([62.0, 15.0], 5);
    // Bas-lager-växlare: Karta (OSM), Terräng (OpenTopoMap — visar skog/höjd), Satellit (Esri —
    // se DIREKT var skogen finns; svampens mark). Satellit/terräng svarar på "vilka marktyper".
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' });
    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '© OpenTopoMap (CC-BY-SA)' });
    const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: 'Esri, Maxar, Earthstar Geographics' });
    osm.addTo(m);
    L.control.layers(
      { [sv ? 'Karta' : 'Map']: osm, [sv ? 'Terräng' : 'Terrain']: topo, [sv ? 'Satellit' : 'Satellite']: sat },
      undefined, { collapsed: false, position: 'topright' },
    ).addTo(m);
    rainLayerRef.current = L.layerGroup().addTo(m);
    mapRef.current = m;
    setReady(true);
    setTimeout(() => { try { m.invalidateSize(); } catch { /* noop */ } }, 120);
    return () => { try { m.remove(); } catch { /* noop */ } mapRef.current = null; setReady(false); };
  }, [sv]);

  // Djuplänk från en plats (svarspanelens rail: /sv/svamp?lat=&lng=&plats=) → centrera + hämta
  // förhållanden där direkt, så "svampguide från Karlevistenen" visar den platsens omgivning.
  useEffect(() => {
    if (!ready) return;
    const lat = parseFloat(params.get('lat') || ''); const lng = parseFloat(params.get('lng') || '');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    go(lat, lng, params.get('plats') || (sv ? 'Vald plats' : 'Selected location'), 11);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Regional nederbörds-sondering: sampla ett 3×3-rutnät (~±0,35° ≈ 40 km) runt vald plats via SMHI
  // och rita färgade prickar → man SER åt vilket håll regnet fallit (Daniel: "kartan visar inte vart
  // jag ska åka"). Grön = gynnsamt (≥15 mm/72 h), gul = en del, röd = torrt.
  const drawRainGrid = async (lat: number, lng: number) => {
    const layer = rainLayerRef.current; if (!layer) return;
    layer.clearLayers();
    const steps = [-0.35, 0, 0.35];
    const pts = steps.flatMap((dLat) => steps.map((dLng) => ({ lat: lat + dLat, lng: lng + dLng / Math.cos((lat * Math.PI) / 180) })));
    const results = await Promise.all(pts.map(async (p) => ({ ...p, r: await fetchRain(p.lat, p.lng) })));
    for (const p of results) {
      if (!p.r) continue;
      const mm = p.r.next72;
      const color = mm >= 15 ? '#22c55e' : mm >= 5 ? '#eab308' : '#ef4444';
      L.circleMarker([p.lat, p.lng], { radius: 13, color, weight: 1, fillColor: color, fillOpacity: 0.45 })
        .bindTooltip(`${Math.round(mm)} mm / 72 h`, { direction: 'top' })
        .addTo(layer);
    }
  };

  const go = async (lat: number, lng: number, label: string | null, zoom = 11) => {
    const m = mapRef.current; if (!m) return;
    m.setView([lat, lng], zoom);
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker([lat, lng]).addTo(m);
    setPlace(label);
    setLoading(true); setErr(null); setRain(null);
    const [r] = await Promise.all([fetchRain(lat, lng), drawRainGrid(lat, lng)]);
    setLoading(false);
    if (r) setRain(r); else setErr(sv ? 'Kunde inte hämta väderdata (SMHI) just nu.' : 'Could not fetch weather data (SMHI).');
  };

  const locate = () => {
    if (!navigator.geolocation) { setErr(sv ? 'Platstjänst ej tillgänglig.' : 'Geolocation unavailable.'); return; }
    setErr(null);
    navigator.geolocation.getCurrentPosition(
      (p) => go(p.coords.latitude, p.coords.longitude, sv ? 'Min plats' : 'My location', 12),
      () => setErr(sv ? 'Kunde inte hämta din plats.' : 'Could not get your location.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim(); if (term.length < 2) return;
    setErr(null); setLoading(true);
    const { data } = await (supabase as any).rpc('resolve_place', { p_q: term });
    setLoading(false);
    const hit = Array.isArray(data) ? data[0] : null;
    if (hit?.lat != null && hit?.lng != null) go(hit.lat, hit.lng, hit.place_name || term, hit.zoom ?? 11);
    else setErr(sv ? `Hittade ingen plats för ”${term}”.` : `No place found for “${term}”.`);
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-card/40 p-4">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground">
        <MapPin className="h-5 w-5 text-emerald-400" /> {sv ? 'Karta & svampförhållanden' : 'Map & foraging conditions'}
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        {sv
          ? 'Välj en plats — kartan färglägger nederbörden (SMHI) i ett rutnät runt dig så du ser åt vilket håll det regnat. Byt till Terräng eller Satellit (uppe till höger) för att se skog och marktyper — där svampen växer.'
          : 'Pick a location — the map colours precipitation (SMHI) in a grid around you so you see which way it rained. Switch to Terrain or Satellite (top right) to see forest and land types where mushrooms grow.'}
      </p>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <form onSubmit={search} className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={sv ? 'Sök plats (t.ex. Selånger, Böda)…' : 'Search a place…'}
            aria-label={sv ? 'Sök plats' : 'Search a place'}
            className="w-full rounded-lg border border-border bg-card/60 py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </form>
        <button
          type="button" onClick={locate}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-600/50 bg-emerald-900/30 px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Compass className="h-4 w-4" /> {sv ? 'Visa var jag är' : 'Show my location'}
        </button>
      </div>

      <div ref={mapEl} className="h-[340px] w-full overflow-hidden rounded-lg border border-border" role="application"
        aria-label={sv ? 'Svampkarta' : 'Foraging map'} />

      {/* Legend för nederbörds-rutnätet — visas när en plats valts. */}
      {rain && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/80">{sv ? 'Nederbörd 72 h (rutnät ±40 km):' : 'Precipitation 72 h (grid ±40 km):'}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#22c55e' }} /> {sv ? '≥15 mm gynnsamt' : '≥15 mm good'}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#eab308' }} /> 5–15 mm</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#ef4444' }} /> {sv ? '<5 mm torrt' : '<5 mm dry'}</span>
        </div>
      )}

      {/* Förhållande-panel */}
      <div className="mt-3 min-h-[2.5rem] text-sm" aria-live="polite">
        {loading && <span className="inline-flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {sv ? 'Hämtar förhållanden…' : 'Fetching conditions…'}</span>}
        {err && <span className="text-amber-300">{err}</span>}
        {rain && !loading && (
          <div className="rounded-lg border border-emerald-700/40 bg-emerald-950/20 p-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-200">
                <CloudRain className="h-4 w-4" /> {place}
              </span>
              <span className="text-foreground/90"><b>{rain.next24}</b> mm {sv ? 'kommande dygn' : 'next 24 h'}</span>
              <span className="text-foreground/90"><b>{rain.next72}</b> mm {sv ? 'kommande 3 dygn' : 'next 72 h'}</span>
              {rain.tmax !== null && <span className="text-foreground/70">{sv ? 'max' : 'max'} {rain.tmax} °C</span>}
            </div>
            <p className="mt-1 text-xs text-emerald-100/80">{rainVerdict(rain.next72, rain.tmax, sv)}</p>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground/70">
        {sv
          ? 'Nederbörd: SMHI öppna data (prognos snow1g). Bakgrundskartor: OpenStreetMap, OpenTopoMap (CC-BY-SA), Esri satellit. Kartan visar FÖRHÅLLANDEN, inte utsatta svampställen — var svampen faktiskt växer beror även på skogstyp/marktäcke. Läs alltid säkerhetsrutan nedan innan du plockar.'
          : 'Precipitation: SMHI open data (snow1g forecast). Base maps: OpenStreetMap, OpenTopoMap (CC-BY-SA), Esri satellite. The map shows CONDITIONS, not marked foraging spots — where mushrooms grow also depends on forest/land cover. Always read the safety box below before foraging.'}
      </p>
    </section>
  );
};

export default SvampMap;
