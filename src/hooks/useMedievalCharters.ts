import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { buildCharterBrowseArgs, type CharterBrowseParams } from './medievalChartersArgs';
import { buildFacetBrowseArgs, type FacetFilter, type FacetCount } from './medievalCharterFacetArgs';

export type { FacetFilter, FacetCount };

export interface CharterRow {
  sdhk_id: number; year: number | null; date_raw: string | null; date_display: string | null;
  is_formula: boolean; place_raw: string | null; lang_raw: string | null; regest: string | null;
  has_fulltext: boolean; total_count: number;
}
export interface CharterStatRow { century: number | null; n: number; n_fulltext: number; }
export interface CharterDetail {
  sdhk_id: number; date_raw: string | null; date_display: string | null; is_formula: boolean;
  year: number | null; place_raw: string | null;
  lang_raw: string | null; author_raw: string | null; summary: string | null;
  comments: string | null; edition_text: string | null; print_ref: string | null;
  translation_ref: string | null; seals: string | null; original_ref: string | null;
}

const rpc = (fn: string, args: Record<string, unknown>) => (supabase as any).rpc(fn, args);

export function useCharterBrowse(
  params: CharterBrowseParams & { facets?: Record<string, string[]>; yearFrom?: number | null; yearTo?: number | null }
) {
  const args = buildCharterBrowseArgs(params);
  const facetArgs = buildFacetBrowseArgs({
    facets: params.facets ?? {},
    yearFrom: params.yearFrom,
    yearTo: params.yearTo,
  });
  const fullArgs = { ...args, ...facetArgs };
  return useQuery({
    queryKey: ['charter-browse', fullArgs],
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<CharterRow[]> => {
      const { data, error } = await rpc('medieval_charters_browse', fullArgs);
      if (error) throw error;
      return (data ?? []) as CharterRow[];
    },
  });
}

export function useCharterFacetCounts(filter: FacetFilter & { q?: string | null }) {
  const facetArgs = buildFacetBrowseArgs(filter);
  const args = { p_q: filter.q ?? null, ...facetArgs };
  return useQuery({
    queryKey: ['charter-facet-counts', args],
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<FacetCount[]> => {
      const { data, error } = await rpc('charter_facet_counts', args);
      if (error) throw error;
      return (data ?? []) as FacetCount[];
    },
  });
}

export function useCharterStats() {
  return useQuery({
    queryKey: ['charter-stats'],
    staleTime: 1000 * 60 * 30,
    queryFn: async (): Promise<CharterStatRow[]> => {
      const { data, error } = await rpc('medieval_charters_stats', {});
      if (error) throw error;
      return (data ?? []) as CharterStatRow[];
    },
  });
}

export function useCharterDetail(sdhkId: number | null) {
  return useQuery({
    queryKey: ['charter-detail', sdhkId],
    enabled: sdhkId != null && Number.isFinite(sdhkId),
    queryFn: async (): Promise<CharterDetail | null> => {
      const { data, error } = await rpc('medieval_charter_detail', { p_sdhk_id: sdhkId });
      if (error) throw error;
      return ((data ?? [])[0] ?? null) as CharterDetail | null;
    },
  });
}
