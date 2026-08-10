import { describe, it, expect } from 'vitest';
import { buildCharterBrowseArgs } from './medievalChartersArgs';

describe('buildCharterBrowseArgs', () => {
  it('applies defaults', () => {
    expect(buildCharterBrowseArgs({})).toEqual({
      q: null, sort: 'sdhk', dir: 'asc', century: null,
      has_fulltext: null, page: 1, page_size: 30,
    });
  });
  it('trims q and maps empty to null', () => {
    expect(buildCharterBrowseArgs({ q: '  kloster ' }).q).toBe('kloster');
    expect(buildCharterBrowseArgs({ q: '   ' }).q).toBeNull();
  });
  it('whitelists sort and dir, falling back on bad input', () => {
    expect(buildCharterBrowseArgs({ sort: 'drop' as any }).sort).toBe('sdhk');
    expect(buildCharterBrowseArgs({ dir: 'sideways' as any }).dir).toBe('asc');
    expect(buildCharterBrowseArgs({ sort: 'year', dir: 'desc' }))
      .toMatchObject({ sort: 'year', dir: 'desc' });
  });
  it('clamps page and page_size', () => {
    expect(buildCharterBrowseArgs({ page: 0 }).page).toBe(1);
    expect(buildCharterBrowseArgs({ pageSize: 9999 }).page_size).toBe(100);
    expect(buildCharterBrowseArgs({ pageSize: 0 }).page_size).toBe(30);
  });
  it('passes century and has_fulltext through', () => {
    expect(buildCharterBrowseArgs({ century: 1300, hasFulltext: true }))
      .toMatchObject({ century: 1300, has_fulltext: true });
  });
});
