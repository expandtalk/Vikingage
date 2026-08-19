// Allmänna bilder (Daniels EGNA foton av äkta föremål — sigill, mynt) som ligger under
// /excursion-photos/allmana-bilder/ men inte hör till en enskild utflykt. Här kopplas de till
// SÖKORD så de dyker upp i söksvaret på rätt entitet: "Magnus Ladulås" → hans sigill, "Kalmar"
// → stadens sigill osv. Egen licens → ingen licensbadge. Bildtext = sakligt vad föremålet är.
// (Illustrationer som vikingakrigare/ung-kvinna hör inte hit — de saknar entydig entitet.)
export interface GeneralImage {
  file: string;
  caption_sv: string;
  caption_en: string;
  /** Sökord (gemener) som ska ge bilden. Matchar exakt fråga eller fråga som innehåller ordet. */
  match: string[];
}

export const GENERAL_IMAGE_DIR = '/excursion-photos/allmana-bilder';

export const GENERAL_IMAGES: GeneralImage[] = [
  { file: 'magnus-ladulas-sigill.jpeg', caption_sv: 'Magnus Ladulås sigill', caption_en: "Magnus Ladulås's seal",
    match: ['magnus ladulås', 'magnus ladulas', 'magnus birgersson'] },
  { file: 'albrecht-av-mecklenburg-sigill.jpeg', caption_sv: 'Albrekt av Mecklenburgs sigill', caption_en: 'Seal of Albert of Mecklenburg',
    match: ['albrekt av mecklenburg', 'albrecht av mecklenburg', 'albert of mecklenburg'] },
  { file: 'karl-knutson-bondes-sigill.jpeg', caption_sv: 'Karl Knutsson Bondes sigill', caption_en: 'Seal of Karl Knutsson (Bonde)',
    match: ['karl knutsson', 'karl knutsson bonde', 'karl knutson'] },
  { file: 'stockholms-forsta-sigill.jpeg', caption_sv: 'Stockholms första sigill', caption_en: "Stockholm's first seal",
    match: ['stockholm', 'stockholms sigill', 'stockholms första sigill'] },
  { file: 'kalmar-sigill-1255.jpg', caption_sv: 'Kalmars sigill (1255)', caption_en: 'Seal of Kalmar (1255)',
    match: ['kalmar'] },
  { file: 'knut-den-store-mynt.jpg', caption_sv: 'Knut den stores mynt', caption_en: "Cnut the Great's coinage",
    match: ['knut den store', 'cnut', 'canute'] },
  { file: 'sven-tveskagg-mynt.jpg', caption_sv: 'Sven Tveskäggs mynt', caption_en: "Sweyn Forkbeard's coinage",
    match: ['sven tveskägg', 'sven tveskagg', 'sweyn forkbeard'] },
];
