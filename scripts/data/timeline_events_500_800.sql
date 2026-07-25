-- Tidslinje-naglar i vendel-luckan (500-800), källbelagt. Idempotent.
BEGIN;
INSERT INTO public.historical_events (event_name, event_name_en, year_start, year_end, event_type, significance_level, description, description_en, region_affected, sources)
SELECT 'Vulkanisk dammslöja och Fimbulvinter', 'Volcanic dust veil and Fimbulwinter', 536, 550, 'climate', 'very_high',
 'Vulkanutbrotten 536, 540 och 547 skapade en dammslöja och den kallaste perioden på 2000 år. I Skandinavien missväxt och gårdsöde på upp till ~50 % i delar av Mellansverige och Norge; kopplas till Fimbulvinter-myten.',
 'The 536, 540 and 547 eruptions caused a dust veil and the coldest period in 2000 years. In Scandinavia crop failure and farm abandonment up to ~50% in parts of central Sweden and Norway; linked to the Fimbulwinter myth.',
 ARRAY['Skandinavien'], ARRAY['Gräslund & Price 2012, Antiquity','Toohey et al. 2016']
WHERE NOT EXISTS (SELECT 1 FROM public.historical_events WHERE event_name='Vulkanisk dammslöja och Fimbulvinter');

INSERT INTO public.historical_events (event_name, event_name_en, year_start, year_end, event_type, significance_level, description, description_en, region_affected, sources)
SELECT 'Justinianska pesten', 'Plague of Justinian', 541, 549, 'epidemic', 'high',
 'Första historiskt belagda böldpestpandemin når Medelhavsvärlden och Europa. Utbredningen i Norden är omdiskuterad men sammanfaller med den demografiska nedgången efter 536.',
 'The first historically attested bubonic plague pandemic reaches the Mediterranean and Europe. Its reach into Scandinavia is debated but coincides with the post-536 demographic decline.',
 ARRAY['Europa','Medelhavet'], ARRAY['Prokopios','Keller et al. 2019, PNAS']
WHERE NOT EXISTS (SELECT 1 FROM public.historical_events WHERE event_name='Justinianska pesten');

INSERT INTO public.historical_events (event_name, event_name_en, year_start, year_end, event_type, significance_level, description, description_en, region_affected, sources)
SELECT 'Seglet införs i Norden', 'The sail is adopted in Scandinavia', 700, 800, 'exploration', 'very_high',
 'Segelfartyg dyker upp på gotländska bildstenar (typ C/D) från 700-talet; äldre bildstenar saknar segel. Seglet är den tekniska tröskeln som möjliggör vikingatidens långdistansfärder.',
 'Sailing ships appear on Gotlandic picture stones (types C/D) from the 8th century; earlier stones lack a sail. The sail is the technological threshold enabling Viking-age long-distance voyages.',
 ARRAY['Gotland','Skandinavien'], ARRAY['Lindqvist, Gotlands Bildsteine','skeppsarkeologi (Bill m.fl.)']
WHERE NOT EXISTS (SELECT 1 FROM public.historical_events WHERE event_name='Seglet införs i Norden');
COMMIT;
