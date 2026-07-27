-- Hjortspringbåten (Hjortspring Mose, Als) → heritage_sites. Enda intakta förhistoriska sydda
-- plankbåten i Skandinavien. Danskt fynd → register_system='FoF'. Koordinat verifierad mot
-- Wikidata Q1621365 P625 (55.009102, 9.853985) — INTE påhittad. raa_type='offerplats'
-- (krigsbytesoffer). Ny forskning: Fauvelle et al. 2025, PLOS One (direktdatering + proveniens).
begin;
insert into public.heritage_sites (raa_type, name, landscape, municipality, lat, lng, period, description, source_uri, register_system)
select 'offerplats', 'Hjortspringbåten (Hjortspring Mose)', 'Als (Sønderjylland)', 'Sønderborg',
  55.009102, 9.853985, 'Förromersk järnålder (~350 f.Kr.)',
  'Enda intakta förhistoriska sydda plankbåten i Skandinavien — lindträplankor hopsydda med lindbast-tåg. Funnen i Hjortspring Mose på Als, utgrävd 1921–22 (~40 % bevarad). Vapen för ~80 krigare offrades tillsammans med båten efter en avvärjd sjöburen attack. Direktdatering av tåg från originalutgrävningen: 381–161 f.Kr. (C14, 2σ; troligen 300-talet f.Kr.). Ny forskning (Fauvelle et al. 2025, PLOS One): drevet innehåller tallbeck → båten byggd i ett barrskogsrikt område, trolig proveniens Blekinge/Bornholm/Gotland/norra Polen (ej det tallfria Jylland). Ett delvis bevarat fingeravtryck sitter i drevmassan. Skeppsformen knyter an till Madsebakkes ristningar på Bornholm och den maritima mode-of-production-modellen (Ling m.fl.).',
  'https://doi.org/10.1371/journal.pone.0336965', 'FoF'
where not exists (select 1 from public.heritage_sites where name = 'Hjortspringbåten (Hjortspring Mose)');
commit;
