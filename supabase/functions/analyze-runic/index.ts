
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
// NOTE: edge-function instances are ephemeral and not shared, so this only
// throttles bursts hitting the same warm instance. For durable, cross-instance
// limits use Deno KV or a Supabase table keyed by IP/user.
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
  transliteration: string;
  location?: string;
  objectType?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Throttle per client IP (best-effort; see note above).
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
    const { transliteration, location, objectType }: AnalysisRequest = await req.json();

    if (!transliteration || transliteration.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Transliteration is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY environment variable not set');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildRunicAnalysisPrompt({ transliteration, location, objectType });

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
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content;

    if (!text) {
      console.error('Invalid response from OpenRouter API:', JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: 'Invalid response from analysis service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysis = parseAIResponse(text, { transliteration, location, objectType });

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-runic function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildRunicAnalysisPrompt(input: AnalysisRequest): string {
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

Basera analysen på etablerad runologisk forskning. Var konservativ med dateringar om osäkerhet finns.
`;
}

function parseAIResponse(text: string, input: AnalysisRequest) {
  // A research tool must never fabricate a dating. If the model does not
  // return parseable JSON, surface it as an error rather than inventing a
  // plausible-looking mock result. The outer handler turns a throw into a
  // 5xx response so the client shows a real failure.
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response did not contain a valid JSON object');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    ...parsed,
    location: input.location || parsed.location || 'Okänd',
    objectType: input.objectType || parsed.objectType || 'Okänt objekt',
  };
}
