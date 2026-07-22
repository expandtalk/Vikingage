// Detekterar besökarens hemland (lätt proxy: språk + tidszon, ingen IP-tjänst) och mappar
// till historical_kings.region-värdena ('Sweden'|'Denmark'|'Norway'). Används för att visa
// rätt lands kungakrönika först. Övriga länder → Sverige (störst datamängd).
export type ChronicleRegion = 'Sweden' | 'Denmark' | 'Norway';

export function detectHomeRegion(): ChronicleRegion {
  try {
    const langs = [
      ...(navigator.languages ?? []),
      navigator.language ?? '',
    ].map((l) => l.toLowerCase());
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';

    const has = (prefixes: string[]) => langs.some((l) => prefixes.some((p) => l.startsWith(p)));

    // Tidszon är starkast; sedan språk. Danska/norska först eftersom svenska är fallback.
    if (tz === 'Europe/Copenhagen' || has(['da'])) return 'Denmark';
    if (tz === 'Europe/Oslo' || has(['nb', 'nn', 'no'])) return 'Norway';
    if (tz === 'Europe/Stockholm' || has(['sv'])) return 'Sweden';
  } catch {
    // Ignorera – faller igenom till Sverige.
  }
  return 'Sweden';
}
