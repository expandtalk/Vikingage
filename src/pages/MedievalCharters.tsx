import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PageMeta } from '@/components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCharterBrowse } from '@/hooks/useMedievalCharters';
import { CenturyStats } from '@/components/medeltidsbrev/CenturyStats';
import { CharterAttribution } from '@/components/medeltidsbrev/CharterAttribution';
import type { CharterSort, CharterDir } from '@/hooks/medievalChartersArgs';

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
  const century = params.get('century') ? Number(params.get('century')) : null;
  const hasFulltext = params.get('ft') === '1' ? true : null;
  const page = Math.max(1, Number(params.get('page') ?? 1));

  const patch = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) { if (v == null) p.delete(k); else p.set(k, v); }
    if (!('page' in next)) p.set('page', '1');   // any filter change resets to page 1
    setParams(p, { replace: true });
  };
  useEffect(() => { patch({ q: q || null }); /* eslint-disable-next-line */ }, [q]);

  const { data: rows = [], isLoading } = useCharterBrowse({
    q, sort, dir, century, hasFulltext, page, pageSize: PAGE_SIZE,
  });
  const total = rows[0]?.total_count ?? 0;
  const lastPage = Math.max(1, Math.ceil(Number(total) / PAGE_SIZE));

  const toggleSort = (col: CharterSort) =>
    patch({ sort: col, dir: sort === col && dir === 'asc' ? 'desc' : 'asc' });

  const label = sv
    ? { title: 'Medeltidsbrev', sdhk: 'SDHK-nr', year: 'År', date: 'Datum', place: 'Ort',
        lang: 'Språk', regest: 'Regest', ft: 'Fulltext', ftOnly: 'Endast med fulltext',
        search: 'Sök i regest, ort, utfärdare…', none: 'Inga träffar', of: 'av', prev: 'Föregående', next: 'Nästa' }
    : { title: 'Medieval charters', sdhk: 'SDHK no.', year: 'Year', date: 'Date', place: 'Place',
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
                <th className="cursor-pointer px-3 py-2 text-left" onClick={() => toggleSort('year')}>{label.year}{arrow('year')}</th>
                <th className="px-3 py-2 text-left">{label.date}</th>
                <th className="cursor-pointer px-3 py-2 text-left" onClick={() => toggleSort('place')}>{label.place}{arrow('place')}</th>
                <th className="px-3 py-2 text-left">{label.lang}</th>
                <th className="px-3 py-2 text-left">{label.regest}</th>
                <th className="px-3 py-2 text-left">{label.ft}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sdhk_id}
                    className="cursor-pointer border-t border-slate-800 hover:bg-slate-800/50"
                    onClick={() => navigate(`${base}/${r.sdhk_id}`)}>
                  <td className="whitespace-nowrap px-3 py-2 text-[hsl(var(--gold))]">{r.sdhk_id}</td>
                  <td className="whitespace-nowrap px-3 py-2">{r.year ?? '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-400">{r.date_raw ?? '—'}</td>
                  <td className="px-3 py-2">{r.place_raw || '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-400">{r.lang_raw || '—'}</td>
                  <td className="px-3 py-2"><span className="line-clamp-2 text-slate-300">{r.regest}</span></td>
                  <td className="px-3 py-2">{r.has_fulltext ? '✓' : <span className="text-slate-600">–</span>}</td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">{label.none}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{Number(total).toLocaleString(sv ? 'sv-SE' : 'en')} {sv ? 'brev' : 'charters'} · {sv ? 'sida' : 'page'} {page} {label.of} {lastPage}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => patch({ page: String(page - 1) })}
              className="rounded border border-slate-600 px-3 py-1 disabled:opacity-40">{label.prev}</button>
            <button disabled={page >= lastPage} onClick={() => patch({ page: String(page + 1) })}
              className="rounded border border-slate-600 px-3 py-1 disabled:opacity-40">{label.next}</button>
          </div>
        </div>

        <CharterAttribution />
      </div>
    </div>
  );
};

export default MedievalCharters;
