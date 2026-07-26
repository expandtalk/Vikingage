-- Löser upp den pre-existerande country='United Kingdom'-hinken (21 rader, prefix
-- Br/MM/Auzon/Scotterthorpe/St.) i England/Scotland/Isle of Man — de strängar
-- frontendens filter/legend faktiskt känner. "United Kingdom" fanns aldrig i
-- FilterPanel/legend, så dessa 21 var ofiltrerbara. Klassning per fyndort (koordinat/
-- ortnamn), per signum för otvetydighet. Följd på 20260723130000.
--
-- OBS: trg_search_refresh nollar embedding på berörda rader → kör
-- scripts/backfill-embeddings.sh efteråt (nu ~21 rader).

update public.runic_inscriptions
set country = 'England'
where country = 'United Kingdom'
  and signum in ('Br E1','Br E2','Br E3','Br E4','Br E6','Br E8','Br E9','Br E12','Br E16',
                 'Scotterthorpe','St. Benets Abbey','Auzon casket');

update public.runic_inscriptions
set country = 'Scotland'
where country = 'United Kingdom'
  and signum in ('Br Sc 2','Br Sc 8','Br Or 3','Br Or 6','Br Or 11','Br Barnes 17','Br Sh 3');

update public.runic_inscriptions
set country = 'Isle of Man'
where country = 'United Kingdom'
  and signum in ('MM 134','MM 135');
