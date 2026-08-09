import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon, FlaskConical, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SITE_PAGE_GROUPS } from '@/config/researchPages';

// Sidöversikt: arbetskatalog över regionala + forsknings-sidor som INTE ligger i toppnavet.
// Inte länkad från menyn — nås via /sidor. Datadriven ur researchPages-registryn.
const ICON = { regions: MapIcon, research: FlaskConical } as const;

const SiteIndex = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Sidöversikt — regioner & forskning"
        titleEn="Site index — regions & research"
        description="Arbetskatalog över regionala och forskningssidor på vikingage.se."
        descriptionEn="Working index of regional and research pages."
        keywords="sidöversikt, regioner, forskning"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">{sv ? 'Sidöversikt' : 'Site index'}</h1>
        <p className="text-muted-foreground mb-6">
          {sv
            ? 'Regionala och forskningssidor som inte (ännu) ligger i toppnavet.'
            : 'Regional and research pages not (yet) in the top navigation.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SITE_PAGE_GROUPS.map((group) => {
            const Icon = ICON[group.key];
            return (
              <Card key={group.key} className="viking-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-gold">
                    <Icon className="h-5 w-5" /> {sv ? group.sv : group.en}
                    <span className="text-muted-foreground text-sm font-normal">({group.pages.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {group.pages.map((p) => (
                      <li key={p.path}>
                        <Link to={p.path} className="group flex items-start gap-2 rounded-md p-2 hover:bg-slate-800/60 transition-colors">
                          <ArrowUpRight className="h-4 w-4 mt-0.5 shrink-0 text-orange-400" />
                          <span className="min-w-0">
                            <span className="text-sm font-medium text-foreground group-hover:text-white">{p.label}</span>
                            {p.desc && <span className="block text-xs text-muted-foreground">{p.desc}</span>}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SiteIndex;
