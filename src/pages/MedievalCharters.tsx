import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PageMeta } from '@/components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCharterBrowse } from '@/hooks/useMedievalCharters';
import { CenturyStats } from '@/components/medeltidsbrev/CenturyStats';
import { CharterAttribution } from '@/components/medeltidsbrev/CharterAttribution';
import { FormulaBadge } from '@/components/medeltidsbrev/FormulaBadge';
import { CharterSignaLegend } from '@/components/medeltidsbrev/CharterSignaLegend';
import { CharterFacetPanel, FACET_GROUPS } from '@/components/medeltidsbrev/CharterFacetPanel';
import type { CharterSort, CharterDir } from '@/hooks/medievalChartersArgs';
import type { FacetFilter } from '@/hooks/medievalCharterFacetArgs';

const PAGE_SIZE = 30;

const MedievalCharters: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const q0 = params.get('q') ?? '';
  const [qInput, setQInput] = useState(q0);
  const [q, setQ] = useState(q0);
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 300);
    return () => clearTimeout(t);
  }, [qInput]);

  const sort = (params.get('sort') as CharterSort) ?? 'sdhk';
  const dir = (params.get('dir') as CharterDir) ?? 'asc';
  const centuryRaw = params.get('century');
  const century = centuryRaw && Number.isFinite(Number(centuryRaw)) ? Number(centuryRaw) : null;
  const hasFulltext = params.get('ft') === '1' ? true : null;
  const page = Math.max(1, Number.isFinite(Number(params.get('page'))) ? Number(params.get('page')) : 1);

  // Facet filter state lives in the URL query so links are shareable, same
  // convention as q/century/ft above — one query param per facet group
  // (comma-separated values), plus yearFrom/yearTo for the year range.
  const facets = useMemo(() => {
    const f: Record<string, string[]> = {};
    for (const g of FACET_GROUPS) {
      const raw = params.get(g.key);
      if (!raw) continue;
      const vals = raw.split(',').map((s) => s.trim()).filter(Boolean);
      if (vals.length) f[g.key] = vals;
    }
    return f;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);
  const yearFromRaw = params.get('yearFrom');
  const yearToRaw = params.get('yearTo');
  const yearFrom = yearFromRaw && Number.isFinite(Number(yearFromRaw)) ? Number(yearFromRaw) : null;
  const yearTo = yearToRaw && Number.isFinite(Number(yearToRaw)) ? Number(yearToRaw) : null;
  const facetFilter: FacetFilter = { facets, yearFrom, yearTo };

  const patch = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) { if (v == null) p.delete(k); else p.set(k, v); }
    if (!('page' in next)) p.set('page', '1');   // any filter change resets to page 1
    setParams(p, { replace: true });
  };

  const handleFacetFilterChange = (next: FacetFilter) => {
    const patchObj: Record<string, string | null> = {};
    for (const g of FACET_GROUPS) {
      const vals = next.facets[g.key] ?? [];
      patchObj[g.key] = vals.length ? vals.join(',') : null;
    }
    patchObj.yearFrom = next.yearFrom != null ? String(next.yearFrom) : null;
    patchObj.yearTo = next.yearTo != null ? String(next.yearTo) : null;
    patch(patchObj);
  };
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; } // don't clobber page on load
    patch({ q: q || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const { data: rows = [], isLoading } = useCharterBrowse({
    q, sort, dir, century, hasFulltext, page, pageSize: PAGE_SIZE,
    facets, yearFrom, yearTo,
  });
  const total = rows[0]?.total_count ?? 0;
  const lastPage = Math.max(1, Math.ceil(Number(total) / PAGE_SIZE));

  const toggleSort = (col: CharterSort) =>
    patch({ sort: col, dir: sort === col && dir === 'asc' ? 'desc' : 'asc' });

  const label = sv
    ? { title: 'Medeltidsbrev', sdhk: 'SDHK-nr', date: 'Datum', place: 'Ort',
        lang: 'Språk', regest: 'Regest', ft: 'Fulltext', ftOnly: 'Endast med fulltext',
        search: 'Sök i regest, ort, utfärdare…', none: 'Inga träffar', of: 'av', prev: 'Föregående', next: 'Nästa' }
    : { title: 'Medieval charters', sdhk: 'SDHK no.', date: 'Date', place: 'Place',
        lang: 'Language', regest: 'Abstract', ft: 'Full text', ftOnly: 'Only with full text',
        search: 'Search abstract, place, issuer…', none: 'No matches', of: 'of', prev: 'Previous', next: 'Next' };

  const base = sv ? '/sv/medeltidsbrev' : '/en/medieval-charters';
  const arrow = (col: CharterSort) => (sort === col ? (dir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Medeltidsbrev — de svenska medeltidsbreven (SDHK)"
        titleEn="Medieval charters — the Swedish medieval letters (SDHK)"
        description="Bläddra i 44 264 svenska medeltidsbrev till och med 1540 ur SDHK — datum, ort, regest och fulltext där den finns."
        descriptionEn="Browse 44,264 Swedish medieval charters up to 1540 from SDHK — date, place, abstract and full text where available."
      />
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">{label.title}</h1>

        <CenturyStats selected={century} onSelect={(c) => patch({ century: c == null ? null : String(c) })} />

        <div className="flex flex-col gap-4 lg:flex-row">
          <aside className="w-full flex-shrink-0 lg:w-64">
            <CharterFacetPanel value={facetFilter} onChange={handleFacetFilterChange} q={q} />
          </aside>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder={label.search}
                aria-label={label.search}
                className="flex-1 min-w-[220px] rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-[hsl(var(--gold))]"
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={hasFulltext === true}
                  onChange={(e) => patch({ ft: e.target.checked ? '1' : null })} />
                {label.ftOnly}
              </label>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-sm text-slate-200">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="cursor-pointer px-3 py-2 text-left" onClick={() => toggleSort('sdhk')}>{label.sdhk}{arrow('sdhk')}</th>
                    <th className="cursor-pointer px-3 py-2 text-left" onClick={() => toggleSort('year')}>{label.date}{arrow('year')}</th>
                    <th className="cursor-pointer px-3 py-2 text-left" onClick={() => toggleSort('place')}>{label.place}{arrow('place')}</th>
                    <th className="px-3 py-2 text-left">{label.lang}</th>
                    <th className="px-3 py-2 text-left">{label.regest}</th>
                    <th className="px-3 py-2 text-left">{label.ft}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.sdhk_id}
                        tabIndex={0}
                        role="link"
                        className="cursor-pointer border-t border-slate-800 hover:bg-slate-800/50"
                        onClick={() => navigate(`${base}/${r.sdhk_id}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`${base}/${r.sdhk_id}`); } }}>
                      <td className="whitespace-nowrap px-3 py-2 text-[hsl(var(--gold))]">{r.sdhk_id}</td>
                      <td className="whitespace-nowrap px-3 py-2" title={r.date_raw ?? undefined}>
                        <span>{r.date_display ?? '—'}</span>
                        {r.is_formula && <FormulaBadge className="ml-2" />}
                      </td>
                      <td className="px-3 py-2">{r.place_raw || '—'}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-400">{r.lang_raw || '—'}</td>
                      <td className="px-3 py-2"><span className="line-clamp-2 text-slate-300">{r.regest ?? '—'}</span></td>
                      <td className="px-3 py-2">{r.has_fulltext ? '✓' : <span className="text-slate-600">–</span>}</td>
                    </tr>
                  ))}
                  {!isLoading && rows.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">{label.none}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-400">
              <span aria-live="polite">
                {Number(total).toLocaleString(sv ? 'sv-SE' : 'en')} {sv ? 'brev' : 'charters'} · {sv ? 'sida' : 'page'} {page} {label.of} {lastPage}
              </span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => patch({ page: String(page - 1) })}
                  className="rounded border border-slate-600 px-3 py-1 disabled:opacity-40">{label.prev}</button>
                <button disabled={page >= lastPage} onClick={() => patch({ page: String(page + 1) })}
                  className="rounded border border-slate-600 px-3 py-1 disabled:opacity-40">{label.next}</button>
              </div>
            </div>

            <CharterSignaLegend />
            <CharterAttribution />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedievalCharters;
