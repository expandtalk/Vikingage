import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader2, CornerDownLeft, BookOpen, Hammer, MapPin, Church,
  Castle, Crown, Users2, Coins as CoinsIcon, Users, Sparkles, X, Cross, Skull,
  Compass, Swords, Shield, Heart, Ship, PawPrint, Dog, Network, ScrollText,
  AlertTriangle, ExternalLink, Info,
  type LucideIcon,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEntityNeighbors } from '@/hooks/useEntityNeighbors';
import { useEntityFacets } from '@/hooks/useEntityFacets';
import { useOffTopicSenses } from '@/hooks/useOffTopicSenses';
import { useSearchThumbs } from '@/hooks/useSearchThumbs';
import { RelationMindmap } from './RelationMindmap';

// Facett-ikoner (entity_facets.icon = strängnamn) → lucide-komponent.
const FACET_ICON: Record<string, LucideIcon> = {
  AlertTriangle, Coins: CoinsIcon, MapPin, ExternalLink, Shield, ScrollText, Church, Castle, Crown, Ship, Compass,
};

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
  id: string;          // entity_id — nyckel för tumnagel-uppslagning
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
  hillfort:       { labelSv: 'Fornborgar', labelEn: 'Hillforts', icon: Castle, route: () => '/fortresses' },
  folk_group:     { labelSv: 'Folkgrupper', labelEn: 'Peoples', icon: Users2, route: () => '/explore?focus=folkGroups' },
  city:           { labelSv: 'Städer', labelEn: 'Cities', icon: Castle, route: () => '/fortresses' },
  king:           { labelSv: 'Kungar', labelEn: 'Kings', icon: Crown, route: () => '/royal-chronicles' },
  dynasty:        { labelSv: 'Släkter', labelEn: 'Dynasties', icon: Users2, route: () => '/royal-chronicles' },
  coin:           { labelSv: 'Mynt', labelEn: 'Coins', icon: CoinsIcon, route: () => '/coins' },
  god:            { labelSv: 'Gudar', labelEn: 'Gods', icon: Sparkles, route: () => '/explore?focus=gods' },
  viking_name:    { labelSv: 'Namn', labelEn: 'Names', icon: Users, route: () => '/explore?focus=names' },
  source:         { labelSv: 'Källor', labelEn: 'Sources', icon: ScrollText, route: (h) => `/sources/${h.entity_id}` },
  source_text:    { labelSv: 'Källtexter', labelEn: 'Source texts', icon: ScrollText, route: (h) => `/sources/text/${h.entity_id}` },
  road:           { labelSv: 'Vägar & leder', labelEn: 'Roads', icon: MapPin, route: () => '/explore' },
  excursion:      { labelSv: 'Utflykter', labelEn: 'Excursions', icon: Compass, route: (h) => h.signum ? `/excursions/${enc(h.signum)}` : '/excursions' },
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
      id: h.entity_id,
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

