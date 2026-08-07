import React from 'react';
import { Header } from '../Header';
import { Breadcrumbs } from '../Breadcrumbs';
import { Footer } from '../Footer';
import { PageMeta } from '../PageMeta';
import { PlaceMap } from '@/components/map/PlaceMap';
import { useLanguage } from '@/contexts/LanguageContext';

// Återanvändbar platssida: den GENERISKA lokala basen (PlaceMap → place_features_near) för VILKEN ort
// som helst. Skräddarsytt/källbelagt innehåll per ort läggs som `children` OVANPÅ basen (Daniel:
// "först alla lokal sök … men att man sedan kan lägga på skräddarsytt"). Inga påhittade fakta här —
// kartan är helt data-driven; kuraterat innehåll måste vara källbelagt (INGEN GISSNING).
interface PlacePageProps {
  titleSv: string;
  titleEn: string;
  center: { lat: number; lng: number };
  zoom?: number;
  radiusM?: number;
  metaDescriptionSv: string;
  metaDescriptionEn: string;
  keywords?: string;
  introSv?: React.ReactNode;
  introEn?: React.ReactNode;
  children?: React.ReactNode;
}

export const PlacePage: React.FC<PlacePageProps> = ({
  titleSv, titleEn, center, zoom = 12, radiusM = 25000,
  metaDescriptionSv, metaDescriptionEn, keywords, introSv, introEn, children,
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const intro = sv ? introSv : introEn;
  return (
    <div className="min-h-screen viking-bg">
      <PageMeta title={titleSv} titleEn={titleEn} description={metaDescriptionSv} descriptionEn={metaDescriptionEn} keywords={keywords} />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="text-3xl font-bold text-gold mb-2">{sv ? titleSv : titleEn}</h1>
        {intro && <div className="text-slate-300 mb-4 max-w-3xl leading-relaxed text-sm">{intro}</div>}
        <PlaceMap center={center} zoom={zoom} radiusM={radiusM} />
        {children && <div className="mt-6">{children}</div>}
      </main>
      <Footer />
    </div>
  );
};
