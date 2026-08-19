import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { retrieve } from "../_shared/retrieve.ts";

// search-hybrid — träfflistan. Delar EN retrieval-väg med AI-svaret via _shared/retrieve.ts
// (embed gte-small → search_v2, självläkande lexikal fallback). Publik läs-sök (anon-nyckel,
// RLS = public read på search_document). Total fallering → {hits:[]} 200 så klientens egen
// fallback ändå kan gå in. Session skapas lazy så ett AI-runtime-importfel inte dödar funktionen.

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

    // EN delad retrieval-väg (embed → search_v2 → lexikal fallback), samma som AI-svaret.
    const { hits, mode } = await retrieve(supabase, getSession(), query, { limit, types });
    return json({ hits, mode });
  } catch (e) {
    // Returnera 200 + tom lista (ej 500) så klientens egen fallback ändå kan gå in.
    console.error('search-hybrid error:', errMsg(e));
    return json({ hits: [], error: errMsg(e) }, 200);
  }
});
