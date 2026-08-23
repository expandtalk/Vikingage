// Verktygsavsikter ("utility intents"): frågor som INTE är historiska korpus-frågor utan
// triviala klient-svar (klockan, datum, veckodag). De ska INTE gå till RAG (search-answer) —
// det ger bara "Inga källor hittades" — utan besvaras direkt i klienten ur webbläsarens egen
// Date/Intl (fakta, ingen gissning, ingen nätrunda, ingen spårning).
//
// Medvetet SMAL matchning: bara entydiga klock-/datum-/vecko-frågor. Historiska frågor
// ("vad hände år 1000", "vilken dag dog Gustav Vasa") fångas INTE — de äger korpusen.

export type PersonRelation = 'birth' | 'death' | 'burial';
export type UtilityIntent =
  | { kind: 'clock' } // klockan / datum / veckodag / helgdag / världsklockor
  | { kind: 'locate'; place: string } // "var ligger X" → lös mot kartdata, ej RAG
  | { kind: 'person_locate'; person: string; relation: PersonRelation } // "var dog/föddes X" → person→plats + KÄLLA (RAG behålls)
  | null;

// Alla mönster leder till samma rika block (tid + datum + vecka + helgdag + världsklockor),
// eftersom en användare som frågar om "dag" också gärna ser tiden och vice versa.
const CLOCK_PATTERNS: RegExp[] = [
  // Tid
  /\bhur mycket är klockan\b/,
  /\bvad (?:är|e)r?\s+klockan\b/,
  /^klockan$/, /^tiden$/, /\bvad (?:är|e)r?\s+tiden\b/,
  /\bwhat(?:'?s| is)\s+the time\b/, /\bwhat time is it\b/, /\btime now\b/,
  // Datum / dag
  /\bvad (?:är|e)r?\s+det för dag\b/,
  /\bvilken dag (?:är|e) det\b/, /^vilken dag$/,
  /\bdagens datum\b/, /\bvad (?:är|e)r?\s+datum(?:et)?\b/,
  /^datum$/, /^vilket datum$/,
  /\bwhat day is it\b/, /\btoday'?s date\b/,
  // Vecka
  /\bvilken vecka (?:är|e) det\b/, /^vilken vecka$/,
  /\bvad (?:är|e)r?\s+det för vecka\b/,
  /\bveckonummer\b/, /\bwhat week (?:is it)?\b/,
];

// LOCATE — "var ligger/var är/var finns/vart ligger X", "where is X". NUTID medvetet: dåtid
// ("var låg centrum i Fjädrundaland", "var dog Birger Jarl", "var restes runstenarna", "var har X
// stått") är FORSKNINGSFRÅGOR och ska gå till RAG/Fornvännen — dem fångar vi INTE här.
const LOCATE_PATTERNS: RegExp[] = [
  /^(?:var|vart)\s+(?:ligger|är|e|finns|hittar jag(?:\s+till)?)\s+(.+)$/,
  /^where(?:'?s| is| are| can i find)\s+(.+)$/,
  /^hur (?:hittar|kommer) jag(?:\s+till)?\s+(.+)$/,
];
// Städa ut platsnamnet: ta bort inledande artikel och avslutande "beläget/någonstans" m.m.
const cleanPlace = (s: string): string =>
  s.trim()
    .replace(/\s+(beläge[tn]|nånstans|någonstans|egentligen|idag|nu)\s*$/i, '')
    .replace(/^(den |det |en |ett )/i, '')
    .trim();

// RELATIONELL locate — "var dog/föddes/begravdes X" (X = person). Till skillnad från vanlig locate
// SUPPAS INTE RAG här: det källförda svaret (t.ex. Fornvännen "Var dog Birger Jarl?") är hela poängen.
// Vi ADDERAR platsen på karta. Måste testas FÖRE generell locate ("var är begravd X" → burial, ej
// locate på "begravd X"). Nutid ("var ligger X") = plats; dessa verb = person→relation.
const PERSON_LOCATE: { re: RegExp; relation: PersonRelation }[] = [
  { re: /^var\s+(?:föddes|är född|född)\s+(.+)$/, relation: 'birth' },
  { re: /^var\s+(?:dog|avled|dött|gick bort)\s+(.+)$/, relation: 'death' },
  { re: /^var\s+(?:begravdes|ligger begravd|är begravd|vilar|gravlades)\s+(.+)$/, relation: 'burial' },
  { re: /^where was\s+(.+?)\s+born$/, relation: 'birth' },
  { re: /^where was\s+(.+?)\s+buried$/, relation: 'burial' },
  { re: /^where did\s+(.+?)\s+die$/, relation: 'death' },
];

export function detectUtilityIntent(raw: string): UtilityIntent {
  const q = (raw ?? '').trim().toLowerCase().replace(/[?.!]+$/, '').trim();
  if (q.length < 3) return null;
  // Klocka först (så "var är klockan" blir klocka, inte locate på "klockan").
  if (CLOCK_PATTERNS.some((re) => re.test(q))) return { kind: 'clock' };
  // Relationell locate FÖRE generell locate ("var är begravd X" → burial, ej locate).
  for (const { re, relation } of PERSON_LOCATE) {
    const m = q.match(re);
    if (m?.[1]) {
      const person = cleanPlace(m[1]);
      if (person.length >= 2) return { kind: 'person_locate', person, relation };
    }
  }
  for (const re of LOCATE_PATTERNS) {
    const m = q.match(re);
    if (m?.[1]) {
      const place = cleanPlace(m[1]);
      if (place.length >= 2) return { kind: 'locate', place };
    }
  }
  return null;
}
