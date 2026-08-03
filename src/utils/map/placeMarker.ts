import L from 'leaflet';

/**
 * Gemensam, elegant punkt-markör för hela kartan ("medaljong"): en platt mörk disk
 * med tunn färgad ring + en ljus linje-ikon, och ortnamnet under i serif med vit halo
 * — INGEN opak färgplatta. En sanningskälla; alla punktlager (religiösa platser,
 * städer, fästningar, folkgrupper, arkeologi, händelser…) ska använda denna i st.f.
 * egna breda pill-divIcons. Basemaps är ljusa (OSM/CartoDB light) → mörk text + vit halo.
 *
 * Linjelager (vattenvägar/vägar) och täta masslager (heritage_sites, 34k m. kluster)
 * använder INTE denna — de behåller polyline resp. små färgprickar/kluster.
 */

// Dämpad, jordnära palett (dov sage/dammblå/ockra/sten) — inte glättiga full-mättade toner.
export const MARKER_COLORS: Record<string, string> = {
  // Gudar / kult
  thor: '#a24b4b', odin: '#4d6fa6', frey: '#5c8a5a', freyr: '#5c8a5a',
  ull: '#7a6aa0', njord: '#3f7f93', frigg: '#a76d90', freyja: '#a7688e', tyr: '#9a7b3c',
  christian: '#8b8578', // dov sten — kristen mission, värdigt (ej glansig guld)
  // Platstyper
  temple: '#8a6f3e', sacred_grove: '#5c8a5a', royal_center: '#9a7b3c',
  cult_site: '#7a6aa0', rock_carving: '#6f7a86', spring: '#3f7f93',
  // Städer / fästningar
  city: '#566472', town: '#566472', fortress: '#a9762f', hillfort: '#a9762f',
  trading_post: '#8a6f3e', religious_center: '#a24b4b', koping: '#566472',
  established_city: '#566472', gotlandic_center: '#3f7f93',
  // Övrigt
  folk: '#7c6f5a', archaeological: '#8a6f3e', event: '#7a5c5c',
  estate: '#9a7b3c', beacon: '#b5651d', default: '#5b6976',
};

export const markerColor = (key: string | undefined | null): string =>
  (key && MARKER_COLORS[key]) || MARKER_COLORS.default;

