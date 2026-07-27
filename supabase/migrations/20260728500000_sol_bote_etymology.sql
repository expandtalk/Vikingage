-- Svenskt ortnamnslexikon 2003 (red. M. Wahlberg) — nu LÄST DIREKT ur DiVA-PDF:en (91 MB, laddad
-- lokalt + pdftotext -enc UTF-8, "hämta i delar"). SOL har inget eget böte-uppslag (SOL 2003 predaterar
-- Huldén 2012) men hänvisar till böte-forskningen + upptar -böte-namnet Toböte, och dokumenterar de
-- besläktade vårdkase-elementen (viti/vitul/kummel/vete). Ersätter den tidigare löst citerade noten.
begin;
delete from public.ortnamn_element_interpretations
  where element_key = 'böte' and proponent = 'Standardetymologi';

insert into public.ortnamn_element_interpretations (element_key, interpretation, proponent, status, source, note)
select 'böte',
   'SOL 2003 har inget eget böte-uppslag, men hänvisar till forskningen (Sigurd Fries, "Namn på -böte", Studier i nordisk filologi 67, 1987; "Till böte-namnens historia", NoB 29, 1941) och upptar -böte-namnet Toböte (Nordmalings sn, Västerbotten). SOL dokumenterar de besläktade vårdkase-elementen: fvn. viti "märke, landkänning; vårdkase" (t.ex. Landvetter < *landviti), fsv. vitul "vårdkase" (Kaggeholm), samt kummel och vete/vätte i vårdkase-betydelse.',
   'Svenskt ortnamnslexikon 2003', 'referensverk',
   'Svenskt ortnamnslexikon 2003 (red. M. Wahlberg) — läst direkt (uppslagen Toböte/Kaggeholm/Landvetter/Kummelnäs + bibliografi Fries 1987, NoB 29 1941)',
   'Elementfamiljens grundbetydelse + belägg. Kompletterar de fyra konkurrerande böte-tolkningarna (Karsten/Modéer/Pipping/Huldén).'
where not exists (select 1 from public.ortnamn_element_interpretations e where e.element_key='böte' and e.source like 'Svenskt ortnamnslexikon 2003%');

update public.ortnamn_element_config
  set note = note || ' UPPDATERING: SOL 2003 nu läst direkt ur PDF:en — böte-litteraturen (Fries 1987; NoB 29 1941), namnet Toböte, och vårdkase-elementen viti/vitul/kummel/vete belagda (se ortnamn_element_interpretations).'
  where element_key = 'böte';
commit;
