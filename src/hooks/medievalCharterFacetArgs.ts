export interface FacetFilter {
  facets: Record<string, string[]>;
  yearFrom?: number | null;
  yearTo?: number | null;
}

export interface FacetBrowseArgs {
  p_facets: Record<string, string[]> | null;
  p_year_from: number | null;
  p_year_to: number | null;
}

export interface FacetCount {
  facett: string;
  varde: string;
  n: number;
}

export function buildFacetBrowseArgs(input: FacetFilter): FacetBrowseArgs {
  const cleaned: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(input.facets ?? {})) {
    if (Array.isArray(values) && values.length > 0) {
      cleaned[key] = values;
    }
  }
  const hasFacets = Object.keys(cleaned).length > 0;
  return {
    p_facets: hasFacets ? cleaned : null,
    p_year_from: typeof input.yearFrom === 'number' ? input.yearFrom : null,
    p_year_to: typeof input.yearTo === 'number' ? input.yearTo : null,
  };
}
