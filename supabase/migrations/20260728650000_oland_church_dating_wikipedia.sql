-- Öland-kyrkor: medeltidsdatering ur Wikipedia sv (speglar BeBR/Sveriges kyrkor), individuellt hämtad.
-- Tidigaste medeltidssekel i artikeln = ursprungsdatering (Öland-kyrkor är 1100-1200-tals stenkyrkor).
-- dating_source-flaggat "verifiera" — Daniel/forskaren bekräftar. Inget påhittat.
begin;
update public.ecclesiastical_sites set built_from=1000, dating_class='1000-tal', dating_source='Wikipedia sv (jfr BeBR/Sveriges kyrkor)' where name='Alböke kyrka' and round(lat::numeric,4)=56.9478 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR/Sveriges kyrkor — verifiera)' where name='Algutsrums kyrka' and round(lat::numeric,4)=56.6788 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Böda kyrka' and round(lat::numeric,4)=57.2445 and dating_source is null;
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Bredsättra kyrka' and round(lat::numeric,4)=56.8447 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Föra kyrka' and round(lat::numeric,4)=57.0125 and dating_source is null;
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Gårdby kyrka' and round(lat::numeric,4)=56.6008 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Glömminge kyrka' and round(lat::numeric,4)=56.7189 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Gräsgårds kyrka' and round(lat::numeric,4)=56.3094 and dating_source is null;
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Högsrums kyrka' and round(lat::numeric,4)=56.7661 and dating_source is null;
update public.ecclesiastical_sites set built_from=1300, dating_class='1300-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Källa nya kyrka' and round(lat::numeric,4)=57.1214 and dating_source is null;
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Kastlösa kyrka' and round(lat::numeric,4)=56.4586 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Köpings kyrka' and round(lat::numeric,4)=56.8782 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Norra Möckleby kyrka' and round(lat::numeric,4)=56.6475 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Persnäs kyrka' and round(lat::numeric,4)=57.0672 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR/Sveriges kyrkor — verifiera)' where name='Runstens kyrka' and round(lat::numeric,4)=56.6992 and dating_source is null;
update public.ecclesiastical_sites set built_from=1200, dating_class='1200-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Sandby kyrka' and round(lat::numeric,4)=56.5807 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Sankt Olofs kapell' and round(lat::numeric,4)=57.3222 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Södra Möckleby kyrka' and round(lat::numeric,4)=56.3565 and dating_source is null;
update public.ecclesiastical_sites set built_from=1100, dating_class='1100-tal', dating_source='Wikipedia sv (auto, jfr BeBR — verifiera)' where name='Stenåsa kyrka' and round(lat::numeric,4)=56.5144 and dating_source is null;
commit;
