-- Bryte/Roden-nod: Håkanstenen (U 11, Adelsö) belägger hur kungsgården Hovgården i
-- ledungsdistriktet Roden förvaltades. Håkan Röde (kontroll) + Tolir (bryte, kungens fogde)
-- som innehav på Hovgården. holder_kind 'bryte' = administrativ roll. Idempotent.
DELETE FROM public.estate_holdings WHERE estate_id=(SELECT id FROM public.estates WHERE name='Hovgården (Adelsö)');
INSERT INTO public.estate_holdings (estate_id, holder_kind, king_id, holder_name, role, period_start, period_end, fiscal_system, confidence, source, note)
SELECT e.id, 'king', k.id, k.name, 'kontroll', 1070, 1079, 'ledung', 'probable', 'U 11 (Adelsöstenen); Adam av Bremen', 'Kungsgård i Roden (ledungsdistriktet). Håkanstenen (U 11) restes åt kungen — möjligen Håkan Röde.'
FROM public.estates e JOIN public.historical_kings k ON k.name='Håkan Röde' WHERE e.name='Hovgården (Adelsö)';
INSERT INTO public.estate_holdings (estate_id, holder_kind, holder_name, role, period_start, period_end, fiscal_system, confidence, source, note)
SELECT e.id, 'bryte', 'Tolir (bryte i Roden)', 'bryte', 1070, 1085, 'ledung', 'probable', 'U 11 (Adelsöstenen)', 'Bryte = kungens fogde/förvaltare. Håkanstenen: "Tolir, bryte i Roden, lät rista dem åt konungen." Primärt belägg för hur kungsgården i ledungsdistriktet Roden förvaltades. Hustru Gylla.'
FROM public.estates e WHERE e.name='Hovgården (Adelsö)';
