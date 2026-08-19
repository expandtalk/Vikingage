import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Tag, AlertTriangle, Search, X, CalendarClock, ChevronDown, FlaskConical, Languages, Radar, BookOpen, Database } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlaceNamesData } from '@/hooks/usePlaceNamesData';
import { usePlaceNameAttestations, attestationFormType } from '@/hooks/usePlaceNameAttestations';
import { useRunicTheophoricSummary } from '@/hooks/useRunicTheophoricSummary';
import { useNameDatings, eraSortYear } from '@/hooks/useNameDatings';
import { OldestAttestations } from '@/components/placenames/OldestAttestations';
import { DistanceStatsCard } from '@/components/placenames/DistanceStatsCard';
import { FreeDistanceStatsCard } from '@/components/placenames/FreeDistanceStatsCard';
import { ChurchDistanceCard } from '@/components/placenames/ChurchDistanceCard';
import { HeritageProximityCard } from '@/components/placenames/HeritageProximityCard';
import { SaintCentralityCard } from '@/components/placenames/SaintCentralityCard';
import { RunicWordCard } from '@/components/placenames/RunicWordCard';
import { RunicCorpusCard } from '@/components/placenames/RunicCorpusCard';
import { EliteMonumentsCard } from '@/components/placenames/EliteMonumentsCard';
import { RunicTransitionCard } from '@/components/placenames/RunicTransitionCard';
import { WordRefineCard } from '@/components/placenames/WordRefineCard';
import OnomasticClusterCard from '@/components/placenames/OnomasticClusterCard';
import AngermanlandClusterResults from '@/components/placenames/AngermanlandClusterResults';
import PlaceNameElementExplorer from '@/components/placenames/PlaceNameElementExplorer';
import PlaceNameQuickSearch from '@/components/placenames/PlaceNameQuickSearch';
import { useElementCounts } from '@/hooks/useElementCounts';
import { setElementTest } from '@/hooks/useElementTest';
import { setClusterCase } from '@/hooks/useClusterCase';
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

// Utfällbar sektion — kondenserar referensmaterialet så hypotestestaren får fokus.
const Section: React.FC<{ title: string; count?: number; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, count, defaultOpen, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="mb-4 border border-slate-700/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/60 text-left transition-colors"
        aria-expanded={open}
      >
        <span className="text-lg font-semibold text-foreground flex items-center gap-2">
          {title}
          {count != null && <Badge variant="secondary">{count}</Badge>}
        </span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-4 pt-2">{children}</div>}
    </div>
  );
};

// Vad grupperna i hypotestestaren betyder — med de faktiska leden som ingår.
const GROUP_DEFS: { key: string; sv: string; en: string; color: string; desc: string; descEn: string; els: string[] }[] = [
  { key: 'makt', sv: 'Makt', en: 'Power', color: '#3b82f6',
    desc: 'Centralortsled som pekar på kunglig/administrativ makt (kungsgårdar, uppbörd, organisation).',
    descEn: 'Central-place elements pointing to royal/administrative power.',
    els: ['tuna', 'husby', 'sala', 'karleby', 'sätuna'] },
  { key: 'kontroll', sv: 'Kontroll (baslinje)', en: 'Control (baseline)', color: '#94a3b8',
    desc: 'Vanliga bebyggelsesuffix utan särskild kult- eller maktkoppling. Detta är NOLLMÄTNINGEN man jämför de andra grupperna mot.',
    descEn: 'Ordinary settlement suffixes — the baseline the other groups are compared against.',
    els: ['by', 'sta', 'torp'] },
  { key: 'sakralt', sv: 'Sakralt', en: 'Sacral', color: '#c084fc',
    desc: 'Teofora/kultled som pekar på förkristen kult (gudanamn + kultplatsord).',
    descEn: 'Theophoric/cult elements pointing to pre-Christian cult.',
    els: ['tor', 'frö', 'oden', 'ull', 'vi', 'lund', 'harg', 'hov'] },
  { key: 'ledung', sv: 'Ledung (sjökrig)', en: 'Ledung (naval levy)', color: '#0891b2',
    desc: 'Snäck-namn (snäcka = vikingatida krigsskepp) tolkas som platser i ledungens tjänst — uppläggnings-/bemanningshamnar i skyddade vikar. Olsson visar att de gotländska snäck-namnen fördelar sig på de gamla tingen (10 ting = ett snäck-namn vardera) → en ting-/ledungsangelägenhet. Omtvistat (kan vara topografisk snäcka).',
    descEn: 'Snäck names (snäcka = Viking warship) are read as sites in the naval levy (ledung) — berthing/manning harbours in sheltered bays. Olsson shows the Gotland snäck names map onto the old tings (10 tings = one name each). Contested.',
    els: ['snack'] },
];
// Attribution för snäck/ledung-testet (Daniel: viktigt att källan syns).
const SNACK_SOURCE = 'Ingemar Olsson, "Snäck-namn på Gotland", Fornvännen 1972:180–208 (RAÄ, öppen · urn:nbn:se:raa:diva-886)';

