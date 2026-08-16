import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// search-hybrid — embeddar SÖKFRÅGAN med gte-small (bara tillgängligt i edge-
// runtime) och kör search_v2: lexikalt (search_v1) + semantiskt
// (match_search_docs), RRF-fuserat. Publik läs-sök (anon-nyckel, RLS = public
// read på search_document).
//
// SJÄLVLÄKANDE: om embeddingen fallerar (gte-small cold-start/otillgänglig) ELLER
// search_v2 fel, faller edge:n själv tillbaka till lexikal search_v1 — så sök
// ALDRIG dead-endar (tidigare: cold-start → 500 → tom lista). Total fallering
// returnerar {hits:[]} med HTTP 200 så klientens egen fallback ändå kan gå in.
// Session skapas lazy så ett import-fel i AI-runtimen inte dödar hela funktionen.

// deno-lint-ignore no-explicit-any
let _session: any = null;
// deno-lint-ignore no-explicit-any
const getSession = () => {
  if (!_session) _session = new (globalThis as any).Supabase.ai.Session('gte-small');
  return _session;
};
const errMsg = (e: unknown) =>
  (e as { message?: string })?.message ?? (typeof e === 'string' ? e : JSON.stringify(e));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    // Acceptera både q (kanonisk) och query (defensivt) som fråge-parameter.
    const query = String(body.q ?? body.query ?? '').trim();
    const limit = Math.min(Number(body.limit) || 30, 120);
    const types = body.types ?? null;
    if (query.length < 2) return json({ hits: [] });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);

    // 1) Försök semantisk hybrid: embedda frågan, kör search_v2.
    let emb: number[] | null = null;
    try {
      // deno-lint-ignore no-explicit-any
      const r: any = await getSession().run(query.slice(0, 500), { mean_pool: true, normalize: true });
      emb = Array.from(r);
    } catch (e) {
      console.error('search-hybrid: embedding failed, lexical fallback:', errMsg(e));
    }

    if (emb) {
      const { data, error } = await supabase.rpc('search_v2', {
        p_q: query,
        p_embedding: JSON.stringify(emb),
        p_limit: limit,
        p_types: types,
      });
      // Använd hybrid bara om den faktiskt gav träffar. Tomt (t.ex. "fornvännen"
      // där lexikala tsv-träffar finns men semantiken missar) → falla till lexikal
      // så edge:n aldrig blir sämre än search_v1.
      if (!error && Array.isArray(data) && data.length > 0) return json({ hits: data, mode: 'hybrid' });
      if (error) console.error('search-hybrid: search_v2 failed, lexical fallback:', errMsg(error));
    }

    // 2) Lexikal fallback (search_v1) — gör edge:n oberoende av AI-runtimen.
    const { data, error } = await supabase.rpc('search_v1', { p_q: query, p_limit: limit, p_types: types });
    if (error) throw error;
    return json({ hits: data ?? [], mode: 'lexical' });
  } catch (e) {
    // Returnera 200 + tom lista (ej 500) så klientens egen fallback ändå kan gå in.
    console.error('search-hybrid error:', errMsg(e));
    return json({ hits: [], error: errMsg(e) }, 200);
  }
});
