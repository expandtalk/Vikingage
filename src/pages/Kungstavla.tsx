import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Swords } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Kungstavla = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const t = sv
    ? {
        title: 'Kungstavla (Hnefatafl)',
        intro:
          'Hnefatafl — vikingatidens strategispel. Namnet kommer av hnefi (kungpjäsen, ordagrant "näve") och tafl ("bräde"). Den ojämna kampen står mellan en kung med sina försvarare i mitten, som ska fly till ett hörn, och en dubbelt så stor anfallande styrka som ska fånga honom.',
        finds:
          'Spelpjäser och tärningar hör till de vanligaste gravfynden — bland annat i båtgravarna i Valsgärde och på Birka. Ockelbostenen (Gs 19) avbildar till och med två figurer vid ett tavelbräde.',
        play: 'Spela nedan:',
      }
    : {
        title: "King's Board (Hnefatafl)",
        intro:
          'Hnefatafl — the Viking-Age strategy game. The name comes from hnefi (the king piece, literally "fist") and tafl ("board"). It is an asymmetric struggle between a king with his defenders in the centre, who must escape to a corner, and an attacking force twice as large that must capture him.',
        finds:
          'Gaming pieces and dice are among the most common grave finds — including in the boat graves at Valsgärde and at Birka. The Ockelbo stone (Gs 19) even depicts two figures at a game board.',
        play: 'Play below:',
      };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Kungstavla (Hnefatafl)"
        titleEn="King's Board (Hnefatafl)"
        description="Spela Hnefatafl — vikingatidens asymmetriska strategispel (kungstavla) direkt i webbläsaren, med historisk bakgrund och koppling till arkeologiska spelfynd."
        descriptionEn="Play Hnefatafl — the Viking Age asymmetric strategy game (king's board) directly in the browser, with historical background and links to archaeological gaming finds."
        keywords="hnefatafl, kungstavla, tafl, vikingaspel, brädspel, strategispel"
      />
      <Header />
      <Breadcrumbs />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Swords className="h-8 w-8 text-gold" />
            {t.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">{t.intro}</p>
          <p className="text-muted-foreground mt-3 max-w-3xl">{t.finds}</p>
        </div>

        <p className="sr-only">{t.play}</p>
        <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
          <iframe
            src="/kungstavla.html"
            title={t.title}
            className="w-full"
            style={{ height: '80vh', minHeight: 640, border: '0' }}
            loading="lazy"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Kungstavla;
