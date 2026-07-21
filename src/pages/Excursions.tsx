import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MapPin, Compass, Calendar, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EXCURSIONS, EXCURSION_GROUPS } from '@/data/excursions';
import { ExcursionsMap } from '@/components/excursions/ExcursionsMap';
import { excerptText } from '@/components/excursions/ExcursionProse';

const Excursions = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  // Gruppera per region/tema; okända grupper hamnar sist under "Övrigt".
  // Stabil `key` (gruppnamn eller 'ungrouped') så accordion-läget överlever språkbyte.
  const sections = useMemo(() => {
    const groupsInData = Array.from(
      new Set(EXCURSIONS.map((e) => e.group).filter(Boolean) as string[]),
    );
    const orderedGroups = [
      ...EXCURSION_GROUPS.filter((g) => groupsInData.includes(g)),
      ...groupsInData.filter((g) => !EXCURSION_GROUPS.includes(g)),
    ];
    const ungrouped = EXCURSIONS.filter((e) => !e.group);
    return [
      ...orderedGroups.map((g) => ({ key: g, title: g, items: EXCURSIONS.filter((e) => e.group === g) })),
      ...(ungrouped.length ? [{ key: 'ungrouped', title: sv ? 'Övrigt' : 'Other', items: ungrouped }] : []),
    ];
  }, [sv]);

  // Kondenserad som standard: bara första regionen öppen. Kartklick fäller ut rätt region.
  const [openSections, setOpenSections] = useState<string[]>(() =>
    sections.length ? [sections[0].key] : [],
  );

  const handleSelect = useCallback((id: string) => {
    const exc = EXCURSIONS.find((e) => e.id === id);
    const key = exc?.group ?? 'ungrouped';
    setOpenSections((prev) => (prev.includes(key) ? prev : [...prev, key]));
    // Vänta tills accordion-innehållet renderats innan vi scrollar/markerar.
    window.setTimeout(() => {
      const el = document.getElementById(`exc-${id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.classList.add('ring-2', 'ring-gold');
      window.setTimeout(() => el?.classList.remove('ring-2', 'ring-gold'), 1600);
    }, 120);
  }, []);

  const renderCard = (e: (typeof EXCURSIONS)[number]) => {
    const exploreUrl = `/explore?lat=${e.coords.lat}&lng=${e.coords.lng}`;

    return (
      <Card
        id={`exc-${e.id}`}
        key={e.id}
        className="viking-card hover:bg-card/80 transition-all scroll-mt-24 overflow-hidden group"
      >
        {/* Thumbnail med rubriken i vit text ovanpå. Mörk gradient-scrim garanterar
            WCAG-läsbarhet oavsett foto. Bildlösa mål får en deterministisk platta. */}
        <Link to={`/excursions/${e.id}`} className="block relative h-44 w-full overflow-hidden">
          {e.photoDir ? (
            <img
              src={`/excursion-photos/${e.photoDir}/${e.thumbFile ?? 'thumb.jpg'}`}
              alt={e.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center">
              <Compass className="h-10 w-10 text-slate-500/70" />
            </div>
          )}
          {/* Scrim: mörkare nedtill för kontrast bakom titeln */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
              {e.name}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge variant="secondary" className="text-[10px] bg-black/50 text-white border-white/20 backdrop-blur-sm">
                {e.region}
              </Badge>
              <Badge variant="secondary" className="text-[10px] bg-black/50 text-white border-white/20 backdrop-blur-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {e.period}
              </Badge>
            </div>
          </div>
          {e.thumbCredit && (
            <span className="absolute top-1 right-2 text-[9px] text-white/50 max-w-[60%] truncate text-right">
              {sv ? 'Foto' : 'Photo'}: {e.thumbCredit}
            </span>
          )}
        </Link>
        <CardContent className="space-y-3 pt-3">
          {/* Teaser — markdown strippad; hela texten + närhetslistor bor på detaljsidan. */}
          <p className="text-sm text-muted-foreground line-clamp-2">{excerptText(sv ? e.sv : e.en)}</p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to={`/excursions/${e.id}`}
              className="inline-flex items-center gap-1 text-xs text-gold hover:underline font-medium"
            >
              <MapPin className="h-3 w-3" />
              {e.monumentTypes?.length
                ? (sv ? 'Detaljsida & gravtyper' : 'Details & grave types')
                : (sv ? 'Detaljsida' : 'Details')}
            </Link>
            <a
              href={exploreUrl}
              className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
            >
              <Compass className="h-3 w-3" />
              {sv ? 'Utforska i kartan' : 'Explore on map'}
            </a>
            <a
              href={`https://www.openstreetmap.org/?mlat=${e.coords.lat}&mlon=${e.coords.lng}#map=13/${e.coords.lat}/${e.coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {sv ? 'Öppna i OpenStreetMap' : 'Open in OpenStreetMap'}
            </a>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Utflykter"
        titleEn="Excursions"
        description="Utflyktsmål från vikingatiden och äldre på karta, med relaterade fynd och kultplatser: Birka, Långhundraleden, Broborg, Ölands fornborgar, Rösaringsåsen, Tanums och Himmelstalunds hällristningar, Sigurdsristningen, Rökstenen och Hågahögen."
        descriptionEn="Excursion destinations from the Viking Age and earlier on a map, with related finds and cult sites: Birka, Långhundraleden, Broborg, Öland's hillforts, the Rösaring esker, the Tanum and Himmelstalund rock carvings, the Sigurd carving, the Rök runestone and the Håga mound."
        keywords="utflykter, vikingatid, bronsålder, Birka, fornborg, Rösaring, Långhundraleden, hällristningar, Tanum, Himmelstalund, Sigurdsristningen, Rökstenen, runsten, Håga, Hågahögen"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Compass className="h-8 w-8 text-gold" />
            {sv ? 'Utflykter' : 'Excursions'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {sv
              ? 'Platser att besöka på riktigt — heliga åsar, handelsstäder och fornborgar från vikingatiden och äldre. Klicka en markör på kartan eller fäll ut en region nedan.'
              : 'Places to visit in real life — sacred eskers, trading towns and hillforts from the Viking Age and earlier. Click a marker on the map or expand a region below.'}
          </p>
        </div>

        {/* Översiktskarta */}
        <div className="mb-4">
          <ExcursionsMap onSelect={handleSelect} />
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-orange-600" />
              {sv ? 'Utflyktsmål' : 'Excursion destinations'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
              {sv ? 'Kultplatser & kyrkor' : 'Cult sites & churches'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-600" />
              {sv ? 'Arkeologiska fynd' : 'Archaeological finds'}
            </span>
          </div>
        </div>

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={setOpenSections}
          className="space-y-3 mt-8"
        >
          {sections.map((section) => (
            <AccordionItem
              key={section.key}
              value={section.key}
              className="border border-slate-700/40 rounded-lg bg-slate-800/40 overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-700/30">
                <span className="flex items-center gap-3 text-left">
                  <span className="text-xl font-bold text-foreground">{section.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {section.items.length} {sv ? 'platser' : 'places'}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
                  {section.items.map(renderCard)}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
};

export default Excursions;
