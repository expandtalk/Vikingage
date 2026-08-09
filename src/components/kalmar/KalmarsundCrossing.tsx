import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// Kalmarsunds överfartsmodell (HYPOTES). Visar de källbelagda ankarpunkterna (crossing_points) och
// ritar en drift-korridor: startpunkt + vindriktning → landningskandidater på Öland-sidan (RPC
// kalmarsund_crossing). Sundet trattar vinden N–S; sydvind driver norrut, nordvind söderut.
// Ej belagd rutt — modell/hypotes, tydligt märkt. Batymetri saknas (långgrund = manuell proxy).

const KIND: Record<string, { sv: string; color: string }> = {
  shelter_island: { sv: 'Skyddsö', color: '#16a34a' },
  launch: { sv: 'Startpunkt', color: '#f59e0b' },
  harbor: { sv: 'Hamn', color: '#0ea5e9' },
  shallow_shore: { sv: 'Långgrund', color: '#eab308' },
  holme_fort: { sv: 'Holme m. fäste', color: '#a855f7' },
  grund: { sv: 'Grund', color: '#22d3ee' },
  shoal: { sv: 'Grund vatten', color: '#22d3ee' },
  rock: { sv: 'Rev/klippa (hinder)', color: '#ef4444' },
  obstruction: { sv: 'Undervattenshinder', color: '#ef4444' },
};

interface Point { name: string; kind: string; lat: number; lng: number; }
interface Result { launch: { name: string; lat: number; lng: number } | null; drift: string; landing_candidates: { name: string; lat: number; lng: number; dist_km: number }[]; hazards: { name: string; kind: string; lat: number; lng: number }[]; note: string; }

const sb = supabase as unknown as { from: (t: string) => any; rpc: (fn: string, a: Record<string, unknown>) => any };

