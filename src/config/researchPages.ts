// Registry över sidor som INTE ligger i publika toppnavet (regionala + forsknings-sidor).
// Sanningskälla så de är hittbara + lätta att jobba med, och trivialt att lyfta in i navet
// senare (grupperna 'regions'/'research' är redan definierade). Rendras av /sidor (SiteIndex).
export interface SitePage {
  path: string;        // svensk route
  label: string;
  desc?: string;
}

export const REGION_PAGES: SitePage[] = [
  { path: '/sv/kalmar', label: 'Kalmar', desc: 'Forskningshubb — Kalmar/Kalmarsund, husaby, onomastik' },
  { path: '/sv/oland', label: 'Öland', desc: 'Öland-modellen: vägnät, centralplatser, solidi, borgterritorier' },
  { path: '/sv/angermanland', label: 'Ångermanland', desc: 'Centralortsprojektet' },
  { path: '/sv/centralplatser', label: 'Centralplatser', desc: 'Jämför vikingatida noder (Birka, Uppåkra, Köpingsvik…)' },
  { path: '/sv/maktsfarer', label: 'Maktsfärer', desc: 'Elitmonument + samtida maktsfärer' },
  { path: '/sv/kalmar-stadsmur', label: 'Kalmar stadsmur', desc: 'Fortifikations-evidensmodell per segment' },
];

export const RESEARCH_PAGES: SitePage[] = [
  { path: '/forskning/greklandsfarare', label: 'Greklandsfarare', desc: 'Väringar/runstenar om resor österut' },
  { path: '/forskning/langbardaland', label: 'Långbardaland', desc: 'Langobardernas ursprung' },
  { path: '/forskning/titlar', label: 'Titlar', desc: 'Titlar & rang i vikingatid/medeltid' },
  { path: '/forskning/kungshogar', label: 'Kungshögar', desc: 'Kungliga gravhögar' },
  { path: '/forskning/bronsalder', label: 'Bronsålder', desc: 'Bronsålderns landskap' },
  { path: '/sv/heraldik', label: 'Heraldik', desc: 'Vapen & motiv (Bjälbolejon m.m.)' },
  { path: '/sv/legendstenar', label: 'Legendstenar', desc: 'Figurstenar + motiv-fingeravtryck' },
  { path: '/staket', label: 'Staket', desc: 'Pålspärrar/farledsspärrar' },
];

export const SITE_PAGE_GROUPS: { key: 'regions' | 'research'; sv: string; en: string; pages: SitePage[] }[] = [
  { key: 'regions', sv: 'Regioner', en: 'Regions', pages: REGION_PAGES },
  { key: 'research', sv: 'Forskning', en: 'Research', pages: RESEARCH_PAGES },
];
