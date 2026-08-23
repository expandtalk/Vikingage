import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArrowUp, ArrowDown, ArrowUpDown, Search, ChevronRight, Pencil, Info } from 'lucide-react';

// Riksdag-CV som sajtsida (Daniel). Sorterbara kolumner för alla; inline-redigering ENDAST för admin
// (forskningsdata-integritet, RLS-gatad). Härledda fält (studietid/yrkesår) redovisas med täckning —
// aldrig som exakt statistik. Data i public.riksdag_cv (350 poster).

interface Row {
  id: string;
  efternamn: string; tilltalsnamn: string | null; parti: string | null; valkrets: string | null;
  fodd_ar: number | null; examen: string | null; studietid_ar: number | null; studietid_not: string | null;
  yrkesar_ex_politik: number | null; yrkesar_totalt: number | null; yrkesar_not: string | null;
  utbildning_raw: string | null; anstallningar_raw: string | null;
}

type ColKey = keyof Row | 'namn' | 'alder';
interface Col { key: ColKey; sv: string; en: string; kind: 'text' | 'num'; editable: boolean; align?: 'right'; }

const NOW = 2026;
const COLS: Col[] = [
  { key: 'namn', sv: 'Namn', en: 'Name', kind: 'text', editable: false },
  { key: 'parti', sv: 'Parti', en: 'Party', kind: 'text', editable: true },
  { key: 'valkrets', sv: 'Valkrets', en: 'Constituency', kind: 'text', editable: true },
  { key: 'fodd_ar', sv: 'Född', en: 'Born', kind: 'num', editable: true, align: 'right' },
  { key: 'alder', sv: 'Ålder', en: 'Age', kind: 'num', editable: false, align: 'right' },
  { key: 'studietid_ar', sv: 'Studietid (år)', en: 'Study yrs', kind: 'num', editable: true, align: 'right' },
  { key: 'yrkesar_ex_politik', sv: 'Yrkesår u. politik', en: 'Work yrs (non-pol.)', kind: 'num', editable: true, align: 'right' },
  { key: 'yrkesar_totalt', sv: 'Yrkesår totalt', en: 'Work yrs total', kind: 'num', editable: true, align: 'right' },
];
// Långtext-fält som visas i den expanderbara detaljraden (admin kan redigera).
const DETAIL: { key: keyof Row; sv: string; en: string }[] = [
  { key: 'examen', sv: 'Examen', en: 'Degree' },
  { key: 'utbildning_raw', sv: 'Utbildning (CV-text)', en: 'Education (CV text)' },
  { key: 'anstallningar_raw', sv: 'Anställningar (CV-text)', en: 'Employment (CV text)' },
  { key: 'studietid_not', sv: 'Not: studietid', en: 'Note: study time' },
  { key: 'yrkesar_not', sv: 'Not: yrkesår', en: 'Note: work years' },
];

const cellValue = (r: Row, k: ColKey): string | number | null => {
  if (k === 'namn') return [r.tilltalsnamn, r.efternamn].filter(Boolean).join(' ');
  if (k === 'alder') return r.fodd_ar ? NOW - r.fodd_ar : null;
  return r[k as keyof Row] as string | number | null;
};

