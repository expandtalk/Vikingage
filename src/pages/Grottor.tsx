import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, LocateFixed } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PageMeta } from '@/components/PageMeta';

// /grottor (en: /caves) — dedikerad mobil-först genväg: ALLA kartlagda grottor & överhäng
// (~143, heritage_sites raa_type %grott%) på en helskärmskarta. Självständig sida — rör inte
// Explores nästlade legend-system. Imperativ Leaflet (samma mönster som ExcursionsMap, undviker
// react-leaflet-versionskrångel). Cookiefritt OSM-raster.
//
// Position: auto-lokaliserar vid öppning (med tillstånd) → visar "du är här" + centrerar på dig
// så närmaste grottor syns. Nekas platsåtkomst → faller tillbaka till hela Sveriges grottor.

interface Cave { id: string; name: string | null; raa_type: string | null; description: string | null; source_uri: string | null; lat: number; lng: number; }

const INDIGO = '#4338ca';
const ok = (a?: number | null, b?: number | null) => Number.isFinite(a as number) && Number.isFinite(b as number);
// Minimal HTML-escape för popup-text (RAÄ-beskrivningen är CC0 klartext, men undvik trasig HTML).
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const Grottor: React.FC = () => {
  // Språk styrs av URL:en → /grottor är svensk sida, /caves engelsk (oberoende av global
  // språktoggle), även för meta/SEO. /grotta & /cave redirectar hit.
  const sv = !useLocation().pathname.toLowerCase().includes('cave');
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const caveLayerRef = useRef<L.LayerGroup | null>(null);
  const meLayerRef = useRef<L.LayerGroup | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const { data: caves = [], isLoading } = useQuery<Cave[]>({
    queryKey: ['caves-all'],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('heritage_sites')
        .select('id, name, raa_type, description, source_uri, lat, lng')
        .ilike('raa_type', '%grott%')
        .not('lat', 'is', null)
        .limit(500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((data ?? []) as any[])
        .map((r) => ({ id: r.id, name: r.name, raa_type: r.raa_type, description: r.description, source_uri: r.source_uri, lat: Number(r.lat), lng: Number(r.lng) }))
        .filter((c) => ok(c.lat, c.lng));
    },
    staleTime: 60 * 60 * 1000,
  });

  const locate = () => {
    if (!navigator.geolocation) { setLocError(sv ? 'Platstjänst ej tillgänglig' : 'Geolocation unavailable'); return; }
    setLocating(true); setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocating(false); setMe({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => { setLocating(false); setLocError(sv ? 'Kunde inte hämta din position' : 'Could not get your position'); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Init kartan en gång + auto-lokalisera direkt.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      preferCanvas: true,
      center: [62.0, 15.0], // Sverige-översikt tills grottor/position centrerar
      zoom: 4,
      scrollWheelZoom: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    caveLayerRef.current = L.layerGroup().addTo(map);
    meLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    locate(); // fråga direkt: "var är jag?" → visar dig + närmaste grottor
    return () => { map.remove(); mapRef.current = null; caveLayerRef.current = null; meLayerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rita grottorna när datan finns. Passa kartan efter dem BARA om vi inte redan centrerat
  // på användarens position (då vinner "nära mig"-vyn).
  useEffect(() => {
    const map = mapRef.current;
    const layer = caveLayerRef.current;
    if (!map || !layer || caves.length === 0) return;
    layer.clearLayers();
    const pts: [number, number][] = [];
    caves.forEach((c) => {
      pts.push([c.lat, c.lng]);
      const src = c.source_uri ? (c.source_uri.startsWith('http') ? c.source_uri : 'https://' + c.source_uri) : null;
      const html =
        '<div style="max-width:250px">' +
        `<b>🕳️ ${esc(c.name ?? (sv ? 'Grotta' : 'Cave'))}</b>` +
        (c.raa_type ? `<br/><span style="font-size:11px;color:#64748b">${esc(c.raa_type)}</span>` : '') +
        // RAÄ-beskrivningen bär både traditionen/sägnen OCH måtten (l×b×h). Visas i sin helhet.
        (c.description ? `<div style="font-size:12px;color:#334155;margin-top:5px;line-height:1.35;max-height:180px;overflow-y:auto">${esc(c.description)}</div>` : '') +
        (src ? `<a href="${src}" target="_blank" rel="noopener" style="font-size:11px;color:#b45309;margin-top:6px;display:inline-block">${sv ? 'Källa: RAÄ Fornsök (CC0) →' : 'Source: RAÄ Fornsök (CC0) →'}</a>` : '') +
        '</div>';
      L.circleMarker([c.lat, c.lng], { radius: 6, color: '#312e81', weight: 1.5, fillColor: INDIGO, fillOpacity: 0.9 })
        .bindPopup(html)
        .addTo(layer);
    });
    if (pts.length > 0 && !me) map.fitBounds(L.latLngBounds(pts).pad(0.15));
  }, [caves, sv, me]);

  // Din position: "du är här"-markör + centrera på dig (så närmaste grottor syns).
  useEffect(() => {
    const map = mapRef.current; const meLayer = meLayerRef.current;
    if (!map || !meLayer || !me) return;
    meLayer.clearLayers();
    L.circleMarker([me.lat, me.lng], { radius: 7, color: '#0369a1', weight: 2, fillColor: '#38bdf8', fillOpacity: 0.9 })
      .bindPopup(sv ? 'Du är här' : 'You are here').addTo(meLayer);
    map.setView([me.lat, me.lng], 11);
  }, [me, sv]);

  return (
    <div className="fixed inset-0 bg-slate-950">
      <PageMeta
        title={sv ? 'Grottor & överhäng' : 'Caves & rock shelters'}
        titleEn={sv ? 'Grottor & överhäng' : 'Caves & rock shelters'}
        description={sv
          ? 'Alla kartlagda grottor och överhäng i Sverige på en karta — hitta grottan närmast dig och läs vad RAÄ registrerat.'
          : 'Every mapped cave and rock shelter in Sweden on one map — find the cave nearest you and see what the heritage record says.'}
        descriptionEn={sv
          ? 'Alla kartlagda grottor och överhäng i Sverige på en karta — hitta grottan närmast dig och läs vad RAÄ registrerat.'
          : 'Every mapped cave and rock shelter in Sweden on one map — find the cave nearest you and see what the heritage record says.'}
        keywords={sv ? 'grottor, överhäng, naturgrotta, grotta med tradition, fornlämning, karta' : 'caves, rock shelters, natural caves, heritage record, map, Sweden'}
      />
      <div ref={containerRef} className="absolute inset-0" />

      {/* Topbar: stäng + titel + antal */}
      <div className="absolute left-0 right-0 top-0 z-[1000] flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-900/85 px-3 py-1.5 text-sm text-slate-100 backdrop-blur-sm"
        >
          <X className="h-4 w-4" />{sv ? 'Stäng' : 'Close'}
        </button>
        <span className="rounded-lg border border-slate-600 bg-slate-900/85 px-2.5 py-1.5 text-sm text-slate-100 backdrop-blur-sm">
          🕳️ {sv ? 'Grottor & överhäng' : 'Caves & rock shelters'}
          {!isLoading && <span className="ml-1 text-slate-400">· {caves.length}</span>}
        </span>
      </div>

      {/* Hitta mig (om-centrera) */}
      <button
        type="button"
        onClick={locate}
        className="absolute bottom-5 right-4 z-[1000] inline-flex items-center gap-2 rounded-lg border border-sky-500/50 bg-sky-500/20 px-4 py-2.5 text-sm text-sky-100 backdrop-blur-sm"
      >
        <LocateFixed className={`h-4 w-4 ${locating ? 'animate-pulse' : ''}`} />
        {sv ? 'Hitta mig' : 'Find me'}
      </button>
      {locError && (
        <div className="absolute bottom-20 left-1/2 z-[1000] -translate-x-1/2 rounded-lg border border-amber-700 bg-slate-900/90 px-4 py-2 text-xs text-amber-200 backdrop-blur-sm">
          {locError} · {sv ? 'visar alla grottor i landet' : 'showing all caves in the country'}
        </div>
      )}
    </div>
  );
};

export default Grottor;
