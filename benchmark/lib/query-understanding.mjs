// Node-spegling av supabase/functions/_shared/queryUnderstanding.ts — IDENTISK logik.
// Håll dem i synk: ändras den ena, ändra den andra. Ren lexikal ankar-extraktion, deterministisk.
const STOPWORDS = new Set([
  'vad', 'vilka', 'vilken', 'vilket', 'vem', 'var', 'när', 'hur', 'varför', 'finns', 'är', 'har', 'kan',
  'om', 'i', 'på', 'från', 'till', 'nära', 'vid', 'som', 'och', 'eller', 'både', 'det', 'de', 'den', 'en',
  'ett', 'jag', 'mig', 'min', 'mina', 'vi', 'oss', 'ni', 'er', 'du', 'dig', 'ska', 'skall', 'göra', 'gör',
  'mellan', 'under', 'över', 'efter', 'före', 'med', 'av', 'för', 'än', 'samma', 'flera', 'något', 'någon',
  'ligger', 'heter', 'gällande', 'ur', 'mot', 'per',
  'hvor', 'hvem', 'hvad', 'hvilke', 'hvilken', 'hvilket', 'hvordan', 'hvorfor', 'kva', 'kven', 'korleis',
  'kvar', 'finnes', 'ligg', 'jeg', 'meg', 'kanskje', 'og',
  'what', 'which', 'who', 'whom', 'where', 'when', 'how', 'why', 'is', 'are', 'was', 'were', 'the', 'a',
  'an', 'of', 'in', 'on', 'from', 'to', 'near', 'at', 'both', 'and', 'or', 'can', 'do', 'does', 'me', 'my',
  'we', 'you', 'about', 'between', 'with',
]);
const stripPunct = (t) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const isStop = (t) => STOPWORDS.has(t.toLowerCase());
const isCapitalized = (t) => { const c = t[0] ?? ''; return c !== c.toLowerCase() && c === c.toUpperCase(); };

export function understandQuery(raw) {
  const original = (raw ?? '').trim();
  const tokens = original.split(/\s+/).map(stripPunct).filter(Boolean);
  if (tokens.length === 0) return { original, anchor: original, changed: false, reason: 'unchanged' };
  const spans = [];
  for (let i = 0; i < tokens.length; i++) {
    if (isStop(tokens[i]) || !isCapitalized(tokens[i])) continue;
    const start = i; let j = i + 1;
    while (j < tokens.length && !isStop(tokens[j])) j++;
    spans.push(tokens.slice(start, j).join(' ')); i = j;
  }
  if (spans.length > 0) {
    const anchor = spans.reduce((a, b) => (b.split(' ').length > a.split(' ').length ? b : a));
    return { original, anchor, changed: anchor !== original, reason: 'proper-noun' };
  }
  // Inget egennamn → lämna orörd (se .ts för motiv: content-strip AND-överbestämmer, regression D39).
  return { original, anchor: original, changed: false, reason: 'unchanged' };
}
