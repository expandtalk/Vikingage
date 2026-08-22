// Query-understanding: extrahera ankarentiteten UR en naturlig-språk-fråga FÖRE retrieval.
// Fynd i benchmark 2026-08-22: motorn har ingen entitetsextraktion → "Vad finns att se i Varnhem?"
// blir en token-påse och frågeorden drar iväg semantiken (→ Aun den gamle / Edda-strofer). Att först
// plocka ut egennamns-spannet ("Varnhem") och söka DET återställer entitetslänkningen — och fixar
// dessutom nordisk NL lexikalt (da/no/en frågeord strippas), oberoende av embedding-modellens språk.
//
// Rent lexikalt och deterministiskt (inga extra nätrundor, ingen modell). Delas av search-hybrid/answer
// via retrieve.ts. Om inget egennamn hittas lämnas frågan i princip orörd (fallback = innehållsorden),
// så domänord (hacksilver, mjölk) INTE förstörs — de kräver ordliste-/begreppslagret, inte detta.

// Stoppord + frågeord: svenska, danska, norska, engelska. Låggemener, diakritik bevarad.
const STOPWORDS = new Set([
  // sv
  'vad', 'vilka', 'vilken', 'vilket', 'vem', 'var', 'när', 'hur', 'varför', 'finns', 'är', 'har', 'kan',
  'om', 'i', 'på', 'från', 'till', 'nära', 'vid', 'som', 'och', 'eller', 'både', 'det', 'de', 'den', 'en',
  'ett', 'jag', 'mig', 'min', 'mina', 'vi', 'oss', 'ni', 'er', 'du', 'dig', 'ska', 'skall', 'göra', 'gör',
  'mellan', 'under', 'över', 'efter', 'före', 'med', 'av', 'för', 'än', 'samma', 'flera', 'något', 'någon',
  'ligger', 'heter', 'gällande', 'ur', 'mot', 'per',
  // da/no (utöver överlapp med sv)
  'hvor', 'hvem', 'hvad', 'hvilke', 'hvilken', 'hvilket', 'hvordan', 'hvorfor', 'kva', 'kven', 'korleis',
  'kvar', 'finnes', 'ligg', 'jeg', 'meg', 'kanskje', 'og', 'eller',
  // en
  'what', 'which', 'who', 'whom', 'where', 'when', 'how', 'why', 'is', 'are', 'was', 'were', 'the', 'a',
  'an', 'of', 'in', 'on', 'from', 'to', 'near', 'at', 'both', 'and', 'or', 'can', 'do', 'does', 'me', 'my',
  'we', 'you', 'about', 'between', 'with',
]);

const stripPunct = (t: string) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const isStop = (t: string) => STOPWORDS.has(t.toLowerCase());
const isCapitalized = (t: string) => {
  const c = t[0] ?? '';
  return c !== c.toLowerCase() && c === c.toUpperCase();
};

export interface Understood {
  original: string;
  anchor: string;   // det motorn faktiskt bör söka på
  changed: boolean;  // skiljer anchor från original?
  reason: 'proper-noun' | 'content-words' | 'unchanged';
}

export function understandQuery(raw: string): Understood {
  const original = raw.trim();
  const tokens = original.split(/\s+/).map(stripPunct).filter(Boolean);
  if (tokens.length === 0) return { original, anchor: original, changed: false, reason: 'unchanged' };

  // Egennamns-span: startar på ett kapitaliserat icke-stoppord, sträcker sig över följande
  // icke-stoppord (valfri skiftläge) tills ett stoppord/slut. "Kalmar slott", "Gustav Vasa" hålls ihop.
  const spans: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (isStop(tokens[i]) || !isCapitalized(tokens[i])) continue;
    const start = i;
    let j = i + 1;
    while (j < tokens.length && !isStop(tokens[j])) j++;
    spans.push(tokens.slice(start, j).join(' '));
    i = j;
  }
  if (spans.length > 0) {
    // Längsta spannet (flest ord) = starkaste ankaret; oavgjort → första.
    const anchor = spans.reduce((a, b) => (b.split(' ').length > a.split(' ').length ? b : a));
    return { original, anchor, changed: anchor !== original, reason: 'proper-noun' };
  }

  // Inget egennamn: lämna frågan ORÖRD. Att strippa till innehållsord hjälper aldrig enords-domänord
  // (hacksilver/mjölk är redan oförändrade) men AND-överbestämmer fleordsfrågor utan entitet (→ dead-end,
  // regression D39 i benchmark). Domänord + tvärspråkiga begrepp löses av ordliste-/embeddinglagret, ej här.
  return { original, anchor: original, changed: false, reason: 'unchanged' };
}
