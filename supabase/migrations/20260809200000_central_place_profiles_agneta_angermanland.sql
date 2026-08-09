-- Agneta Nyholms 3 ångermanländska centralplats-KANDIDATER in i fingerprint-jämförelsen
-- (central_place_profiles). Onomastiskt definierade (kult-/maktnamnkluster: hov/sal/ross/hammar/
-- tor/fröja), ej emporier. Södra måtten (solidi/svartjord/silverskatter/mynt) = NULL = annan
-- signatur, ej saknad data. geom är genererad → sätts ej. confidence='hypotes'.
insert into central_place_profiles
  (name, kind, region, country, has_mint, cult_evidence, significance, source, confidence, lat, lng)
values
('Härnösand–Säbrå', 'cult_central', 'Ångermanland', 'Sverige', false,
 'Onomastiskt kluster: Hov (Hovsberget), Stav (Stavkällan/Stavgården), Ed, Helgum, Ross (Hårsta/Horsta), -rå (Säbrå/Valnäs), Fröja-namn.',
 'Äldsta centralområdet i Ångermanland; Norrlands första biskopssäte. Identifierad via namnkluster, ej emporie-mått.',
 'Agneta Nyholm (ortnamnskluster, Ångermanland)', 'hypotes', 62.63226, 17.93823),
('Nora (Ångermanland)', 'cult_central', 'Ångermanland', 'Sverige', false,
 'Onomastiskt kluster kring Nora kyrka: Hov (Höven), Sal (Salom), Ross (Rossvik – silverskatt 355 mynt), Hammar, Tor, flera Fröja-namn.',
 'Sammanhängande rituellt landskap kring Nora kyrka. Rossvik-skatten (355 mynt) i området.',
 'Agneta Nyholm (ortnamnskluster, Ångermanland)', 'hypotes', 62.87227, 18.08104),
('Torsåker (Ångermanland)', 'cult_central', 'Ångermanland', 'Sverige', false,
 'Onomastiskt kluster: Sal (Salum, kvinnlig högstatusgrav), Hammar-koncentration vid kungsgård, Ross (Rogsta/Rossön), Tor, Fröja-namn.',
 'Kyrka på hovplats; makt-/kultkluster vid kungsgård.',
 'Agneta Nyholm (ortnamnskluster, Ångermanland)', 'hypotes', 63.07926, 17.74385);
