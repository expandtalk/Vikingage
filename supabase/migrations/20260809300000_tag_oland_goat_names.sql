-- Get-namn på Öland (boskaps-/get-signal): Getterum (get+hem) och Bocketorp (bock+torp) taggas
-- 'get'. Guden/djuret som huvud- resp. förled — Getterum var otaggat, Bocketorp hade bara torp.
-- Gettlinge lämnas OTAGGAT (etymologin omtvistad — kan vara get eller personnamn).
update place_names set element_keys = array['get'], element_category = 'natur', updated_at = now()
where province ilike 'Öland' and name = 'Getterum';
update place_names set element_keys = (select array(select distinct unnest(coalesce(element_keys,'{}') || array['get']))), updated_at = now()
where province ilike 'Öland' and name = 'Bocketorp';
