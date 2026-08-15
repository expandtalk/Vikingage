import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { FingerprintDialog } from '@/components/forensics/FingerprintDialog';
import { Fingerprint as FpIcon, AlertTriangle } from 'lucide-react';

// Dedikerad landningssida för Fingerprint-verktyget (AI-forensik). FingerprintDialog renderar
// sin egen trigger-knapp per objekttyp (runsten/fornborg/grav). Underlag att pröva — ej facit.
const Fingerprint: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Fingerprint — AI-forensik för runsten, fornborg & grav"
        titleEn="Fingerprint — AI forensics for runestone, hillfort & grave"
        description="Beskriv ett objekt (+ valfri bild) → AI-forensik: datering, typologi, trolig identitet. Grav-läget bär osteologi. Underlag att pröva mot källa, ej facit."
        descriptionEn="Describe an object (+ optional image) → AI forensics: dating, typology, likely identity. Grave mode carries osteology. Material to test against sources, not a verdict."
        keywords="fingerprint, forensik, datering, typologi, osteologi, runsten, fornborg, grav"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <FpIcon className="h-8 w-8 text-gold" /> Fingerprint
        </h1>
        <p className="text-gold/90 text-sm font-medium mb-3">
          {sv ? 'AI-forensik: datering · typologi · trolig identitet' : 'AI forensics: dating · typology · likely identity'}
        </p>
        <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed mb-4">
          {sv
            ? 'Beskriv ett objekt (och ladda valfritt upp en bild) så ger forensiken ett underlag: datering, typologi och trolig identitet. Grav-läget bär osteologi (kroppslängd, ålder/kön, patologi/trauma, gravutformning). Välj objekttyp nedan.'
            : 'Describe an object (and optionally upload an image) and the forensics returns material to work from: dating, typology and likely identity. Grave mode carries osteology. Pick an object type below.'}
        </p>
        <div className="mb-6 rounded-lg border border-amber-700/40 bg-amber-950/20 p-3 text-sm text-amber-200/90 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{sv
            ? 'Resultatet är AI-genererat underlag att PRÖVA mot källa — inte facit. Verifiera mot primärkälla/RAÄ/Rundata innan slutsats.'
            : 'The result is AI-generated material to TEST against sources — not a verdict. Verify against primary sources/RAÄ/Rundata before concluding.'}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="viking-card rounded-lg border border-border p-4">
            <h2 className="text-base font-semibold text-gold mb-2">{sv ? 'Runsten' : 'Runestone'}</h2>
            <FingerprintDialog kind="runestone" />
          </div>
          <div className="viking-card rounded-lg border border-border p-4">
            <h2 className="text-base font-semibold text-gold mb-2">{sv ? 'Fornborg' : 'Hillfort'}</h2>
            <FingerprintDialog kind="fornborg" />
          </div>
          <div className="viking-card rounded-lg border border-border p-4">
            <h2 className="text-base font-semibold text-gold mb-2">{sv ? 'Grav (m. osteologi)' : 'Grave (w. osteology)'}</h2>
            <FingerprintDialog kind="grave" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Fingerprint;
