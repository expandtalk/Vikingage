import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Share2, Search, Boxes, GitFork, Ruler, CalendarClock, BookMarked } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOntology } from '@/hooks/useOntology';

const StatusBadge: React.FC<{ status?: string; sv: boolean }> = ({ status, sv }) => (
  <Badge variant="outline" className={`text-[10px] ${status === 'active' ? 'border-emerald-500 text-emerald-300' : 'border-amber-500 text-amber-300'}`}>
    {status === 'active' ? (sv ? 'aktiv' : 'active') : (sv ? 'planerad' : 'planned')}
  </Badge>
);

const Ontology = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data, isLoading } = useOntology();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const d = data ?? { types: [], predicates: [], measures: [], methods: [], references: [] };
  const match = (...parts: (string | null | undefined)[]) => !query || parts.some((p) => (p ?? '').toLowerCase().includes(query));

  const types = useMemo(() => d.types.filter((t) => match(t.code, t.label_sv, t.label_en, t.description, t.physical_table)), [d.types, query]);
  const predicates = useMemo(() => d.predicates.filter((p) => match(p.code, p.label_sv, p.label_en, p.subject_type, p.object_type, p.description)), [d.predicates, query]);
  const measures = useMemo(() => d.measures.filter((m) => match(m.code, m.label_sv, m.label_en, m.rpc, m.description)), [d.measures, query]);
  const methods = useMemo(() => d.methods.filter((m) => match(m.code, m.label_sv, m.label_en, m.description, m.resolution)), [d.methods, query]);
  const references = useMemo(() => d.references.filter((r) => match(r.authors, r.title, r.container, String(r.year))), [d.references, query]);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Ontologi"
        titleEn="Ontology"
        description="Viking Age-plattformens agent-läsbara kontrakt: entitetstyper, relationer, mätoperationer, vetenskapliga dateringsmetoder och referenser — ett tunt lager ovanpå de källförda tabellerna."
        descriptionEn="The platform's agent-readable contract: entity types, relations, measures, scientific dating methods and references — a thin layer over the sourced tables."
        keywords="ontologi, kunskapsgraf, entitetstyper, relationer, dateringsmetoder, aDNA, kol-14, vetenskapliga referenser"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Share2 className="h-8 w-8 text-gold" />
            {sv ? 'Ontologi' : 'Ontology'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {sv
              ? 'Det maskinläsbara kontraktet över vad plattformen vet och vad som kan mätas — så forskare och AI-agenter kan komponera hypoteser utan att läsa hela databasschemat. Ett tunt lager ovanpå de källförda, typade tabellerna: primärdata flyttas aldrig ner i lösa tripplar.'
              : 'The machine-readable contract of what the platform knows and what can be measured — so researchers and AI agents can compose hypotheses without reading the whole schema. A thin layer over the sourced, typed tables.'}
          </p>
        </div>

        {/* Principer */}
        <Card className="viking-card mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-foreground text-base">{sv ? 'Grundprinciper' : 'Core principles'}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p>1. {sv ? 'Typade tabeller är sanningen — ontologin är ett tunt lager, inte en ersättning.' : 'Typed tables are the truth — the ontology is a thin layer, not a replacement.'}</p>
            <p>2. {sv ? 'Proveniens + osäkerhet är obligatoriska. Ingen nod/kant utan källa.' : 'Provenance + uncertainty are mandatory. No node/edge without a source.'}</p>
            <p>3. {sv ? 'Konfidens propagerar: en hypoteskedja är aldrig starkare än sin svagaste länk (belagd > trolig > tradition > hypotes > omtvistad).' : 'Confidence propagates: a chain is never stronger than its weakest link.'}</p>
            <p>4. {sv ? 'Datering ≠ objektiv mätpunkt — den bär metod (kol-14, dendro, numismatik…) och referens.' : 'Dating ≠ objective point — it carries a method and a reference.'}</p>
            <p>5. {sv ? 'Observation ≠ tolkning. Mätlagret (metall, isotop, hällristnings-observation, dateringsargument) är single source of truth — rent, avdubblat, källfört. Tolkningar hålls plurala, attribuerade och tidsstämplade — de skiftar med generationer och strömningar — aldrig konsoliderade till "sanningen".' : 'Observation ≠ interpretation. The measurement layer (metal, isotope, rock-art observation, dating argument) is the single source of truth — clean, de-duplicated, sourced. Interpretations stay plural, attributed and time-stamped — they shift with generations and currents — never consolidated into "the truth".'}</p>
          </CardContent>
        </Card>

        {/* Analyslägen — de fyra sätten att arbeta med underlaget */}
        <Card className="viking-card mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-foreground text-base">{sv ? 'Analyslägen' : 'Analysis modes'}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Explore Motor.</strong> {sv ? 'Ingång via plats, ort eller årtal. Samlokalisering mot en nollmodell (lokal ring / regionrestriktion) — "är det här ovanligt?" Genererar testbara hypoteser, bevisar aldrig.' : 'Entry by place, locality or year. Co-location against a null model — "is this unusual?" Generates testable hypotheses, never proves.'}</p>
            <p><strong className="text-foreground">Stresstest.</strong> {sv ? 'Skalar bort fel i fyra lager: dataintegritet, källkvalitet, statistisk artefakt — och tolkningsbias (nationalism, bekräftelse). Bara de tre första är maskinella; det fjärde innehålls av struktur (observation≠tolkning, konkurrerande läsningar) + interpreter-effect-test (spårar slutsatsen av VEM snarare än evidensen?).' : 'Peels away error in four layers: data integrity, source quality, statistical artifact — and interpretive bias. Only the first three are mechanical; the fourth is contained by structure + an interpreter-effect test.'}</p>
            <p><strong className="text-foreground">Fingerprinting.</strong> {sv ? 'Forensisk identifiering. Idag: AI-analys (form/typologi/datering + caveats, ingen mock-fallback) för runsten/fornborg/grav, plus metallprovenienis-matchning (isotop → malmkälla). Multimodal vektor-likhet (fingerprint_match) är nästa bygge.' : 'Forensic identification. Today: AI analysis (form/typology/dating + caveats, no mock) for runestone/hillfort/grave, plus metal-provenance matching. Multimodal vector similarity is the next build.'}</p>
            <p><strong className="text-foreground">Digital Twin.</strong> {sv ? '(a) Komplett källbelagd representation av ett objekt — ontologins slutmål, underlaget allt annat äter. (b) Simulering (strandlinje år 800, saknad centralort) — kraftfull men märkt sandlåda: "modellerat, ej belagt".' : '(a) Complete sourced representation of an object — the substrate. (b) Simulation — powerful but a labelled sandbox: "modelled, not attested".'}</p>
          </CardContent>
        </Card>

        {/* Claim-lager — konkurrerande påståenden */}
        <Card className="viking-card mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-foreground text-base">{sv ? 'Claim-lagret — konkurrerande påståenden' : 'The claim layer — competing assertions'}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              {sv
                ? 'Vid sidan av entiteterna finns ett claim-lager där tolkningar hålls plurala. Varje påstående bär källa, förespråkare (fullständigt namn) och konfidens; motstridiga påståenden kan länkas explicit som konflikt. Ingen tolkning auto-befordras.'
                : 'Alongside the entities sits a claim layer where interpretations are kept plural. Each assertion carries a source, a proponent (full name) and a confidence; conflicting assertions can be linked explicitly. No interpretation is auto-promoted.'}
            </p>
            <p><code className="text-gold/90">place_claim</code> — {sv ? 'attribut-nycklade påståenden om platser (datering, funktion …) med verifieringsstatus.' : 'attribute-keyed assertions about places (dating, function …) with verification status.'}</p>
            <p><code className="text-gold/90">interpretation_claim</code> — {sv ? 'konkurrerande runläsningar per textparti (transkription / etablerad / omstridd / oberoende / förkastad).' : 'competing runic readings per text part (transcription / established / disputed / independent / rejected).'}</p>
            <p><code className="text-gold/90">place_name_relation</code> — {sv ? 'namn-relationer över tid (föregångsnamn m.m.) som hypoteser med förespråkare och belägg — skilt från dedup av samma namn.' : 'name relations over time (predecessor names etc.) as hypotheses with proponent and evidence — distinct from de-duplicating the same name.'}</p>
            <p className="text-xs opacity-80">{sv ? 'Ortnamnsled-katalogen (sakrala, makt, natur) med tidsskikt är också utbyggd och driver den onomastiska analysen.' : 'The place-name-element catalogue (sacral, power, nature) with time strata has also been extended and drives the onomastic analysis.'}</p>
          </CardContent>
        </Card>

        {/* Vad som INTE är noder i grafen — sök vs KG */}
        <Card className="viking-card mb-6 border-amber-700/40">
          <CardHeader className="pb-2"><CardTitle className="text-foreground text-base">{sv ? 'Sökindex ≠ kunskapsgraf' : 'Search index ≠ knowledge graph'}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              {sv
                ? 'Allt som går att söka är inte en nod i grafen. Det nationella ortnamnsregistret (place_names, ~358 000 namn, till största delen OpenStreetMap) ligger i sökindexet så att namn kan hittas — men de är inte entiteter i kunskapsgrafen (entity_registry) och bär inte grafens relationer.'
                : 'Not everything searchable is a graph node. The national place-name register (place_names, ~358,000 names, mostly OpenStreetMap) lives in the search index so names are findable — but they are not entities in the knowledge graph (entity_registry) and do not carry its relations.'}
            </p>
            <p>
              {sv
                ? 'Ett ortnamn befordras till en grafnod först när det kurerats och källbelagts (t.ex. via ett claim eller en kurerad platssida). Skillnaden hålls medvetet: sökbarhet är billigt, grafmedlemskap kräver proveniens.'
                : 'A place name is promoted to a graph node only once it is curated and sourced (e.g. via a claim or a curated place page). The distinction is deliberate: searchability is cheap, graph membership requires provenance.'}
            </p>
          </CardContent>
        </Card>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={sv ? 'Sök i ontologin…' : 'Search the ontology…'} className="pl-9 bg-slate-800/60 border-slate-600 text-white" />
        </div>

        {isLoading ? <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p> : (
          <div className="space-y-8">
            {/* Entitetstyper */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2"><Boxes className="h-6 w-6 text-gold" />{sv ? 'Entitetstyper' : 'Entity types'} <span className="text-base font-normal text-muted-foreground">({types.length})</span></h2>
              <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {types.map((t) => (
                  <Card key={t.code} className="viking-card">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-foreground text-sm flex items-center justify-between gap-2">
                        <span>{sv ? t.label_sv : (t.label_en || t.label_sv)}</span><StatusBadge status={t.status} sv={sv} />
                      </CardTitle>
                      <div className="text-[11px] text-muted-foreground font-mono">{t.code} → {t.physical_table}</div>
                    </CardHeader>
                    {t.description && <CardContent className="text-xs text-muted-foreground">{t.description}</CardContent>}
                  </Card>
                ))}
              </div>
            </section>

            {/* Relationstyper */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2"><GitFork className="h-6 w-6 text-gold" />{sv ? 'Relationstyper' : 'Relation types'} <span className="text-base font-normal text-muted-foreground">({predicates.length})</span></h2>
              <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {predicates.map((p) => (
                  <Card key={p.code} className="viking-card">
                    <CardContent className="py-3">
                      <div className="text-sm text-foreground font-medium">{sv ? p.label_sv : (p.label_en || p.label_sv)}</div>
                      <div className="text-[11px] font-mono text-gold/90 my-1">{p.subject_type} —[{p.code}]→ {p.object_type}</div>
                      {p.description && <div className="text-xs text-muted-foreground">{p.description}</div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Mätoperationer */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2"><Ruler className="h-6 w-6 text-gold" />{sv ? 'Mätoperationer' : 'Measures'} <span className="text-base font-normal text-muted-foreground">({measures.length})</span></h2>
              <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {measures.map((m) => (
                  <Card key={m.code} className="viking-card">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-foreground text-sm flex items-center justify-between gap-2">
                        <span>{sv ? m.label_sv : (m.label_en || m.label_sv)}</span><StatusBadge status={m.status} sv={sv} />
                      </CardTitle>
                      <div className="text-[11px] text-muted-foreground font-mono">rpc: {m.rpc} · {m.output_unit}</div>
                    </CardHeader>
                    {m.description && <CardContent className="text-xs text-muted-foreground">{m.description}</CardContent>}
                  </Card>
                ))}
              </div>
            </section>

            {/* Dateringsmetoder */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2"><CalendarClock className="h-6 w-6 text-gold" />{sv ? 'Dateringsmetoder' : 'Dating methods'} <span className="text-base font-normal text-muted-foreground">({methods.length})</span></h2>
              <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {methods.map((m) => (
                  <Card key={m.code} className="viking-card">
                    <CardHeader className="pb-1"><CardTitle className="text-foreground text-sm">{sv ? m.label_sv : (m.label_en || m.label_sv)}</CardTitle>
                      <div className="text-[11px] text-muted-foreground">{sv ? 'Upplösning' : 'Resolution'}: {m.resolution}</div>
                    </CardHeader>
                    {m.description && <CardContent className="text-xs text-muted-foreground">{m.description}</CardContent>}
                  </Card>
                ))}
              </div>
            </section>

            {/* Vetenskapliga referenser */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2"><BookMarked className="h-6 w-6 text-gold" />{sv ? 'Vetenskapliga referenser' : 'Scientific references'} <span className="text-base font-normal text-muted-foreground">({references.length})</span></h2>
              <div className="h-0.5 w-16 bg-accent/60 rounded mb-3" />
              <div className="space-y-2">
                {references.map((r) => (
                  <div key={r.id} className="text-sm text-muted-foreground border-b border-slate-800/60 pb-2">
                    <span className="text-foreground">{r.authors}</span> {r.year && `(${r.year})`}. {r.title && <em>{r.title}</em>}
                    {r.container && `. ${r.container}`}{r.volume && ` ${r.volume}`}.
                    {r.doi && <> <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">doi:{r.doi}</a></>}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Ontology;
