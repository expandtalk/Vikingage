import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Tag, AlertTriangle, Search, X, CalendarClock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlaceNamesData } from '@/hooks/usePlaceNamesData';
import { usePlaceNameAttestations, attestationFormType } from '@/hooks/usePlaceNameAttestations';
import { useRunicTheophoricSummary } from '@/hooks/useRunicTheophoricSummary';
import { useNameDatings, eraSortYear } from '@/hooks/useNameDatings';
import { DistanceStatsCard } from '@/components/placenames/DistanceStatsCard';
import { FreeDistanceStatsCard } from '@/components/placenames/FreeDistanceStatsCard';
import { useElementCounts } from '@/hooks/useElementCounts';
import {
  PLACE_NAME_ELEMENTS,
  ELEMENT_CATEGORY_META,
  EVIDENCE_LAYER_META,
  SACRAL_CONFIDENCE_META,
  getElement,
  type EvidenceLayer,
} from '@/utils/placeNameElements';

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
  const { data: attestations = [] } = usePlaceNameAttestations();
  const { data: runic } = useRunicTheophoricSummary();
  const { data: datings = [] } = useNameDatings();
  const { data: elementCounts = {} } = useElementCounts();
  const [category, setCategory] = useState<string>('all');
  const [elementKey, setElementKey] = useState<string>('all');
  const [query, setQuery] = useState<string>('');

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    places.forEach((p) => {
      const c = p.element_category ?? 'okänd';
      counts.set(c, (counts.get(c) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [places]);

  // Namnleds-chips byggda ur FAKTISK data (element_keys), med antal. Rikare än
  // katalogen — datan är taggad med fler led (inge, lund, tor, tuna, frö, ull…).
  const elementOptions = useMemo(() => {
    const counts = new Map<string, number>();
    places.forEach((p) => (p.element_keys ?? []).forEach((k) => counts.set(k, (counts.get(k) ?? 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [places]);

  const elementLabel = (k: string) => getElement(k)?.label ?? (k.charAt(0).toUpperCase() + k.slice(1));

  const q = query.trim().toLowerCase();
  const filtered = places.filter((p) => {
    if (category !== 'all' && p.element_category !== category) return false;
    if (elementKey !== 'all' && !(p.element_keys ?? []).includes(elementKey)) return false;
    if (q && !p.name.toLowerCase().includes(q) && !(p.attested_form ?? '').toLowerCase().includes(q)) return false;
    return true;
  });
  const catLabel = (c: string) => (FEATURE_CATEGORY_LABELS[c] ? (sv ? FEATURE_CATEGORY_LABELS[c].sv : FEATURE_CATEGORY_LABELS[c].en) : c);
  const scrollToList = () => document.getElementById('place-name-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Beläggkedjor grupperade per ort, kronologiskt.
  const chains = useMemo(() => {
    const byPlace = new Map<string, typeof attestations>();
    attestations.forEach((a) => {
      const arr = byPlace.get(a.place_label) ?? [];
      arr.push(a);
      byPlace.set(a.place_label, arr);
    });
    return Array.from(byPlace.entries())
      .map(([label, items]) => ({ label, items: [...items].sort((x, y) => x.year - y.year) }))
      .sort((a, b) => a.items[0].year - b.items[0].year);
  }, [attestations]);

  // De äldsta daterade bebyggelsenamnen, äldst först.
  const oldestNames = useMemo(
    () => [...datings].sort(
      (a, b) => eraSortYear(a.dating_text) - eraSortYear(b.dating_text) || a.name.localeCompare(b.name),
    ),
    [datings],
  );
  const datingsWithCoord = datings.filter((d) => d.lat != null).length;

  // Kultled i ortnamnsregistret, sorterat på antal orter (OSM-gazetteern). Länkas
  // till runkorpusens siffror där de finns (tor/oden/frö). Karta = filtrera listan.
  const RUNIC_OF: Record<string, 'thor_names' | 'odin_names' | 'frey'> = { tor: 'thor_names', oden: 'odin_names', frö: 'frey' };
  const CORPUS_KEYS = ['tor', 'frö', 'oden', 'ull', 'vi', 'lund', 'harg', 'hov', 'njärd'];
  const corpusRows = useMemo(
    () => CORPUS_KEYS
      .map((k) => ({ key: k, n_osm: elementCounts[k]?.n_osm ?? 0, n_curated: elementCounts[k]?.n_curated ?? 0 }))
      .filter((r) => r.n_osm > 0 || r.n_curated > 0)
      .sort((a, b) => b.n_osm - a.n_osm),
    [elementCounts],
  );

  const FORM_STYLE: Record<string, string> = {
    val: 'border-emerald-500 text-emerald-300',
    vad: 'border-amber-500 text-amber-300',
    aa: 'border-sky-500 text-sky-300',
    other: 'border-slate-500 text-slate-300',
  };

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

        {/* De äldsta daterade bebyggelsenamnen (Vikstrand 2013) */}
        {oldestNames.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-1">{sv ? 'De äldsta bebyggelsenamnen' : 'The oldest settlement names'}</h2>
            <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
            <p className="text-sm text-muted-foreground max-w-3xl mb-3">
              {sv
                ? 'Namn som går att datera arkeologiskt, äldst först. Dateringen är fyndplatsens (boplats eller gravfält intill bytomten) och en hypotes om namnets ålder — inte en objektiv mätpunkt. ⚠︎ markerar de fall där Vikstrand själv satte frågetecken.'
                : 'Names that can be dated archaeologically, oldest first. The dating is that of the find spot (settlement or grave field by the village toft) and a hypothesis about the name’s age — not an objective measurement. ⚠︎ marks the cases where Vikstrand himself was uncertain.'}
            </p>
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{datings.length}</strong> {sv ? 'daterade namn' : 'dated names'}</span>
              <span><strong className="text-foreground">{datingsWithCoord}</strong> {sv ? 'med verifierad koordinat' : 'with a verified coordinate'}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {oldestNames.map((d) => (
                <Card key={d.id} className="viking-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-base flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-gold" />
                      {d.name}
                      {d.uncertainty === 'hög' && (
                        <span title={sv ? 'Vikstrand satte frågetecken' : 'Vikstrand was uncertain'}>
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {d.name_type && <Badge variant="secondary" className="text-xs">{d.name_type}</Badge>}
                      {d.dating_basis && <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">{d.dating_basis}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-xs text-muted-foreground">
                    <div className="text-sm text-foreground">{d.dating_text}</div>
                    {(d.socken || d.landscape) && (
                      <div>{[d.socken && `${d.socken} sn`, d.landscape].filter(Boolean).join(' · ')}</div>
                    )}
                    {d.note && <div className="italic opacity-80">{d.note}</div>}
                    <div className="text-[11px] opacity-75">
                      {sv ? 'Källa' : 'Source'}: {d.source}{d.page ? `, s. ${d.page}` : ''}
                    </div>
                    {d.lat != null && d.lng != null && (
                      <a
                        href={`/explore?lat=${d.lat}&lng=${d.lng}`}
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
          </div>
        )}

        {/* Steg 1: hypotestest — avstånd till sockenkyrka (box-plot) */}
        <DistanceStatsCard sv={sv} />

        {/* Steg 2b: fri hypotesprövning — valfri testmängd/baslinje/mål */}
        <FreeDistanceStatsCard sv={sv} />

        {/* Namnleds-katalog — "vilka ord", grupperat i evidensskikt */}
        <h2 className="text-2xl font-bold text-foreground mb-1">{sv ? 'Namnleden vi söker' : 'The elements we search for'}</h2>
        <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
        <p className="text-sm text-muted-foreground max-w-3xl mb-6">
          {sv
            ? 'Leden är indelade i evidensskikt: den erkända kärnan (teofora/kultiska led), den utvidgade hypotesen (topografi-först/omtvistade), och kontroller (bebyggelsesuffix — baslinjen man mäter signal mot). Varje led har en sakral-konfidens och en boundary-regel som gör matchningen förutsägbar.'
            : 'Elements are grouped into evidence layers: the recognised core (theophoric/cultic), the extended hypothesis (topography-first/contested), and controls (settlement suffixes — the baseline signal is measured against). Each element has a sacral confidence and a boundary rule that makes matching predictable.'}
        </p>

        {(['core', 'extended', 'control'] as EvidenceLayer[]).map((layer) => {
          const layerMeta = EVIDENCE_LAYER_META[layer];
          const els = PLACE_NAME_ELEMENTS.filter((e) => e.evidenceLayer === layer);
          return (
            <div key={layer} className="mb-8">
              <h3 className="text-lg font-semibold text-foreground">{sv ? layerMeta.label : layerMeta.labelEn}</h3>
              <p className="text-xs text-muted-foreground mb-3 max-w-2xl">{sv ? layerMeta.note : layerMeta.noteEn}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {els.map((el) => {
                  const meta = ELEMENT_CATEGORY_META[el.category];
                  const conf = SACRAL_CONFIDENCE_META[el.sacralConfidence];
                  const inData = elementOptions.find(([k]) => k === el.key);
                  return (
                    <Card
                      key={el.key}
                      className={`viking-card ${inData ? 'cursor-pointer hover:bg-card/80 transition-colors' : ''} ${elementKey === el.key ? 'ring-2 ring-gold' : ''}`}
                      onClick={inData ? () => { setElementKey(el.key); scrollToList(); } : undefined}
                      title={inData ? (sv ? `Visa de ${inData[1]} ortnamnen` : `Show the ${inData[1]} place names`) : undefined}
                    >
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
                          <Badge variant="outline" className="text-xs" style={{ borderColor: conf.color, color: conf.color }}>
                            {sv ? 'Sakral' : 'Sacral'}: {sv ? conf.label : conf.labelEn}
                          </Badge>
                          {el.isControl && (
                            <Badge variant="outline" className="text-xs border-slate-400 text-slate-300">
                              {sv ? 'Kontroll' : 'Control'}
                            </Badge>
                          )}
                          {inData && (
                            <Badge variant="secondary" className="text-xs">{inData[1]}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">{el.etymology}</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>{sv ? 'Matchar' : 'Matches'}</strong> ({el.boundaryRule}): {el.patterns.join(', ')}
                          {el.excludes.length > 0 && (
                            <> · <strong>{sv ? 'utesluter' : 'excludes'}:</strong> {el.excludes.join(', ')}</>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Data-kvalitets-varning: nuvarande DB-taggning är preliminär */}
        <Card className="viking-card mb-10 border-amber-600/40">
          <CardContent className="py-4 flex gap-3 text-sm text-muted-foreground">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              {sv
                ? 'Obs: taggningen på ortnamnen nedan är preliminär och görs om enligt den reviderade metoden. Den tidigare importen var för generös — t.ex. taggades alla -lund (även sena herrgårdsnamn som Erikslund, Marielund) som "sakralt". Efter omtaggning räknas -lund som sakralt bara med teofor bestämning (Fröslunda), och -inge/-hem/-by behandlas som kontrollgrupp.'
                : 'Note: the tagging on the place names below is preliminary and being redone with the revised method. The earlier import was too generous — e.g. all -lund names (including late estate names like Erikslund, Marielund) were tagged "sacral". After re-tagging, -lund counts as sacral only with a theophoric qualifier (Fröslunda), and -inge/-hem/-by are treated as a control group.'}
            </p>
          </CardContent>
        </Card>

        {/* Namnleden i runinskrifterna — korsanalys mot runkorpusen */}
        {runic && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-1">{sv ? 'Namnleden i runinskrifterna' : 'The elements in the runic inscriptions'}</h2>
            <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
            <p className="text-sm text-muted-foreground max-w-3xl mb-4">
              {sv
                ? `Samma teofora led vi letar efter i ortnamnen dyker upp i runornas personnamn. En oberoende konsistenskoll mot ${runic.total_with_translit.toLocaleString()} translittererade inskrifter — Tor dominerar, och är dessutom det enda ledet med faktisk kultformel.`
                : `The same theophoric elements we look for in place names appear in the runic personal names. An independent consistency check against ${runic.total_with_translit.toLocaleString()} transliterated inscriptions — Thor dominates, and is the only element with an actual cult formula.`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card className="viking-card"><CardContent className="py-4 text-center">
                <div className="text-2xl font-bold text-gold">{runic.thor_names}</div>
                <div className="text-xs text-muted-foreground">{sv ? 'runinskrifter med Tor-namn (þur-/þor-)' : 'inscriptions with Thor names'}</div>
              </CardContent></Card>
              <Card className="viking-card"><CardContent className="py-4 text-center">
                <div className="text-2xl font-bold text-gold">{runic.thor_vigi.length}</div>
                <div className="text-xs text-muted-foreground">{sv ? 'inskrifter med "Þórr vígi"-formel' : 'inscriptions with a "Þórr vígi" formula'}</div>
              </CardContent></Card>
              <Card className="viking-card"><CardContent className="py-4 text-center">
                <div className="text-2xl font-bold text-gold">{runic.odin_names}</div>
                <div className="text-xs text-muted-foreground">{sv ? 'runinskrifter med Oden-namn (aldrig åkallan)' : 'inscriptions with Odin names (never invoked)'}</div>
              </CardContent></Card>
              <Card className="viking-card"><CardContent className="py-4 text-center">
                <div className="text-2xl font-bold text-gold">{runic.frey}</div>
                <div className="text-xs text-muted-foreground">{sv ? 'runinskrifter med Frö/Frey-namn' : 'inscriptions with Frey names'}</div>
              </CardContent></Card>
            </div>
            <p className="text-[11px] text-muted-foreground opacity-70 mb-4">
              {sv
                ? `Siffrorna räknar runinskrifter (av ${runic.total_with_translit.toLocaleString()} translittererade) där ledet ingår i ett person- eller gudanamn — inte antal förekomster.`
                : `The numbers count runic inscriptions (of ${runic.total_with_translit.toLocaleString()} transliterated) where the element occurs in a personal or divine name — not the number of occurrences.`}
            </p>
            <h3 className="text-lg font-semibold text-foreground mb-2">{sv ? 'Tor helgar — de äkta kultformlerna' : 'Thor hallows — the genuine cult formulas'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {runic.thor_vigi.map((s) => (
                <Card key={s.signum} className="viking-card">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs border-gold text-gold">{s.signum}</Badge>
                      <span className="text-xs text-emerald-300 font-medium">þur · uiki</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono break-words">{s.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground opacity-80 max-w-3xl">
              {sv
                ? 'Ärligt: Tor/Oden/Frö förekommer främst i personnamn (Þorsteinn, Óðinkárr), inte som gudaåkallan. Undantaget är de fyra "Þórr vígi"-stenarna ovan (Glavendrup DR 209, Velanda Vg 150, Virring DR 110, Canterbury-besvärjelsen) där Tor faktiskt åkallas. Oden nämns bara i namn — aldrig direkt — helt i linje med forskningen.'
                : 'Honestly: Thor/Odin/Frey occur mainly in personal names, not as invocations. The exception is the four "Þórr vígi" stones above, where Thor is actually invoked. Odin appears only in names — never directly — consistent with scholarship.'}
            </p>

            {/* Samma led i ortnamnsregistret — antal orter, sorterat, jämfört med runorna */}
            {corpusRows.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{sv ? 'Samma led i ortnamnsregistret' : 'The same elements in the place-name register'}</h3>
                <p className="text-xs text-muted-foreground max-w-3xl mb-3">
                  {sv
                    ? 'Hur många orter som bär respektive led, sorterat på antal. "Orter" = hela registret (OSM-gazetteern); "kurerade" = det granskade urval som visas på kartan. Klicka för att filtrera ortnamnslistan nedan.'
                    : 'How many places carry each element, sorted by count. "Places" = the full register (OSM gazetteer); "curated" = the reviewed subset shown on the map. Click to filter the list below.'}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full max-w-2xl text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b border-slate-700/50">
                        <th className="py-2 pr-4">{sv ? 'Led' : 'Element'}</th>
                        <th className="py-2 pr-4 text-right">{sv ? 'Orter (registret)' : 'Places (register)'}</th>
                        <th className="py-2 pr-4 text-right">{sv ? 'varav kurerade' : 'of which curated'}</th>
                        <th className="py-2 pr-4 text-right">{sv ? 'i runorna' : 'in runes'}</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {corpusRows.map((r) => {
                        const el = getElement(r.key);
                        const runicKey = RUNIC_OF[r.key];
                        const runicN = runic && runicKey ? (runic as any)[runicKey] : null;
                        return (
                          <tr key={r.key} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                            <td className="py-2 pr-4 text-foreground font-medium">{el ? el.label : r.key}</td>
                            <td className="py-2 pr-4 text-right text-foreground">{r.n_osm.toLocaleString()}</td>
                            <td className="py-2 pr-4 text-right text-muted-foreground">{r.n_curated}</td>
                            <td className="py-2 pr-4 text-right text-muted-foreground">{runicN != null ? runicN : '—'}</td>
                            <td className="py-2 text-right whitespace-nowrap">
                              {r.n_curated > 0 && (
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-gold hover:bg-slate-700/40"
                                  onClick={() => { setElementKey(r.key); scrollToList(); }}>
                                  {sv ? 'lista' : 'list'}
                                </Button>
                              )}
                              <a href={`/explore?element=${r.key}`}
                                className="inline-flex items-center gap-1 text-xs text-gold hover:underline ml-2"
                                title={sv ? `Visa alla ${r.n_osm} orter på kartan` : `Show all ${r.n_osm} on the map`}>
                                <MapPin className="h-3 w-3" />{sv ? 'karta' : 'map'}
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-muted-foreground opacity-70 mt-2 max-w-3xl">
                  {sv
                    ? 'Obs: "i runorna" räknar inskrifter med gudanamnet (bara tor/oden/frö kan jämföras direkt). Att lund toppar registret betyder inte att det är sakralt — de flesta -lund är sena, profana namn (se varningen ovan).'
                    : 'Note: "in runes" counts inscriptions with the divine name (only tor/oden/frö compare directly). That -lund tops the register does not make it sacral — most -lund names are late and secular (see the warning above).'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Beläggkedjor över tid (pilot) */}
        {chains.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-1">{sv ? 'Belägg över tid' : 'Attestations over time'}</h2>
            <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
            <p className="text-sm text-muted-foreground max-w-3xl mb-2">
              {sv
                ? 'Dokumenterade historiska stavningar per ort (pilot, transkriberat ur Isof Ortnamnsregistret / Riksarkivet via Nyholm 2025). Färgen visar formtyp — så man kan se ev. skiften val→vad→vål över tid utan att ta ställning till vad namnet betydde.'
                : 'Documented historical spellings per place (pilot, transcribed from Isof / the National Archives via Nyholm 2025). Colour shows form type, so a possible val→vad→vål shift is visible without claiming what the name meant.'}
            </p>
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              <span className={`px-2 py-0.5 rounded border ${FORM_STYLE.val}`}>val/vala</span>
              <span className={`px-2 py-0.5 rounded border ${FORM_STYLE.vad}`}>vad (säkrad?)</span>
              <span className={`px-2 py-0.5 rounded border ${FORM_STYLE.aa}`}>å-form</span>
              <span className={`px-2 py-0.5 rounded border ${FORM_STYLE.other}`}>{sv ? 'övrig' : 'other'}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chains.map((chain) => (
                <Card key={chain.label} className="viking-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-base flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-gold" />
                      {chain.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {chain.items.map((a, i) => (
                        <React.Fragment key={a.id}>
                          {i > 0 && <span className="text-slate-500">→</span>}
                          <span
                            className={`px-2 py-1 rounded border text-xs ${FORM_STYLE[attestationFormType(a.attested_form)]}`}
                            title={a.note ? `${a.source} — ${a.note}` : a.source}
                          >
                            <span className="font-mono opacity-70 mr-1">{a.year}</span>{a.attested_form}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 opacity-75">
                      {sv ? 'Källa' : 'Source'}: {chain.items[0].source}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Ortnamnslistan från DB */}
        <h2 id="place-name-list" className="text-2xl font-bold text-foreground mb-1 scroll-mt-24">{sv ? 'Ortnamnen' : 'The place names'}</h2>
        <div className="h-0.5 w-16 bg-accent/60 rounded mb-4" />

        {/* Fritextsök */}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={sv ? 'Sök ortnamn…' : 'Search place names…'}
            className="pl-9 bg-slate-800/60 border-slate-600 text-white"
          />
        </div>

        {/* Namnled-filter (ur faktisk data) */}
        <div className="mb-2 text-xs font-medium text-muted-foreground">{sv ? 'Filtrera på namnled:' : 'Filter by element:'}</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant={elementKey === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setElementKey('all')}>
            {sv ? 'Alla led' : 'All elements'}
          </Button>
          {elementOptions.map(([k, n]) => (
            <Button key={k} variant={elementKey === k ? 'default' : 'outline'} size="sm" onClick={() => setElementKey(k)}>
              {elementLabel(k)} <Badge variant="secondary" className="ml-2">{n}</Badge>
            </Button>
          ))}
        </div>

        {/* Feature-kategori */}
        <div className="mb-2 text-xs font-medium text-muted-foreground">{sv ? 'Filtrera på kategori:' : 'Filter by category:'}</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant={category === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setCategory('all')}>
            {sv ? 'Alla' : 'All'} <Badge variant="secondary" className="ml-2">{places.length}</Badge>
          </Button>
          {categories.map(([c, n]) => (
            <Button key={c} variant={category === c ? 'default' : 'outline'} size="sm" onClick={() => setCategory(c)}>
              {catLabel(c)} <Badge variant="secondary" className="ml-2">{n}</Badge>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-5 text-sm text-muted-foreground">
          <span>{sv ? 'Visar' : 'Showing'} <strong className="text-foreground">{filtered.length}</strong> {sv ? 'av' : 'of'} {places.length}</span>
          {(category !== 'all' || elementKey !== 'all' || query) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCategory('all'); setElementKey('all'); setQuery(''); }}
              className="h-7 text-xs text-gold hover:bg-slate-700/40"
            >
              <X className="h-3 w-3 mr-1" />{sv ? 'Rensa filter' : 'Clear filters'}
            </Button>
          )}
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
