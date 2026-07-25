import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { overlapsPeriod } from '@/utils/germanicTimeline/periodRange';

// VIEWPORT-servering (proof-of-concept för Steg 1). Till skillnad från övriga
// kartlager laddar detta INTE allt — det frågar sites_in_bbox / sites_bbox_clusters
// på varje map-move och ritar bara det som är i vyn. Server-side-kluster vid låg
// zoom, enskilda punkter vid hög zoom. Därför tål lagret obegränsat antal punkter.
// Gate: legendknappen 'heritage_sites'.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  selectedTimePeriod: string;
}

// Typokronologi per lämningstyp (etablerad datering, ej mock) → [från, till] i år.
// Används för att UTESLUTA en typ ur förfrågan när vald period inte överlappar —
// så t.ex. dösar (tidigneolitiska) aldrig efterfrågas i paleolitikum/vikingatid.
// Typer som saknas här har ingen periodgräns (visas alltid när de tänds).
const TYPE_PERIOD: Record<string, [number, number]> = {
  'dös': [-3900, -3300],            // tidigneolitikum (TRB)
  'gånggrift': [-3350, -2800],      // mellanneolitikum (TRB)
  'hällristning': [-1700, -500],    // bronsålder (sydskandinavisk hällkonst)
  'trindyxa': [-5000, -2300],       // senmesolitikum–neolitikum (trindyxor, in i gånggriftstid)
  'skeppssättning': [-1000, 1050],  // sen bronsålder–vikingatid
  'bildsten': [400, 1100],          // vendel–vikingatid (gotländska bildstenar)
};

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: any; error: any }> };
const ZOOM_INDIVIDUAL = 11;

const clusterIcon = (count: number) => {
  const size = count < 10 ? 30 : count < 100 ? 38 : count < 1000 ? 46 : 54;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:radial-gradient(circle at 40% 35%, #fed7aa 0%, #f59e0b 55%, #b45309 100%);
      border:2px solid #7c2d12;box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      color:#3b1a05;font-weight:700;font-size:${count<1000?'12':'11'}px;">${count}</div>`,
    className: 'heritage-cluster',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Färg per lämningstyp så kartan går att läsa. Fallback grå för okända typer.
const TYPE_COLOR: Record<string, string> = {
  'vårdkase': '#f59e0b',        // eld-orange
  'hällristning': '#ea580c',    // hällkonst — ockra/rost
  'trindyxa': '#a8a29e',        // neolitisk stenyxa — sten-grå
  'dös': '#7c3aed',             // megalit-lila
  'gånggrift': '#9333ea',       // megalit-lila (ljusare)
  'bildsten': '#0891b2',        // gotländsk cyan
  'skeppssättning': '#0d9488',  // teal
  'kyrka': '#e11d48',           // kyrk-rött
  'kloster': '#c026d3',         // kloster-magenta
  'kapell': '#db2777',          // kapell-rosa
  'Källa med tradition': '#0ea5e9', // källa — vatten-blå
  'milstolpe': '#b45309',       // milsten — brun/amber (vägmätning)
  'väghållningssten': '#78716c',// väghållningssten — stengrå
  'gränsmärke': '#7f1d1d',      // gränssten — mörkröd
};
const dotIconFor = (t: string) => {
  const c = TYPE_COLOR[t] || '#64748b';
  return L.divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${c};border:1.5px solid #1e293b;box-shadow:0 1px 2px rgba(0,0,0,0.4);"></div>`,
    className: 'heritage-dot', iconSize: [12, 12], iconAnchor: [6, 11], popupAnchor: [0, -10],
  });
};

// Namnet är ofta en skräpdubblett ("Hällristning, Hällristning") → deduplicera; faller
// tillbaka på typ + socken när namnet inte tillför något.
const cleanTitle = (name: string | null, raaType: string, parish: string | null) => {
  const parts = [...new Set(String(name || '').split(',').map((s) => s.trim()).filter(Boolean))];
  let t = parts.join(', ');
  if (!t || t.toLowerCase() === (raaType || '').toLowerCase()) t = raaType || 'Lämning';
  return parish ? `${t}, ${parish} sn` : t;
};

// Rik popup: titel, typ, plats, koordinater, ev. period/beskrivning + länk till Fornsök
// (source_uri = kulturarvsdata.se/raa/lamning/<uuid>, det unika RAÄ-id:t → klickbart).
interface HeritageRow {
  raa_type: string; name: string | null; period: string | null; description: string | null;
  landscape: string | null; municipality: string | null; parish: string | null;
  lat: number; lng: number; source_uri: string | null;
}
const heritagePopup = (r: HeritageRow) => {
  const color = TYPE_COLOR[r.raa_type] || '#64748b';
  const geo = [r.landscape, r.municipality, r.parish].filter(Boolean).join(' · ');
  const coord = r.lat != null && r.lng != null ? `${Number(r.lat).toFixed(5)}, ${Number(r.lng).toFixed(5)}` : '';
  const per = r.period ? ` · ${r.period}` : '';
  const desc = r.description
    ? `<div style="font-size:11px;color:#475569;margin-top:4px">${String(r.description).slice(0, 260)}</div>` : '';
  const link = r.source_uri
    ? `<div style="margin-top:6px"><a href="https://${r.source_uri}" target="_blank" rel="noopener" style="font-size:11px;color:#2563eb;text-decoration:underline">Visa i Fornsök ↗</a></div>` : '';
  return `<div style="min-width:190px">
      <strong>${cleanTitle(r.name, r.raa_type, r.parish)}</strong>
      <div style="color:${color};font-size:12px;margin-top:2px">${r.raa_type}${per}</div>
      ${geo ? `<div style="font-size:11px;color:#334155;margin-top:3px">📍 ${geo}</div>` : ''}
      ${coord ? `<div style="font-size:11px;color:#64748b;font-variant-numeric:tabular-nums">${coord}</div>` : ''}
      ${desc}${link}
    </div>`;
};

