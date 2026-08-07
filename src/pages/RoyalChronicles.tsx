
import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { RoyalChroniclesView } from '../components/chronicles/RoyalChroniclesView';
import { BirkaKungarnaSection } from '../components/chronicles/BirkaKungarnaSection';
import { FingerprintDialog } from '../components/forensics/FingerprintDialog';

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
        {/* Kurerad källkritisk sektion — Birka-kungarna (Rimbert) + Adelsö-noden. Data ur DB. */}
        <BirkaKungarnaSection />
        {/* Grav-fingerprint: identifiera en kunglig grav via plats/längd/gravutformning/symboler. */}
        <div className="mb-4">
          <FingerprintDialog kind="grave" />
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Beskriv en grav (kyrka/plats, kroppslängd, gravutformning, symboler som ring/heraldik) → forensiskt förslag på trolig identitet och status. Forskningsstöd — identifiering utan jämförande DNA är sällan säker.
          </p>
        </div>
        <RoyalChroniclesView />
      </div>
      <Footer />
    </div>
  );
};

export default RoyalChronicles;
