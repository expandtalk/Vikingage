import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlaceNameAttestation {
  id: string;
  place_name_id: string | null;
  place_label: string;
  year: number;
  attested_form: string;
  source: string;
  note: string | null;
}

// Historiska belägg (form + år) per ort, kronologiskt.
export const usePlaceNameAttestations = () =>
  useQuery({
    queryKey: ['place-name-attestations'],
    queryFn: async (): Promise<PlaceNameAttestation[]> => {
      const { data, error } = await (supabase as any)
        .from('place_name_attestations')
        .select('id,place_name_id,place_label,year,attested_form,source,note')
        .order('place_label', { ascending: true })
        .order('year', { ascending: true });
      if (error) throw error;
      return (data ?? []) as PlaceNameAttestation[];
    },
    staleTime: 10 * 60 * 1000,
  });

// Klassar en belägg-form: val / vad / å-form / övrig (för färgläggning).
export const attestationFormType = (form: string): 'val' | 'vad' | 'aa' | 'other' => {
  const norm = form.toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]/g, '');
  if (/wad|vad|wat|vat/.test(norm)) return 'vad';
  if (/å/.test(form)) return 'aa';
  if (/^(vala|wala|vual|val|wal)/.test(norm)) return 'val';
  return 'other';
};
