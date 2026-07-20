import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader2, CornerDownLeft, BookOpen, Hammer, MapPin, Church,
  Castle, Crown, Users2, Coins as CoinsIcon, Users, Sparkles, X, Cross, Skull,
  Compass, Swords, Shield, Heart, Ship, PawPrint, Dog, Network, ScrollText,
  type LucideIcon,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// Federerat global-sök (toppnav, Ctrl/Cmd+K) — P4-arkitekturen:
// EN rankad server-RPC (search_v1: exakt signum + trigram + FTS, viktad RRF)
// ersätter de tidigare 12 parallella ILIKE-frågorna. Resultaten grupperas per
// entitetstyp i relevansordning (gruppordning = bästa träffens rang).
// Tema-läget läser themes-tabellen (DB = sanningskälla, inte hårdkodad config):
// grafkanterna (has_theme, via neighbors_v1) visas först, nyckelordsträffar efter.
const sb = supabase as unknown as {
  from: (t: string) => any;
  rpc: (fn: string, args: Record<string, unknown>) => any;
};

interface Hit {
  entity_type: string;
  entity_id: string;
  signum: string | null;
  label: string;
  sublabel: string | null;
  snippet: string | null;
  score: number;
}
interface Row {
  key: string;
  title: string;
  subtitle?: string;
  signum?: string;
  snippet?: string;
  route: string;
}
interface Group {
  type: string;
  labelSv: string;
  labelEn: string;
  icon: LucideIcon;
  rows: Row[];
}
interface DbTheme {
  id: string;
  slug: string | null;
  name: string;
  name_en: string | null;
  keywords: string[] | null;
  icon: string | null;
}

const enc = encodeURIComponent;
const stripTags = (s: string | null) => (s ? s.replace(/<\/?b>/g, '') : undefined);

