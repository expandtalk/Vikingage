
import { RoutePoint } from './types';

// Central route: Kalmar → Stockholm, längs kusten och genom skärgården.
// Korrigerad 2026-07-18 (Daniel, i två omgångar):
//  - Västervik flyttad från felaktiga 57.06 → 57.758 (låg 0,7° för långt söderut).
//  - Loftahammar-punkten flyttad ut utanför orten (~57.90N).
//  - Den gamla "arkösund"-punkten på 58.68/17.11 var i själva verket OXELÖSUND
//    och är nu korrekt namngiven; äkta Arkösund (~58.48/16.96) lagd vid Slätbakens mynning.
//  - Kalmarsund (Daniel 2026-07-28): Grimskär (lotsbyte) + Skäggenäs (skeppsbygge) inlagda; Drag
//    KORRIGERAD till kanalen vid Revsudden (56.775/16.468, var felaktigt 56.83/16.46); fararleden gick
//    in norr om Borgholm och Köpingsvik. Aveskär (ej Kristianopel — grundat 1600) i södra rutten.
//  - Kalmarsund: följer kusten upp mot Ölands norra udde (ingen genväg tvärs över Öland).
//  - Slätbaken-slingan omordnad så linjerna inte korsar varandra: in i viken till
//    Söderköping (Stegeborg vaktar inloppet) → tillbaka ut → norrut mot Arkösund → Oxelösund.
//  - Stockholms skärgård följer den dokumenterade jordebokleden (Landsort–Stockholm).
// OBS: skärgårds-/mellankoordinater är kustnära approximationer — verifiera per punkt.
export const centralRoutePoints: RoutePoint[] = [
  // === Ut ur Kalmar norrut i Kalmarsund, längs kusten ===
  {
    id: 'grimskar',
    name: 'Grimskär (lotsbyte)',
    coordinates: { lat: 56.6521776, lng: 16.3702873 }, // KORRIGERAD: Grimskärs skans (var felaktigt 56.658/16.392) — Google Maps-pin, Daniel 2026-07-28
    description: 'Grimskär (medeltida Stegelholmen, avrättningsplats där dömda steglades) - lotsbyte här innan färden norrut i Kalmarsund. En grima (grinande huvud på stolpe) varnade för revet Skansgrundet och tjänade som inseglingsmärke → namnet Grimskär (belagt 1534). Grimskärs skans (fyruddig stjärna) uppfördes från 1623 av sten från öländska borgar; lotsstation till 1940.',
    section: 'Kalmarsund',
    isLotstation: true,
    isMajorWaypoint: true
  },
  {
    id: 'skaggenas',
    name: 'Skäggenäs (skeppsbygge)',
    coordinates: { lat: 56.7900, lng: 16.4950 }, // Skäggenäshalvön N om Kalmar
    description: 'Skäggenäs - halvön med känt skeppsbyggeri; passeras på väg mot Revsudden.',
    section: 'Kalmarsund',
    isMajorWaypoint: true
  },
  {
    id: 'drag',
    name: 'Drag (kanalen vid Revsudden)',
    coordinates: { lat: 56.7750, lng: 16.4680 }, // KORRIGERAD: kanalen/draget vid Revsudden (var felaktigt 56.83/16.46)
    description: 'Drag - kanalen/draget tvärs Revsudden-udden (Skäggenäs), finns kvar än idag. Enda överlandsstället (ed/drag) på hela leden; övrigt gick alltid på vatten.',
    section: 'Kalmarsund',
    isMajorWaypoint: true
  },
  {
    id: 'kopingsvik',
    name: 'Köpingsvik',
    coordinates: { lat: 56.8722, lng: 16.7175 }, // Öland, N om Borgholm
    description: 'Köpingsvik på Ölands sida - vikingatida handels- och maktcentrum. Fararleden gick in norr om Borgholm och Köpingsvik och fortsatte sedan norrut.',
    section: 'Kalmarsund',
    isMajorWaypoint: true
  },
  {
    id: 'hornsudden',
    name: 'Hornsudden (Stenkusten)',
    coordinates: { lat: 57.2000, lng: 16.8800 }, // NV Öland, Persnäs/Föra (approx; nästan i höjd med Blå Jungfrun)
    description: 'Passeras längs Ölands västra Stenkust (Persnäs/Föra) på väg norrut.',
    section: 'Kalmarsund'
  },
  {
    id: 'byxelkrok',
    name: 'Byxelkrok',
    coordinates: { lat: 57.3267, lng: 17.0153 }, // NV Öland
    description: 'Byxelkrok - naturhamn på nordvästra Öland.',
    section: 'Kalmarsund',
    isMajorWaypoint: true
  },
  {
    id: 'holmeboda_utanfor',
    name: 'Utanför Holmeboda',
    coordinates: { lat: 57.3628, lng: 17.0673 }, // NÖ Öland
    description: 'Passeras utanför Holmeboda vid Ölands nordspets i Kalmarsund.',
    section: 'Kalmarsund'
  },
  {
    id: 'grankullavik',
    name: 'Grankullavik (skyddande vik)',
    coordinates: { lat: 57.3324, lng: 17.1005 }, // den skyddade viken vid NÖ Öland
    description: 'In i den skyddande viken Grankullavik vid Ölands nordöstra spets, innan färden fortsätter norrut mot Tjust.',
    section: 'Kalmarsund',
    isMajorWaypoint: true
  },

  // === Tjust skärgård ===
  {
    id: 'vastervik',
    name: 'Västervik (Stegeholm)',
    coordinates: { lat: 57.7580, lng: 16.6380 }, // KORRIGERAD (var felaktigt 57.0574)
    description: 'Västervik - viktig medeltida hamn, vaktad av Stegeholms slott',
    section: 'Tjust skärgård',
    isLotstation: true,
    isMajorWaypoint: true
  },
  {
    id: 'tjust_inner',
    name: 'Tjust inre farled',
    coordinates: { lat: 57.8500, lng: 16.8500 },
    description: 'Inre farleden genom Tjust skärgård',
    section: 'Tjust skärgård'
  },
  {
    id: 'loftahammar',
    name: 'Loftahammar',
    coordinates: { lat: 57.9000, lng: 16.8700 }, // KORRIGERAD - utanför Loftahammar (var 57.31)
    description: 'Loftahammar - skärgårdshamn i norra Tjust',
    section: 'Tjust skärgård',
    isMajorWaypoint: true
  },

  // === Östergötlands skärgård + Slätbaken (in i viken → ut → norrut) ===
  {
    id: 'ostergotland_skargard',
    name: 'Sankt Anna skärgård',
    coordinates: { lat: 58.2500, lng: 16.9500 },
    description: 'Genom Östergötlands ytterskärgård (Sankt Anna) mot Slätbakens inlopp',
    section: 'Östergötland'
  },
  {
    id: 'stegeborg',
    name: 'Stegeborg (in i viken)',
    coordinates: { lat: 58.4300, lng: 16.6000 }, // Stegeborg vaktar inloppet till Slätbaken
    description: 'In i viken (Slätbaken) - Stegeborgs slott vaktar inloppet',
    section: 'Slätbaken'
  },
  {
    id: 'soderkoping',
    name: 'Söderköping',
    coordinates: { lat: 58.4833, lng: 16.3167 }, // innerst i viken
    description: 'Söderköping - innerst i viken (Slätbaken). Man seglade in hit och därefter tillbaka ut samma väg.',
    section: 'Slätbaken',
    isLotstation: true,
    isMajorWaypoint: true
  },
  {
    id: 'arkosund',
    name: 'Arkösund',
    coordinates: { lat: 58.4830, lng: 16.9600 }, // ut ur viken igen, sedan norrut
    description: 'Arkösund - ut ur Slätbaken igen och vidare norrut längs kusten',
    section: 'Östergötland',
    isLotstation: true,
    isMajorWaypoint: true
  },
  {
    id: 'vikbolandet_ost',
    name: 'Vikbolandet ost',
    coordinates: { lat: 58.5700, lng: 17.0800 }, // runt Vikbolandets ostsida (undviker land)
    description: 'Längs Vikbolandets ostsida mot Bråvikens mynning',
    section: 'Östergötland'
  },
  {
    id: 'oxelosund',
    name: 'Oxelösund',
    coordinates: { lat: 58.6700, lng: 17.1010 }, // punkten som tidigare felaktigt hette "Arkösund"
    description: 'Oxelösund - vid Bråvikens mynning, längs kusten norrut mot Södertörn',
    section: 'Södermanland kust',
    isMajorWaypoint: true
  },

  // === Landsort → Stockholm (dokumenterad led ur Kung Valdemars jordebok,
  //     "Landsort–Stockholm–Arholma", ca 1250 — den led som går genom hela
  //     skärgården förbi Stockholm). Latinska namnen inom parentes. Flera
  //     mellankoordinater är approximativa — VERIFIERA per punkt.
  {
    id: 'landsort',
    name: 'Landsort (Öja)',
    coordinates: { lat: 58.7420, lng: 17.8650 }, // Landsorts fyr, Öjas sydspets
    description: 'Landsort/Öja - utpost där skärgårdslederna mot Stockholm och Arholma börjar',
    section: 'Stockholms skärgård',
    isLotstation: true,
    isMajorWaypoint: true
  },
  {
    id: 'ekholmen',
    name: 'Ekholmen (ekiholm)',
    coordinates: { lat: 58.8300, lng: 17.8500 }, // VERIFIERA
    description: 'Ekholmen (jordeboken: ekiholm)',
    section: 'Stockholms skärgård'
  },
  {
    id: 'yxlosund',
    name: 'Yxlösundet (oslæsund)',
    coordinates: { lat: 58.8800, lng: 17.8400 }, // VERIFIERA
    description: 'Yxlösundet vid Yxlö (jordeboken: oslæsund)',
    section: 'Stockholms skärgård'
  },
  {
    id: 'ekorrsund',
    name: 'Ekorrsund (ikernsund)',
    coordinates: { lat: 58.9700, lng: 18.0500 }, // VERIFIERA
    description: 'Ekorrsund (jordeboken: ikernsund)',
    section: 'Stockholms skärgård'
  },
  {
    id: 'gålö',
    name: 'Gålö (gardø)',
    coordinates: { lat: 59.0500, lng: 18.1300 },
    description: 'Gålö (jordeboken: gardø)',
    section: 'Stockholms skärgård',
    isMajorWaypoint: true
  },
  {
    id: 'dalarö',
    name: 'Dalarö (dalernsund)',
    coordinates: { lat: 59.1330, lng: 18.4060 },
    description: 'Dalarö - skärgårdshamn och senare tullstation. Efter Dalarö följer leden kusten inåt mot Stockholm (jordeboken: dalernsund).',
    section: 'Stockholms skärgård',
    isMajorWaypoint: true
  },
  {
    id: 'baggensstaket',
    name: 'Baggensstäket (harustik)',
    coordinates: { lat: 59.2900, lng: 18.2200 }, // VERIFIERA
    description: 'Baggensstäket - trång inre farled längs kusten in mot Stockholm (jordeboken: harustik)',
    section: 'Stockholms skärgård',
    isMajorWaypoint: true
  },
  {
    id: 'sveriges_holme',
    name: 'Sveriges holme (litle swethiuthæ)',
    coordinates: { lat: 59.3200, lng: 18.0900 }, // VERIFIERA
    description: 'Sveriges holme vid Stockholms inlopp (jordeboken: litle swethiuthæ) - förgreningspunkt mot Stockholm respektive Arholma',
    section: 'Stockholms skärgård'
  },

  // === Stockholm ===
  {
    id: 'stockholm',
    name: 'Stockholm',
    coordinates: { lat: 59.333, lng: 18.065 },
    description: 'Stockholm - medeltida handelsstad (jordeboken: stokholm)',
    section: 'Stockholm',
    isLotstation: true,
    isMajorWaypoint: true
  }
];
