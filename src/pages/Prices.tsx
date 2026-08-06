import React from 'react';
import { Header } from '@/components/Header';
import DiocletianConverter from '@/components/DiocletianConverter';
import { VikingSilverConverter } from '@/components/VikingSilverConverter';
import { useLanguage } from '@/contexts/LanguageContext';

const Prices = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen viking-bg">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Vikingatida silvervåg — hjälten (vägd silverekonomi, källförd). */}
        <VikingSilverConverter />

        {/* Romersk tid: Diocletianus prisedikt — knyter an till våra romerska importfynd
            (glaskärlet, Apollo Grannus, denarerna). Sekundärt, under vikinga-vågen. */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-6 my-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-orange-400 mb-3">
            {language === 'sv' ? 'Diocletianus Prisförordning (301 e.Kr.)' : 'Diocletian Price Edict (301 CE)'}
          </h2>
          <p className="text-slate-300 mb-2">
            {language === 'sv' 
              ? 'Kejsare Diocletianus regerade från 286 till 305 e.Kr. - långt innan vikingatiden (ca 793-1066). Prisförordningen från år 301 är ett av de viktigaste dokumenten för att förstå den senromantiska ekonomin.'
              : 'Emperor Diocletian ruled from 286 to 305 CE - long before the Viking Age (c. 793-1066). The Price Edict of 301 is one of the most important documents for understanding the late Roman economy.'}
          </p>
          <p className="text-slate-400 text-sm">
            {language === 'sv'
              ? '🕰️ Detta är över 500 år innan vikingatiden, men ger en unik fingervisning om prisbilder och ekonomiska förhållanden i det antika Europa.'
              : '🕰️ This is over 500 years before the Viking Age, but provides a unique insight into pricing and economic conditions in ancient Europe.'}
          </p>
        </div>

        {/* Converter Component */}
        <DiocletianConverter />
      </div>
    </div>
  );
};

export default Prices;
