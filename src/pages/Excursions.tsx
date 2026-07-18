import React from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Compass, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Excursion {
  id: string;
  name: string;
  region: string;
  period: string;
  coords: { lat: number; lng: number };
  sv: string;
  en: string;
}

const EXCURSIONS: Excursion[] = [
  {
    id: 'birka',
    name: 'Birka',
    region: 'Björkö, Mälaren (Ekerö)',
    period: 'ca 750–970 e.Kr.',
    coords: { lat: 59.336, lng: 17.542 },
    sv: 'Vikingatidens främsta handelsstad, på ön Björkö i Mälaren. Här landsteg Ansgar på sin mission 829/830. Gravfält med tusentals högar, en befäst stadsvall och hamnlämningar. Världsarv tillsammans med Hovgården.',
    en: "The foremost Viking-Age trading town, on the island of Björkö in Lake Mälaren. Ansgar landed here on his mission in 829/830. Grave fields with thousands of mounds, a fortified town rampart and harbour remains. A World Heritage Site together with Hovgården.",
  },
  {
    id: 'langhundraleden',
    name: 'Långhundraleden',
    region: 'Uppland (Trälhavet–Uppsala)',
    period: 'Järnålder–vikingatid',
    coords: { lat: 59.55, lng: 18.05 },
    sv: 'En forntida vattenled från Trälhavet vid Östersjön genom sjöar och åar upp mot Uppsala. En pulsåder för transport och handel under järnålder och vikingatid, kantad av gravfält och runstenar. Landhöjningen har sedan dess torrlagt delar av leden.',
    en: 'An ancient waterway from Trälhavet on the Baltic through lakes and streams up towards Uppsala. A transport and trade artery during the Iron Age and Viking Age, lined with grave fields and runestones. Land uplift has since dried out parts of the route.',
  },
  {
    id: 'broborg',
    name: 'Broborg',
    region: 'Vassunda, Uppland',
    period: 'Vendeltid–vikingatid',
    coords: { lat: 59.72, lng: 17.87 },
    sv: 'En fornborg i Uppland med delvis förglasade (vitrifierade) vallar — stenmurar som utsatts för så hög värme att de smält samman. Ett fenomen som fortfarande diskuteras: rituell bränning eller försvarsverk?',
    en: 'A hillfort in Uppland with partly vitrified ramparts — stone walls exposed to heat so intense they fused together. A phenomenon still debated: ritual burning or defensive work?',
  },
  {
    id: 'oland_hillforts',
    name: 'Ölands fornborgar',
    region: 'Öland',
    period: 'Järnålder–folkvandringstid',
    coords: { lat: 56.62, lng: 16.54 },
    sv: 'Öland har en unik täthet av fornborgar. Ismantorp med sina nio portar och gåtfulla husgrunder, det väldiga Gråborg, och Eketorp som grävts ut och rekonstruerats. Tillflykt, kult och maktcentra under orostider.',
    en: "Öland has a unique density of hillforts. Ismantorp with its nine gates and enigmatic house foundations, the vast Gråborg, and Eketorp which has been excavated and reconstructed. Refuge, cult and centres of power in troubled times.",
  },
  {
    id: 'rosaring',
    name: 'Rösaringsåsen',
    region: 'Låssa, Upplands-Bro',
    period: 'Vendeltid–vikingatid',
    coords: { lat: 59.51, lng: 17.63 },
    sv: 'På en rullstensås reser sig ett gravfält, en labyrint och en ca 540 m lång, rak processionsväg kantad av stolphål. Vägen leder till en gravhög och tolkas som en ceremoniell "väg till dödsriket" — en av Nordens mest gåtfulla kultplatser.',
    en: 'On an esker rise a grave field, a labyrinth and an approx. 540 m long, straight processional road lined with post-holes. The road leads to a burial mound and is interpreted as a ceremonial "road to the realm of the dead" — one of the Nordic region\'s most enigmatic cult sites.',
  },
];

const Excursions = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Utflykter"
        titleEn="Excursions"
        description="Utflyktsmål från vikingatiden och äldre: Birka, Långhundraleden, Broborg, Ölands fornborgar och Rösaringsåsen."
        descriptionEn="Excursion destinations from the Viking Age and earlier: Birka, Långhundraleden, Broborg, Öland's hillforts and the Rösaring esker."
        keywords="utflykter, vikingatid, Birka, fornborg, Rösaring, Långhundraleden"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Compass className="h-8 w-8 text-accent" />
            {sv ? 'Utflykter' : 'Excursions'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {sv
              ? 'Platser att besöka på riktigt — heliga åsar, handelsstäder och fornborgar från vikingatiden och äldre.'
              : 'Places to visit in real life — sacred eskers, trading towns and hillforts from the Viking Age and earlier.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXCURSIONS.map((e) => (
            <Card key={e.id} className="viking-card hover:bg-card/80 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  {e.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">{e.region}</Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{e.period}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{sv ? e.sv : e.en}</p>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${e.coords.lat}&mlon=${e.coords.lng}#map=13/${e.coords.lat}/${e.coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <MapPin className="h-3 w-3" />
                  {sv ? 'Visa på karta' : 'Show on map'} ({e.coords.lat.toFixed(3)}, {e.coords.lng.toFixed(3)})
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Excursions;
