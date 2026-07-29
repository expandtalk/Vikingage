import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Heraldik-domänen för forskningssidan /sv/heraldik. Läser motiv, vapen, bärare och attesteringar.
// motif_id/arms_id är riktiga FK → embedda namn; target_id är FK-lös (polymorf) → mappas mot coins i JS.

export interface Motif {
  motif_id: string; name: string; name_en: string | null; category: string;
  heraldic_term: string | null; origin_note: string | null; description: string | null;
}
export interface Arms {
  arms_id: string; name: string; name_en: string | null; blazon: string | null;
  field_division: string | null; marshalling: string | null; is_attributed: boolean;
  earliest_year: number | null; origin_theories: string[] | null; notes: string | null;
}
export interface TownBearer {
  id: string; bearer_name: string | null; period_start: number | null; notes: string | null;
  arms_id: string;
}
export interface Attestation {
  attestation_id: string; motif_id: string | null; arms_id: string | null;
  target: string; target_id: string | null; target_ref: string | null; side: string | null;
  evidence_class: string; start_year: number | null; end_year: number | null; notes: string | null;
  iconographic_motifs: { name: string; name_en: string | null } | null;
  coats_of_arms: { name: string; name_en: string | null } | null;
}

const staleTime = 5 * 60 * 1000;

export const useHeraldryMotifs = () =>
  useQuery({
    queryKey: ['heraldry', 'motifs'],
    queryFn: async (): Promise<Motif[]> => {
      const { data, error } = await supabase
        .from('iconographic_motifs')
        .select('motif_id,name,name_en,category,heraldic_term,origin_note,description')
        .order('name');
      if (error) throw error;
      return (data ?? []) as Motif[];
    },
    staleTime,
  });

export const useHeraldryArms = () =>
  useQuery({
    queryKey: ['heraldry', 'arms'],
    queryFn: async (): Promise<Arms[]> => {
      const { data, error } = await supabase
        .from('coats_of_arms')
        .select('arms_id,name,name_en,blazon,field_division,marshalling,is_attributed,earliest_year,origin_theories,notes')
        .order('earliest_year', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Arms[];
    },
    staleTime,
  });

export const useTownArms = () =>
  useQuery({
    queryKey: ['heraldry', 'town-bearers'],
    queryFn: async (): Promise<TownBearer[]> => {
      const { data, error } = await supabase
        .from('armorial_bearers')
        .select('id,bearer_name,period_start,notes,arms_id')
        .eq('bearer_kind', 'town')
        .order('period_start', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as TownBearer[];
    },
    staleTime,
  });

export interface DynastyArmsRow {
  acquisition: string;
  period_start: number | null;
  arms: {
    arms_id: string; name: string; name_en: string | null; blazon: string | null; marshalling: string | null;
    charges: { tincture: string | null; ordinary: string | null; motif: string | null }[];
  } | null;
}

// Vapen som en dynasti för (armorial_bearers.bearer_id → dynasti), med laddningar. För ätt-/kungasidor.
export const useDynastyArms = (dynastyId?: string) =>
  useQuery({
    queryKey: ['heraldry', 'dynasty-arms', dynastyId],
    enabled: !!dynastyId,
    queryFn: async (): Promise<DynastyArmsRow[]> => {
      const { data, error } = await supabase
        .from('armorial_bearers')
        .select('acquisition,period_start,coats_of_arms(arms_id,name,name_en,blazon,marshalling,coat_charges(tincture,ordinary,iconographic_motifs(name)))')
        .eq('bearer_id', dynastyId!)
        .eq('bearer_kind', 'dynasty');
      if (error) throw error;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return ((data ?? []) as any[]).map((r) => ({
        acquisition: r.acquisition,
        period_start: r.period_start,
        arms: r.coats_of_arms
          ? {
              arms_id: r.coats_of_arms.arms_id, name: r.coats_of_arms.name, name_en: r.coats_of_arms.name_en,
              blazon: r.coats_of_arms.blazon, marshalling: r.coats_of_arms.marshalling,
              charges: (r.coats_of_arms.coat_charges ?? []).map((ch: any) => ({
                tincture: ch.tincture, ordinary: ch.ordinary, motif: ch.iconographic_motifs?.name ?? null,
              })),
            }
          : null,
      }));
      /* eslint-enable @typescript-eslint/no-explicit-any */
    },
    staleTime,
  });

export const useHeraldryAttestations = () =>
  useQuery({
    queryKey: ['heraldry', 'attestations'],
    queryFn: async (): Promise<Attestation[]> => {
      const { data, error } = await supabase
        .from('heraldic_attestations')
        .select('attestation_id,motif_id,arms_id,target,target_id,target_ref,side,evidence_class,start_year,end_year,notes,iconographic_motifs(name,name_en),coats_of_arms(name,name_en)')
        .order('start_year', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data ?? []) as unknown as Attestation[];
    },
    staleTime,
  });
