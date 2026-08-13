// schema.org JSON-LD-byggare för entiteter → gör vår KG maskinläsbar/citerbar av AI-sök.
// GRUNDREGEL: endast BELAGDA fakta. sameAs bara bekräftade länkar (Wikidata/RAÄ ur external_ids).
// temporalCoverage/geo bara när känt. Aldrig AI-genererad text som faktapåstående. INGEN GISSNING.

export const SITE_URL = 'https://vikingage.se';

export type EntitySchemaType =
  | 'Place'
  | 'LandmarksOrHistoricalBuildings'
  | 'PlaceOfWorship'
  | 'Person'
  | 'Book'
  | 'CreativeWork'
  | 'Article'
  | 'WebPage';

export interface EntitySchemaInput {
  type: EntitySchemaType;
  name: string;
  path: string;                 // kanonisk sökväg, t.ex. '/sv/birka' → url = SITE_URL + path
  description?: string | null;
  inLanguage?: 'sv' | 'en';
  sameAs?: string[];            // bekräftade länkar ur external_ids (Wikidata/RAÄ)
  lat?: number | null;
  lng?: number | null;
  temporalCoverage?: string | null; // ISO-intervall/år, t.ex. '0750/0975' (belagt)
  image?: string | null;        // bara PD/CC-bild
}

const PLACE_TYPES = new Set<EntitySchemaType>(['Place', 'LandmarksOrHistoricalBuildings', 'PlaceOfWorship']);

export function buildEntityJsonLd(i: EntitySchemaInput): Record<string, unknown> {
  const out: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': i.type,
    name: i.name,
    url: SITE_URL + i.path,
    isPartOf: { '@type': 'WebSite', name: 'Viking Age', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Viking Age', url: SITE_URL },
  };
  if (i.description) out.description = i.description;
  if (i.inLanguage) out.inLanguage = i.inLanguage;
  if (i.sameAs && i.sameAs.length) out.sameAs = i.sameAs;
  if (i.temporalCoverage) out.temporalCoverage = i.temporalCoverage;
  if (i.image) out.image = i.image;
  if (PLACE_TYPES.has(i.type) && i.lat != null && i.lng != null && Number.isFinite(i.lat) && Number.isFinite(i.lng)) {
    out.geo = { '@type': 'GeoCoordinates', latitude: i.lat, longitude: i.lng };
  }
  return out;
}
