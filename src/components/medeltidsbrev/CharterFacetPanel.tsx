import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCharterFacetCounts } from '@/hooks/useMedievalCharters';
import type { FacetFilter } from '@/hooks/medievalCharterFacetArgs';

/**
 * Group order + Swedish/English labels. Deliberately small and static — which
 * VALUES exist inside each group (and their counts) come live from
 * useCharterFacetCounts, never hardcoded here, so the panel tracks the DB
 * (charter_tag_rules / charter_tags) without a code change when rules change.
 */
export const FACET_GROUPS: { key: string; sv: string; en: string }[] = [
  { key: 'aktor', sv: 'Aktör', en: 'Actor' },
  { key: 'aktyp', sv: 'Aktyp', en: 'Act type' },
  { key: 'sprak', sv: 'Språk', en: 'Language' },
  { key: 'akthet', sv: 'Äkthet', en: 'Authenticity' },
  { key: 'geo', sv: 'Geo', en: 'Geo' },
  { key: 'konroll', sv: 'Kön/roll', en: 'Gender/role' },
  { key: 'meta', sv: 'Övrigt', en: 'Other' },
];

// Display labels for known facet values (facett.varde -> {sv,en}). Purely
// cosmetic — a value missing here still renders (fallback: varde with
// underscores replaced by spaces), it just won't have a curated label yet.
const VALUE_LABELS: Record<string, { sv: string; en: string }> = {
  'aktor.pave': { sv: 'Påve', en: 'Pope' },
  'aktor.kung': { sv: 'Kung', en: 'King' },
  'aktor.kyrkohierarki': { sv: 'Kyrkohierarki', en: 'Church hierarchy' },
  'aktor.kloster': { sv: 'Kloster', en: 'Monastery' },
  'aktor.stad_stadsrad': { sv: 'Stad/stadsråd', en: 'Town/town council' },
  'aktor.gille': { sv: 'Gille', en: 'Guild' },
  'aktor.harad_ting': { sv: 'Härad/ting', en: 'Hundred/thing' },
  'aktor.socken': { sv: 'Socken', en: 'Parish' },
  'aktor.privat_fralse': { sv: 'Privat/frälse', en: 'Private/nobility' },

  'aktyp.jordtransaktion': { sv: 'Jordtransaktion', en: 'Land transaction' },
  'aktyp.testamente': { sv: 'Testamente', en: 'Testament' },
  'aktyp.dom_tvist': { sv: 'Dom/tvist', en: 'Judgment/dispute' },
  'aktyp.fred_forbund': { sv: 'Fred/förbund', en: 'Peace/alliance' },
  'aktyp.privilegium_reform': { sv: 'Privilegium/reform', en: 'Privilege/reform' },
  'aktyp.skatt': { sv: 'Skatt', en: 'Tax' },
  'aktyp.stadfastelse': { sv: 'Stadfästelse', en: 'Confirmation' },
  'aktyp.vidimation': { sv: 'Vidimation', en: 'Attested copy' },

  'sprak.svenska': { sv: 'Svenska', en: 'Swedish' },
  'sprak.latin': { sv: 'Latin', en: 'Latin' },
  'sprak.medellagtyska': { sv: 'Medellågtyska', en: 'Middle Low German' },
  'sprak.danska': { sv: 'Danska', en: 'Danish' },
  'sprak.norska': { sv: 'Norska', en: 'Norwegian' },
  'sprak.nederlandska': { sv: 'Nederländska', en: 'Dutch' },
  'sprak.franska': { sv: 'Franska', en: 'French' },

  'akthet.forfalskning': { sv: 'Förfalskning', en: 'Forgery' },
  'akthet.omtvistad': { sv: 'Omtvistad', en: 'Disputed' },

  'geo.hansan': { sv: 'Hansan', en: 'Hanseatic League' },
  'geo.utland': { sv: 'Utland', en: 'Abroad' },

  'konroll.kvinna_omnamnd': { sv: 'Kvinna omnämnd', en: 'Woman mentioned' },
  'konroll.anka': { sv: 'Änka', en: 'Widow' },
  'konroll.kvinnors_rattshandling': { sv: 'Kvinnors rättshandling', en: "Women's legal act" },

  'meta.oklassificerad': { sv: 'Oklassificerad', en: 'Unclassified' },
};

