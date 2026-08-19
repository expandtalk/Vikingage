// EN retrieval-väg för hela sök-ytan. Både träfflistan (search-hybrid) och AI-svaret (search-answer)
// kallar denna — så de rangordnar identiskt och det finns bara ETT ställe att förbättra rankningen.
// Steg: embedda frågan (gte-small, edge-only) → search_v2 (lexikalt search_v1 + semantiskt, RRF).
// Självläkande: embedding cold-start ELLER search_v2-fel → lexikal fallback search_v1, så sök aldrig
// dead-endar. Skillnaden mellan lista och svar är EFTER retrieval (svaret graf-expanderar + LLM).

// deno-lint-ignore no-explicit-any
type SB = any;
// deno-lint-ignore no-explicit-any
type Session = any;

export interface RetrieveOpts { limit?: number; types?: string[] | null }
export interface RetrieveResult {
  // deno-lint-ignore no-explicit-any
  hits: any[];
  mode: 'hybrid' | 'lexical';
}

const errMsg = (e: unknown) =>
  (e as { message?: string })?.message ?? (typeof e === 'string' ? e : JSON.stringify(e));

export async function retrieve(
  supabase: SB, session: Session, query: string, opts: RetrieveOpts = {},
): Promise<RetrieveResult> {
  const limit = Math.min(Number(opts.limit) || 30, 120);
  const types = opts.types ?? null;

  // 1) Semantisk hybrid: embedda + search_v2.
  let emb: number[] | null = null;
  try {
    const r = await session.run(query.slice(0, 500), { mean_pool: true, normalize: true });
    emb = Array.from(r as ArrayLike<number>);
  } catch (e) {
    console.error('retrieve: embedding failed, lexical fallback:', errMsg(e));
  }
  if (emb) {
    const { data, error } = await supabase.rpc('search_v2', {
      p_q: query, p_embedding: JSON.stringify(emb), p_limit: limit, p_types: types,
    });
    // Använd hybrid bara om den gav träffar (annars lexikal — t.ex. "fornvännen" där semantiken missar).
    if (!error && Array.isArray(data) && data.length > 0) return { hits: data, mode: 'hybrid' };
    if (error) console.error('retrieve: search_v2 failed, lexical fallback:', errMsg(error));
  }

  // 2) Lexikal fallback (search_v1) — oberoende av AI-runtimen.
  const { data, error } = await supabase.rpc('search_v1', { p_q: query, p_limit: limit, p_types: types });
  if (error) throw error;
  return { hits: data ?? [], mode: 'lexical' };
}
