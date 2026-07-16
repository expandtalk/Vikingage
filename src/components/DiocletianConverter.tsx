import React, { useState } from 'react';
import { ArrowRightLeft, Coins, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DiocletianConverter = () => {
  const { language } = useLanguage();
  const [denarii, setDenarii] = useState(1000);
  const [goldPricePerGram, setGoldPricePerGram] = useState(650);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Konverteringsdata från ediktet
  const solidusWeight = 4.5; // gram guld
  const denariiPerSolidus = 1000;
  
  // Beräkningar
  const solidusValue = solidusWeight * goldPricePerGram;
  const denariusValue = solidusValue / denariiPerSolidus;
  const modernValue = denarii * denariusValue;
  
  // MASSIV lista med historiska priser från ediktet (i denarii)
  const historicalPrices = [
    // SPANNMÅL & BALJVÄXTER
    { item: "Vete (1 kastrensis modius ≈ 17.5 liter)", price: 100, category: "Spannmål" },
    { item: "Korn (1 k. modius)", price: 60, category: "Spannmål" },
    { item: "Råg (1 k. modius)", price: 60, category: "Spannmål" },
    { item: "Bönor, skalade (1 k. modius)", price: 100, category: "Spannmål" },
    { item: "Linser (1 k. modius)", price: 100, category: "Spannmål" },
    { item: "Ris, skalat (1 k. modius)", price: 200, category: "Spannmål" },
    { item: "Havre (1 k. modius)", price: 30, category: "Spannmål" },
    
    // VIN & DRYCKER
    { item: "Vin från Picenum (bästa kvalitet, 1 sextarius ≈ 0.5 liter)", price: 30, category: "Vin & drycker" },
    { item: "Falerner vin (1 sextarius)", price: 30, category: "Vin & drycker" },
    { item: "Vin, 1 år gammalt, första kvalitet", price: 24, category: "Vin & drycker" },
    { item: "Vanligt vin (1 sextarius)", price: 8, category: "Vin & drycker" },
    { item: "Veteöl (1 sextarius)", price: 4, category: "Vin & drycker" },
    { item: "Kornöl (1 sextarius)", price: 2, category: "Vin & drycker" },
    
    // OLJA & KRYDDOR
    { item: "Olivolja, jungfruolja, första kvalitet (1 sextarius)", price: 40, category: "Mat - olja" },
    { item: "Olivolja, andra pressning (1 sextarius)", price: 24, category: "Mat - olja" },
    { item: "Vanlig olivolja (1 sextarius)", price: 12, category: "Mat - olja" },
    { item: "Vinäger (1 sextarius)", price: 6, category: "Mat - olja" },
    { item: "Fiskås, första kvalitet (1 sextarius)", price: 16, category: "Mat - olja" },
    { item: "Salt (1 k. modius)", price: 100, category: "Mat - olja" },
    { item: "Honung, bästa kvalitet (1 sextarius)", price: 40, category: "Mat - olja" },
    
    // KÖTT
    { item: "Fläsk (1 pund ≈ 327g)", price: 12, category: "Kött" },
    { item: "Nötkött (1 pund)", price: 8, category: "Kött" },
    { item: "Get- eller fårkött (1 pund)", price: 8, category: "Kött" },
    { item: "Suggas lever (1 pund)", price: 16, category: "Kött" },
    { item: "Fläsk, saltat, bästa kvalitet (1 pund)", price: 16, category: "Kött" },
    { item: "Skinka, Menapisk eller Cerritansk (1 pund)", price: 20, category: "Kött" },
    { item: "Fläskkorv (1 uncia ≈ 27g)", price: 2, category: "Kött" },
    { item: "Nötkorv (1 pund)", price: 10, category: "Kött" },
    { item: "Rökt Lucanisk fläskkorv (1 pund)", price: 16, category: "Kött" },
    { item: "Fasan, gödda (1 st)", price: 250, category: "Kött" },
    { item: "Gås, gödda (1 st)", price: 200, category: "Kött" },
    { item: "Kyckling (par)", price: 60, category: "Kött" },
    { item: "Hare (1 st)", price: 150, category: "Kött" },
    { item: "Kanin (1 st)", price: 40, category: "Kött" },
    { item: "Påfågel (1 st)", price: 300, category: "Kött" },
    { item: "Smör (1 pund)", price: 16, category: "Kött" },
    
    // FISK
    { item: "Havsfisk, inte benigare, första kvalitet (1 pund)", price: 24, category: "Fisk" },
    { item: "Havsfisk, andra kvalitet (1 pund)", price: 16, category: "Fisk" },
    { item: "Flodsfisk, första kvalitet (1 pund)", price: 12, category: "Fisk" },
    { item: "Saltad fisk (1 pund)", price: 6, category: "Fisk" },
    { item: "Ostron (100 st)", price: 100, category: "Fisk" },
    { item: "Sardin (1 pund)", price: 16, category: "Fisk" },
    { item: "Torr ost (1 pund)", price: 12, category: "Fisk" },
    
    // GRÖNSAKER & FRUKT
    { item: "Ägg (4 st)", price: 4, category: "Grönsaker & frukt" },
    { item: "Lök, torkad (1 modius ≈ 8.7 liter)", price: 50, category: "Grönsaker & frukt" },
    { item: "Vitlök (1 modius)", price: 60, category: "Grönsaker & frukt" },
    { item: "Äpplen, Matianska, bästa kvalitet (10 st)", price: 4, category: "Grönsaker & frukt" },
    { item: "Päron, största (10 st)", price: 4, category: "Grönsaker & frukt" },
    { item: "Persikor (10 st)", price: 4, category: "Grönsaker & frukt" },
    { item: "Granatäpplen, största (10 st)", price: 8, category: "Grönsaker & frukt" },
    { item: "Dadlar, Nicolanska, bästa kvalitet (8 st)", price: 4, category: "Grönsaker & frukt" },
    { item: "Fikon, bästa kvalitet (25 st)", price: 4, category: "Grönsaker & frukt" },
    { item: "Tryffel (1 pund)", price: 16, category: "Grönsaker & frukt" },
    { item: "Fårsmjölk (1 sextarius)", price: 8, category: "Grönsaker & frukt" },
    { item: "Färsk ost (1 pund)", price: 8, category: "Grönsaker & frukt" },
    
    // LÖNER - ARBETARE
    { item: "Lantarbetare med uppehälle (per dag)", price: 25, category: "Löner - arbetare" },
    { item: "Stenhuggare med uppehälle (per dag)", price: 50, category: "Löner - arbetare" },
    { item: "Snickare med uppehälle (per dag)", price: 50, category: "Löner - arbetare" },
    { item: "Väggmålare med uppehälle (per dag)", price: 75, category: "Löner - arbetare" },
    { item: "Figurmålare med uppehälle (per dag)", price: 150, category: "Löner - arbetare" },
    { item: "Bagare med uppehälle (per dag)", price: 50, category: "Löner - arbetare" },
    { item: "Barberare (per kund)", price: 2, category: "Löner - arbetare" },
    { item: "Skräddare för finaste huva (per plagg)", price: 60, category: "Löner - arbetare" },
    { item: "Vattenbärare, hel dag, med uppehälle", price: 25, category: "Löner - arbetare" },
    { item: "Kloak-rensare, hel dag, med uppehälle", price: 25, category: "Löner - arbetare" },
    
    // LÖNER - UTBILDNING & PROFESSIONELLA
    { item: "Gymnastiklärare (per månad, per elev)", price: 50, category: "Löner - utbildning" },
    { item: "Grundskolelärare (per månad, per elev)", price: 50, category: "Löner - utbildning" },
    { item: "Matematik-lärare (per månad, per elev)", price: 75, category: "Löner - utbildning" },
    { item: "Stenografi-lärare (per månad, per elev)", price: 75, category: "Löner - utbildning" },
    { item: "Grekisk/latinsk litteratur-lärare (per månad, per elev)", price: 200, category: "Löner - utbildning" },
    { item: "Retoriklärare (per månad, per elev)", price: 250, category: "Löner - utbildning" },
    { item: "Arkitekturlärare (per månad, per elev)", price: 100, category: "Löner - utbildning" },
    { item: "Advokat för att öppna mål", price: 250, category: "Löner - utbildning" },
    { item: "Advokat för att föra talan", price: 1000, category: "Löner - utbildning" },
    { item: "Skrivare, bästa skrift (per 100 rader)", price: 25, category: "Löner - utbildning" },
    { item: "Notarie för juridiska dokument (per 100 rader)", price: 10, category: "Löner - utbildning" },
    
    // BOSKAP
    { item: "Tävlingshäst", price: 100000, category: "Boskap" },
    { item: "Bästa stridshäst", price: 36000, category: "Boskap" },
    { item: "Bästa mulåsna", price: 36000, category: "Boskap" },
    { item: "Baktrisk kamel", price: 25000, category: "Boskap" },
    { item: "Kamel med två pucklar", price: 60000, category: "Boskap" },
    { item: "Bästa arabisk kamel", price: 12000, category: "Boskap" },
    { item: "Bästa dromedar", price: 20000, category: "Boskap" },
    { item: "Ridåsna", price: 15000, category: "Boskap" },
    { item: "Packning-åsna", price: 7000, category: "Boskap" },
    { item: "Par oxar, bästa kvalitet", price: 10000, category: "Boskap" },
    { item: "Tjur för avel, bästa kvalitet", price: 5000, category: "Boskap" },
    { item: "Ko, bästa kvalitet", price: 2000, category: "Boskap" },
    { item: "Kastrerad bagge, bästa kvalitet", price: 500, category: "Boskap" },
    { item: "Får, bästa kvalitet", price: 400, category: "Boskap" },
    { item: "Bock, bästa kvalitet", price: 500, category: "Boskap" },
    { item: "Get, bästa kvalitet", price: 400, category: "Boskap" },
    
    // SLAVAR
    { item: "Slav, man, 16-40 år", price: 30000, category: "Slavar" },
    { item: "Slav, kvinna, 16-40 år", price: 25000, category: "Slavar" },
    { item: "Slav, man, 40-60 år", price: 25000, category: "Slavar" },
    { item: "Slav, kvinna, 40-60 år", price: 20000, category: "Slavar" },
    { item: "Slav, pojke/flicka, 8-16 år", price: 20000, category: "Slavar" },
    { item: "Slav, man över 60 år eller pojke under 8", price: 15000, category: "Slavar" },
    { item: "Slav, kvinna över 60 eller flicka under 8", price: 10000, category: "Slavar" },
    
    // VILDA DJUR
    { item: "Lejon, första klass", price: 150000, category: "Vilda djur" },
    { item: "Lejonhona, första klass", price: 125000, category: "Vilda djur" },
    { item: "Leopard, första klass", price: 100000, category: "Vilda djur" },
    { item: "Struts", price: 5000, category: "Vilda djur" },
    { item: "Björn, första klass", price: 25000, category: "Vilda djur" },
    { item: "Vildsvin, första klass", price: 6000, category: "Vilda djur" },
    { item: "Hjort, första klass", price: 3000, category: "Vilda djur" },
    
    // KLÄDER & TEXTIL
    { item: "Militär mantel, bästa kvalitet", price: 4000, category: "Kläder" },
    { item: "Skjorta enligt indictio", price: 2000, category: "Kläder" },
    { item: "Par skor för patricier", price: 150, category: "Kläder" },
    { item: "Par skor för senatorer", price: 100, category: "Kläder" },
    { item: "Soldatskor", price: 75, category: "Kläder" },
    { item: "Militärsadel", price: 500, category: "Kläder" },
    { item: "Mulåsnesadel med piska", price: 800, category: "Kläder" },
    
    // SILKE & PURPUR
    { item: "Vit obearbetad silke (1 pund)", price: 12000, category: "Silke & purpur" },
    { item: "Purpurfärgat silke (1 pund)", price: 150000, category: "Silke & purpur" },
    { item: "Ull färgad purpur (1 pund)", price: 50000, category: "Silke & purpur" },
    { item: "Ull färgad ljusare purpur (1 pund)", price: 32000, category: "Silke & purpur" },
    { item: "Ull färgad Tyrisk purpur (1 pund)", price: 16000, category: "Silke & purpur" },
    
    // METALLER & MATERIAL
    { item: "Guld, raffinerat, i tackor eller mynt (1 pund)", price: 72000, category: "Metaller" },
    { item: "Silver, raffinerat, första kvalitet (1 pund)", price: 6000, category: "Metaller" },
    { item: "Mässing (1 pund)", price: 100, category: "Metaller" },
    { item: "Koppar (1 pund)", price: 75, category: "Metaller" },
    { item: "Brons (1 pund)", price: 50, category: "Metaller" },
    
    // MYNT (för referens)
    { item: "Solidus (guldmynt = 1000 denarii)", price: 1000, category: "Mynt" },
    { item: "Aureus (guldmynt)", price: 1200, category: "Mynt" },
    { item: "Argenteus (silvermynt)", price: 100, category: "Mynt" },
    { item: "Nummus (brons/silver)", price: 25, category: "Mynt" },
  ];
  
  const categories = [...new Set(historicalPrices.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="w-12 h-12 text-amber-700" />
            <h1 className="text-4xl font-bold text-amber-900">
              {language === 'sv' ? 'Diocletianus Priskonverterare' : 'Diocletian Price Converter'}
            </h1>
          </div>
          <p className="text-amber-800 text-lg">
            {language === 'sv' 
              ? 'Jämför priser från år 301 e.Kr. med dagens värden baserat på guldvärde'
              : 'Compare prices from 301 CE with modern values based on gold value'}
          </p>
        </div>

        {/* Explanation Box */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-2 w-full text-left font-semibold text-blue-900 mb-2"
          >
            <Info className="w-5 h-5" />
            <span>
              {language === 'sv'
                ? `Hur fungerar konverteringen? (klicka för att ${showExplanation ? 'dölja' : 'visa'})`
                : `How does the conversion work? (click to ${showExplanation ? 'hide' : 'show'})`}
            </span>
          </button>
          
          {showExplanation && (
            <div className="text-sm text-blue-800 space-y-3 mt-4 border-t border-blue-200 pt-4">
              <div>
                <strong>
                  {language === 'sv' 
                    ? 'Beräkningsmetod - från denarii till kronor via guld:' 
                    : 'Calculation method - from denarii to SEK via gold:'}
                </strong>
              </div>
              
              <div className="bg-white rounded p-4 space-y-2">
                <div>
                  1. <strong>1 solidus</strong> {language === 'sv' ? '(romerskt guldmynt)' : '(Roman gold coin)'} = <strong>4.5 {language === 'sv' ? 'gram rent guld' : 'grams of pure gold'}</strong>
                </div>
                <div>
                  2. <strong>1 solidus</strong> = <strong>1,000 denarii</strong> {language === 'sv' ? '(enligt ediktet)' : '(according to the edict)'}
                </div>
                <div>
                  3. {language === 'sv' ? 'Dagens guldpris:' : "Today's gold price:"} <strong>{goldPricePerGram} kr/gram</strong>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div>→ 1 solidus = 4.5 × {goldPricePerGram} = <strong>{solidusValue.toLocaleString('sv-SE')} kr</strong></div>
                  <div>→ 1 denarius = {solidusValue.toLocaleString('sv-SE')} ÷ 1,000 = <strong>{denariusValue.toFixed(2)} kr</strong></div>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded p-3 border border-amber-200">
                <strong>{language === 'sv' ? 'Exempel:' : 'Example:'}</strong> {language === 'sv' ? 'Om något kostade 1,000 denarii år 301:' : 'If something cost 1,000 denarii in 301:'}
                <div className="mt-1">
                  1,000 denarii × {denariusValue.toFixed(2)} kr = <strong>{(1000 * denariusValue).toLocaleString('sv-SE', {maximumFractionDigits: 0})} kr</strong> {language === 'sv' ? 'i guldvärde idag' : 'in gold value today'}
                </div>
              </div>
              
              <div className="bg-green-50 rounded p-3 border border-green-200 mt-3">
                <strong>{language === 'sv' ? 'Romerska mått och vikter:' : 'Roman weights and measures:'}</strong>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><strong>1 libra</strong> {language === 'sv' ? '(pund)' : '(pound)'} = 327 {language === 'sv' ? 'gram' : 'grams'}</div>
                  <div><strong>1 uncia</strong> = 27 {language === 'sv' ? 'gram (1/12 pund)' : 'grams (1/12 pound)'}</div>
                  <div><strong>1 sextarius</strong> = 0.55 {language === 'sv' ? 'liter' : 'liters'}</div>
                  <div><strong>1 modius</strong> = 8.7 {language === 'sv' ? 'liter' : 'liters'}</div>
                  <div><strong>1 kastrensis modius</strong> = 17.5 {language === 'sv' ? 'liter' : 'liters'}</div>
                  <div><strong>1 pes</strong> {language === 'sv' ? '(fot)' : '(foot)'} = 29.6 cm</div>
                </div>
              </div>
              
              <div className="text-xs text-blue-700 italic mt-3">
                <strong>{language === 'sv' ? 'Viktigt:' : 'Important:'}</strong> {language === 'sv' 
                  ? 'Detta är INTE samma sak som köpkraft! Konverteringen visar vad guldet i sig är värt idag, inte vad man kunde köpa för det. En romersk arbetare som tjänade 25 denarii/dag (≈73 kr) kunde köpa mycket mer än vad 73 kr köper idag.'
                  : 'This is NOT the same as purchasing power! The conversion shows what the gold itself is worth today, not what you could buy with it. A Roman worker earning 25 denarii/day (≈73 SEK) could buy much more than what 73 SEK buys today.'}
              </div>
            </div>
          )}
        </div>

        {/* Warning Box */}
        <div className="bg-amber-100 border-l-4 border-amber-600 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>{language === 'sv' ? 'OBS:' : 'NOTE:'}</strong> {language === 'sv'
                ? 'Denna konvertering baseras ENDAST på guldvärde, inte köpkraft. Relativa priser har förändrats radikalt - silke var extremt exklusivt år 301 men är billigt idag. Detta är ett verktyg för att få en ungefärlig känsla för storleksordningar.'
                : 'This conversion is based ONLY on gold value, not purchasing power. Relative prices have changed dramatically - silk was extremely exclusive in 301 but is cheap today. This is a tool to get an approximate sense of magnitudes.'}
            </div>
          </div>
        </div>

        {/* Converter */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-2 border-amber-200">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Denarii Input */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                {language === 'sv' ? 'Antal Denarii' : 'Number of Denarii'}
              </label>
              <input
                type="number"
                value={denarii}
                onChange={(e) => setDenarii(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                min="1"
              />
              <p className="text-xs text-amber-600 mt-2">
                1 Solidus = 1,000 denarii
              </p>
            </div>

            {/* Gold Price Input */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                {language === 'sv' ? 'Guldpris (kr/gram)' : 'Gold Price (SEK/gram)'}
              </label>
              <input
                type="number"
                value={goldPricePerGram}
                onChange={(e) => setGoldPricePerGram(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                min="1"
              />
              <p className="text-xs text-amber-600 mt-2">
                {language === 'sv' ? 'Aktuellt guldpris ca 650-700 kr/gram' : 'Current gold price approx. 650-700 SEK/gram'}
              </p>
            </div>
          </div>

          {/* Result */}
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-6 text-center border-2 border-amber-300">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-3xl font-bold text-amber-900">
                {denarii.toLocaleString('sv-SE')} denarii
              </span>
              <ArrowRightLeft className="w-6 h-6 text-amber-600" />
              <span className="text-3xl font-bold text-green-700">
                {modernValue.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
              </span>
            </div>
            <div className="text-sm text-amber-700 mt-4">
              <div>1 denarius ≈ {denariusValue.toFixed(2)} kr</div>
              <div>1 solidus ({solidusWeight}g guld) ≈ {solidusValue.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr</div>
            </div>
          </div>
        </div>

        {/* Historical Prices */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            {language === 'sv' ? 'Priser från Diocletianus Edikt (301 e.Kr.)' : 'Prices from Diocletian Edict (301 CE)'}
          </h2>

          {categories.map((category) => (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold text-amber-800 mb-3 border-b-2 border-amber-200 pb-2">
                {category}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-200">
                      <th className="text-left py-2 px-2 text-sm font-semibold text-amber-900">
                        {language === 'sv' ? 'Vara/Tjänst' : 'Item/Service'}
                      </th>
                      <th className="text-right py-2 px-2 text-sm font-semibold text-amber-900">Denarii ↓</th>
                      <th className="text-right py-2 px-2 text-sm font-semibold text-amber-900">
                        {language === 'sv' ? 'Modern värde (kr) ↓' : 'Modern value (SEK) ↓'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalPrices
                      .filter(p => p.category === category)
                      .sort((a, b) => b.price - a.price) // Sortera från högst till lägst pris
                      .map((item, idx) => {
                        const modern = item.price * denariusValue;
                        return (
                          <tr key={idx} className="border-b border-amber-100 hover:bg-amber-50 transition-colors">
                            <td className="py-3 px-2 text-amber-900">{item.item}</td>
                            <td className="py-3 px-2 text-right font-mono text-amber-700">
                              {item.price.toLocaleString('sv-SE')}
                            </td>
                            <td className="py-3 px-2 text-right font-semibold text-green-700">
                              {modern.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-amber-700 space-y-3">
          <p className="font-semibold">
            {language === 'sv' 
              ? 'Baserat på Diocletianus Edikt om Maxpriser från år 301 e.Kr.'
              : 'Based on Diocletian Edict on Maximum Prices from 301 CE'}
          </p>
          <p className="mt-2">
            {language === 'sv'
              ? 'Ediktet innehåller ca 1,400 priser - denna konverterare visar 100+ av de mest intressanta'
              : 'The edict contains approx. 1,400 prices - this converter shows 100+ of the most interesting ones'}
          </p>
          
          <div className="bg-white rounded-lg p-4 mt-4 border-2 border-amber-200 text-left max-w-2xl mx-auto">
            <h4 className="font-semibold text-amber-900 mb-2">
              {language === 'sv' ? 'Källor och referenser:' : 'Sources and references:'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <strong>Wikipedia:</strong>{' '}
                <a 
                  href="https://en.wikipedia.org/wiki/Edict_on_Maximum_Prices" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Edict on Maximum Prices
                </a>
              </li>
              <li>
                <strong>{language === 'sv' ? 'Komplett översättning:' : 'Complete translation:'}</strong> Antony Kropff (2016), "An English translation of the Edict on Maximum Prices" -{' '}
                <a 
                  href="https://kark.uib.no/antikk/dias/priceedict.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  PDF (University of Bergen)
                </a>
              </li>
              <li>
                <strong>{language === 'sv' ? 'Originalforskning:' : 'Original research:'}</strong> Crawford & Reynolds (1979), Lauffer (1971), Graser (1940)
              </li>
            </ul>
            <p className="text-xs text-gray-600 mt-3 italic">
              {language === 'sv'
                ? 'Alla priser är verifierade mot det kompletta ediktet. Ediktet finns bevarat i fragmentform från 40+ platser i det östra romarriket.'
                : 'All prices are verified against the complete edict. The edict survives in fragmentary form from 40+ sites across the eastern Roman Empire.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiocletianConverter;
