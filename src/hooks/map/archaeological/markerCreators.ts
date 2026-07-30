import L from 'leaflet';
import { ArchaeologicalFind } from '@/utils/archaeologicalFinds/types';
import { createPlaceMedallion, markerColor, MARKER_ICONS } from '@/utils/map/placeMarker';

interface ClusteredItem {
  lat: number;
  lng: number;
  finds: ArchaeologicalFind[];
}

// Fyndtyp → medaljong-glyf + färgnyckel (i placeMarker.ts). Håller arkeologifynden
// i samma bildspråk som resten av kartan — inga emoji, inga breda färgplattor.
const FIND_SPEC: Record<string, { icon: string; color: string; royal?: boolean }> = {
  settlement:    { icon: 'house',   color: 'folk' },
  city:          { icon: 'pillar',  color: 'city' },
  trading_city:  { icon: 'amphora', color: 'trading_post' },
  trading_post:  { icon: 'amphora', color: 'trading_post' },
  trade:         { icon: 'amphora', color: 'trading_post' },
  burial:        { icon: 'menhir',  color: 'archaeological' },
  royal_burial:  { icon: 'crown',   color: 'royal_center', royal: true },
  boat_graves:   { icon: 'ship',    color: 'gotlandic_center' },
  boats:         { icon: 'ship',    color: 'gotlandic_center' },
  human_remains: { icon: 'people',  color: 'archaeological' },
  weapons:       { icon: 'shield',  color: 'fortress' },
  raid:          { icon: 'shield',  color: 'event' },
  workshop:      { icon: 'hammer',  color: 'archaeological' },
  metalwork:     { icon: 'hammer',  color: 'archaeological' },
  artifacts:     { icon: 'ring',    color: 'estate' },
  ritual:        { icon: 'idol',    color: 'cult_site' },
  rock_carving:  { icon: 'rune',    color: 'rock_carving' },
  cave:          { icon: 'menhir',  color: 'archaeological' },
};
const DEFAULT_SPEC = { icon: 'dot', color: 'archaeological' };

// Gudom ur fyndnamnet → egen färg (Frej grön, Oden blå …), så kultfynd som
// "Frej från Rällinge" eller "Freja-hänget från Aska" får rätt kulör.
const DEITY_COLOR: Array<[RegExp, string]> = [
  [/frej\b|freyr?\b|yngvi/i, 'frey'],
  [/freja|freyja/i, 'freyja'],
  [/\boden|\bodin|wodan/i, 'odin'],
  [/\btor\b|\bthor\b|þor/i, 'thor'],
  [/\btyr\b|týr/i, 'tyr'],
  [/njord|njörd/i, 'njord'],
  [/\bull\b|ullr/i, 'ull'],
  [/frigg/i, 'frigg'],
];

const findSpec = (find: ArchaeologicalFind): { icon: string; color: string; royal?: boolean } => {
  const spec = FIND_SPEC[find.findType] ?? DEFAULT_SPEC;
  if (find.findType === 'ritual') {
    const name = find.name || '';
    for (const [re, key] of DEITY_COLOR) if (re.test(name)) return { ...spec, color: key };
  }
  return spec;
};

