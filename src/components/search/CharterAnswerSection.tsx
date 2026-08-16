import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ScrollText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Medeltidsbrev (SDHK) i söksvaret, EFTER podden. Lazy paginering: 15 brev åt gången — sidor
// bortom den första laddas först när man klickar "Visa fler". Vänsterställda poster. Länk vidare
// till biblioteket (/sv/medeltidsbrev). Namn-upplöst via charters_for_name. Källa: SDHK CC BY 4.0.

interface Row { town_label: string; total: number; sdhk_id: number; year: number | null; date_raw: string | null; summary: string | null; }
const rpc = (fn: string, args: Record<string, unknown>) => (supabase as any).rpc(fn, args);
const PAGE = 15;

export const CharterAnswerSection: React.FC<{ name?: string | null; sv?: boolean }> = ({ name, sv: svProp }) => {
  const langSv = useLanguage().language === 'sv';
  const sv = svProp ?? langSv;
  const q = (name ?? '').trim();

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async (offset: number) => {
    setLoading(true);
    const { data, error } = await rpc('charters_for_name', { p_name: q, p_limit: PAGE, p_offset: offset });
    setLoading(false);
    if (error) return;
    const page = (data ?? []) as Row[];
    if (page.length) { setTotal(page[0].total); setLabel(page[0].town_label); }
    setRows((prev) => (offset === 0 ? page : [...prev, ...page]));
  }, [q]);

  useEffect(() => {
    setRows([]); setTotal(0); setLabel('');
    if (q.length >= 2) fetchPage(0);
  }, [q, fetchPage]);

  if (!rows.length) return null;

  const base = sv ? '/sv/medeltidsbrev' : '/en/medieval-charters';
  const years = rows.map((d) => d.year).filter((y): y is number => y != null);
  const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : null;
  const hasMore = rows.length < total;

  return (
    <section className="border-t border-slate-800 px-5 py-4 text-left">
      <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-amber-300">
        <ScrollText className="h-4 w-4" />
        {sv ? `Medeltidsbrev utfärdade i ${label}` : `Medieval charters issued at ${label}`}
      </h2>
      <p className="mb-2 text-[11px] text-slate-500">
        {sv
          ? `${total} brev i Svenskt Diplomatariums huvudkartotek (SDHK)${span ? `, ${span}` : ''} · länkade på utfärdandeort`
          : `${total} charters in the Swedish Diplomatarium (SDHK)${span ? `, ${span}` : ''} · linked by place of issue`}
      </p>

      <ul className="divide-y divide-slate-800/60 rounded-md border border-slate-800 bg-slate-800/30 text-left">
        {rows.map((c) => (
          <li key={c.sdhk_id}>
            <Link to={`${base}/${c.sdhk_id}`} className="group flex items-baseline gap-3 px-3 py-1.5 text-left">
              <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-amber-300/80">{c.year ?? '—'}</span>
              <span className="line-clamp-2 text-xs text-slate-200 group-hover:text-amber-100">
                {c.summary || (sv ? '(regest saknas)' : '(no abstract)')}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {hasMore && (
          <button type="button" disabled={loading} onClick={() => fetchPage(rows.length)}
            className="text-xs text-amber-300 hover:underline disabled:opacity-50">
            {loading ? (sv ? 'Laddar…' : 'Loading…') : (sv ? `Visa fler (${rows.length}/${total})` : `Show more (${rows.length}/${total})`)}
          </button>
        )}
        <Link to={base} className="text-xs text-gold hover:underline">
          {sv ? 'Bläddra alla brev i biblioteket →' : 'Browse all charters in the library →'}
        </Link>
      </div>

      <p className="mt-2 text-[10px] text-slate-500/70">
        {sv ? 'Källa: SDHK, Riksarkivet · CC BY 4.0 · maskinell ortlänkning (utländska/hanseatiska brev exkluderade i svenska orter)' : 'Source: SDHK, National Archives · CC BY 4.0'}
      </p>
    </section>
  );
};

export default CharterAnswerSection;
