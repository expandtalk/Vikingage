export type CharterSort = 'sdhk' | 'year' | 'place';
export type CharterDir = 'asc' | 'desc';

export interface CharterBrowseParams {
  q?: string;
  sort?: CharterSort;
  dir?: CharterDir;
  century?: number | null;
  hasFulltext?: boolean | null;
  page?: number;
  page_size?: number;
}

export interface CharterBrowseArgs {
  q: string | null;
  sort: CharterSort;
  dir: CharterDir;
  century: number | null;
  has_fulltext: boolean | null;
  page: number;
  page_size: number;
}

const SORTS: CharterSort[] = ['sdhk', 'year', 'place'];

export function buildCharterBrowseArgs(p: CharterBrowseParams): CharterBrowseArgs {
  const q = (p.q ?? '').trim();
  const size = p.page_size ?? 30;
  return {
    q: q === '' ? null : q,
    sort: SORTS.includes(p.sort as CharterSort) ? (p.sort as CharterSort) : 'sdhk',
    dir: p.dir === 'desc' ? 'desc' : 'asc',
    century: typeof p.century === 'number' ? p.century : null,
    has_fulltext: typeof p.hasFulltext === 'boolean' ? p.hasFulltext : null,
    page: Math.max(1, Math.floor(p.page ?? 1)),
    page_size: Math.min(100, Math.max(1, Math.floor(size || 30))),
  };
}
