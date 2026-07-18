export interface TradeRoute {
  id: string;
  name: string;
  nameEn: string;
  period: string;
  periodStart: number;
  periodEnd: number;
  color: string;
  goods: string[];
  destinations: string[];
  description: string;
  descriptionEn: string;
  coordinates: Array<{
    lat: number;
    lng: number;
    name: string;
    nameEn?: string;
    isCity?: boolean;
    isPortage?: boolean;
  }>;
}

export const VIKING_TRADE_ROUTES: TradeRoute[] = [
  {
    id: 'dnepr-route',
    name: 'Varjagerna till Grekerna',
    nameEn: 'Varangians to Greeks Route',
    period: 'ca 800–1100',
    periodStart: 800,
    periodEnd: 1100,
    color: '#dc2626', // Red
    goods: ['slavar', 'pälsar', 'järn', 'vax', 'honung', 'bärnsten'],
    destinations: ['Konstantinopel (Byzans)', 'Svarta havet'],
    description: 'Dnjepr-rutten från Östersjön via Kiev till Konstantinopel. Den viktigaste handelsleden mellan Skandinavien och Bysans.',
    descriptionEn: 'The Dnieper route from the Baltic Sea via Kyiv to Constantinople. The most important trade route between Scandinavia and Byzantium.',
    coordinates: [
      { lat: 59.3350, lng: 17.5447, name: 'Birka', nameEn: 'Birka', isCity: true },
      { lat: 59.6197, lng: 17.7239, name: 'Sigtuna', nameEn: 'Sigtuna', isCity: true },
      { lat: 56.95, lng: 24.10, name: 'Riga', nameEn: 'Riga', isCity: true },
      { lat: 60.1272, lng: 32.2963, name: 'Staraja Ladoga', nameEn: 'Staraya Ladoga', isCity: true },
      { lat: 58.5219, lng: 31.2756, name: 'Novgorod', nameEn: 'Novgorod', isCity: true },
      { lat: 54.5167, lng: 30.4167, name: 'Smolensk', nameEn: 'Smolensk', isCity: true },
      { lat: 50.4501, lng: 30.5234, name: 'Kiev', nameEn: 'Kyiv', isCity: true },
      { lat: 46.63, lng: 32.60, name: 'Svarta havet', nameEn: 'Black Sea' },
      { lat: 41.0082, lng: 28.9784, name: 'Konstantinopel', nameEn: 'Constantinople', isCity: true }
    ]
  },
  {
    id: 'volga-route',
    name: 'Volgarutten',
    nameEn: 'Volga Route',
    period: 'ca 750–1050',
    periodStart: 750,
    periodEnd: 1050,
    color: '#2563eb', // Blue
    goods: ['slavar', 'pälsar', 'svärd', 'honung', 'vax'],
    destinations: ['Volga Bulgarien', 'Atil (Khazarer)', 'Bagdad'],
    description: 'Volgarutten från Novgorod via Volga till Kaspiska havet och den muslimska världen. Central för silverhande med arabvärlden.',
    descriptionEn: 'The Volga route from Novgorod via the Volga to the Caspian Sea and the Muslim world. Central for silver trade with the Arab world.',
    coordinates: [
      { lat: 59.3350, lng: 17.5447, name: 'Birka', nameEn: 'Birka', isCity: true },
      { lat: 59.6197, lng: 17.7239, name: 'Sigtuna', nameEn: 'Sigtuna', isCity: true },
      { lat: 60.1272, lng: 32.2963, name: 'Staraja Ladoga', nameEn: 'Staraya Ladoga', isCity: true },
      { lat: 58.5219, lng: 31.2756, name: 'Novgorod', nameEn: 'Novgorod', isCity: true },
      { lat: 56.8519, lng: 53.2115, name: 'Volga Bulgarien', nameEn: 'Volga Bulgaria', isCity: true },
      { lat: 46.1, lng: 48.0, name: 'Atil (Khazarriket)', nameEn: 'Atil (Khazar Khaganate)', isCity: true },
      { lat: 42.0, lng: 50.0, name: 'Kaspiska havet', nameEn: 'Caspian Sea' },
      { lat: 33.3152, lng: 44.3661, name: 'Bagdad', nameEn: 'Baghdad', isCity: true }
    ]
  },
  {
    id: 'bjarmia-route',
    name: 'Bjarmaleden',
    nameEn: 'Bjarmia Route',
    period: 'ca 800–1050',
    periodStart: 800,
    periodEnd: 1050,
    color: '#16a34a', // Green
    goods: ['pälsar', 'valrosselfenben', 'fisk', 'slavar'],
    destinations: ['Volga Bulgarien', 'Kaspiska havet', 'muslimska världen'],
    description: 'Nordlig rutt från Vita havet (Arkhangelsk) via Dvina till Volga. Alternativ väg till östern från norra Skandinavien.',
    descriptionEn: 'Northern route from the White Sea (Arkhangelsk) via Dvina to the Volga. Alternative eastern route from northern Scandinavia.',
    coordinates: [
      { lat: 69.3535, lng: 18.9551, name: 'Tromsö', nameEn: 'Tromsø', isCity: true },
      { lat: 64.5467, lng: 40.5467, name: 'Arkhangelsk (Bjarmia)', nameEn: 'Arkhangelsk (Bjarmia)', isCity: true },
      { lat: 61.7849, lng: 46.6344, name: 'Norra Dvina', nameEn: 'Northern Dvina' },
      { lat: 59.2239, lng: 39.8843, name: 'Vologda', nameEn: 'Vologda', isCity: true, isPortage: true },
      { lat: 58.0, lng: 42.0, name: 'Volga (övre lopp)', nameEn: 'Volga (upper course)' },
      { lat: 56.8519, lng: 53.2115, name: 'Volga Bulgarien', nameEn: 'Volga Bulgaria', isCity: true }
    ]
  },
  {
    id: 'amber-route',
    name: 'Bärnstensrutten',
    nameEn: 'Amber Route',
    period: 'ca 500 f.Kr. – 1200 e.Kr.',
    periodStart: -500,
    periodEnd: 1200,
    color: '#f59e0b', // Amber/Orange
    goods: ['bärnsten', 'pälsar', 'salt', 'fisk (sill)', 'hantverk'],
    destinations: ['Rom', 'Venedig', 'Medelhavsområdet'],
    description: 'Urgammal handelsrutt från Östersjökusten genom Europa till Medelhavet. Bärnsten var extremt värdefullt i antikens Rom.',
    descriptionEn: 'Ancient trade route from the Baltic coast through Europe to the Mediterranean. Amber was extremely valuable in ancient Rome.',
    coordinates: [
      { lat: 54.5260, lng: 13.3916, name: 'Samland (bärnstenskust)', nameEn: 'Samland (amber coast)', isCity: true },
      { lat: 54.35, lng: 18.65, name: 'Gdańsk', nameEn: 'Gdańsk', isCity: true },
      { lat: 52.2297, lng: 21.0122, name: 'Warszawa', nameEn: 'Warsaw', isCity: true },
      { lat: 50.0755, lng: 14.4378, name: 'Prag', nameEn: 'Prague', isCity: true },
      { lat: 48.2082, lng: 16.3738, name: 'Wien', nameEn: 'Vienna', isCity: true },
      { lat: 45.4408, lng: 12.3155, name: 'Venedig', nameEn: 'Venice', isCity: true },
      { lat: 41.9028, lng: 12.4964, name: 'Rom', nameEn: 'Rome', isCity: true }
    ]
  }
];

export const getAllTradeRoutes = () => VIKING_TRADE_ROUTES;

export const getRoutesByTimePeriod = (year: number) => {
  return VIKING_TRADE_ROUTES.filter(
    route => year >= route.periodStart && year <= route.periodEnd
  );
};
