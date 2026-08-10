import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { RunicExplorerSimple } from '../components/RunicExplorerSimple';
import { NamedStonesSection } from '../components/inscriptions/NamedStonesSection';
import { RunestonePoetrySection } from '../components/inscriptions/RunestonePoetrySection';
import { DatingCategoriesSection } from '../components/inscriptions/DatingCategoriesSection';
import { RunestoneBrowser } from '../components/inscriptions/RunestoneBrowser';
import { FingerprintDialog } from '../components/forensics/FingerprintDialog';
import { useLanguage } from '@/contexts/LanguageContext';

const Inscriptions = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Runinskrifter"
        titleEn="Runic Inscriptions"
        description="Utforska tusentals runinskrifter från vikingatiden. Sök, filtrera och analysera runstenar med interaktiva kartor."
        descriptionEn="Explore thousands of runic inscriptions from the Viking Age. Search, filter and analyze runestones with interactive maps."
        keywords="runinskrifter, runstenar, vikingatid, runologi, skandinavisk historia"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="text-3xl">ᚱ</span>
            <span>{language === 'sv' ? 'Runinskrifter' : 'Runic Inscriptions'}</span>
          </h1>
          <p className="text-slate-300 text-lg">
            {language === 'sv'
              ? 'Utforska och analysera runinskrifter från vikingatiden med avancerade sök- och filterverktyg.'
              : 'Explore and analyze runic inscriptions from the Viking Age with advanced search and filter tools.'}
          </p>
          {/* Forensiskt fingerprint-verktyg: beskrivning (+ bild) → datering/ristartradition/ornamentik. */}
          <div className="mt-4">
            <FingerprintDialog kind="runestone" />
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              {language === 'sv'
                ? 'Skicka en beskrivning (och valfritt en bild) av en runsten → forensisk fingerprint: datering (Gräslund-stil), ristartradition och ornamentik. Forskningsstöd — kontrollera mot källor.'
                : 'Submit a description (and optionally an image) of a runestone → a forensic fingerprint: dating (Gräslund style), carver tradition and ornament. A research aid — verify against sources.'}
            </p>
          </div>
        </div>
        {/* Den strukturerade "uppställningen" FÖRST: fasetterad runstensbläddrare (sök på signum,
            filter på landskap/ornamentstil/objektkategori + klustrad karta). Den är sidans ingång
            och får INTE trängas undan av det sent laddande bild-galleriet "Namngivna stenar" nedan
            (Daniel: strukturen försvann efter ~1 s och bilderna ersatte den). Ligger den överst kan
            inget som laddar in senare knuffa ned den. Klick → /inscription/:signum. */}
        <div className="mb-3">
          <h2 className="text-2xl font-bold text-white">
            {language === 'sv' ? 'Runstensbläddrare' : 'Runestone browser'}
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            {language === 'sv'
              ? 'Hela den geopositionerade korpusen på kartan. Filtrera i vänsterpanelen på landskap (signum-serie), ornamentstil eller objektkategori — kartan och listan uppdateras direkt.'
              : 'The entire geolocated corpus on the map. Filter in the left panel by province (signum series), ornament style or object category — the map and list update instantly.'}
          </p>
        </div>
        <RunestoneBrowser />

        {/* Namngivna stenar som ingång (landskaps-grupperade) — bild-galleri UNDER bläddraren. */}
        <NamedStonesSection />

        {/* Tema: runstenar med poesi & diktmått (hjältedikt/dróttkvätt/eddisk vers) */}
        <RunestonePoetrySection />

        {/* Datering-kategorisering (Gräslunds stilkronologi) */}
        <DatingCategoriesSection />

        {/* Nivå 3: den generella utforskaren (alla lager, tidskontroll) */}
        <h2 className="text-2xl font-bold text-white mb-4 mt-10">
          {language === 'sv' ? 'Avancerad utforskare (alla lager)' : 'Advanced explorer (all layers)'}
        </h2>
        <RunicExplorerSimple />
      </main>
      <Footer />
    </div>
  );
};

export default Inscriptions;