// Legendnyckel → raa_type. Per-typ-kryssen i "Kulturlager"-kategorin styr vilka
// typer som hämtas (sites_in_bbox tar p_types). Bak-kompat: 'heritage_sites'=true → alla.
const HERITAGE_TYPE_KEYS: Record<string, string> = {
  heritage_kyrka: 'kyrka', heritage_kapell: 'kapell', heritage_kloster: 'kloster',
  heritage_vardkase: 'vårdkase', heritage_dos: 'dös', heritage_ganggrift: 'gånggrift',
  heritage_hallristning: 'hällristning', heritage_trindyxa: 'trindyxa',
  heritage_bildsten: 'bildsten', heritage_skeppssattning: 'skeppssättning',
  heritage_kalla: 'Källa med tradition', heritage_labyrint: 'labyrint',
  // "Stenar"-kategorin (egen parent 'heritage_stones'):
  heritage_milstolpe: 'milstolpe', heritage_vaghallningssten: 'väghållningssten',
  heritage_gransmarke: 'gränsmärke',
};
// Typ-nycklar som hör till "Stenar"-kategorin (parent 'heritage_stones') i st.f.
// "Kulturlager" (parent 'heritage_sites'). heritage_bildsten flyttad hit i legenden.
const STONE_KEYS = new Set(['heritage_milstolpe', 'heritage_vaghallningssten', 'heritage_gransmarke', 'heritage_bildsten']);

export const useMapHeritageSites = ({ map, enabledLegendItems, isMapReady, selectedTimePeriod }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const tokenRef = useRef(0);

  // Kartan drivs enbart av per-typ-kryssen. Föräldern (heritage_sites) fungerar
  // som huvudström: är den explicit av döljs/släcks hela kulturlagret.
  // Två parent-master: "Kulturlager" (heritage_sites) och "Stenar" (heritage_stones).
  // Varje typ gate:as av sin egen kategori-parent + sitt eget kryss.
  const parentKultur = enabledLegendItems.heritage_sites !== false;
  const parentStone = enabledLegendItems.heritage_stones !== false;
  const types = Object.entries(HERITAGE_TYPE_KEYS)
    .filter(([k]) => enabledLegendItems[k] === true && (STONE_KEYS.has(k) ? parentStone : parentKultur))
    .map(([, v]) => v)
    // Periodfilter: uteslut typer vars typokronologi inte överlappar vald period.
    .filter((v) => { const p = TYPE_PERIOD[v]; return !p || overlapsPeriod(selectedTimePeriod, p[0], p[1]); });
  const typesKey = types.join(',') || 'OFF';

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    const enabled = types.length > 0;

    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;

    if (!enabled) { layer.clearLayers(); return; }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const refresh = async () => {
      const myToken = ++tokenRef.current;
      const z = Math.round(map.getZoom());
      const b = map.getBounds();
      const args = {
        min_lng: b.getWest(), min_lat: b.getSouth(),
        max_lng: b.getEast(), max_lat: b.getNorth(), p_zoom: z,
        p_types: types,
      };
      const fn = z >= ZOOM_INDIVIDUAL ? 'sites_in_bbox' : 'sites_bbox_clusters';
      const { data, error } = await sb.rpc(fn, args);
      if (error || myToken !== tokenRef.current || !map) return; // stale/avbruten
      layer.clearLayers();
      if (!data) return;

      if (z >= ZOOM_INDIVIDUAL) {
        (data as any[]).forEach((r) => {
          L.marker([r.lat, r.lng], { icon: dotIconFor(r.raa_type) })
            .bindPopup(heritagePopup(r as HeritageRow))
            .addTo(layer);
        });
      } else {
        (data as any[]).forEach((c) => {
          // Cell med EN lämning → rita riktig ikon + popup (ingen meningslös "1"-bubbla).
          if (Number(c.cnt) === 1 && c.id) {
            L.marker([c.lat, c.lng], { icon: dotIconFor(c.raa_type) })
              .bindPopup(heritagePopup(c as HeritageRow))
              .addTo(layer);
            return;
          }
          const m = L.marker([c.lat, c.lng], { icon: clusterIcon(Number(c.cnt)) });
          m.on('click', () => map.setView([c.lat, c.lng], Math.min(z + 3, 13)));
          m.addTo(layer);
        });
      }
    };

    const debounced = () => { if (timer) clearTimeout(timer); timer = setTimeout(refresh, 250); };
    map.on('moveend zoomend', debounced);
    refresh();

    return () => {
      map.off('moveend zoomend', debounced);
      if (timer) clearTimeout(timer);
      layer.clearLayers();
    };
  }, [map, typesKey, isMapReady]);
};
