import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, CornerDownLeft } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { sanitizeFilterValue } from '@/utils/searchFilter';

// Global sök i toppnavet. Söker via search_inscriptions_flexible (RPC) som matchar
// nya + gamla signum, ort/socken/härad/landskap, namn, runtext/översättning och
// forskarkommentarer. Öppnas med knappen eller Ctrl/Cmd+K. Val -> /explore?searchQuery=.
interface Hit {
  id: string;
  signum: string;
  location: string | null;
  socken: string | null;
  harad: string | null;
  landscape: string | null;
  province: string | null;
  municipality: string | null;
  parish: string | null;
  name: string | null;
  alternative_signum: string[] | null;
  scholarly_notes: string | null;
  historical_context: string | null;
  paleographic_notes: string | null;
  normalization: string | null;
  translation_sv: string | null;
  translation_en: string | null;
  transliteration: string | null;
}

// Visar VARFÖR en träff matchade (gör "smartheten" synlig) + ev. textutdrag.
const matchReason = (h: Hit, qRaw: string, sv: boolean): { label: string; snippet?: string } => {
  const q = qRaw.trim().toLowerCase();
  const has = (v?: string | null) => !!v && v.toLowerCase().includes(q);
  const snip = (v: string) => {
    const i = v.toLowerCase().indexOf(q);
    const start = Math.max(0, i - 30);
    return (start > 0 ? '…' : '') + v.slice(start, i + q.length + 40).trim() + '…';
  };
  const alt = (h.alternative_signum || []).find((a) => a && a.toLowerCase().includes(q));
  if (alt && alt.toLowerCase() !== h.signum?.toLowerCase()) return { label: sv ? `gammalt signum: ${alt}` : `old signum: ${alt}` };
  if (has(h.signum)) return { label: 'signum' };
  if (has(h.socken)) return { label: sv ? 'socken' : 'parish' };
  if (has(h.harad)) return { label: sv ? 'härad' : 'hundred' };
  if (has(h.location) || has(h.municipality) || has(h.parish) || has(h.landscape) || has(h.province))
    return { label: sv ? 'plats' : 'place' };
  if (has(h.name)) return { label: sv ? 'namn' : 'name' };
  if (has(h.scholarly_notes)) return { label: sv ? 'forskarkommentar' : 'scholarly note', snippet: snip(h.scholarly_notes!) };
  if (has(h.historical_context)) return { label: sv ? 'historik' : 'context', snippet: snip(h.historical_context!) };
  if (has(h.paleographic_notes)) return { label: sv ? 'paleografi' : 'palaeography', snippet: snip(h.paleographic_notes!) };
  if (has(h.transliteration)) return { label: sv ? 'runtext' : 'transliteration', snippet: snip(h.transliteration!) };
  if (has(h.normalization)) return { label: sv ? 'normalisering' : 'normalization', snippet: snip(h.normalization!) };
  if (has(h.translation_sv)) return { label: sv ? 'översättning' : 'translation', snippet: snip(h.translation_sv!) };
  if (has(h.translation_en)) return { label: sv ? 'översättning' : 'translation', snippet: snip(h.translation_en!) };
  return { label: '' };
};

const placeOf = (h: Hit) =>
  h.location || h.socken || h.parish || h.landscape || h.province || '';

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+K öppnar/stänger.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setHits([]); setActive(0); }
  }, [open]);

  // Debouncad server-sök.
  useEffect(() => {
    if (query.trim().length < 2) { setHits([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const safe = sanitizeFilterValue(query);
        if (!safe) { setHits([]); return; }
        const { data, error } = await supabase
          .rpc('search_inscriptions_flexible', { p_search_term: safe })
          .limit(12);
        if (error) throw error;
        setHits((data ?? []).slice(0, 12) as Hit[]);
        setActive(0);
      } catch (e) {
        console.error('GlobalSearch error:', e);
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const goToExplore = useCallback((term: string) => {
    if (!term.trim()) return;
    setOpen(false);
    navigate(`/explore?searchQuery=${encodeURIComponent(term.trim())}`);
  }, [navigate]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (hits[active]) goToExplore(hits[active].signum);
      else goToExplore(query);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={sv ? 'Sök' : 'Search'}
        className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-400 hover:border-amber-500/50 hover:text-slate-200 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline">{sv ? 'Sök runstenar…' : 'Search runestones…'}</span>
        <kbd className="hidden lg:inline ml-1 rounded border border-slate-600 bg-slate-900 px-1.5 text-[10px] text-slate-500">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 overflow-hidden bg-slate-900 border-slate-700 max-w-2xl top-[15%] translate-y-0">
          <div className="flex items-center gap-3 border-b border-slate-700 px-4">
            <Search className="h-5 w-5 text-amber-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKey}
              placeholder={sv
                ? 'Signum (nytt/gammalt), ort, socken, härad, namn, runtext, forskarkommentar…'
                : 'Signum (new/old), place, parish, hundred, name, text, scholarly note…'}
              className="w-full bg-transparent py-4 text-white placeholder-slate-500 outline-none text-sm"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-amber-400 shrink-0" />}
          </div>

          <div className="max-h-[55vh] overflow-y-auto">
            {query.trim().length >= 2 && !loading && hits.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                {sv ? 'Inga träffar för' : 'No matches for'} “{query}”
              </div>
            )}
            {hits.map((h, i) => {
              const r = matchReason(h, query, sv);
              const place = placeOf(h);
              return (
                <button
                  key={h.id}
                  onClick={() => goToExplore(h.signum)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left border-b border-slate-800/60 last:border-0 ${
                    i === active ? 'bg-amber-500/10' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                    <span className="text-amber-400 text-xs font-bold">ᚱ</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-100">{h.signum}</span>
                      {place && <span className="text-xs text-slate-400 truncate">· {place}</span>}
                    </div>
                    {r.snippet ? (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{r.snippet}</p>
                    ) : null}
                  </div>
                  {r.label && (
                    <span className="shrink-0 self-center rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-amber-500/90">
                      {r.label}
                    </span>
                  )}
                </button>
              );
            })}

            {query.trim().length >= 2 && hits.length > 0 && (
              <button
                onClick={() => goToExplore(query)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-slate-400 hover:bg-slate-800/50"
              >
                <CornerDownLeft className="h-3.5 w-3.5" />
                {sv ? `Visa alla träffar för “${query}” på kartan` : `Show all matches for “${query}” on the map`}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
