
import { RoutePoint } from './types';

// Southern route: Utlängan → Kalmar, längs kusten (aldrig över öppet vatten
// eller land). Korrigerad 2026-07-18 (Daniel): den gamla "direkt över vatten
// mot Kalmar" ströks — rutten hugger Blekinge/Smålandskusten via Torhamns udde,
// Kristianopel, Bröms, Bergkvara och Ljungbyåns mynning.
// OBS: mellanliggande koordinater är kustnära approximationer — verifiera per punkt.
export const southernRoutePoints: RoutePoint[] = [
  // === Startpunkt ===
  {
    id: 'utlangan',
    name: 'Utlängan',
    coordinates: { lat: 56.0474, lng: 15.7697 }, // Utlängan fyr
    description: 'Utlängan fyr - officiell startpunkt för Kung Valdemars segelled',
    section: 'Utlängan start',
    isLotstation: true,
    isMajorWaypoint: true
  },

  // === Längs Blekingekusten norrut ===
  {
    id: 'torhamns_udde',
    name: 'Torhamns udde',
    coordinates: { lat: 56.0550, lng: 15.8550 }, // passerades på utsidan (öster om udden)
    description: 'Torhamns udde (naturreservat) - passerades på utsidan',
    section: 'Blekinge östkust'
  },
  {
    id: 'kristianopel',
    name: 'Kristianopel',
    coordinates: { lat: 56.2536, lng: 16.0392 },
    description: 'Kristianopel - skyddat läge, sannolikt god hamnstad',
    section: 'Blekinge östkust',
    isMajorWaypoint: true
  },
  {
    id: 'broms',
    name: 'Bröms',
    coordinates: { lat: 56.3617, lng: 16.0778 }, // Brömsebäcks mynning, Blekinge/Kalmar-gränsen
    description: 'Bröms - området kring Brömsebäcks mynning, sannolikt god hamnplats',
    section: 'Blekinge östkust'
  },

  // === Smålands östkust mot Kalmar ===
  {
    id: 'bergkvara',
    name: 'Bergkvara',
    coordinates: { lat: 56.3844, lng: 16.0503 },
    description: 'Bergkvara - naturlig hamn på Smålandskusten',
    section: 'Småland östkust',
    isMajorWaypoint: true
  },
  {
    id: 'ljungbyan_vassmolosa',
    name: 'Ljungbyåns mynning (Vassmolösa)',
    coordinates: { lat: 56.5350, lng: 16.2100 }, // Ljungbyåns/Vassmolösaåns utlopp
    description: 'Ljungbyån / Vassmolösaån - god ankarpunkt med tillgång till sötvatten',
    section: 'Småland östkust'
  },

  // === Destination ===
  {
    id: 'kalmar',
    name: 'Kalmar',
    coordinates: { lat: 56.6621, lng: 16.3627 }, // Kalmar stad
    description: 'Kalmar - viktig medeltida handelsstad och kunglig residens',
    section: 'Kalmar',
    isLotstation: true,
    isMajorWaypoint: true
  }
];
