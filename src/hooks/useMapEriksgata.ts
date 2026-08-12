import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Ritar Eriksgatan (kungavalets riksrunda) på kartan från DB: viking_roads
// 'Eriksgatan' + road_waypoints (11 punkter, waypoint_order). Verifierad data —
// samma mönster som useMapValdemarsRoute. Gate: legendknappen 'eriksgatan'.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
}

const sb = supabase as unknown as { from: (t: string) => any };
const parsePoint = (c: unknown): [number, number] | null => {
  const m = String(c ?? '').match(/\(([-\d.]+),([-\d.]+)\)/);
  return m ? [parseFloat(m[2]), parseFloat(m[1])] : null; // [lat, lng] från point(lng,lat)
};

interface Landmark { ll: [number, number]; name: string; type: string; description: string | null; significance: string | null; }

interface NearbyFeatures {
  runestones: { signum: string; lat: number; lng: number }[];
  churches: { name: string; type: string; lat: number; lng: number }[];
  halvagar: { name: string; lat: number; lng: number }[];
}

export const useMapEriksgata = ({ map, enabledLegendItems, isMapReady, safelyAddLayer }: Props) => {
  const layersRef = useRef<L.Layer[]>([]);
  const dataRef = useRef<{ pts: [number, number][]; wps: { ll: [number, number]; name: string; type: string }[]; landmarks: Landmark[]; nearby: NearbyFeatures } | null>(null);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    let cancelled = false;

    const clear = () => {
      layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch { /* noop */ } });
      layersRef.current = [];
    };
    clear();

    // Ritas bara där en profil uttryckligen tänt den (rutt-/farledsvyer) — inte överallt.
    if (enabledLegendItems.eriksgatan !== true) return;

    const draw = (data: NonNullable<typeof dataRef.current>) => {
      if (cancelled || !map || data.pts.length < 2) return;
      const line = L.polyline(data.pts, { color: '#d97706', weight: 3, opacity: 0.9, dashArray: '10, 6' })
        .bindPopup('<strong>Eriksgatan</strong><br/>Kungavalets riksrunda genom landskapen.<br/><span style="font-size:11px;color:#78350f">Lagfäst i <em>Upplandslagens konungabalk</em> II (»Vm ærix gatu«, ~1296): den nyvalde kungen rider medsols och tas till kung i varje land; vid landsgränserna växlas gisslan och lejd (<em>grið</em>). <a href="/sources/353a5821-40fd-42f6-9067-702cfb1fd478" style="color:#b45309">Läs lagtexten (fornsvenska + översättning) →</a><br/>Rutten följer Codex A (Schlyter 1834); Ängsöhs. saknar Svintuna.</span>');
      if (safelyAddLayer(line)) layersRef.current.push(line);
      // Zooma in på ledens utbredning så man ser detaljerna (Daniel).
      try { map.fitBounds(line.getBounds(), { padding: [40, 40], maxZoom: 10 }); } catch { /* noop */ }
      data.wps.forEach((w) => {
        const isBorder = w.type === 'junction';
        const marker = L.circleMarker(w.ll, {
          radius: isBorder ? 6 : 5, color: '#7c2d12', weight: 2,
          fillColor: isBorder ? '#f59e0b' : '#d97706', fillOpacity: 0.95,
        }).bindPopup(`<strong>${w.name}</strong><br/><span style="font-size:11px;color:#78350f">${isBorder ? 'Landskapsgräns på Eriksgatan — här mötte nästa lands män kungen och gisslan/lejd växlades (Upplandslagen, Codex A)' : 'Anhalt/etapp på Eriksgatan'}</span>`);
        if (safelyAddLayer(marker)) layersRef.current.push(marker);
      });

      // Runstenar inom 1 km av leden (små röda prickar).
      data.nearby.runestones.forEach((r) => {
        const m = L.circleMarker([r.lat, r.lng], {
          radius: 3, color: '#b91c1c', weight: 1, fillColor: '#ef4444', fillOpacity: 0.85,
        }).bindPopup(`<strong>${r.signum}</strong><br/>Runsten nära Eriksgatan`);
        if (safelyAddLayer(m)) layersRef.current.push(m);
      });
      // Medeltida kyrkor inom 500 m av leden (ecclesiastical_sites, ej moderna).
      data.nearby.churches.forEach((c) => {
        const m = L.circleMarker([c.lat, c.lng], {
          radius: 3, color: '#7e22ce', weight: 1, fillColor: '#a855f7', fillOpacity: 0.85,
        }).bindPopup(`<strong>${c.name}</strong><br/>${c.type} nära Eriksgatan`);
        if (safelyAddLayer(m)) layersRef.current.push(m);
      });
      // Gamla hålvägar/färdvägar inom 1 km av leden (heritage RAÄ, is_halvag) — bruna prickar (Daniel).
      data.nearby.halvagar.forEach((h) => {
        const m = L.circleMarker([h.lat, h.lng], {
          radius: 3, color: '#78350f', weight: 1, fillColor: '#a16207', fillOpacity: 0.8,
        }).bindPopup(`<strong>${h.name}</strong><br/>Hålväg/färdväg nära Eriksgatan (RAÄ)`);
        if (safelyAddLayer(m)) layersRef.current.push(m);
      });
      // Utpekade platser ur road_landmarks (Mora stenar, Rökstenen, Östanbro/Östens bro,
      // Ramundeboda kloster …) — guldmarkör med källbelagd beskrivning + betydelse.
      data.landmarks.forEach((f) => {
        const m = L.circleMarker(f.ll, {
          radius: 7, color: '#78350f', weight: 2, fillColor: '#fbbf24', fillOpacity: 1,
        }).bindPopup(`<strong>${f.name}</strong>${f.description ? `<br/><span style="font-size:11px;color:#78350f">${f.description}</span>` : ''}${f.significance ? `<br/><span style="font-size:10px;color:#b45309">${f.significance}</span>` : ''}`);
        if (safelyAddLayer(m)) layersRef.current.push(m);
      });
    };

    if (dataRef.current) { draw(dataRef.current); return () => { cancelled = true; }; }

    (async () => {
      const { data: road } = await sb.from('viking_roads').select('id').eq('name', 'Eriksgatan').maybeSingle();
      if (!road?.id) return;
      const { data: wps } = await sb.from('road_waypoints').select('name, coordinates, waypoint_type, waypoint_order')
        .eq('road_id', road.id).order('waypoint_order', { ascending: true });
      const parsed = (wps ?? []).map((w: any) => ({ ll: parsePoint(w.coordinates), name: w.name as string, type: w.waypoint_type as string }))
        .filter((w: any) => w.ll) as { ll: [number, number]; name: string; type: string }[];
      // Utpekade platser längs leden (road_landmarks) — datadrivet, med källbelagd text.
      const { data: lms } = await sb.from('road_landmarks')
        .select('name, coordinates, landmark_type, description, historical_significance').eq('road_id', road.id);
      const landmarks = (lms ?? []).map((l: any) => ({ ll: parsePoint(l.coordinates), name: l.name as string, type: l.landmark_type as string, description: (l.description ?? null) as string | null, significance: (l.historical_significance ?? null) as string | null }))
        .filter((l: any) => l.ll) as Landmark[];
      // Leden (linjen + waypoints) ska ritas ÄVEN om närliggande-lagret fallerar.
      // Wrappa RPC:n så ett fel inte dödar hela draw() (bakgrund: en dubblerad
      // overload gjorde anropet tvetydigt och tog bort linjen).
      let nearby: NearbyFeatures = { runestones: [], churches: [], halvagar: [] };
      try {
        const { data: near } = await sb.rpc('eriksgata_nearby', { radius_m: 1000 });
        if (near) nearby = { runestones: near.runestones ?? [], churches: near.churches ?? [], halvagar: near.halvagar ?? [] };
      } catch { /* leden ritas ändå — närliggande lager är extra */ }
      dataRef.current = { pts: parsed.map((w) => w.ll), wps: parsed, landmarks, nearby };
      draw(dataRef.current);
    })();

    return () => { cancelled = true; };
  }, [map, enabledLegendItems.eriksgatan, isMapReady, safelyAddLayer]);
};