// Linje-ikoner (24×24, ritas med stroke i pergamentton). Inga emoji — konsekvent & läsbart.
export const MARKER_ICONS: Record<string, string> = {
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/>',
  hammer: '<path d="M7 4h10v5H7z"/><path d="M12 9v11"/>',
  grain: '<path d="M12 21V8"/><path d="M12 11C9 11 7 9 7 6c3 0 5 2 5 5Z"/><path d="M12 9c3 0 5-2 5-5-3 0-5 2-5 5Z"/>',
  bow: '<path d="M5 4C13 7 13 17 5 20"/><path d="M5 4v16"/>',
  wave: '<path d="M2 8c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/><path d="M2 14c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/>',
  ring: '<circle cx="12" cy="13" r="6"/><path d="M9 5l3 3 3-3"/>',
  cross: '<path d="M12 4v16"/><path d="M8.5 9h7"/>',
  tree: '<path d="M12 22v-6"/><path d="M12 16c-3.5 0-6-2.5-6-6 0-3.5 6-8 6-8s6 4.5 6 8c0 3.5-2.5 6-6 6Z"/>',
  droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  crown: '<path d="M4 8l3 8h10l3-8-5 4-3-6-3 6-5-4Z"/>',
  pillar: '<path d="M4 8 12 3l8 5"/><path d="M7 8v9M12 8v9M17 8v9"/><path d="M4 20h16"/>',
  menhir: '<path d="M9 21V6c0-2 6-2 6 0v15"/><path d="M6 21h12"/>',
  fort: '<path d="M4 21V9l2.7 1.7L9.3 7l2.7 3.7L14.7 7l2.6 3.7L20 9v12"/><path d="M3 21h18"/>',
  church: '<path d="M12 3v3.5M10.4 4.8h3.2"/><path d="M6 21V11l6-4.2 6 4.2v10"/><path d="M4 21h16"/><path d="M10.5 21v-4h3v4"/>',
  // Försvunnen/riven kyrka (kyrkorester/ruin/arkeologisk): brutna murstumpar utan tak +
  // lutande kors. Skiljer sig avsiktligt från 'church' (hel, gavlad) för "byggnaden borta,
  // platsen syns ännu". Ritas grå (colorFor) för ytterligare kontrast mot stående kyrka.
  church_ruin: '<path d="M4 21h16"/><path d="M7 21V9l2.2 2.2"/><path d="M15 21v-9l2.2 2.2V21"/><path d="M12 4l1 2.4"/><path d="M11.2 5.6l2.4-.7"/>',
  scales: '<path d="M12 4v16"/><path d="M6 8h12"/><path d="M6 8 4 13h4z"/><path d="M18 8l-2 5h4z"/><path d="M9 20h6"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 3-5 6-5s6 1.5 6 5"/><path d="M16 6a3 3 0 0 1 0 6"/><path d="M17 15c2.5.4 4 2 4 5"/>',
  amphora: '<path d="M9 3h6"/><path d="M9 3c0 2-2 2-2 5s2 3 2 6c0 3 6 3 6 0 0-3 2-3 2-6s-2-3-2-5"/><path d="M8 21h8"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  house: '<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>',
  scroll: '<path d="M6 4h10a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H7"/><path d="M6 4a2 2 0 0 0-2 2v1h4"/><path d="M8 20a3 3 0 0 1-3-3v-1h11"/>',
  coin: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
  rune: '<path d="M8 3v18"/><path d="M8 6l8 5-8 5"/>',
  helmet: '<path d="M4 13a8 8 0 0 1 16 0"/><path d="M12 5v10"/><path d="M4 13v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/><path d="M8 13v3M16 13v3"/>',
  ship: '<path d="M4 13h16l-1.6 4.2a2 2 0 0 1-1.9 1.3H7.5a2 2 0 0 1-1.9-1.3z"/><path d="M4 13c-1-1-1.4-2.4-1-3.9 1.2.2 2.1 1 2.4 2.1"/><path d="M20 13c1-1 1.4-2.4 1-3.9-1.2.2-2.1 1-2.4 2.1"/><path d="M12 13V4"/><path d="M12 5h5l-1.4 3.2H12"/>',
  // Haveri/vrak — listande (tiltad) skrov halvt under vattenlinjen + knäckt, lutande mast.
  // Skiljer sig avsiktligt från 'ship' (upprätt, symmetriskt skrov + rak mast) för att
  // signalera "sjunket/haveri" i st.f. "fartyg i drift".
  wreck: '<path d="M2 15l16-4.5-2 6.5-12.5 2z"/><path d="M9 15L11.5 3.5l3.5 2-3 9.5"/><path d="M2 19.5c2 0 2 1.6 4 1.6s2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 4-1.6"/>',
  idol: '<circle cx="12" cy="5" r="2.3"/><path d="M12 7.3v7.2"/><path d="M8.5 10h7"/><path d="M9 20.5l3-6 3 6"/><path d="M7.5 20.5h9"/>',
  beacon: '<path d="M12 3c1.7 3.2 4.6 4.9 4.6 8.9a4.6 4.6 0 0 1-9.2 0c0-1.7.7-3 1.7-4 .2 1 .8 1.8 1.6 2.2.9-1.6.6-4 1.3-7.1Z"/>',
  dot: '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',
};

// FÖRSTARANGS CENTRALORTER — kurerad, dokumenterad lista → guldmarkör (rang; typen bärs
// av ikonen). Omfattar kungasäten, storemporier, Hansastäder och Rus-/västmetropoler.
// Kan senare promotas till DB-fält / central_places. (Historiskt namn på setet behållet.)
export const ROYAL_SEATS = new Set<string>([
  // SE kungasäten/maktcentra
  'gamla uppsala', 'uppsala', 'valsgärde', 'vendel', 'helgö', 'birka', 'sigtuna',
  'hovgården', 'adelsö', 'uppåkra', 'varnhem', 'bjälbo', 'skara', 'stegeborg',
  'lund', 'visby',
  // OBS: 'kalmar' borttaget — namnkollision med Kalmar sn i Uppland (Kalmar kyrka 1175);
  // Kalmar slott + gamla bykyrkan (Erik av Pommerns dop) är de viktiga, ej domkyrkan (1600-tal).
  // NO
  'nidaros', 'trondheim', 'kaupang', 'borre', 'avaldsnes', 'lade', 'bergen', 'oslo', 'tönsberg', 'tønsberg',
  // DK
  'lejre', 'jelling', 'ribe', 'hedeby', 'tissø', 'roskilde', 'københavn', 'köpenhamn', 'odense', 'aarhus',
  // Emporier / Rus / väst (Aldeigjuborg=Staraja Ladoga, Holmgård=Novgorod, Könugård=Kiev, Jórvík=York)
  'truso', 'wolin', 'staraja ladoga', 'staraya ladoga', 'novgorod', 'kiev', 'gnezdovo',
  'dublin', 'york', 'jórvík',
]);

