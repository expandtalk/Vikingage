import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Centralorts-lager på huvudkartan (Utforska): Agnetas central_places + central_place_names.
// Tänds via URL-param ?central=1 (så "Öppna kartan" från /sv/angermanland tar med dem) ELLER
// via legendknappen 'central_places'. Utan detta fanns forskningsdatan bara på den inbäddade
// Ångermanland-kartan och "följde inte med" till Utforska.
const sb = supabase as unknown as { from: (t: string) => any };
const CAT: Record<string, string> = { sacral: '#c084fc', power: '#3b82f6' };

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

export const useMapCentralPlaces = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const urlOn = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('central');
  const enabled = enabledLegendItems.central_places === true || urlOn;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      const [cp, cpn] = await Promise.all([
        sb.from('central_places').select('name,lat,lng,confidence,source').not('lat', 'is', null),
        sb.from('central_place_names').select('name,lat,lng,category,evidence_tier,interpretation,attested_form,attested_year').not('lat', 'is', null),
      ]);
      if (cancelled || !layerRef.current) return;
      (cp.data ?? []).forEach((g: any) => {
        L.circleMarker([g.lat, g.lng], { radius: 8, color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.25, pane: 'markerPane' })
          .bindTooltip(g.name, { permanent: true, direction: 'top', offset: [0, -8], className: 'ang-clabel' })
          .bindPopup(`<b>${g.name}</b><br/><span style="font-size:11px">Centralort${g.confidence ? ` · ${g.confidence}` : ''}</span>${g.source ? `<br/><span style="font-size:10px;color:#94a3b8">Källa: ${g.source}</span>` : ''}`)
          .addTo(layer);
      });
      (cpn.data ?? []).forEach((n: any) => {
        const color = CAT[n.category ?? ''] ?? '#94a3b8';
        const core = n.evidence_tier === 'core';
        L.circleMarker([n.lat, n.lng], { radius: core ? 5 : 4, color, weight: core ? 2 : 1, fillColor: color, fillOpacity: core ? 0.85 : 0.5, pane: 'markerPane' })
          .bindPopup(`<b>${n.name}</b>${n.attested_form ? ` <i>(${n.attested_form}${n.attested_year ? ` ${n.attested_year}` : ''})</i>` : ''}<br/><span style="font-size:11px;color:#666">${n.category ?? ''}${core ? ' · kärna' : ' · utvidgad'}${n.interpretation ? `<br/>${n.interpretation}` : ''}</span>`)
          .addTo(layer);
      });
    })();
    return () => { cancelled = true; };
  }, [map, isMapReady, enabled]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
