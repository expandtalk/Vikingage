// Tvåspråkiga typetiketter för "relaterat i närheten"-listorna (kultplatser + fynd).
// Delas av utflykternas detaljsida (ExcursionDetail). Bröts ut ur Excursions.tsx
// när närhetslistorna flyttade från listkorten till detaljsidan (2026-07-20).

export const PLACE_TYPE_LABEL: Record<string, { sv: string; en: string }> = {
  temple: { sv: 'tempel', en: 'temple' },
  sacred_grove: { sv: 'offerlund', en: 'sacred grove' },
  offering_spring: { sv: 'offerkälla', en: 'offering spring' },
  royal_center: { sv: 'kungsgård', en: 'royal centre' },
  cult_site: { sv: 'kultplats', en: 'cult site' },
  rock_carving: { sv: 'hällristning', en: 'rock carving' },
  archbishop_seat: { sv: 'ärkebiskopssäte', en: 'archbishop seat' },
  bishop_seat: { sv: 'biskopssäte', en: 'bishop seat' },
  monastery: { sv: 'kloster', en: 'monastery' },
  mission_site: { sv: 'missionsplats', en: 'mission site' },
  franciscan: { sv: 'franciskankloster', en: 'Franciscan' },
  dominican: { sv: 'dominikankloster', en: 'Dominican' },
  cistercian: { sv: 'cistercienskloster', en: 'Cistercian' },
  birgittine: { sv: 'birgittinkloster', en: 'Birgittine' },
  carmelite: { sv: 'karmelitkloster', en: 'Carmelite' },
  augustinian: { sv: 'augustinkloster', en: 'Augustinian' },
};

export const FIND_TYPE_LABEL: Record<string, { sv: string; en: string }> = {
  settlement: { sv: 'boplats', en: 'settlement' },
  burial: { sv: 'grav', en: 'burial' },
  artifacts: { sv: 'föremål', en: 'artefacts' },
  human_remains: { sv: 'skelett', en: 'human remains' },
  weapons: { sv: 'vapen', en: 'weapons' },
  boats: { sv: 'båt', en: 'boat' },
  cave: { sv: 'grotta', en: 'cave' },
  workshop: { sv: 'verkstad', en: 'workshop' },
  trade: { sv: 'handel', en: 'trade' },
  ritual: { sv: 'ritual', en: 'ritual' },
  city: { sv: 'stad', en: 'city' },
  boat_graves: { sv: 'båtgravar', en: 'boat graves' },
  royal_burial: { sv: 'kungagrav', en: 'royal burial' },
  metalwork: { sv: 'metallarbete', en: 'metalwork' },
  trading_post: { sv: 'handelsplats', en: 'trading post' },
  trading_city: { sv: 'handelsstad', en: 'trading city' },
  raid: { sv: 'räd', en: 'raid' },
};
