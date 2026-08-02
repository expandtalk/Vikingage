import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Forskare & källor: research_scholars ↔ sources (sources.scholar_id → research_scholars.id).
// scholar_id är en nytillagd kolumn på `sources` som ännu inte finns i den genererade
// types.ts — därför (supabase as any) för just den frågan (samma mönster som
// src/hooks/map/useMapSolidi.ts). research_scholars är redan typad, hämtas normalt.

export interface ScholarWork {
  sourceid: string;
  title: string | null;
  publication_year: number | null;
  publisher: string | null;
  url: string | null;
  source_type: string | null;
}

export interface Scholar {
  id: string;
  name: string;
  affiliation: string | null;
  role_title: string | null;
  active_period: string | null;
  life_status: string | null;
  biography: string | null;
  external_ref: string | null;
  works: ScholarWork[];
  workCount: number;
}

export const useResearchers = () => {
  const { data: scholars = [], isLoading: scholarsLoading, error: scholarsError } = useQuery({
    queryKey: ['research-scholars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_scholars')
        .select('id,name,affiliation,role_title,active_period,life_status,biography,external_ref')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });

  // ~544 rader totalt — hämtas i en enda fråga och grupperas klientsidan per scholar_id,
  // istället för 222 separata anrop.
  const { data: works = [], isLoading: worksLoading, error: worksError } = useQuery({
    queryKey: ['research-scholar-works'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('sources')
        .select('sourceid,title,publication_year,publisher,url,source_type,scholar_id')
        .not('scholar_id', 'is', null);
      if (error) throw error;
      return (data ?? []) as (ScholarWork & { scholar_id: string })[];
    },
  });

  const worksByScholar = new Map<string, ScholarWork[]>();
  for (const w of works) {
    const list = worksByScholar.get(w.scholar_id) ?? [];
    list.push({
      sourceid: w.sourceid,
      title: w.title,
      publication_year: w.publication_year,
      publisher: w.publisher,
      url: w.url,
      source_type: w.source_type,
    });
    worksByScholar.set(w.scholar_id, list);
  }

  const researchers: Scholar[] = scholars.map((s) => {
    const scholarWorks = (worksByScholar.get(s.id) ?? [])
      .slice()
      .sort((a, b) => (b.publication_year ?? 0) - (a.publication_year ?? 0));
    return {
      ...s,
      works: scholarWorks,
      workCount: scholarWorks.length,
    };
  });

  return {
    researchers,
    isLoading: scholarsLoading || worksLoading,
    error: scholarsError || worksError,
  };
};
