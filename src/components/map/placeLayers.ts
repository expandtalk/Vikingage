export interface PlaceLayerConfig {
  key: string;
  label: string;
  color: string;
  radius: number;
  defaultOn: boolean;
}

// Lagerdefinition (ordning = legendens ordning). Nyckeln MÅSTE matcha place_features_near.
// Äventyr & natur ÖVERST (Daniel: nutidslager först), sedan kronologiskt förhistoria→medeltida.
export const DEFAULT_PLACE_LAYERS: PlaceLayerConfig[] = [
  // Äventyr & natur (nutid)
  { key: 'aventyr',     label: '🏖️ Äventyr & natur (bad, fiske)', color: '#06b6d4', radius: 5,   defaultOn: true },
  { key: 'grotta',      label: '🕳️ Grottor',                     color: '#9ca3af', radius: 3.5, defaultOn: false },
  // Förhistoria
  { key: 'megalit',     label: 'Megalitgravar & stensättningar', color: '#a78bfa', radius: 4,   defaultOn: true },
  { key: 'hallristning',label: 'Hällristningar (bronsålder)',    color: '#fb923c', radius: 3,   defaultOn: true },
  { key: 'rest_sten',   label: 'Resta stenar',                   color: '#cbd5e1', radius: 3,   defaultOn: false },
  // Järnålder & vikingatid
  { key: 'runsten',     label: 'Runstenar',                      color: '#f59e0b', radius: 4.5, defaultOn: true },
  { key: 'bildsten',    label: 'Bildstenar',                     color: '#eab308', radius: 4.5, defaultOn: true },
  { key: 'mynt',        label: 'Myntfynd',                       color: '#fbbf24', radius: 3.5, defaultOn: true },
  { key: 'offer',       label: 'Offer- & kultplatser',           color: '#34d399', radius: 3.5, defaultOn: true },
  // Kristet & medeltida
  { key: 'kristen',     label: 'Kristna platser',                color: '#38bdf8', radius: 4.5, defaultOn: true },
  { key: 'kyrka',       label: 'Kyrkor',                         color: '#0ea5e9', radius: 4.5, defaultOn: true },
  { key: 'avrattning',  label: '⚖️ Avrättningsplatser',          color: '#ef4444', radius: 4,   defaultOn: true },
  // "Allt övrigt" (kan vara tätt, t.ex. 400 kring Göteborg) → liten, halvtransparent bakgrundstextur.
  { key: 'fornlamning', label: 'Fornlämningar (övrigt)',         color: '#64748b', radius: 2,   defaultOn: true },
];

/**
 * Resolver för plats-lager-konfiguration.
 * Returnerar custom-konfiguration om given, annars DEFAULT_PLACE_LAYERS.
 */
export function resolvePlaceLayers(custom?: PlaceLayerConfig[]): PlaceLayerConfig[] {
  return custom ?? DEFAULT_PLACE_LAYERS;
}

/**
 * Skapar en Map av layer-konfigurationer indexerade på key.
 * Använd för snabb uppslags av stil-egenskaper per lager.
 */
export function placeLayerStyleMap(layers: PlaceLayerConfig[]): Record<string, PlaceLayerConfig> {
  return Object.fromEntries(layers.map((l) => [l.key, l]));
}
