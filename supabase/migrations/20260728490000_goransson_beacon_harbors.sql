-- Fler Göransson-vårdkasplatser (fiskehamnar), namngivna av Daniel ur KSH1 s.141. Koord = ortcentroid
-- ur place_names (verifierat). Alvedsjöbodar avvaktar egen koord (endast byn Alvedsjö i gazetteern).
begin;
insert into public.beacon_sites (name, landscape, municipality, parish, lat, lng, source_uri)
select v.namn, 'Öland', v.kommun, v.socken, v.lat, v.lng, 'Sölve Göransson 1978, Kalmar Stads Historia 1, s. 141'
from (values
  ('Vårdkasplats vid Gårdby hamn',         'Mörbylånga', 'Gårdby', 56.6044, 16.6426),
  ('Vårdkasplats vid Kårehamn (NÖ Öland)', 'Borgholm',   'Köping', 56.9536, 16.8803),
  ('Vårdkasplats vid Bläsinge hamn',       'Mörbylånga', 'Gårdby', 56.6243, 16.6708)
) as v(namn, kommun, socken, lat, lng)
where not exists (select 1 from public.beacon_sites b where b.name = v.namn);
commit;
