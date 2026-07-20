// Utflyktsmål från vikingatiden och äldre. Delad datakälla så att både
// Excursions-sidan och welcome-kortet (HeroStatsGrid) räknar samma lista.

/** En monument-/lämningstyp för legenden på en utflykts detaljsida. */
export interface MonumentType {
  sv: string;
  en: string;
  /** Legendfärg (hex) för symbolen. */
  color: string;
}

export interface Excursion {
  id: string;
  name: string;
  region: string;
  period: string;
  coords: { lat: number; lng: number };
  sv: string;
  en: string;
  /** Region-/temagrupp för sektionsindelning på utflyktssidan. */
  group?: string;
  /** Typologi över monument på platsen — visas som färgkodad legend på detaljsidan. */
  monumentTypes?: MonumentType[];
  /** Signum för en runsten att lyfta fram på detaljsidan (inskrift + ristare + edda-länkar via RPC get_excursion_detail). */
  signum?: string;
  /** Titlar i historical_sources att lyfta fram som källor. */
  relatedSources?: string[];
  /** Namn i historical_kings att lyfta fram. */
  relatedKings?: string[];
  /** Slug-mapp under /excursion-photos/ med komprimerade platsfoton (se manifest.json). */
  photoDir?: string;
  /** Alternativ thumbnail-fil i photoDir (default thumb.jpg) — när flera utflykter delar fotomapp. */
  thumbFile?: string;
  /** Fotokreditering när thumbnail kommer från extern källa (Wikimedia Commons: upphovsman + licens). */
  thumbCredit?: string;
  /** Hämta ALLA fornborgar i denna region ur viking_fortresses (live DB) och plotta på kartan. */
  fortressRegion?: string;
  /** Extra intressepunkter att markera på detaljkartan (t.ex. flera lämningar inom samma utflykt). */
  points?: { name: string; lat: number; lng: number; note?: string }[];
}

// Ordning som grupperna visas i på sidan.
export const EXCURSION_GROUPS = [
  'Uppland & Mälardalen',
  'Ting & eriksgata',
  'Österleden & skärgårdshavet',
  'Södermanland',
  'Östergötland',
  'Västergötland',
  'Småland & Kalmarsund',
  'Öland',
  'Gotland – Visby',
  'Gotland – Norra',
  'Gotland – Södra',
  'Skåne',
  'Blekinge',
  'Bohuslän & Västkusten',
  'Megalitgravar (dösar)',
];

