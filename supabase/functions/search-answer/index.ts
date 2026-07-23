// search-answer — grounded, GRAF-FÖRSTÄRKT RAG (steg 2+3). Flöde:
//   1. embedda frågan (gte-small) → hybrid-retrieval (search_v2, lexikalt+semantiskt)
//   2. GRAF-EXPANSION: för de starkaste träffarna, dra in relaterade entiteter via
//      graph_neighborhood (carved_by, mentions_person, has_theme, located_in…) — så
//      kunskapsgrafen deltar i svaret (multi-hop som Google inte kan).
//   3. hydrera bodies → LLM (OpenRouter) komponerar KÄLLFÖRT svar med [n]-citat.
// Svarar ENDAST utifrån hämtade källor; hittar aldrig på (Verify-principen).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://vikingage.se', 'https://www.vikingage.se',
  'http://localhost:5176', 'http://localhost:8080',
];
const buildCors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Vary': 'Origin',
});

const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60000;
const requestLog = new Map<string, number[]>();
const isRateLimited = (id: string): boolean => {
  const now = Date.now();
  const recent = (requestLog.get(id) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  requestLog.set(id, recent);
  return recent.length > RATE_LIMIT;
};

// deno-lint-ignore no-explicit-any
const session = new (globalThis as any).Supabase.ai.Session('gte-small');

interface Item {
  entity_type: string; entity_id: string; signum: string | null;
  label: string; sublabel: string | null; snippet: string | null; via: string | null;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const ch = buildCors(origin);
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...ch, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { headers: ch });

  const clientId = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip') || 'unknown';
  if (isRateLimited(clientId)) return json({ error: 'Rate limit exceeded — vänta en stund.' }, 429);

  try {
    const { q, language = 'sv' } = await req.json().catch(() => ({}));
    const query = String(q ?? '').trim();
    if (query.length < 3) return json({ error: 'Skriv en fråga (minst 3 tecken).' }, 400);

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) return json({ error: 'API configuration error' }, 500);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // 1. Embedda frågan + hybrid-retrieval.
    // deno-lint-ignore no-explicit-any
    const emb: any = await session.run(query.slice(0, 500), { mean_pool: true, normalize: true });
    const { data: hits, error } = await supabase.rpc('search_v2', {
      p_q: query, p_embedding: JSON.stringify(Array.from(emb)), p_limit: 12,
    });
    if (error) throw error;
    // deno-lint-ignore no-explicit-any
    const rows = (hits ?? []) as any[];
    if (!rows.length) {
      return json({ answer: language === 'en' ? 'No sources found for that question.' : 'Inga källor hittades för den frågan.', sources: [] });
    }

    // 2. Graf-expansion: relaterade entiteter för de 4 starkaste träffarna.
    const items: Item[] = rows.map((h) => ({
      entity_type: h.entity_type, entity_id: h.entity_id, signum: h.signum ?? null,
      label: h.label, sublabel: h.sublabel ?? null, snippet: h.snippet ?? null, via: null,
    }));
    const seen = new Set(items.map((i) => `${i.entity_type}:${i.entity_id}`));
    for (const s of rows.slice(0, 4)) {
      try {
        const { data: nb } = await supabase.rpc('graph_neighborhood', { p_id: s.entity_id });
        // deno-lint-ignore no-explicit-any
        for (const e of (nb ?? []) as any[]) {
          const key = `${e.other_type}:${e.other_id}`;
          if (seen.has(key) || items.length >= 18) continue;
          seen.add(key);
          items.push({
            entity_type: e.other_type, entity_id: e.other_id, signum: null,
            label: e.other_label, sublabel: null, snippet: null, via: `${e.predicate} → ${s.label}`,
          });
        }
      } catch { /* grafen är best-effort — misslyckas den faller vi tillbaka på hybrid-träffarna */ }
    }

    // 3. Hydrera bodies för alla (frö-träffar + graf-grannar).
    const { data: docsData } = await supabase.from('search_document')
      .select('entity_type,entity_id,body_sv,body_en,body_simple')
      .in('entity_id', items.map((h) => h.entity_id));
    // deno-lint-ignore no-explicit-any
    const docs = (docsData ?? []) as any[];
    const bodyOf = (h: Item): string => {
      const d = docs.find((x) => x.entity_id === h.entity_id && x.entity_type === h.entity_type);
      const text = d ? [d.body_sv, d.body_en, d.body_simple].filter(Boolean).join(' ') : (h.snippet ?? '');
      return (text ?? '').slice(0, 600);
    };

    const sources = items.map((h, i) => ({
      n: i + 1, entity_type: h.entity_type, entity_id: h.entity_id, signum: h.signum, label: h.label, sublabel: h.sublabel, via: h.via,
    }));
    const ctx = items.map((h, i) =>
      `[${i + 1}] (${h.entity_type}) ${h.label}${h.sublabel ? ` — ${h.sublabel}` : ''}${h.via ? ` [relaterad: ${h.via}]` : ''}\n${bodyOf(h)}`).join('\n\n');

    // 4. LLM-syntes — källförd, inga påståenden utöver källorna.
    const lang = language === 'en' ? 'engelska' : 'svenska';
    const sys = `Du är en källkritisk historiker vid en runologisk forskningsplattform. Svara ENDAST utifrån KÄLLORNA nedan. Citera varje påstående med [n] som pekar på källans nummer. Källor märkta [relaterad: ...] är hämtade via kunskapsgrafen — använd dem för att koppla samman entiteter (ristare, kungar, teman, platser). Hitta ALDRIG på fakta utöver källorna. Räcker inte källorna — säg det rakt ut. Redovisa osäkerhet. Svara på ${lang}, koncist (max ~150 ord), i löpande text med [n]-citat.`;
    const prompt = `FRÅGA: ${query}\n\n=== KÄLLOR ===\n${ctx}\n=== SLUT KÄLLOR ===\n\nSkriv ett källfört svar med [n]-citat.`;

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vikingage.se',
        'X-Title': 'Viking Age Search',
      },
      body: JSON.stringify({
        // Modell: env SEARCH_ANSWER_MODEL, annars Kimi K3 (stark; ~samma pris som Sonnet).
        model: Deno.env.get('SEARCH_ANSWER_MODEL') || 'moonshotai/kimi-k3',
        messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }],
        temperature: 0.1, max_tokens: 900,
      }),
    });
    if (!resp.ok) { console.error('OpenRouter', resp.status, await resp.text()); return json({ error: 'AI-tjänsten tillfälligt otillgänglig' }, 503); }
    const result = await resp.json();
    const answer = result.choices?.[0]?.message?.content;
    if (!answer) return json({ error: 'Svaret kunde inte tolkas — försök igen' }, 502);

    return json({ answer, sources });
  } catch (e) {
    console.error('search-answer error:', e);
    return json({ error: String(e) }, 500);
  }
});
