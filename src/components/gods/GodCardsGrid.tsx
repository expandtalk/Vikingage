import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDeityPlaces } from '@/utils/religiousLocations/religiousPlacesData';
import { useGods, type God } from '@/hooks/useGods';

// Gudarna kommer nu ur DB (gods-tabellen). Endast BILDMAPPNINGEN + kultplats-nyckeln
// är kvar i kod (bilderna är filer i public/). Gudar UTAN bild visas som kompakta kort
// SIST, efter bildkorten (Daniel). Kultplatssiffran = verklig katalogdata (getDeityPlaces).
const IMG = '/excursion-photos/gudar';
const IMAGE: Record<string, string> = {
  Oden: `${IMG}/oden-styrka-beskydd.jpg`, Tor: `${IMG}/tor-aska-styrka-beskydd.jpg`,
  Frej: `${IMG}/frej-fruktbarhet.jpg`, Freja: `${IMG}/freja-karlek-skonhet-fruktbarhet.jpg`,
  Frigg: `${IMG}/frigg-moderskap-aktenskap.jpg`, Balder: `${IMG}/balder-godhet-renhet.jpg`,
  Loke: `${IMG}/loke-list-skepnadsskiftare.jpg`, Idun: `${IMG}/idun-ungdom-fornyelse.jpg`,
  'Njörd': `${IMG}/njord-hav-land-rikedom.jpg`, Ty: `${IMG}/tyr-krig-rattvisa-mod.jpg`,
  Ull: `${IMG}/ull-jakt-bagskytte-vinter.jpg`,
};
// Kartfokus: gudar med katalogförda kultplatser (legend-nyckel religious_<key>).
const DEITY_KEY: Record<string, string> = {
  Oden: 'odin', Tor: 'thor', Frej: 'frey', Frigg: 'frigg', 'Njörd': 'njord', Ull: 'ull',
};
// Väsen (ej gud, ej i gods-tabellen) — behålls som eget kort med bild.
const DRAUGEN: God & { image: string } = {
  id: 'draugen', name: 'Draugen', name_old_norse: 'Draugr', category: 'other',
  domain: ['Gengångare', 'Övermänsklig styrka'],
  description: 'Ingen gud utan ett fruktat väsen: den levande döde som vaktar sin gravhög med övermänsklig styrka. I sagorna måste hjälten brottas ned honom för att vinna gravens skatt.',
  symbols: ['Gravhög', 'Skatt', 'Mörker'], wikidata_id: null, image: `${IMG}/draugen-farlig-varelse.jpg`,
};

const CAT_COLOR: Record<string, string> = { aesir: 'bg-blue-600 text-white', vanir: 'bg-green-600 text-white', giant: 'bg-red-600 text-white', other: 'bg-purple-600 text-white' };
const CAT_NAME: Record<string, string> = { aesir: 'Aser', vanir: 'Vaner', giant: 'Jätte', other: 'Väsen' };

interface GodCardsGridProps { onFocusDeity?: (deityKey: string | null) => void }

export const GodCardsGrid: React.FC<GodCardsGridProps> = ({ onFocusDeity }) => {
  const { data: gods = [], isLoading } = useGods();
  const [selectedGod, setSelectedGod] = useState<string | null>(null);

  const { withImage, withoutImage } = useMemo(() => {
    const wi: (God & { image: string })[] = [];
    const wo: God[] = [];
    gods.forEach((g) => (IMAGE[g.name] ? wi.push({ ...g, image: IMAGE[g.name] }) : wo.push(g)));
    wi.push(DRAUGEN); // väsen sist bland bildkorten
    return { withImage: wi, withoutImage: wo };
  }, [gods]);

  const handleGodClick = (name: string, count: number) => {
    const deity = DEITY_KEY[name];
    if (!deity || count === 0) return;
    if (selectedGod === name) { setSelectedGod(null); onFocusDeity?.(null); }
    else { setSelectedGod(name); onFocusDeity?.(`religious_${deity}`); }
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Nordiska gudar & väsen</h2>
            <p className="text-sm text-muted-foreground">Klicka en gud med kultplatser för att visa dem på kartan. {gods.length} gudar ur databasen.</p>
          </div>
          {selectedGod && (
            <Button variant="outline" size="sm" onClick={() => { setSelectedGod(null); onFocusDeity?.(null); }}>Visa alla gudar</Button>
          )}
        </div>

        {isLoading ? <p className="text-muted-foreground text-sm">Laddar gudar…</p> : (
          <>
            {/* Bildkort */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {withImage.map((god) => {
                const count = getDeityPlaces(DEITY_KEY[god.name] ?? '').length;
                const clickable = count > 0;
                return (
                  <Card key={god.id}
                    className={`overflow-hidden transition-all duration-200 group ${clickable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'} ${selectedGod === god.name ? 'ring-2 ring-accent shadow-lg' : ''}`}
                    onClick={() => handleGodClick(god.name, count)}>
                    {/* object-top: porträtten har ansiktet högt upp; object-cover centrerat
                        kapade huvudet (Balder, Frej, Freja, Frigg, Idun, Loke, Oden, Ty, Ull).
                        Ankra beskärningen uppåt så ansiktet alltid syns. h-48 ger lite mer höjd. */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <img src={god.image} alt={`${god.name} (${god.name_old_norse ?? ''})`} loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                      <Badge className={`absolute top-2 right-2 text-[10px] ${CAT_COLOR[god.category ?? 'other']}`}>{CAT_NAME[god.category ?? 'other']}</Badge>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pt-6 pb-1.5">
                        <CardTitle className="text-base text-white leading-tight">{god.name}</CardTitle>
                        <p className="text-xs text-white/70">{god.name_old_norse}</p>
                      </div>
                    </div>
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {(god.domain ?? []).slice(0, 3).map((d) => <Badge key={d} variant="outline" className="text-[10px]">{d}</Badge>)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{god.description}</p>
                      {count > 0 && <div className="text-[11px] text-gold pt-1 border-t border-slate-700/40">{count} {count === 1 ? 'kultplats' : 'kultplatser'} · visa på karta</div>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Bildlösa gudar — kompakta kort sist */}
            {withoutImage.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Fler gudar</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {withoutImage.map((god) => (
                    <Card key={god.id} className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{god.name}</div>
                          <div className="text-[11px] text-muted-foreground">{god.name_old_norse}</div>
                        </div>
                        <Badge className={`text-[10px] shrink-0 ${CAT_COLOR[god.category ?? 'other']}`}>{CAT_NAME[god.category ?? 'other']}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(god.domain ?? []).slice(0, 3).map((d) => <Badge key={d} variant="outline" className="text-[10px]">{d}</Badge>)}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1.5">{god.description}</p>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
