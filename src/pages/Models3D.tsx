import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { HelmetViewer } from '../components/HelmetViewer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Boxes, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/3d — datadriven 3D-hubb. Listar models_3d (SHM/SweDigArch, CC-BY 4.0). Ny modell dyker upp
// av sig själv; place_slug/theme_slug ger kontextuella länkar in i plattformen.

export interface Model3D {
  slug: string; file_path: string; name_sv: string; name_en: string | null;
  category: string | null; attribution: string | null; sketchfab_url: string | null;
  place_slug: string | null; theme_slug: string | null;
}
const sb = supabase as unknown as { from: (t: string) => any };

const CAT_LABEL: Record<string, string> = {
  hjalm: 'Hjälmar', osteologi: 'Osteologi', helgon: 'Helgon', stenalder: 'Stenålder',
  vapen: 'Vapen', kyrkokonst: 'Kyrkokonst', foremal: 'Föremål',
};

const Models3D: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['models-3d'], staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Model3D[]> => {
      const { data } = await sb.from('models_3d').select('*').order('sort', { ascending: true });
      return (data ?? []) as Model3D[];
    },
  });

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="3D-modeller"
        titleEn="3D models"
        description="Föremål ur svensk forntid i 3D — Historiska museets skanningar (CC-BY 4.0, SweDigArch), cookie-fritt inbäddade."
        descriptionEn="Objects from Sweden's past in 3D — Historiska museet's scans (CC-BY 4.0, SweDigArch), embedded cookie-free."
        keywords="3D, fotogrammetri, SweDigArch, Historiska museet, vendelhjälm, Alundaälgen, forntid"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Boxes className="h-8 w-8 text-gold" />{sv ? '3D-modeller' : '3D models'}
        </h1>
        <p className="text-muted-foreground max-w-3xl mb-6">
          {sv
            ? 'Föremål ur svensk forntid, 3D-skannade av Statens historiska museer inom SweDigArch och fritt återanvändbara under CC-BY 4.0. Vi bäddar in dem cookie-fritt (självhostad visare, inga tredjeparts-skript).'
            : 'Objects from Sweden’s past, 3D-scanned by the National Historical Museums within SweDigArch and freely reusable under CC-BY 4.0. Embedded cookie-free (self-hosted viewer, no third-party scripts).'}
        </p>

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {models.map((m) => (
              <Card key={m.slug} className="viking-card">
                <CardContent className="p-3">
                  <HelmetViewer src={m.file_path} alt={sv ? m.name_sv : (m.name_en ?? m.name_sv)}
                    heightClass="h-[300px]"
                    attribution={<>{m.attribution}{m.sketchfab_url && <> · <a href={m.sketchfab_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Sketchfab</a></>}</>} />
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <h2 className="text-base font-semibold text-foreground">{sv ? m.name_sv : (m.name_en ?? m.name_sv)}</h2>
                    {m.category && <Badge variant="secondary" className="text-[10px] shrink-0">{CAT_LABEL[m.category] ?? m.category}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {m.place_slug && <a href={`/sv/plats/${m.place_slug}`} className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline"><MapPin className="h-3 w-3" />{sv ? 'Plats' : 'Place'}</a>}
                    {m.theme_slug === 'sankt-olof' && <a href="/sv/sankt-olof" className="text-[11px] text-gold hover:underline">{sv ? 'Tema: Sankt Olof' : 'Theme: St Olaf'}</a>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/70 mt-6">
          {sv ? 'Källa: Statens historiska museer / SHM · CC-BY 4.0 · SweDigArch (Uppsala universitet, Vetenskapsrådet 2022–2027).' : 'Source: National Historical Museums / SHM · CC-BY 4.0 · SweDigArch.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Models3D;
