import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Layers, ScrollText, ExternalLink } from 'lucide-react';

// /sv/ortnamn "Äldsta belägg" — TVÅAXEL (källkritik, Daniel: belägg ≠ namnålder).
//  AXEL A (belägg): NÄR namnet först SKREVS (år + belagd form + källa/källtyp).
//  AXEL B (skikt/motiv): ledens språklager + motiv + period_stratum — visar att namnet ofta är
//  mycket äldre än sitt första belägg. De blandas ALDRIG ihop.

interface Stratum { key: string; label: string; lang: string | null; activity: string | null; stratum: string | null; strength: string | null }
interface Row {
  name: string; lat: number; lng: number; year: number;
  attested_form: string | null; attestation_source: string | null; source_type: string;
  element_keys: string[] | null; strata: Stratum[];
}
interface SrcCount { source_type: string; n: number }

const SRC: Record<string, { sv: string; en: string; cls: string }> = {
  runsten: { sv: 'Runsten', en: 'Runestone', cls: 'border-amber-500/60 bg-amber-950/40 text-amber-200' },
  sdhk:    { sv: 'Medeltidsbrev', en: 'Charter', cls: 'border-violet-500/50 bg-violet-950/30 text-violet-200' },
  isof:    { sv: 'Isof', en: 'Isof', cls: 'border-sky-500/50 bg-sky-950/30 text-sky-200' },
  sol:     { sv: 'SOL 2003', en: 'SOL 2003', cls: 'border-slate-500/50 bg-slate-800/50 text-slate-200' },
  övrig:   { sv: 'Övrigt', en: 'Other', cls: 'border-slate-600 bg-slate-800/40 text-slate-300' },
};
// Språklager → läsbart (urnordiska = det äldsta).
const LANG: Record<string, string> = {
  proto_norse: 'urnordiska', old_norse: 'fornnordiska', pie: 'urindoeuropeiskt',
  low_german: 'medellågtyska', latin: 'latin', sami: 'samiska', finnic: 'finska/meänkieli',
  baltic: 'baltiskt', slavic: 'slaviskt', unknown: 'okänt',
};
const ACT: Record<string, string> = {
  settlement: 'bebyggelse', cult: 'kult', seafaring: 'sjöfart', shipbuilding: 'skeppsbyggnad',
  administration: 'administration/organisation', topographic: 'topografiskt', communication: 'kommunikation',
  trade: 'handel', defence: 'försvar', agriculture: 'jordbruk', personal_name: 'personnamn',
};
// Pekar leden på ett skikt ÄLDRE än belägget? (urnordiska, eller järnålder/vikingatid-stratum.)
const DEEP = /urnordis|järnålder|vikingat|vendel|folkvandring|förhistor|proto/i;
const isDeep = (s: Stratum) => s.lang === 'proto_norse' || DEEP.test(s.stratum || '');

