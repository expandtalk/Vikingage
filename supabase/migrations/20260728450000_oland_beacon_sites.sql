-- Öland-vårdkasar → beacon_sites (fyllde 0 förut, öppen QA-punkt). Verifierade RAÄ-koordinater ur
-- K-samsök. OBS ärlig flaggning: dessa är vårdkase-ASSOCIERADE lämningar (RAÄ-typ Fyr/Röse/Plats med
-- tradition, textträff på "vårdkase"), inte rena "Vårdkase"-lämningar. Sölve Göranssons fullständiga
-- vårdböte-korpus för Öland/Kalmarsund = nästa berikning (kräver hans publikation för koordinater).
begin;
insert into public.beacon_sites (name, landscape, municipality, parish, lat, lng, source_uri)
select v.namn, 'Öland', v.kommun, v.socken, v.lat, v.lng, v.uri
from (values
  ('Vårdkas/fyr vid Källa (RAÄ L1957:1698, vårdkase-associerad)', 'Borgholm', 'Källa', 57.09044, 16.97890,
     'https://app.raa.se/open/fornsok/'),
  ('Vårdkasröse, Egby (RAÄ L1959:9485, vårdkase-associerad)', 'Borgholm', 'Egby', 56.86582, 16.84648,
     'https://app.raa.se/open/fornsok/'),
  ('Böte/vårdkasplats, Gräsgård (RAÄ L1958:2341, plats med tradition)', 'Mörbylånga', 'Gräsgård', 56.30626, 16.49325,
     'https://app.raa.se/open/fornsok/')
) as v(namn, kommun, socken, lat, lng, uri)
where not exists (select 1 from public.beacon_sites b where b.name = v.namn);
commit;
