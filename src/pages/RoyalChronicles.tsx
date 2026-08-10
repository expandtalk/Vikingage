
import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { RoyalChroniclesView } from '../components/chronicles/RoyalChroniclesView';

const RoyalChronicles = () => {
  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Kungliga Krönikor"
        titleEn="Royal Chronicles"
        description="Utforska medeltida och vikingatida härskare i Skandinavien och Östeuropa. Dynastier, källor och historiska kungar."
        descriptionEn="Explore medieval and Viking Age rulers of Scandinavia and Eastern Europe. Dynasties, sources and historical kings."
        keywords="kungar, dynastier, medeltid, vikingatid, skandinavisk historia, kungakrönikor"
      />
      <Header />
      <Breadcrumbs />
      <div className="container mx-auto px-4 py-6">
        {/* Sidan är nu ett enda strukturerat fliksystem (Daniel): Birka-kungarna · Kungakrönikor ·
            Kronologiska kungar · Sagokungar · Dynastier · Källor. Birka-sektionen och grav-fingerprint
            bor numera inne i flikarna (RoyalChroniclesView/TabsView) — inget innehåll borttaget. */}
        <RoyalChroniclesView />
      </div>
      <Footer />
    </div>
  );
};

export default RoyalChronicles;
