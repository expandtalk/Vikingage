import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHistoricalEvents } from '@/hooks/useHistoricalEvents';

const formatYear = (y: number | null | undefined, sv: boolean) => {
  if (y == null) return '';
  if (y < 0) return `${Math.abs(y)} ${sv ? 'f.Kr.' : 'BCE'}`;
  return `${y} ${sv ? 'e.Kr.' : 'CE'}`;
};

const SIGNIFICANCE_STYLE: Record<string, string> = {
  high: 'bg-red-700/60 text-white border-red-500',
  medium: 'bg-amber-700/60 text-white border-amber-500',
  low: 'bg-slate-700/70 text-slate-100 border-slate-500',
};

const HistoricalEvents = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: events = [], isLoading } = useHistoricalEvents();
  const [type, setType] = useState<string>('all');

  const types = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((e) => {
      const t = e.event_type ?? 'övrigt';
      counts.set(t, (counts.get(t) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [events]);

  const filtered = type === 'all' ? events : events.filter((e) => (e.event_type ?? 'övrigt') === type);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Historiska händelser"
        titleEn="Historical events"
        description="Tidslinje över historiska händelser i Norden — slag, kungaval, kristnande och andra vändpunkter, med årtal, region och källor."
        descriptionEn="A timeline of historical events in Scandinavia — battles, royal elections, Christianisation and other turning points, with dates, region and sources."
        keywords="historiska händelser, tidslinje, vikingatid, medeltid, Norden, slag, kungaval, kristnande"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <CalendarClock className="h-8 w-8 text-gold" />
            {sv ? 'Historiska händelser' : 'Historical events'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {sv
              ? 'Vändpunkter i Nordens historia — slag, kungaval, kristnande och andra händelser som formade perioden. Varje post har årtal, berörd region och källor.'
              : 'Turning points in Scandinavian history — battles, royal elections, Christianisation and other events that shaped the period. Each entry has a date, affected region and sources.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong className="text-foreground">{events.length}</strong> {sv ? 'händelser' : 'events'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={type === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setType('all')}>
            {sv ? 'Alla' : 'All'} <Badge variant="secondary" className="ml-2">{events.length}</Badge>
          </Button>
          {types.map(([t, n]) => (
            <Button key={t} variant={type === t ? 'default' : 'outline'} size="sm" onClick={() => setType(t)}>
              {t} <Badge variant="secondary" className="ml-2">{n}</Badge>
            </Button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <div className="relative border-l-2 border-slate-600/50 ml-3 space-y-6">
            {filtered.map((e) => {
              const name = sv ? e.event_name : e.event_name_en || e.event_name;
              const desc = sv ? e.description : e.description_en || e.description;
              const years = e.year_end && e.year_end !== e.year_start
                ? `${formatYear(e.year_start, sv)} – ${formatYear(e.year_end, sv)}`
                : formatYear(e.year_start, sv);
              return (
                <div key={e.id} className="relative pl-6">
                  <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-gold border-2 border-slate-900" />
                  <Card className="viking-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-mono text-gold">{years}</span>
                        <div className="flex gap-2">
                          {e.event_type && <Badge variant="outline" className="text-xs">{e.event_type}</Badge>}
                          {e.significance_level && (
                            <Badge variant="secondary" className={`text-xs ${SIGNIFICANCE_STYLE[e.significance_level] ?? ''}`}>
                              {e.significance_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-foreground text-lg">{name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
                      {e.region_affected && e.region_affected.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                          <MapPin className="h-3 w-3" />
                          {e.region_affected.join(', ')}
                        </div>
                      )}
                      {e.sources && e.sources.length > 0 && (
                        <p className="text-[11px] text-muted-foreground opacity-75">
                          {sv ? 'Källor' : 'Sources'}: {e.sources.join('; ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HistoricalEvents;
