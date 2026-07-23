import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// search-hybrid — embeddar SÖKFRÅGAN med gte-small (bara tillgängligt i edge-
// runtime) och kör search_v2: lexikalt (search_v1) + semantiskt
// (match_search_docs), RRF-fuserat. Publik läs-sök (anon-nyckel, RLS = public
// read på search_document). Ingen egen fallback här — klienten (GlobalSearch)
// faller tillbaka till search_v1 om denna fallerar, så sök aldrig går sönder.
// deno-lint-ignore no-explicit-any
const session = new (globalThis as any).Supabase.ai.Session('gte-small');

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
    const { q, limit = 30, types = null } = await req.json().catch(() => ({}));
    const query = String(q ?? '').trim();
    if (query.length < 2) return json({ hits: [] });

    // deno-lint-ignore no-explicit-any
    const emb: any = await session.run(query.slice(0, 500), { mean_pool: true, normalize: true });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data, error } = await supabase.rpc('search_v2', {
      p_q: query,
      p_embedding: JSON.stringify(Array.from(emb)),
      p_limit: Math.min(Number(limit) || 30, 120),
      p_types: types,
    });
    if (error) throw error;
    return json({ hits: data ?? [] });
  } catch (e) {
    console.error('search-hybrid error:', e);
    return json({ error: String(e) }, 500);
  }
});
