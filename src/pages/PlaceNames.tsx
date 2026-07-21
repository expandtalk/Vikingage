import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Tag, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlaceNamesData } from '@/hooks/usePlaceNamesData';
import { PLACE_NAME_ELEMENTS, ELEMENT_CATEGORY_META, getElement } from '@/utils/placeNameElements';

// Läsbara etiketter för place_names.element_category (feature-kategori i DB).
const FEATURE_CATEGORY_LABELS: Record<string, { sv: string; en: string }> = {
  sakralt: { sv: 'Sakralt', en: 'Sacral' },
  bebyggelse: { sv: 'Bebyggelse', en: 'Settlement' },
  ting_ratt: { sv: 'Ting & rätt', en: 'Assembly & law' },
  centralort: { sv: 'Centralort', en: 'Central place' },
  vang: { sv: 'Vång', en: 'Vång (meadow)' },
  vang_excl: { sv: 'Vång (utesluten)', en: 'Vång (excluded)' },
  val_ospec: { sv: 'Val (ospec.)', en: 'Val (unspec.)' },
  kust_hamn: { sv: 'Kust & hamn', en: 'Coast & harbour' },
  natur: { sv: 'Natur', en: 'Nature' },
};

const PlaceNames = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: places = [], isLoading } = usePlaceNamesData();
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    places.forEach((p) => {
      const c = p.element_category ?? 'okänd';
      counts.set(c, (counts.get(c) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [places]);

  const filtered = category === 'all' ? places : places.filter((p) => p.element_category === category);
  const catLabel = (c: string) => (FEATURE_CATEGORY_LABELS[c] ? (sv ? FEATURE_CATEGORY_LABELS[c].sv : FEATURE_CATEGORY_LABELS[c].en) : c);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Ortnamn"
        titleEn="Place names"
        description="Ortnamnslagret: reproducerbar metod för att klassificera fornnordiska ortnamnsled (sakrala, makt, natur), med källor (Wikidata CC0) och redovisade osäkerheter."
        descriptionEn="The place-name layer: a reproducible method for classifying Old Norse place-name elements (sacral, power, nature), with sources (Wikidata CC0) and documented uncertainties."
        keywords="ortnamn, ortnamnsled, sakrala ortnamn, teofora namn, efterled, vikingatid, fornnordiska, toponymi"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Tag className="h-8 w-8 text-gold" />
            {sv ? 'Ortnamn' : 'Place names'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {sv
              ? 'Ett kurerat lager av ortnamn där varje namn klassificeras efter sina namnled. Målet är en reproducerbar och källbelagd metod — inte tvärsäkra påståenden om vad namnen betyder.'
              : 'A curated layer of place names where each name is classified by its name elements. The goal is a reproducible, sourced method — not firm claims about what the names mean.'}
          </p>
        </div>

        {/* Metod */}
        <Card className="viking-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">{sv ? 'Så här gör vi' : 'How we work'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {sv
                ? 'Varje namnled har en dokumenterad inklusionsregel (matchningsmönster och kända falska träffar) som bestäms i förväg — inte ad hoc. Urvalet ska gå att upprepa och stavningsvarianterna redovisas.'
                : 'Each element has a documented inclusion rule (match patterns and known false hits) decided in advance, not ad hoc. The selection is reproducible and spelling variants are listed.'}
            </p>
            <p>
              {sv
                ? 'Kategorierna (sakralt, makt, natur) är bästa gissning, inte påståenden. Flera led är etymologiskt omtvistade och märks med ⚠︎.'
                : 'The categories (sacral, power, nature) are best guesses, not claims. Several elements are etymologically contested and marked ⚠︎.'}
            </p>
            <p>
              {sv
                ? 'Data hämtas från öppna källor (främst Wikidata, CC0) med koordinater, och kompletteras med äldsta belägg där det finns.'
                : 'Data comes from open sources (mainly Wikidata, CC0) with coordinates, plus earliest attestation where available.'}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <span><strong className="text-foreground">{places.length}</strong> {sv ? 'ortnamn' : 'place names'}</span>
              <span><strong className="text-foreground">{PLACE_NAME_ELEMENTS.length}</strong> {sv ? 'namnled i katalogen' : 'catalogued elements'}</span>
              <span><strong className="text-foreground">{PLACE_NAME_ELEMENTS.filter((e) => e.contested).length}</strong> {sv ? 'omtvistade' : 'contested'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Namnleds-katalog — "vilka ord" */}
        <h2 className="text-2xl font-bold text-foreground mb-1">{sv ? 'Namnleden vi söker' : 'The elements we search for'}</h2>
        <div className="h-0.5 w-16 bg-accent/60 rounded mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PLACE_NAME_ELEMENTS.map((el) => {
            const meta = ELEMENT_CATEGORY_META[el.category];
            return (
              <Card key={el.key} className="viking-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground text-lg flex items-center gap-2">
                    <span style={{ color: meta.color }}>{meta.symbol}</span>
                    {el.label}
                    {el.contested && (
                      <span title={sv ? 'Etymologiskt omtvistad' : 'Etymologically contested'}>
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs" style={{ backgroundColor: meta.color + '22', color: meta.color }}>
                      {meta.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{el.etymology}</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>{sv ? 'Matchar' : 'Matches'}:</strong> {el.patterns.join(', ')}
                    {el.excludes.length > 0 && (
                      <> · <strong>{sv ? 'utesluter' : 'excludes'}:</strong> {el.excludes.join(', ')}</>
                    )}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ortnamnslistan från DB */}
        <h2 className="text-2xl font-bold text-foreground mb-1">{sv ? 'Ortnamnen' : 'The place names'}</h2>
        <div className="h-0.5 w-16 bg-accent/60 rounded mb-5" />

        <div className="flex flex-wrap gap-2 mb-5">
          <Button variant={category === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setCategory('all')}>
            {sv ? 'Alla' : 'All'} <Badge variant="secondary" className="ml-2">{places.length}</Badge>
          </Button>
          {categories.map(([c, n]) => (
            <Button key={c} variant={category === c ? 'default' : 'outline'} size="sm" onClick={() => setCategory(c)}>
              {catLabel(c)} <Badge variant="secondary" className="ml-2">{n}</Badge>
            </Button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Card key={p.id} className="viking-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gold" />
                    {p.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {p.element_category && (
                      <Badge variant="secondary" className="text-xs">{catLabel(p.element_category)}</Badge>
                    )}
                    {(p.element_keys ?? []).map((k) => {
                      const el = getElement(k);
                      return (
                        <Badge key={k} variant="outline" className="text-xs">
                          {el ? el.label : k}
                        </Badge>
                      );
                    })}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  {p.province && <div>{p.province}</div>}
                  {p.earliest_attestation_year != null && (
                    <div>
                      <strong>{sv ? 'Äldsta belägg' : 'Earliest attestation'}:</strong> {p.earliest_attestation_year}
                      {p.attested_form ? ` (${p.attested_form})` : ''}
                    </div>
                  )}
                  {(p.source || p.attribution) && (
                    <div className="text-[11px] opacity-75">
                      {sv ? 'Källa' : 'Source'}: {p.attribution || p.source}
                      {p.source_license ? ` · ${p.source_license}` : ''}
                    </div>
                  )}
                  {p.lat != null && p.lng != null && (
                    <a
                      href={`/explore?lat=${p.lat}&lng=${p.lng}`}
                      className="inline-flex items-center gap-1 text-gold hover:underline pt-1"
                    >
                      <MapPin className="h-3 w-3" />
                      {sv ? 'Visa på kartan' : 'Show on map'}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PlaceNames;
