import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollText } from 'lucide-react';

// KG-sektion: medeltidsbrev (SDHK) länkade till en entitet via charter_mentions.
// Datadriven — visas var som helst en entity_id (uuid) finns. Fas 1: role='issued' (utfärdandeort).
// Källa: SDHK, Riksarkivet, CC BY 4.0.

interface CharterKgRow {
  sdhk_id: number; year: number | null; date_raw: string | null;
  place_raw: string | null; summary: string | null; role: string; confidence: string;
}

const rpc = (fn: string, args: Record<string, unknown>) => (supabase as any).rpc(fn, args);

interface Props {
  /** entity_registry / kanonisk UUID för entiteten (t.ex. town). */
  entityId: string;
  /** Visningsnamn för entiteten (utan parentes-suffix). */
  name: string;
  /** Max antal brev att hämta. Default 200. */
  limit?: number;
  className?: string;
}

const INITIAL = 12;

export const CharterKgSection: React.FC<Props> = ({ entityId, name, limit = 200, className }) => {
  const sv = useLanguage().language === 'sv';
  const [expanded, setExpanded] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ['charters-for-entity', entityId, limit],
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<CharterKgRow[]> => {
      const { data, error } = await rpc('charters_for_entity', { p_entity_id: entityId, p_limit: limit });
      if (error) throw error;
      return (data ?? []) as CharterKgRow[];
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{sv ? 'Laddar medeltidsbrev…' : 'Loading charters…'}</p>;
  }
  if (data.length === 0) return null;

  const base = sv ? '/sv/medeltidsbrev' : '/en/medieval-charters';
  const shown = expanded ? data : data.slice(0, INITIAL);
  const years = data.map((d) => d.year).filter((y): y is number => y != null);
  const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : null;

  return (
    <section className={className}>
      <h2 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
        <ScrollText className="h-5 w-5 text-gold" />
        {sv ? `Medeltidsbrev utfärdade i ${name}` : `Medieval charters issued at ${name}`}
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        {sv
          ? `${data.length} brev i Svenskt Diplomatariums huvudkartotek (SDHK)${span ? `, ${span}` : ''}. Länkade på utfärdandeort.`
          : `${data.length} charters in the Swedish Diplomatarium (SDHK)${span ? `, ${span}` : ''}. Linked by place of issue.`}
      </p>

      <ul className="divide-y divide-border/50 rounded-md border border-border/50 bg-card/40">
        {shown.map((c) => (
          <li key={c.sdhk_id} className="px-3 py-2">
            <Link to={`${base}/${c.sdhk_id}`} className="group flex gap-3 items-baseline">
              <span className="text-gold font-mono text-sm shrink-0 w-12 tabular-nums">{c.year ?? '—'}</span>
              <span className="text-sm text-foreground/90 group-hover:text-gold line-clamp-2">
                {c.summary || (sv ? '(regest saknas)' : '(no abstract)')}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {data.length > INITIAL && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm text-gold hover:underline"
        >
          {expanded
            ? (sv ? 'Visa färre' : 'Show fewer')
            : (sv ? `Visa alla ${data.length} brev` : `Show all ${data.length} charters`)}
        </button>
      )}

      <p className="text-[11px] text-muted-foreground/70 mt-3">
        {sv
          ? 'Källa: Svenskt Diplomatariums huvudkartotek (SDHK), Riksarkivet · CC BY 4.0. Länkningen är maskinell (exakt ortmatch, geografiskt utländska/hanseatiska brev exkluderade) och verifierbar.'
          : 'Source: Swedish Diplomatarium (SDHK), National Archives of Sweden · CC BY 4.0. Links are machine-generated (exact place match, foreign/Hanseatic charters excluded) and verifiable.'}
      </p>
    </section>
  );
};

export default CharterKgSection;
