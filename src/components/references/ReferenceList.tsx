import React from 'react';

// Wikipedia-stil källförteckning SIST på ett dokument. Källor är referenser här, inte egna
// destinationssidor. Numrerad; varje post får ankaret id="ref-N" så inline-fotnoter [N] kan länka hit.
// Interna platshållare ("VERIFY — …") visas aldrig publikt.
export interface RefSource { id: string; title: string; author: string | null; year: number | null; url: string | null; }

const cleanAuthor = (a: string | null): string | null => (a && /^\s*VERIFY/i.test(a) ? null : a);

export const ReferenceList: React.FC<{ sources: RefSource[]; sv: boolean; title?: string; note?: string }> = ({ sources, sv, title, note }) => {
  if (!sources.length) return null;
  return (
    <section id="references" className="mt-8 max-w-3xl scroll-mt-24">
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title ?? (sv ? 'Källor & referenser' : 'Sources & references')}</h2>
      <ol className="list-decimal space-y-1.5 pl-5">
        {sources.map((r, i) => {
          const author = cleanAuthor(r.author);
          return (
            <li key={r.id} id={`ref-${i + 1}`} className="scroll-mt-24 text-sm text-muted-foreground">
              {r.url
                ? <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="text-gold hover:underline">{r.title}</a>
                : r.title}
              {(author || r.year) && <span className="text-muted-foreground/70"> — {[author, r.year].filter(Boolean).join(', ')}</span>}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[11px] text-muted-foreground/60">
        {note ?? (sv ? 'Källor som citeras på sidan. Externa länkar öppnas i ny flik och är inte granskade av oss.' : 'Sources cited on this page. External links open in a new tab and are not vetted by us.')}
      </p>
    </section>
  );
};
