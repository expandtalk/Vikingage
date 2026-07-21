-- Mynt-bilder + sigill-kategori på /coins. Körd via MCP 2026-07-21.
-- Bilder ligger i public/excursion-photos/allmana-bilder/ (deployas med dist/).
ALTER TABLE public.coins ADD COLUMN IF NOT EXISTS image_url text;

UPDATE public.coins SET image_url='/excursion-photos/allmana-bilder/knut-den-store-mynt.jpg' WHERE name='Lund-penning, Knut den store';
UPDATE public.coins SET image_url='/excursion-photos/allmana-bilder/sven-tveskagg-mynt.jpg' WHERE name='Dansk penning, Sven Tveskägg';

-- Sigill (seglar) som egen kategori på mynt-sidan.
INSERT INTO public.coins (name, category, issuer, period_start, period_end, description, image_url, sources)
SELECT v.name, 'seal', v.issuer, v.ps, v.pe, v.descr, v.img, 'Bild: allmänna bilder (vikingage)'
FROM (VALUES
 ('Magnus Ladulås sigill','Magnus Ladulås',1275,1290,'Kungligt sigill.','/excursion-photos/allmana-bilder/magnus-ladulas-sigill.jpeg'),
 ('Magnus Erikssons sigill','Magnus Eriksson',1319,1364,'Kungligt sigill.','/excursion-photos/allmana-bilder/magnus-erikssons-sigill.jpeg'),
 ('Albrekt av Mecklenburgs sigill','Albrekt av Mecklenburg',1364,1389,'Kungligt sigill.','/excursion-photos/allmana-bilder/albrecht-av-mecklenburg-sigill.jpeg'),
 ('Karl Knutsson Bondes sigill','Karl Knutsson Bonde',1448,1470,'Kungligt sigill.','/excursion-photos/allmana-bilder/karl-knutson-bondes-sigill.jpeg'),
 ('Kalmars stadssigill 1255','Kalmar stad',1255,1255,'Ett av Nordens äldsta stadssigill.','/excursion-photos/allmana-bilder/kalmar-sigill-1255.jpg'),
 ('Stockholms första sigill','Stockholms stad',1296,1296,'Stadens äldsta kända sigill.','/excursion-photos/allmana-bilder/stockholms-forsta-sigill.jpeg')
) AS v(name,issuer,ps,pe,descr,img)
WHERE NOT EXISTS (SELECT 1 FROM public.coins c WHERE c.name=v.name);
