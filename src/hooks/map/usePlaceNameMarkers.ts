import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import {
  ELEMENT_CATEGORY_META,
  ElementCategory,
  getElement,
  PLACE_NAME_ELEMENTS,
} from '@/utils/placeNameElements';

/**
 * Hook för ortnamnslagret (GIS-pilot).
 * Design: docs/superpowers/specs/2026-07-17-ortnamn-gis-pilot-design.md
 *
 * Läser place_names från Supabase och bygger kartmarkörer. Vetenskapligt krav:
 * lagret visar ALLA förekomster som matchar aktiva element — inget handplockat urval.
 */

export interface PlaceNameRow {
  id: string;
  name: string;
  lat: number;
  lng: number;
  element_keys: string[];
  element_category: ElementCategory | null;
  feature_type: string | null;
  province: string | null;
  earliest_attestation_year: number | null;
  attested_form: string | null;
  source: string | null;
  source_license: string | null;
  imported_at: string | null;
}

export interface PlaceNameMarker {
  id: string;
  position: L.LatLng;
  color: string;
  symbol: string;
  name: string;
  elementKeys: string[];
  contested: boolean;
  popupContent: string;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const buildPopup = (row: PlaceNameRow): string => {
  const cat = row.element_category ? ELEMENT_CATEGORY_META[row.element_category] : null;
  const color = cat?.color ?? '#666666';

  const elementLines = row.element_keys
    .map((k) => getElement(k))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .map(
      (e) =>
        `<li style="margin:2px 0;">
          <strong>${escapeHtml(e.label)}</strong>${e.contested ? ' <span title="Etymologiskt omtvistad" style="color:#b45309;">(omtvistad)</span>' : ''}
          <br/><span style="color:#666;">${escapeHtml(e.etymology)}</span>
        </li>`
    )
    .join('');

  const attestation =
    row.earliest_attestation_year != null
      ? `<p style="margin:4px 0;font-size:13px;"><strong>Äldsta belägg:</strong> ${row.earliest_attestation_year}${
          row.attested_form ? ` (${escapeHtml(row.attested_form)})` : ''
        }</p>`
      : `<p style="margin:4px 0;font-size:12px;color:#999;">Äldsta belägg: ej registrerat ännu</p>`;

  const imported = row.imported_at ? new Date(row.imported_at).toISOString().slice(0, 10) : 'okänt';

  return `
    <div class="place-name-popup">
      <h3 style="margin:0 0 8px 0;color:${color};font-size:16px;">${escapeHtml(row.name)}</h3>
      ${row.province ? `<p style="margin:2px 0;font-size:13px;color:#666;">${escapeHtml(row.province)}</p>` : ''}
      <p style="margin:6px 0 2px 0;font-size:13px;"><strong>Namnelement:</strong></p>
      <ul style="margin:0 0 6px 16px;padding:0;font-size:13px;">${elementLines}</ul>
      ${attestation}
      <p style="margin:8px 0 0 0;font-size:12px;color:#888;border-top:1px solid #eee;padding-top:6px;">
        Källa: ${escapeHtml(row.source ?? 'okänd')} · ${escapeHtml(row.source_license ?? '')} · hämtad ${imported}
      </p>
    </div>
  `;
};

/**
 * Hämtar och filtrerar ortnamn.
 * @param enabledLegendItems  Kartans legend-status. Kategorier gömms med nyckeln
 *   `place_names_<kategori>` (t.ex. place_names_sacral) och hela lagret med `place_names`.
 * @param isEnabled           Slå av hela queryn (t.ex. utanför relevant läge).
 */
export const usePlaceNameMarkers = (
  map: L.Map | null,
  enabledLegendItems: { [key: string]: boolean } = {},
  isEnabled: boolean = true
) => {
  // Ortnamn är OPT-IN (default AV). VIEWPORT + ZOOM-GATED: efter nationell ingest (358k namn) laddar
  // vi bara namn i vyn vars label_min_zoom <= aktuell zoom via place_names_in_view-RPC (cappad) —
  // annars .neq('osm')=316k rader = frys/godtyckliga 1000. Refetch på moveend/zoomend.
  const layerOn = enabledLegendItems.place_names === true;

  const [, setView] = useState(0);
  useEffect(() => {
    if (!map) return;
    const onMove = () => setView((v) => v + 1);
    map.on('moveend zoomend', onMove);
    return () => { map.off('moveend zoomend', onMove); };
  }, [map]);

  const zoom = map ? Math.round(map.getZoom()) : 0;
  // Zoom-golv: under z7 visas inga namn (lägsta label_min_zoom=7) → skippa RPC helt. Det undviker
  // det dyra/timeout-benägna bred-bbox-anropet vid riksöversikt (explore-initialvyn gav 500).
  const MIN_ZOOM = 7;
  const b = layerOn && map && zoom >= MIN_ZOOM ? map.getBounds() : null;
  // Runda bbox till ~1 km så små panoreringar inte refetchar; queryKey styr omhämtning.
  const bboxKey = b ? [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((n) => n.toFixed(2)).join(',') : '';

  return useQuery({
    queryKey: ['place-name-markers', bboxKey, zoom],
    queryFn: async (): Promise<PlaceNameMarker[]> => {
      if (!b) return [];
      const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
      const { data, error } = await (supabase as any)
        .rpc('place_names_in_view', { p_bbox: bbox, p_zoom: zoom, p_limit: 800 });
      if (error) {
        console.error('❌ Error fetching place names:', error);
        throw error;
      }
      return ((data as PlaceNameRow[]) ?? []).map((row) => {
        const keys = row.element_keys ?? []; // nya LM-namn saknar element_keys (null) → []
        const cat = row.element_category ? ELEMENT_CATEGORY_META[row.element_category] : null;
        const contested = keys.some((k) => getElement(k)?.contested);
        return {
          id: row.id,
          position: new L.LatLng(row.lat, row.lng),
          color: cat?.color ?? '#666666',
          // Markera omtvistade element visuellt (rapport §5.2).
          symbol: contested ? '~' : cat?.symbol ?? '●',
          name: row.name,
          elementKeys: keys,
          contested,
          popupContent: buildPopup(row),
        };
      });
    },
    enabled: isEnabled && layerOn && !!map && zoom >= MIN_ZOOM,
    staleTime: 60 * 1000,
  }).data?.filter((marker) => {
    // Kategorifilter: visa markören om någon av dess element-kategorier är aktiv.
    const cats = new Set(
      marker.elementKeys.map((k) => getElement(k)?.category).filter(Boolean) as ElementCategory[]
    );
    if (cats.size === 0) return true;
    return Array.from(cats).some((c) => enabledLegendItems[`place_names_${c}`] !== false);
  }) ?? [];
};

/** Alla kategorier med metadata — för legend-UI. */
export const PLACE_NAME_CATEGORIES = Object.entries(ELEMENT_CATEGORY_META).map(([key, meta]) => ({
  key: key as ElementCategory,
  ...meta,
  elementCount: PLACE_NAME_ELEMENTS.filter((e) => e.category === key).length,
}));
