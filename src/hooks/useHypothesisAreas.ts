import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ProbeShape } from '@/hooks/useProximityProbe';

// Sparade hypotes-områden för inloggade användare (DB, RLS = egna rader). Ersätter/kompletterar
// den lokala "Mina punkter" med kontobunden persistens: namn + hypotes-text + form + radie.
export interface HypothesisArea {
  id: string;
  name: string;
  note: string | null;
  lat: number;
  lng: number;
  shape: ProbeShape;
  radius_km: number;
  created_at: string;
}
export interface HypothesisAreaInput {
  name: string; note?: string; lat: number; lng: number; shape: ProbeShape; radius_km: number;
}

const sb = supabase as unknown as { from: (t: string) => any };

export const useHypothesisAreas = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['hypothesis-areas', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await sb.from('hypothesis_areas')
        .select('id,name,note,lat,lng,shape,radius_km,created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as HypothesisArea[];
    },
  });

  const save = useMutation({
    mutationFn: async (input: HypothesisAreaInput) => {
      // user_id sätts av DB-default auth.uid() + RLS-check; skicka ej med det.
      const { error } = await sb.from('hypothesis_areas').insert(input);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hypothesis-areas', user?.id] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from('hypothesis_areas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hypothesis-areas', user?.id] }),
  });

  return { areas: list.data ?? [], isLoading: list.isLoading, save, remove, isLoggedIn: !!user };
};
