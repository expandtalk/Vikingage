import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

// "Hitta boken" — ISBN-nyckeln → söklänk hos en handlare. STEG 0 (bok-kommers): INGEN affiliate
// ännu. URL:en är medvetet centraliserad här så att steg 1 (lägg på affiliate-ID) blir en
// enradsändring på ETT ställe. Neutralt märkt som extern länk; hålls visuellt skilt från
// forsknings-/källinformationen så plattformens trovärdighet inte naggas.
export const bookSearchUrl = (isbn?: string | null, title?: string | null): string => {
  const q = (isbn && isbn.trim()) || (title && title.trim()) || '';
  return `https://www.adlibris.com/se/sok?q=${encodeURIComponent(q)}`;
};

export const FindBookLink: React.FC<{
  isbn?: string | null;
  title?: string | null;
  sv?: boolean;
  className?: string;
}> = ({ isbn, title, sv = true, className = '' }) => (
  <a
    href={bookSearchUrl(isbn, title)}
    target="_blank"
    rel="noopener noreferrer nofollow"
    className={`inline-flex items-center gap-1 text-[11px] text-sky-300 hover:text-sky-200 ${className}`}
    title={isbn ? `ISBN ${isbn}` : undefined}
  >
    <BookOpen className="h-3 w-3" /> {sv ? 'Hitta boken' : 'Find the book'}
    <ExternalLink className="h-2.5 w-2.5 opacity-70" />
  </a>
);
