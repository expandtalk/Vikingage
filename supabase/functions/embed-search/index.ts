// embed-search — backfyller search_document.embedding med Supabases inbyggda
// gte-small (384 dim, gratis, ingen extern nyckel). Anropas i batchar tills
// remaining=0 (scripts/backfill-embeddings.sh). Skriver embedding_model för
// spårbarhet (modellbyte => omkörning). OBS: batch >10 kan slå i edge-funktionens
// resursgräns (WORKER_RESOURCE_LIMIT) — loopen backar då till 5.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = 'Supabase/gte-small';
// deno-lint-ignore no-explicit-any
const session = new (globalThis as any).Supabase.ai.Session('gte-small');

serve(async (req) => {
  try {
    const { batch = 50 } = await req.json().catch(() => ({}));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

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

    return new Response(JSON.stringify({ processed, remaining: count ?? 0 }),
      { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('embed-search error:', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500,
      headers: { 'Content-Type': 'application/json' } });
  }
});
