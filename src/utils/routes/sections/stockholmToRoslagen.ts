
import { RoutePoint } from '../types';

// Stockholm → Arholma: dokumenterad fortsättning ur Kung Valdemars jordebok
// ("Landsort–Stockholm–Arholma", ca 1250). Från Sveriges holme/Stockholm norrut
// genom Roslagens skärgård till Arholma, därifrån vidare mot Åland.
// Latinska namnen inom parentes. Mellankoordinater är approximativa — VERIFIERA per punkt.
export const stockholmToRoslagenPoints: RoutePoint[] = [
  {
    id: 'tenosund',
    name: 'Tenösund (wiræsund)',
    coordinates: { lat: 59.4200, lng: 18.3500 }, // VERIFIERA (tolkning osäker i källan)
    description: 'Tenösund (jordeboken: wiræsund - handstilstolkning osäker)',
    section: 'Roslagens skärgård'
  },
  {
    id: 'staksund',
    name: 'Stäksund (malægstagh)',
    coordinates: { lat: 59.4700, lng: 18.3000 }, // VERIFIERA
    description: 'Stäksund (jordeboken: malægstagh)',
    section: 'Roslagens skärgård'
  },
  {
    id: 'nenningesund',
    name: 'Nenningesund (krampe sund)',
    coordinates: { lat: 59.6500, lng: 18.7000 }, // VERIFIERA - 3 veckosjöar från Stäksund
    description: 'Nenningesund nära Norrtälje (jordeboken: krampe sund, 3 veckosjöar)',
    section: 'Roslagens skärgård'
  },
  {
    id: 'vatosund',
    name: 'Vätösund (weddesund)',
    coordinates: { lat: 59.7500, lng: 18.9000 }, // VERIFIERA
    description: 'Vätösund vid Vätö (jordeboken: weddesund)',
    section: 'Roslagens skärgård'
  },
  {
    id: 'arholma',
    name: 'Arholma (arnholm)',
    coordinates: { lat: 59.8300, lng: 19.1500 },
    description: 'Arholma - yttersta ön i norra skärgården, utgångspunkt för överfarten mot Åland (jordeboken: arnholm)',
    section: 'Yttersta skärgården',
    isLotstation: true,
    isMajorWaypoint: true
  }
];