const PlaceNames = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: places = [], isLoading } = usePlaceNamesData();
  const { data: attestations = [] } = usePlaceNameAttestations();
  const { data: runic } = useRunicTheophoricSummary();
  const { data: datings = [] } = useNameDatings();
  const { data: elementCounts = {} } = useElementCounts();
  // Delad runkohort — ett urval som styr alla runtest (Corpus-kortet ställer in, Word-kortet lyder).
  // Default (Daniels insikt): uteslut samlingar (tvärregionala), BEHÅLL flyttade (lokal kyrkflytt = kvar i landskapet), region-matcha.
  const [runicCohort, setRunicCohort] = useState({ excludeMoved: false, excludeCollections: true, medium: 'all', regionMatch: true });
  const [category, setCategory] = useState<string>('all');
  const [elementKey, setElementKey] = useState<string>('all');
  const [query, setQuery] = useState<string>('');
  // Landningsvy = "Äldsta belägg" (tvåaxel): det man vill se när man kommer till ortnamnssidan
  // (Daniel). Screening-verktygen (hypotes/kluster/filolog) nås via arbetsgångs-korten.
  const [tab, setTab] = useState<string>('belagg'); // kontrollerad så prova-exempel kan byta flik

  // Klickbart prova-exempel: fyll i verktyget + scrolla dit (ev. byt flik först).
  const scrollTo = (id: string) => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  const tryHypothesis = (els: string[]) => { setElementTest(els); scrollTo('hypothesis-test-card'); };
  const tryCluster = (id: string) => { setTab('kluster'); setClusterCase(id); scrollTo('cluster-card'); };

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
        title="Ortnamn – ta reda på åldern"
        titleEn="Place names – find the age"
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

        {/* Sök FÖRST — hela nationella registret (~358k), server-side. Daniel: man vill söka ortnamn först. */}
        <PlaceNameQuickSearch sv={sv} />

        {/* Fördjupningssidor (kurerade temasidor per namntyp) */}
        <div className="mb-4">
          <a href={sv ? '/sv/ortnamn/tuna' : '/place-names/tuna'}
            className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-gold/40 bg-gold/5 px-4 py-2.5 text-sm hover:bg-gold/10">
            <Tag className="h-4 w-4 text-gold shrink-0" />
            <span className="text-foreground font-medium">{sv ? 'Fördjupning: Tuna-namnen' : 'Deep dive: the Tuna place-names'}</span>
            <span className="text-muted-foreground">{sv ? '— centralorter, kult eller inte, och läget vid det inre vattnet →' : '— central places, cult or not, and the inner-water location →'}</span>
          </a>
        </div>

        {/* ===== ARBETSGÅNG (rekommenderad ordning) ===== */}
        <div className="mb-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {sv ? 'Rekommenderad arbetsgång — billig kvantitativ screening först, dyr etymologi sist:' : 'Recommended workflow — cheap quantitative screening first, costly etymology last:'}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">
            {([
              { n: null, Icon: BookOpen, key: 'metod', title: sv ? 'Metoden' : 'The method', d: sv ? 'Varför testet är falsifierbart, inte cirkulärt — evidensskikt, kontroller, källor.' : 'Why the test is falsifiable, not circular — evidence layers, controls, sources.' },
              { n: null, Icon: Tag, key: 'led', title: sv ? 'Ortnamnsled' : 'Name elements', d: sv ? 'Välj ett led att testa — etymologi, evidensskikt, antal orter.' : 'Pick an element to test — etymology, evidence layer, counts.' },
              { n: null, Icon: CalendarClock, key: 'belagg', title: sv ? 'Äldsta belägg' : 'Earliest attestation', d: sv ? 'Tvåaxel: när namnet först skrevs (runsten/brev/Isof) + ledens skikt. Belägg ≠ namnålder.' : 'Two axes: first written (runestone/charter/Isof) + element stratum. Attestation ≠ name-age.' },
              { n: 1, Icon: null, key: 'hypotes', title: sv ? 'Hypotestestaren' : 'Hypothesis tester', d: sv ? 'Screena: korrelerar ledet med något, mot baslinjen?' : 'Screen: does the element correlate, vs the baseline?' },
              { n: 2, Icon: null, key: 'kluster', title: sv ? 'Ortnamnskluster' : 'Name clustering', d: sv ? 'Lokalisera: klumpar det kring ett epicentrum? Skarp kant.' : 'Localise: does it clump around an epicentre? Sharp edge.' },
              { n: 3, Icon: null, key: 'filolog', title: sv ? 'AI Filolog-agent' : 'AI philologist', d: sv ? 'Djupdyk: etymologi bara på det som klarade testen.' : 'Deep dive: etymology only on what survived.' },
              { n: null, Icon: Database, key: 'namnbas', title: sv ? 'Namnbasen' : 'The name base', d: sv ? 'Basen av orden verktygen testar mot — korpus + proveniens (OSM-bas vs Isof).' : 'The base of the words the tools test against — corpus + provenance (OSM base vs Isof).' },
            ] as { n: number | null; Icon: React.FC<{ className?: string }> | null; key: string; title: string; d: string }[]).map((s, i) => (
              <React.Fragment key={s.key}>
                {i > 0 && <div className="hidden sm:flex items-center text-slate-500">→</div>}
                <button
                  onClick={() => { setTab(s.key); }}
                  className={`flex-1 text-left rounded-md border px-3 py-2 transition-colors ${tab === s.key ? 'border-gold/70 bg-gold/10' : 'border-slate-600/60 hover:border-slate-400/60'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${tab === s.key ? 'bg-gold text-slate-900' : 'bg-slate-700 text-slate-200'}`}>
                      {s.n != null ? s.n : (s.Icon ? <s.Icon className="h-3 w-3" /> : null)}
                    </span>
                    <span className="text-sm font-medium text-foreground">{s.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{s.d}</p>
                </button>
              </React.Fragment>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/80 mt-2">
            {sv ? 'Har du en plats i stället för en namntyp? Börja i steg 2 (kluster) och gå sedan till steg 1.' : 'Have a place rather than a name type? Start at step 2 (clustering), then go to step 1.'}
          </p>
        </div>

        {/* Verktygen som flikar. Navigeringen sker via arbetsgångs-korten ovan (kontrollerad `tab`-
            state) — den separata TabsList-raden togs bort (Daniel: "vi har 2 fliksystem, det räcker
            med det översta"). <Tabs> behålls som innehållsväxlare; korten ovan är enda flikraden. */}
        <Tabs value={tab} onValueChange={setTab} className="mb-10">

          {/* ---- FLIK: ÄLDSTA BELÄGG (tvåaxel: belägg-kedja + skikt/motiv) ---- */}
          <TabsContent value="belagg">
            <OldestAttestations sv={sv} />
          </TabsContent>

          {/* ---- FLIK 0: METODEN (ortnamnsmetoden, ej allmän vetenskapsmetodik) ---- */}
          <TabsContent value="metod">
            <div className="max-w-3xl space-y-5">
              <div className="viking-card rounded-lg border border-accent/30 p-4">
                <p className="mb-1 text-sm font-medium text-foreground">{sv ? 'Metoden — screena → lokalisera → djupdyk' : 'The method — screen → locate → deep-dive'}</p>
                <p className="text-sm text-muted-foreground">
                  {sv
                    ? 'Billig kvantitativ screening först, dyr etymologi sist. Ett namnled prövas i tre steg: (1) Hypotestestaren mäter om ledet korrelerar med något mot en baslinje; (2) Ortnamnsklustret letar en skarp, falsifierbar kant kring ett epicentrum; (3) AI-filologen gör etymologin — men bara på det som klarade steg 1–2. Poängen: ett led "bevisas" inte av att det låter sakralt, utan av att det överlever ett test som kunde ha fällt det.'
                    : 'Cheap quantitative screening first, costly etymology last. An element is tested in three steps: (1) the Hypothesis tester measures correlation against a baseline; (2) the clustering tool looks for a sharp, falsifiable edge around an epicentre; (3) the AI philologist does the etymology — but only on what survived steps 1–2. The point: an element is not proven by sounding sacral, but by surviving a test that could have falsified it.'}
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{sv ? 'Evidensskikt' : 'Evidence layers'}</h3>
                {(['core', 'extended', 'control'] as EvidenceLayer[]).map((layer) => {
                  const m = EVIDENCE_LAYER_META[layer];
                  const n = PLACE_NAME_ELEMENTS.filter((e) => e.evidenceLayer === layer).length;
                  return (
                    <div key={layer} className="mb-2">
                      <span className="font-medium text-foreground">{sv ? m.label : m.labelEn}</span>{' '}
                      <span className="text-xs text-muted-foreground">({n} {sv ? 'led' : 'elements'})</span>
                      <p className="max-w-2xl text-xs text-muted-foreground">{sv ? m.note : m.noteEn}</p>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{sv ? 'Varje led har en boundary-regel (prefix/suffix) och kända falska träffar bestämda i förväg — urvalet går att upprepa, inte ad hoc.' : 'Each element has a boundary rule and known false hits decided in advance — the selection is reproducible, not ad hoc.'}</p>
                <p>{sv ? 'Kontrollerna (baslinjen) är vanliga bebyggelsesuffix (-by, -inge, -hem, -sjö) som INTE ska visa signal — de fångar falska positiva.' : 'The controls (baseline) are ordinary settlement suffixes (-by, -inge, -hem, -sjö) that should show NO signal — they catch false positives.'}</p>
                <p className="text-xs opacity-80">{sv ? 'Källor: Svenskt ortnamnslexikon (SOL 2003); projektets metodrevision; koordinater ur Wikidata (CC0).' : 'Sources: Swedish place-name lexicon (SOL 2003); the project method revision; coordinates from Wikidata (CC0).'}</p>
              </div>
            </div>
          </TabsContent>

          {/* ---- FLIK 0b: ORTNAMNSLED-UTFORSKARE (välj led → matar steg 1) ---- */}
          <TabsContent value="led">
            <PlaceNameElementExplorer
              elementCounts={elementCounts}
              sv={sv}
              onTest={(k) => { setElementTest([k]); setTab('hypotes'); scrollTo('hypothesis-test-card'); }}
            />
          </TabsContent>

          {/* ---- FLIK 1: HYPOTESTESTAREN ---- */}
          <TabsContent value="hypotes">
            <div className="viking-card rounded-lg border border-accent/30 p-4 mb-5">
              <p className="text-sm text-foreground font-medium mb-1">{sv ? 'Vad svarar det här på?' : 'What does this answer?'}</p>
              <p className="text-sm text-muted-foreground max-w-3xl">
                {sv
                  ? 'Ligger en viss sorts ortnamn systematiskt nära — eller långt från — något, t.ex. kyrkor, fornborgar eller andra namn? Verktyget mäter avstånd till närmaste objekt och räknar hur många objekt som ligger inom en dagsresa, och jämför alltid mot en baslinje (vanliga bebyggelsenamn). Allt redovisar antal (n), median och osäkerhet — inga tvärsäkra slutsatser.'
                  : 'Does a kind of place name systematically lie near — or far from — churches, hillforts or other features? The tool measures distance to the nearest feature and counts features within a day’s travel, always compared to a baseline. Everything reports n, median and uncertainty.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{sv ? 'Prova:' : 'Try:'}</span>
                <Button size="sm" variant="outline" className="h-7 text-xs border-gold/60 text-gold hover:bg-gold/10"
                  onClick={() => tryHypothesis(['tuna', 'husby'])}>
                  <FlaskConical className="h-3 w-3 mr-1" />{sv ? 'Makt (-tuna, husby) mot baslinjen' : 'Power (-tuna, husby) vs baseline'}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs border-gold/60 text-gold hover:bg-gold/10"
                  onClick={() => tryHypothesis(['tor', 'frö', 'oden'])}>
                  <FlaskConical className="h-3 w-3 mr-1" />{sv ? 'Sakralt (Tor, Frö, Oden)' : 'Sacral (Thor, Frey, Odin)'}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/10"
                  onClick={() => tryHypothesis(['snack'])}>
                  <FlaskConical className="h-3 w-3 mr-1" />{sv ? 'Snäck (ledung)' : 'Snäck (naval levy)'}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground/80 mt-2">
                {sv ? 'Snäck (ledung)-testet — källa: ' : 'The Snäck (ledung) test — source: '}
                <a href="http://kulturarvsdata.se/raa/fornvannen/html/1972_180" target="_blank" rel="noopener noreferrer" className="text-cyan-300/90 hover:underline">{SNACK_SOURCE}</a>.
                {sv ? ' Endast ~8 taggade snäck-namn i registret → underpowered; det ideala målet (kustlinje/ting) är ännu ej ett target i testet.' : ' Only ~8 tagged snäck names → underpowered; the ideal target (coastline/ting) is not yet a target in the tester.'}
              </p>
            </div>

            {/* Vad grupperna betyder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {GROUP_DEFS.map((g) => (
                <Card key={g.key} className="viking-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2" style={{ color: g.color }}>
                      ● {sv ? g.sv : g.en}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-2">
                    <p>{sv ? g.desc : g.descEn}</p>
                    <div className="flex flex-wrap gap-1">
                      {g.els.map((k) => (
                        <span key={k} className="px-1.5 py-0.5 rounded border border-slate-600 text-slate-300">{elementLabel(k)}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DistanceStatsCard sv={sv} />
            <FreeDistanceStatsCard sv={sv} />
            <ChurchDistanceCard sv={sv} />
            <HeritageProximityCard sv={sv} />
            <SaintCentralityCard sv={sv} />
            <RunicCorpusCard sv={sv} cohort={runicCohort} onChange={setRunicCohort} />
            <RunicWordCard sv={sv} cohort={runicCohort} />
            <RunicTransitionCard sv={sv} />
            <EliteMonumentsCard sv={sv} />
            <WordRefineCard sv={sv} />

            {/* Så förbättrar vi urvalet */}
            <Card className="viking-card border-sky-700/40">
              <CardContent className="py-4 text-sm text-muted-foreground space-y-2">
                <p className="text-foreground font-medium">{sv ? 'Så gör vi urvalet bättre' : 'How we improve the sample'}</p>
                <p>
                  {sv
                    ? 'Dagens punkter kommer mest från OSM-gazetteern, som är ojämn i precision och saknar ålder. Starkare statistik kräver fler verifierade punkter från auktoritativa källor:'
                    : 'Today’s points come mostly from the OSM gazetteer, uneven in precision and without age. Stronger statistics need more verified points from authoritative sources:'}
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{sv ? 'Lantmäteriets ortnamn och Isof Ortnamnsregistret (kanonisk namnform + koordinat)' : 'Lantmäteriet place names & Isof name register'}</li>
                  <li>{sv ? 'Jordbruksverkets blockdatabas (bytomter/åkermark → bebyggelsepunkt)' : 'Jordbruksverket block database (village tofts / arable → settlement point)'}</li>
                  <li>{sv ? 'Fornsök/RAÄ (Kulturmiljöregistret) för daterade lämningar intill bytomten' : 'Fornsök/RAÄ heritage register for dated remains by the toft'}</li>
                </ul>
                <p>
                  {sv
                    ? 'Fler verifierade punkter → möjlighet att skilja tidiga från sena namn och att mäta per landskap i stället för hela landet på en gång.'
                    : 'More verified points → separate early from late names and measure per province.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- FLIK 2: ORTNAMNSKLUSTER ---- */}
          <TabsContent value="kluster">
            {/* Snabbstart: prova-exempel överst så man direkt ser vad verktyget gör. */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{sv ? 'Prova direkt:' : 'Try now:'}</span>
              <Button size="sm" variant="outline" className="h-7 text-xs border-gold/60 text-gold hover:bg-gold/10"
                onClick={() => tryCluster('h1')}>
                <Radar className="h-3 w-3 mr-1" />{sv ? '-by kring Sandby borg (skarp kant)' : '-by around Sandby borg (sharp edge)'}
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs border-gold/60 text-gold hover:bg-gold/10"
                onClick={() => tryCluster('h2')}>
                <Radar className="h-3 w-3 mr-1" />{sv ? '-torp kring Gråborg' : '-torp around Gråborg'}
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs border-slate-500 text-slate-300 hover:bg-slate-700/40"
                onClick={() => tryCluster('n1')}>
                <Radar className="h-3 w-3 mr-1" />{sv ? 'Ismantorp — negativ kontroll' : 'Ismantorp — negative control'}
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/10"
                onClick={() => tryCluster('a_nora')}>
                <Radar className="h-3 w-3 mr-1" />{sv ? 'Ångermanland: Nora' : 'Ångermanland: Nora'}
              </Button>
            </div>

            {/* Verktyg + resultat FÖRST (Daniel: syns direkt, ej begravt under prosa). */}
            <div id="cluster-card" className="scroll-mt-24"><OnomasticClusterCard /></div>
            <AngermanlandClusterResults sv={sv} />

            {/* Metod-förklaringen hopfällbar nederst — kortar sidan. */}
            <details className="viking-card mt-4 rounded-lg border border-accent/30 p-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground">{sv ? 'Om metoden — vad svarar det här på?' : 'About the method — what does this answer?'}</summary>
              <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                {sv
                  ? 'Klumpar ett namnled ihop sig kring en punkt (ett epicentrum, t.ex. en borg eller centralort), eller är det jämnt spritt över landskapet? Verktyget ritar en pricktavla och en radiell profil — hur tätheten avtar med avståndet — och jämför mot vad ren slump skulle ge (ett binomialband). Det letar en skarp, falsifierbar kant där mönstret bryts, i stället för att resonera i cirkel ("namnen ligger nära för att de hör ihop").'
                  : 'Does a name element clump around a point (an epicentre such as a fort or central place), or is it evenly spread? The tool draws a scatter plot and a radial profile — how density falls with distance — compared to what pure chance would give (a binomial band). It seeks a sharp, falsifiable edge rather than circular reasoning.'}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground/80">
                {sv ? 'Verktyget stödjer nu Öland (Daniels pilotfall) och Ångermanland (Agneta Nyholms centralplatser som epicentra, kult-/maktled kombinerat, -sjö som nollkontroll). Växla landskap i kortet.' : 'The tool now supports Öland and Ångermanland (Agneta Nyholm’s central places as epicentres). Switch province in the card.'}
              </p>
            </details>
          </TabsContent>

          {/* ---- FLIK 3: AI FILOLOG-AGENT ---- */}
          <TabsContent value="filolog">
            <div className="viking-card rounded-lg border border-gold/30 p-4 mb-4">
              <p className="text-sm text-foreground font-medium mb-1">{sv ? 'Vad är det här?' : 'What is this?'}</p>
              <p className="text-sm text-muted-foreground max-w-3xl">
                {sv
                  ? 'Att låta en filolog (språkvetare och ortnamnsforskare) gå igenom namnen är mer än att söka led. Det är historisk-komparativ metod: jämför nordiska, germanska och indoeuropeiska kognater, räknar baklänges med ljudlagar (Grimms lag) till *rekonstruerade urformer, och skiljer strikt belagt (äldsta skriftbelägg med år och källa) från *rekonstruktion och från obelagt. Sjö- och ånamn (hydronymer) är det äldsta språkskiktet och kan bära för-indoeuropeiskt substrat. En folketymologi blir aldrig en etymologi.'
                  : 'Letting a philologist go through the names is more than element-matching. It is the historical-comparative method: comparing Nordic, Germanic and Indo-European cognates, working backwards via sound laws (Grimm’s law) to *reconstructed proto-forms, and strictly separating attested from *reconstruction and from unattested. Hydronyms are the oldest layer and may carry pre-Indo-European substrate. A folk etymology never becomes an etymology.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { t: sv ? '1. Belägg' : '1. Attested', d: sv ? 'Äldsta skriftliga formen med år och källa (Isof, SOL, jordeböcker). Utgångspunkten — inte den moderna stavningen.' : 'The earliest written form with year and source. The starting point, not the modern spelling.' },
                { t: sv ? '2. Rekonstruktion' : '2. Reconstruction', d: sv ? 'Ljudlagar baklänges → *urform (märkt med asterisk). Jämförs med kognater i besläktade språk.' : 'Sound laws backwards → *proto-form (asterisked), compared with cognates.' },
                { t: sv ? '3. Osäkerhet' : '3. Uncertainty', d: sv ? 'Belagt, rekonstruerat och obelagt hålls isär. Folketymologier avfärdas uttryckligen.' : 'Attested, reconstructed and unattested kept apart. Folk etymologies rejected explicitly.' },
              ].map((s) => (
                <Card key={s.t} className="viking-card">
                  <CardHeader className="pb-1"><CardTitle className="text-sm text-gold">{s.t}</CardTitle></CardHeader>
                  <CardContent className="text-xs text-muted-foreground">{s.d}</CardContent>
                </Card>
              ))}
            </div>
            <Card className="viking-card border-gold/30">
              <CardContent className="py-4 text-sm text-muted-foreground space-y-2">
                <p>
                  {sv
                    ? <><strong className="text-foreground">Så fungerar agenten:</strong> metoden drivs källkritiskt av vår AI-filolog med <strong>människa-i-loopen</strong> — agenten utreder och föreslår, en människa granskar och beslutar, och inget skrivs som fakta utan belägg. Det är alltså en agent vi kör på begäran, inte en självbetjänings-chatt (än). Läs om hela agentflottan på <a href="/ai-agenter" className="text-gold hover:underline">/ai-agenter</a>.</>
                    : <><strong className="text-foreground">How the agent works:</strong> the method is run source-critically by our AI philologist with a <strong>human in the loop</strong> — it investigates and proposes, a human reviews and decides, and nothing is written as fact without evidence. It is an agent we run on request, not a self-service chatbot (yet). See <a href="/ai-agenter" className="text-gold hover:underline">/ai-agenter</a>.</>}
                </p>
                <p className="text-xs opacity-80">
                  {sv
                    ? 'Verktyget "Ortnamnskluster" i grannfliken är den kvantitativa halvan av filologens arbete: det prövar om ett led klustrar kring ett epicentrum med en skarp, falsifierbar kant i stället för cirkelbevis.'
                    : 'The "Name clustering" tab is the quantitative half of the philologist’s work: it tests whether an element clusters around an epicentre with a sharp, falsifiable edge.'}
                </p>
                <Button size="sm" variant="outline" className="h-7 text-xs border-gold/60 text-gold hover:bg-gold/10"
                  onClick={() => tryCluster('h1')}>
                  <Radar className="h-3 w-3 mr-1" />{sv ? 'Öppna Ortnamnskluster (Sandby borg)' : 'Open Name clustering (Sandby borg)'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ===== FLIK: NAMNBASEN (korpusen som verktygen testar mot) =====
            Egen flik (Daniel): basen av orden, skild från verktygen ovan. `tab` är kontrollerad
            state, så vi gate:ar sektionerna på den även utanför <Tabs>. Proveniens överst:
            OSM-härledd bas ≠ Isofs reglerade Ortnamnsregistret. */}
        {tab === 'namnbas' && (
        <div className="space-y-6">
          <div className="viking-card rounded-lg border border-accent/30 p-4 text-sm text-muted-foreground space-y-2">
            <p className="text-foreground font-medium">{sv ? 'Om namnbasen — var orden kommer ifrån' : 'About the name base — where the words come from'}</p>
            <p>{sv
              ? 'Ortnamnen nedan (place_names) är till ~99 % maskinellt insamlade ur OpenStreetMap och normaliserade — en bred, oregisterad bas som är bra för spatial hypotestestning (avstånd, kluster), men inte en filologiskt granskad namnlista.'
              : 'The place names below (place_names) are ~99% machine-harvested from OpenStreetMap and normalised — a broad, unregulated base, good for spatial hypothesis testing (distance, clustering), but not a philologically vetted name list.'}</p>
            <p>{sv
              ? 'Isofs Ortnamnsregistret är däremot en reglerad, granskad auktoritet (äldre belägg, fastställda uppslagsformer). Den har inte exakt samma ord som vår OSM-bas och är inte fullt integrerad här — vi jämför/verifierar mot den, den är inte vår källa.'
              : 'Isof’s Ortnamnsregistret, by contrast, is a regulated, vetted authority (older attestations, established head-forms). It does not hold exactly the same words as our OSM base, and is not fully integrated here — we compare/verify against it; it is not our source.'}{' '}
              <a href="https://www.isof.se/namn/ortnamn/vara-ortnamnssamlingar/ortnamnsregistret" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Isof →</a></p>
            <p className="text-xs opacity-80">{sv
              ? 'De äldsta beläggen och belägg-över-tid nedan kommer ur daterings-/beläggskällor (redovisade per post); runleden ur runkorpusen.'
              : 'The oldest attestations and attestations-over-time below come from dating/attestation sources (cited per entry); the runic elements from the runic corpus.'}</p>
          </div>

        {/* De äldsta daterade bebyggelsenamnen (kondenserad) */}
        {oldestNames.length > 0 && (
          <Section title={sv ? 'De äldsta bebyggelsenamnen' : 'The oldest settlement names'} count={datings.length}>
            <p className="text-sm text-muted-foreground max-w-3xl mb-3">
              {sv
                ? 'Namn som går att datera arkeologiskt, äldst först. Dateringen är fyndplatsens (boplats eller gravfält intill bytomten) och en hypotes om namnets ålder — inte en objektiv mätpunkt. ⚠︎ markerar de fall där Vikstrand själv satte frågetecken.'
                : 'Names datable archaeologically, oldest first. The dating is that of the find spot and a hypothesis about the name’s age. ⚠︎ marks Vikstrand’s own uncertainty.'}
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
          </Section>
        )}

        {/* Namnleds-katalogen flyttad till fliken "Ortnamnsled" ovan (steg 0b). */}

        {/* Namnleden i runinskrifterna (kondenserad) */}
        {runic && (
          <Section title={sv ? 'Namnleden i runinskrifterna' : 'The elements in the runic inscriptions'}>
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
          </Section>
        )}

        {/* Beläggkedjor över tid (kondenserad) */}
        {chains.length > 0 && (
          <Section title={sv ? 'Belägg över tid' : 'Attestations over time'} count={chains.length}>
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
          </Section>
        )}

        {/* Ortnamnslistan från DB (kondenserad, öppen som standard) */}
        <div id="place-name-list" className="scroll-mt-24" />
        <Section title={sv ? 'Ortnamnen' : 'The place names'} count={places.length} defaultOpen>

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

        <div className="flex items-center gap-3 mb-5 text-sm text-muted-foreground flex-wrap">
          <span>{sv ? 'Visar' : 'Showing'} <strong className="text-foreground">{filtered.length}</strong> {sv ? 'av' : 'of'} {places.length}</span>
          {elementKey !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setElementTest([elementKey]);
                document.getElementById('hypothesis-test-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="h-7 text-xs border-gold/60 text-gold hover:bg-gold/10"
              title={sv ? 'Kör hypotestestaren på detta namnled (avstånd/frekvens mot kontrollgruppen)' : 'Run the hypothesis tester on this element'}
            >
              <FlaskConical className="h-3 w-3 mr-1" />
              {sv ? `Analysera "${elementLabel(elementKey)}"` : `Analyse "${elementLabel(elementKey)}"`}
            </Button>
          )}
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
        </Section>
        </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PlaceNames;
