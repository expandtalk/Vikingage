import { describe, it, expect } from 'vitest';
import { buildFacetBrowseArgs } from './medievalCharterFacetArgs';

describe('buildFacetBrowseArgs', () => {
  it('tom facets → null, camelCase→snake_case', () => {
    expect(buildFacetBrowseArgs({ facets: {}, yearFrom: 1350 }))
      .toEqual({ p_facets: null, p_year_from: 1350, p_year_to: null });
  });
  it('facets med värden serialiseras', () => {
    expect(buildFacetBrowseArgs({ facets: { aktor: ['kung'], aktyp: ['skatt'] } }))
      .toEqual({ p_facets: { aktor: ['kung'], aktyp: ['skatt'] }, p_year_from: null, p_year_to: null });
  });
  it('tom värdelista på en facett droppas', () => {
    expect(buildFacetBrowseArgs({ facets: { aktor: ['kung'], geo: [] } }).p_facets)
      .toEqual({ aktor: ['kung'] });
  });
});
