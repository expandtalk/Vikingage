
import { Map, Shield, Mountain, Anchor, Home, Building, Waves, Pickaxe, Users } from 'lucide-react';

// Function to get appropriate icon for each legend item
export const getIconForLegendItem = (id: string) => {
  switch (id) {
    case 'runic_inscriptions':
      return Building;
    case 'ring_fortresses':
    case 'ring_fortress':
      return Shield;
    case 'hillforts':
    case 'hillfort':
      return Mountain;
    case 'longphorts':
    case 'longphort':
      return Anchor;
    case 'royal_centers':
    case 'royal_center':
      return Home;
    case 'coastal_defense':
      return Shield;
    case 'trading_posts':
    case 'trading_post':
      return Building;
    case 'linear_defenses':
      return Shield;
    case 'religious_centers':
    case 'religious_center':
      return Home;
    case 'religious_places':
      return Building; // Hedniska kultplatser
    case 'religious_thor':
      return Shield; // Thor med hammare/sköld
    case 'religious_odin':
      return Mountain; // Odin med spjut/berg
    case 'religious_frey':
      return Waves; // Frey med fertilitet/vågor
    case 'religious_ull':
      return Mountain; // Ull med berg/jakt
    case 'religious_njord':
      return Waves; // Njord med hav
    case 'religious_frigg':
      return Home; // Frigg med hem
    case 'religious_other':
      return Building; // Andra kultplatser
    case 'trading_places':
    case 'trading_post_fortress':
      return Building;
    case 'koping':
      return Building;
    case 'established_city':
      return Building;
    case 'gotlandic_center':
      return Home;
    case 'viking_settlement':
      return Home;
    case 'adapted_fortress':
      return Shield;
    case 'valdemar_route':
      return Anchor;
    case 'viking_rivers':
    case 'river_routes':
      return Waves;
    case 'viking_regions':
      return Map;
    case 'germanic_timeline':
      return Users;
    case 'archaeological_finds':
      return Pickaxe;
    default:
      return Building;
  }
};
