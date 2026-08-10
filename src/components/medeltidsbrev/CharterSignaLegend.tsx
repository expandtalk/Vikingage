import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * ONLY expansions verified against Riksarkivet's official signa PDF
 * ("Förkortningar och signa i SDHK", https://riksarkivet.se/Media/pdf-filer/NAD/SDHK_Fork-o-signa.pdf)
 * — verified medeltidsbrev step 1, 2026-08-10. "odat." was requested but could NOT be
 * confirmed as an official SDHK signum in that PDF (the nearest attested forms are
 * "u.d." / "s.d." = utan datum / sine dato) and is deliberately omitted here rather
 * than guessed.
 */
const ENTRIES: { sig: string; sv: string; en: string }[] = [
  { sig: 'DS', sv: 'Diplomatarium Suecanum (Svenskt Diplomatarium), huvudserien', en: 'Diplomatarium Suecanum (the main published series)' },
  { sig: 'RPB', sv: 'Svenska Riks-Archivets Pergamentsbref från och med år 1351 (1866–1872)', en: 'Svenska Riks-Archivets Pergamentsbref, from 1351 (1866–1872)' },
  { sig: 'DK', sv: 'Diplomatarieredaktionen (före 1976: Diplomatariekommittén)', en: 'The Diplomatarium editorial office (before 1976: Diplomatariekommittén)' },
  { sig: 'RA', sv: 'Riksarkivet', en: 'The National Archives of Sweden' },
  { sig: 'UUB', sv: 'Uppsala universitetsbibliotek', en: 'Uppsala University Library' },
  { sig: 'KB', sv: 'Kungliga biblioteket, Stockholm', en: 'The National Library of Sweden, Stockholm' },
  { sig: 'or. perg.', sv: 'original på pergament', en: 'original on parchment' },
  { sig: 'vid.', sv: 'vidimation; vidimerad', en: 'vidimation; attested copy' },
  { sig: 'ppr / papp.', sv: 'papper', en: 'paper' },
  { sig: 'f. / fol.', sv: 'folium, folia (blad)', en: 'folium, folia (leaf)' },
];

const PDF_URL = 'https://riksarkivet.se/Media/pdf-filer/NAD/SDHK_Fork-o-signa.pdf';

export const CharterSignaLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
  const sv = useLanguage().language === 'sv';
  return (
    <details className={`rounded-lg border border-slate-700 bg-slate-900/50 text-sm ${className}`}>
      <summary className="cursor-pointer select-none px-3 py-2 font-semibold text-slate-300 hover:text-white">
        {sv ? 'Förkortningar & signa' : 'Abbreviations & sigla'}
      </summary>
      <div className="border-t border-slate-800 px-3 py-2 space-y-2">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
          {ENTRIES.map((e) => (
            <React.Fragment key={e.sig}>
              <dt className="whitespace-nowrap font-mono text-[hsl(var(--gold))]">{e.sig}</dt>
              <dd className="text-slate-300">{sv ? e.sv : e.en}</dd>
            </React.Fragment>
          ))}
        </dl>
        <p className="text-xs text-slate-500">
          {sv
            ? 'Källa: Riksarkivets officiella signaturlista. Endast verifierade förkortningar listas här.'
            : 'Source: Riksarkivet’s official list of sigla. Only verified abbreviations are listed here.'}{' '}
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[hsl(var(--gold))]"
          >
            {sv ? 'Fullständig lista (PDF, Riksarkivet)' : 'Full list (PDF, Riksarkivet)'}
          </a>
        </p>
      </div>
    </details>
  );
};
