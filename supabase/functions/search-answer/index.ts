// search-answer — grounded, GRAF-FÖRSTÄRKT RAG (steg 2+3). Flöde:
//   1. embedda frågan (gte-small) → hybrid-retrieval (search_v2, lexikalt+semantiskt)
//   2. GRAF-EXPANSION: för de starkaste träffarna, dra in relaterade entiteter via
//      graph_neighborhood (carved_by, mentions_person, has_theme, located_in…) — så
//      kunskapsgrafen deltar i svaret (multi-hop som Google inte kan).
//   3. hydrera bodies → LLM (OpenRouter) komponerar KÄLLFÖRT svar med [n]-citat.
// Svarar ENDAST utifrån hämtade källor; hittar aldrig på (Verify-principen).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { retrieve } from "../_shared/retrieve.ts";

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
    const { q, language = 'sv', model: modelOverride } = await req.json().catch(() => ({}));
    const query = String(q ?? '').trim();
    if (query.length < 3) return json({ error: 'Skriv en fråga (minst 3 tecken).' }, 400);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // 0. CACHE: normalisera frågan; finns svaret cachat returnera direkt (noll tokens, ingen
    //    embed/sök/graf/LLM). Delad cache mellan alla besökare → vanliga frågor blir gratis+snabba.
    const qnorm = query.toLowerCase().replace(/\s+/g, ' ').replace(/[?.!]+$/, '').trim();
    // Hoppa cachen vid modelOverride (A/B-test ska alltid köra den valda modellen färskt).
    if (!modelOverride) try {
      const { data: cached } = await supabase.from('qa_cache')
        .select('answer,sources,model').eq('question_norm', qnorm).eq('language', language).maybeSingle();
      if (cached?.answer) return json({ answer: cached.answer, sources: cached.sources ?? [], model: cached.model, cached: true });
    } catch { /* cache best-effort — miss faller igenom till generering */ }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) return json({ error: 'API configuration error' }, 500);

    // 1. Retrieval — SAMMA väg som träfflistan (search-hybrid), via _shared/retrieve.ts:
    //    embed → search_v2 → lexikal fallback. Fröet till svaret är alltså prefix av listan.
    const { hits: rows } = await retrieve(supabase, session, query, { limit: 12 });
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

    // Primär modell: SEARCH_ANSWER_MODEL (default Kimi K3). Fallback: SEARCH_ANSWER_MODEL2 (t.ex.
    // qwen/qwen3.8-max) används om den primära fallerar/timeoutar — robusthet utan att byta helt.
    // modelOverride (body.model) = enkel A/B-test: tvinga en specifik modell för denna fråga, ingen
    // fallback (så du ser exakt den modellens svar). Annars primär + MODEL2-fallback.
    const PRIMARY = modelOverride || Deno.env.get('SEARCH_ANSWER_MODEL') || 'moonshotai/kimi-k3';
    const FALLBACK = modelOverride ? '' : (Deno.env.get('SEARCH_ANSWER_MODEL2') || '');
    const callModel = async (model: string): Promise<string | null> => {
      try {
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://vikingage.se',
            'X-Title': 'Viking Age Search',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }],
            temperature: 0.1, max_tokens: 900,
          }),
        });
        if (!r.ok) { console.error('OpenRouter', model, r.status, await r.text()); return null; }
        const j = await r.json();
        return j.choices?.[0]?.message?.content || null;
      } catch (err) { console.error('OpenRouter fetch-fel', model, String(err)); return null; }
    };
    let usedModel = PRIMARY;
    let answer = await callModel(PRIMARY);
    if (!answer && FALLBACK && FALLBACK !== PRIMARY) { usedModel = FALLBACK; answer = await callModel(FALLBACK); }
    if (!answer) return json({ error: 'AI-tjänsten tillfälligt otillgänglig' }, 503);

    // Spara i cachen så framtida identiska frågor blir gratis + direkta (best-effort).
    try {
      await supabase.from('qa_cache').upsert(
        { question_norm: qnorm, language, answer, sources,
          model: usedModel, updated_at: new Date().toISOString() },
        { onConflict: 'question_norm,language' });
    } catch { /* cache-skrivning best-effort */ }

    return json({ answer, sources, model: usedModel });
  } catch (e) {
    console.error('search-answer error:', e);
    return json({ error: String(e) }, 500);
  }
});
