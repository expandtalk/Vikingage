// Tvåspråkig taxonomi för ristarattribut (Källström kap 8.2.3). attribute_type är en
// kod i databasen; etiketterna översätts här. Värdet lagras tvåspråkigt (value_sv/_en).
export type CarverAttributeType = 'kinship' | 'origin' | 'occupation' | 'other';

export const ATTR_TYPE_LABELS: Record<string, { sv: string; en: string }> = {
  kinship: { sv: 'Släktskap', en: 'Kinship' },
  origin: { sv: 'Härkomst', en: 'Origin' },
  occupation: { sv: 'Sysselsättning', en: 'Occupation' },
  other: { sv: 'Övrigt', en: 'Other' },
};

export interface CarverAttribute {
  id: string;
  carver_id: string;
  attribute_type: string;
  value_sv: string | null;
  value_en: string | null;
  source_ref: string | null;
}
