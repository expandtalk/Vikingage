-- Ångermanland kyrkodatering: Wikipedia-QA (screening, EJ facit — flaggat "verifiera"/"ej bekräftad").
-- Avslöjade att 13 kyrkor hade bulk-default 1100; per-artikel-läsning gav 8×1100/7×1200/4×1300 m.m.
-- OBS: tidigaste-sekel-heuristiken kan överdatera (löst sekel-omnämnande) → BeBR Datering = slutstation.
begin;
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Anundsjö kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1300, dating_class='1300-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Arnäs kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Boteå kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Dals kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Edsele kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1350, dating_class='Medeltida ursprung/byggnadsfas', dating_source=' [ej bekräftad i Wikipedia]' where name='Eds kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1759, dating_class='Eftermedeltida, före 1800', dating_source=' [ej bekräftad i Wikipedia]' where name='Graninge kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1300, dating_class='1300-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Grundsunda kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Gudmundrå kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Häggdångers kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1786, dating_class='Eftermedeltida, före 1800', dating_source=' [ej bekräftad i Wikipedia]' where name='Helgums kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1300, dating_class='1300-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Högsjö gamla kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1779, dating_class='Eftermedeltida, före 1800', dating_source=' [ej bekräftad i Wikipedia]' where name='Högsjö kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1480, dating_class='Medeltida ursprung/byggnadsfas', dating_source=' [ej bekräftad i Wikipedia]' where name='Nordmalings kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Överlännäs kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Ramsele gamla kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1100, dating_class='Medeltida ursprung/byggnadsfas', dating_source=' [ej bekräftad i Wikipedia]' where name='Säbrå kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1100, dating_class='Medeltida ursprung/byggnadsfas', dating_source=' [ej bekräftad i Wikipedia]' where name='Sånga kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1300, dating_class='1300-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Sidensjö kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1100, dating_class='Medeltida ursprung/byggnadsfas', dating_source=' [ej bekräftad i Wikipedia]' where name='Skogs kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Sollefteå kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1560, dating_class='Eftermedeltida, före 1800', dating_source=' [ej bekräftad i Wikipedia]' where name='Stigsjö kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1100, dating_class='Medeltida ursprung/byggnadsfas', dating_source=' [ej bekräftad i Wikipedia]' where name='Torsåkers kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1400, dating_class='1400-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Ullångers kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Vibyggerå gamla kyrka' and landscape='Ångermanland';
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (QA, jfr BeBR — verifiera)' where name='Ytterlännäs gamla kyrka' and landscape='Ångermanland';
commit;

-- SPRÅKLAGER (Daniel): ortnamnsbasen är DAGENS ortnamnsregister = MODERN SVENSKA som referensspråk,
-- inte namnens samtida språk (urnordiska/fornsvenska/protogermanska ...). Gör basen explicit + låt
-- belagda former bära sitt språklager, så analys kan göras mot rätt skikt i stället för moderna formen.
alter table public.place_name_forms
  add column if not exists language_layer text default 'modern_svenska';
comment on column public.place_name_forms.language_layer is
  'Språkskikt för formen: modern_svenska | fornsvenska | fornöstnordiska | urnordiska | protogermanska | indoeuropeiskt | annat. Default modern_svenska = dagens register (analysbasen).';
-- ANALYSBAS-VARNING (dokumentation): ortnamns-sambanden i denna plattform mäts mot DAGENS
-- ortnamnsregister = modern svenska, INTE namnens samtida språk. Moderna former kan dölja eller
-- felantyda led. Rätt analys sker mot place_name_forms.attested_form i rätt language_layer.
