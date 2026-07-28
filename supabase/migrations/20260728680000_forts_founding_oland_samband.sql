-- #4 Ångermanlands fornborgar: berikade med Daniels sourceade data (Wikipedia/FMIS/Länsstyrelsen).
-- Rogstaklippen = enda C14-daterade (folkvandringstid) av Norrlands kustfornborgar; Borgberget bäst
-- bevarad; Rödklitten yngre järnålder. raa_number rörs ej (redan korrekt + unik constraint).
update public.swedish_hillforts set coordinates=point(17.71830,63.07803), parish='Torsåker', municipality='Kramfors', county='Västernorrland',
  period='folkvandringstid (äldsta murfas ca 400–550 e.Kr.)',
  dating_basis='C14: 4 kolprov 1998, två äldsta 400–550 e.Kr; övriga 1000–1100-tal + 1500-tal',
  dating_confidence='hög (arkeologiskt daterad)', dating_source='Björkman & Grundberg 1998; Grundberg 2005',
  description='140 m högt berg V om järnåldersbygden vid Ångermanälven; stup utom mot söder där krönet avgränsas av murar (längsta ~83 m). Provundersökning 1998 fann resvirke vid murarna. ENDA C14-daterade av Norrlands 16 kustfornborgar.',
  cultural_significance='Enda daterade fornborgen i Norrlands kustland'
 where name='Rogstaklippen' and landscape='Ångermanland';
update public.swedish_hillforts set coordinates=point(17.62237,63.01224), parish='Ytterlännäs', municipality='Kramfors', county='Västernorrland',
  period='odaterad (ingen utgrävning)', dating_basis='morfologi; ingen arkeologisk undersökning', dating_confidence='okänd',
  dating_source='Hemmendorff 1994; Berglund 1974',
  description='Även Stensättersborgen. 190 m ö.h., brant utom SO. Övre mur 135 m lång, upp till 4 m bred, 2,5 m hög, ingång i SV; undre mur 45 m; ev. tredje mur. Kallmur. Två husgrunder + uthuggen källa. HÖGSTA/bäst bevarade muren av de 17 norrländska fornborgarna.',
  cultural_significance='Bäst bevarade muren av Norrlands 17 fornborgar'
 where name='Borgberget' and landscape='Ångermanland';
update public.swedish_hillforts set coordinates=point(18.25178,62.90679), parish='Nordingrå', municipality='Kramfors', county='Västernorrland',
  period='yngre järnålder (400–1050 e.Kr.)', dating_basis='klassad fornborg; kallmurad stenvall (ej utgrävd)', dating_confidence='låg',
  dating_source='Länsstyrelsen Västernorrland / Världsarvet Höga Kusten',
  description='Kallmurad stenvall vid minst branta partiet; övriga sidor naturligt försvar i dåtidens omgivande hav. Gabbro-berggrund. Vid Mädans by, utsikt över Gaviksfjärden; längs Världsarvsleden.',
  cultural_significance='Del av Höga Kustens järnålderslandskap'
 where name='Rödklitten' and landscape='Ångermanland';

-- #1 Grundläggningskyrka (proxy): äldsta daterade kyrkan per socken. OBS: sann grundläggning
-- kräver arkeologi (stavkyrka under stenkyrkan, tidigkristna gravar) — vyn är en startpunkt.
-- Tunn tills parish backfyllts (många rader har parish=null).
create or replace view public.v_founding_church as
  select distinct on (landscape,parish) name,landscape,parish,kind,built_from,dating_source,lat,lng
  from public.ecclesiastical_sites
  where kind in ('parish_church','chapel','monastery') and built_from is not null and parish is not null
  order by landscape,parish,built_from asc;

-- #3 Öland ortnamnssamband: sakralt inom 8 km från 6 hypotetiska centralorter (Daniel).
-- SVAGT (1,32×) mot öbasen — INTE Ångermanlands 4,72×. n=7 sakrala = för litet. Koord approx för
-- några centralorter; element_category ur MODERN svensk form (språkbias, se language_layer).
insert into public.ortnamn_enrichment_results (region,ratio,cult_enrichment,cult_n,radius_km,included_elements,caveat)
  values ('Öland',1.32,1.32,7,8,'sakralt (element_category)',
   'Öbred bas (207 kategoriserade av 535); 6 hypotetiska centralorter (Mörbylånga/Färjestaden/Stora Rör/Rälla/Grankullavik/S udde), vissa koord approx; n=7 för litet; element ur modern svensk form (språkbias).')
  on conflict (region) do update set ratio=1.32,cult_enrichment=1.32,cult_n=7,
   caveat=excluded.caveat;
