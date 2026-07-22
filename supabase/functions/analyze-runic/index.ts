// analyze-runic v2 — graf-RAG (P5, docs/kunskapsgraf-arkitektur.md).
// Två lägen:
//  * { signum }: funktionen hämtar SJÄLV kontext ur kunskapsgrafen server-side
//    (inskrift + kanter via get_entity_v1 + Gräslund-stilar med TPQ/TAQ + socken/härad
//    + läsningar/tolkningar) och bygger en källhänvisad prompt. Grafens konfidens
//    (contested/possible) skickas med och modellen instrueras att hedga därefter.
//  * { transliteration, ... }: fritextläget som förut.
// Ingen mock-fallback: kan svaret inte parsas returneras fel — plattformen
// hittar aldrig på analyser ("Verify"-principen).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Restrict CORS to known origins instead of '*'. Add deployment origins here.
const ALLOWED_ORIGINS = [
  'https://vikingage.se',
  'https://www.vikingage.se',
  'http://localhost:5176',
  'http://localhost:8080',
];

const buildCorsHeaders = (origin: string | null) => {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
};

// Best-effort in-memory rate limiter to protect the OpenRouter quota.
const RATE_LIMIT = 10;          // max requests
const RATE_WINDOW_MS = 60_000;  // per minute, per client IP
const requestLog = new Map<string, number[]>();