export const EXCURSIONS: Excursion[] = [
  {
    id: 'kalmar-jarnalder',
    name: 'Kalmar – järnåldersgravfälten & Hossmo',
    region: 'Kalmar, Småland',
    group: 'Småland & Kalmarsund',
    period: 'Brons-/järnålder–vikingatid',
    coords: { lat: 56.6860, lng: 16.3250 },
    points: [
      { name: 'Brukshagen', lat: 56.6850, lng: 16.3250, note: 'Stort järnåldersgravfält med domarring; informationstavla.' },
      { name: 'Djurängshagen', lat: 56.6877, lng: 16.3323, note: 'Gravfält — här begravdes en vikingatida kvinna för ~1200 år sedan (skylt).' },
      { name: 'Tjuvbackarna', lat: 56.6791, lng: 16.3104, note: 'Gravfält med informationstavla; betesdjur delar av året.' },
      { name: 'Mobackarna', lat: 56.6825, lng: 16.3180, note: 'Gravfält och spår av forntida åkrar (ungefärligt läge).' },
      { name: 'Skälby gård', lat: 56.6880, lng: 16.3200, note: 'Förhistorisk gård, senare kungsgård under Gustav Vasa; idag 4H-gård (ungefärligt läge).' },
      { name: 'Hossmo kyrka', lat: 56.6372, lng: 16.2252, note: 'Romansk 1100-talskyrka söder om Kalmar vid Ljungbyåns mynning — järnålderns och medeltidens Möre-bygd.' },
    ],
    sv: `## Varför är det värt ett besök
Kalmar var en viktig plats långt före medeltidsstaden. På järnåldern sköt en havsvik in i landet (havet stod ~1,5 m högre) och den skyddade naturhamnen lockade till bosättning och handel. Runt dagens Hansa City, mellan industriområden och bostäder, ligger ett grönt stråk — Brukshagen, Tjuvbackarna, Mobackarna och Djurängshagen — med stora gravfält från järnåldern och spår av dåtidens åkrar. Mängden stora gravfält och rika fynd visar att trakten var betydelsefull redan för 1000–1500 år sedan.

## Vad man kan se
Rösen, stensättningar och stenkretsar från brons- och järnålder. En **domarring** (rund stenkrets, som man förr trodde var en tingsplats) står i Brukshagen. I Djurängen begravdes en vikingatida kvinna för omkring 1200 år sedan — det berättas på informationstavlan. Mellan gravfälten syns låga stenhägnader kring forntida åkrar. Vid stråket ligger även anrika Skälby gård.

Söder om staden, vid Ljungbyåns mynning, står **Hossmo kyrka** — en av Sveriges äldsta romanska kyrkor (1100-tal) i den gamla Möre-bygden.

## Hitta hit
Gravfälten når du lätt till fots, med cykel eller på joggingrundan i stråket kring Djurängen/Brukshagen i norra Kalmar. Informationstavlor finns vid Tjuvbackarna, Brukshagen och östra Djurängshagen. Hossmo ligger några kilometer söderut.

## Barnvänligt
Ja — lättgångna stigar och tydliga skyltar. OBS: betesdjur finns vid Mobackarna, Tjuvbackarna och östra Brukshagen delar av året; gå inte in med hund i hagarna då, och mata inte djuren.

## Andra saker att upptäcka i närheten
[Öland](/explore?searchQuery=Öland) och Kalmarsund; den medeltida [Kung Valdemars segelled](/explore?focus=rivers) passerade rakt utanför. Möreleden, den gamla färdvägen från Bottorp till Stuvenäs, löper genom bygden söderut.`,
    en: `## Why it is worth a visit
Kalmar was an important place long before the medieval town. In the Iron Age a bay of the sea reached inland (the sea stood ~1.5 m higher) and the sheltered natural harbour drew settlement and trade. Around today's Hansa City, between industrial estates and housing, runs a green corridor — Brukshagen, Tjuvbackarna, Mobackarna and Djurängshagen — with large Iron-Age grave fields and traces of ancient fields. The many great grave fields and rich finds show the district mattered already 1000–1500 years ago.

## What you can see
Cairns, stone settings and stone circles from the Bronze and Iron Ages. A **judge's ring** (round stone circle, once thought to be a thing-site) stands in Brukshagen. At Djurängen a Viking-Age woman was buried about 1200 years ago — told on the information sign. Between the grave fields you can see low stone banks around ancient fields. By the corridor lies the historic Skälby manor.

South of town, at the mouth of the Ljungbyån, stands **Hossmo church** — one of Sweden's oldest Romanesque churches (12th century) in the old Möre district.

## Getting there
The grave fields are easily reached on foot, by bike or on a jog in the corridor around Djurängen/Brukshagen in northern Kalmar. Information boards stand at Tjuvbackarna, Brukshagen and eastern Djurängshagen. Hossmo lies a few kilometres to the south.

## Family-friendly
Yes — easy paths and clear signs. Note: grazing animals are present at Mobackarna, Tjuvbackarna and eastern Brukshagen part of the year; don't enter the enclosures with a dog then, and don't feed the animals.

## More to discover nearby
[Öland](/explore?searchQuery=Öland) and the Kalmar Strait; the medieval [King Valdemar's sailing route](/explore?focus=rivers) passed just offshore. The Möre road, the old route from Bottorp to Stuvenäs, runs through the district to the south.`,
  },
  {
    id: 'birka',
    photoDir: 'birka',
    thumbCredit: 'Lars Kennerstedt / Kulturmiljöbild, RAÄ (PD)',
    name: 'Birka',
    region: 'Björkö, Mälaren (Ekerö)',
    group: 'Uppland & Mälardalen',
    period: 'ca 750–970 e.Kr.',
    coords: { lat: 59.336, lng: 17.542 },
    sv: 'Vikingatidens främsta handelsstad, på ön Björkö i Mälaren. Här landsteg Ansgar på sin mission 829/830. Gravfält med tusentals högar, en befäst stadsvall och hamnlämningar. Världsarv tillsammans med Hovgården.',
    en: "The foremost Viking-Age trading town, on the island of Björkö in Lake Mälaren. Ansgar landed here on his mission in 829/830. Grave fields with thousands of mounds, a fortified town rampart and harbour remains. A World Heritage Site together with Hovgården.",
    relatedKings: ['Kung Björn'],
    relatedSources: ['Ansgars levnad (Vita Ansgarii)'],
  },
  {
    id: 'langhundraleden',
    photoDir: 'langhundraleden-broborg',
    thumbFile: 'thumb-2.jpg',
    // U 357 (Skepptuna) hör till leden — detaljsidan visar inskrift+ristare via RPC.
    signum: 'U 357',
    name: 'Långhundraleden',
    region: 'Uppland (Trälhavet–Uppsala)',
    group: 'Uppland & Mälardalen',
    period: 'Järnålder–vikingatid',
    coords: { lat: 59.55, lng: 18.05 },
    sv: 'En forntida vattenled från Trälhavet vid Östersjön genom sjöar och åar upp mot Uppsala — kartan visar hela sträckningen. En pulsåder för transport och handel under järnålder och vikingatid, kantad av gravfält och runstenar; kring 500 e.Kr. låg vattnet 6–7 m högre än idag. Vid ledens övre lopp står runstenen U 357 vid Skepptuna kyrka — ett av flera vittnesbörd om bygdens välstånd när leden ännu band samman Uppsala med Östersjön. Vid ledens trängsta passage vakar fornborgen Broborg med sin förglasade mur — resande syntes på långt håll, och med vårdkasar (signaleldar på höjderna) kunde en varning nå Gamla Uppsala, 3–4 mil bort, på några minuter. På andra sidan borgberget ligger Hönsgärde med ett järnåldersgravfält om över 100 gravar; bebyggelsen låg troligen i anslutning till den nuvarande byn. Landhöjningen har sedan dess torrlagt delar av leden.',
    en: 'An ancient waterway from Trälhavet on the Baltic through lakes and streams up towards Uppsala — the map shows the full route. A transport and trade artery during the Iron Age and Viking Age, lined with grave fields and runestones; around AD 500 the water stood 6–7 m higher than today. On the upper reaches stands runestone U 357 by Skepptuna church — one of several witnesses to the district\'s prosperity when the route still linked Uppsala with the Baltic. At the narrowest passage the hillfort Broborg keeps watch with its vitrified wall — travellers were visible from afar, and with beacon fires (vårdkasar) on the heights a warning could reach Gamla Uppsala, 30–40 km away, within minutes. On the far side of the fort hill lies Hönsgärde with an Iron Age grave field of over 100 graves; the settlement probably lay by the present-day village. Land uplift has since dried out parts of the route.',
    monumentTypes: [
      { sv: 'Fornborg', en: 'Hillfort', color: '#ef4444' },
      { sv: 'Gravfält', en: 'Grave field', color: '#a855f7' },
      { sv: 'Farled', en: 'Waterway', color: '#eab308' },
    ],
  },
  {
    id: 'broborg',
    photoDir: 'langhundraleden-broborg',
    name: 'Broborg',
    region: 'Vassunda, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Vendeltid–vikingatid',
    coords: { lat: 59.72, lng: 17.87 },
    sv: 'En av Upplands mest anmärkningsvärda fornborgar (95×85 m), på ett borgberg ~40 m över den forna Långhundraleden vid Stenby gård. Dubbla vallar: inre ringmur 300 m lång och 8–15 m bred, yttre vall 140 m, två ingångar. Det unika är den medvetet förglasade ringmuren — stenen har hettats till över 1 100 °C i boxliknande "ugnar" längs murens insida och smält samman till ett hårt, glänsande material (gnejs, granit, amfibolit); analyserna (Upplandsmuseet 1992, Arkeologerna 2018:127) visar byggnadsteknik, inte brand. Två byggfaser: grundad under folkvandringstid (kol 1982: ca 375–550), förglasad under vendeltid (kol 2017–18: ca 550–750). Härifrån kontrollerades farleden mot Gamla Uppsala — utkik, trolig tullplats och första länken i vårdkase-kedjan; muren måste ha glänst långt ut över vattnet. Grimsasägnen om hövdingadottern som brände borgen "så att det syntes till Gamla Uppsala" bevarar kanske ett eko av förglasningen. Bo Gräslund har föreslagit en koppling till Beowulfkvädets svear–götar-konflikter — en omdiskuterad hypotes, inte etablerad forskning. Intill ligger Grimsahögen och på andra sidan berget Hönsgärde gravfält (100+ gravar).',
    en: 'One of Uppland\'s most remarkable hillforts (95×85 m), on a crag ~40 m above the former Långhundraleden waterway at Stenby farm. Double ramparts: an inner ring wall 300 m long and 8–15 m wide, an outer bank of 140 m, two entrances. Its unique feature is the deliberately vitrified ring wall — stone heated above 1,100 °C in box-like "furnaces" along the wall\'s inner face until it fused into a hard, glassy mass (gneiss, granite, amphibolite); analyses (Upplandsmuseet 1992; Arkeologerna report 2018:127) show construction technique, not accidental fire. Two building phases: founded in the Migration Period (charcoal 1982: c. 375–550), vitrified in the Vendel Period (charcoal 2017–18: c. 550–750). From here the approach to Gamla Uppsala was controlled — lookout, likely toll point and first link in the beacon-fire chain; the wall must have gleamed far across the water. The Grimsa legend, of the chieftain\'s daughter who burned the fort "so it was seen all the way to Gamla Uppsala", may preserve an echo of the vitrification. Bo Gräslund has proposed a link to the Swede–Geat conflicts of Beowulf — a debated hypothesis, not established scholarship. Beside the fort lies the Grimsa mound, and beyond the hill the Hönsgärde grave field (100+ graves).',
    monumentTypes: [
      { sv: 'Fornborg', en: 'Hillfort', color: '#ef4444' },
      { sv: 'Gravfält', en: 'Grave field', color: '#a855f7' },
      { sv: 'Gravhög', en: 'Burial mound', color: '#f97316' },
      { sv: 'Farled', en: 'Waterway', color: '#eab308' },
    ],
  },
  {
    id: 'valsgarde',
    photoDir: 'valsgarde',
    thumbCredit: 'Joe Mabel, CC BY-SA 4.0, Wikimedia Commons',
    name: 'Valsgärde',
    region: 'Gamla Uppsala, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Vendeltid–vikingatid (ca 500–1000)',
    coords: { lat: 59.9226, lng: 17.6178 },
    sv: 'Båtgravfält vid Fyrisån strax norr om Gamla Uppsala, använt i över 500 år. Eliten begravdes i fullt utrustade båtar med hjälmar, vapen och praktföremål — en motsvarighet till Vendel och en nyckel till vendel- och vikingatidens aristokrati.',
    en: 'A boat-grave cemetery by the Fyris river just north of Gamla Uppsala, used for over 500 years. The elite were buried in fully equipped boats with helmets, weapons and precious objects — a counterpart to Vendel and a key to the Vendel- and Viking-Age aristocracy.',
  },
  {
    id: 'sigtuna',
    photoDir: 'sigtuna',
    thumbCredit: 'Brorsson, CC BY-SA 3.0, Wikimedia Commons',
    name: 'Sigtuna',
    region: 'Sigtuna, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Vikingatid–medeltid (ca 980–)',
    coords: { lat: 59.6169, lng: 17.7239 },
    sv: 'Sveriges äldsta ännu levande stad, grundad omkring 980 av kungamakten som efterföljare till Birka. Myntning under Olof Skötkonung och ett ovanligt rikt runmaterial. Att gå längs Stora gatan är att följa en gatusträckning från 900-talet. Längs vägen och i ruinparkerna står tre stora kyrkoruiner i sten från 1100-talet: S:t Per (troligen stiftskyrka), S:t Olof och S:t Lars, samt lämningar efter dominikanernas Mariakyrka. Runt och i staden finns ett tjugotal registrerade fornlämningar — gravfält, stensättningar och inte mindre än ett dussin runristningar (bl.a. U 394 vid S:t Pers ruin och ristningar vid S:t Olof och Maria kyrka). Fornborgen Trollberget vakar norr om staden. Bland lösfynden: Sigtunadosan (koppardosa med dróttkvätt-strof) och ett runben från tiden kring 1150, funnet vid Drakegården invid Stora gatan — inristat "skiftum skiþut … lyst kata a bein", kanske en juridisk gränsmarkering enligt Upplandslagens "stake och sten och ben". Sigtuna museum förvaltar den största arkeologiska samlingen från stadens äldsta tid.',
    en: "Sweden's oldest still-living town, founded around 980 by the royal power as a successor to Birka. Coinage under Olof Skötkonung and an unusually rich runic corpus. Walking along Stora gatan means following a street laid out in the 900s. Along it and in the ruin parks stand three great 12th-century stone church ruins: St Per (probably the cathedral), St Olof and St Lars, plus remains of the Dominicans' St Mary's church. In and around the town are some twenty registered ancient monuments — grave fields, stone settings and no fewer than a dozen runic carvings (among them U 394 by the St Per ruin, and carvings at St Olof and St Mary's). The Trollberget hillfort watches over the town from the north. Loose finds include the Sigtuna box (a copper box with a dróttkvætt stanza) and a rune-bone from around 1150, found at Drakegården by Stora gatan — carved \"skiftum skiþut … lyst kata a bein\", perhaps a legal boundary marker per the Uppland Law's \"stake and stone and bone\". Sigtuna Museum holds the largest archaeological collection from the town's earliest period.",
  },
  {
    id: 'fornsigtuna',
    name: 'Fornsigtuna (Signhildsberg)',
    region: 'Signhildsberg, Håtuna, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Vikingatid (ca 790–1050)',
    coords: { lat: 59.6172, lng: 17.6460 },
    sv: 'Fyra kilometer väster om Sigtuna, vid ett sund mellan Håtunaviken och Sigtunafjärden, låg stadens föregångare — en vikingatida kungsgård. På kartan heter platsen Signhildsberg, men den kallas Fornsigtuna. Platsen är känd från Ynglingatal (nedtecknat kring år 900), där den framställs som Odens hem och en kultplats. På husgrundsplatåer stod stora hallar där härskarna samlade mäktiga män och kvinnor till fester, rådslag och religiösa gästabud; runt om finns gravfält och norr om gården en forntida lagunhamn. Kronan på verket är storhögen Signhilds kulle — troligen en tingshög snarare än en gravhög, som motsvarigheterna i Gamla Uppsala. När Sigtuna grundades vid Mälarens strand i slutet av 900-talet övertog den nya staden kungsgårdens namn. Namnet Signhildsberg är sentida och kommer av att en ägare på 1600-talet knöt den fornnordiska kärlekssägnen om Hagbard och Signe till platsen.',
    en: 'Four kilometres west of Sigtuna, by a sound between Håtunaviken and Sigtunafjärden, lay the town\'s predecessor — a Viking-Age royal manor. On the map the place is called Signhildsberg, but it is known as Fornsigtuna ("Old Sigtuna"). It appears in Ynglingatal (written down around AD 900) as Odin\'s home and a cult site. On terraced house foundations stood great halls where rulers gathered powerful men and women for feasts, councils and religious banquets; grave fields surround it, and to the north lay an ancient lagoon harbour. Its crown is the great mound Signhild\'s Cairn — probably a thing-mound rather than a burial, like those at Gamla Uppsala. When Sigtuna was founded on the shore of Lake Mälaren in the late 900s, the new town took over the old manor\'s name. The name Signhildsberg is late, coined when a 17th-century owner tied the Old Norse love legend of Hagbard and Signe to the site.',
  },
  {
    id: 'uppakra',
    name: 'Uppåkra',
    region: 'Uppåkra, Skåne',
    group: 'Skåne',
    period: 'Järnålder–vikingatid (ca 100 f.Kr.–1000 e.Kr.)',
    coords: { lat: 55.6489, lng: 13.2003 },
    sv: 'Sydskandinaviens största och mest långlivade centralplats, söder om Lund. Ett kult- och maktcentrum med ett återuppbyggt "ceremonihus", enorma mängder offrade föremål och guldgubbar. Övergavs när Lund grundades.',
    en: 'The largest and most long-lived central place in southern Scandinavia, south of Lund. A cult and power centre with a rebuilt "ceremonial house", vast quantities of sacrificed objects and gold foil figures (guldgubbar). Abandoned when Lund was founded.',
  },
  {
    id: 'loddekopinge',
    name: 'Löddeköpinge',
    region: 'Löddeköpinge, Skåne',
    group: 'Skåne',
    period: 'Vikingatid (900-tal)',
    coords: { lat: 55.7594, lng: 13.0028 },
    sv: 'Vikingatida handels- och hantverksplats vid Lödde å, verksam på 900-talet. En säsongsmarknad ("köping") med tomtindelning och hantverksspår, kopplad till Öresundshandeln — och senare en tidig kyrkomiljö.',
    en: 'A Viking-Age trading and craft site by the Lödde river, active in the 10th century. A seasonal market ("köping") with plot divisions and craft traces, tied to the Öresund trade — and later an early church environment.',
  },
  {
    id: 'varnhem',
    name: 'Varnhem (Kata gård)',
    region: 'Varnhem, Västergötland',
    group: 'Västergötland',
    period: 'Vikingatid–medeltid (900-tal–)',
    coords: { lat: 58.3789, lng: 13.6486 },
    sv: 'Vid Kata gård grävdes en av Sveriges äldsta kända kristna miljöer fram — en privat gårdskyrka och kristen gravplats från 900-talet, långt före rikskristnandet. Här vilar Kata under en runförsedd gravhäll. Senare restes cistercienserklostret Varnhem.',
    en: "At Kata's farm, one of Sweden's oldest known Christian environments was excavated — a private manor church and Christian burial ground from the 10th century, long before the official Christianisation. Kata rests here beneath a runic grave slab. Later the Cistercian abbey of Varnhem was raised.",
  },
  {
    id: 'stora-rickebyhallen',
    photoDir: 'rickebyhallen',
    name: 'Stora Rickebyhällen',
    region: 'Rickeby, Boglösa socken, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Bronsålder (ca 1800–500 f.Kr.)',
    coords: { lat: 59.606, lng: 17.126 },
    sv: 'Ett av Upplands rikaste hällristningsfält (~19×19 m) i Boglösa, från en tid då trakten var skärgård och ristningarna låg vid vattnet. Här finns 51 skepp, 115 fotspår (många parvis, både barfota och med skor och vända ned mot vattnet), ett 90-tal skålgropar, ringar, spiraler samt människo- och djurfigurer och "stolen i Rickeby" — troligen ett klädnadsmönster.',
    en: 'One of Uppland\'s richest rock-carving fields (~19×19 m) at Boglösa, from a time when the area was an archipelago and the carvings lay by the water. It bears 51 ships, 115 footprints (many in pairs, both barefoot and shod, turned down toward the water), around 90 cup marks, rings, spirals, human and animal figures, and the "chair at Rickeby" — probably a garment pattern.',
  },
  {
    id: 'jordbro-gravfalt',
    photoDir: 'jordbro-gravfalt',
    name: 'Jordbro gravfält',
    region: 'Jordbro, Haninge, Södermanland',
    group: 'Södermanland',
    period: 'Järnålder (ca 500 f.Kr.–1000 e.Kr.)',
    coords: { lat: 59.131, lng: 18.122 },
    sv: 'Ett av Sveriges största järnåldersgravfält, på Södertörn — omkring tusen synliga gravar: stensättningar, domarringar, resta stenar och skeppssättningar, använt i över tusen år, intill den forntida farleden. Under äldre järnålder (ca 500 f.Kr.) kremerades den döde; ibland följde en gåva med på bålet — en kniv, en skära, en vävtyngd eller ett smycke. De brända benen samlades sedan ihop och lades i en kruka av keramik eller en träask som grävdes ner, ibland direkt i jorden.',
    en: 'One of Sweden\'s largest Iron Age grave fields, on Södertörn — around a thousand visible graves: stone settings, judge circles (domarringar), raised stones and stone ships, used for over a thousand years, beside the ancient waterway. In the older Iron Age (c. 500 BCE) the dead were cremated; sometimes a gift went onto the pyre — a knife, a sickle, a loom weight or a piece of jewellery. The burnt bones were then gathered and placed in a ceramic pot or a wooden box buried in the ground, sometimes directly in the earth.',
    monumentTypes: [
      { sv: 'Övertorvad gravsättning', en: 'Turf-covered burial', color: '#6b7280' },
      { sv: 'Stensättning med kantkedja', en: 'Stone setting with kerb', color: '#22c55e' },
      { sv: 'Stensättning med mittkonstruktion & kantränna', en: 'Stone setting with central construction & edge channel', color: '#10b981' },
      { sv: 'Rest sten', en: 'Raised stone', color: '#eab308' },
      { sv: 'Triangulär stenkrets', en: 'Triangular stone circle', color: '#f97316' },
      { sv: 'Kvadratisk stenkrets', en: 'Square stone circle', color: '#ef4444' },
      { sv: 'Domarring', en: 'Judge circle (stone circle)', color: '#a855f7' },
      { sv: 'Skeppsformig stensättning', en: 'Ship-shaped stone setting', color: '#3b82f6' },
      { sv: 'Röse', en: 'Cairn', color: '#78716c' },
      { sv: 'Stensättning med koncentriska stenkretsar', en: 'Stone setting with concentric circles', color: '#ec4899' },
      { sv: 'Byggnad', en: 'Building', color: '#14b8a6' },
      { sv: 'Grop', en: 'Pit', color: '#84cc16' },
    ],
  },
  {
    id: 'gaseborg',
    photoDir: 'gaseborg',
    name: 'Gåseborg',
    region: 'Görväln, Järfälla, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Järnålder/folkvandringstid (ca 300–500 e.Kr.)',
    coords: { lat: 59.418, lng: 17.836 },
    sv: 'En av Mälardalens största fornborgar (RAÄ Järfälla 62:1), på ett brant berg högt över Mälaren med fantastisk utsikt över Görvälnfjärden. Vid en undersökning 2002 hittade arkeologen Johan Carlström bland annat deglar — eldfasta behållare för metallgjutning — som daterar platsen till ca 300–500 e.Kr. Här har alltså funnits en bronsgjutarverkstad uppe på borgen, där högstatusföremål kan ha gjutits åt någon storman. En bit ned mot vattnet ligger Gåseborgs grotta, vars tak är ett jättelikt klippblock som kilats fast i en klyfta.',
    en: 'One of the largest hillforts in the Mälaren valley (RAÄ Järfälla 62:1), on a steep hill high above the lake with a spectacular view over Görväln bay. In a 2002 investigation the archaeologist Johan Carlström found, among other things, crucibles — refractory vessels for metal casting — dating the site to c. AD 300–500. A bronze-casting workshop thus operated up in the fort, perhaps producing high-status objects for a local magnate. Down towards the water lies the Gåseborg cave, whose roof is a giant boulder wedged into a cleft.',
  },
  {
    id: 'morastenar',
    photoDir: 'morastenar',
    name: 'Mora stenar',
    region: 'Lagga, Knivsta, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Medeltid (ca 1200–1500)',
    coords: { lat: 59.686, lng: 17.856 },
    sv: 'Platsen där Sveriges medeltida kungar valdes. På Mora äng, på gränsen mellan folklanden Tiundaland och Attundaland, låg Mora sten — den stora häll som den valde kungen lyftes upp på för att svära sin kungaed inför valförsamlingen. För varje val höggs sedan en mindre minnessten som lades på hällen, ett slags dokument över valet; det är dessa som kallas Mora stenar. Den förste kände är Magnus Ladulås (vald 1275), den siste Kristian I (1457). Därefter försvann Mora sten — enligt sägnen gömd av Sten Sture den yngre ~1515 för att hindra ett danskt kungaval; Gustav Vasa och Johan III lär förgäves ha letat efter den. Åtta minnesstenar finns kvar i ett litet stenhus (uppfört 1770 på Gustav III:s initiativ), däribland den berömda "Tre kronor"-stenen — ett av de tidigaste beläggen för tre kronor som Sveriges rikssymbol. Sveriges motsvarighet till skotternas Stone of Scone. Den rättsliga grunden ges i Äldre Västgötalagen ("svear äga taga konung och likaså vräka"), Upplandslagen och Magnus Erikssons landslag. Regentlängden går att läsa i den målade frisen inne i huset, inte på de vittrade stenarna.',
    en: 'The site where medieval Swedish kings were elected. On the Mora meadow, at the border of the old lands of Tiundaland and Attundaland, lay the Mora stone — the great slab onto which the chosen king was lifted to swear his royal oath before the assembly. For each election a smaller memorial stone was then carved and placed on the slab, a record of the election; these are the Mora stones. The first known is Magnus Ladulås (elected 1275), the last Christian I (1457). The Mora stone then vanished — by tradition hidden by Sten Sture the Younger c. 1515 to prevent a Danish royal election; Gustav Vasa and John III are said to have searched for it in vain. Eight memorial stones remain in a small stone house (built 1770 on Gustav III\'s initiative), including the famous "Three Crowns" stone — one of the earliest attestations of the three crowns as Sweden\'s national emblem. Sweden\'s counterpart to the Scots\' Stone of Scone. The legal basis is set out in the Older Westrogothic Law ("the Swedes have the right to take a king and likewise to depose"), the Law of Uppland and Magnus Eriksson\'s Law of the Realm.',
    relatedSources: ['Äldre Västgötalagen', 'Upplandslagen', 'Magnus Erikssons landslag'],
  },
  {
    id: 'oland_hillforts',
    photoDir: 'ismantorp-borg-oland',
    thumbFile: 'thumb-2.jpg',
    fortressRegion: 'Öland',
    name: 'Ölands fornborgar',
    region: 'Öland',
    group: 'Öland',
    period: 'Järnålder–folkvandringstid',
    coords: { lat: 56.65, lng: 16.60 },
    sv: 'Öland har en unik täthet av fornborgar — kartan visar samtliga 16 i databasen, från Vedby borg i norr till Eketorp i söder. De fyra viktigaste: det väldiga Gråborg (Ölands största ringborg, romerska guldsolidi funna), Eketorp (tre bosättningsfaser, helt rekonstruerad som friluftsmuseum), Ismantorp med sina nio portar och 88 husgrunder, och Sandby borg — platsen för massakern ca 480 e.Kr., där de dräpta lämnades kvar i husen och allt frystes i tiden. Även Bårby borg (bysantinskt guldmynt från Justinus I) och det nyligen återupptäckta Sörby borg — möjligen Ölands största — hör till bilden. Tillflykt, kult och maktcentra under folkvandringstidens orostider. Fotona nedan är från Ismantorp.',
    en: "Öland has a unique density of ring forts — the map shows all 16 in the database, from Vedby borg in the north to Eketorp in the south. The four most important: the vast Gråborg (Öland's largest, Roman gold solidi found), Eketorp (three occupation phases, fully reconstructed as an open-air museum), Ismantorp with its nine gates and 88 house foundations, and Sandby borg — scene of the massacre c. AD 480, where the slain were left in the houses and time stood still. Add Bårby borg (a Byzantine gold coin of Justin I) and the recently rediscovered Sörby borg — possibly Öland's largest. Refuge, cult and power centres in the troubled Migration Period. The photos below are from Ismantorp.",
    monumentTypes: [
      { sv: 'Rekonstruerad', en: 'Reconstructed', color: '#22c55e' },
      { sv: 'Utgrävd', en: 'Excavated', color: '#eab308' },
      { sv: 'Ej utgrävd', en: 'Not excavated', color: '#ef4444' },
    ],
  },
  {
    id: 'rosaring',
    photoDir: 'rosaring-processionsvag-labyrint',
    name: 'Rösaringsåsen',
    region: 'Låssa, Upplands-Bro',
    group: 'Uppland & Mälardalen',
    period: 'Vendeltid–vikingatid',
    coords: { lat: 59.51, lng: 17.63 },
    sv: 'På en rullstensås reser sig ett gravfält, en labyrint och en 540 m lång och 30 m bred, rak processionsväg kantad av stolphål. Vägen leder till en gravhög och tolkas som en ceremoniell "väg till dödsriket" — en av Nordens mest gåtfulla kultplatser.',
    en: 'On an esker rise a grave field, a labyrinth and a straight processional road, 540 m long and 30 m wide, lined with post-holes. The road leads to a burial mound and is interpreted as a ceremonial "road to the realm of the dead" — one of the Nordic region\'s most enigmatic cult sites.',
  },
  {
    id: 'ingvarstaget',
    photoDir: 'ingemarstaget',
    name: 'Ingvarståget (Gripsholmsstenen)',
    region: 'Mariefred, Södermanland',
    group: 'Södermanland',
    period: 'ca 1040 e.Kr.',
    coords: { lat: 59.2531, lng: 17.2140 },
    sv: 'Omkring 1041 ledde Ingvar den vittfarne en storslagen vikingafärd österut mot Serkland (Kaspiska havet) — som slutade i katastrof; nästan ingen kom hem. Ett tjugotal "Ingvarsstenar" i Mälardalen minner om de stupade. Mest berömd är Gripsholmsstenen (Sö 179) vid Gripsholms slott, rest av Tola efter sonen Harald, Ingvars bror: "De for manligen, fjärran efter guld, och österut gav de örnen föda. De dog söderut i Serkland."',
    en: 'Around 1041 Ingvar the Far-Travelled led a grand Viking expedition eastward toward Serkland (the Caspian Sea) — which ended in catastrophe; almost no one returned. Some two dozen "Ingvar runestones" across the Mälaren region commemorate the fallen. The most famous is the Gripsholm stone (Sö 179) at Gripsholm Castle, raised by Tóla after her son Haraldr, Ingvar\'s brother: "They fared like men far after gold, and in the east fed the eagle. They died in the south in Serkland."',
    signum: 'Sö 179',
  },
  {
    id: 'tanum',
    name: 'Tanums hällristningar',
    region: 'Tanum, Bohuslän',
    group: 'Bohuslän & Västkusten',
    period: 'Bronsålder (ca 1700–500 f.Kr.)',
    coords: { lat: 58.7020, lng: 11.3370 },
    sv: 'Ett av världens rikaste hällristningsområden, på Unescos världsarvslista. Vid Vitlyckehällen och Aspeberget täcker tusentals figurer berghällarna — skepp, plöjande oxar, vapenbärande krigare och det berömda "brudparet". Bronsålderns bildvärld inhuggen i granit.',
    en: 'One of the world\'s richest rock-carving areas, on the UNESCO World Heritage list. At the Vitlycke rock and Aspeberget thousands of figures cover the bedrock — ships, ploughing oxen, weapon-bearing warriors and the famous "bridal couple". The Bronze Age imagery carved into granite.',
  },
  {
    id: 'sigurdsristningen',
    photoDir: 'sigurdristningen',
    thumbCredit: 'Berig, CC BY 2.5, Wikimedia Commons',
    name: 'Sigurdsristningen (Ramsundsberget)',
    region: 'Sundbyholm, Södermanland',
    group: 'Södermanland',
    period: 'ca 1030 e.Kr.',
    coords: { lat: 59.3772, lng: 16.6156 },
    sv: 'En runristning (Sö 101) på en flat berghäll som avbildar sagan om Sigurd Fafnesbane — draksläparen. Sigurd sticker svärdet genom draken Fafner, steker dess hjärta och förstår fåglarnas tal. Nordisk hjältemytologi i sten, rest av Sigrid till minne av sin man.',
    en: 'A rune carving (Sö 101) on a flat rock face depicting the legend of Sigurd Fáfnisbani — the dragon slayer. Sigurd thrusts his sword through the dragon Fáfnir, roasts its heart and understands the speech of birds. Norse heroic mythology in stone, raised by Sigríðr in memory of her husband.',
    signum: 'Sö 101',
  },
  {
    id: 'himmelstalund',
    name: 'Himmelstalunds hällristningar',
    region: 'Norrköping, Östergötland',
    group: 'Östergötland',
    period: 'Bronsålder (ca 1700–500 f.Kr.)',
    coords: { lat: 58.5958, lng: 16.1553 },
    sv: 'Ett av Östergötlands största hällristningsområden, mitt i Norrköping vid Motala ström. Tusentals figurer — skepp, djur, fotsulor och människor — inhuggna i de slipade berghällarna. Fri entré i en stadspark; ristningarna målas ibland i rött för att synas.',
    en: 'One of Östergötland\'s largest rock-carving areas, in central Norrköping by the Motala ström river. Thousands of figures — ships, animals, footprints and human figures — carved into the smoothed bedrock. Free access in a city park; the carvings are sometimes painted red for visibility.',
  },
  {
    id: 'rokstenen',
    name: 'Rökstenen',
    region: 'Rök, Ödeshög, Östergötland',
    group: 'Östergötland',
    period: 'ca 800 e.Kr.',
    coords: { lat: 58.2958, lng: 14.7752 },
    sv: 'Världens mest kända runsten, rest vid Röks kyrka omkring år 800. Med drygt 700 runor bär den den längsta kända runinskriften — en gåtfull text som Varin ristade till minne av sin son Vämod, full av anspelningar på hjältesägner och kanske Teoderik den store.',
    en: 'The world\'s most famous runestone, raised by Rök church around the year 800. With over 700 runes it bears the longest known runic inscription — an enigmatic text that Varinn carved in memory of his son Vámóðr, full of allusions to heroic legends and perhaps Theoderic the Great.',
    signum: 'Ög 136',
  },
  {
    id: 'haga',
    photoDir: 'haga-hogen-kungs-bjorns-hog',
    name: 'Hågahögen',
    region: 'Håga, väster om Uppsala, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Bronsålder (ca 1000 f.Kr.)',
    coords: { lat: 59.8497, lng: 17.5878 },
    sv: 'Skandinaviens guldrikaste bronsåldersgrav, i Hågadalen i Bondkyrko socken strax väster om Uppsala. Hågahögen — även Björns hög eller Kung Björns hög — är ca 7 m hög och 45 m i diameter, anlagd omkring 1000 f.Kr. på vad som då var en udde i en Mälarvik: underst ett fyra meter högt stenröse, därpå fyra meter grästorv (mer än sex fotbollsplaner), totalt ~7 500 mansdagars arbete. Högen är ensam i sitt slag i Mellansverige — de närmaste motsvarigheterna är Lusehøj på Fyn och Seddin i norra Tyskland, och guldmängden motsvaras närmast av gravar i Oders dalgång. Vid utgrävningen 1902–03 (Oscar Almgren) hittades mer än en tredjedel av allt guld från Sveriges bronsålder — bland annat det berömda guldspännet, som stals från Historiska museet i februari 1986. Högen fortsatte att brukas: eldar har tänts på den, och i ytskiktet ligger ben av ekorrar, hundar, nöt, svin och flera människor — människobenen drygt 500 år äldre än gravens huvudperson, ett lårben brutet så att märgen kommit fram. Kring högen: tre gravhögar till, 24 runda stensättningar och två resta stenar; nere vid den forna stranden fornborgen Predikstolen. Tolkas som en föregångare till Gamla Uppsala.',
    en: 'Scandinavia\'s gold-richest Bronze Age grave, in the Håga valley just west of Uppsala. The Håga mound — also Björn\'s mound or King Björn\'s mound — is c. 7 m high and 45 m across, raised around 1000 BC on what was then a promontory in a bay of Lake Mälaren: a four-metre stone cairn at its core, covered by four metres of turf (more than six football pitches), some 7,500 man-days of labour in all. It is unique in central Sweden — the nearest counterparts are Lusehøj on Funen and Seddin in northern Germany, and the quantity of gold is matched only by graves of the Oder valley. The 1902–03 excavation (Oscar Almgren) yielded more than a third of all gold from Sweden\'s Bronze Age — including the famous gold brooch, stolen from the Museum of National Antiquities in February 1986. The mound remained in use: fires were lit upon it, and its surface layer holds bones of squirrels, dogs, cattle, pigs and several humans — the human bones some 500 years older than the grave\'s occupant, one femur broken to expose the marrow. Around it: three more mounds, 24 round stone settings and two raised stones; by the former shore, the Predikstolen hillfort. Interpreted as a forerunner of Gamla Uppsala.',
  },

  {
    id: 'boglosa',
    photoDir: 'boglosa',
    name: 'Boglösa hällristningar',
    region: 'Boglösa, Enköping, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Bronsålder (ca 1800–500 f.Kr.)',
    coords: { lat: 59.582, lng: 17.155 },
    sv: 'Upplands stora hällristningsbygd: kring Boglösa finns omkring 1 000 hällristningar fördelade på ca 400 platser, gjorda när trakten var skärgård och hällarna låg vid vattnet. Bland höjdpunkterna: Rickeby (RAÄ 94:1, se även Stora Rickebyhällen), solhjulet (RAÄ 58), fotsulorna (RAÄ 138:1) och skeppsbilderna med det berömda Brandskogsskeppet (RAÄ 109:1) — Sveriges kanske finaste ristade bronsåldersskepp, med bemanning och ett fint hästspann på samma häll.',
    en: 'Uppland\'s great rock-carving district: around Boglösa there are about 1,000 rock carvings across some 400 sites, made when the area was an archipelago and the panels lay by the water. Highlights include Rickeby (RAÄ 94:1, see also the Great Rickeby panel), the sun wheel (RAÄ 58), the footprints (RAÄ 138:1) and the ship carvings crowned by the famous Brandskog ship (RAÄ 109:1) — perhaps Sweden\'s finest carved Bronze Age ship, with crew and a fine horse team on the same panel.',
  },
  {
    id: 'skepptuna-u357',
    photoDir: 'runor-u357',
    name: 'Runstenen U 357 vid Skepptuna kyrka',
    region: 'Skepptuna, Sigtuna kommun, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Vikingatid (1000-tal)',
    coords: { lat: 59.660, lng: 18.063 },
    sv: 'Vid Skepptuna kyrka står runstenen U 357 — en av flera runstenar i denna gamla kyrkbygd norr om Märsta. Skepptuna ligger vid Långhundraledens övre lopp, och runstenarna vittnar om bygdens välstånd under sen vikingatid, när leden ännu band samman Uppsala med Östersjön.',
    en: 'By Skepptuna church stands runestone U 357 — one of several runestones in this old parish north of Märsta. Skepptuna lies on the upper reaches of the Långhundraleden waterway, and its runestones testify to the district\'s prosperity in the late Viking Age, when the route still linked Uppsala with the Baltic.',
    signum: 'U 357',
  },
  {
    id: 'arsta-skalgropar',
    photoDir: 'arsta-skalgropar',
    name: 'Årsta – skålgropar & Vallagravfältet',
    region: 'Årsta, Stockholm',
    group: 'Södermanland',
    period: 'Sten-/bronsålder–vikingatid',
    coords: { lat: 59.29224, lng: 18.03064 },
    relatedKings: ['Emund den gamle'],
    // Endast verifierade lägen får markör: skålgropsstenens adress (geokodad) och
    // Vallagravfältet vid Valla torg. Övriga skålgropar i trakten nämns i texten
    // men plottas INTE — vi har inte exakta positioner och gissar inte.
    points: [
      { name: 'Skålgropsstenen (offerstenen)', lat: 59.29224, lng: 18.03064, note: 'Brunnbyvägen 20, 120 44 Årsta.' },
      { name: 'Vallagravfältet — kungagraven', lat: 59.29378, lng: 18.04961, note: 'Vikingatida gravfält vid Valla torg (minnesskylt). Folktraditionens kungagrav — sveakungen Emund den gamle (d. ~1060).' },
    ],
    sv: `## Varför är det värt ett besök
Vid Brunnbyvägen 20 i Årsta ligger en skålgropssten — även kallad offersten eller älvkvarn. Årsta är ovanligt rikt på skålgropar: inom gång- och cykelavstånd finns ett halvdussin lokaler till, i Östberga, Älvsjö och Högdalen (se markörerna på kartan). Det gör trakten till ett av Stockholms bästa ställen att på nära håll förstå den här gåtfulla ristningstypen.

## Vad är en skålgrop?
En skålgrop är en i berget knackad rund grop, från någon centimeter upp till decimeterstora, huggna med knacksten under framför allt bronsåldern. De sitter på släta rundhällar och flyttblock, ofta vid forntida åkrar och stränder. Den vanligaste tolkningen kopplar dem till fruktbarhetskulten — man tänker sig ritualer för god äring (skörd).

I folktron kallades de älvkvarnar och stenarna offer- eller blotstenar. I Mälarlandskapen offrade man i groparna för att bota "älvblåst" (nässelutslag som troddes orsakat av älvor): små dockor av hår, naglar och tygbitar från den sjuke offrades under tre torsdagskvällar i rad, och groparna smordes med ister, talg eller smör. Man la också ner knappnålar och mynt. Seden levde kvar långt in i modern tid — smörjning belagd i södra Uppland så sent som 1923.

## Andra saker att upptäcka i närheten
I skogen vid Valla står en kulturminnesskylt vid ett vikingatida gravfält. Enligt folktraditionen ska sveakungen Emund den gamle ha begravts här efter sin död omkring 1060. Utgrävningar i slutet av 1990-talet gav inget stöd för hypotesen, men flera arabiska guldmynt från slutet av 900-talet påträffades — det är alltså inte osannolikt att någon betydelsefull person dött här. Läs mer på [Kungakrönikorna](/royal-chronicles).

Vägen förbi platsen är den gamla sträckningen ner mot Göta landsväg, medeltidens pulsåder söderut från Stockholm.

## Hitta hit
Offerstenen ligger vid Brunnbyvägen 20, 120 44 Årsta — nås lätt med tunnelbana (Gullmarsplan) eller pendeltåg (Årstaberg/Älvsjö) och kort promenad. Vallagravfältet ligger nära Valla torg.

Flera andra skålgropar finns i trakten — i Östberga (Åbyvägen och Östbergavägen), Älvsjö (Lerkrogen, Klockhuset, sydvästra Älvsjöskogen) och Högdalen. Vi plottar bara de lägen vi kunnat verifiera; de övriga går att hitta via RAÄ Fornsök.

## Barnvänligt
Ja — korta, lättgångna stopp i stadsnära natur. Skålgroparna är tacksamma att låta barn hitta och räkna.`,
    en: `## Why it is worth a visit
By Brunnbyvägen 20 in Årsta lies a cup-mark stone — also called an offering stone or "elf mill" (älvkvarn). Årsta is unusually rich in cup marks: within walking and cycling distance there are half a dozen more sites, in Östberga, Älvsjö and Högdalen (see the map markers). That makes the district one of Stockholm's best places to get close to this enigmatic type of carving.

## What is a cup mark?
A cup mark is a round hollow knocked into the rock, from a centimetre to a decimetre across, made with a hammerstone chiefly in the Bronze Age. They sit on smooth rounded outcrops and glacial boulders, often near prehistoric fields and shores. The most common interpretation ties them to the fertility cult — rituals for a good harvest.

In folk belief they were called "elf mills" and the stones offering or sacrificial stones. In the Mälaren provinces people made offerings in the cups to cure "elf-blast" (nettle rash thought to be caused by elves): small dolls of hair, nails and cloth from the sick person were offered on three consecutive Thursday evenings, and the cups were smeared with lard, tallow or butter. Pins and coins were also placed in them. The custom survived into modern times — smearing is attested in southern Uppland as late as 1923.

## More to discover nearby
In the woods at Valla a heritage sign marks a Viking-Age grave field. Folk tradition holds that the Swedish king Emund the Old was buried here after his death around 1060. Excavations in the late 1990s gave no support, but several Arab gold coins from the late 900s were found — so it is not unlikely that someone of importance died here. Read more in the [Royal Chronicles](/royal-chronicles).

The road past the site is the old course down towards Göta landsväg, the medieval artery running south from Stockholm.

## Getting there
The offering stone lies at Brunnbyvägen 20, 120 44 Årsta — easily reached by metro (Gullmarsplan) or commuter train (Årstaberg/Älvsjö) and a short walk. The Valla grave field is near Valla torg.

Several other cup marks lie in the district — in Östberga (Åbyvägen and Östbergavägen), Älvsjö (Lerkrogen, Klockhuset, south-western Älvsjöskogen) and Högdalen. We only plot locations we could verify; the others can be found via the National Heritage Board's Fornsök.

## Family-friendly
Yes — short, easy stops in urban nature. The cup marks are fun for children to find and count.`,
  },

  // === Österleden & skärgårdshavet ===
  {
    id: 'aland-vikingatid',
    name: 'Åland — Österledens nav',
    region: 'Saltvik/Finström, Åland (Finland)',
    group: 'Österleden & skärgårdshavet',
    period: 'Yngre järnålder–vikingatid (550–1050)',
    coords: { lat: 60.28, lng: 19.95 },
    sv: 'Åland — svenskspråkigt, i århundraden svenskt, idag finländskt — var Österledens nav: sjövägen Birka → Åland → Skärgårdshavet → Ladoga passerade här, och senare följer Kung Valdemars segelled (ca 1300) samma stråk via hamnen Lemböte. Ön är exceptionellt rik på vikingatid: talrika höggravfält med kremeringsgravar, undersökta gårdar som Bartsgårda i Finström (Helsingfors universitet), fynd av pärlor, spännbucklor och Birka-kopplade spännen, och export av fisk, sältran och sälskinn. Mest gåtfull är lertass-riten: en tass av bränd lera lades på gravurnan — unik för Åland i Skandinavien, men med paralleller i Volgaområdet i Ryssland, ett direkt arkeologiskt spår av österledskontakterna. Och mitt i all denna rikedom: INTE EN ENDA runsten — en av runologins olösta gåtor. (Källa: Ålands kulturhistoriska museum, museum.ax.)',
    en: 'Åland — Swedish-speaking, for centuries Swedish, today Finnish — was the hub of the Eastern Route: the sea road Birka → Åland → Archipelago Sea → Ladoga passed here, and King Valdemar\'s sailing route (c. 1300) later follows the same corridor via the harbour of Lemböte. The island is exceptionally rich in Viking Age remains: numerous mound cemeteries with cremation graves, excavated farms such as Bartsgårda in Finström, finds of beads, oval brooches and Birka-linked jewellery, and exports of fish, seal oil and seal skins. Most enigmatic is the clay-paw rite: a paw of fired clay placed on the burial urn — unique to Åland within Scandinavia, but paralleled in the Volga region of Russia, a direct archaeological trace of the eastern connections. And amid all this wealth: NOT A SINGLE runestone — one of runology\'s unsolved riddles. (Source: Åland Museum, museum.ax.)',
    relatedSources: ['Kung Valdemars jordebok (Det danska itinerariet)'],
    monumentTypes: [
      { sv: 'Farled (Österleden)', en: 'Route (Eastern route)', color: '#b45309' },
      { sv: 'Farled (Valdemars segelled)', en: 'Route (Valdemar\'s route)', color: '#7c3aed' },
      { sv: 'Plats', en: 'Site', color: '#eab308' },
    ],
  },
  {
    id: 'hitis-kyrksundet',
    name: 'Hitis & Kyrksundet — Finlands första runsten',
    region: 'Hitis (Hiittinen), Skärgårdshavet, Finland',
    group: 'Österleden & skärgårdshavet',
    period: 'Vikingatid (800–1050)',
    coords: { lat: 59.90, lng: 22.43 },
    sv: 'Vid Kyrksundet i Hitis skärgård låg en vikingatida handelsplats vid Österledens stråk — samma sund som itinerariets Jungfrusund i Kung Valdemars segelled. Här gjordes 1997 sensationsfyndet: en boende på Stora Ängesön fick upp ett runstensfragment av sandsten ur sjöbottnen vid sin brygga — Finlands första runsten. Av inskriften kan namnet Torfast läsas samt "raþi" ("må tyda"), med parallell i Ågerstastenens (U 729) berömda "Tyde den man som runkunnig är...". Magnus Källström (Riksantikvarieämbetet) har pekat på reliefhuggningen och de ovala skiljetecknen som knyter fragmentet till ristaren Balles krets kring Löts kyrka i Uppland — men o-runans vänsterlutande bistavar talar emot Balle själv, och fyndplatsens karaktär av lastageplats gör att stenen kan ha kommit dit som barlast. En öppen forskningsfråga, redovisad med alla förbehåll. (Källa: K-blogg/RAÄ 2016-04-20.)',
    en: 'At Kyrksundet in the Hitis archipelago lay a Viking-Age trading site on the Eastern Route — the same sound as the Jungfrusund of King Valdemar\'s itinerary. Here, in 1997, came the sensational find: a resident of Stora Ängesön pulled a sandstone runestone fragment from the seabed by his jetty — Finland\'s first runestone. The inscription yields the name Torfast and "raþi" ("may interpret"), paralleling the famous Ågersta stone (U 729). Magnus Källström (Swedish National Heritage Board) has pointed to the relief carving and oval word-dividers linking the fragment to the carver Balle\'s circle around Löt church in Uppland — but the o-rune\'s left-leaning branches argue against Balle himself, and the find spot\'s character as a loading place means the stone may have arrived as ship ballast. An open research question, presented with all caveats. (Source: K-blogg/RAÄ, 20 Apr 2016.)',
    signum: 'FI NOR1998;14',
    monumentTypes: [
      { sv: 'Farled (Österleden)', en: 'Route (Eastern route)', color: '#b45309' },
      { sv: 'Farled (Valdemars segelled)', en: 'Route (Valdemar\'s route)', color: '#7c3aed' },
      { sv: 'Fyndplats', en: 'Find spot', color: '#ef4444' },
      { sv: 'Handelsplats', en: 'Trading site', color: '#22c55e' },
    ],
  },

  // === Öland ===
  {
    id: 'ismantorps-borg',
    photoDir: 'ismantorp-borg-oland',
    name: 'Ismantorps borg',
    region: 'Långlöt, Öland',
    group: 'Öland',
    period: 'Folkvandringstid (ca 300–600 e.Kr.)',
    coords: { lat: 56.744, lng: 16.632 },
    sv: 'Ölands gåtfullaste fornborg, mitt på Mittlandsskogens alvar: en fullkomligt rund ringmur, 125 m i diameter, med nio portar och 88 husgrunder ordnade i kvarter kring en öppen mittplats. Nio portar är militärt orimligt — talet nio är heligt i nordisk mytologi, och borgen tolkas därför som lika mycket kult- och samlingsplats som försvarsverk.',
    en: 'Öland\'s most enigmatic ring fort, in the middle of the Mittland forest: a perfectly circular wall, 125 m across, with nine gates and 88 house foundations arranged in blocks around an open central space. Nine gates make no military sense — nine is the sacred number of Norse mythology, and the fort is therefore read as much as a cult and assembly site as a fortification.',
  },
  {
    id: 'karlevistenen',
    photoDir: 'karlevistenen',
    name: 'Karlevistenen',
    region: 'Karlevi, Vickleby, Öland',
    group: 'Öland',
    period: 'Vikingatid (ca 1000 e.Kr.)',
    coords: { lat: 56.607, lng: 16.442 },
    sv: 'Skaldekonstens främsta runsten: Karlevistenen (Öl 1) restes omkring år 1000 över den danske hövdingen Sibbe "den gode" och bär den enda fullständiga dróttkvätt-strofen bevarad på en runsten — hövisk furstelovprisning i den flätade versform som annars bara överlevt i de isländska handskrifterna. Stenen står kvar på sin ursprungliga plats vid Kalmarsund.',
    en: 'The finest skaldic runestone: the Karlevi stone (Öl 1) was raised around the year 1000 over the Danish chieftain Sibbi "the good" and bears the only complete dróttkvætt stanza preserved on a runestone — courtly princely praise in the interlaced metre otherwise known only from the Icelandic manuscripts. The stone still stands on its original spot by Kalmarsund.',
    signum: 'Öl 1',
  },
  {
    id: 'noaks_ark',
    name: 'Noaks Ark (skeppssättning)',
    region: 'Södra Öland',
    group: 'Öland',
    period: 'Brons-/järnålder',
    coords: { lat: 56.4250, lng: 16.5250 }, // VERIFIERA
    sv: 'En av Ölands stora skeppssättningar — stenar resta i formen av ett skepp, ett gravmonument från brons-/järnålder. Öland har flera skeppssättningar och gravfält längs den flacka kusten.',
    en: 'One of Öland\'s large stone ship settings — stones raised in the shape of a ship, a Bronze/Iron Age grave monument. Öland has several ship settings and grave fields along its flat coast.',
  },

  // === Gotland – Visby ===
  {
    id: 'fornsalen',
    name: 'Fornsalen (Gotlands museum)',
    region: 'Visby',
    group: 'Gotland – Visby',
    period: 'Sten- till medeltid',
    coords: { lat: 57.6403, lng: 18.2946 },
    sv: 'Gotlands museum i Visby — en given startpunkt för öns vikingatida sevärdheter, med skattkammare, bildstenshall och vikingatida föremål i samlingarna. Härifrån utgår upptäckterna över ön.',
    en: 'The Gotland Museum in Visby — a natural starting point for the island\'s Viking-Age sights, with a treasury, picture-stone hall and Viking-Age objects. The gateway to exploring the island.',
  },

  // === Gotland – Norra ===
  {
    id: 'lilla_bjars',
    name: 'Lilla Bjärs, Stenkyrka',
    region: 'Stenkyrka, norra Gotland',
    group: 'Gotland – Norra',
    period: 'Järnålder',
    coords: { lat: 57.7550, lng: 18.6650 }, // VERIFIERA
    sv: 'Ett av öns största gravfält, 15 hektar med över 1000 synliga gravar — mest rösen och stensättningar, många över sex meter i diameter. En forntida väg löper genom fältet.',
    en: 'One of the island\'s largest grave fields, 15 hectares with over 1000 visible graves — mostly cairns and stone settings, many over six metres across. An ancient road runs through it.',
  },
  {
    id: 'gamlahamn_faro',
    name: 'Gamlahamn, Fårö',
    region: 'Fårö',
    group: 'Gotland – Norra',
    period: 'Järnålder–medeltid',
    coords: { lat: 57.9280, lng: 19.1380 }, // VERIFIERA
    sv: 'Vid havsstranden ett gravfält med 15 låga rösen, intill en forntida hamn (idag en avsnörd bassäng). Där finns ruinen av ett medeltida kapell och en kyrkogård — en hamn med begravningsplats använd i ca 400 år fram till 1300-talet.',
    en: 'By the shore, a grave field of 15 low cairns beside an ancient harbour (today a cut-off basin). Nearby are the ruin of a medieval chapel and a churchyard — a harbour with burial ground used for some 400 years until the 14th century.',
  },
  {
    id: 'lilla_ihre',
    name: 'Lilla Ihre, Hellvi',
    region: 'Hellvi, norra Gotland',
    group: 'Gotland – Norra',
    period: 'Järnålder–vikingatid',
    coords: { lat: 57.7550, lng: 18.7950 }, // VERIFIERA
    sv: 'Ett av Gotlands största gravfält med över 600 synliga gravar från järnåldern; de yngsta i söder är vikingatida. Runda stensättningar och rösen, rika på vapen — även en bildsten har hittats.',
    en: 'One of Gotland\'s largest grave fields with over 600 visible Iron Age graves; the youngest in the south are Viking Age. Round stone settings and cairns, rich in weapons — a picture stone was also found.',
  },
  {
    id: 'trullhalsar',
    name: 'Trullhalsar, Norrlanda',
    region: 'Norrlanda, östra Gotland',
    group: 'Gotland – Norra',
    period: 'Järnålder–vikingatid',
    coords: { lat: 57.6280, lng: 18.6250 }, // VERIFIERA
    sv: 'Ca 350 gravar — rösen, domarringar och stensättningar, många kantade med noggrant lagda kalkstensflisor. De undersökta gravarna visar att särskilt kvinnorna fått gravgåvor som vittnar om hög status.',
    en: 'About 350 graves — cairns, judge-rings and stone settings, many edged with carefully laid limestone slabs. Excavated graves show that women in particular received grave goods indicating high status.',
  },
  {
    id: 'torsburgen',
    name: 'Torsburgen, Kräklingbo',
    region: 'Kräklingbo, östra Gotland',
    group: 'Gotland – Norra',
    period: 'Järnålder–vikingatid',
    coords: { lat: 57.4180, lng: 18.6480 },
    sv: 'Nordens största förhistoriska fornborg (ca 1,15 km²) — dels naturliga klippbranter, dels en två km lång och sju meter hög försvarsvall på sydsidan. Byggd i faser, bland annat under vikingatiden; troligen del av ett större försvarssystem.',
    en: 'The largest prehistoric hillfort in the Nordic countries (c. 1.15 km²) — partly natural cliffs, partly a 2 km long, 7 m high rampart on the south side. Built in phases, including during the Viking Age; probably part of a larger defensive system.',
  },

  // === Gotland – Södra ===
  {
    id: 'fjale_ala',
    name: 'Ödegården Fjäle, Ala',
    region: 'Ala, Gotland',
    group: 'Gotland – Södra',
    period: 'Järnålder–medeltid',
    coords: { lat: 57.4200, lng: 18.6000 }, // VERIFIERA
    sv: 'Ett av Sveriges bäst bevarade gårdsområden från järnålder och medeltid — husgrunder, gravar och brunnar samt en rekonstruktion av ett gårdshus. Gården övergavs på medeltiden men atmosfären är intakt.',
    en: 'One of Sweden\'s best-preserved Iron Age and medieval farm areas — house foundations, graves and wells, plus a reconstructed farmhouse. The farm was abandoned in the Middle Ages but its atmosphere remains intact.',
  },
  {
    id: 'bildstenar_ange',
    name: 'Bildstenar vid Änge, Buttle',
    region: 'Buttle, Gotland',
    group: 'Gotland – Södra',
    period: 'Tidig vikingatid',
    coords: { lat: 57.3800, lng: 18.5300 }, // VERIFIERA
    sv: 'Två bildstenar kvar på ursprunglig plats längs en av huvudvägarna över Lojsta hajd. Den ena är 3,7 m hög — den största bildsten som påträffats på ön. Från tidig vikingatid.',
    en: 'Two picture stones remaining in their original place along one of the main roads across Lojsta heath. One is 3.7 m tall — the largest picture stone found on the island. From the early Viking Age.',
  },
  {
    id: 'smiss_rikvide',
    name: 'Smiss och Rikvide, När',
    region: 'När, Gotland',
    group: 'Gotland – Södra',
    period: 'Järnålder–vikingatid',
    coords: { lat: 57.2800, lng: 18.6350 }, // VERIFIERA
    sv: 'Ett av Gotlands största gravfält med ca 800 synliga gravar. Flera bildstenar och många lösfynd har hittats; en rekonstruktion av en av bildstenarna står på platsen.',
    en: 'One of Gotland\'s largest grave fields with about 800 visible graves. Several picture stones and many stray finds have been made; a reconstruction of one picture stone stands on site.',
  },
  {
    id: 'bildsten_hablingbo',
    name: 'Bildsten, Hablingbo',
    region: 'Hablingbo, södra Gotland',
    group: 'Gotland – Södra',
    period: 'Vikingatid',
    coords: { lat: 57.1800, lng: 18.2450 }, // VERIFIERA
    sv: 'En bildsten som stod vid kyrkan; på kyrkogården hittades en runsten av samma form: "Vatgair och Halgair reste denna sten efter Hailgi, deras far som farit västerut med vikingarna." Båda finns nu i kyrkan.',
    en: 'A picture stone that stood by the church; in the churchyard a runestone of the same shape was found: "Vatgairr and Halgairr raised this stone after Hailgi, their father, who travelled west with the Vikings." Both are now in the church.',
  },
  {
    id: 'gannarve',
    name: 'Gannarve skeppssättning, Fröjel',
    region: 'Fröjel, västra Gotland',
    group: 'Gotland – Södra',
    period: 'Bronsålder',
    coords: { lat: 57.3480, lng: 18.1830 }, // VERIFIERA
    sv: 'En välbevarad och restaurerad skeppssättning nära västkusten — resta stenar i formen av ett skepp, ett bronsåldersgravmonument med havsutsikt.',
    en: 'A well-preserved, restored stone ship setting near the west coast — raised stones in the shape of a ship, a Bronze Age grave monument overlooking the sea.',
  },
  {
    id: 'galrums',
    name: 'Gålrums gravfält & Bandeläins täppu, Alskog',
    region: 'Alskog, Gotland',
    group: 'Gotland – Södra',
    period: 'Brons-/järnålder',
    coords: { lat: 57.3050, lng: 18.6350 }, // VERIFIERA
    sv: 'Ett gravfält med skeppssättningar, rösen och stensättningar; intill ligger Bandeläins täppu med sina skeppssättningar. En koncentration av förhistoriska gravmonument på sydöstra Gotland.',
    en: 'A grave field with stone ship settings, cairns and stone settings; nearby lies Bandeläins täppu with its ship settings. A concentration of prehistoric grave monuments in south-eastern Gotland.',
  },
  {
    id: 'paviken',
    name: 'Paviken–Västergarn',
    region: 'Västergarn, Gotland',
    group: 'Gotland – Södra',
    period: 'Vikingatid (700–1000-tal)',
    coords: { lat: 57.4370, lng: 18.1550 },
    sv: 'En av Gotlands större hamn- och handelsplatser med spår efter skeppsvarv, hantverk och bosättningar. Anlades på 700-talet och användes i ca 300 år. Söderut finns en välbevarad vikingatida stadsvall och en medeltida kastal.',
    en: 'One of Gotland\'s larger harbour and trading sites, with traces of shipyards, crafts and settlements. Founded in the 8th century and used for about 300 years. To the south is a well-preserved Viking-Age town rampart and a medieval keep.',
  },

  // === Skåne ===
  {
    id: 'ales_stenar',
    name: 'Ales stenar (Ängakåsen), Kåseberga',
    region: 'Kåseberga, Skåne',
    group: 'Skåne',
    period: 'Sen järnålder (ca 600 e.Kr.)',
    coords: { lat: 55.3797, lng: 14.0575 },
    sv: 'Sveriges största bevarade skeppssättning — 59 stenar i formen av ett 67 m långt skepp på en klint över havet vid Kåseberga. Gravfältet Ängakåsen ligger intill. Ett av landets mest ikoniska fornminnen.',
    en: 'Sweden\'s largest preserved stone ship setting — 59 stones forming a 67 m long ship on a cliff above the sea at Kåseberga. The Ängakåsen grave field lies adjacent. One of the country\'s most iconic ancient monuments.',
  },

  // === Blekinge ===
  {
    id: 'bjorketorp',
    name: 'Björketorpsstenen',
    region: 'Björketorp, Blekinge',
    group: 'Blekinge',
    period: 'ca 600–700 e.Kr.',
    coords: { lat: 56.2447, lng: 15.2903 },
    sv: 'En av Nordens mäktigaste runstenar (över 4 m) i en stensättning, med en hotfull förbannelseinskrift i urnordiska: den som bryter minnesmärket drabbas av olycka. Rest under vendeltiden.',
    en: 'One of the tallest runestones in the Nordic countries (over 4 m) within a stone setting, bearing a menacing curse inscription in Proto-Norse: whoever breaks the monument is struck by misfortune. Raised in the Vendel Period.',
  },

  // === Anundshög (Västmanland/Mälardalen) ===
  {
    id: 'anundshog',
    photoDir: 'anundshog',
    thumbCredit: 'Christer Johansson, CC BY-SA 2.5, Wikimedia Commons',
    name: 'Anundshög',
    region: 'Badelunda, Västerås',
    group: 'Uppland & Mälardalen',
    period: 'Järnålder–vikingatid',
    coords: { lat: 59.6103, lng: 16.6469 },
    sv: 'Sveriges största gravhög (ca 60 m i diameter) i ett storslaget fornlämningsområde med skeppssättningar, en runsten och raden av resta stenar längs en forntida väg (Eriksgatan). Ett maktcentrum under järnålder och vikingatid.',
    en: 'Sweden\'s largest burial mound (c. 60 m across) in a magnificent monument area with stone ship settings, a runestone and a row of raised stones along an ancient road (the Eriksgata). A centre of power in the Iron and Viking Ages.',
  },

  // === Megalitgravar (dösar) — bondestenåldern ===
  {
    id: 'havangsdosen',
    name: 'Havängsdösen',
    region: 'Haväng, Simrishamn, Skåne',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder (ca 3500 f.Kr.)',
    coords: { lat: 55.7030, lng: 14.2020 },
    sv: 'En av Skånes mest fotograferade dösar — en megalitgrav från trattbägarkulturen, dramatiskt belägen vid havet nära Verkeåns mynning. Dösen är den äldsta formen av megalitgrav i Norden.',
    en: 'One of Skåne\'s most photographed dolmens — a megalithic grave of the Funnel Beaker culture, dramatically set by the sea near the mouth of the Verkeån. The dolmen is the oldest form of megalithic grave in the Nordic region.',
  },
  {
    id: 'hagadosen',
    name: 'Hagadösen, Orust',
    region: 'Orust, Bohuslän',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder (3000–4000 f.Kr.)',
    coords: { lat: 58.1960, lng: 11.6070 }, // VERIFIERA
    sv: 'En välbevarad dös på Orust — en megalitgrav från bondestenåldern med bevarad gravkammare. Dösar konstruerades av stenblock på flera ton och är ofta spektakulära sevärdheter.',
    en: 'A well-preserved dolmen on Orust — a Stone Age megalithic grave with an intact chamber. Dolmens were built from blocks weighing many tonnes and are often spectacular sights.',
  },
  {
    id: 'skegriedosen',
    name: 'Skegriedösen',
    region: 'Skegrie, Trelleborg, Skåne',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder (ca 3500 f.Kr.)',
    coords: { lat: 55.3930, lng: 13.0980 },
    sv: 'En runddös vid Skegrie på Söderslätt — en av Skånes tydligaste megalitgravar från trattbägarkulturen, med kraftig kantkedja kring gravkammaren.',
    en: 'A round dolmen at Skegrie on the Söderslätt plain — one of Skåne\'s clearest Funnel Beaker megalithic graves, with a strong kerb of stones around the chamber.',
  },
  {
    id: 'ansarvedosen',
    name: 'Ansarvedösen',
    region: 'Tofta, Gotland',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder (ca 3300 f.Kr.)',
    coords: { lat: 57.5100, lng: 18.3000 }, // VERIFIERA
    sv: 'En av Gotlands få bevarade dösar — en megalitgrav från trattbägarkulturen, ovanlig så långt österut på ön.',
    en: 'One of Gotland\'s few preserved dolmens — a Funnel Beaker megalithic grave, unusual this far east on the island.',
  },
  {
    id: 'disas_ting',
    name: 'Disas ting',
    region: 'Svarte, Ystad, Skåne',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 55.4230, lng: 13.7170 }, // VERIFIERA
    sv: 'En megalitgrav vid Svarte som i folktron kopplats till "tingsplats"; en av flera dösar/gånggrifter i det täta stenålderslandskapet kring Ystad.',
    en: 'A megalithic grave near Svarte, popularly linked to an "assembly place"; one of several dolmens in the dense Stone Age landscape around Ystad.',
  },
  {
    id: 'trollasten',
    name: 'Dösen Trollasten',
    region: 'Ystad, Skåne',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder (ca 3500 f.Kr.)',
    coords: { lat: 55.5000, lng: 13.7700 }, // VERIFIERA
    sv: 'En välbevarad dös i Ystadstrakten med kraftigt takblock — en klassisk trattbägarkultursgrav.',
    en: 'A well-preserved dolmen in the Ystad area with a massive capstone — a classic Funnel Beaker grave.',
  },
  {
    id: 'eskilstorpsdosen',
    name: 'Eskilstorpsdösen',
    region: 'Vellinge, Skåne',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 55.4200, lng: 13.0600 }, // VERIFIERA
    sv: 'En dös på Söderslätt i sydvästra Skåne, ett område med hög täthet av megalitgravar.',
    en: 'A dolmen on the Söderslätt plain in south-western Skåne, an area with a high density of megalithic graves.',
  },
  {
    id: 'klockaredosen',
    name: 'Klockaredösen',
    region: 'Vellinge, Skåne',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 55.4000, lng: 13.0300 }, // VERIFIERA
    sv: 'En dös i Vellingebygden — en av Söderslätts många bevarade megalitgravar.',
    en: 'A dolmen in the Vellinge district — one of the Söderslätt plain\'s many preserved megalithic graves.',
  },
  {
    id: 'trollakistan',
    name: 'Trollakistan',
    region: 'Höör, Skåne',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 55.8500, lng: 13.5300 }, // VERIFIERA
    sv: 'En megalitgrav i mellersta Skåne vars namn ("trollkistan") speglar folktrons syn på de gåtfulla stenkamrarna.',
    en: 'A megalithic grave in central Skåne whose name ("the trolls\' chest") reflects folklore\'s view of these enigmatic stone chambers.',
  },
  {
    id: 'brot_anunds_grav',
    name: 'Bröt-Anunds grav',
    region: 'Hässleholm, Skåne',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 56.1600, lng: 13.7700 }, // VERIFIERA
    sv: 'En megalitgrav som i traditionen knutits till sagokungen Bröt-Anund. Namnkopplingen är sen — graven själv är från bondestenåldern.',
    en: 'A megalithic grave traditionally linked to the legendary king Bröt-Anundr. The name is a late attribution — the grave itself is from the Stone Age.',
  },
  {
    id: 'ganggriften_lunden',
    name: 'Gånggriften vid Lunden',
    region: 'Orust, Bohuslän',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder (ca 3300 f.Kr.)',
    coords: { lat: 58.1900, lng: 11.6000 }, // VERIFIERA
    sv: 'En gånggrift (megalitgrav med gång in till kammaren) på Orust — en senare och mer avancerad megalitform än dösen.',
    en: 'A passage grave (a megalithic tomb with a passage into the chamber) on Orust — a later, more advanced megalithic form than the dolmen.',
  },
  {
    id: 'klovedal_dos',
    name: 'Klövedal dös',
    region: 'Tjörn, Bohuslän',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 58.0300, lng: 11.5300 }, // VERIFIERA
    sv: 'En dös på Tjörn — Bohusläns kust har flera megalitgravar från trattbägarkulturen.',
    en: 'A dolmen on Tjörn — the Bohuslän coast has several Funnel Beaker megalithic graves.',
  },
  {
    id: 'nedre_hagadosen',
    name: 'Nedre Hagadösen',
    region: 'Orust, Bohuslän',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 58.2000, lng: 11.6100 }, // VERIFIERA
    sv: 'En av dösarna i Haga-området på Orust, tillsammans med Hagadösen ett litet megalitgravskluster.',
    en: 'One of the dolmens in the Haga area on Orust, forming a small megalithic-grave cluster together with the Haga dolmen.',
  },
  {
    id: 'torebo_altare',
    name: 'Torebo Altare',
    region: 'Orust, Bohuslän',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 58.1800, lng: 11.6200 }, // VERIFIERA
    sv: 'En megalitgrav på Orust vars stora, altarlika takblock gett den dess namn.',
    en: 'A megalithic grave on Orust whose large, altar-like capstone gave it its name.',
  },
  {
    id: 'valla_dos',
    name: 'Valla dös (Styrdalen)',
    region: 'Tjörn, Bohuslän',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 58.0000, lng: 11.5500 }, // VERIFIERA
    sv: 'En dös i Styrdalen på Tjörn — en trattbägarkultursgrav i det bohuslänska kustlandskapet.',
    en: 'A dolmen in Styrdalen on Tjörn — a Funnel Beaker grave in the Bohuslän coastal landscape.',
  },
  {
    id: 'brattas_dos',
    name: 'Brattås fornlämningsområde (dös)',
    region: 'Orust, Bohuslän',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 58.2500, lng: 11.5600 }, // VERIFIERA
    sv: 'Ett fornlämningsområde på Orust med en dös bland flera gravar — ett landskap format av bondestenålderns megalitbyggare.',
    en: 'A monument area on Orust with a dolmen among several graves — a landscape shaped by the Stone Age megalith builders.',
  },
  {
    id: 'klastorpsdosen',
    name: 'Klastorpsdösen',
    region: 'Varberg, Halland',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 57.1300, lng: 12.3500 }, // VERIFIERA
    sv: 'En dös i Varbergstrakten — Halland har megalitgravar längs kusten som Skåne och Bohuslän.',
    en: 'A dolmen in the Varberg district — Halland has coastal megalithic graves like Skåne and Bohuslän.',
  },
  {
    id: 'stenstugan',
    name: 'Stenstugan',
    region: 'Varberg, Halland',
    group: 'Megalitgravar (dösar)',
    period: 'Bondestenålder',
    coords: { lat: 57.1000, lng: 12.3000 }, // VERIFIERA
    sv: 'En megalitgrav i Halland vars namn ("stenstugan") speglar hur kammaren liknats vid ett litet stenhus.',
    en: 'A megalithic grave in Halland whose name ("the stone cottage") reflects how the chamber was likened to a small stone house.',
  },
  {
    id: 'vrangstad',
    name: 'Vrångstads gravfält',
    region: 'Tanum, Bohuslän',
    group: 'Megalitgravar (dösar)',
    period: 'Sten-/bronsålder',
    coords: { lat: 58.5500, lng: 11.4500 }, // VERIFIERA
    sv: 'Ett gravfält i Tanum med bland annat megalitgrav — i samma kommun som Tanums världsberömda hällristningar.',
    en: 'A grave field in Tanum including a megalithic grave — in the same municipality as Tanum\'s world-famous rock carvings.',
  },
  {
    id: 'alnabjar',
    name: 'Alnabjär skeppssättning',
    region: 'Bohuslän',
    group: 'Bohuslän & Västkusten',
    period: 'Brons-/järnålder',
    coords: { lat: 58.3000, lng: 11.5000 }, // VERIFIERA – exakt läge osäkert
    sv: 'En skeppssättning på västkusten — resta stenar i skeppsform som gravmonument. Exakt läge bör verifieras.',
    en: 'A stone ship setting on the west coast — raised stones in ship form as a grave monument. Exact location should be verified.',
  },

  // === Ting & eriksgata (nätverket kring Mora stenar) ===
  {
    id: 'gamla-uppsala',
    name: 'Gamla Uppsala',
    region: 'Gamla Uppsala, Uppland',
    group: 'Ting & eriksgata',
    period: 'Järnålder–medeltid (ca 500–1200 e.Kr.)',
    coords: { lat: 59.89444, lng: 17.63889 },
    sv: 'Forntida makt- och kultcentrum i Svealand, med de tre stora kungshögarna från 500–600-talet. Här låg enligt Adam av Bremen ett hednatempel, och platsen var skådeplats för både ting och offerfester (disatinget) och blomstrade som religiöst centrum före kristnandet. Blev biskopssäte 1164 innan ärkestolen på 1270-talet flyttades till nuvarande Uppsala.',
    en: 'An ancient centre of power and cult in Svealand, with the three great royal mounds from the 6th–7th centuries. According to Adam of Bremen a pagan temple stood here, and the site hosted both assembly (thing) and sacrificial feasts (the Disting), flourishing as a religious centre before Christianisation. It became an episcopal see in 1164 before the archbishopric moved to present-day Uppsala in the 1270s.',
    relatedSources: ['Magnus Erikssons landslag'],
  },
  {
    id: 'uppsala',
    photoDir: 'uppsala-domkyrka',
    thumbCredit: 'Arild Vågen, CC BY-SA 3.0, Wikimedia Commons',
    name: 'Uppsala (domkyrkan)',
    region: 'Uppsala, Uppland',
    group: 'Ting & eriksgata',
    period: 'Medeltid (från 1270-talet)',
    coords: { lat: 59.85813, lng: 17.63358 },
    sv: 'Ärkebiskopssäte sedan ärkestolen flyttades hit från Gamla Uppsala på 1270-talet. Uppsala domkyrka, Nordens största kyrkobyggnad, började byggas omkring 1272 och är sedan medeltiden rikets kyrkliga centrum. Staden var utgångspunkt för den vid Mora stenar nyvalde kungens eriksgata genom landskapen.',
    en: "An archiepiscopal seat since the archbishopric was moved here from Gamla Uppsala in the 1270s. Uppsala Cathedral, the largest church building in the Nordic countries, was begun around 1272 and has since the Middle Ages been the ecclesiastical centre of the realm. The city was the starting point for the Eriksgata of the king newly elected at the Mora stones.",
    relatedSources: ['Magnus Erikssons landslag'],
  },
  {
    id: 'laby-vad',
    name: 'Läby vad',
    region: 'Läby, väster om Uppsala, Uppland',
    group: 'Ting & eriksgata',
    period: 'Järnålder–medeltid',
    coords: { lat: 59.84250, lng: 17.54944 },
    sv: 'Ett vadställe i Hågaån cirka 5 km väster om Uppsala, där landsvägen mot Enköping länge korsade ån — en trolig passage för den kungliga eriksgatan västerut. Här restes 1835 ett monument till minne av att Gustav Vasa 1521 hanns upp av ärkebiskopens ryttare, men den exakta platsen är omdiskuterad (Oscar Almgren påpekade felplaceringen redan 1912–13).',
    en: "A ford across the Hågaån river about 5 km west of Uppsala, where the road towards Enköping long crossed the stream — a likely passage for the royal Eriksgata westward. A monument was raised here in 1835 commemorating how Gustav Vasa was overtaken by the archbishop's riders in 1521, though the exact spot is disputed (Oscar Almgren noted the misplacement already in 1912–13).",
    relatedSources: ['Magnus Erikssons landslag'],
  },
  {
    id: 'ullunda-vad',
    name: 'Ullunda vad',
    region: 'Ulunda, Tillinge, Enköping, Uppland',
    group: 'Ting & eriksgata',
    period: 'Vikingatid–medeltid',
    coords: { lat: 59.6427, lng: 17.0148 },
    sv: 'Ett stenlagt vadställe över Ullbrobäcken väster om Enköping, troligen passerat under eriksgatans återväg mot Uppsala. Alldeles intill står runstenarna U 792 och U 793 från 1000-talet — U 792 endast ett femtontal meter nordväst om själva vadet.',
    en: 'A stone-paved ford across the Ullbrobäcken stream west of Enköping, probably crossed on the return leg of the royal Eriksgata towards Uppsala. Right beside it stand the 11th-century runestones U 792 and U 793 — U 792 only some fifteen metres from the ford itself.',
    signum: 'U 792',
    relatedSources: ['Magnus Erikssons landslag'],
  },
  {
    id: 'ostanbro',
    name: 'Östanbro',
    region: 'Björksta, Västmanland',
    group: 'Ting & eriksgata',
    period: 'Medeltid',
    coords: { lat: 59.61953, lng: 16.86690 },
    sv: 'Ett broställe över Sagån i Björksta socken, omnämnt redan i Västmannalagen som "Östens bro". Broarna över Sagån var reglerade passager längs den kungliga eriksgatan, och Östanbro var enligt ett brev från 1504 en medeltida kungsgård — belägen strax söder om kung Östens hög.',
    en: 'A bridge crossing over the Sagån river in Björksta parish, mentioned already in the Law of Västmanland as "Östen\'s bridge". The Sagån bridges were regulated passages along the royal Eriksgata, and by a 1504 letter Östanbro was a medieval royal manor — set just south of King Östen\'s mound.',
    relatedSources: ['Magnus Erikssons landslag'],
  },
  {
    id: 'sparrsatra',
    name: 'Sparrsätra',
    region: 'Sparrsätra, Enköping, Uppland',
    group: 'Ting & eriksgata',
    period: 'Medeltid (slaget 1247; kyrka tidigt 1300-tal)',
    coords: { lat: 59.694278, lng: 16.976028 },
    sv: 'På Enköpingsslätten stod 1247 slaget vid Sparrsätra, då folkungarnas andra uppror mot Erik Eriksson (den läspe och halte) krossades — nederlaget bröt motståndet mot kungamaktens centralisering och beskattning. Den gotiska sockenkyrkan i sten restes i början av 1300-talet.',
    en: 'On the Enköping plain the Battle of Sparrsätra was fought in 1247, when the Folkungs\' second uprising against Erik Eriksson (the Lisp and Lame) was crushed — the defeat broke resistance to royal centralisation and taxation. The Gothic stone parish church was raised in the early 14th century.',
  },
  {
    id: 'huseby-svinnegarn',
    name: 'Huseby i Svinnegarn',
    region: 'Svinnegarn, Enköping, Uppland',
    group: 'Ting & eriksgata',
    period: 'Vikingatid–medeltid',
    coords: { lat: 59.5821, lng: 16.9890 },
    sv: 'Husby — en av kungamaktens forna kungsgårdar (husabyar), stödjepunkter för uppbörd under tidig medeltid — i Svinnegarns socken sydväst om Enköping. Den närbelägna Svinnegarns kyrka byggdes omkring 1200 troligen som gårdskyrka till kungsgården Huseby. Bygden låg vid eriksgatans stråk genom Fjärdhundraland.',
    en: "Husby — one of the crown's former royal estates (husabyar), support points for tax collection in the early Middle Ages — in Svinnegarn parish south-west of Enköping. The nearby Svinnegarn church, built around 1200, was probably the manor church of the royal estate of Huseby. The district lay on the route of the Eriksgata through Fjärdhundraland.",
    relatedSources: ['Magnus Erikssons landslag'],
  },
  {
    id: 'gryta',
    name: 'Gryta',
    region: 'Gryta, Enköping, Uppland',
    group: 'Ting & eriksgata',
    period: 'Medeltid',
    coords: { lat: 59.740917, lng: 17.347917 },
    sv: 'Gryta medeltida sockenkyrka ligger i en flack dalgång omkring två kilometer nordost om Örsundsbro, längs den gamla kungsvägen Eriksgatan i Lagunda härad. Trakten är rik på fornlämningar och runstenar från vikingatid och medeltid.',
    en: "Gryta's medieval parish church lies in a flat valley about two kilometres north-east of Örsundsbro, along the old royal road, the Eriksgata, in Lagunda hundred. The district is rich in Viking-Age and medieval monuments and runestones.",
    relatedSources: ['Magnus Erikssons landslag'],
  },
  {
    id: 'revelsta',
    name: 'Revelsta',
    region: 'Altuna, Enköping, Uppland',
    group: 'Ting & eriksgata',
    period: 'Medeltid–nyare tid (anor från 1300-talet)',
    coords: { lat: 59.81389, lng: 16.94306 },
    sv: 'Herrgård i Altuna socken i sydvästra Uppland med anor från 1300-talet, omtalad för överfallet på Revelsta 1439. Godset har gått i arv inom ätterna Bielke, Rålamb och von Engeström och var fideikommiss från 1791.',
    en: 'A manor in Altuna parish in south-western Uppland with roots in the 14th century, noted for the attack on Revelsta in 1439. The estate passed through the Bielke, Rålamb and von Engeström families and was an entailed estate (fideicommiss) from 1791.',
  },
  {
    id: 'flasta-skokloster',
    name: 'Flasta kyrkoruin (Skokloster)',
    region: 'Skokloster, Håbo, Uppland',
    group: 'Ting & eriksgata',
    period: 'Medeltid (1100-tal)',
    coords: { lat: 59.70861, lng: 17.608361 },
    sv: 'Flasta kyrkoruin är gråstensmurarna av en romansk kyrka från 1100-talets första hälft, nära Skoklosters slott. Från 1230-talet användes den som klosterkyrka för cisterciensernunnor tills den brann några år efter 1288 — det klostret gav Skokloster ("Sko kloster") sitt namn.',
    en: 'Flasta church ruin comprises the greystone walls of a Romanesque church from the first half of the 12th century, near Skokloster Castle. From the 1230s it served as the convent church of Cistercian nuns until it burned a few years after 1288 — that convent gave Skokloster ("Sko monastery") its name.',
  },
];
