/**
 * Element-katalog för ortnamnslagret (GIS-pilot).
 *
 * Design: docs/superpowers/specs/2026-07-17-ortnamn-gis-pilot-design.md
 *
 * Varje element har en DOKUMENTERAD inklusionsregel (patterns/excludes) som bestäms
 * *före* sökning — inte ad hoc. Detta är ett vetenskapligt krav (rapport §5.3): urvalet
 * ska vara reproducerbart och stavningsvarianterna redovisade.
 *
 * Kategorierna (sacral/power/nature) är BÄSTA GISSNING, inte påståenden. Flera element är
 * etymologiskt omtvistade (rapport §5.2 — Ed kan vara näs, Hammar en bergklack); dessa
 * bär `contested: true` och det syns i kartans UI.
 *
 * Katalogen är avsiktligt en kurerad startlista (rapportens hypotes-element). Fler element
 * kan läggas till här utan schemaändring.
 */

export type ElementCategory = 'sacral' | 'power' | 'nature';

export interface PlaceNameElement {
  /** Stabil nyckel, lagras i place_names.element_keys. */
  key: string;
  /** Visningsnamn i UI. */
  label: string;
  /** Bästa gissning — inte ett påstående. */
  category: ElementCategory;
  /** Etymologiskt omtvistad (rapport §5.2). Visas i UI. */
  contested: boolean;
  /** Kort etymologi-not, visas i popup. */
  etymology: string;
  /**
   * Matchningsled, gemener utan diakriter. Ett namn matchar elementet om något mönster
   * förekommer i det normaliserade namnet och inget `excludes`-mönster gör det.
   */
  patterns: string[];
  /** Kända falska träffar (rapport §3.3), gemener utan diakriter. */
  excludes: string[];
}

/**
 * Startlista — rapportens hypotes-element. `Mar/Mer` är medvetet uteslutet (brus mot
 * Maria-/Mark-namn, rapport §3.2).
 */
export const PLACE_NAME_ELEMENTS: PlaceNameElement[] = [
  {
    key: 'val',
    label: 'Val / Vall',
    category: 'sacral',
    contested: true,
    etymology: '*vé/vi* (kult) eller *vall* (slätt, gärde, jordvall).',
    patterns: ['val', 'vall', 'valla'],
    excludes: [],
  },
  {
    key: 'ed',
    label: 'Ed',
    category: 'nature',
    contested: false,
    etymology: 'Näs eller drag­ställe mellan vatten — naturlig kommunikationsknutpunkt.',
    patterns: ['ed', 'eds'],
    excludes: [],
  },
  {
    key: 'hammar',
    label: 'Hammar',
    category: 'nature',
    contested: false,
    etymology: 'Stenig höjd eller bergklack.',
    patterns: ['hammar'],
    excludes: ['hamar'], // norska Hamar (rapport §3.3)
  },
  {
    key: 'vang',
    label: 'Vang / Vång',
    category: 'nature',
    contested: true,
    etymology: 'Inhägnad äng eller gärde.',
    patterns: ['vang', 'vanga'],
    excludes: [],
  },
  {
    key: 'sal',
    label: 'Sal',
    category: 'power',
    contested: true,
    etymology: 'Hall/sal — möjlig central- eller kultbyggnad.',
    patterns: ['sal', 'sala', 'sall'],
    excludes: ['salt'], // Saltäng m.fl. (rapport §3.3)
  },
  {
    key: 'stav',
    label: 'Stav',
    category: 'sacral',
    contested: true,
    etymology: 'Stav eller stavgård — möjlig kultplats.',
    patterns: ['stav', 'stava', 'staf'],
    excludes: [],
  },
  {
    key: 'horn',
    label: 'Horn',
    category: 'sacral',
    contested: true,
    etymology: 'Topografiskt horn/udde eller teofort.',
    patterns: ['horn'],
    excludes: [],
  },
  {
    key: 'horse',
    label: 'Häst (Hors/Ross/Stod/Ökna)',
    category: 'sacral',
    contested: true,
    etymology: 'Hästrelaterat — möjlig koppling till hästoffer.',
    patterns: ['hors', 'ross', 'stod', 'okna'],
    excludes: [],
  },
];

const ELEMENTS_BY_KEY: Record<string, PlaceNameElement> = Object.fromEntries(
  PLACE_NAME_ELEMENTS.map((e) => [e.key, e])
);

export const getElement = (key: string): PlaceNameElement | undefined => ELEMENTS_BY_KEY[key];

/** Presentationsdata per kategori (färg + symbol till kartikoner och legend). */
export const ELEMENT_CATEGORY_META: Record<
  ElementCategory,
  { label: string; color: string; symbol: string }
> = {
  sacral: { label: 'Sakralt / kult', color: '#9932CC', symbol: '◆' },
  power: { label: 'Makt / centralplats', color: '#C99A2E', symbol: '■' },
  nature: { label: 'Natur / topografi', color: '#2E8B57', symbol: '●' },
};

/**
 * Normalisera för matchning: gemener, svenska diakriter fällda till bastecken
 * (å/ä→a, ö→o) så mönstren kan skrivas utan diakriter och matcha konsekvent.
 */
export const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '');

/**
 * Vilka element matchar ett namn? Ren funktion — samma regel i importskript och UI.
 * Ett element matchar om något `patterns` förekommer i det normaliserade namnet och
 * inget `excludes` gör det.
 */
export const matchElements = (name: string): string[] => {
  const norm = normalizeName(name);
  if (!norm) return [];

  return PLACE_NAME_ELEMENTS.filter((el) => {
    const excluded = el.excludes.some((ex) => norm.includes(normalizeName(ex)));
    if (excluded) return false;
    return el.patterns.some((p) => norm.includes(normalizeName(p)));
  }).map((el) => el.key);
};

/**
 * Härled element_category från matchade nycklar. Om nycklarna spänner över flera
 * kategorier väljs den första enligt prioritet sacral > power > nature (godtyckligt men
 * stabilt; enskilda element behåller alltid sin egen kategori via element_keys).
 */
export const categoryForKeys = (keys: string[]): ElementCategory | null => {
  const priority: ElementCategory[] = ['sacral', 'power', 'nature'];
  const cats = new Set(keys.map((k) => ELEMENTS_BY_KEY[k]?.category).filter(Boolean) as ElementCategory[]);
  return priority.find((c) => cats.has(c)) ?? null;
};
