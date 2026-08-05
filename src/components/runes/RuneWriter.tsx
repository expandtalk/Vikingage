import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { transliterate, readRunes, type FutharkKind } from '@/data/futhark';
import { useVikingNames } from '@/hooks/useVikingNames';
import { Pen, Download, Info, Sun, Moon, Shield, Copy } from 'lucide-react';

// Skrivverktyg: latinsk text → runor (fonematiskt), val av futhark, dark/white, PNG/SVG-export.
// Glyfer = Unicode Runic (renderas med systemets runfont, som resten av sajten). Transparent:
// visar hur varje tecken mappades. Hederlighet: translittererings-hjälpmedel, inte historisk stavning.

const RUNE_FONT = '"Noto Sans Runic","Segoe UI Historic","Segoe UI Symbol","Apple Symbols",serif';

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const RuneWriter: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const L = (sv: string, e: string) => (en ? e : sv);
  const [text, setText] = useState('');
  const [kind, setKind] = useState<FutharkKind>('younger');
  const [dark, setDark] = useState(true);
  const [showSteps, setShowSteps] = useState(false);
  const [dir, setDir] = useState<'write' | 'read'>('write');
  const [copied, setCopied] = useState(false);

  const { runes, steps } = useMemo(() => transliterate(text, kind), [text, kind]);
  const read = useMemo(() => readRunes(text, kind), [text, kind]);
  const bg = dark ? '#0f172a' : '#ffffff';
  const fg = dark ? '#f5d78b' : '#1e293b';

  // Namnigenkänning: matcha ETT ord mot viking_names (moderna nordiska namnformer + betydelse).
  // Ärligt: detta är igenkänning + betydelse, INTE en attesterad runstavning från en viss sten.
  const { data: names } = useVikingNames();
  const nameIndex = useMemo(() => {
    const m = new Map<string, { name: string; meaning: string }>();
    (names ?? []).forEach((n) => { if (n?.name) m.set(n.name.trim().toLowerCase(), { name: n.name, meaning: n.meaning || '' }); });
    return m;
  }, [names]);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const known = words.length === 1
    ? (nameIndex.get(words[0].toLowerCase()) || nameIndex.get(words[0].toLowerCase().replace(/(ur|r)$/, '')) || null)
    : null;

  const measure = (s: string, fontPx: number) => {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return s.length * fontPx;
    ctx.font = `${fontPx}px ${RUNE_FONT}`;
    return Math.ceil(ctx.measureText(s).width);
  };

  const exportPNG = () => {
    if (!runes) return;
    const fontPx = 72, pad = 48;
    const w = Math.max(240, measure(runes, fontPx) + pad * 2);
    const h = fontPx + pad * 2;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fg;
    ctx.font = `${fontPx}px ${RUNE_FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(runes, pad, h / 2);
    canvas.toBlob((blob) => { if (blob) download(blob, 'runor.png'); }, 'image/png');
  };

  const exportSVG = () => {
    if (!runes) return;
    const fontPx = 72, pad = 48;
    const w = Math.max(240, measure(runes, fontPx) + pad * 2);
    const h = fontPx + pad * 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
      + `<rect width="100%" height="100%" fill="${bg}"/>`
      + `<text x="${pad}" y="${h / 2}" dominant-baseline="middle" font-family='${RUNE_FONT.replace(/"/g, "'")}' font-size="${fontPx}" fill="${fg}">${runes}</text>`
      + `</svg>`;
    download(new Blob([svg], { type: 'image/svg+xml' }), 'runor.svg');
  };

  const honesty = L(
    'Yngre futharken är mångtydig (k=k/g, t=t/d, b=b/p, u=u/o/y/v, i=i/e/j) — normaliserad återgivning/tolkning, inte en attesterad stavning.',
    'The Younger Futhark is ambiguous (k=k/g, t=t/d, b=b/p, u=u/o/y/v, i=i/e/j) — a normalised rendering/reading, not an attested spelling.',
  );

  // Kopiera resultatet som TEXT (att dela eller mata in i en AI för vidare analys) — med
  // ärlighets-noten inbakad så mottagaren/AI:n vet att yngre futharken är mångtydig.
  const copyText = async () => {
    const fut = kind === 'younger' ? L('Yngre futharken', 'Younger Futhark') : L('Äldre futharken', 'Elder Futhark');
    const body = dir === 'write'
      ? `${L('Futhark', 'Futhark')}: ${fut}\n${L('Latinsk text', 'Latin text')}: ${text}\n${L('Runor', 'Runes')}: ${runes}\n${L('Translitteration', 'Transliteration')}: ${steps.map((s) => s.rune || '∅').join(' ')}\n${L('Obs', 'Note')}: ${honesty}`
      : `${L('Futhark', 'Futhark')}: ${fut}\n${L('Runor', 'Runes')}: ${text}\n${L('Möjliga ljud per runa', 'Possible sounds per rune')}: ${read.cells.filter((c) => c.rune !== ' ').map((c) => `${c.rune}=${c.values.join('/')}`).join('  ')}\n${L('Normaliserad läsning', 'Normalised reading')}: ${read.candidate}\n${L('Obs', 'Note')}: ${honesty}`;
    try { await navigator.clipboard.writeText(body); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard ej tillgänglig */ }
  };

  const seg = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded-md transition-colors ${active ? 'bg-gold text-slate-900 font-semibold' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <section className="mb-10 rounded-xl border border-gold/30 bg-card/50 p-5">
      <h2 className="text-2xl font-semibold text-gold mb-1 flex items-center gap-2">
        <Pen className="h-5 w-5" /> {L('Runverktyg — skriv & läs', 'Rune tool — write & read')}
      </h2>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {L('Skriv latinsk text → runor, eller klistra in runor → möjliga ljud. Kopiera resultatet som text att dela eller analysera vidare (t.ex. i en AI) — eller ladda ner en bild.',
          'Write Latin text → runes, or paste runes → possible sounds. Copy the result as text to share or analyse further (e.g. in an AI) — or download an image.')}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Riktning: skriv/läs */}
        <div className="inline-flex rounded-lg border border-border bg-background/50 p-0.5">
          <button className={seg(dir === 'write')} onClick={() => setDir('write')}>{L('Skriv → runor', 'Write → runes')}</button>
          <button className={seg(dir === 'read')} onClick={() => setDir('read')}>{L('Läs runor', 'Read runes')}</button>
        </div>
        {/* Futhark-val */}
        <div className="inline-flex rounded-lg border border-border bg-background/50 p-0.5">
          <button className={seg(kind === 'younger')} onClick={() => setKind('younger')}>{L('Yngre futharken', 'Younger Futhark')}</button>
          <button className={seg(kind === 'elder')} onClick={() => setKind('elder')}>{L('Äldre futharken', 'Elder Futhark')}</button>
        </div>
        {/* Tema */}
        <button
          onClick={() => setDark((d) => !d)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground"
        >
          {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {dark ? L('Mörkt', 'Dark') : L('Ljust', 'Light')}
        </button>
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={dir === 'write' ? L('Skriv text här…', 'Type text here…') : L('Klistra in runor här… (t.ex. ᛏᛁᚴᛋᛏ)', 'Paste runes here… (e.g. ᛏᛁᚴᛋᛏ)')}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground outline-none focus:border-gold/60 mb-3"
        style={dir === 'read' ? { fontFamily: RUNE_FONT } : undefined}
        maxLength={dir === 'read' ? 300 : 120}
      />

      {/* Namnigenkänning (bara skrivläge) — igenkänning + betydelse, ej attesterad runstavning */}
      {dir === 'write' && known && (
        <div className="flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/5 px-3 py-2 mb-3 text-xs">
          <Shield className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <span className="text-muted-foreground">
            {L('Känt vikingatida namn', 'A known Viking-age name')}: <strong className="text-gold">{known.name}</strong>
            {known.meaning ? ` — ${known.meaning}` : ''}.
            <span className="opacity-70"> {L('(Igenkänt namn med betydelse — inte en attesterad runstavning från en specifik sten.)', '(Recognised name with meaning — not an attested runic spelling from a specific stone.)')}</span>
          </span>
        </div>
      )}

      {dir === 'write' ? (
        <>
          {/* Förhandsvisning (runor, samma färger som exporten) */}
          <div className="rounded-lg border border-border overflow-x-auto flex items-center min-h-[96px] px-6 py-4 mb-3" style={{ background: bg }}>
            <span style={{ fontFamily: RUNE_FONT, fontSize: 56, color: fg, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              {runes || <span style={{ color: dark ? '#475569' : '#cbd5e1', fontFamily: 'inherit', fontSize: 18 }}>{L('Förhandsvisning', 'Preview')}</span>}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button onClick={exportPNG} disabled={!runes} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gold text-slate-900 font-semibold disabled:opacity-40"><Download className="h-4 w-4" /> PNG</button>
            <button onClick={exportSVG} disabled={!runes} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gold/50 text-gold disabled:opacity-40"><Download className="h-4 w-4" /> SVG</button>
            <button onClick={copyText} disabled={!runes} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"><Copy className="h-4 w-4" /> {copied ? L('Kopierad!', 'Copied!') : L('Kopiera text', 'Copy text')}</button>
            {steps.length > 0 && (
              <button onClick={() => setShowSteps((s) => !s)} className="text-xs text-muted-foreground hover:text-foreground underline ml-1">
                {showSteps ? L('Dölj hur det mappades', 'Hide mapping') : L('Visa hur det mappades', 'Show how it mapped')}
              </button>
            )}
          </div>
          {showSteps && steps.length > 0 && (
            <div className="rounded-lg border border-border bg-background/40 p-3 mb-3">
              <div className="flex flex-wrap gap-2">
                {steps.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded border border-border/70 bg-card/60 px-2 py-1 text-xs">
                    <span className="text-muted-foreground">{s.input}</span>
                    <span className="text-muted-foreground">→</span>
                    <span style={{ fontFamily: RUNE_FONT }} className="text-gold text-base">{s.rune || '∅'}</span>
                    {(en ? s.noteEn : s.noteSv) && <span className="text-[10px] text-muted-foreground/70">({en ? s.noteEn : s.noteSv})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Läsläge: normaliserad läsning + per-runa möjliga ljud (mångtydigheten synlig) */}
          <div className="rounded-lg border border-border px-4 py-3 mb-3" style={{ background: bg }}>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: dark ? '#64748b' : '#94a3b8' }}>{L('Normaliserad läsning', 'Normalised reading')}</div>
            <div style={{ color: fg, fontSize: 22, lineHeight: 1.3, wordBreak: 'break-word' }}>
              {read.candidate || <span style={{ color: dark ? '#475569' : '#cbd5e1', fontSize: 16 }}>{L('Klistra in runor ovan', 'Paste runes above')}</span>}
            </div>
          </div>
          {read.cells.some((c) => c.rune !== ' ') && (
            <div className="rounded-lg border border-border bg-background/40 p-3 mb-3">
              <div className="flex flex-wrap gap-1.5">
                {read.cells.map((c, i) => c.rune === ' '
                  ? <span key={i} className="w-3" aria-hidden />
                  : (
                    <span key={i} className="inline-flex flex-col items-center rounded border border-border/70 bg-card/60 px-2 py-1">
                      <span style={{ fontFamily: RUNE_FONT }} className="text-gold text-xl leading-none">{c.rune}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{c.values.join('/')}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button onClick={copyText} disabled={!read.candidate} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gold text-slate-900 font-semibold disabled:opacity-40"><Copy className="h-4 w-4" /> {copied ? L('Kopierad!', 'Copied!') : L('Kopiera text för analys', 'Copy text for analysis')}</button>
          </div>
        </>
      )}

      {/* Hederlighets-brasklapp (mode-anpassad) */}
      <p className="text-[11px] text-muted-foreground/80 flex items-start gap-2 leading-relaxed">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          {dir === 'write'
            ? L('Translittererings-hjälpmedel — ljud översätts till runor, inte bokstav för bokstav. Yngre futharken har bara 16 runor, så flera ljud delar runa (k även g, t även d, u även o/y/v). Det är alltså inte ett påstående om att texten historiskt skrevs exakt så.',
                'A transliteration aid — sounds are mapped to runes, not letter-by-letter. The Younger Futhark has only 16 runes, so several sounds share a rune (k also g, t also d, u also o/y/v). It is not a claim that the text was historically written exactly this way.')
            : L('Tolknings-hjälpmedel — yngre futharken är mångtydig, så en runa kan läsas som flera ljud (visas per runa ovan). Den normaliserade läsningen tar första värdet; verklig tolkning kräver kontext, språk och ofta jämförelse med etablerade läsningar. Kopiera texten för att diskutera eller analysera vidare (t.ex. i en AI) — behandla den som utgångspunkt, inte facit.',
                'A reading aid — the Younger Futhark is ambiguous, so a rune can be read as several sounds (shown per rune above). The normalised reading takes the first value; a real interpretation needs context, language and often comparison with established readings. Copy the text to discuss or analyse further (e.g. in an AI) — treat it as a starting point, not the answer.')}
        </span>
      </p>
    </section>
  );
};