export const KalmarsundCrossing: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [launch, setLaunch] = useState('Olsan');
  const [wind, setWind] = useState<'nordlig' | 'sydlig'>('sydlig');
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.LayerGroup | null>(null);
  const driftRef = useRef<L.LayerGroup | null>(null);

  const { data: points } = useQuery({
    queryKey: ['crossing-points'],
    queryFn: async (): Promise<Point[]> => {
      const { data, error } = await sb.from('crossing_points').select('name,kind,lat,lng');
      if (error) throw error;
      return (data ?? []) as Point[];
    },
    staleTime: 60 * 60 * 1000,
  });

  const { data: result } = useQuery({
    queryKey: ['kalmarsund-crossing', launch, wind],
    queryFn: async (): Promise<Result> => {
      const { data, error } = await sb.rpc('kalmarsund_crossing', { p_launch: launch, p_wind: wind });
      if (error) throw error;
      return data as Result;
    },
    staleTime: 60 * 60 * 1000,
  });

  // Vikingatida havsnivå (strandförskjutning) för Kalmar-området — källbelagd RSL-kontrollpunkt.
  const { data: rsl } = useQuery({
    queryKey: ['kalmar-rsl'],
    queryFn: async () => {
      const { data, error } = await sb.from('strandkontroll')
        .select('namn,landhojn_mmyr,rsl_obs_min,rsl_obs_max,date_from,date_to,source')
        .ilike('region', '%kalmar%').not('rsl_obs_max', 'is', null).order('date_from').limit(1);
      if (error) throw error;
      return (data ?? [])[0] as { namn: string; landhojn_mmyr: number; rsl_obs_min: number; rsl_obs_max: number; date_from: number; date_to: number; source: string } | undefined;
    },
    staleTime: 60 * 60 * 1000,
  });

  // Init karta + baslager (punkterna) en gång.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { center: [56.71, 16.42], zoom: 10, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(map);
    baseRef.current = L.layerGroup().addTo(map);
    driftRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 80);
    return () => { map.remove(); mapRef.current = null; baseRef.current = null; driftRef.current = null; };
  }, []);

  // Rita baspunkterna när de laddats.
  useEffect(() => {
    const layer = baseRef.current; if (!layer || !points) return;
    layer.clearLayers();
    points.forEach((p) => {
      const k = KIND[p.kind] ?? { sv: p.kind, color: '#94a3b8' };
      L.circleMarker([p.lat, p.lng], { radius: p.kind === 'shallow_shore' ? 4 : 6, color: '#0f172a', weight: 1, fillColor: k.color, fillOpacity: 0.9 })
        .bindPopup(`<strong>${p.name}</strong><br/><span style="font-size:11px;color:#64748b">${sv ? k.sv : p.kind}</span>`)
        .addTo(layer);
    });
  }, [points, sv]);

  // Rita drift-korridoren när RPC-svaret ändras (start/vind).
  useEffect(() => {
    const layer = driftRef.current; if (!layer || !result?.launch) return;
    layer.clearLayers();
    const l = result.launch;
    L.circleMarker([l.lat, l.lng], { radius: 8, color: '#78350f', weight: 2, fillColor: '#f59e0b', fillOpacity: 1 })
      .bindPopup(`<strong>${l.name}</strong> (${sv ? 'start' : 'launch'})`).addTo(layer);
    (result.landing_candidates ?? []).forEach((c) => {
      L.polyline([[l.lat, l.lng], [c.lat, c.lng]], { color: '#f59e0b', weight: 2, dashArray: '5 5', opacity: 0.8 }).addTo(layer);
      L.circleMarker([c.lat, c.lng], { radius: 6, color: '#78350f', weight: 2, fillColor: '#fde047', fillOpacity: 1 })
        .bindPopup(`<strong>${c.name}</strong><br/><span style="font-size:11px">${sv ? 'landning' : 'landing'} · ${c.dist_km} km</span>`).addTo(layer);
    });
    // Hinder (rev/grund som Skansgrundet) i överfartsområdet — röd varning.
    (result.hazards ?? []).forEach((h) => {
      L.circleMarker([h.lat, h.lng], { radius: 5, color: '#7f1d1d', weight: 1.5, fillColor: '#ef4444', fillOpacity: 0.9 })
        .bindPopup(`<strong>${h.name}</strong><br/><span style="font-size:11px;color:#b91c1c">${sv ? 'hinder' : 'hazard'}</span>`).addTo(layer);
    });
  }, [result, sv]);

  const btn = (active: boolean) =>
    `rounded-md border px-2.5 py-1 text-xs ${active ? 'border-amber-500 bg-amber-500/20 text-amber-100' : 'border-slate-600 text-slate-300 hover:border-amber-500/50'}`;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      <h3 className="mb-1 text-lg font-semibold text-white">{sv ? 'Överfart Kalmarsund — driftmodell' : 'Crossing Kalmarsund — drift model'}</h3>
      <p className="mb-3 text-xs text-slate-400">
        {sv ? 'Sundet trattar vinden N–S. Välj startpunkt och vindriktning — modellen visar var en drivande roddbåt kunde nå de långgrunda stränderna på Öland-sidan. Modell/hypotes, inte belagd rutt.'
            : 'The sound funnels wind N–S. Pick a launch point and wind — the model shows where a drifting rowing boat could reach the shallow Öland shores. Model/hypothesis, not an attested route.'}
      </p>
      {rsl && (
        <p className="mb-3 rounded-md border border-sky-800/50 bg-sky-950/30 px-3 py-2 text-[11px] leading-snug text-sky-200">
          {sv
            ? `Vikingatida havsnivå: RSL ~+${rsl.rsl_obs_min}–${rsl.rsl_obs_max} m högre (${rsl.namn}, ${rsl.date_from}–${rsl.date_to}; landhöjning ${rsl.landhojn_mmyr} mm/år). Grund och vikar var ~1 m djupare då — läs sjökortsdjupen med det påslaget. Källa: ${rsl.source}.`
            : `Viking-age sea level: RSL ~+${rsl.rsl_obs_min}–${rsl.rsl_obs_max} m higher (${rsl.namn}, ${rsl.date_from}–${rsl.date_to}). Shoals/bays were ~1 m deeper then — read chart depths with that offset. Source: ${rsl.source}.`}
        </p>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">{sv ? 'Start' : 'Launch'}</span>
          {['Revsudden', 'Skäggenäs', 'Olsan', 'Laboratorieholmen'].map((n) => (
            <button key={n} className={btn(launch === n)} onClick={() => setLaunch(n)}>{n}</button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">{sv ? 'Vind' : 'Wind'}</span>
          <button className={btn(wind === 'sydlig')} onClick={() => setWind('sydlig')}>{sv ? 'Sydlig (→ norrut)' : 'South (→ north)'}</button>
          <button className={btn(wind === 'nordlig')} onClick={() => setWind('nordlig')}>{sv ? 'Nordlig (→ söderut)' : 'North (→ south)'}</button>
        </div>
      </div>
      <div ref={elRef} className="h-[420px] w-full overflow-hidden rounded-md border border-slate-700 bg-slate-800" />
      {result && (
        <p className="mt-2 text-[11px] leading-snug text-slate-400">
          {sv ? `Drift ${result.drift} · ${result.landing_candidates?.length ?? 0} landningskandidat(er). ` : `Drift ${result.drift} · ${result.landing_candidates?.length ?? 0} landing candidate(s). `}
          {result.note}
        </p>
      )}
    </div>
  );
};
