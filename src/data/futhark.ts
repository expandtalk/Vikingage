// Futhark-tabeller (DELAD sanningskälla för runsidan + skrivverktyget) + fonematisk
// translitteration latin→runa.
//
// HEDERLIGHET: glyferna är Unicode Runic-kodpunkter (auktoritativa, ej gissade former).
// Mappningen följer STANDARD translitteration. Yngre futharken (16 runor) slår ihop ljud —
// k-runan står även för g, t för d, b för p, u för o/y/v/w, i för e/j — så verktyget är ett
// translittererings-HJÄLPMEDEL, inte ett påstående om att en text historiskt skrevs så.

export interface FutharkRune { r: string; t: string; name: string; sv?: string; en?: string }

// Yngre futharken (vikingatidens 16 tecken, långkvist).
export const YOUNGER: FutharkRune[] = [
  { r: 'ᚠ', t: 'f', name: 'fé', sv: 'boskap, rikedom', en: 'cattle, wealth' },
  { r: 'ᚢ', t: 'u', name: 'úr', sv: 'slagg / uroxe (omtvistat)', en: 'dross / aurochs (debated)' },
  { r: 'ᚦ', t: 'þ (th)', name: 'þurs', sv: 'jätte, turs', en: 'giant, ogre' },
  { r: 'ᚬ', t: 'ą (nasalt a/o)', name: 'áss / óss', sv: 'as (gud)', en: 'god (of the Æsir)' },
  { r: 'ᚱ', t: 'r', name: 'reið', sv: 'ritt, färd', en: 'ride, journey' },
  { r: 'ᚴ', t: 'k', name: 'kaun', sv: 'sår, böld', en: 'sore, ulcer' },
  { r: 'ᚼ', t: 'h', name: 'hagall', sv: 'hagel', en: 'hail' },
  { r: 'ᚾ', t: 'n', name: 'nauðr', sv: 'nöd', en: 'need' },
  { r: 'ᛁ', t: 'i', name: 'íss', sv: 'is', en: 'ice' },
  { r: 'ᛅ', t: 'a', name: 'ár', sv: 'år, gröda', en: 'year, good harvest' },
  { r: 'ᛋ', t: 's', name: 'sól', sv: 'sol', en: 'sun' },
  { r: 'ᛏ', t: 't', name: 'týr', sv: 'guden Tyr', en: 'the god Týr' },
  { r: 'ᛒ', t: 'b', name: 'bjarkan', sv: 'björk', en: 'birch' },
  { r: 'ᛘ', t: 'm', name: 'maðr', sv: 'människa', en: 'man' },
  { r: 'ᛚ', t: 'l', name: 'lögr', sv: 'vatten, sjö', en: 'water, sea' },
  { r: 'ᛦ', t: 'ʀ', name: 'yr', sv: 'idegran', en: 'yew' },
];

// Äldre futharken (24 tecken, ca 150–800 e.Kr.). Namnen är urnordiska rekonstruktioner.
export const ELDER: FutharkRune[] = [
  { r: 'ᚠ', t: 'f', name: 'fehu' }, { r: 'ᚢ', t: 'u', name: 'ūruz' }, { r: 'ᚦ', t: 'þ', name: 'þurisaz' },
  { r: 'ᚨ', t: 'a', name: 'ansuz' }, { r: 'ᚱ', t: 'r', name: 'raidō' }, { r: 'ᚲ', t: 'k', name: 'kaunan' },
  { r: 'ᚷ', t: 'g', name: 'gebō' }, { r: 'ᚹ', t: 'w', name: 'wunjō' }, { r: 'ᚺ', t: 'h', name: 'hagalaz' },
  { r: 'ᚾ', t: 'n', name: 'naudiz' }, { r: 'ᛁ', t: 'i', name: 'īsaz' }, { r: 'ᛃ', t: 'j', name: 'jēra' },
  { r: 'ᛇ', t: 'ï', name: 'eihwaz' }, { r: 'ᛈ', t: 'p', name: 'perþō' }, { r: 'ᛉ', t: 'z', name: 'algiz' },
  { r: 'ᛋ', t: 's', name: 'sōwilō' }, { r: 'ᛏ', t: 't', name: 'tīwaz' }, { r: 'ᛒ', t: 'b', name: 'berkanan' },
  { r: 'ᛖ', t: 'e', name: 'ehwaz' }, { r: 'ᛗ', t: 'm', name: 'mannaz' }, { r: 'ᛚ', t: 'l', name: 'laguz' },
  { r: 'ᛜ', t: 'ŋ', name: 'ingwaz' }, { r: 'ᛟ', t: 'o', name: 'ōþila' }, { r: 'ᛞ', t: 'd', name: 'dagaz' },
];

