import L from 'leaflet';
import type { AdminBoundary } from '@/hooks/useAdminBoundary';

// Ritar admin-gränspolygon(er) (Lantmäteri, © Lantmäteriet) på en imperativ Leaflet-LayerGroup.
// Konturlinje utan fyllnad — kartinnehållet under gränsen ska synas. Anroparen äger group och
// gör clearLayers() själv (samma mönster som övriga lager i regionkartorna).
// Attributionen ligger på L.geoJSON-lagrets `attribution` → dyker upp i kartans attribution-rad
// (bottom-right) medan lagret visas och försvinner när group.clearLayers() körs. Alltså syns
// © Lantmäteriet där källor hör hemma, INTE som brus i legenden.
export function drawAdminBoundary(
  group: L.LayerGroup,
  boundaries: AdminBoundary[],
  opts: { color?: string; weight?: number } = {},
): void {
  const { color = '#0ea5e9', weight = 2 } = opts;
  boundaries.forEach((b) => {
    L.geoJSON(b.geojson, {
      style: () => ({ color, weight, fill: false, opacity: 0.9, dashArray: '5 5' }),
      attribution: 'Administrativ indelning © Lantmäteriet',
    })
      .bindPopup(
        `<b>${b.name}</b><br/><span style="font-size:11px;color:#666">Administrativ gräns · © Lantmäteriet</span>`,
      )
      .addTo(group);
  });
}