export const OldestAttestations: React.FC<{ sv: boolean }> = ({ sv }) => {
  const [src, setSrc] = useState<string>('all');

  const { data: counts = [] } = useQuery({
    queryKey: ['attestation-source-counts'], staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<SrcCount[]> => {
      const { data } = await (supabase as any).rpc('attestation_source_counts');
      return (data ?? []) as SrcCount[];
    },
  });
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['oldest-attestations', src], staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Row[]> => {
      const { data } = await (supabase as any).rpc('oldest_attestations', { p_limit: 300, p_source: src });
      return (data ?? []) as Row[];
    },
  });
  const total = useMemo(() => counts.reduce((a, c) => a + Number(c.n), 0), [counts]);

  return (
    <section className="text-left">
      {/* Tvåklocks-förklaringen — källkritikens kärna. */}
      <div className="mb-5 rounded-lg border border-amber-700/40 bg-amber-950/15 p-4">
        <h3 className="mb-1 flex items-center gap-2 font-semibold text-amber-200">
          <Clock className="h-4 w-4" /> {sv ? 'Två klockor — belägg är inte namnålder' : 'Two clocks — attestation is not name-age'}
        </h3>
        <p className="text-sm leading-relaxed text-slate-300">
          {sv
            ? 'Belägg = när namnet först skrevs ner (nedan, per källa). Namnålder = när namnet myntades — nästan alltid mycket äldre. En latinsk medeltidsform (t.ex. Myriby 1283) är en skrivform, inte namnets ålder eller språk. Ledens skikt (Axel B) pekar mot djuptiden.'
            : 'Attestation = when the name was first written (below, by source). Name-age = when it was coined — usually far older. A Latin medieval form is a scribal form, not the name’s age or language. The element stratum (Axis B) points to deep time.'}
        </p>
      </div>

      {/* Källfilter (Axel A) */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button onClick={() => setSrc('all')} aria-pressed={src === 'all'}
          className={`rounded-full border px-3 py-1 text-xs ${src === 'all' ? 'border-gold bg-gold/15 text-gold font-medium' : 'border-border/70 text-muted-foreground hover:text-foreground'}`}>
          {sv ? 'Alla' : 'All'} <span className="tabular-nums text-muted-foreground/70">{total}</span>
        </button>
        {counts.map((c) => {
          const s = SRC[c.source_type] ?? SRC.övrig;
          return (
            <button key={c.source_type} onClick={() => setSrc(c.source_type)} aria-pressed={src === c.source_type}
              className={`rounded-full border px-3 py-1 text-xs ${src === c.source_type ? 'border-gold bg-gold/15 text-gold font-medium' : 'border-border/70 text-muted-foreground hover:text-foreground'}`}>
              {sv ? s.sv : s.en} <span className="tabular-nums text-muted-foreground/70">{Number(c.n)}</span>
            </button>
          );
        })}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>}

      <ul role="list" className="space-y-2">
        {rows.map((r, i) => {
          const s = SRC[r.source_type] ?? SRC.övrig;
          const deep = (r.strata ?? []).some(isDeep);
          return (
            <li key={`${r.name}-${r.year}-${i}`} className="rounded-lg border border-border bg-card/40 p-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {/* AXEL A */}
                <span className="text-lg font-bold tabular-nums text-gold">{r.year}</span>
                <span className="font-semibold text-foreground">{r.name}</span>
                {r.attested_form && <span className="italic text-amber-100/90">”{r.attested_form}”</span>}
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${s.cls}`}>{sv ? s.sv : s.en}</span>
                {r.source_type === 'runsten' && (
                  <Link to={`/sv/runinskrifter?q=${encodeURIComponent(r.name)}`}
                    className="inline-flex items-center gap-0.5 text-[11px] text-amber-300 hover:text-amber-100">
                    <ScrollText className="h-3 w-3" /> {sv ? 'stenen' : 'the stone'}
                  </Link>
                )}
              </div>
              {r.attestation_source && (
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/80 line-clamp-1">{r.attestation_source}</p>
              )}
              {/* AXEL B */}
              {(r.strata?.length ?? 0) > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2">
                  <Layers className="h-3.5 w-3.5 text-sky-300/80" aria-hidden />
                  {r.strata.map((st) => (
                    <span key={st.key} className="rounded-full border border-sky-800/50 bg-sky-950/20 px-2 py-0.5 text-[10px] text-sky-100/90">
                      {st.label}
                      {st.lang && <span className="text-sky-300/70"> · {LANG[st.lang] ?? st.lang}</span>}
                      {st.activity && <span className="text-sky-300/60"> · {ACT[st.activity] ?? st.activity}</span>}
                    </span>
                  ))}
                  {deep && (
                    <span className="text-[10px] text-emerald-300/90">
                      {sv ? '→ ledet pekar på ett äldre skikt än belägget' : '→ element points to a stratum older than the attestation'}
                    </span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[11px] text-muted-foreground/70">
        {sv
          ? 'Axel A (belägg): place_names, tidigast-över-källor (runsten < medeltidsbrev < Isof). Axel B (skikt/motiv): härlett ur ortnamnsleden. Källkritik: belägg och namnålder hålls isär.'
          : 'Axis A (attestation): place_names, earliest-across-sources. Axis B (stratum/motive): derived from name elements. The two clocks are kept apart.'}
      </p>
    </section>
  );
};

export default OldestAttestations;
