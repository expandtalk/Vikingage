// Utflyktsmål från vikingatiden och äldre. Delad datakälla så att både
// Excursions-sidan och welcome-kortet (HeroStatsGrid) räknar samma lista.

export interface Excursion {
  id: string;
  name: string;
  region: string;
  period: string;
  coords: { lat: number; lng: number };
  sv: string;
  en: string;
}

export const EXCURSIONS: Excursion[] = [
  {
    id: 'birka',
    name: 'Birka',
    region: 'Björkö, Mälaren (Ekerö)',
    period: 'ca 750–970 e.Kr.',
    coords: { lat: 59.336, lng: 17.542 },
    sv: 'Vikingatidens främsta handelsstad, på ön Björkö i Mälaren. Här landsteg Ansgar på sin mission 829/830. Gravfält med tusentals högar, en befäst stadsvall och hamnlämningar. Världsarv tillsammans med Hovgården.',
    en: "The foremost Viking-Age trading town, on the island of Björkö in Lake Mälaren. Ansgar landed here on his mission in 829/830. Grave fields with thousands of mounds, a fortified town rampart and harbour remains. A World Heritage Site together with Hovgården.",
  },
  {
    id: 'langhundraleden',
    name: 'Långhundraleden',
    region: 'Uppland (Trälhavet–Uppsala)',
    period: 'Järnålder–vikingatid',
    coords: { lat: 59.55, lng: 18.05 },
    sv: 'En forntida vattenled från Trälhavet vid Östersjön genom sjöar och åar upp mot Uppsala. En pulsåder för transport och handel under järnålder och vikingatid, kantad av gravfält och runstenar. Landhöjningen har sedan dess torrlagt delar av leden.',
    en: 'An ancient waterway from Trälhavet on the Baltic through lakes and streams up towards Uppsala. A transport and trade artery during the Iron Age and Viking Age, lined with grave fields and runestones. Land uplift has since dried out parts of the route.',
  },
  {
    id: 'broborg',
    name: 'Broborg',
    region: 'Vassunda, Uppland',
    period: 'Vendeltid–vikingatid',
    coords: { lat: 59.72, lng: 17.87 },
    sv: 'En fornborg i Uppland med delvis förglasade (vitrifierade) vallar — stenmurar som utsatts för så hög värme att de smält samman. Ett fenomen som fortfarande diskuteras: rituell bränning eller försvarsverk?',
    en: 'A hillfort in Uppland with partly vitrified ramparts — stone walls exposed to heat so intense they fused together. A phenomenon still debated: ritual burning or defensive work?',
  },
  {
    id: 'oland_hillforts',
    name: 'Ölands fornborgar',
    region: 'Öland',
    period: 'Järnålder–folkvandringstid',
    coords: { lat: 56.62, lng: 16.54 },
    sv: 'Öland har en unik täthet av fornborgar. Ismantorp med sina nio portar och gåtfulla husgrunder, det väldiga Gråborg, och Eketorp som grävts ut och rekonstruerats. Tillflykt, kult och maktcentra under orostider.',
    en: "Öland has a unique density of hillforts. Ismantorp with its nine gates and enigmatic house foundations, the vast Gråborg, and Eketorp which has been excavated and reconstructed. Refuge, cult and centres of power in troubled times.",
  },
  {
    id: 'rosaring',
    name: 'Rösaringsåsen',
    region: 'Låssa, Upplands-Bro',
    period: 'Vendeltid–vikingatid',
    coords: { lat: 59.51, lng: 17.63 },
    sv: 'På en rullstensås reser sig ett gravfält, en labyrint och en ca 540 m lång, rak processionsväg kantad av stolphål. Vägen leder till en gravhög och tolkas som en ceremoniell "väg till dödsriket" — en av Nordens mest gåtfulla kultplatser.',
    en: 'On an esker rise a grave field, a labyrinth and an approx. 540 m long, straight processional road lined with post-holes. The road leads to a burial mound and is interpreted as a ceremonial "road to the realm of the dead" — one of the Nordic region\'s most enigmatic cult sites.',
  },
  {
    id: 'ingvarstaget',
    name: 'Ingvarståget (Gripsholmsstenen)',
    region: 'Mariefred, Södermanland',
    period: 'ca 1040 e.Kr.',
    coords: { lat: 59.2531, lng: 17.2140 },
    sv: 'Omkring 1041 ledde Ingvar den vittfarne en storslagen vikingafärd österut mot Serkland (Kaspiska havet) — som slutade i katastrof; nästan ingen kom hem. Ett tjugotal "Ingvarsstenar" i Mälardalen minner om de stupade. Mest berömd är Gripsholmsstenen (Sö 179) vid Gripsholms slott, rest av Tola efter sonen Harald, Ingvars bror: "De for manligen, fjärran efter guld, och österut gav de örnen föda. De dog söderut i Serkland."',
    en: 'Around 1041 Ingvar the Far-Travelled led a grand Viking expedition eastward toward Serkland (the Caspian Sea) — which ended in catastrophe; almost no one returned. Some two dozen "Ingvar runestones" across the Mälaren region commemorate the fallen. The most famous is the Gripsholm stone (Sö 179) at Gripsholm Castle, raised by Tóla after her son Haraldr, Ingvar\'s brother: "They fared like men far after gold, and in the east fed the eagle. They died in the south in Serkland."',
  },
  {
    id: 'tanum',
    name: 'Tanums hällristningar',
    region: 'Tanum, Bohuslän',
    period: 'Bronsålder (ca 1700–500 f.Kr.)',
    coords: { lat: 58.7020, lng: 11.3370 },
    sv: 'Ett av världens rikaste hällristningsområden, på Unescos världsarvslista. Vid Vitlyckehällen och Aspeberget täcker tusentals figurer berghällarna — skepp, plöjande oxar, vapenbärande krigare och det berömda "brudparet". Bronsålderns bildvärld inhuggen i granit.',
    en: 'One of the world\'s richest rock-carving areas, on the UNESCO World Heritage list. At the Vitlycke rock and Aspeberget thousands of figures cover the bedrock — ships, ploughing oxen, weapon-bearing warriors and the famous "bridal couple". The Bronze Age imagery carved into granite.',
  },
  {
    id: 'sigurdsristningen',
    name: 'Sigurdsristningen (Ramsundsberget)',
    region: 'Sundbyholm, Södermanland',
    period: 'ca 1030 e.Kr.',
    coords: { lat: 59.3772, lng: 16.6156 },
    sv: 'En runristning (Sö 101) på en flat berghäll som avbildar sagan om Sigurd Fafnesbane — draksläparen. Sigurd sticker svärdet genom draken Fafner, steker dess hjärta och förstår fåglarnas tal. Nordisk hjältemytologi i sten, rest av Sigrid till minne av sin man.',
    en: 'A rune carving (Sö 101) on a flat rock face depicting the legend of Sigurd Fáfnisbani — the dragon slayer. Sigurd thrusts his sword through the dragon Fáfnir, roasts its heart and understands the speech of birds. Norse heroic mythology in stone, raised by Sigríðr in memory of her husband.',
  },
  {
    id: 'himmelstalund',
    name: 'Himmelstalunds hällristningar',
    region: 'Norrköping, Östergötland',
    period: 'Bronsålder (ca 1700–500 f.Kr.)',
    coords: { lat: 58.5958, lng: 16.1553 },
    sv: 'Ett av Östergötlands största hällristningsområden, mitt i Norrköping vid Motala ström. Tusentals figurer — skepp, djur, fotsulor och människor — inhuggna i de slipade berghällarna. Fri entré i en stadspark; ristningarna målas ibland i rött för att synas.',
    en: 'One of Östergötland\'s largest rock-carving areas, in central Norrköping by the Motala ström river. Thousands of figures — ships, animals, footprints and human figures — carved into the smoothed bedrock. Free access in a city park; the carvings are sometimes painted red for visibility.',
  },
  {
    id: 'rokstenen',
    name: 'Rökstenen',
    region: 'Rök, Ödeshög, Östergötland',
    period: 'ca 800 e.Kr.',
    coords: { lat: 58.2958, lng: 14.7752 },
    sv: 'Världens mest kända runsten, rest vid Röks kyrka omkring år 800. Med drygt 700 runor bär den den längsta kända runinskriften — en gåtfull text som Varin ristade till minne av sin son Vämod, full av anspelningar på hjältesägner och kanske Teoderik den store.',
    en: 'The world\'s most famous runestone, raised by Rök church around the year 800. With over 700 runes it bears the longest known runic inscription — an enigmatic text that Varinn carved in memory of his son Vámóðr, full of allusions to heroic legends and perhaps Theoderic the Great.',
  },
  {
    id: 'haga',
    name: 'Hågahögen',
    region: 'Håga, väster om Uppsala, Uppland',
    period: 'Bronsålder (ca 1000 f.Kr.)',
    coords: { lat: 59.8497, lng: 17.5878 },
    sv: 'Skandinaviens betydelsefullaste bronsåldersplats, ca 3 km väster om Uppsala. Den mäktiga gravhögen (även "Kung Björns hög") reser sig över gravfält, kulthägnader och boplatser. Vid utgrävningen 1902–03 (Oscar Almgren) hittades mer än en tredjedel av allt guld från Sveriges bronsålder — bland annat det berömda dubbelspännet i guld. Graven bär spår av djur- och människooffer och till och med rituell kannibalism, och tolkas som en föregångare till Gamla Uppsala. Låg då strategiskt vid den stora farleden genom Mälaren norrut, bevakad av fornborgen Predikstolen strax söderut.',
    en: 'Scandinavia\'s most significant Bronze Age site, about 3 km west of Uppsala. The mighty burial mound (also "King Björn\'s mound") rises above grave fields, cult enclosures and settlements. The 1902–03 excavation (Oscar Almgren) yielded more than a third of all the gold from Sweden\'s Bronze Age — including the famous gold double-button. The grave bears traces of animal and human sacrifice and even ritual cannibalism, and is interpreted as a forerunner of Gamla Uppsala. It once lay strategically on the great sailing route north through Lake Mälaren, guarded by the Predikstolen hillfort just to the south.',
  },
];
