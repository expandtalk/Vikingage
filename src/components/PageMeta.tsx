import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { getRouteByPath } from '@/config/routes';

// Delnings-/SEO-metadata per sida. OG + Twitter + canonical + hreflang.
// Byggtids-prerender (Fas B) bakar in dessa taggar i statiska HTML:er för högvärdessidor
// så crawlers (Facebook/LinkedIn/Slack/X) som INTE kör JS ändå ser rätt titel/bild/URL.

const SITE_ORIGIN = 'https://vikingage.se';
const SITE_NAME = 'Viking Age';

interface PageMetaProps {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  /** Kanonisk sökväg (t.ex. "/sv/eriksgatan"). Utelämnas → härleds ur window.location. */
  path?: string;
}

// Absolut URL för og:image/canonical — crawlers kräver absoluta URL:er (relativa ignoreras).
const abs = (u: string) => (u.startsWith('http') ? u : SITE_ORIGIN + (u.startsWith('/') ? u : '/' + u));

export const PageMeta: React.FC<PageMetaProps> = ({
  title,
  titleEn,
  description,
  descriptionEn,
  keywords,
  ogImage = '/og-image.png',
  ogType = 'website',
  path,
}) => {
  const { language } = useLanguage();

  const displayTitle = language === 'en' && titleEn ? titleEn : title;
  const displayDescription = language === 'en' && descriptionEn ? descriptionEn : description;
  const fullTitle = `${displayTitle} | ${SITE_NAME}`;

  // Kanonisk URL: explicit path-prop om given, annars aktuell sökväg (utan query/hash).
  const pathname = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonical = abs(pathname);
  const imageUrl = abs(ogImage);
  // hreflang-alternat för registrerade tvåspråkiga sidor (routes.ts) — så Google vet
  // att /sv/... och /en/... är samma sida på olika språk. x-default = engelska.
  const routePair = getRouteByPath(pathname);
  const locale = language === 'en' ? 'en_GB' : 'sv_SE';
  const localeAlt = language === 'en' ? 'sv_SE' : 'en_GB';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={displayDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      {routePair && <link rel="alternate" hrefLang="sv" href={abs(routePair.pathSv)} />}
      {routePair && <link rel="alternate" hrefLang="en" href={abs(routePair.pathEn)} />}
      {routePair && <link rel="alternate" hrefLang="x-default" href={abs(routePair.pathEn)} />}

      {/* Open Graph / Facebook / LinkedIn / Slack */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={localeAlt} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={displayDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Per-sida WebPage-schema (JSON-LD) — knyter sidan till sajt-grafen i index.html. */}
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: displayTitle,
        description: displayDescription,
        url: canonical,
        inLanguage: language === 'en' ? 'en' : 'sv',
        isPartOf: { '@id': 'https://vikingage.se/#website' },
      })}</script>
    </Helmet>
  );
};
