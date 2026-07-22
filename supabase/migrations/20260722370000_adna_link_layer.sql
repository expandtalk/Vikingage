-- aDNA-koppling + kartlager. Applicerad via MCP execute_sql; fil = proveniens.
-- genetic_individuals.site_id var NULL på alla 7 individer trots att sample_id-prefix
-- (als/kro/sal/snb) matchar archaeological_sites. Länkning återställd:
--   als→Alsike (2), kro→Kronan (2), sal→Sala (1), snb→Sandby borg (2).
-- Nu kan aDNA-individerna kartläggas via platsens koordinat. Nytt kartlager useMapAncestrySites
-- (legend 'adna_sites', tänds i focus=geneticEvents) visar plats + individer (kön, Y/mt-hg, 14C).
--
-- OBS: DNA-materialet är tunt (4 platser, 7 individer). Riktig per-individ-utbyggnad kräver
-- källor (peer-review aDNA: t.ex. Margaryan et al. 2020 Nature "Population genomics of the
-- Viking world"; Krzewińska et al. 2018 Sigtuna; Rodríguez-Varela et al. 2023). Inga
-- genotyper fabriceras — nya individer/platser läggs bara till från publicerade dataset.
update public.genetic_individuals gi set site_id = a.id
from public.archaeological_sites a
where gi.site_id is null and (
  (lower(gi.sample_id) like 'als%' and a.name='Alsike') or
  (lower(gi.sample_id) like 'kro%' and a.name='Kronan') or
  (lower(gi.sample_id) like 'sal%' and a.name='Sala') or
  (lower(gi.sample_id) like 'snb%' and a.name='Sandby borg')
);
