
import { useLanguage } from '@/contexts/LanguageContext';

export const useWelcomeLocalizedText = () => {
  const { language } = useLanguage();

  const localizedTexts = {
    sv: {
      heroTitle: "Sök det Nordiska Arvet",
      heroDescription: "Upptäck tusentals runstenar, vikingatida platser och fornnordisk historia genom vår kunskapsgraf och AI-databas.",
      skipIntro: "Hoppa över introduktion",
      runicInscriptions: "Runinskrifter",
      coordinates: "Koordinater",
      carvers: "Ristare",
      artefacts: "Artefakter",
      vikingFortresses: "Vikingaborgar",
      vikingCities: "Vikingastäder",
      riverLocations: "Flodplatser",
      godNames: "Gudnamn",
      vikingNames: "Vikinganamn",
      hundreds: "Härader",
      parishes: "Socknar",
      folkGroups: "Folkgrupper",
      geneticEvents: "Genetiska händelser",
      prices: "Romersk prisomvandlare",
      language: "sv"
    },
    en: {
      heroTitle: "Search the Nordic Heritage",
      heroDescription: "Discover thousands of runestones, Viking Age sites and Old Norse history through our knowledge graph and AI database.",
      skipIntro: "Skip introduction",
      runicInscriptions: "Runic Inscriptions",
      coordinates: "Coordinates",
      carvers: "Carvers",
      artefacts: "Artefacts",
      vikingFortresses: "Viking Fortresses",
      vikingCities: "Viking Cities",
      riverLocations: "River Locations",
      godNames: "God Names",
      vikingNames: "Viking Names",
      hundreds: "Hundreds",
      parishes: "Parishes",
      folkGroups: "Folk Groups",
      geneticEvents: "Genetic Events",
      prices: "Roman Price Converter",
      language: "en"
    }
  };

  return localizedTexts[language] || localizedTexts.en;
};
