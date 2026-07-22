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
