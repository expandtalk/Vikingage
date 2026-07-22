// embed-search — backfyller search_document.embedding med Supabases inbyggda
// gte-small (384 dim, gratis, ingen extern nyckel). Anropas i batchar tills
// remaining=0 (scripts/backfill-embeddings.sh). Skriver embedding_model för
// spårbarhet (modellbyte => omkörning). OBS: batch >10 kan slå i edge-funktionens
// resursgräns (WORKER_RESOURCE_LIMIT) — loopen backar då till 5.
//
// AUKTORISERING: privilegierad (service-role, tung compute). Endast service-role
// eller en inloggad admin får anropa — ALDRIG den publika anon-nyckeln.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = 'Supabase/gte-small';
// deno-lint-ignore no-explicit-any
const session = new (globalThis as any).Supabase.ai.Session('gte-small');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);

    // Gate: service-role-nyckel (ops-backfill) ELLER inloggad admin. Anon nekas.
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
    let authorized = token.length > 0 && token === serviceKey;
    if (!authorized && token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles').select('role').eq('user_id', user.id);
        authorized = (roles ?? []).some((r) => r.role === 'admin');
      }
    }
    if (!authorized) return json({ error: 'Unauthorized' }, 401);

    const { batch = 50 } = await req.json().catch(() => ({}));

    const { data: docs, error } = await supabase
      .from('search_document')
      .select('entity_type, entity_id, label, sublabel, body_sv, body_en, body_simple')
      .is('embedding', null)
      .limit(Math.min(batch, 100));
    if (error) throw error;

    let processed = 0;
    for (const d of docs ?? []) {
      const text = [d.label, d.sublabel, d.body_sv, d.body_en, d.body_simple]
        .filter(Boolean).join(' ').slice(0, 1500);
      // deno-lint-ignore no-explicit-any
      const emb: any = await session.run(text, { mean_pool: true, normalize: true });
      const { error: upErr } = await supabase.from('search_document')
        .update({ embedding: JSON.stringify(Array.from(emb)), embedding_model: MODEL })
        .eq('entity_type', d.entity_type).eq('entity_id', d.entity_id);
      if (upErr) throw upErr;
      processed++;
    }

    const { count } = await supabase.from('search_document')
      .select('entity_id', { count: 'exact', head: true }).is('embedding', null);

    return json({ processed, remaining: count ?? 0 });
  } catch (e) {
    console.error('embed-search error:', e);
    return json({ error: String(e) }, 500);
  }
});