const RiksdagCv = ({ forceLang }: { forceLang?: 'sv' | 'en' }) => {
  const { language } = useLanguage();
  const sv = (forceLang ?? language) === 'sv';
  const { isAdmin } = useIsAdmin();
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['riksdag-cv'],
    queryFn: async (): Promise<Row[]> => {
      const { data } = await (supabase as unknown as { from: (t: string) => any })
        .from('riksdag_cv').select('*').order('efternamn').limit(1000);
      return (data ?? []) as Row[];
    },
  });

  const [sortKey, setSortKey] = useState<ColKey>('namn');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ id: string; col: keyof Row } | null>(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSort = (k: ColKey) => {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  };

  const view = useMemo(() => {
    const f = filter.trim().toLowerCase();
    let out = rows;
    if (f) out = rows.filter((r) =>
      [r.efternamn, r.tilltalsnamn, r.parti, r.valkrets].filter(Boolean).some((v) => String(v).toLowerCase().includes(f)));
    const col = COLS.find((c) => c.key === sortKey);
    const num = col?.kind === 'num';
    out = [...out].sort((a, b) => {
      const va = cellValue(a, sortKey), vb = cellValue(b, sortKey);
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // nulls sist
      if (vb == null) return -1;
      const cmp = num ? (Number(va) - Number(vb)) : String(va).localeCompare(String(vb), 'sv');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [rows, filter, sortKey, sortDir]);

  const startEdit = (id: string, col: keyof Row, cur: string | number | null) => {
    if (!isAdmin) return;
    setEdit({ id, col }); setEditVal(cur == null ? '' : String(cur));
  };
  const commitEdit = async () => {
    if (!edit) return;
    setSaving(true);
    const col = COLS.find((c) => c.key === edit.col);
    const isNum = col?.kind === 'num' || ['fodd_ar', 'studietid_ar', 'yrkesar_ex_politik', 'yrkesar_totalt'].includes(edit.col);
    let val: string | number | null = editVal.trim() === '' ? null : editVal.trim();
    if (isNum && val != null) { const n = parseFloat(String(val).replace(',', '.')); val = isNaN(n) ? null : n; }
    try {
      await (supabase as unknown as { from: (t: string) => any }).from('riksdag_cv')
        .update({ [edit.col]: val, updated_at: new Date().toISOString() }).eq('id', edit.id);
      await qc.invalidateQueries({ queryKey: ['riksdag-cv'] });
    } finally { setSaving(false); setEdit(null); }
  };

  const withData = rows.length;
  const nAge = rows.filter((r) => r.fodd_ar != null).length;
  const nWork = rows.filter((r) => r.yrkesar_ex_politik != null).length;
  const nStudy = rows.filter((r) => r.studietid_ar != null).length;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={sv ? 'Riksdagens meritprofil — ledamöternas CV:n' : 'Riksdag CV profile'}
        description={sv ? 'Sorterbar tabell över riksdagsledamöters CV-data: parti, ålder, yrkesår utanför politiken och studietid. Härledda fält redovisas med täckning.' : 'Sortable table of Swedish MP CV data.'}
      />
      <Header />
      <Breadcrumbs />
      <main className="mx-auto max-w-6xl px-4 py-8 text-left">
        <h1 className="text-3xl font-bold text-white">{sv ? 'Riksdagens meritprofil' : 'Riksdag CV profile'}</h1>
        <p className="mt-2 max-w-3xl text-slate-300">
          {sv ? `CV-data för ${withData} ledamotsposter — sortera på valfri kolumn.` : `CV data for ${withData} MP records — sort by any column.`}
          {isAdmin && <span className="ml-1 text-amber-300">{sv ? 'Som admin kan du redigera cellerna (sparas direkt).' : 'As admin you can edit cells (saved live).'}</span>}
        </p>

        {/* Källkritik: täckning för härledda fält */}
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-slate-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>
            {sv ? 'Ålder är komplett (' : 'Age is complete ('}<b className="text-slate-100">{nAge}/{withData}</b>{'). '}
            {sv ? 'Yrkesår utanför politiken (' : 'Work years outside politics ('}<b className="text-slate-100">{nWork}/{withData}</b>{sv ? ') och studietid (' : ') and study time ('}<b className="text-slate-100">{nStudy}/{withData}</b>
            {sv ? ') är HÄRLEDDA ur fritext-CV:n — läs som storleksordningar, inte exakt statistik. Tomma celler saknar uppgift.' : ') are DERIVED from free-text CVs — read as orders of magnitude, not exact statistics.'}
          </p>
        </div>

        {/* Filter */}
        <div className="mt-4 flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={filter} onChange={(e) => setFilter(e.target.value)}
              placeholder={sv ? 'Filtrera namn, parti, valkrets…' : 'Filter name, party, constituency…'}
              className="w-72 max-w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-8 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none" />
          </div>
          <span className="text-xs text-slate-500">{view.length} {sv ? 'rader' : 'rows'}</span>
        </div>

        {/* Tabell */}
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/80">
                <th className="w-6" />
                {COLS.map((c) => {
                  const active = c.key === sortKey;
                  return (
                    <th key={String(c.key)} onClick={() => toggleSort(c.key)}
                      className={`cursor-pointer select-none whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide ${c.align === 'right' ? 'text-right' : 'text-left'} ${active ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}>
                      <span className={`inline-flex items-center gap-1 ${c.align === 'right' ? 'flex-row-reverse' : ''}`}>
                        {sv ? c.sv : c.en}
                        {active ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={COLS.length + 1} className="px-3 py-6 text-center text-slate-400">{sv ? 'Laddar…' : 'Loading…'}</td></tr>}
              {view.map((r) => {
                const isOpen = expanded === r.id;
                return (
                  <React.Fragment key={r.id}>
                    <tr className="border-t border-slate-800 hover:bg-slate-900/40">
                      <td className="px-1 text-center">
                        <button onClick={() => setExpanded(isOpen ? null : r.id)} aria-label={sv ? 'Visa detaljer' : 'Show details'}
                          className="text-slate-500 hover:text-amber-300">
                          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                        </button>
                      </td>
                      {COLS.map((c) => {
                        const val = cellValue(r, c.key);
                        const editing = edit && edit.id === r.id && edit.col === c.key;
                        const canEdit = isAdmin && c.editable && c.key !== 'namn' && c.key !== 'alder';
                        return (
                          <td key={String(c.key)} className={`px-3 py-2 ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.key === 'namn' ? 'font-medium text-slate-100' : 'text-slate-300'}`}>
                            {editing ? (
                              <input autoFocus value={editVal} disabled={saving}
                                onChange={(e) => setEditVal(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEdit(null); }}
                                className={`w-full rounded border border-amber-500/60 bg-slate-800 px-1.5 py-0.5 text-slate-100 focus:outline-none ${c.align === 'right' ? 'text-right' : ''}`} />
                            ) : (
                              <span onClick={() => canEdit && startEdit(r.id, c.key as keyof Row, val)}
                                className={canEdit ? 'group inline-flex items-center gap-1 cursor-text rounded px-1 -mx-1 hover:bg-amber-500/10' : ''}>
                                {val == null || val === '' ? <span className="text-slate-600">—</span> : String(val)}
                                {canEdit && <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60" />}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-slate-800 bg-slate-900/60">
                        <td />
                        <td colSpan={COLS.length} className="px-3 py-3">
                          <dl className="grid gap-3 sm:grid-cols-2">
                            {DETAIL.map((d) => {
                              const dv = r[d.key] as string | null;
                              const editing = edit && edit.id === r.id && edit.col === d.key;
                              const canEdit = isAdmin;
                              return (
                                <div key={String(d.key)} className="min-w-0">
                                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-amber-300/70">{sv ? d.sv : d.en}</dt>
                                  <dd className="mt-0.5 text-sm text-slate-300">
                                    {editing ? (
                                      <textarea autoFocus value={editVal} disabled={saving} rows={3}
                                        onChange={(e) => setEditVal(e.target.value)} onBlur={commitEdit}
                                        onKeyDown={(e) => { if (e.key === 'Escape') setEdit(null); }}
                                        className="w-full rounded border border-amber-500/60 bg-slate-800 px-2 py-1 text-slate-100 focus:outline-none" />
                                    ) : (
                                      <span onClick={() => canEdit && startEdit(r.id, d.key, dv)}
                                        className={canEdit ? 'cursor-text rounded hover:bg-amber-500/10' : ''}>
                                        {dv ? dv : <span className="text-slate-600">—</span>}
                                      </span>
                                    )}
                                  </dd>
                                </div>
                              );
                            })}
                          </dl>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-3xl text-xs text-slate-500">
          {sv ? 'Källa: ledamöternas egna CV-uppgifter, sammanställda maskinellt (Agentflow). Ögonblicksbild av datasetet, inte officiell riksdagsstatistik. Härledda fält bär osäkerhet. Inga uppgifter har fyllts i med antaganden.'
              : 'Source: MPs’ own CV data, compiled automatically. A dataset snapshot, not official statistics. Derived fields carry uncertainty.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default RiksdagCv;