function valueLabel(facett: string, varde: string, sv: boolean): string {
  const hit = VALUE_LABELS[`${facett}.${varde}`];
  if (hit) return sv ? hit.sv : hit.en;
  return varde.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

export interface CharterFacetPanelProps {
  value: FacetFilter;
  onChange: (next: FacetFilter) => void;
  q?: string | null;
  className?: string;
}

export const CharterFacetPanel: React.FC<CharterFacetPanelProps> = ({ value, onChange, q, className = '' }) => {
  const sv = useLanguage().language === 'sv';
  const { data: counts = [], isFetching } = useCharterFacetCounts({ ...value, q: q ?? null });

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(FACET_GROUPS.map((g) => [g.key, true])),
  );

  const byFacett = useMemo(() => {
    const m: Record<string, { varde: string; n: number }[]> = {};
    for (const c of counts) {
      (m[c.facett] ??= []).push({ varde: c.varde, n: Number(c.n) });
    }
    return m;
  }, [counts]);

  const activeFacetCount = Object.values(value.facets ?? {}).reduce((s, v) => s + v.length, 0);
  const hasYearFilter = value.yearFrom != null || value.yearTo != null;
  const hasAnyFilter = activeFacetCount > 0 || hasYearFilter;

  const toggleValue = (facett: string, varde: string) => {
    const current = value.facets[facett] ?? [];
    const nextValues = current.includes(varde) ? current.filter((v) => v !== varde) : [...current, varde];
    const facets = { ...value.facets };
    if (nextValues.length > 0) facets[facett] = nextValues; else delete facets[facett];
    onChange({ ...value, facets });
  };

  const setYear = (edge: 'yearFrom' | 'yearTo', raw: string) => {
    const n = raw.trim() === '' ? null : Number(raw);
    onChange({ ...value, [edge]: n != null && Number.isFinite(n) ? n : null });
  };

  const reset = () => onChange({ facets: {}, yearFrom: null, yearTo: null });

  const label = sv
    ? { title: 'Filtrera brev', clear: 'Rensa filter', from: 'Från år', to: 'Till år', loading: 'Uppdaterar antal…' }
    : { title: 'Filter charters', clear: 'Clear filters', from: 'From year', to: 'To year', loading: 'Updating counts…' };

  return (
    <div className={`space-y-3 ${className}`} aria-busy={isFetching}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{label.title}</h2>
        <button
          type="button"
          onClick={reset}
          disabled={!hasAnyFilter}
          className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] disabled:opacity-40"
        >
          {label.clear}
        </button>
      </div>

      {/* Year range */}
      <fieldset className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {sv ? 'Årtal' : 'Year'}
        </legend>
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor="facet-year-from" className="text-xs text-slate-400">{label.from}</label>
          <input
            id="facet-year-from"
            type="number"
            inputMode="numeric"
            value={value.yearFrom ?? ''}
            onChange={(e) => setYear('yearFrom', e.target.value)}
            className="w-20 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-[hsl(var(--gold))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]"
          />
          <label htmlFor="facet-year-to" className="text-xs text-slate-400">{label.to}</label>
          <input
            id="facet-year-to"
            type="number"
            inputMode="numeric"
            value={value.yearTo ?? ''}
            onChange={(e) => setYear('yearTo', e.target.value)}
            className="w-20 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-[hsl(var(--gold))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]"
          />
        </div>
      </fieldset>

      {FACET_GROUPS.map((group) => {
        const selected = value.facets[group.key] ?? [];
        const liveValues = byFacett[group.key] ?? [];
        // Union of live (counted) values and any currently-selected value that
        // dropped out of the live result (e.g. contradictory combination) —
        // otherwise the user couldn't see/uncheck it from the panel anymore.
        const seen = new Set(liveValues.map((v) => v.varde));
        const rows = [
          ...liveValues,
          ...selected.filter((v) => !seen.has(v)).map((v) => ({ varde: v, n: 0 })),
        ];
        if (rows.length === 0) return null;
        const open = openGroups[group.key] ?? true;

        return (
          <Collapsible key={group.key} open={open} onOpenChange={(o) => setOpenGroups((s) => ({ ...s, [group.key]: o }))} asChild>
            <fieldset className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <legend className="w-full px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]">
                  <span>{sv ? group.sv : group.en}{selected.length > 0 && (
                    <span className="ml-1.5 rounded bg-[hsl(var(--gold))]/20 px-1.5 py-0.5 text-[10px] text-[hsl(var(--gold))]">{selected.length}</span>
                  )}</span>
                  {open ? <ChevronDown className="h-3.5 w-3.5" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
                </CollapsibleTrigger>
              </legend>
              <CollapsibleContent className="mt-2 space-y-1.5">
                {rows.map((r) => {
                  const id = `facet-${group.key}-${r.varde}`;
                  const checked = selected.includes(r.varde);
                  return (
                    <div key={r.varde} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={() => toggleValue(group.key, r.varde)}
                      />
                      <label htmlFor={id} className="flex-1 cursor-pointer text-sm text-slate-300">
                        {valueLabel(group.key, r.varde, sv)}
                      </label>
                      <span className="text-xs tabular-nums text-slate-500">{r.n.toLocaleString(sv ? 'sv-SE' : 'en')}</span>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </fieldset>
          </Collapsible>
        );
      })}

      <p className="sr-only" aria-live="polite">
        {isFetching ? label.loading : ''}
      </p>
    </div>
  );
};

export default CharterFacetPanel;