// Presentationsmeta per entitetstyp i search_document.
const META: Record<string, { labelSv: string; labelEn: string; icon: LucideIcon; route: (h: Hit) => string }> = {
  // Region överst: exakt landskapsträff hamnar i topp-tier och länken visar HELA regionen på kartan.
  landscape:      { labelSv: 'Landskap & regioner', labelEn: 'Landscapes & regions', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  inscription:    { labelSv: 'Runinskrifter', labelEn: 'Inscriptions', icon: BookOpen, route: (h) => `/inscription/${enc(h.signum ?? h.label)}` },
  carver:         { labelSv: 'Ristare', labelEn: 'Carvers', icon: Hammer, route: (h) => `/carvers?carver=${h.entity_id}` },
  // Socknar går till socken-vyn (förvald via ?region=) — INTE textsök: sockennamn
  // som "Runsten" är också vanliga ord och geokodas fel som fritext.
  parish:         { labelSv: 'Socknar', labelEn: 'Parishes', icon: MapPin, route: (h) => `/explore?focus=parishes&region=${enc(h.label)}` },
  place:          { labelSv: 'Ortnamn', labelEn: 'Place names', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  christian_site: { labelSv: 'Heliga platser', labelEn: 'Holy sites', icon: Church, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  fortress:       { labelSv: 'Försvar', labelEn: 'Fortresses', icon: Castle, route: () => '/fortresses' },
  city:           { labelSv: 'Städer', labelEn: 'Cities', icon: Castle, route: () => '/fortresses' },
  king:           { labelSv: 'Kungar', labelEn: 'Kings', icon: Crown, route: () => '/royal-chronicles' },
  dynasty:        { labelSv: 'Släkter', labelEn: 'Dynasties', icon: Users2, route: () => '/royal-chronicles' },
  coin:           { labelSv: 'Mynt', labelEn: 'Coins', icon: CoinsIcon, route: () => '/coins' },
  god:            { labelSv: 'Gudar', labelEn: 'Gods', icon: Sparkles, route: () => '/explore?focus=gods' },
  viking_name:    { labelSv: 'Namn', labelEn: 'Names', icon: Users, route: () => '/explore?focus=names' },
  source:         { labelSv: 'Källor', labelEn: 'Sources', icon: ScrollText, route: (h) => `/sources/${h.entity_id}` },
  source_text:    { labelSv: 'Källtexter', labelEn: 'Source texts', icon: ScrollText, route: (h) => `/sources/text/${h.entity_id}` },
  road:           { labelSv: 'Vägar & leder', labelEn: 'Roads', icon: MapPin, route: () => '/explore' },
  theme:          { labelSv: 'Teman', labelEn: 'Themes', icon: Sparkles, route: () => '/explore' },
};

// Ikon per tema-slug (ikoner är UI-konfig; temadatat bor i DB).
const THEME_ICONS: Record<string, LucideIcon> = {
  faith: Cross, cult: Sparkles, death: Skull, voyage: Compass, weapons: Swords,
  protection: Shield, love: Heart, trade: CoinsIcon, ships: Ship, horse: PawPrint, pets: Dog,
};
const themeIcon = (t: DbTheme): LucideIcon => THEME_ICONS[t.slug ?? ''] ?? Sparkles;

// Gruppera rankade träffar per typ; gruppordning = första (bästa) träffens position.
// Per-typ-tak: regionsökningar ska visa ALLA borgar (Öland har 16), men inskrifter
// klipps tidigare — där finns alltid "visa alla på kartan"-länken.
const GROUP_CAP: Record<string, number> = { fortress: 16, parish: 12, inscription: 20 };
const groupHits = (hits: Hit[], defaultCap = 10): Group[] => {
  const groups: Group[] = [];
  const byType = new Map<string, Group>();
  for (const h of hits) {
    const meta = META[h.entity_type];
    if (!meta) continue;
    let g = byType.get(h.entity_type);
    if (!g) {
      g = { type: h.entity_type, labelSv: meta.labelSv, labelEn: meta.labelEn, icon: meta.icon, rows: [] };
      byType.set(h.entity_type, g);
      groups.push(g);
    }
    if (g.rows.length >= (GROUP_CAP[h.entity_type] ?? defaultCap)) continue;
    // Inskrifter: signum först, populärnamnet efter ("Öl 1 — Karlevistenen").
    const isNamedInscription = h.entity_type === 'inscription' && h.signum && h.signum !== h.label;
    g.rows.push({
      key: `${h.entity_type}-${h.entity_id}`,
      title: isNamedInscription ? `${h.signum} — ${h.label}` : h.label,
      subtitle: h.sublabel ?? undefined,
      signum: h.signum ?? undefined,
      snippet: stripTags(h.snippet),
      route: meta.route(h),
    });
  }
  // Inskrifter visas i signumordning (Öl 1 före Öl 13) — urvalet är fortfarande
  // relevans-topp-N, men presentationen numerisk (Daniels önskemål 2026-07-20).
  const insc = byType.get('inscription');
  insc?.rows.sort((a, b) =>
    (a.signum ?? a.title).localeCompare(b.signum ?? b.title, 'sv', { numeric: true, sensitivity: 'base' }));
  return groups;
};

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [themes, setThemes] = useState<DbTheme[]>([]);
  const [theme, setTheme] = useState<DbTheme | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // Tema-chips ur DB (sanningskällan), en gång per öppning.
      if (!themes.length) {
        sb.from('themes').select('id,slug,name,name_en,keywords,icon').order('name')
          .then((res: any) => setThemes(res.data ?? []))
          .catch(() => {});
      }
    } else { setQuery(''); setTheme(null); setGroups([]); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Tema-läge: grafkanter (has_theme) först, sedan nyckelordssök via search_v1.
  useEffect(() => {
    if (!theme) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        // OBS: supabase-js-buildern är en thenable UTAN .catch — att kedja .catch
        // direkt kastade TypeError och gav "No matches" för alla teman.
        // Promise.resolve() assimilerar buildern så .then/felgren funkar.
        const safe = (p: unknown) =>
          Promise.resolve(p).then((r) => r as { data: any[] | null }, () => ({ data: [] as any[] }));
        const [edgesRes, kwRes] = await Promise.all([
          safe(sb.rpc('neighbors_v1', { p_id: theme.id, p_predicate: 'has_theme' })),
          safe(sb.rpc('search_v1', {
            p_q: (theme.keywords?.length ? theme.keywords : [theme.name]).join(' OR '),
            p_limit: 48,
          })),
        ]);
        if (cancelled) return;
        const out: Group[] = [];
        const edgeRows: Row[] = (edgesRes.data ?? [])
          .filter((e: any) => META[e.entity_type])
          .map((e: any) => ({
            key: `edge-${e.entity_id}`,
            title: e.label ?? e.entity_type,
            subtitle: META[e.entity_type][sv ? 'labelSv' : 'labelEn'],
            route: META[e.entity_type].route({ entity_id: e.entity_id, entity_type: e.entity_type, label: e.label ?? '', signum: null, sublabel: null, snippet: null, score: 0 }),
          }));
        if (edgeRows.length) {
          out.push({ type: 'graph', labelSv: 'I kunskapsgrafen', labelEn: 'In the knowledge graph', icon: Network, rows: edgeRows });
        }
        out.push(...groupHits(kwRes.data ?? []));
        setGroups(out);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Fritext: EN rankad RPC (parametriserad — inga filteruttryck, fornnordiska tecken ok).
  useEffect(() => {
    if (theme) return;
    const q = query.trim();
    if (q.length < 2) { setGroups([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        // 120: regionsök (t.ex. "Gotland": 400+ inskrifter) tryckte annars ut
        // fornborgar/socknar ur topp-60; per-typ-taket i groupHits klipper sedan.
        const res = await sb.rpc('search_v1', { p_q: q, p_limit: 120 });
        setGroups(groupHits(res.data ?? []));
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, theme]);

  const go = useCallback((route: string) => { setOpen(false); navigate(route); }, [navigate]);
  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={sv ? 'Sök' : 'Search'}
        className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-400 hover:border-amber-500/50 hover:text-slate-200 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline">{sv ? 'Sök allt…' : 'Search everything…'}</span>
        <kbd className="hidden lg:inline ml-1 rounded border border-slate-600 bg-slate-900 px-1.5 text-[10px] text-slate-500">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 overflow-hidden bg-slate-900 border-slate-700 max-w-2xl top-[12%] translate-y-0">
          <div className="flex items-center gap-3 border-b border-slate-700 px-4">
            <Search className="h-5 w-5 text-amber-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (e.target.value) setTheme(null); }}
              placeholder={sv
                ? 'Runsten, ort, socken, ristare, gud, kung, mynt, namn…'
                : 'Runestone, place, parish, carver, god, king, coin, name…'}
              className="w-full bg-transparent py-4 text-white placeholder-slate-500 outline-none text-sm"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-amber-400 shrink-0" />}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {/* Begreppslager: temachips (ur DB) när fältet är tomt */}
            {!theme && query.trim().length < 2 && themes.length > 0 && (
              <div className="p-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {sv ? 'Teman' : 'Themes'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {themes.map((th) => {
                    const TIcon = themeIcon(th);
                    return (
                      <button
                        key={th.id}
                        onClick={() => { setTheme(th); setQuery(''); }}
                        className="flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:border-amber-500/50 hover:text-amber-100 transition-colors"
                      >
                        <TIcon className="h-3.5 w-3.5 text-amber-400" />
                        {sv ? th.name : (th.name_en ?? th.name)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aktivt tema: banner med rensa-knapp */}
            {theme && (() => {
              const TIcon = themeIcon(theme);
              return (
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/40 px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-amber-100">
                    <TIcon className="h-4 w-4 text-amber-400" />
                    {sv ? theme.name : (theme.name_en ?? theme.name)}
                    <span className="text-xs text-slate-500">{sv ? '— graf + tematiskt sök' : '— graph + thematic search'}</span>
                  </div>
                  <button onClick={() => setTheme(null)} className="text-slate-400 hover:text-white" aria-label={sv ? 'Rensa tema' : 'Clear theme'}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })()}

            {((query.trim().length >= 2) || theme) && !loading && total === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                {sv ? 'Inga träffar för' : 'No matches for'} “{theme ? (sv ? theme.name : theme.name_en ?? theme.name) : query}”
              </div>
            )}

            {groups.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.type} className="py-1">
                  <div className="flex items-center gap-1.5 px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <Icon className="h-3 w-3" /> {sv ? g.labelSv : g.labelEn}
                    <span className="text-slate-600">· {g.rows.length}</span>
                  </div>
                  {g.rows.map((row) => (
                    <button
                      key={row.key}
                      onClick={() => go(row.route)}
                      className="flex w-full items-start gap-3 px-4 py-2 text-left hover:bg-amber-500/10"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-amber-100 truncate">{row.title}</span>
                          {row.subtitle && <span className="text-xs text-slate-400 truncate">· {row.subtitle}</span>}
                        </div>
                        {row.snippet && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.snippet}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}

            {query.trim().length >= 2 && groups.some((g) => g.type === 'inscription') && (
              <button
                onClick={() => go(`/explore?searchQuery=${enc(query.trim())}`)}
                className="flex w-full items-center gap-2 border-t border-slate-800 px-4 py-2.5 text-left text-xs text-slate-400 hover:bg-slate-800/50"
              >
                <CornerDownLeft className="h-3.5 w-3.5" />
                {sv ? `Visa alla runinskrifter för “${query}” på kartan` : `Show all inscriptions for “${query}” on the map`}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
