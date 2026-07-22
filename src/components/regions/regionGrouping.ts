/**
 * Ren gruppering av inskrifter per härad/socken — utbruten ur RegionFindsView så att
 * både listvyn och kartlager (t.ex. runstenstäthet per härad) kan dela EXAKT samma
 * grupperingslogik utan att duplicera majoritetsröstning för landskap/land.
 *
 * Grupperas på fyndens egen härad-/socken-kolumn (auktoritativ). Landskap och land
 * härleds via majoritetsröstning eftersom källkolumnerna är fel för en del Bautil-stenar.
 */

export type RegionMode = 'hundreds' | 'parishes';

export interface RegionGroup {
  name: string;          // härads-/sockennamn (auktoritativt ur fyndens egen kolumn)
  landscape: string;     // majoritets-landskap (tom om för spretigt, t.ex. "Okänd")
  country: string;       // normaliserat land (majoritet)
  inscriptions: any[];
  count: number;
}

export const hasCoords = (i: any): boolean =>
  (i?.coordinates && i.coordinates.lat && i.coordinates.lng) || (i?.latitude && i?.longitude);

// Land härleds ur SIGNUM-PREFIXET, inte country-kolumnen (som är fel för t.ex.
// Akershus fylke = felmärkt Denmark). Prefixet är auktoritativt: N=Norge, DR/DK=
// Danmark, IS=Island, GR=Grönland osv.; övriga svenska landskapsprefix → Sverige.
const COUNTRY_BY_PREFIX: Record<string, string> = {
  DR: 'denmark', DK: 'denmark', N: 'norway', IS: 'iceland', GR: 'greenland',
  E: 'estonia', IR: 'ireland', SC: 'scotland', BR: 'britain', X: 'other',
};

export const countryKeyFromSignum = (signum?: string): string => {
  const p = (signum ?? '').trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  return COUNTRY_BY_PREFIX[p] ?? 'sweden';
};

// Härads-suffixet är auktoritativt för land (fylke=Norge, herred=Danmark,
// härad=Sverige, kihlakunta=Finland, Kreis=Tyskland) — mer pålitligt än signum
// för specialkataloger (KJ, NIÆR) i t.ex. "Akershus fylke".
export const countryKeyFromRegionName = (name: string): string | null => {
  const n = name.toLowerCase();
  if (/fylke$/.test(n)) return 'norway';
  if (/herred$/.test(n)) return 'denmark';
  if (/härad$/.test(n)) return 'sweden';
  if (/kihlakunta/.test(n)) return 'finland';
  if (/\bkreis\b|landkreis/.test(n)) return 'germany';
  return null;
};

const topVote = (votes: Map<string, number>): { key: string; share: number } => {
  let key = '';
  let best = 0;
  let total = 0;
  for (const [k, n] of votes) { total += n; if (n > best) { best = n; key = k; } }
  return { key, share: total ? best / total : 0 };
};

/**
 * Gruppera fynden per härad ('hundreds') eller socken ('parishes'). Bara fynd med
 * koordinat tas med (annars syns de inte på karta). Resultatet är sorterat A–Ö.
 */
export const buildRegionGroups = (inscriptions: any[], mode: RegionMode): RegionGroup[] => {
  const field = mode === 'hundreds' ? 'harad' : 'socken';
  const map = new Map<string, { name: string; inscriptions: any[]; landscapeVotes: Map<string, number>; countryVotes: Map<string, number> }>();
  for (const i of inscriptions) {
    const name = (i?.[field] ?? '').toString().trim();
    if (!name || !hasCoords(i)) continue;
    let g = map.get(name);
    if (!g) {
      g = { name, inscriptions: [], landscapeVotes: new Map(), countryVotes: new Map() };
      map.set(name, g);
    }
    g.inscriptions.push(i);
    // Landskap + land via MAJORITETSRÖSTNING — kolumnerna är fel för en del
    // Bautil-stenar (Vallentuna felmärkt Småland). Ett härad hör historiskt till
    // ETT landskap, så majoriteten ger rätt; catch-allen "Okänd" spänner dock många.
    const ls = (i?.landscape ?? '').toString().trim();
    if (ls) g.landscapeVotes.set(ls, (g.landscapeVotes.get(ls) ?? 0) + 1);
    const ck = countryKeyFromSignum(i?.signum);
    if (ck) g.countryVotes.set(ck, (g.countryVotes.get(ck) ?? 0) + 1);
  }
  const isUnknown = (n: string) => /^(okänd|unknown)$/i.test(n.trim());
  return [...map.values()]
    .map((g) => {
      const ls = topVote(g.landscapeVotes);
      const co = topVote(g.countryVotes);
      // Dölj landskap för catch-allen "Okänd" och när gruppen är för spretig (<60%).
      const landscape = isUnknown(g.name) || ls.share < 0.6 ? '' : ls.key;
      // Land: härad-suffix först (auktoritativt), annars signum-majoritet.
      const country = countryKeyFromRegionName(g.name) ?? co.key;
      return { name: g.name, landscape, country, inscriptions: g.inscriptions, count: g.inscriptions.length };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'sv'));
};
