import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Compass, Calendar, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EXCURSIONS, EXCURSION_GROUPS } from '@/data/excursions';
import { ExcursionsMap } from '@/components/excursions/ExcursionsMap';

const Excursions = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const handleSelect = useCallback((id: string) => {
    const el = document.getElementById(`exc-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.classList.add('ring-2', 'ring-gold');
    window.setTimeout(() => el?.classList.remove('ring-2', 'ring-gold'), 1600);
  }, []);

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
              ? 'Platser att besöka på riktigt — heliga åsar, handelsstäder och fornborgar från vikingatiden och äldre. Klicka en markör på kartan för att hoppa till platsen.'
              : 'Places to visit in real life — sacred eskers, trading towns and hillforts from the Viking Age and earlier. Click a marker on the map to jump to a place.'}
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

        {(() => {
          // Gruppera per region/tema; okända grupper hamnar sist under "Övrigt".
          const groupsInData = Array.from(
            new Set(EXCURSIONS.map((e) => e.group).filter(Boolean) as string[]),
          );
          const orderedGroups = [
            ...EXCURSION_GROUPS.filter((g) => groupsInData.includes(g)),
            ...groupsInData.filter((g) => !EXCURSION_GROUPS.includes(g)),
          ];
          const ungrouped = EXCURSIONS.filter((e) => !e.group);
          const sections: Array<{ title: string | null; items: typeof EXCURSIONS }> = [
            ...orderedGroups.map((g) => ({ title: g, items: EXCURSIONS.filter((e) => e.group === g) })),
            ...(ungrouped.length ? [{ title: sv ? 'Övrigt' : 'Other', items: ungrouped }] : []),
          ];

          const renderCard = (e: (typeof EXCURSIONS)[number]) => {
            const exploreUrl = `/explore?lat=${e.coords.lat}&lng=${e.coords.lng}`;

            return (
              <Card
                id={`exc-${e.id}`}
                key={e.id}
                className="viking-card hover:bg-card/80 transition-all scroll-mt-24 overflow-hidden group"
              >
                {/* Snabbladdad thumbnail (480×300 q70, ~25 KB) — konvention: photoDir ⇒ thumb.jpg finns */}
                {e.photoDir && (
                  <Link to={`/excursions/${e.id}`} className="block relative h-40 w-full overflow-hidden">
                    <img
                      src={`/excursion-photos/${e.photoDir}/${e.thumbFile ?? 'thumb.jpg'}`}
                      alt={e.name}
                      title={e.thumbCredit ? `${sv ? 'Foto' : 'Photo'}: ${e.thumbCredit}` : undefined}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
                    {e.thumbCredit && (
                      <span className="absolute bottom-1 right-2 text-[9px] text-white/60">
                        {sv ? 'Foto' : 'Photo'}: {e.thumbCredit}
                      </span>
                    )}
                  </Link>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gold" />
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
                  {/* Teaser — hela texten + närhetslistorna bor på detaljsidan (nyfikenhet > vägg av text). */}
                  <p className="text-sm text-muted-foreground line-clamp-3">{sv ? e.sv : e.en}</p>

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
            <div className="space-y-10 mt-8">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{section.title}</h2>
                  <div className="h-0.5 w-16 bg-accent/60 rounded mb-5" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map(renderCard)}
                  </div>
                </section>
              ))}
            </div>
          );
        })()}
      </main>
      <Footer />
    </div>
  );
};

export default Excursions;
