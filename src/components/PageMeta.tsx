import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageMetaProps {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
}

export const PageMeta: React.FC<PageMetaProps> = ({
  title,
  titleEn,
  description,
  descriptionEn,
  keywords,
  ogImage = '/og-image.png',
  ogType = 'website'
}) => {
  const { language } = useLanguage();
  
  const displayTitle = language === 'en' && titleEn ? titleEn : title;
  const displayDescription = language === 'en' && descriptionEn ? descriptionEn : description;
  const fullTitle = `${displayTitle} | Viking Age`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={displayDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={displayDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

