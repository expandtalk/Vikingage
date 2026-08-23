// Detektera FRÅGANS språk för AI-svaret — så en svensk fråga får ett SVENSKT svar även när UI:t står
// i engelskt läge (och tvärtom). Buggen: search-answer fick UI-växlarens språk, inte frågans, så
// "vem var ansgar" i engelskt läge gav ett engelskt svar. Faller tillbaka på UI-språket vid oavgjort.

const SV_WORDS = new Set([
  'vem', 'vad', 'var', 'vart', 'hur', 'när', 'varför', 'vilka', 'vilken', 'vilket', 'och', 'är',
  'på', 'för', 'det', 'som', 'en', 'ett', 'av', 'med', 'till', 'från', 'han', 'hon', 'de', 'vi',
  'jag', 'du', 'finns', 'ligger', 'betyder', 'berätta', 'beskriv', 'historia', 'kung', 'runsten',
  'vart', 'hette', 'gjorde', 'levde',
]);
const EN_WORDS = new Set([
  'who', 'what', 'where', 'when', 'why', 'which', 'how', 'the', 'is', 'was', 'are', 'and', 'of',
  'for', 'to', 'from', 'he', 'she', 'they', 'we', 'tell', 'about', 'history', 'king', 'give',
  'does', 'did', 'can', 'were', 'runestone',
]);

export function detectQueryLang(q: string, fallback: 'sv' | 'en'): 'sv' | 'en' {
  const s = (q || '').toLowerCase();
  if (/[åäö]/.test(s)) return 'sv';         // å/ä/ö → otvetydigt svenska
  const toks = s.split(/[^a-zåäö]+/).filter(Boolean);
  let sv = 0, en = 0;
  for (const t of toks) { if (SV_WORDS.has(t)) sv++; if (EN_WORDS.has(t)) en++; }
  if (sv > en) return 'sv';
  if (en > sv) return 'en';
  return fallback;                          // oavgjort/inga signalord → UI-språket
}
