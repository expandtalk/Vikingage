-- Mossberga borg (Högsrums sn, västra Öland) berikad. Även kallad Vipetorps borg (Stenberger,
-- "Ölands forntida borgar"; STF:s årsskrift 1921). Alt-namnet i beskrivningen → sökbart.
-- Koordinat fanns redan (16.60013/56.78218). Källor: Daniel + Stenberger + STF 1921 + Länsstyrelsen.
begin;
update public.swedish_hillforts set
  fortress_type = 'ring_fortress',
  period = 'folkvandringstid (~400–500-tal e.Kr.)',
  description = 'Oval ringborg på västra Öland nära Ekerum (Högsrums sn), även kallad Vipetorps borg (Stenberger, "Ölands forntida borgar"). Oregelbunden ringmur med största inre diameter ~150 m, två portar mitt emot varandra i ungefär väster och öster, husgrunder vinkelrätt mot murens insida — samma princip som Ismantorp och Eketorp. Bland fynden ett romerskt guldmynt, spjutspetsar och folkvandringstida spännen (STF:s årsskrift 1921). Oskyltad och kamouflerad av växtlighet. Ingår i naturreservatet Mossberga-Vipetorp (Länsstyrelsen Kalmar; fastigheterna Mossberga 1:1 och Vipetorp 1:1, 2:2, 2:3).',
  source_reference = 'Stenberger, Ölands forntida borgar; STF:s årsskrift 1921; Länsstyrelsen Kalmar (naturreservat Mossberga-Vipetorp)',
  updated_at = now()
where name = 'Mossberga borg';
commit;
