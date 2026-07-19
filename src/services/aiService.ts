import { supabase } from '@/integrations/supabase/client';
import { AnalysisInput, RunicAnalysis } from '../types/runic';

export const analyzeRunicInscription = async (input: AnalysisInput): Promise<RunicAnalysis> => {
  // Validate input
  if (!input.transliteration || input.transliteration.trim().length === 0) {
    throw new Error('Transliteration is required');
  }

  // Sanitize input to prevent injection attacks
  const sanitizedInput = {
    transliteration: input.transliteration.substring(0, 1000), // Limit length
    location: input.location?.substring(0, 200),
    objectType: input.objectType?.substring(0, 100),
  };

  const { data, error } = await supabase.functions.invoke('analyze-runic', {
    body: sanitizedInput,
  });

  // NOTE: This is a research tool — we deliberately do NOT fall back to a mock
  // analysis on failure. A fabricated dating that looks authoritative is worse
  // than a clear error, so we surface failures to the caller (which shows an
  // error state to the user).
  if (error) {
    throw new Error(`Analysis service error: ${error.message}`);
  }

  if (!data) {
    throw new Error('No response from analysis service');
  }

  // The edge function returns { error: "..." } with a non-2xx status on failure;
  // guard in case the body still carries an error payload.
  if (typeof data === 'object' && data !== null && 'error' in data) {
    throw new Error(String((data as { error: unknown }).error));
  }

  return data as RunicAnalysis;
};

/**
 * Graf-RAG-analys (P5): edge-funktionen hämtar SJÄLV allt källmaterial ur
 * kunskapsgrafen (inskrift, kanter med proveniens/konfidens, Gräslund-stilar
 * med dateringsintervall, socken/härad, läsningar/tolkningar) och returnerar
 * en källhänvisad analys med contextCited[] och caveats[].
 */
export const analyzeInscriptionBySignum = async (signum: string): Promise<RunicAnalysis & { contextCited?: string[]; caveats?: string[]; contextUsed?: boolean }> => {
  if (!signum || !signum.trim()) throw new Error('Signum krävs');

  const { data, error } = await supabase.functions.invoke('analyze-runic', {
    body: { signum: signum.trim().substring(0, 40) },
  });

  if (error) throw new Error(`Analysis service error: ${error.message}`);
  if (!data) throw new Error('No response from analysis service');
  if (typeof data === 'object' && data !== null && 'error' in data) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return data as RunicAnalysis & { contextCited?: string[]; caveats?: string[]; contextUsed?: boolean };
};
