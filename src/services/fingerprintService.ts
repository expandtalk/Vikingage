import { supabase } from '@/integrations/supabase/client';

// Forensisk "fingerprint" ur en fritext-beskrivning (+ valfri bild). Anropar
// samma edge-funktion som runanalysen (analyze-runic) i fingerprint-läge.
// INGEN mock-fallback: fel bubblas upp (en påhittad datering är värre än ett fel).
export interface FingerprintResult {
  summary: string;
  dating?: { period?: string; yearRange?: { start?: number; end?: number }; basis?: string };
  confidence?: number;
  typology?: string;
  features?: string[];
  interpretation?: string;
  caveats?: string[];
}

export const fingerprintObject = async (opts: {
  kind: 'runestone' | 'fornborg';
  description: string;
  imageBase64?: string;
}): Promise<FingerprintResult> => {
  if (!opts.description?.trim()) throw new Error('Beskrivning krävs');
  const { data, error } = await supabase.functions.invoke('analyze-runic', {
    body: {
      kind: opts.kind,
      description: opts.description.slice(0, 2000),
      imageBase64: opts.imageBase64,
    },
  });
  if (error) throw new Error(`Analystjänst-fel: ${error.message}`);
  if (!data) throw new Error('Inget svar från analystjänsten');
  if (typeof data === 'object' && data !== null && 'error' in data) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return data as FingerprintResult;
};

// Läs en vald bildfil → data-URL (base64) för multimodal-anropet.
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Kunde inte läsa bilden'));
    reader.readAsDataURL(file);
  });
