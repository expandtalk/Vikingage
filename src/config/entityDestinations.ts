import {
  MapPin, BookOpen, Hammer, Church, Castle, Users2, Crown, Users,
  Sparkles, ScrollText, Compass, Coins as CoinsIcon, type LucideIcon,
} from 'lucide-react';

export interface DestinationInput { entity_id: string; label: string; signum?: string | null }
export interface Destination { labelSv: string; labelEn: string; icon: LucideIcon; route: string }

const enc = (s: string) => encodeURIComponent(s);

type Def = { labelSv: string; labelEn: string; icon: LucideIcon; route: (h: DestinationInput) => string };

// Vägvisar-config: entity_type -> destination. Enda sanningskällan (extraherad ur GlobalSearch:s META,
// utökad med KG-nodtyperna estate/church/cult_site/hundred).
const DEFS: Record<string, Def> = {
  landscape:      { labelSv: 'Landskap & regioner', labelEn: 'Landscapes & regions', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  inscription:    { labelSv: 'Runinskrifter', labelEn: 'Inscriptions', icon: BookOpen, route: (h) => `/inscription/${enc(h.signum ?? h.label)}` },
  carver:         { labelSv: 'Ristare', labelEn: 'Carvers', icon: Hammer, route: (h) => `/carvers?carver=${h.entity_id}` },
  parish:         { labelSv: 'Socknar', labelEn: 'Parishes', icon: MapPin, route: (h) => `/explore?focus=parishes&region=${enc(h.label)}` },
  hundred:        { labelSv: 'Härader', labelEn: 'Hundreds', icon: MapPin, route: (h) => `/explore?focus=hundreds&region=${enc(h.label)}` },
  place:          { labelSv: 'Ortnamn', labelEn: 'Place names', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  christian_site: { labelSv: 'Heliga platser', labelEn: 'Holy sites', icon: Church, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  church:         { labelSv: 'Kyrkor & stift', labelEn: 'Churches & dioceses', icon: Church, route: () => '/kyrkor' },
  fortress:       { labelSv: 'Försvar', labelEn: 'Fortresses', icon: Castle, route: () => '/fortresses' },
  hillfort:       { labelSv: 'Fornborgar', labelEn: 'Hillforts', icon: Castle, route: () => '/fortresses' },
  estate:         { labelSv: 'Maktsäten', labelEn: 'Power seats', icon: Castle, route: (h) => `/explore?focus=fortresses&searchQuery=${enc(h.label)}` },
  cult_site:      { labelSv: 'Kultplatser', labelEn: 'Cult sites', icon: Sparkles, route: (h) => h.signum ? `/sv/plats/${enc(h.signum)}` : '/explore?focus=cultSites' },
  folk_group:     { labelSv: 'Folkgrupper', labelEn: 'Peoples', icon: Users2, route: () => '/explore?focus=folkGroups' },
  city:           { labelSv: 'Städer', labelEn: 'Cities', icon: Castle, route: () => '/fortresses' },
  king:           { labelSv: 'Kungar', labelEn: 'Kings', icon: Crown, route: () => '/royal-chronicles' },
  dynasty:        { labelSv: 'Släkter', labelEn: 'Dynasties', icon: Users2, route: () => '/royal-chronicles' },
  coin:           { labelSv: 'Mynt & skatter', labelEn: 'Coins & hoards', icon: CoinsIcon, route: (h) => `/coins/${h.entity_id}` },
  god:            { labelSv: 'Gudar', labelEn: 'Gods', icon: Sparkles, route: () => '/explore?focus=gods' },
  viking_name:    { labelSv: 'Namn', labelEn: 'Names', icon: Users, route: () => '/explore?focus=names' },
  source:         { labelSv: 'Källor', labelEn: 'Sources', icon: ScrollText, route: (h) => `/sources/${h.entity_id}` },
  road:           { labelSv: 'Vägar & leder', labelEn: 'Roads', icon: MapPin, route: () => '/explore' },
  excursion:      { labelSv: 'Utflykter', labelEn: 'Excursions', icon: Compass, route: () => '/excursions' },
  theme:          { labelSv: 'Teman', labelEn: 'Themes', icon: Sparkles, route: () => '/explore' },
};

export function destinationFor(entityType: string, input: DestinationInput): Destination | null {
  const def = DEFS[entityType];
  if (!def) return null;
  return { labelSv: def.labelSv, labelEn: def.labelEn, icon: def.icon, route: def.route(input) };
}

// --- Graf-grannar → destinationer (ren, supabase-fri logik; IO ligger i useEntityNeighbors) ---

export interface NeighborRow { direction: string; predicate: string; other_id: string; other_type: string; other_label: string }
export interface NeighborDestination { predicate: string; other_type: string; label: string; destination: Destination }

// En graf-granne -> en destination (grannens etikett + dess route). null om okänd typ.
export function mapNeighbor(row: NeighborRow): NeighborDestination | null {
  const dest = destinationFor(row.other_type, { entity_id: row.other_id, label: row.other_label });
  if (!dest) return null;
  return { predicate: row.predicate, other_type: row.other_type, label: row.other_label, destination: dest };
}
