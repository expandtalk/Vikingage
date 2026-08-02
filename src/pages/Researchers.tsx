import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Users, Search, BookOpen, ExternalLink, ChevronDown, ChevronRight, Calendar, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResearchers, type Scholar } from '@/hooks/useResearchers';

const Researchers = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { researchers, isLoading } = useResearchers();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const t = sv ? {
    title: 'Forskare & källor',
    subtitle: 'Forskarna bakom materialet på Viking Age och de källor (böcker, artiklar, avhandlingar) som är kopplade till respektive forskare.',
    searchPlaceholder: 'Sök forskare eller institution…',
    loading: 'Laddar forskare…',
    empty: 'Inga forskare matchade sökningen.',
    works: (n: number) => (n === 1 ? '1 källa' : `${n} källor`),
    noWorks: 'Inga kopplade källor ännu.',
    show: 'Visa källor',
    hide: 'Dölj källor',
    total: (n: number) => `${n} forskare`,
  } : {
    title: 'Researchers & sources',
    subtitle: 'The researchers behind the material on Viking Age, and the sources (books, articles, dissertations) linked to each.',
    searchPlaceholder: 'Search researchers or affiliation…',
    loading: 'Loading researchers…',
    empty: 'No researchers matched your search.',
    works: (n: number) => (n === 1 ? '1 source' : `${n} sources`),
    noWorks: 'No linked sources yet.',
    show: 'Show sources',
    hide: 'Hide sources',
    total: (n: number) => `${n} researchers`,
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? researchers.filter((r) =>
          r.name.toLowerCase().includes(q) || (r.affiliation ?? '').toLowerCase().includes(q),
        )
      : researchers;
    return base
      .slice()
      .sort((a, b) => b.workCount - a.workCount || a.name.localeCompare(b.name, sv ? 'sv' : 'en'));
  }, [researchers, query, sv]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderScholar = (scholar: Scholar) => {
    const isOpen = expanded.has(scholar.id);
    return (
      <Card key={scholar.id} className="viking-card">
        <Collapsible open={isOpen} onOpenChange={() => toggle(scholar.id)}>
          <CardHeader
            className="pb-2 pt-3 cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onClick={() => toggle(scholar.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(scholar.id);
              }
            }}
          >
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-gold shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gold shrink-0" />
              )}
              <Users className="h-4 w-4 text-gold shrink-0" />
              <span className="truncate">{scholar.name}</span>
              <Badge variant="secondary" className="ml-auto text-[11px] shrink-0 tabular-nums">
                <BookOpen className="h-3 w-3 mr-1" />
                {scholar.workCount}
              </Badge>
            </CardTitle>
            {(scholar.affiliation || scholar.role_title || scholar.active_period) && (
              <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-muted-foreground mt-1">
                {(scholar.affiliation || scholar.role_title) && (
                  <span className="flex items-center gap-1 truncate">
                    <Building2 className="h-3 w-3 shrink-0" />
                    {[scholar.role_title, scholar.affiliation].filter(Boolean).join(', ')}
                  </span>
                )}
                {scholar.active_period && (
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="h-3 w-3" />
                    {scholar.active_period}
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-3">
              {scholar.biography && (
                <p className="text-sm text-muted-foreground mb-3">{scholar.biography}</p>
              )}
              {scholar.works.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">{t.noWorks}</p>
              ) : (
                <ul className="space-y-2 border-t border-border pt-3">
                  {scholar.works.map((w) => (
                    <li key={w.sourceid} className="text-sm">
                      {w.url ? (
                        <a
                          href={w.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold hover:underline font-medium inline-flex items-center gap-1"
                        >
                          {w.title || (sv ? 'Utan titel' : 'Untitled')}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="font-medium text-foreground">
                          {w.title || (sv ? 'Utan titel' : 'Untitled')}
                        </span>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {[w.publication_year, w.publisher].filter(Boolean).join(' · ')}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Forskare & källor"
        titleEn="Researchers & sources"
        description="Bläddra bland forskarna bakom Viking Age och deras publicerade källor - böcker, artiklar och avhandlingar inom runologi och vikingatida forskning."
        descriptionEn="Browse the researchers behind Viking Age and their published sources - books, articles and dissertations in runology and Viking Age research."
        keywords="forskare, källor, runologi, vikingatid, bibliografi, forskning"
      />
      <Header />
      <Breadcrumbs />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-gold" />
            {t.title}
          </h1>
          <p className="text-muted-foreground text-lg">{t.subtitle}</p>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="text-center text-foreground py-12">{t.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">{t.empty}</div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4 tabular-nums">{t.total(filtered.length)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(renderScholar)}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Researchers;