// Monumentala runstenar som ska framhävas bland de täta run-prickarna: egen medaljong
// (rune-ikon, större, med etikett). Kuraterat per signum ELLER namnfragment.
export const MONUMENTAL_STONES = new Set<string>([
  'ög 136', 'rök',          // Rökstenen
  'vg 119', 'sparlösa',     // Sparlösastenen
  'öl 1', 'karlevi',        // Karlevistenen
  'dr 42', 'stora jelling', // Jelling (stora)
  'u 448', 'jarlabanke',    // Jarlabanke (exempel)
]);
const monNorm = (s: string) => (s || '').toLowerCase().normalize('NFC').trim();
/** Sant om inskriften är en kuraterad monumentalsten (signum eller namn). */
export const isMonumentalStone = (signum?: string | null, name?: string | null): boolean => {
  const sg = monNorm(signum || ''), nm = monNorm(name || '');
  if (MONUMENTAL_STONES.has(sg)) return true;
  for (const key of MONUMENTAL_STONES) if (nm && (nm === key || nm.includes(key))) return true;
  return false;
};
// Vissa kungaplatser har en egen typ-ikon (Valsgärde → Vendel/båtgravshjälm).
const SEAT_ICON: Record<string, string> = { 'valsgärde': 'helmet' };

const normName = (s: string) => (s || '').toLowerCase().normalize('NFC').trim();

/** Sant om ortnamnet är en kurerad kungaplats (guldmarkör). */
export const isRoyalSeat = (name: string): boolean => {
  const n = normName(name);
  for (const s of ROYAL_SEATS) if (n === s || n.startsWith(s + ' ') || n.startsWith(s + ',')) return true;
  return false;
};
/** Ev. specialikon för en kungaplats (annars null → använd lagrets normala ikon). */
export const royalSeatIcon = (name: string): string | null => {
  const n = normName(name);
  for (const s of Object.keys(SEAT_ICON)) if (n === s || n.startsWith(s + ' ') || n.startsWith(s + ',')) return SEAT_ICON[s];
  return null;
};

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface MedallionOptions {
  color: string;          // ringfärg (hex) — använd markerColor(key)
  icon: string;           // nyckel i MARKER_ICONS (fallback 'dot')
  label: string;          // ortnamn
  sublabel?: string;      // valfri underrad (t.ex. gud/typ)
  size?: number;          // diskdiameter, default 34 (royal: 40)
  royal?: boolean;        // kungaplats → guldring + glöd + större disk (rang; typen bärs av ikonen)
  className?: string;     // extra CSS-klass (för lager-specifik gate om behövs)
}

const HALO = '0 0 2px #fff,0 0 2px #fff,0 0 3px #fff,0 1px 1px #fff,0 -1px 1px #fff,1px 0 1px #fff,-1px 0 1px #fff';
const SERIF = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";
// Guld för kungaplatser — den enda mättade tonen i en annars dov palett, så den poppar.
export const ROYAL_GOLD = '#d4a63c';

/** Bygg medaljong-divIcon. Disken ankras exakt på koordinaten; etiketten flyter under. */
export const createPlaceMedallion = (o: MedallionOptions): L.DivIcon => {
  const size = o.size ?? (o.royal ? 40 : 34);
  const ring = o.royal ? ROYAL_GOLD : o.color;
  const glyph = MARKER_ICONS[o.icon] || MARKER_ICONS.dot;
  const g = Math.round(size * 0.55);
  const svg = `<svg viewBox="0 0 24 24" width="${g}" height="${g}" fill="none" stroke="#eee7d7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))">${glyph}</svg>`;
  // Kungaplats: kraftigare guldglöd + tunn yttre guldring; annars diskret färgglöd.
  const shadow = o.royal
    ? `0 0 12px 0 ${ROYAL_GOLD},0 0 0 3px rgba(212,166,60,.22),0 2px 5px rgba(0,0,0,.45)`
    : `0 0 5px 0 ${ring},0 2px 5px rgba(0,0,0,.4)`;
  const disc = `<div style="width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#33414d,#212c35);border:2px solid ${ring};box-shadow:${shadow};">${svg}</div>`;
  const label = `<div style="position:absolute;top:${size + 2}px;left:50%;transform:translateX(-50%);white-space:nowrap;font-family:${SERIF};font-size:13px;font-weight:600;color:#1a222b;text-shadow:${HALO};pointer-events:none;">${esc(o.label)}</div>`;
  const sub = o.sublabel
    ? `<div style="position:absolute;top:${size + 18}px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10.5px;font-weight:500;color:#3f4a55;text-shadow:0 0 2px #fff,0 0 2px #fff;pointer-events:none;">${esc(o.sublabel)}</div>`
    : '';
  return L.divIcon({
    html: `<div style="position:relative;">${disc}${label}${sub}</div>`,
    // vp-medallion-klasserna lyfts över vanliga markörer via z-index i index.css.
    className: `vp-medallion ${o.royal ? 'vp-medallion--royal' : ''} ${o.className ?? ''}`.trim(),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
};
