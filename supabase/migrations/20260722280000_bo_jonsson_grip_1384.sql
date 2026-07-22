-- Bo Jonsson Grips testamente 1384 (SDHK): borgar som estates + innehav. Rikets störste
-- godsinnehavare (drots) — ~1/3 av Sverige + stora delar av Finland.
DELETE FROM public.estates WHERE name IN ('Nyköpingshus','Åbo slott','Viborgs slott','Stegeborg','Rumlaborg');
INSERT INTO public.estates (name, estate_type, lat, lng, first_attested, description, source, confidence) VALUES
 ('Nyköpingshus','borg',58.7525,17.0106,1260,'Kungligt slott vid Nyköping; en av Bo Jonsson Grips huvudborgar (testamentet 1384).','SDHK; Bo Jonssons testamente 1384','probable'),
 ('Åbo slott','borg',60.4353,22.2290,1280,'Kungligt slott i Åbo (Finland); centrum för Bo Jonssons finska förläningar.','SDHK; Bo Jonssons testamente 1384','probable'),
 ('Viborgs slott','borg',60.7156,28.7285,1293,'Gränsborg österut (nu Ryssland); Bo Jonssons innehav 1384.','SDHK; Bo Jonssons testamente 1384','probable'),
 ('Stegeborg','borg',58.4269,16.5936,1310,'Kungligt slott i Östergötland; Bo Jonssons innehav.','SDHK; Bo Jonssons testamente 1384','probable'),
 ('Rumlaborg','borg',57.7526,14.2836,1360,'Kunglig borg vid Jönköping; Bo Jonssons innehav.','SDHK; Bo Jonssons testamente 1384','probable');
INSERT INTO public.estate_holdings (estate_id, holder_kind, king_id, holder_name, role, acquired_via, period_start, period_end, fiscal_system, confidence, source, note)
SELECT e.id, 'king', k.id, k.name, 'förläning', 'förläning', 1371, 1386, 'land_skatt', 'probable', 'SDHK; Bo Jonssons testamente 1384', 'Del av drotsens domän — ~1/3 av Sverige + stora delar av Finland. Testamentet 1384 förtecknar innehaven.'
FROM public.estates e JOIN public.historical_kings k ON k.name='Bo Jonsson Grip'
WHERE e.name IN ('Nyköpingshus','Åbo slott','Viborgs slott','Stegeborg','Rumlaborg');
