import React, { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coins as CoinsIcon, MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { parseCoinCoord, type Coin } from '@/hooks/useCoins';

// Egen sida för ETT mynt/en skatt (Åbyskatten, Björnhovda-skatten, Spillingsskatten …).
// Söket länkar hit i stället för till den generella /coins-listan. Källkritik återges ordagrant —
// signifikans-texten bär markörer som "OMDISKUTERAD"; de får INTE tvättas bort.

const CATEGORY_LABEL: Record<string, { sv: string; en: string }> = {
  nordic_royal: { sv: 'Nordisk kunglig myntning', en: 'Nordic royal coinage' },
  runmynt: { sv: 'Runmynt', en: 'Rune coin' },
  seal: { sv: 'Sigill', en: 'Seal' },
  islamic: { sv: 'Islamiskt mynt (dirham)', en: 'Islamic coin (dirham)' },
  roman_solidus: { sv: 'Romersk solidus', en: 'Roman solidus' },
  roman_denar: { sv: 'Romersk denar', en: 'Roman denarius' },
  hoard: { sv: 'Skatt / depåfynd', en: 'Hoard / deposit' },
  prestige_gold: { sv: 'Prestigeguld', en: 'Prestige gold' },
  brakteat: { sv: 'Guldbrakteat', en: 'Gold bracteate' },
  depåfynd: { sv: 'Depåfynd', en: 'Deposit find' },
  imitation: { sv: 'Imitation', en: 'Imitation' },
};

const sb = supabase as unknown as { from: (t: string) => any };

const CoinDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: coin, isLoading } = useQuery({
    queryKey: ['coin-detail', id],
    enabled: !!id,
    queryFn: async (): Promise<Coin | null> => {
      const { data, error } = await sb.from('coins').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return (data ?? null) as Coin | null;
    },
  });

  const coord = coin ? parseCoinCoord(coin.coordinates) : null;

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !coord) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [coord.lat, coord.lng], zoom: 10, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
    L.circleMarker([coord.lat, coord.lng], { radius: 8, color: '#78350f', fillColor: '#eab308', fillOpacity: 0.85, weight: 2 })
      .bindPopup(`<strong>${coin?.name ?? ''}</strong>${coin?.find_place ? `<br/>${coin.find_place}` : ''}`).addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; };
  }, [coord, coin]);

  const name = coin ? (sv ? coin.name : coin.name_en ?? coin.name) : '';
  const desc = coin ? (sv ? coin.description : coin.description_en ?? coin.description) : '';
  const catLabel = coin ? (CATEGORY_LABEL[coin.category]?.[sv ? 'sv' : 'en'] ?? coin.category) : '';
  const period = (a: number | null, b: number | null) => {
    const y = (n: number) => (n < 0 ? `${Math.abs(n)} f.Kr.` : `${n} e.Kr.`);
    if (a == null && b == null) return null;
    if (a != null && b != null) return `${y(a)} – ${y(b)}`;
    return y((a ?? b)!);
  };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={coin ? `${coin.name} — Mynt & skatter` : 'Mynt'}
        titleEn={coin ? `${coin.name_en ?? coin.name} — Coins & hoards` : 'Coin'}
        description={coin?.significance ?? coin?.description ?? 'Mynt/skatt ur den nordiska numismatiken.'}
        descriptionEn={coin?.significance ?? coin?.description_en ?? 'Coin/hoard from Nordic numismatics.'}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/coins" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />{sv ? 'Alla mynt & skatter' : 'All coins & hoards'}
        </Link>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />{sv ? 'Laddar…' : 'Loading…'}
          </div>
        )}
        {!isLoading && !coin && (
          <p className="text-muted-foreground py-16 text-center">{sv ? 'Myntet/skatten hittades inte.' : 'Coin/hoard not found.'}</p>
        )}

        {coin && (
          <>
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
                <CoinsIcon className="h-8 w-8 text-gold shrink-0" />{name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">{catLabel}</Badge>
                {coin.issuer && <Badge variant="outline" className="text-xs">{coin.issuer}</Badge>}
                {coin.mint && <Badge variant="outline" className="text-xs">{coin.mint}</Badge>}
                {coin.metal && <Badge variant="outline" className="text-xs">{coin.metal}</Badge>}
                {coin.denomination && <Badge variant="outline" className="text-xs">{coin.denomination}</Badge>}
                {period(coin.period_start, coin.period_end) && (
                  <Badge variant="outline" className="text-xs">{period(coin.period_start, coin.period_end)}</Badge>
                )}
              </div>
              {coin.significance && (
                <p className="text-gold text-sm font-medium max-w-3xl leading-relaxed">{coin.significance}</p>
              )}
            </div>

            {coin.image_url && (
              <img src={coin.image_url} alt={coin.name} loading="lazy"
                className="w-full max-h-[360px] object-contain rounded-lg bg-muted/30 border border-white/10 mb-6"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            )}

            {desc && <p className="text-muted-foreground text-base leading-relaxed max-w-3xl whitespace-pre-line mb-6">{desc}</p>}

            {(coin.obverse || coin.reverse) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-3xl">
                {coin.obverse && (
                  <div className="viking-card rounded-lg border border-border p-3 text-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sv ? 'Åtsida' : 'Obverse'}</div>
                    <p className="text-slate-200">{coin.obverse}</p>
                  </div>
                )}
                {coin.reverse && (
                  <div className="viking-card rounded-lg border border-border p-3 text-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sv ? 'Frånsida' : 'Reverse'}</div>
                    <p className="text-slate-200">{coin.reverse}</p>
                  </div>
                )}
              </div>
            )}

            {coin.find_place && (
              <div className="mb-4 text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold" />
                <span><strong className="text-foreground">{sv ? 'Fyndplats: ' : 'Find place: '}</strong>{coin.find_place}</span>
              </div>
            )}

            {coord && <div ref={containerRef} className="w-full h-[340px] rounded-lg overflow-hidden border border-white/10 mb-6" />}

            {coin.sources && (
              <p className="text-xs text-muted-foreground/70 italic border-t border-border pt-3 max-w-3xl">
                {sv ? 'Källor: ' : 'Sources: '}{coin.sources}
              </p>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CoinDetail;