// "Gå vidare"-sektion: visar en entitets kunskapsgraf-grannar som klickbara
// destinationschips (kung → dynasti + kungsgårdar osv). Grannarna hämtas via
// graph_neighborhood och mappas till destinationer i entityDestinations-configen.
const GoFurther: React.FC<{ hit: Hit; onGo: (route: string) => void; sv: boolean }> = ({ hit, onGo, sv }) => {
  const { data: neighbors } = useEntityNeighbors(hit.entity_id);
  const { data: facets } = useEntityFacets(hit.entity_type, hit.entity_id);
  if (!neighbors.length && !facets.length) return null;
  return (
    <div className="border-t border-slate-800 px-4 py-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {sv ? 'Gå vidare' : 'Explore further'}
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Kurerade facetter först (entity_facets, prior-ordnade). Extern länk = <a>, intern = onGo. */}
        {facets.map((f) => {
          const Icon = (f.icon && FACET_ICON[f.icon]) || Network;
          const label = sv ? f.label_sv : f.label_en;
          const cls = 'inline-flex items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-500/5 px-3 py-1 text-sm text-amber-100 hover:border-amber-500/70';
          return f.is_external ? (
            <a key={f.facet_key} href={f.destination} target="_blank" rel="noopener noreferrer" className={cls}>
              <Icon className="h-3.5 w-3.5 text-amber-400" /> {label} <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          ) : (
            <button key={f.facet_key} onClick={() => onGo(f.destination)} className={cls}>
              <Icon className="h-3.5 w-3.5 text-amber-400" /> {label}
            </button>
          );
        })}
        {/* KG-grannar därefter (graph_neighborhood) */}
        {neighbors.slice(0, 12).map((n, i) => {
          const Icon = n.destination.icon;
          return (
            <button
              key={`${n.other_type}-${i}`}
              onClick={() => onGo(n.destination.route)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1 text-sm text-slate-200 hover:border-amber-500/50 hover:text-amber-100"
            >
              <Icon className="h-3.5 w-3.5 text-amber-400" /> {n.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Kunskapspanel (höger kolumn i hero-söket) — "left brain": bild + typ + titel + utdrag,
// primär öppna-knapp, "Gå vidare"-chips OCH en radiell relationskarta ("right brain").
// Visas bara i den breda hero-ytan (dialogen är för smal); driven av starkaste träffen.
const KnowledgePanel: React.FC<{ hit: Hit; thumb?: string; onGo: (route: string) => void; sv: boolean }> = ({ hit, thumb, onGo, sv }) => {
  const meta = META[hit.entity_type];
  const { data: neighbors } = useEntityNeighbors(hit.entity_id);
  if (!meta) return null;
  const Icon = meta.icon;
  const title = hit.entity_type === 'inscription' && hit.signum && hit.signum !== hit.label
    ? `${hit.signum} — ${hit.label}` : hit.label;
  const desc = stripTags(hit.snippet) ?? hit.sublabel ?? undefined;
  const mindNodes = neighbors.slice(0, 8).map((n) => ({ label: n.label, route: n.destination.route, icon: n.destination.icon }));

  return (
    <div className="text-left">
      {thumb ? (
        <img
          src={thumb}
          alt={title}
          loading="lazy"
          className="h-44 w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <Icon className="h-10 w-10 text-slate-600" />
        </div>
      )}
      <div className="px-4 py-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
          <Icon className="h-3 w-3" />{sv ? meta.labelSv : meta.labelEn}
        </div>
        <h3 className="text-base font-semibold text-amber-100 leading-tight">{title}</h3>
        {desc && <p className="mt-1.5 text-xs leading-relaxed text-slate-400 line-clamp-4">{desc}</p>}
        <button
          onClick={() => onGo(meta.route(hit))}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/90 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-amber-400"
        >
          {sv ? 'Öppna' : 'Open'} <CornerDownLeft className="h-3.5 w-3.5" />
        </button>
      </div>
      <GoFurther hit={hit} onGo={onGo} sv={sv} />
      <RelationMindmap center={hit.label} nodes={mindNodes} onGo={onGo} sv={sv} />
    </div>
  );
};

// Homonym "vid sidan": off-topic betydelser av söksträngen (our_domain=false), avmarkerade.
// Vi hävdar vår mening i träffarna; detta noterar bara "menade du X? — fokuserar vi inte på".
const SideSenses: React.FC<{ query: string; sv: boolean }> = ({ query, sv }) => {
  const { data } = useOffTopicSenses(query);
  if (!data.length) return null;
  return (
    <div className="border-b border-slate-800 bg-slate-800/30 px-4 py-2">
      <div className="flex items-start gap-2 text-[11px] text-slate-400">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-500" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-slate-500">{sv ? 'Vid sidan:' : 'Aside:'}</span>
          {data.map((s, i) => (
            <span key={i} className="text-slate-400">
              <span className="text-slate-300">{sv ? s.sense_label_sv : s.sense_label_en}</span>
              {(sv ? s.note_sv : s.note_en) && <span className="text-slate-500"> — {sv ? s.note_sv : s.note_en}</span>}
              {i < data.length - 1 && <span className="text-slate-600"> ·</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Startförslag i hero-sökrutan — visas direkt när fältet fokuseras (innan man skrivit klart),
// så man får idéer om vad som finns att söka på.
const SUGGESTIONS_SV = ['runsten', 'Rökstenen', 'Karlevistenen', 'guld', 'Öland', 'Birka', 'Oden', 'Tor', 'Gustav Vasa', 'runor', 'Sigtuna', 'fornborg'];
const SUGGESTIONS_EN = ['runestone', 'Rök stone', 'gold', 'Öland', 'Birka', 'Odin', 'Thor', 'runes', 'gods', 'Sigtuna', 'Gotland', 'hillfort'];

// variant 'icon' = liten förstoringsglas-ikon (toppnav på övriga sidor) → öppnar dialog (⌘K);
// 'hero' = stor Google-lik sökruta (startsidan) → RIKTIGT inline-fält, träffarna fälls ut under
// (ingen modal — man skriver direkt i rutan). Samma sök-logik för båda.
export const GlobalSearch: React.FC<{ variant?: 'icon' | 'hero'; onActiveChange?: (active: boolean) => void }> = ({ variant = 'icon', onActiveChange }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState<DbTheme | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  // AI-svar (grounded RAG via edge-funktionen search-answer).
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiSources, setAiSources] = useState<Hit[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  // Starkaste träffen — driver "Gå vidare"-sektionen (dess graf-grannar).
  const [topEntity, setTopEntity] = useState<Hit | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Hero-varianten: inline-fält + utfällbar träfflista (ingen dialog).
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const [heroActive, setHeroActive] = useState(false);

  useEffect(() => {
    // ⌘K öppnar dialogen — bara ikon-varianten i toppnav. Hero-varianten söker inline,
    // så den registrerar INGEN genväg (annars skulle open-toggling nolla hero-frågan).
    if (variant === 'hero') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [variant]);

  // Stäng hero-dropdownen vid klick utanför.
  useEffect(() => {
    if (!heroActive) return;
    const onDown = (e: MouseEvent) => {
      if (heroWrapRef.current && !heroWrapRef.current.contains(e.target as Node)) setHeroActive(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [heroActive]);

  // Signalera "söker"-läge uppåt så HeroSection kan kollapsa intro-texten och ge resultaten plats.
  useEffect(() => {
    if (variant !== 'hero') return;
    onActiveChange?.(heroActive && (query.trim().length >= 2 || !!theme));
  }, [variant, heroActive, query, theme, onActiveChange]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else { setQuery(''); setTheme(null); setGroups([]); setAiAnswer(null); setAiSources([]); setTopEntity(null); }
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
            id: e.entity_id,
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
    setAiAnswer(null); setAiSources([]); setTopEntity(null); // nytt frågeord → släng gammalt AI-svar
    if (theme) return;
    const q = query.trim();
    if (q.length < 2) { setGroups([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        // Hybrid (lexikalt search_v1 + semantiskt) via edge-funktionen search-hybrid.
        // Fallback till rena search_v1 om edge:n fallerar → sök går aldrig sönder.
        // 120: regionsök (t.ex. "Gotland": 400+ inskrifter) tryckte annars ut
        // fornborgar/socknar ur topp-60; per-typ-taket i groupHits klipper sedan.
        let hits: Hit[] | null = null;
        try {
          const { data, error } = await supabase.functions.invoke('search-hybrid', { body: { q, limit: 120 } });
          if (!error && Array.isArray((data as { hits?: Hit[] } | null)?.hits)) {
            hits = (data as { hits: Hit[] }).hits;
          }
        } catch { /* faller igenom till lexikalt */ }
        if (!hits) {
          const res = await sb.rpc('search_v1', { p_q: q, p_limit: 120 });
          hits = res.data ?? [];
        }
        setGroups(groupHits(hits));
        setTopEntity(hits[0] ?? null);
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, theme]);

  const go = useCallback((route: string) => { setOpen(false); setHeroActive(false); navigate(route); }, [navigate]);
  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  // Tumnaglar: batcha alla synliga inskriftsträffar i EN RPC (search_thumbs).
  const inscriptionIds = useMemo(
    () => groups.filter((g) => g.type === 'inscription').flatMap((g) => g.rows.map((r) => r.id)),
    [groups],
  );
  const { data: thumbs = {} } = useSearchThumbs(inscriptionIds);

  // Grounded RAG-svar via edge-funktionen search-answer (källfört, inga påhitt).
  const askAI = useCallback(async () => {
    const q = query.trim();
    if (q.length < 3) return;
    setAiLoading(true); setAiAnswer(null); setAiSources([]);
    try {
      const { data, error } = await supabase.functions.invoke('search-answer', { body: { q, language: sv ? 'sv' : 'en' } });
      if (error) throw error;
      const d = data as { answer?: string; sources?: Hit[]; error?: string };
      setAiAnswer(d.answer ?? d.error ?? (sv ? 'Inget svar.' : 'No answer.'));
      setAiSources(d.sources ?? []);
    } catch {
      setAiAnswer(sv ? 'AI-svaret kunde inte hämtas just nu.' : 'Could not fetch the AI answer right now.');
    } finally {
      setAiLoading(false);
    }
  }, [query, sv]);

  // Delad träfflista — samma innehåll i hero-dropdownen och i dialogen.
  // scrollClass styr höjden per yta: hero använder nästan hela skärmen, dialogen håller sig lägre.
  // wide=true (bara hero) → tvåkolumn: träfflista + kunskapspanel till höger.
  const renderResults = (scrollClass: string, wide = false) => {
    const showPanel = wide && !!topEntity && !theme;
    const list = (
    <div className={`${scrollClass} overflow-y-auto text-left`}>
      {/* Homonym vid sidan — off-topic betydelser (Tor Browser etc.), avmarkerade */}
      <SideSenses query={query} sv={sv} />
      {/* AI-svar (grounded RAG) — knapp när man skrivit en fråga, sedan källfört svar */}
      {!theme && query.trim().length >= 3 && (
        <div className="border-b border-slate-800 px-4 py-3">
          {!aiAnswer && !aiLoading && (
            <button
              onClick={askAI}
              className="flex items-center gap-2 text-sm text-amber-200 hover:text-amber-100"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              {sv ? `Fråga AI: “${query.trim()}”` : `Ask AI: “${query.trim()}”`}
            </button>
          )}
          {aiLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              {sv ? 'AI läser källorna…' : 'AI reading the sources…'}
            </div>
          )}
          {aiAnswer && (
            <div className="text-sm text-slate-200">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                <Sparkles className="h-3 w-3" />{sv ? 'AI-svar · källfört' : 'AI answer · sourced'}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{aiAnswer}</p>
              {aiSources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {aiSources.map((s, i) => {
                    const meta = META[s.entity_type];
                    if (!meta) return null;
                    return (
                      <button
                        key={s.entity_id + i}
                        onClick={() => go(meta.route(s))}
                        className="rounded border border-slate-600 px-1.5 py-0.5 text-[11px] text-slate-300 hover:border-amber-500/50 hover:text-amber-100"
                      >
                        [{i + 1}] {s.label}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="mt-1.5 text-[10px] text-slate-500">
                {sv ? 'AI-genererat ur källorna nedan — verifiera via länkarna.' : 'AI-generated from the sources below — verify via the links.'}
              </p>
            </div>
          )}
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
            <div className="flex items-center gap-3">
              {theme.slug && (
                <button onClick={() => go(`/tema/${theme.slug}`)} className="text-xs font-medium text-amber-300 hover:text-amber-100">
                  {sv ? 'Visa hela temat →' : 'View full theme →'}
                </button>
              )}
              <button onClick={() => setTheme(null)} className="text-slate-400 hover:text-white" aria-label={sv ? 'Rensa tema' : 'Clear theme'}>
                <X className="h-4 w-4" />
              </button>
            </div>
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
                className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-amber-500/10"
              >
                {/* Tumnagel för runinskrifter (övriga typer saknar bild → ingen tom ruta) */}
                {g.type === 'inscription' && (
                  thumbs[row.id] ? (
                    <img
                      src={thumbs[row.id]}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 shrink-0 rounded object-cover bg-slate-800"
                      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-800/60">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </span>
                  )
                )}
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

      {/* I bred vy bor "Gå vidare" i kunskapspanelen till höger — inline bara i smal vy */}
      {!showPanel && topEntity && !theme && <GoFurther hit={topEntity} onGo={go} sv={sv} />}

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
    );

    if (!showPanel) return list;
    // Tvåkolumn: träfflistan till vänster, kunskapspanel (bild + fakta + relationskarta) till höger.
    return (
      <div className="lg:grid lg:grid-cols-[1fr_340px]">
        {list}
        <aside className={`hidden lg:block border-l border-slate-800 ${scrollClass} overflow-y-auto`}>
          <KnowledgePanel hit={topEntity!} thumb={thumbs[topEntity!.entity_id]} onGo={go} sv={sv} />
        </aside>
      </div>
    );
  };

  // HERO: riktigt inline-sökfält. Man skriver direkt i rutan; träffarna fälls ut under.
  // Vid träffar breddas rutan mot nästan full skärmbredd och listan får nästan hela höjden
  // (Daniel: "använd hela skärmen") — kort-sektionen under kollapsar (styrs i Welcome).
  if (variant === 'hero') {
    const hasResults = query.trim().length >= 2 || !!theme;
    return (
      <div ref={heroWrapRef} className={`relative w-full mx-auto transition-all ${hasResults ? 'max-w-5xl' : 'max-w-xl'}`}>
        <div className="flex items-center gap-3 rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl focus-within:shadow-xl px-5 py-3.5 transition-shadow">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (e.target.value) setTheme(null); }}
            onFocus={() => setHeroActive(true)}
            aria-label={sv ? 'Sök' : 'Search'}
            placeholder={sv
              ? 'Sök allt — runsten, ort, socken, gud, kung, mynt…'
              : 'Search everything — runestone, place, parish, god, king, coin…'}
            className="flex-1 min-w-0 bg-transparent text-base text-slate-800 placeholder-slate-400 outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-amber-500 shrink-0" />}
        </div>
        {heroActive && (
          <div className="absolute left-0 right-0 z-[60] mt-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            {hasResults ? renderResults('max-h-[76vh]', true) : (
              <div className="p-3">
                <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {sv ? 'Förslag' : 'Suggestions'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(sv ? SUGGESTIONS_SV : SUGGESTIONS_EN).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setTheme(null); setQuery(s); inputRef.current?.focus(); }}
                      className="rounded-full border border-slate-600 px-3 py-1 text-sm text-slate-200 hover:border-amber-500/50 hover:text-amber-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ICON: förstoringsglas i toppnav → dialog (även ⌘K).
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={sv ? 'Sök allt' : 'Search everything'}
        title={sv ? 'Sök allt (⌘K)' : 'Search everything (⌘K)'}
        className="flex items-center justify-center h-9 w-9 rounded-full border border-slate-600 bg-slate-800/60 text-slate-400 hover:border-amber-500/50 hover:text-slate-200 transition-colors"
      >
        <Search className="h-4 w-4" />
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
          {renderResults('max-h-[60vh]')}
        </DialogContent>
      </Dialog>
    </>
  );
};
