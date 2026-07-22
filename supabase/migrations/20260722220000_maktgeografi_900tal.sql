-- Maktgeografi 900-tals-nod: Sigtuna (ersätter Birka ~960–980) + Munsöättens innehav.
-- Visar den fiskala vändpunkten: Erik Segersälls ledung → Olof Skötkonungs myntning ~995
-- (fiscal_system 'ledung' → 'mynt'). Idempotent (delete Sigtuna → cascade tar holdings).
DELETE FROM public.estates WHERE name = 'Sigtuna';

INSERT INTO public.estates (name, estate_type, lat, lng, first_attested, description, source, confidence) VALUES
  ('Sigtuna', 'kungsgård', 59.6191, 17.7234, 980, 'Ny kunglig stad grundad ~980 när Birka övergavs (~960–980) och handeln flyttade. Olof Skötkonungs myntort ~995 — Sveriges första mynt.', 'Adam av Bremen; myntfynd', 'certain');

INSERT INTO public.estate_holdings (estate_id, holder_kind, dynasty_id, holder_name, role, period_start, period_end, fiscal_system, confidence, source, note)
SELECT e.id, 'dynasty', (SELECT id FROM public.royal_dynasties WHERE name ~* 'munsö' LIMIT 1), 'Munsöätten', 'kontroll', 970, 1060, 'ledung', 'probable', 'Adam av Bremen', 'Sveakungaätt (Erik Segersäll → Olof Skötkonung); makten flyttar Birka→Sigtuna.'
FROM public.estates e WHERE e.name = 'Sigtuna';

INSERT INTO public.estate_holdings (estate_id, holder_kind, king_id, holder_name, role, period_start, period_end, fiscal_system, confidence, source, note)
SELECT e.id, 'king', k.id, k.name, r.role, r.ps, r.pe, r.fisc, 'probable', 'runstenar; myntfynd', r.note
FROM public.estates e
JOIN (VALUES
  ('Erik Segersäll',  'kontroll', 970, 995,  'ledung', 'Ledde ledungen mot Danmark; sjöbaserad makt. Nämns på flera runstenar.'),
  ('Olof Skötkonung', 'kontroll', 995, 1022, 'mynt',   'Första kristna sveakungen; myntprägling i Sigtuna ~995 — ledung→mynt, den fiskala vändpunkten.')
) AS r(kname, role, ps, pe, fisc, note) ON TRUE
JOIN public.historical_kings k ON k.name = r.kname
WHERE e.name = 'Sigtuna';
