// Delad typad symbologi för "sevärdheter inom räckvidd" — används av både exkursionssidan
// (ExcursionDetail) och fornborgssidan (FortressDetail). Färg + ikon + storlek per kategori, så
// kartan inte blir en enfärgad pricksoppa. Ordningen = prioritet vid klassning (första matchen vinner).
export interface NearCat {
  id: string; sv: string; en: string; color: string; r: number; glyph: string;
  match: (kind: string, raa: string) => boolean;
}

export const NEAR_CATS: NearCat[] = [
  { id: 'fort', sv: 'Fornborg / ringborg', en: 'Hillfort', color: '#ef4444', r: 8, glyph: '🛡️', match: (k, t) => k === 'heritage' && /fornborg|ringborg|\bborg\b/i.test(t) },
  { id: 'runestone', sv: 'Runsten', en: 'Runestone', color: '#f59e0b', r: 6, glyph: 'ᚱ', match: (k) => k === 'runestone' },
  { id: 'church', sv: 'Kyrka / kapell', en: 'Church / chapel', color: '#38bdf8', r: 6, glyph: '⛪', match: (k, t) => k === 'church' || /kyrka|kapell/i.test(t) },
  { id: 'cult', sv: 'Kultplats & tradition', en: 'Cult site', color: '#ec4899', r: 7, glyph: '✨', match: (k, t) => k === 'cult' || /tradition|offerk|kultplats/i.test(t) },
  { id: 'rockart', sv: 'Hällristning', en: 'Rock art', color: '#f97316', r: 5, glyph: '🪨', match: (k, t) => /hällrist|hällbild/i.test(t) },
  { id: 'road', sv: 'Vägnät (färdväg, milstolpe)', en: 'Roads', color: '#b45309', r: 4, glyph: '🛤️', match: (k, t) => /färdväg|hålväg|väghållningssten|milstolpe|vägmärke/i.test(t) },
  { id: 'gravefield', sv: 'Gravfält', en: 'Grave field', color: '#a78bfa', r: 6, glyph: '⚰️', match: (k, t) => /gravfält/i.test(t) },
  { id: 'stonesetting', sv: 'Stensättning', en: 'Stone setting', color: '#34d399', r: 4, glyph: '◍', match: (k, t) => /stensättning/i.test(t) },
  { id: 'stonemonument', sv: 'Röse & stenmonument', en: 'Cairn & stone monuments', color: '#94a3b8', r: 5, glyph: '⛰️', match: (k, t) => /röse|\brör\b|domarring|skeppssättning|stenkammargrav|hällkista|rest sten/i.test(t) },
  { id: 'other', sv: 'Övrigt', en: 'Other', color: '#475569', r: 3, glyph: '▪', match: () => true },
];

export const classifyNear = (kind: string, raa: string | null): NearCat =>
  NEAR_CATS.find((c) => c.match(kind, raa || '')) ?? NEAR_CATS[NEAR_CATS.length - 1];