export type FutharkKind = 'younger' | 'elder';
export interface TranslitStep { input: string; rune: string; noteSv?: string; noteEn?: string }

const DIV = '᛫'; // ordskiljare (Runic single punctuation, U+16EB)

// Yngre futharken — latin/svenskt ljud → runa, med standard-sammanslagningar.
const Y_MAP: Record<string, string> = {
  a: 'ᛅ', b: 'ᛒ', c: 'ᚴ', d: 'ᛏ', e: 'ᛁ', f: 'ᚠ', g: 'ᚴ', h: 'ᚼ', i: 'ᛁ', j: 'ᛁ', k: 'ᚴ', l: 'ᛚ',
  m: 'ᛘ', n: 'ᚾ', o: 'ᚢ', p: 'ᛒ', q: 'ᚴ', r: 'ᚱ', s: 'ᛋ', t: 'ᛏ', u: 'ᚢ', v: 'ᚢ', w: 'ᚢ', x: 'ᚴᛋ',
  y: 'ᚢ', z: 'ᛋ', 'å': 'ᚢ', 'ä': 'ᛅ', 'ö': 'ᚢ', 'æ': 'ᛅ', 'ø': 'ᚢ', 'þ': 'ᚦ',
};
// Äldre futharken — fler egna tecken (g, w, p, e, o, d, j, z, ŋ distinkta).
const E_MAP: Record<string, string> = {
  a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ', i: 'ᛁ', j: 'ᛃ', k: 'ᚲ', l: 'ᛚ',
  m: 'ᛗ', n: 'ᚾ', o: 'ᛟ', p: 'ᛈ', q: 'ᚲ', r: 'ᚱ', s: 'ᛋ', t: 'ᛏ', u: 'ᚢ', v: 'ᚹ', w: 'ᚹ', x: 'ᚲᛋ',
  y: 'ᚢ', z: 'ᛉ', 'å': 'ᚨ', 'ä': 'ᚨ', 'ö': 'ᛟ', 'æ': 'ᚨ', 'ø': 'ᛟ', 'þ': 'ᚦ',
};
// Sammanslagnings-noter för yngre futharken (visas i "hur det translittererades").
const Y_NOTE: Record<string, [string, string]> = {
  g: ['k-runan står även för g', 'the k-rune also serves g'],
  d: ['t-runan står även för d', 'the t-rune also serves d'],
  p: ['b-runan står även för p', 'the b-rune also serves p'],
  o: ['u-runan står även för o', 'the u-rune also serves o'],
  y: ['u-runan står även för y', 'the u-rune also serves y'],
  v: ['u-runan står även för v/w', 'the u-rune also serves v/w'],
  w: ['u-runan står även för v/w', 'the u-rune also serves v/w'],
  e: ['i-runan står även för e', 'the i-rune also serves e'],
  j: ['i-runan står även för j', 'the i-rune also serves j'],
  c: ['skrivs med k-runan', 'written with the k-rune'],
  q: ['skrivs med k-runan', 'written with the k-rune'],
  z: ['skrivs med s-runan', 'written with the s-rune'],
};

/**
 * Translitterera latinsk text till runor (fonematiskt, inte 1:1). Returnerar runsträngen +
 * stegen (för den transparenta "så här mappades det"-vyn).
 */
export function transliterate(text: string, kind: FutharkKind): { runes: string; steps: TranslitStep[] } {
  const map = kind === 'younger' ? Y_MAP : E_MAP;
  const lower = (text || '').toLowerCase();
  const steps: TranslitStep[] = [];
  let out = '';
  let i = 0;
  while (i < lower.length) {
    const ch = lower[i];
    const two = lower.slice(i, i + 2);
    if (two === 'th') {
      out += 'ᚦ';
      steps.push({ input: 'th', rune: 'ᚦ', noteSv: 'ett tecken (þurs)', noteEn: 'a single rune (þurs)' });
      i += 2; continue;
    }
    if (two === 'ng') {
      const r = kind === 'younger' ? 'ᚾᚴ' : 'ᛜ';
      out += r;
      steps.push({ input: 'ng', rune: r, noteSv: kind === 'younger' ? 'skrivs n+k' : 'ingwaz', noteEn: kind === 'younger' ? 'written n+k' : 'ingwaz' });
      i += 2; continue;
    }
    if (/\s/.test(ch)) { out += DIV; i += 1; continue; }
    const rune = map[ch];
    if (rune) {
      const n = kind === 'younger' ? Y_NOTE[ch] : undefined;
      steps.push({ input: ch, rune, noteSv: n?.[0], noteEn: n?.[1] });
      out += rune;
    } else if (/[a-zA-Zà-ÿ]/.test(ch)) {
      steps.push({ input: ch, rune: '', noteSv: 'ingen motsvarande runa', noteEn: 'no matching rune' });
    }
    i += 1;
  }
  return { runes: out, steps };
}