const isRateLimited = (clientId: string): boolean => {
  const now = Date.now();
  const recent = (requestLog.get(clientId) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  requestLog.set(clientId, recent);
  return recent.length > RATE_LIMIT;
};

interface AnalysisRequest {
  transliteration?: string;
  location?: string;
  objectType?: string;
  signum?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientId =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';
  if (isRateLimited(clientId)) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const input: AnalysisRequest = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY environment variable not set');
      return new Response(JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let prompt: string;
    let contextUsed = false;

    if (input.signum && input.signum.trim()) {
      const ctx = await fetchGraphContext(input.signum.trim());
      if (!ctx) {
        return new Response(JSON.stringify({ error: `Inskriften ${input.signum} hittades inte` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      prompt = buildGraphPrompt(ctx);
      contextUsed = true;
    } else if (input.transliteration && input.transliteration.trim()) {
      prompt = buildFreetextPrompt(input);
    } else {
      return new Response(JSON.stringify({ error: 'signum eller transliteration krävs' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vikingage.se',
        'X-Title': 'Viking Age Runological Research Platform',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content;
    if (!text) {
      console.error('Invalid response from OpenRouter API:', JSON.stringify(result));
      return new Response(JSON.stringify({ error: 'Invalid response from analysis service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // INGEN mock-fallback: hellre ärligt fel än påhittad analys.
      console.error('Unparseable AI response:', text.slice(0, 400));
      return new Response(JSON.stringify({ error: 'Analysen kunde inte tolkas — försök igen' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return new Response(JSON.stringify({ error: 'Analysen kunde inte tolkas — försök igen' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(
      JSON.stringify({
        ...parsed,
        contextUsed,
        location: input.location ?? (parsed.location as string | undefined) ?? 'Okänd',
        objectType: input.objectType ?? (parsed.objectType as string | undefined) ?? 'Okänt objekt',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in analyze-runic function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

// ---------- Graf-kontext (server-side; läser endast publika, RLS-läsbara data) ----------

interface GraphContext {
  insc: Record<string, unknown>;
  entity: Record<string, unknown> | null;
  styles: { code: string; start: number | null; end: number | null; certainty: boolean | null }[];
  parish: { name: string; hundred: string | null; country: string | null } | null;
  readings: string[];
  interpretations: string[];
}

async function fetchGraphContext(signum: string): Promise<GraphContext | null> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Två parametriserade .eq()-frågor i stället för en interpolerad .or()-sträng
  // (PostgREST-filterinjektion undviks — signum kommer från användarinput).
  const cols = 'id, signum, primary_signum, name, transliteration, normalization, translation_sv, dating_text, period_start, period_end, meter, style_group, object_category, material, rune_type, location, socken, harad, landscape, country, scholarly_notes, parish_id';
  let { data: insc } = await supabase
    .from('runic_inscriptions').select(cols)
    .eq('signum', signum).limit(1).maybeSingle();
  if (!insc) {
    ({ data: insc } = await supabase
      .from('runic_inscriptions').select(cols)
      .eq('primary_signum', signum).limit(1).maybeSingle());
  }
  if (!insc) return null;

  const [entityRes, stylesRes, readingsRes, interpRes] = await Promise.all([
    supabase.rpc('get_entity_v1', { p_id: insc.id }),
    supabase.from('inscription_style')
      .select('style_code, certainty, vocabulary!inner(period_start, period_end)')
      .eq('inscription_id', insc.id),
    supabase.from('readings').select('text, reading_type').eq('inscription_id', insc.id).limit(4),
    supabase.from('interpretations').select('text, version').eq('inscription_id', insc.id).limit(4),
  ]);

  let parish: GraphContext['parish'] = null;
  if (insc.parish_id) {
    const { data: p } = await supabase.from('parishes')
      .select('name, country, hundred_external_id').eq('id', insc.parish_id).maybeSingle();
    if (p) {
      let hundred: string | null = null;
      if (p.hundred_external_id) {
        const { data: h } = await supabase.from('hundreds').select('name')
          .ilike('external_id', p.hundred_external_id).maybeSingle();
        hundred = h?.name ?? null;
      }
      parish = { name: p.name, hundred, country: p.country };
    }
  }

  return {
    insc,
    entity: entityRes.data ?? null,
    // deno-lint-ignore no-explicit-any
    styles: (stylesRes.data ?? []).map((s: any) => ({
      code: s.style_code,
      start: s.vocabulary?.period_start ?? null,
      end: s.vocabulary?.period_end ?? null,
      certainty: s.certainty,
    })),
    parish,
    // deno-lint-ignore no-explicit-any
    readings: (readingsRes.data ?? []).map((r: any) => `[${r.reading_type}] ${r.text}`).filter(Boolean),
    // deno-lint-ignore no-explicit-any
    interpretations: (interpRes.data ?? []).map((r: any) => `[${r.version}] ${r.text}`).filter(Boolean),
  };
}

function fmtEdges(entity: Record<string, unknown> | null): string {
  if (!entity) return '(inga kanter)';
  const out: string[] = [];
  for (const dir of ['edges_out', 'edges_in'] as const) {
    for (const e of (entity[dir] as Record<string, unknown>[] | undefined) ?? []) {
      const node = (e.target ?? e.source) as Record<string, string> | undefined;
      out.push(`- ${e.label_sv} ${dir === 'edges_in' ? '←' : '→'} ${node?.label ?? '?'} (${node?.type ?? '?'}) [konfidens: ${e.confidence ?? 'okänd'}; källa: ${e.source_ref ?? 'okänd'}]`);
    }
  }
  return out.length ? out.join('\n') : '(inga kanter)';
}

function buildGraphPrompt(ctx: GraphContext): string {
  const i = ctx.insc as Record<string, string | number | null>;
  const styleLines = ctx.styles.map((s) =>
    `- ${s.code}${s.certainty === false ? '?' : ''} (Gräslund: ca ${s.start ?? '?'}–${s.end ?? '?'})`).join('\n');
  return `
Du är expert på runologi och skandinavisk språkhistoria. Analysera runinskriften ${i.signum} för datering och kontext. ALLT nedan är verifierat källmaterial ur forskningsdatabasen — utgå från det, hitta ALDRIG på uppgifter utöver det, och flagga tydligt när grafens konfidens är 'contested' eller 'possible'.

=== KÄLLKONTEXT (ur databasen) ===
SIGNUM: ${i.signum}${i.name ? ` ("${i.name}")` : ''}
TRANSLITTERATION: ${i.transliteration ?? '(saknas)'}
NORMALISERING: ${i.normalization ?? '(saknas)'}
ÖVERSÄTTNING (sv): ${i.translation_sv ?? '(saknas)'}
PLATS: ${[i.location, ctx.parish?.name, ctx.parish?.hundred, i.landscape, ctx.parish?.country ?? i.country].filter(Boolean).join(', ')}
OBJEKT/MATERIAL/RUNTYP: ${[i.object_category, i.material, i.rune_type].filter(Boolean).join(' · ') || '(okänt)'}
BEFINTLIG DATERING I DATABASEN: ${i.dating_text ?? '(saknas)'} (period_start=${i.period_start ?? '?'}, period_end=${i.period_end ?? '?'})
${i.meter ? `VERSMÅTT: ${i.meter}` : ''}
ORNAMENTIK (stilattributioner med Gräslunds dateringsintervall):
${styleLines || '(inga stilattributioner)'}
ALTERNATIVA LÄSNINGAR (rundata-versioner):
${ctx.readings.join('\n') || '(inga)'}
TOLKNINGAR:
${ctx.interpretations.join('\n') || '(inga)'}
KUNSKAPSGRAFENS KANTER (relationer med proveniens och konfidens):
${fmtEdges(ctx.entity)}
${i.scholarly_notes ? `FORSKNINGSNOTER: ${i.scholarly_notes}` : ''}
=== SLUT KÄLLKONTEXT ===

Analysera: 1) språkliga drag, 2) runtyp, 3) formulärtyp, 4) hur stilintervallen och grafens relationer (ristare, kungar, källor) stärker eller utmanar databasens datering. Väg samman till en dateringsbedömning. Ange vilka kontextfält du stödjer dig på.

Svara i exakt detta JSON-format (inga andra ord, bara JSON):
{
  "period": "Period med årtal",
  "confidence": 0.0-1.0,
  "yearRange": {"start": år, "end": år},
  "reasoning": "Detaljerad förklaring på svenska med hänvisning till källkontexten",
  "linguisticFeatures": ["språkdrag1", "språkdrag2"],
  "runType": "Runtyp och variant",
  "contextCited": ["vilka kontextfält som användes"],
  "caveats": ["osäkerheter, contested-relationer, motsägelser"]
}
Var konservativ vid osäkerhet.`;
}

function buildFreetextPrompt(input: AnalysisRequest): string {
  return `
Du är en expert på runologi och skandinavisk språkhistoria. Analysera denna runinskription för datering:

INSKRIPTION: "${input.transliteration}"
${input.location ? `PLATS: ${input.location}` : ''}
${input.objectType ? `OBJEKTTYP: ${input.objectType}` : ''}

Analysera följande aspekter:
1. Språkliga drag (morfologi, fonologi, lexikon)
2. Runtyp (äldre/yngre futhark, varianter)
3. Formulärtyp och konventioner
4. Historisk kontext

Ge svar i exakt detta JSON-format (inga andra ord, bara JSON):
{
  "period": "Period med årtal",
  "confidence": 0.0-1.0,
  "yearRange": {"start": år, "end": år},
  "reasoning": "Detaljerad förklaring på svenska",
  "linguisticFeatures": ["språkdrag1", "språkdrag2"],
  "runType": "Runtyp och variant"
}

Basera analysen på etablerad runologisk forskning. Var konservativ med dateringar om osäkerhet finns.`;
}
