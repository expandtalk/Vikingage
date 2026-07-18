import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader2, CornerDownLeft, BookOpen, Hammer, MapPin, Church,
  Castle, Crown, Users2, Coins as CoinsIcon, Users, X, type LucideIcon,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { sanitizeFilterValue } from '@/utils/searchFilter';
import { THEMES, type Theme } from '@/config/themes';

// Federerat global-sök (toppnav). Söker parallellt över flera entiteter och
// grupperar resultaten: runinskrifter (via search_inscriptions_flexible) +
// ristare, ortnamn, heliga platser, försvar/städer, kungar/dynastier, mynt, namn.
// Öppnas via knapp eller Ctrl/Cmd+K. Varje grupp länkar till sin vy.
// supabase-typerna är strikta för dynamiska tabellnamn → smal any-vy här.
const sb = supabase as unknown as {
  from: (t: string) => any;
  rpc: (fn: string, args: Record<string, unknown>) => any;
};

interface Row {
  key: string;
  title: string;
  subtitle?: string;
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

const truncate = (s: string | null | undefined, n = 90) =>
  s ? (s.length > n ? s.slice(0, n).trim() + '…' : s) : undefined;

// Entitetskällor (utom inskrifter, som körs via RPC:n för full täckning).
interface Source {
  type: string;
  labelSv: string; labelEn: string; icon: LucideIcon;
  table: string;
  select: string;
  orFields: string[];                       // kolumner som ILIKE-matchas
  map: (r: any) => Row;
}
const SOURCES: Source[] = [
  {
    type: 'carvers', labelSv: 'Ristare', labelEn: 'Carvers', icon: Hammer,
    table: 'carvers', select: 'id,name,description,region,country',
    orFields: ['name', 'description'],
    map: (r) => ({ key: `carver-${r.id}`, title: r.name, subtitle: [r.region, r.country].filter(Boolean).join(', '), snippet: truncate(r.description), route: `/carvers?carver=${r.id}` }),
  },
  {
    type: 'places', labelSv: 'Ortnamn', labelEn: 'Place names', icon: MapPin,
    table: 'places', select: 'placeid,place',
    orFields: ['place'],
    map: (r) => ({ key: `place-${r.placeid}`, title: r.place, subtitle: undefined, route: `/explore?searchQuery=${encodeURIComponent(r.place)}` }),
  },
  {
    type: 'holy', labelSv: 'Heliga platser', labelEn: 'Holy sites', icon: Church,
    table: 'christian_sites', select: 'id,name,name_en,site_type,region,description',
    orFields: ['name', 'name_en', 'description'],
    map: (r) => ({ key: `holy-${r.id}`, title: r.name, subtitle: [r.site_type, r.region].filter(Boolean).join(' · '), snippet: truncate(r.description), route: `/explore?searchQuery=${encodeURIComponent(r.name)}` }),
  },
  {
    type: 'fortresses', labelSv: 'Försvar', labelEn: 'Fortresses', icon: Castle,
    table: 'viking_fortresses', select: 'id,name,fortress_type,region,description',
    orFields: ['name', 'description', 'fortress_type'],
    map: (r) => ({ key: `fort-${r.id}`, title: r.name, subtitle: [r.fortress_type, r.region].filter(Boolean).join(' · '), snippet: truncate(r.description), route: '/fortresses' }),
  },
  {
    type: 'cities', labelSv: 'Städer', labelEn: 'Cities', icon: Castle,
    table: 'viking_cities', select: 'id,name,region,description',
    orFields: ['name', 'description'],
    map: (r) => ({ key: `city-${r.id}`, title: r.name, subtitle: r.region || undefined, snippet: truncate(r.description), route: '/fortresses' }),
  },
  {
    type: 'kings', labelSv: 'Kungar', labelEn: 'Kings', icon: Crown,
    table: 'historical_kings', select: 'id,name,region,description',
    orFields: ['name', 'description'],
    map: (r) => ({ key: `king-${r.id}`, title: r.name, subtitle: r.region || undefined, snippet: truncate(r.description), route: '/royal-chronicles' }),
  },
  {
    type: 'dynasties', labelSv: 'Släkter', labelEn: 'Dynasties', icon: Users2,
    table: 'royal_dynasties', select: 'id,name,name_en,region,description',
    orFields: ['name', 'name_en', 'description'],
    map: (r) => ({ key: `dyn-${r.id}`, title: r.name, subtitle: r.region || undefined, snippet: truncate(r.description), route: '/royal-chronicles' }),
  },
  {
    type: 'coins', labelSv: 'Mynt', labelEn: 'Coins', icon: CoinsIcon,
    table: 'coins', select: 'id,name,name_en,category,issuer,description',
    orFields: ['name', 'name_en', 'issuer', 'description'],
    map: (r) => ({ key: `coin-${r.id}`, title: r.name, subtitle: [r.category, r.issuer].filter(Boolean).join(' · '), snippet: truncate(r.description), route: '/coins' }),
  },
  {
    type: 'names', labelSv: 'Namn', labelEn: 'Names', icon: Users,
    table: 'viking_names', select: 'id,name,gender,meaning',
    orFields: ['name', 'meaning'],
    map: (r) => ({ key: `name-${r.id}`, title: r.name, subtitle: [r.gender === 'female' ? '♀' : '♂', r.meaning].filter(Boolean).join(' '), route: '/explore?focus=names' }),
  },
];

// Tematiskt sök: kör temats nyckelord (ILIKE-or) mot inskriftstext + de
// entiteter temat spänner över. Steget från fältsök mot tematisk graf.
const buildThemeGroups = async (theme: Theme): Promise<Group[]> => {
  const kw = theme.keywords;
  const inscFields = ['normalization', 'translation_sv', 'translation_en', 'scholarly_notes', 'historical_context'];
  const out: Group[] = [];

  const jobs: Promise<Group | null>[] = [];

  if (theme.entities.includes('inscriptions')) {
    const orExpr = kw.flatMap((k) => inscFields.map((f) => `${f}.ilike.%${k}%`)).join(',');
    jobs.push(
      sb.from('runic_inscriptions').select('id,signum,primary_signum,location,landscape,province').or(orExpr).limit(10)
        .then((res: any): Group | null => {
          const rows: Row[] = (res.data ?? []).map((r: any) => ({
            key: `insc-${r.id}`,
            title: r.primary_signum || r.signum,
            subtitle: r.location || r.landscape || r.province || undefined,
            route: `/explore?searchQuery=${encodeURIComponent(r.primary_signum || r.signum)}`,
          }));
          return rows.length ? { type: 'inscriptions', labelSv: 'Runinskrifter', labelEn: 'Inscriptions', icon: BookOpen, rows } : null;
        })
        .catch(() => null)
    );
  }

  for (const s of SOURCES) {
    if (!theme.entities.includes(s.type)) continue;
    const orExpr = kw.flatMap((k) => s.orFields.map((f) => `${f}.ilike.%${k}%`)).join(',');
    jobs.push(
      sb.from(s.table).select(s.select).or(orExpr).limit(6)
        .then((res: any): Group | null => {
          const rows: Row[] = (res.data ?? []).map(s.map);
          return rows.length ? { type: s.type, labelSv: s.labelSv, labelEn: s.labelEn, icon: s.icon, rows } : null;
        })
        .catch(() => null)
    );
  }

  for (const g of await Promise.all(jobs)) if (g) out.push(g);
  // Behåll ordning: inskrifter först, sedan enligt SOURCES-ordning
  const order = ['inscriptions', ...SOURCES.map((s) => s.type)];
  out.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  return out;
};

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState<Theme | null>(null);
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
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setTheme(null); setGroups([]); }
  }, [open]);

  // Tema-läge: kör tematiskt sök när ett tema valts.
  useEffect(() => {
    if (!theme) return;
    setLoading(true);
    buildThemeGroups(theme).then(setGroups).finally(() => setLoading(false));
  }, [theme]);

  useEffect(() => {
    if (theme) return;
    if (query.trim().length < 2) { setGroups([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const safe = sanitizeFilterValue(query);
      if (!safe) { setGroups([]); setLoading(false); return; }
      const like = `%${safe}%`;
      try {
        // Inskrifter via RPC (bred fältmatchning), övrigt via ILIKE-or per tabell.
        const inscPromise = sb.rpc('search_inscriptions_flexible', { p_search_term: safe })
          .limit(8)
          .then((res: any) => (res.data ?? []).slice(0, 8).map((r: any): Row => ({
            key: `insc-${r.id}`,
            title: r.signum,
            subtitle: r.location || r.landscape || r.province || undefined,
            route: `/explore?searchQuery=${encodeURIComponent(r.signum)}`,
          })))
          .catch(() => []);

        const sourcePromises = SOURCES.map((s) =>
          sb.from(s.table).select(s.select)
            .or(s.orFields.map((f) => `${f}.ilike.${like}`).join(','))
            .limit(6)
            .then((res: any) => ({ s, rows: (res.data ?? []).map(s.map) as Row[] }))
            .catch(() => ({ s, rows: [] as Row[] }))
        );

        const [inscRows, sourceResults] = await Promise.all([inscPromise, Promise.all(sourcePromises)]);

        const out: Group[] = [];
        if (inscRows.length) out.push({ type: 'inscriptions', labelSv: 'Runinskrifter', labelEn: 'Inscriptions', icon: BookOpen, rows: inscRows });
        for (const { s, rows } of sourceResults) {
          if (rows.length) out.push({ type: s.type, labelSv: s.labelSv, labelEn: s.labelEn, icon: s.icon, rows });
        }
        setGroups(out);
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
            {/* Begreppslager: temachips när fältet är tomt */}
            {!theme && query.trim().length < 2 && (
              <div className="p-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {sv ? 'Teman' : 'Themes'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((th) => {
                    const TIcon = th.icon;
                    return (
                      <button
                        key={th.id}
                        onClick={() => { setTheme(th); setQuery(''); }}
                        className="flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:border-amber-500/50 hover:text-amber-100 transition-colors"
                      >
                        <TIcon className="h-3.5 w-3.5 text-amber-400" />
                        {sv ? th.labelSv : th.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aktivt tema: banner med rensa-knapp */}
            {theme && (
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/40 px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-amber-100">
                  <theme.icon className="h-4 w-4 text-amber-400" />
                  {sv ? theme.labelSv : theme.labelEn}
                  <span className="text-xs text-slate-500">{sv ? '— tematiskt sök tvärs över databasen' : '— thematic search across the database'}</span>
                </div>
                <button onClick={() => setTheme(null)} className="text-slate-400 hover:text-white" aria-label={sv ? 'Rensa tema' : 'Clear theme'}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {((query.trim().length >= 2) || theme) && !loading && total === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                {sv ? 'Inga träffar för' : 'No matches for'} “{theme ? (sv ? theme.labelSv : theme.labelEn) : query}”
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

            {query.trim().length >= 2 && groups.some((g) => g.type === 'inscriptions') && (
              <button
                onClick={() => go(`/explore?searchQuery=${encodeURIComponent(query.trim())}`)}
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
