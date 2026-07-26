-- Rättar country för runinskrifter som rundata_evighetsrunor-importen felaktigt
-- satte till 'Sweden'. Rotorsak: scripts/data/rundata-import-inscriptions.sql +
-- import-batches/*.sql har coalesce(v.country,'Sweden') OCH hårdkodat $$Sweden$$ i
-- VALUES för allt utom NO/DK/GR/IS. Rundatas signum-prefix är den pålitliga
-- diskriminatorn (verifierat mot koordinater: alla prefix nedan klustrar i rätt land).
--
-- Landssträngarna matchar frontendens befintliga kanoniska set (FilterPanel.tsx,
-- legendItemGenerators.ts). Brittiska öarna → England/Scotland (Orkney 'Or' + Shetland
-- 'Sh' tillhör Skottland). De nya länderna (Isle of Man, Germany, Netherlands, Poland,
-- France, Italy, Latvia) läggs samtidigt till i frontend-listorna i separat commit.
--
-- Scoped till country='Sweden' + exakt prefix-match → rör aldrig korrekt taggade rader.
-- Lämnar MEDVETET orörda: DK/DR (Skåne/Blekinge = modern Sverige), M (Medelpad),
-- J (Jämtland), Hr (Härjedalen), L/Ds/Bl (svenska landskap), KJ (svenska fyndplatser),
-- By (Balkan, osäker), SE/IK (bractea-katalog utan koord).
--
-- OBS: trg_search_refresh bygger om search_document per rad (sublabel + FTS uppdateras
-- automatiskt) MEN nollar embedding → kör scripts/backfill-embeddings.sh efteråt.

update public.runic_inscriptions r
set country = m.country
from (values
  ('Bergen','Norway'),
  ('Or','Scotland'), ('Sh','Scotland'), ('Sc','Scotland'),
  ('E','England'),
  ('IR','Ireland'),
  ('FR','Faroe Islands'),
  ('FI','Finland'),
  ('RU','Russia'),
  ('UA','Ukraine'),
  ('IM','Isle of Man'),
  ('DE','Germany'),
  ('NL','Netherlands'),
  ('PL','Poland'),
  ('F','France'),
  ('IT','Italy'),
  ('LV','Latvia')
) as m(prefix, country)
where r.country = 'Sweden'
  and substring(r.signum from '^[^ 0-9]+') = m.prefix;

-- Namnberikning för de två väletablerade färöstenarna (övriga FR är fragmentariska
-- objekt utan vedertaget egennamn → lämnas).
update public.runic_inscriptions
set name = 'Sandavágsstenen', name_en = 'Sandavágur stone', name_source = 'manual'
where signum = 'FR 2';

update public.runic_inscriptions
set name = 'Kirkjubøstenen', name_en = 'Kirkjubøur stone', name_source = 'manual'
where signum = 'FR 1';
