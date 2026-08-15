import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageEnhancer } from '@/components/forensics/ImageEnhancer';
import { Image as ImageIcon } from 'lucide-react';

// Dedikerad bildhanteringssida: ladda upp en fältbild → ImageEnhancer (släpljus, kant-detektering,
// dekorrelationssträckning/DStretch) i webbläsaren. Allt lokalt (ingen uppladdning till server).
const Bildforbattring: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  const [src, setSrc] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setSrc(typeof r.result === 'string' ? r.result : null);
    r.readAsDataURL(f);
  };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Bildförbättring — DStretch, släpljus & kant-detektering"
        titleEn="Image enhancement — DStretch, raking light & edge detection"
        description="Förbättra fält-/naturbilder i webbläsaren: släpljus, kant-detektering och dekorrelationssträckning (DStretch) för att få fram svaga baslinjer före tolkning. Allt lokalt."
        descriptionEn="Enhance field/nature photos in the browser: raking light, edge detection and decorrelation stretch (DStretch) to surface faint lines before interpretation. All local."
        keywords="bildförbättring, DStretch, dekorrelationssträckning, släpljus, kant-detektering, runsten, hällristning"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <ImageIcon className="h-8 w-8 text-gold" /> {sv ? 'Bildförbättring' : 'Image enhancement'}
        </h1>
        <p className="text-gold/90 text-sm font-medium mb-3">
          {sv ? 'Släpljus · kant-detektering · dekorrelationssträckning (DStretch)' : 'Raking light · edge detection · decorrelation stretch (DStretch)'}
        </p>
        <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed mb-5">
          {sv
            ? 'Ladda upp en bild tagen i fält eller naturen — förbättringarna körs helt i din webbläsare (inget laddas upp till server). Få fram svaga baslinjer, ristningar och strukturer före tolkning.'
            : 'Upload a photo taken in the field or nature — the enhancements run entirely in your browser (nothing is uploaded to a server). Surface faint lines, carvings and structures before interpretation.'}
        </p>

        <label className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400 transition-colors cursor-pointer mb-6">
          <ImageIcon className="h-4 w-4" />
          {sv ? 'Välj bild…' : 'Choose image…'}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>

        {src
          ? <ImageEnhancer src={src} />
          : <p className="text-sm text-muted-foreground opacity-80">{sv ? 'Ingen bild vald än.' : 'No image selected yet.'}</p>}
      </main>
      <Footer />
    </div>
  );
};

export default Bildforbattring;