// --- LÄS-riktning: runor → möjliga ljud -------------------------------------------------
// Ärligt: yngre futharken är MÅNGTYDIG — en runa kan läsas som flera ljud. Läsaren visar
// därför ALLA rimliga värden per runa, inte en påstådd "rätt" tolkning. Inkluderar även
// stungna (dotted) medeltida runor + vanliga kortkvist-varianter så verkliga inskrifter kan
// klistras in. Detta är ett tolknings-HJÄLPMEDEL, inte en attesterad läsning.
const Y_READ: Record<string, string[]> = {
  'ᚠ': ['f'], 'ᚢ': ['u', 'o', 'y', 'v', 'w'], 'ᚦ': ['þ', 'th'], 'ᚬ': ['ą', 'a', 'o'],
  'ᚱ': ['r'], 'ᚴ': ['k', 'g'], 'ᚼ': ['h'], 'ᚾ': ['n'], 'ᛁ': ['i', 'e', 'j'],
  'ᛅ': ['a', 'æ'], 'ᛋ': ['s'], 'ᛏ': ['t', 'd'], 'ᛒ': ['b', 'p'], 'ᛘ': ['m'],
  'ᛚ': ['l'], 'ᛦ': ['ʀ', 'r'],
  // stungna (dotted) medeltida runor:
  'ᚵ': ['g'], 'ᚧ': ['ð'], 'ᛂ': ['e'], 'ᛑ': ['d'], 'ᛔ': ['p'], 'ᚤ': ['y'], 'ᚿ': ['n'],
  // vanliga kortkvist-varianter:
  'ᚽ': ['h'], 'ᛌ': ['s'], 'ᛆ': ['a'], 'ᛧ': ['ʀ'], 'ᛓ': ['b'],
};
const E_READ: Record<string, string[]> = {
  'ᚠ': ['f'], 'ᚢ': ['u'], 'ᚦ': ['þ'], 'ᚨ': ['a'], 'ᚱ': ['r'], 'ᚲ': ['k'], 'ᚷ': ['g'], 'ᚹ': ['w', 'v'],
  'ᚺ': ['h'], 'ᚾ': ['n'], 'ᛁ': ['i'], 'ᛃ': ['j'], 'ᛇ': ['ï', 'ei'], 'ᛈ': ['p'], 'ᛉ': ['z', 'ʀ'], 'ᛋ': ['s'],
  'ᛏ': ['t'], 'ᛒ': ['b'], 'ᛖ': ['e'], 'ᛗ': ['m'], 'ᛚ': ['l'], 'ᛜ': ['ŋ', 'ng'], 'ᛟ': ['o'], 'ᛞ': ['d'],
};

export interface ReadCell { rune: string; values: string[] }

// Läs runor → per-runa möjliga ljud + en normaliserad kandidat (första värdet per runa).
// Ordskiljare (᛫ : · mellanslag) blir mellanslag; okända runtecken markeras '?'.
export function readRunes(input: string, kind: FutharkKind): { cells: ReadCell[]; candidate: string } {
  const map = kind === 'younger' ? Y_READ : E_READ;
  const cells: ReadCell[] = [];
  for (const ch of Array.from(input || '')) {
    if (ch === DIV || ch === ':' || ch === '·' || ch === '⁚' || /\s/.test(ch)) { cells.push({ rune: ' ', values: [' '] }); continue; }
    const v = map[ch];
    if (v) cells.push({ rune: ch, values: v });
    else if (/[ᚠ-᛿]/.test(ch)) cells.push({ rune: ch, values: ['?'] }); // runtecken utan mappning
    // annat (latinsk text, siffror) hoppas över
  }
  const candidate = cells.map((c) => (c.values[0] === ' ' ? ' ' : c.values[0])).join('').replace(/\s+/g, ' ').trim();
  return { cells, candidate };
}
