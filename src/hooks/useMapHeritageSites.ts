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
  'hällristning': [-1600, -500],    // bronsålder (sydskand. figurativ hällkonst); start −1600
                                    // så den INTE nuddar neolitikums slut (−1700) → syns ej i neolitikum
  'trindyxa': [-5000, -2300],       // senmesolitikum–neolitikum (trindyxor, in i gånggriftstid)
  'skeppssättning': [-1000, 1050],  // sen bronsålder–vikingatid
  'skeppsgrav': [550, 1050],        // vendel–vikingatid (daterade skepps-/båtgravar)
  'bildsten': [400, 1100],          // vendel–vikingatid (gotländska bildstenar)
};

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: any; error: any }> };
const ZOOM_INDIVIDUAL = 11;

// Kluster: kategorifärgad disk (familj) + STOR läsbar antalssiffra centrerad. Typens glyph
// blir en liten hörn-badge. Sifferfärg efter diskens ljushet (WCAG-kontrast, ej gissning).
const clusterIcon = (count: number, raaType: string) => {
  const size = count < 10 ? 34 : count < 100 ? 42 : count < 1000 ? 50 : 58;
  const c = catColor(raaType);
  const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
  const light = (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  const txt = light ? '#1c1917' : '#ffffff';
  const shadow = light ? 'none' : '0 1px 2px rgba(0,0,0,0.65)';
  const fs = count < 100 ? 17 : count < 1000 ? 15 : 13;
  const gk = TYPE_GLYPH[raaType];
  const badge = gk ? `<span style="position:absolute;bottom:-3px;right:-3px;width:18px;height:18px;border-radius:50%;background:#1c1917;border:1.5px solid #f8fafc;display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">${GLYPH[gk]}</svg></span>` : '';
  return L.divIcon({
    html: `<div style="position:relative;width:${size}px;height:${size}px">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${c};
        border:2px solid #f8fafc;box-shadow:0 2px 6px rgba(0,0,0,0.45);
        display:flex;align-items:center;justify-content:center;
        color:${txt};font-weight:800;font-size:${fs}px;font-variant-numeric:tabular-nums;
        text-shadow:${shadow};line-height:1">${count}</div>
      ${badge}
    </div>`,
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
  'stenkammargrav': '#7e22ce',  // megalit-familjen
  'bildsten': '#0891b2',        // gotländsk cyan
  'skeppssättning': '#0d9488',  // teal
  'skeppsgrav': '#78350f',      // gravmylla — mörkbrun (grav-familjen)
  'gravfält': '#78350f',        // gravmylla — mörkbrun
  'stensättning': '#57534e',    // sten — varmgrå
  'domarring': '#6d28d9',       // stenkrets — lila
  'rest sten': '#44403c',       // bautasten — mörk sten
  'kyrka': '#e11d48',           // kyrk-rött
  'kyrkoruin': '#9f1239',       // kyrkoruin — mörkare rödvin
  'kloster': '#c026d3',         // kloster-magenta
  'klosterruin': '#86198f',     // klosterruin — mörkare magenta
  'kapell': '#db2777',          // kapell-rosa
  'Källa med tradition': '#0ea5e9', // källa — vatten-blå
  'milstolpe': '#b45309',       // milsten — brun/amber (vägmätning)
  'väghållningssten': '#78716c',// väghållningssten — stengrå
  'gränsmärke': '#7f1d1d',      // gränssten — mörkröd
  'vägmärke': '#1d4ed8',        // vägmärke — vägblå
  // Folktradition & sägen
  'sten med tradition': '#a16207',   // sägensten — amber-brun
  'plats med tradition': '#ca8a04',  // sägenplats — guld
  'vårdträd': '#15803d',             // heligt träd — grön
  'grotta med tradition': '#4338ca', // grotta/håla — indigo
  'jätte-/trollplats': '#a21caf',    // övernaturligt — magenta
  'offerplats': '#b91c1c',           // offer — blodröd
  // Marinarkeologi
  'fartygslämning': '#0369a1',       // vrak — havsblå
  'vrak med tradition': '#0e7490',   // vrak m. sägen — teal
  'spärranläggning': '#831843',      // pålspärr/farledsspärr — vinröd (försvar)
};

// Vit SVG-symbol per lämningskategori (24×24). Kyrkor=kors, vägmärken=skylt,
// gravfält=högar, sten/domarring=ring, skepp=båt, rest sten=bautasten, megalit=dolmen.
const GLYPH: Record<string, string> = {
  cross:  '<path d="M10.5 4h3v4.5H18v3h-4.5V20h-3v-8.5H6v-3h4.5z" fill="#fff"/>',
  sign:   '<path d="M11 3h2v2h5.2l2 2.5-2 2.5H13v11h-2v-11H5.8l-2-2.5 2-2.5H11z" fill="#fff"/>',
  mounds: '<path d="M2 17c1.4-3 4.4-3 5.8 0M9.1 17c1.4-3 4.4-3 5.8 0M16.2 17c1.4-3 4.4-3 5.8 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  ring:   '<circle cx="12" cy="12" r="6.5" stroke="#fff" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="1.6" fill="#fff"/>',
  ship:   '<path d="M3 12h18l-3.2 5.5H6.2z" fill="#fff"/><path d="M12 3v8.5" stroke="#fff" stroke-width="2"/>',
  menhir: '<rect x="9" y="4" width="6" height="16" rx="2.6" fill="#fff"/>',
  dolmen: '<rect x="3.5" y="5.5" width="17" height="4" rx="1.5" fill="#fff"/><path d="M6 20V10M12 20V10M18 20V10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
  tree:   '<path d="M12 3c-2.8 0-5 2.2-5 5 0 1.9 1.1 3.6 2.7 4.4L8.5 21h7l-1.2-8.6C15.9 11.6 17 9.9 17 8c0-2.8-2.2-5-5-5z" fill="#fff"/>',
  anchor: '<circle cx="12" cy="5" r="2" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M12 7v12M7 11H5c0 4.5 3.4 7 7 7s7-2.5 7-7h-2M8.5 10.5h7" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/>',
  spark:  '<path d="M12 3l1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7z" fill="#fff"/>',
  piles:  '<path d="M5 20V7M9 20V5M13 20V6M17 20V8M21 20V6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  drop:   '<path d="M12 3C9 8 6.5 11 6.5 14.5a5.5 5.5 0 0 0 11 0C17.5 11 15 8 12 3z" fill="#fff"/>',
  flame:  '<path d="M13 3c.5 3.5 3.5 5 3.5 8.5a4.5 4.5 0 0 1-9 0c0-2 .8-3.2 1.8-4.2.1 1.2.8 2.2 1.9 2.2 1.4 0 1.3-2.4-.2-6.5z" fill="#fff"/>',
  spiral: '<path d="M12 12a1.7 1.7 0 1 1 1.9 1.7 3.6 3.6 0 0 1-5-3.4 5.6 5.6 0 0 1 9.4-3.6" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round"/>',
};
const TYPE_GLYPH: Record<string, keyof typeof GLYPH> = {
  kyrka: 'cross', kapell: 'cross', kloster: 'cross', kyrkoruin: 'cross', klosterruin: 'cross',
  'vägmärke': 'sign', milstolpe: 'sign', 'väghållningssten': 'sign', 'gränsmärke': 'sign',
  'gravfält': 'mounds',
  'stensättning': 'ring', domarring: 'ring',
  'skeppssättning': 'ship',
  'skeppsgrav': 'anchor',
  'rest sten': 'menhir', bildsten: 'menhir', 'sten med tradition': 'menhir',
  'stenkammargrav': 'dolmen', 'dös': 'dolmen', 'gånggrift': 'dolmen',
  'vårdträd': 'tree',
  'fartygslämning': 'anchor', 'vrak med tradition': 'anchor',
  'spärranläggning': 'piles',
  'jätte-/trollplats': 'spark', 'offerplats': 'spark', 'plats med tradition': 'spark', 'grotta med tradition': 'spark',
  'Källa med tradition': 'drop', 'vårdkase': 'flame', 'hällristning': 'spiral',
};

// KATEGORIFÄRG (familj) — diskens färg. Ikonen (TYPE_GLYPH) skiljer typ inom familjen.
// Dämpad palett; orange bara för vårdkasar (signaleld). Okända typer → neutral skiffer.
const CATEGORY_COLOR: Record<string, string> = {
  kyrka: '#1c1917', kapell: '#1c1917', kloster: '#1c1917', kyrkoruin: '#1c1917', klosterruin: '#1c1917',
  'sten med tradition': '#7c3aed', 'plats med tradition': '#7c3aed', 'vårdträd': '#7c3aed',
  'grotta med tradition': '#7c3aed', 'jätte-/trollplats': '#7c3aed', 'offerplats': '#7c3aed',
  'gravfält': '#78350f', 'stensättning': '#78350f', 'domarring': '#78350f', 'skeppssättning': '#78350f',
  'rest sten': '#78350f', 'dös': '#78350f', 'gånggrift': '#78350f', 'stenkammargrav': '#78350f', 'skeppsgrav': '#78350f',
  'fartygslämning': '#0369a1', 'vrak med tradition': '#0369a1', 'spärranläggning': '#0369a1',
  'milstolpe': '#92600e', 'vägmärke': '#92600e', 'gränsmärke': '#92600e', 'väghållningssten': '#92600e', 'bildsten': '#92600e',
  'Källa med tradition': '#0ea5e9',
  'vårdkase': '#f59e0b',
  'hällristning': '#9a3412',
};
const catColor = (t: string) => CATEGORY_COLOR[t] || TYPE_COLOR[t] || '#475569';

// Fallback-nål (liten färgad droppe) för typer utan egen symbol.
const dotIconFor = (t: string) => {
  const c = catColor(t);
  return L.divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${c};border:1.5px solid #1e293b;box-shadow:0 1px 2px rgba(0,0,0,0.4);"></div>`,
    className: 'heritage-dot', iconSize: [12, 12], iconAnchor: [6, 11], popupAnchor: [0, -10],
  });
};
// Symbolikon: färgad disk + vit glyph per typ. Faller tillbaka på droppen för övriga.
const iconFor = (t: string) => {
  const gk = TYPE_GLYPH[t];
  if (!gk) return dotIconFor(t);
  const c = catColor(t);
  return L.divIcon({
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${c};border:1.6px solid #f8fafc;box-shadow:0 1px 3px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">${GLYPH[gk]}</svg></div>`,
    className: 'heritage-glyph', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12],
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
  const color = catColor(r.raa_type);
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
  heritage_kyrkoruin: 'kyrkoruin', heritage_klosterruin: 'klosterruin',
  heritage_vardkase: 'vårdkase', heritage_dos: 'dös', heritage_ganggrift: 'gånggrift',
  heritage_hallristning: 'hällristning', heritage_trindyxa: 'trindyxa',
  heritage_bildsten: 'bildsten', heritage_skeppssattning: 'skeppssättning',
  heritage_skeppsgrav: 'skeppsgrav',
  heritage_kalla: 'Källa med tradition', heritage_labyrint: 'labyrint',
  // Gravtyper/monument (FMIS-ingest, Kulturlager):
  heritage_gravfalt: 'gravfält', heritage_stensattning: 'stensättning',
  heritage_domarring: 'domarring', heritage_stenkammargrav: 'stenkammargrav',
  heritage_reststen: 'rest sten',
  // "Stenar"-kategorin (egen parent 'heritage_stones'):
  heritage_milstolpe: 'milstolpe', heritage_vaghallningssten: 'väghållningssten',
  heritage_gransmarke: 'gränsmärke', heritage_vagmarke: 'vägmärke',
  // Folktradition & sägen (egen parent 'heritage_folklore'):
  heritage_sagensten: 'sten med tradition', heritage_vardtrad: 'vårdträd',
  heritage_grotta: 'grotta med tradition', heritage_jattetroll: 'jätte-/trollplats',
  heritage_offerplats: 'offerplats', heritage_platstradition: 'plats med tradition',
  // Marinarkeologi (egen parent 'heritage_marine'):
  heritage_vrak: 'fartygslämning', heritage_vraktradition: 'vrak med tradition',
  heritage_sparr: 'spärranläggning',
};
// Typ-nycklar som hör till "Stenar"-kategorin (parent 'heritage_stones') i st.f.
// "Kulturlager" (parent 'heritage_sites'). heritage_bildsten flyttad hit i legenden.
const STONE_KEYS = new Set(['heritage_milstolpe', 'heritage_vaghallningssten', 'heritage_gransmarke', 'heritage_bildsten', 'heritage_vagmarke']);
// Folktradition-typer (egen parent 'heritage_folklore') och marina (parent 'heritage_marine').
const FOLKLORE_KEYS = new Set(['heritage_sagensten', 'heritage_vardtrad', 'heritage_grotta', 'heritage_jattetroll', 'heritage_offerplats', 'heritage_platstradition']);
const MARINE_KEYS = new Set(['heritage_vrak', 'heritage_vraktradition', 'heritage_sparr']);

export const useMapHeritageSites = ({ map, enabledLegendItems, isMapReady, selectedTimePeriod }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const tokenRef = useRef(0);

  // Kartan drivs enbart av per-typ-kryssen. Föräldern (heritage_sites) fungerar
  // som huvudström: är den explicit av döljs/släcks hela kulturlagret.
  // Två parent-master: "Kulturlager" (heritage_sites) och "Stenar" (heritage_stones).
  // Varje typ gate:as av sin egen kategori-parent + sitt eget kryss.
  const parentKultur = enabledLegendItems.heritage_sites !== false;
  const parentStone = enabledLegendItems.heritage_stones !== false;
  const parentFolklore = enabledLegendItems.heritage_folklore !== false;
  const parentMarine = enabledLegendItems.heritage_marine !== false;
  const parentOn = (k: string) => STONE_KEYS.has(k) ? parentStone
    : FOLKLORE_KEYS.has(k) ? parentFolklore
    : MARINE_KEYS.has(k) ? parentMarine : parentKultur;
  const types = Object.entries(HERITAGE_TYPE_KEYS)
    .filter(([k]) => enabledLegendItems[k] === true && parentOn(k))
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
          L.marker([r.lat, r.lng], { icon: iconFor(r.raa_type) })
            .bindPopup(heritagePopup(r as HeritageRow))
            .addTo(layer);
        });
      } else {
        (data as any[]).forEach((c) => {
          // Cell med EN lämning → rita riktig ikon + popup (ingen meningslös "1"-bubbla).
          if (Number(c.cnt) === 1 && c.id) {
            L.marker([c.lat, c.lng], { icon: iconFor(c.raa_type) })
              .bindPopup(heritagePopup(c as HeritageRow))
              .addTo(layer);
            return;
          }
          const m = L.marker([c.lat, c.lng], { icon: clusterIcon(Number(c.cnt), c.raa_type) });
          // Ett klick ska ÖPPNA klustret: zooma alltid till minst ZOOM_INDIVIDUAL (11),
          // där lagret byter till enskilda markörer. Annars kunde man klicka i evighet.
          m.on('click', () => map.setView([c.lat, c.lng], Math.min(Math.max(z + 3, ZOOM_INDIVIDUAL), 14)));
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
