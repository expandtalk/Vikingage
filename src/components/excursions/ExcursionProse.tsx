import React from 'react';
import { Link } from 'react-router-dom';

// Lättviktig, säker renderare för utflykternas detaljtext. Stödjer:
//   "## Rubrik"      → <h2>
//   tom rad          → nytt stycke
//   [text](/url)     → länk (intern = <Link>, extern = <a target=_blank>)
// Ingen HTML-injektion: vi bygger React-noder ur ren text, inget dangerouslySet.

const linkify = (text: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, label, href] = m;
    if (/^https?:\/\//.test(href)) {
      out.push(<a key={i++} href={href} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{label}</a>);
    } else {
      out.push(<Link key={i++} to={href} className="text-gold hover:underline">{label}</Link>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

// Ren teaser för listkort/meta: droppa ## rubriker, avmarkera [text](url) → text.
export const excerptText = (text: string): string =>
  text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b && !b.startsWith('## '))
    .join(' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

// Metabeskrivning ≤ maxLen tecken. Google klipper längre beskrivningar mitt i en mening med "…";
// här kapas i stället vid en HEL mening om möjligt (punkt/!/? nära slutet), annars vid sista hela
// ord. Aldrig mitt i ett ord. Används av utflykternas <meta name="description">.
export const metaText = (text: string, maxLen = 160): string => {
  const s = excerptText(text);
  if (s.length <= maxLen) return s;
  const slice = s.slice(0, maxLen);
  const sentenceEnd = Math.max(
    slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '),
  );
  if (sentenceEnd >= maxLen * 0.6) return slice.slice(0, sentenceEnd + 1).trim();
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(/[\s.,;:–—-]+$/, '') + '…';
};

export const ExcursionProse: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  // Radbaserad parser: en '## '-rad blir ALLTID egen rubrik (även utan tom rad
  // runt den); mellanliggande rader buffras till stycken, tom rad bryter stycke.
  type Node = { kind: 'h2'; text: string } | { kind: 'p'; lines: string[] };
  const nodes: Node[] = [];
  let buf: string[] = [];
  const flush = () => { if (buf.length) { nodes.push({ kind: 'p', lines: buf }); buf = []; } };
  for (const raw of text.split('\n')) {
    const ln = raw.trimEnd();
    if (ln.trim().startsWith('## ')) { flush(); nodes.push({ kind: 'h2', text: ln.trim().slice(3).trim() }); }
    else if (ln.trim() === '') flush();
    else buf.push(ln.trim());
  }
  flush();

  return (
    <div className={className}>
      {nodes.map((n, i) =>
        n.kind === 'h2' ? (
          <h2 key={i} className="text-xl font-semibold text-gold mt-7 mb-2 first:mt-0">{linkify(n.text)}</h2>
        ) : (
          <p key={i} className="text-slate-200 leading-relaxed mb-3">
            {n.lines.map((l, j) => (
              <React.Fragment key={j}>{linkify(l)}{j < n.lines.length - 1 && <br />}</React.Fragment>
            ))}
          </p>
        )
      )}
    </div>
  );
};
