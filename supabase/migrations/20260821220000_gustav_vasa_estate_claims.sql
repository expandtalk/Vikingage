-- Gustav Vasa (Gustav I, Q52947, 1496–1560) — godsproveniens, samma modell som Bjälboätten/Birger jarl.
-- Källkritisk rekonstruktion av historiker-agent (Claude), EJ människoverifierad. Fyra sakfel i underlaget
-- korrigerade mot källa. person_id = NULL (rätt kung saknas i persons; namnen där = 1568-namne Q2595418).
-- Nytt fält provenance_class (A–F) för Vasa-klasserna. relation_type saknar 'confiscation' → Gripsholm=estate.

alter table public.person_place_claims add column if not exists provenance_class text;
comment on column public.person_place_claims.provenance_class is
  'Vasa-proveniensklass A–F: A fädernearv, B mödernearv, C äldre ättegods, D Sture/Banér-arv, E förvärv, F kyrko-/kronoreduktion';

-- idempotent
delete from public.person_place_claims where person_name = 'Gustav I';

insert into public.person_place_claims
  (person_id, person_name, place_label, lat, lng, coord_status, coord_source, period_from, period_to,
   relation_type, provenance_class, evidence_grade, layer, provenance_level, event, inheritance_chain,
   primary_source, secondary_source, uncertain, notes, analysis_source)
values
  -- 1. LÖVSTA — hävdat fädernearv, men vilar på EN oläst sekundärkälla → hypotes, grade C, koord saknas
  (null, 'Gustav I', 'Lövsta, Håbo-Tibble', null, null, 'none', null, 1513, 1531,
   'inheritance', 'A', 'C', 1, 1,
   'Hävdat enda säkra fädernearvet (Söderberg) — men ej belagt i läst text',
   'Erik Johansson Vasa → donation Sko kloster ~1513 → återtaget vid reduktionen → Gustav I "arv och eget" 1531',
   'Gustav Vasas jordebok 1531 (RA) — EJ verifierad', 'Ulf Söderberg, Gustav I:s arv och eget i Uppland (1977) — verket verifierat, satsen EJ belagd i texten',
   true,
   'HYPOTES. Att godset först donerades bort (1513) och sedan återtogs gör det svårt att skilja fädernearv (A) från reducerat kyrkogods (F) i 1531 års liggare — själva tvetydigheten är forskningsproblemet. Kräver Söderberg 1977 + DMS Bd 1 Uppland:10 gård-för-gård.',
   'Historiker-agent (Claude) — källkritisk, EJ människoverifierad'),

  -- 2. RYDBOHOLM — Sture-ursprung, ärvdes av systern Margareta → Brahe. EJ Gustavs "arv och eget". Layer 2.
  (null, 'Gustav I', 'Rydboholm', 59.4403, 18.1856, 'verified', 'Wikidata P625 (Q366683)', 1400, 1520,
   'estate', 'C', 'A', 2, 2,
   'Vasa-släktgods med Sture-ursprung — överfördes EJ till Gustav',
   'Gustav Anundsson (Sture) / äldre Stureätten → Birgitta Gustavsdotter (Sture) g.m. Johan Kristiernsson Vasa (†1477 på Rydboholm) → Erik Johansson Vasa (†1520) → dottern Margareta Eriksdotter Vasa → Brahe (g.m. Joakim Brahe 1516)',
   'Arvskiftet efter Erik Johansson (RA) — ej verifierat i detalj', 'sv.wikipedia/Rydboholms slott; popularhistoria.se',
   false,
   'BELAGT. Bekräftar att Rydboholm ärvdes av systern Margareta, INTE Gustav (faderns godsmassa ≠ Gustavs). KORR mot underlaget: godset gick till BRAHE (ej Banér), och var i ursprunget Sture-gods som kom in i Vasa via farmodern Birgitta Gustavsdotter — ej renodlat Vasa-fädernearv.',
   'Historiker-agent (Claude) — källkritisk, EJ människoverifierad'),

  -- 3. GRIPSHOLM — klass F (kloster-/kyrkoreduktion), Gustavsk politisk nod men EJ Vasa-arv
  (null, 'Gustav I', 'Gripsholm', 59.2561, 17.2192, 'verified', 'Wikidata P625 (Q714783)', 1380, 1537,
   'estate', 'F', 'A', 1, 2,
   'Indraget kartusiankloster 1526 → kungligt slott; motexempel mot "allt är arv"',
   'Bo Jonsson Grip (borg ~1380) → Sten Sture d.ä. (BYTE 1472) → kartusianorden (donation 1493, bekräftad 1498, Pax Mariae) → indraget av Gustav I 1526 (första indragna klostret) → nytt slott 1537',
   'Donationsbrevet 1498 + reduktionsakter (RA)', 'sv.wikipedia/Gripsholms slott; Mariefreds kloster',
   false,
   'BELAGT. Klass F/E, EJ arv. KORR mot underlaget: donationen skedde 1493 (bekräftad 1498, ej "1498" som donationsår); Sten Sture fick Gripsholm genom BYTE 1472, ärvde det inte. Pax Mariae-klostret 59.2586/17.2242 (Q1734530). relation_type=estate (schemat saknar "confiscation").',
   'Historiker-agent (Claude) — källkritisk, EJ människoverifierad'),

  -- 4. LÖDÖSEDOMEN 1528 — starkaste belagda Sture→Vasa-spåret (klass D). Sten Sture d.ä:s KÖPEGODS, ej fädernearv.
  (null, 'Gustav I', 'Lödöse (domplats 1528)', 58.0279, 12.1600, 'verified', 'Wikidata P625 (Q1639127)', 1528, 1528,
   'inheritance', 'D', 'A', 1, 2,
   'Riksrådsdom 1528: 2/3 av Sten Sture d.ä:s köpegods till Gustav I',
   'Sten Sture d.ä. (Sten Gustavsson, †1503, barnlös; g.m. Ingeborg Åkesdotter Tott) → riksrådsdom 1528 → 2/3 av köpegodset + lösöre + fordringar till Gustav I (frände via farmodern Birgitta Gustavsdotter Sture); resten till Tott-arvingarna',
   'Riksrådsdomen 1528 (RA) — venue "Lödöse" att verifiera i domtext', 'SBL "Sten Sture (d.ä.)"',
   false,
   'BELAGT (venue "Lödöse" med reservation). Domen fördelar KÖPEGODS (Sten d.ä. ~400 gårdar; jordebok 1502/1515), inte fädernearv — även Gustavs "Sture-arv" är i grunden Sture-köpegods. Förväxla EJ med Sten Sture d.y:s gods (gick via änkan Kristina Gyllenstierna). OBELAGT och UTELÄMNAT: traditionen att "dödsbudet kom sent till Stockholm".',
   'Historiker-agent (Claude) — källkritisk, EJ människoverifierad');