// Liten inline-SVG av samma linjeglyfer, för popup-huvudet (ersätter emoji-cirkeln).
const glyphSvg = (iconKey: string, px: number): string => {
  const glyph = MARKER_ICONS[iconKey] || MARKER_ICONS.dot;
  return `<svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="#eee7d7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg>`;
};

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const createSingleFindMarker = (
  find: ArchaeologicalFind,
  map: L.Map,
  isMapReady: React.RefObject<boolean>
): L.Marker | null => {
  if (!map || !isMapReady.current) return null;

  const spec = findSpec(find);
  const ring = markerColor(spec.color);

  const icon = createPlaceMedallion({
    color: ring,
    icon: spec.icon,
    label: find.name,
    royal: spec.royal,
    className: 'vp-medallion--archaeo',
  });

  const marker = L.marker([find.lat, find.lng], { icon })
    .bindPopup(`
      <div style="background: linear-gradient(180deg,#2a333d,#1b232b); color:#eee7d7; padding:16px; border-radius:8px; box-shadow:0 6px 24px rgba(0,0,0,0.4); border:1px solid ${ring}; min-width:280px; max-width:320px;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
          <div style="width:38px; height:38px; border-radius:50%; border:2px solid ${ring}; background:linear-gradient(180deg,#33414d,#212c35); display:flex; align-items:center; justify-content:center; flex:0 0 auto;">
            ${glyphSvg(spec.icon, 20)}
          </div>
          <div>
            <h3 style="font-weight:700; font-size:18px; color:#fff; margin:0;">${esc(find.name)}</h3>
            <p style="font-size:13px; color:rgba(238,231,215,0.7); margin:2px 0 0 0;">${esc(find.country)}</p>
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <p style="color:rgba(238,231,215,0.9); font-size:14px; line-height:1.5; margin:0;">${esc(find.description)}</p>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <span style="display:inline-flex; align-items:center; padding:5px 11px; border-radius:14px; font-size:11px; font-weight:600; background:rgba(255,255,255,0.06); color:#eee7d7; border:1px solid ${ring};">${esc(find.findType)}</span>
          <span style="display:inline-flex; align-items:center; padding:5px 11px; border-radius:14px; font-size:11px; font-weight:600; background:rgba(255,255,255,0.06); color:rgba(238,231,215,0.9); border:1px solid rgba(255,255,255,0.12);">${esc(find.period)}</span>
        </div>
      </div>
    `, {
      maxWidth: 340,
      className: 'archaeological-find-popup'
    });

  return marker;
};

// Kluster: mörk medaljong-disk med antal, tunn ring i dominerande fyndtyps färg
// (samma estetik som enskilda medaljonger, ingen brun platta).
export const createClusterMarker = (
  cluster: ClusteredItem,
  map: L.Map,
  isMapReady: React.RefObject<boolean>
): L.Marker | null => {
  if (!map || !isMapReady.current || !('finds' in cluster)) return null;

  const findCount = cluster.finds.length;
  const size = Math.min(34 + findCount * 2, 54);

  // Dominerande fyndtyp → ringfärg
  const types = cluster.finds.map(f => f.findType);
  const dominant = types.reduce((a, b, _, arr) =>
    arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
  );
  const ring = markerColor((FIND_SPEC[dominant] ?? DEFAULT_SPEC).color);
  const fontSize = Math.min(13 + findCount * 0.4, 17);

  const customIcon = L.divIcon({
    html: `<div style="
      width:${size}px; height:${size}px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      background:linear-gradient(180deg,#33414d,#212c35);
      border:2px solid ${ring};
      box-shadow:0 0 5px 0 ${ring},0 2px 5px rgba(0,0,0,0.4);
      color:#eee7d7; font-weight:700; font-size:${fontSize}px;
      font-family:'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif;
    ">${findCount}</div>`,
    className: 'vp-medallion vp-medallion--archaeo-cluster',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });

  const marker = L.marker([cluster.lat, cluster.lng], { icon: customIcon });

  marker.on('click', () => {
    if (map) {
      map.setView([cluster.lat, cluster.lng], Math.min(map.getZoom() + 2, 15), {
        animate: true,
        duration: 0.5
      });
    }
  });

  const findsList = cluster.finds.slice(0, 5).map(find =>
    `<li style="color:rgba(238,231,215,0.9); margin:4px 0;">${esc(find.name)} <span style="color:rgba(238,231,215,0.5);">(${esc(find.findType)})</span></li>`
  ).join('');

  marker.bindPopup(`
    <div style="background:linear-gradient(180deg,#2a333d,#1b232b); color:#eee7d7; padding:16px; border-radius:8px; box-shadow:0 6px 24px rgba(0,0,0,0.4); border:1px solid ${ring}; min-width:280px; max-width:320px;">
      <h3 style="font-weight:700; font-size:18px; color:#fff; margin:0 0 12px 0;">Arkeologisk fyndgrupp</h3>
      <p style="color:rgba(238,231,215,0.8); font-size:14px; margin:0 0 12px 0;">${findCount} fynd i detta område</p>
      <ul style="list-style:none; padding:0; margin:0 0 12px 0;">
        ${findsList}
        ${cluster.finds.length > 5 ? `<li style="color:rgba(238,231,215,0.7);">… och ${cluster.finds.length - 5} till</li>` : ''}
      </ul>
      <p style="font-size:11px; color:rgba(238,231,215,0.6); margin:0; font-style:italic;">Klicka för att zooma in</p>
    </div>
  `, {
    maxWidth: 340,
    className: 'archaeological-cluster-popup'
  });

  return marker;
};
