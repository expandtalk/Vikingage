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
}

// Ordning som grupperna visas i på sidan.
export const EXCURSION_GROUPS = [
  'Uppland & Mälardalen',
  'Södermanland',
  'Östergötland',
  'Västergötland',
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
    id: 'birka',
    name: 'Birka',
    region: 'Björkö, Mälaren (Ekerö)',
    group: 'Uppland & Mälardalen',
    period: 'ca 750–970 e.Kr.',
    coords: { lat: 59.336, lng: 17.542 },
    sv: 'Vikingatidens främsta handelsstad, på ön Björkö i Mälaren. Här landsteg Ansgar på sin mission 829/830. Gravfält med tusentals högar, en befäst stadsvall och hamnlämningar. Världsarv tillsammans med Hovgården.',
    en: "The foremost Viking-Age trading town, on the island of Björkö in Lake Mälaren. Ansgar landed here on his mission in 829/830. Grave fields with thousands of mounds, a fortified town rampart and harbour remains. A World Heritage Site together with Hovgården.",
  },
  {
    id: 'langhundraleden',
    name: 'Långhundraleden',
    region: 'Uppland (Trälhavet–Uppsala)',
    group: 'Uppland & Mälardalen',
    period: 'Järnålder–vikingatid',
    coords: { lat: 59.55, lng: 18.05 },
    sv: 'En forntida vattenled från Trälhavet vid Östersjön genom sjöar och åar upp mot Uppsala. En pulsåder för transport och handel under järnålder och vikingatid, kantad av gravfält och runstenar. Landhöjningen har sedan dess torrlagt delar av leden.',
    en: 'An ancient waterway from Trälhavet on the Baltic through lakes and streams up towards Uppsala. A transport and trade artery during the Iron Age and Viking Age, lined with grave fields and runestones. Land uplift has since dried out parts of the route.',
  },
  {
    id: 'broborg',
    name: 'Broborg',
    region: 'Vassunda, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Vendeltid–vikingatid',
    coords: { lat: 59.72, lng: 17.87 },
    sv: 'En fornborg i Uppland med delvis förglasade (vitrifierade) vallar — stenmurar som utsatts för så hög värme att de smält samman. Ett fenomen som fortfarande diskuteras: rituell bränning eller försvarsverk?',
    en: 'A hillfort in Uppland with partly vitrified ramparts — stone walls exposed to heat so intense they fused together. A phenomenon still debated: ritual burning or defensive work?',
  },
  {
    id: 'valsgarde',
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
    name: 'Sigtuna',
    region: 'Sigtuna, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Vikingatid–medeltid (ca 980–)',
    coords: { lat: 59.6169, lng: 17.7239 },
    sv: 'Sveriges äldsta ännu levande stad, grundad omkring 980 av kungamakten som efterföljare till Birka. Tidiga kyrkor, myntning under Olof Skötkonung, och ett rikt runmaterial — bland annat koppardosan (Sigtunadosan) med en dróttkvätt-strof.',
    en: "Sweden's oldest still-living town, founded around 980 by the royal power as a successor to Birka. Early churches, coinage under Olof Skötkonung, and a rich runic corpus — including the copper box (the Sigtuna box) with a dróttkvætt stanza.",
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
    name: 'Jordbro gravfält',
    region: 'Jordbro, Haninge, Södermanland',
    group: 'Södermanland',
    period: 'Järnålder (ca 500 f.Kr.–1000 e.Kr.)',
    coords: { lat: 59.152, lng: 18.122 },
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
    name: 'Gåseborg',
    region: 'Görväln, Järfälla, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Folkvandringstid (ca 400–500 e.Kr.)',
    coords: { lat: 59.418, lng: 17.836 },
    sv: 'En folkvandringstida fornborg på ett brant, ~45 m högt berg vid Mälaren i Järfälla. Kraftiga stenmurar kröner höjden med milsvid utsikt över Görvälnfjärden — en tillflykts- och maktplats under orostiderna efter Västroms fall.',
    en: 'A Migration-Period hillfort on a steep hill some 45 m above Lake Mälaren in Järfälla. Massive stone ramparts crown the height with a wide view over the Görväln bay — a refuge and power site in the troubled times after the fall of the Western Roman Empire.',
  },
  {
    id: 'oland_hillforts',
    name: 'Ölands fornborgar',
    region: 'Öland',
    group: 'Öland',
    period: 'Järnålder–folkvandringstid',
    coords: { lat: 56.62, lng: 16.54 },
    sv: 'Öland har en unik täthet av fornborgar. Ismantorp med sina nio portar och gåtfulla husgrunder, det väldiga Gråborg, och Eketorp som grävts ut och rekonstruerats. Tillflykt, kult och maktcentra under orostider.',
    en: "Öland has a unique density of hillforts. Ismantorp with its nine gates and enigmatic house foundations, the vast Gråborg, and Eketorp which has been excavated and reconstructed. Refuge, cult and centres of power in troubled times.",
  },
  {
    id: 'rosaring',
    name: 'Rösaringsåsen',
    region: 'Låssa, Upplands-Bro',
    group: 'Uppland & Mälardalen',
    period: 'Vendeltid–vikingatid',
    coords: { lat: 59.51, lng: 17.63 },
    sv: 'På en rullstensås reser sig ett gravfält, en labyrint och en ca 540 m lång, rak processionsväg kantad av stolphål. Vägen leder till en gravhög och tolkas som en ceremoniell "väg till dödsriket" — en av Nordens mest gåtfulla kultplatser.',
    en: 'On an esker rise a grave field, a labyrinth and an approx. 540 m long, straight processional road lined with post-holes. The road leads to a burial mound and is interpreted as a ceremonial "road to the realm of the dead" — one of the Nordic region\'s most enigmatic cult sites.',
  },
  {
    id: 'ingvarstaget',
    name: 'Ingvarståget (Gripsholmsstenen)',
    region: 'Mariefred, Södermanland',
    group: 'Södermanland',
    period: 'ca 1040 e.Kr.',
    coords: { lat: 59.2531, lng: 17.2140 },
    sv: 'Omkring 1041 ledde Ingvar den vittfarne en storslagen vikingafärd österut mot Serkland (Kaspiska havet) — som slutade i katastrof; nästan ingen kom hem. Ett tjugotal "Ingvarsstenar" i Mälardalen minner om de stupade. Mest berömd är Gripsholmsstenen (Sö 179) vid Gripsholms slott, rest av Tola efter sonen Harald, Ingvars bror: "De for manligen, fjärran efter guld, och österut gav de örnen föda. De dog söderut i Serkland."',
    en: 'Around 1041 Ingvar the Far-Travelled led a grand Viking expedition eastward toward Serkland (the Caspian Sea) — which ended in catastrophe; almost no one returned. Some two dozen "Ingvar runestones" across the Mälaren region commemorate the fallen. The most famous is the Gripsholm stone (Sö 179) at Gripsholm Castle, raised by Tóla after her son Haraldr, Ingvar\'s brother: "They fared like men far after gold, and in the east fed the eagle. They died in the south in Serkland."',
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
    name: 'Sigurdsristningen (Ramsundsberget)',
    region: 'Sundbyholm, Södermanland',
    group: 'Södermanland',
    period: 'ca 1030 e.Kr.',
    coords: { lat: 59.3772, lng: 16.6156 },
    sv: 'En runristning (Sö 101) på en flat berghäll som avbildar sagan om Sigurd Fafnesbane — draksläparen. Sigurd sticker svärdet genom draken Fafner, steker dess hjärta och förstår fåglarnas tal. Nordisk hjältemytologi i sten, rest av Sigrid till minne av sin man.',
    en: 'A rune carving (Sö 101) on a flat rock face depicting the legend of Sigurd Fáfnisbani — the dragon slayer. Sigurd thrusts his sword through the dragon Fáfnir, roasts its heart and understands the speech of birds. Norse heroic mythology in stone, raised by Sigríðr in memory of her husband.',
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
  },
  {
    id: 'haga',
    name: 'Hågahögen',
    region: 'Håga, väster om Uppsala, Uppland',
    group: 'Uppland & Mälardalen',
    period: 'Bronsålder (ca 1000 f.Kr.)',
    coords: { lat: 59.8497, lng: 17.5878 },
    sv: 'Skandinaviens betydelsefullaste bronsåldersplats, ca 3 km väster om Uppsala. Den mäktiga gravhögen (även "Kung Björns hög") reser sig över gravfält, kulthägnader och boplatser. Vid utgrävningen 1902–03 (Oscar Almgren) hittades mer än en tredjedel av allt guld från Sveriges bronsålder — bland annat det berömda dubbelspännet i guld. Graven bär spår av djur- och människooffer och till och med rituell kannibalism, och tolkas som en föregångare till Gamla Uppsala. Låg då strategiskt vid den stora farleden genom Mälaren norrut, bevakad av fornborgen Predikstolen strax söderut.',
    en: 'Scandinavia\'s most significant Bronze Age site, about 3 km west of Uppsala. The mighty burial mound (also "King Björn\'s mound") rises above grave fields, cult enclosures and settlements. The 1902–03 excavation (Oscar Almgren) yielded more than a third of all the gold from Sweden\'s Bronze Age — including the famous gold double-button. The grave bears traces of animal and human sacrifice and even ritual cannibalism, and is interpreted as a forerunner of Gamla Uppsala. It once lay strategically on the great sailing route north through Lake Mälaren, guarded by the Predikstolen hillfort just to the south.',
  },

  // === Öland ===
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
];
