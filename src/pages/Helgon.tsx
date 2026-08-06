import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cross, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/helgon — hubb för de nordiska/svenska helgonen. DATA-DRIVEN ur saints-tabellen (show_on_hub),
// inte hårdkodat (Daniel: "undvik hårdkodat material"). Kurerade noter + kart-länkar bor i tabellen.
// Källkritik: legenduppgifter är märkta i noterna; St Olof har egen fördjupning via map_href.
interface HubSaint {
  code: string;
  name: string;
  name_en: string | null;
  life_line: string | null;
  note: string | null;
  place_label: string | null;
  map_href: string | null;
  link_label: string | null;
  sort_year: number | null;
}

const Helgon = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data: saints = [] } = useQuery({
    queryKey: ['saints-hub'],
    queryFn: async (): Promise<HubSaint[]> => {
      const { data, error } = await (supabase.from('saints') as any)
        .select('code,name,name_en,life_line,note,place_label,map_href,link_label,sort_year')
        .eq('show_on_hub', true)
        .order('sort_year', { ascending: true });
      if (error) throw error;
      return (data ?? []) as HubSaint[];
    },
  });

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Helgonen i Norden — Olof, Erik, Birgitta och de andra"
        titleEn="Saints of the North — Olav, Erik, Birgitta and the others"
        description="Översikt över de nordiska och svenska helgonen: Sankt Olof, Sankt Erik, Sankta Birgitta, Sankt Sigfrid, Sankt Eskil m.fl. Kult, legend och plats — med källkritik som skiljer belagg från legenduppgift."
        descriptionEn="An overview of the Nordic and Swedish saints: St Olav, St Erik, St Birgitta, St Sigfrid, St Eskil and more — cult, legend and place, with source criticism separating evidence from legend."
        keywords="helgon, Sankt Olof, Sankt Erik, Sankta Birgitta, Sankt Sigfrid, Sankt Eskil, Botvid, helgonkult, pilgrim, medeltid"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Cross className="h-8 w-8 text-gold" />
            {sv ? 'Helgonen i Norden' : 'Saints of the North'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {sv
              ? 'De medeltida helgonen satte djupa spår i landskapet — kyrkor, källor, ortnamn och pilgrimsvägar. Här samlas de nordiska och svenska helgonen. Sankt Olof har en egen fördjupning. Legenduppgifter redovisas som legend, skilt från belagd historia.'
              : 'The medieval saints left deep marks on the landscape — churches, springs, place names and pilgrim routes. St Olav has his own page. Legendary material is marked as legend, separate from attested history.'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {saints.map((s) => (
            <Card key={s.code} className="viking-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gold">{sv ? s.name : (s.name_en || s.name)}</CardTitle>
                {s.life_line && <p className="text-xs text-muted-foreground">{s.life_line}</p>}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {s.note && <p className="text-xs leading-relaxed">{s.note}</p>}
                {s.place_label && <p className="text-[11px] text-gold/80">📍 {s.place_label}</p>}
                {s.map_href && (
                  <Link to={s.map_href} className="text-gold hover:underline text-xs font-medium inline-block focus-visible:ring-2 focus-visible:ring-gold rounded">
                    {s.link_label ?? (sv ? 'Läs mer →' : 'Read more →')}
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {sv
              ? 'Faktauppgifter bygger på etablerad helgonforskning; legendmaterial (Erikslegenden, Sigfrids dop av Olof Skötkonung, Botvids död) redovisas som legend. Kung Olof Skötkonung är inte helgonet Olav — de hålls isär. Innehållet kommer ur saints-databasen.'
              : 'Facts rest on established hagiographic scholarship; legendary material is marked as legend. King Olof Skötkonung is not St Olav — kept apart. Content is served from the saints database.'}
          </span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Helgon;
