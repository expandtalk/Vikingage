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
import { useOffTopicSenses, useCanonicalSense } from '@/hooks/useOffTopicSenses';
import { useSearchThumbs } from '@/hooks/useSearchThumbs';
import { RelationMindmap } from './RelationMindmap';
import { AnswerContext } from './AnswerContext';
import { GodQuestions } from './GodQuestions';
import { SuggestPlaceForm } from './SuggestPlaceForm';
import { EXCURSIONS } from '@/data/excursions';

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
  // Kultplats: har platssidan en slug (i signum) → gå dit; annars textsök på kartan.
  cult_site:      { labelSv: 'Kultplatser', labelEn: 'Cult sites', icon: Sparkles, route: (h) => h.signum ? `/sv/plats/${enc(h.signum)}` : `/explore?searchQuery=${enc(h.label)}` },
  ecclesiastical_site: { labelSv: 'Kyrkor', labelEn: 'Churches', icon: Church, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  saint:          { labelSv: 'Helgon', labelEn: 'Saints', icon: Church, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  event:          { labelSv: 'Händelser', labelEn: 'Events', icon: ScrollText, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  castle:         { labelSv: 'Borgar', labelEn: 'Castles', icon: Castle, route: () => '/sv/medeltidsborgar' },
  estate:         { labelSv: 'Gods & säten', labelEn: 'Estates', icon: Castle, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  town:           { labelSv: 'Medeltida städer', labelEn: 'Medieval towns', icon: Castle, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  church_artwork: { labelSv: 'Kyrkokonst', labelEn: 'Church art', icon: Church, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  genetic_individual: { labelSv: 'aDNA-individer', labelEn: 'aDNA individuals', icon: Users, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  crossing_point: { labelSv: 'Överfarter', labelEn: 'Crossings', icon: Ship, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  thing_site:     { labelSv: 'Tingsplatser', labelEn: 'Assembly sites', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  fairway:        { labelSv: 'Farleder', labelEn: 'Fairways', icon: Ship, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  maritime_node:  { labelSv: 'Hamnar & noder', labelEn: 'Harbours', icon: Ship, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  trade_route:    { labelSv: 'Handelsvägar', labelEn: 'Trade routes', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  content_page:   { labelSv: 'Sidor', labelEn: 'Pages', icon: BookOpen, route: (h) => h.signum ?? '/explore' },
  experience:     { labelSv: 'Upplevelser', labelEn: 'Experiences', icon: Compass, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  investigation:  { labelSv: 'Undersökningar', labelEn: 'Investigations', icon: ScrollText, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  archaeological_site: { labelSv: 'Arkeologiska platser', labelEn: 'Archaeological sites', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  fortress:       { labelSv: 'Försvar', labelEn: 'Fortresses', icon: Castle, route: () => '/fortresses' },
  hillfort:       { labelSv: 'Fornborgar', labelEn: 'Hillforts', icon: Castle, route: (h) => `/fortresses/${h.entity_id}` },
  folk_group:     { labelSv: 'Folkgrupper', labelEn: 'Peoples', icon: Users2, route: () => '/explore?focus=folkGroups' },
  city:           { labelSv: 'Städer', labelEn: 'Cities', icon: Castle, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  king:           { labelSv: 'Kungar', labelEn: 'Kings', icon: Crown, route: () => '/royal-chronicles' },
  dynasty:        { labelSv: 'Släkter', labelEn: 'Dynasties', icon: Users2, route: () => '/royal-chronicles' },
  coin:           { labelSv: 'Mynt', labelEn: 'Coins', icon: CoinsIcon, route: () => '/coins' },
  god:            { labelSv: 'Gudar', labelEn: 'Gods', icon: Sparkles, route: () => '/explore?focus=gods' },
  viking_name:    { labelSv: 'Namn', labelEn: 'Names', icon: Users, route: () => '/explore?focus=names' },
  source:         { labelSv: 'Källor', labelEn: 'Sources', icon: ScrollText, route: (h) => `/sources/${h.entity_id}` },
  source_text:    { labelSv: 'Källtexter', labelEn: 'Source texts', icon: ScrollText, route: (h) => `/sources/text/${h.entity_id}` },
  road:           { labelSv: 'Vägar & leder', labelEn: 'Roads', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  shipwreck:      { labelSv: 'Skeppsvrak', labelEn: 'Shipwrecks', icon: Ship, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  scholar:        { labelSv: 'Forskning', labelEn: 'Research', icon: Users, route: () => '/forskare' },
  place_name:     { labelSv: 'Ortnamn', labelEn: 'Place names', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  heritage_site:  { labelSv: 'Fornlämningar', labelEn: 'Ancient remains', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  excursion:      { labelSv: 'Utflykter', labelEn: 'Excursions', icon: Compass, route: (h) => {
                      // search_document har UUID + null signum för utflykter, men ExcursionDetail
                      // matchar på slug (e.id). Slå upp slugen via namnet i den statiska listan →
                      // specifik utflyktssida i st.f. generiska /excursions (Daniel).
                      const ex = EXCURSIONS.find((e) => e.name === h.label)
                        ?? (h.signum ? EXCURSIONS.find((e) => e.id === h.signum) : undefined);
                      return ex ? `/excursions/${enc(ex.id)}` : '/excursions';
                    } },
  museum_object:  { labelSv: 'Föremål', labelEn: 'Objects', icon: Hammer, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  theme:          { labelSv: 'Teman', labelEn: 'Themes', icon: Sparkles, route: () => '/explore' },
};

// Entitetstyper med geografiskt läge → erbjud "Visa på kartan" i svarspanelen.
const GEO_TYPES = new Set([
  'place', 'place_name', 'heritage_site', 'city', 'parish', 'landscape', 'hillfort',
  'inscription', 'excursion', 'road', 'christian_site', 'fortress', 'shipwreck',
]);

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

// Etiketthygien (Daniel: "etiketter läcker databasen"). Mappa interna råvärden (osm_hamlet, other,
// okänd) till mänskliga ord eller inget, och dölj sublabel som bara upprepar titeln.
const SUBLABEL_MAP: Record<string, string> = {
  osm_hamlet: 'ort', osm_city: 'stad', osm_town: 'ort', osm_village: 'by', osm_suburb: 'stadsdel',
  osm_locality: 'plats', osm_isolated_dwelling: 'gård', other: '', okänd: '', okänt: '', unknown: '', 'övrig': '', 'övrigt': '',
};
const humanSub = (title: string, sub?: string | null): string | null => {
  if (!sub) return null;
  const t = (title || '').toLowerCase();
  const seen = new Set<string>();
  const cleaned = sub.split(/\s*·\s*/)
    .map((part) => { const m = SUBLABEL_MAP[part.trim().toLowerCase()]; return m === undefined ? part.trim() : m; })
    .filter(Boolean)
    .filter((part) => {
      const p = part.toLowerCase();
      if (t.includes(p)) return false;   // segmentet står redan i titeln (t.ex. "fornborg", "Göteborg")
      if (seen.has(p)) return false;      // dedup upprepade segment
      seen.add(p); return true;
    })
    .join(' · ');
  if (!cleaned) return null;
  if (cleaned.toLowerCase() === (title || '').trim().toLowerCase()) return null; // upprepar titeln
  return cleaned;
};

// Snippet som bara upprepar titel/sublabel (t.ex. ts_headline "Västergötland Göteborg. 1.") är
// brus — dölj den. Behåll bara snippets som TILLFÖR något (ord som inte redan syns i titel+sublabel).
const snippetRedundant = (snip: string, title: string, sub?: string | null): boolean => {
  const hay = `${title} ${sub ?? ''}`.toLowerCase();
  const toks = snip.toLowerCase().split(/[^a-zà-ÿåäö0-9]+/i).filter((w) => w.length >= 3 && !/^\d+$/.test(w));
  if (toks.length === 0) return true;                 // bara siffror/skräp
  return toks.every((w) => hay.includes(w));          // alla ord finns redan i titel+sublabel
};
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
  // Gruppordning: ORTNAMN före SOCKEN (Daniel) — fast prioritet för geo-grupperna, övriga typer
  // behåller sin relevansordning (originalindex) efter dem.
  const GROUP_PRIORITY: Record<string, number> = {
    landscape: 0, city: 1, place: 2, place_name: 3, excursion: 4, heritage_site: 5,
    fortress: 6, hillfort: 6, parish: 7, hundred: 8, inscription: 9,
  };
  const origIdx = new Map(groups.map((g, i) => [g.type, i]));
  groups.sort((a, b) =>
    (GROUP_PRIORITY[a.type] ?? 100 + (origIdx.get(a.type) ?? 0)) -
    (GROUP_PRIORITY[b.type] ?? 100 + (origIdx.get(b.type) ?? 0)));
  return groups;
};

// "Gå vidare"-sektion: visar en entitets kunskapsgraf-grannar som klickbara
// destinationschips (kung → dynasti + kungsgårdar osv). Grannarna hämtas via
// graph_neighborhood och mappas till destinationer i entityDestinations-configen.
const GoFurther: React.FC<{ hit: Hit; onGo: (route: string) => void; sv: boolean }> = ({ hit, onGo, sv }) => {
  const { data: neighbors } = useEntityNeighbors(hit.entity_id);
  const { data: facets } = useEntityFacets(hit.entity_type, hit.entity_id);
  // Filtrera bort chips utan riktig etikett — "Okänd"/null ska inte bli en klickbar knapp
  // (Daniel: "en null som blivit knapp"). Deduplicera på etikett.
  const seen = new Set<string>();
  const cleanNeighbors = neighbors.filter((n) => {
    const l = (n.label ?? '').trim();
    if (!l || ['okänd', 'unknown', 'other', 'övrig'].includes(l.toLowerCase())) return false;
    if (seen.has(l.toLowerCase())) return false;
    seen.add(l.toLowerCase());
    return true;
  });
  if (!cleanNeighbors.length && !facets.length) return null;
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
        {/* KG-grannar därefter (graph_neighborhood) — rensade från null/"Okänd" + dedupade */}
        {cleanNeighbors.slice(0, 12).map((n, i) => {
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
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => onGo(meta.route(hit))}
            className="inline-flex max-w-full items-center gap-1.5 truncate rounded-lg bg-amber-500/90 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-amber-400"
          >
            {/* Primärknappen namnger DESTINATIONEN, inte handlingen (Daniel: "Open säger ingenting"). */}
            {GEO_TYPES.has(hit.entity_type)
              ? (sv ? `Utforska ${hit.label}` : `Explore ${hit.label}`)
              : (sv ? `Öppna ${hit.label}` : `Open ${hit.label}`)}
            <CornerDownLeft className="h-3.5 w-3.5 shrink-0" />
          </button>
          {GEO_TYPES.has(hit.entity_type) && (
            <button
              onClick={() => onGo(`/explore?searchQuery=${enc(hit.label)}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-200 hover:border-amber-500/50 hover:text-amber-100"
            >
              <MapPin className="h-3.5 w-3.5" /> {sv ? 'Visa på kartan' : 'Show on map'}
            </button>
          )}
          <button
            onClick={() => {
              // Runsten: öppna stenen (modalen visar forskare kopplade till JUST den stenen),
              // annars bläddra i hela forskarregistret.
              if (hit.entity_type === 'inscription') {
                const open = (window as unknown as { __openInscriptionById?: (id: string) => void }).__openInscriptionById;
                if (open) { open(hit.entity_id); return; }
                onGo(`/explore?searchQuery=${enc(hit.label)}`);
                return;
              }
              onGo('/forskare');
            }}
            className="inline-flex items-center gap-1.5 self-center text-xs text-slate-400 underline decoration-slate-600 underline-offset-2 hover:text-amber-100"
          >
            {/* Forskare & källor = textlänk, inte knapp (Daniel: viktig för trovärdighet, efterfrågas av få → ska inte konkurrera). */}
            <Users className="h-3.5 w-3.5" /> {hit.entity_type === 'inscription'
              ? (sv ? 'Forskare kopplade till stenen' : "This stone's researchers")
              : (sv ? 'Forskare & källor' : 'Researchers & sources')}
          </button>
        </div>
      </div>
      <GoFurther hit={hit} onGo={onGo} sv={sv} />
      {hit.entity_type === 'god' && <GodQuestions godId={hit.entity_id} godName={hit.label} onGo={onGo} sv={sv} />}
      <RelationMindmap center={hit.label} nodes={mindNodes} onGo={onGo} sv={sv} />
    </div>
  );
};

// Homonym "vid sidan": off-topic betydelser av söksträngen (our_domain=false), avmarkerade.
// Vi hävdar vår mening i träffarna; detta noterar bara "menade du X? — fokuserar vi inte på".
// Kanonisk mening överst: när ett vardagsord har flera referenter hävdar vi vilken vi menar
// och länkar dit (t.ex. "Skansen" → friluftsmuseet på Djurgården, inte OSM-orterna/fornborgarna).
const CanonicalSense: React.FC<{ query: string; sv: boolean; onGo: (route: string) => void }> = ({ query, sv, onGo }) => {
  const { data: s } = useCanonicalSense(query);
  if (!s) return null;
  const label = sv ? s.sense_label_sv : s.sense_label_en;
  const note = sv ? s.note_sv : s.note_en;
  const inner = (
    <div className="flex items-start gap-2">
      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-amber-300" />
      <div>
        <div className="text-[11px] uppercase tracking-wide text-amber-300/80">{sv ? 'Menar du' : 'Do you mean'}</div>
        <div className="text-sm font-medium text-amber-100">{label}</div>
        {note && <div className="text-xs text-slate-400">{note}</div>}
      </div>
    </div>
  );
  return (
    <div className="border-b border-slate-800 bg-amber-500/5 px-4 py-2.5">
      {s.destination ? (
        <button onClick={() => onGo(s.destination!)} className="w-full text-left hover:opacity-90">{inner}</button>
      ) : inner}
    </div>
  );
};

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
// 'guld' (ej 'gold'): guld-temat är svensk-labelat ('Guld') men tvåspråkigt; 'guld' träffar det,
// engelska 'gold' faller under sök-golvet (fts-only + label-ankar). Byt tills tema-relevans tweakas.
// 'Rök stone' löser nu via engelska also_known_as-alias (migration 20260813160000) → 148 träffar,
// 12 bilder. Kända stenar har fått belagda engelska namn i sök-lagret, så EN-startarna fungerar.
const SUGGESTIONS_EN = ['runestone', 'Rök stone', 'guld', 'Öland', 'Birka', 'Odin', 'Thor', 'runes', 'gods', 'Sigtuna', 'Gotland', 'hillfort'];

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
          // Falla tillbaka till lexikalt search_v1 om edge:n FELAR *eller* ger TOM lista — den
          // hybrida edge:n (embedding-generering) kan svara {hits:[]}/{error} med HTTP 200, vilket
          // annars dödade sök helt (t.ex. "fornvännen"/"torekov" gav noll trots träffar i indexet).
          const arr = (data as { hits?: Hit[] } | null)?.hits;
          if (!error && Array.isArray(arr) && arr.length > 0) {
            hits = arr;
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

  // Auto-summary: i fullskärmsläget körs grounded RAG automatiskt (debounce) så en kort
  // sammanfattning visas ÖVERST innan träfflistan ("AI brukar ha summary innan resultatet").
  // Cachas i qa_cache → billigt; körs bara en gång per söksträng.
  const lastAskedRef = useRef<string>('');
  useEffect(() => {
    if (!heroActive || theme) return;
    const q = query.trim();
    // Auto-fyra BARA för frågelika sökningar (flerord eller frågetecken) — breda enordslookups
    // ("runestone", "Birka") ska INTE trigga en RAG-runda (kostar latens); klicka "Fråga AI" då.
    const looksLikeQuestion = q.includes(' ') || q.endsWith('?');
    if (q.length < 6 || !looksLikeQuestion || q === lastAskedRef.current) return;
    const id = setTimeout(() => { lastAskedRef.current = q; askAI(); }, 900);
    return () => clearTimeout(id);
  }, [query, heroActive, theme, askAI]);

  // Delad träfflista — samma innehåll i hero-dropdownen och i dialogen.
  // scrollClass styr höjden per yta: hero använder nästan hela skärmen, dialogen håller sig lägre.
  // wide=true (bara hero) → tvåkolumn: träfflista + kunskapspanel till höger.
  const renderResults = (scrollClass: string, wide = false, hideAi = false) => {
    const showPanel = wide && !!topEntity && !theme;
    const list = (
    <div className={`${scrollClass} overflow-y-auto text-left`}>
      {/* Kanonisk mening överst (t.ex. Skansen → friluftsmuseet), homonymer vid sidan under */}
      <CanonicalSense query={query} sv={sv} onGo={go} />
      {/* Homonym vid sidan — off-topic betydelser (Tor Browser etc.), avmarkerade */}
      <SideSenses query={query} sv={sv} />
      {/* AI-svar (grounded RAG) — knapp när man skrivit en fråga, sedan källfört svar.
          I 3-kolumns-overlägget (hideAi) bor summaryn i toppbaren i stället. */}
      {!hideAi && !theme && query.trim().length >= 3 && (
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
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                <Sparkles className="h-3 w-3" />{sv ? 'AI-svar · källfört' : 'AI answer · sourced'}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-[15px] text-slate-100">{aiAnswer}</p>
              {aiSources.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {sv ? 'Källor' : 'Sources'}
                  </div>
                  {/* Källkort: numrerad bricka + typ + titel + utdrag, klickbara ner till entiteten */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {aiSources.map((s, i) => {
                      const meta = META[s.entity_type];
                      if (!meta) return null;
                      const SIcon = meta.icon;
                      const snip = stripTags(s.snippet);
                      return (
                        <button
                          key={s.entity_id + i}
                          onClick={() => go(meta.route(s))}
                          className="flex items-start gap-2.5 rounded-lg border border-slate-700 bg-slate-800/40 p-2.5 text-left transition-colors hover:border-amber-500/60 hover:bg-slate-800/70"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[11px] font-semibold text-amber-300">
                            {i + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">
                              <SIcon className="h-3 w-3" />{sv ? meta.labelSv : meta.labelEn}
                            </span>
                            <span className="block truncate font-medium text-amber-100">{s.label}</span>
                            {snip && <span className="mt-0.5 block text-xs leading-snug text-slate-400 line-clamp-2">{snip}</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <p className="mt-2 text-[10px] text-slate-500">
                {sv ? 'AI-genererat ur källorna ovan — verifiera via länkarna.' : 'AI-generated from the sources above — verify via the links.'}
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
          <p>{sv ? 'Inga träffar för' : 'No matches for'} “{theme ? (sv ? theme.name : theme.name_en ?? theme.name) : query}”</p>
          {/* Tomt läge → föreslå platsen (granskningskö, verifieras mot källa). Bara för fritextsök. */}
          {!theme && query.trim().length >= 2 && <SuggestPlaceForm query={query.trim()} sv={sv} />}
        </div>
      )}

      {groups.map((g) => {
        const Icon = g.icon;
        return (
          <div key={g.type} className="py-1">
            <div className="flex items-center gap-1.5 px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <Icon className="h-3 w-3" /> {sv ? g.labelSv : g.labelEn}
              <span className="text-slate-600">· {g.rows.length}</span>
            </div>
            {g.rows.map((row) => {
              const sub = humanSub(row.title, row.subtitle);
              const snip = stripTags(row.snippet);
              // Snippet som är en HANDLINGSUPPMANING ("visa alla N inskrifter i X på kartan") är ingen
              // beskrivning — den dupliceras redan av radens klick + primärknapp. Dölj (den lästes som
              // en kapad, trasig mening när den line-clampades — Daniel).
              const isCtaSnip = /(?:visa alla|show all).*(?:på kartan|on the map)/i.test(snip || '');
              const showSnip = snip && !isCtaSnip && !snippetRedundant(snip, row.title, sub);
              return (
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
                  {/* Titel på egen rad; sublabel bryter till NY rad i st.f. ful avklippning
                      (Daniel: "Öste... radbrytning hade fixat det"). Först VAD, sedan VAR. */}
                  <span className="block font-medium text-amber-100 truncate">{row.title}</span>
                  {sub && <span className="block text-xs text-slate-400 leading-snug">{sub}</span>}
                  {showSnip && <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{snip}</p>}
                </div>
              </button>
              );
            })}
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

  // HERO: riktigt inline-sökfält. EN stabil <input>-nod för hela hero-varianten — den
  // renderas alltid vid SAMMA position i trädet (aldrig i en villkorlig gren som byts ut),
  // bara omgivningens CSS-klasser (pill vs. helskärms-topprad) växlar. Detta fixar buggen
  // "inputrutan stängs efter en bokstav / man ser inte vad man fyller i" (Daniel, rapporterad
  // två gånger): den GAMLA koden monterade en HELT NY <input autoFocus> i en separat
  // fixed-overlay så snart frågan nådde 2 tecken, vilket avmonterade fältet användaren just
  // skrev i (tappat fokus, virtuellt tangentbord stängs på mobil) och samtidigt gömde den
  // gamla pillen bakom overlayns solida bakgrund — därav "stängs"/"syns inte". Overlayn
  // öppnas nu vid FOKUS (inte vid tecken-tröskeln) och härbärgerar både förslag (tom fråga)
  // och resultat (>=2 tecken) inuti SAMMA träd, så fältet aldrig monteras om.
  if (variant === 'hero') {
    const hasResults = query.trim().length >= 2 || !!theme;
    // Helskärm slår till vid RESULTAT (>=2 tecken/tema) — precis som förut. MEN <input> ligger
    // alltid som barn nr 1 på SAMMA trädposition (pill och helskärm delar samma nod), så fältet
    // monteras aldrig om vid växlingen → det döljs aldrig och tappar aldrig fokus (Daniels bugg).
    const fullscreen = heroActive && hasResults;
    return (
      <div
        ref={heroWrapRef}
        className={fullscreen
          // z-[1500]: MÅSTE ligga över Header.tsx sticky top-0 z-[1150] — annars täcker headern
          // helskärmens EGEN topprad (sökfältet), som bara flyter upp bakom/under den globala
          // navigationen. Bekräftat i webbläsare: elementFromPoint på inputens position gav
          // Header-navets knapp, inte <input>, när z-[80] < headerns z-[1150] (Daniels bugg).
          ? 'fixed inset-0 z-[1500] flex flex-col bg-slate-900'
          : `relative w-full mx-auto transition-all ${hasResults ? 'max-w-5xl' : 'max-w-xl'}`}
      >
        {/* Sökraden — alltid barn nr 1 här, aldrig i en utbytbar gren → <input> monteras aldrig om. */}
        <div
          className={fullscreen
            ? 'shrink-0 flex items-center gap-3 border-b border-slate-700 px-4 py-3'
            : 'flex items-center gap-3 rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl focus-within:shadow-xl px-5 py-3.5 transition-shadow'}
        >
          <Search className={`h-5 w-5 shrink-0 ${fullscreen ? 'text-amber-400' : 'text-slate-400'}`} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (e.target.value) setTheme(null); }}
            onFocus={() => setHeroActive(true)}
            aria-label={sv ? 'Sök' : 'Search'}
            placeholder={sv
              ? 'Sök allt — runsten, ort, socken, gud, kung, mynt…'
              : 'Search everything — runestone, place, parish, god, king, coin…'}
            className={`flex-1 min-w-0 bg-transparent text-base outline-none ${fullscreen ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
          />
          {loading && <Loader2 className={`h-4 w-4 animate-spin shrink-0 ${fullscreen ? 'text-amber-400' : 'text-amber-500'}`} />}
          {fullscreen && (
            <button
              type="button"
              onClick={() => setHeroActive(false)}
              aria-label={sv ? 'Stäng sökning' : 'Close search'}
              className="rounded-full p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Resultat = helskärm (barn nr 2, syskon till sökraden — rör aldrig fältet ovan). */}
        {fullscreen && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* AI-summary auto ÖVERST (spänner alla kolumner) — sammanfattning före resultatet */}
            {!theme && query.trim().length >= 3 && (aiLoading || aiAnswer) && (
              <div className="shrink-0 max-h-[36vh] overflow-y-auto border-b border-slate-800 bg-slate-900 px-4 py-3 text-left">
                {aiLoading && !aiAnswer && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-400" />{sv ? 'AI läser källorna…' : 'AI reading the sources…'}
                  </div>
                )}
                {aiAnswer && (
                  <div className="text-sm text-slate-200">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                      <Sparkles className="h-3 w-3" />{sv ? 'AI-svar · källfört' : 'AI answer · sourced'}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px] text-slate-100">{aiAnswer}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{sv ? 'AI-genererat ur källorna — verifiera via träffarna.' : 'AI-generated from the sources — verify via the results.'}</p>
                  </div>
                )}
              </div>
            )}
            {/* 3 kolumner: träfflista (söksvar) · karta (platsnod) · verktyg */}
            <div className="flex-1 min-h-0 grid overflow-hidden lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_248px]">
              <div className="min-h-0 overflow-y-auto lg:border-r lg:border-slate-800">
                {renderResults('', false, true)}
              </div>
              <div className="min-h-0 overflow-y-auto">
                <AnswerContext query={query} onGo={go} onQuery={(q) => { setQuery(q); setTheme(null); }} />
              </div>
              <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-slate-800 lg:flex">
                {/* Kunskapspanelen (träffens egen destination) äger toppen. */}
                {topEntity && !theme && <KnowledgePanel hit={topEntity} thumb={thumbs[topEntity.entity_id]} onGo={go} sv={sv} />}
                {/* Runverktyget är ett fördjupningsverktyg, inte kopplat till träffen → sekundärt,
                    längst ner (Daniel: "ägde primärpositionen utan att förtjäna den"). */}
                <div className="mt-auto border-t border-slate-800 p-3">
                  <button
                    onClick={() => go('/sv/runor')}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:border-amber-500/50 hover:text-amber-100"
                  >
                    <Hammer className="h-3.5 w-3.5" /> {sv ? 'Öppna runverktyget' : 'Open the rune tool'}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* Fokuserad men <2 tecken: förslag som nedfälld panel under pillen (ingen helskärm än). */}
        {heroActive && !hasResults && (
          <div className="absolute left-0 right-0 z-[60] mt-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-3">
              <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
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
