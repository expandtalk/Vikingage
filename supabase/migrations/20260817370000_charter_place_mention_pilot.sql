-- NIVÅ 3 PILOT: länka medeltidsbrev → NÄMND ort (ej bara utfärdandeort). Bevisar mekanismen på
-- Färjestaden — där en naiv ilike blandar ihop TVÅ olika ställen: ortnamnet Färjestaden PÅ ÖLAND
-- (färjfäste över Kalmarsund) vs APPELLATIVET "färjestaden" vid ALMARE-STÄKET (färjeläge över
-- Stäksundet, Uppland; tillbehör till borgholmen). charter_mentions håller isär dem (entity_id →
-- rätt place_names-rad; mention_kind skiljer 'place' från 'appellative').
--
-- KÄLLKRITIK: disambigueringen är GRANSKAD av AI-diplomatikern mot de fem SDHK-regesterna
-- (SDHK-regest = CC BY 4.0, Riksarkivet), inte gissad. Slutsats: Öland och Almarestäk är ÅTSKILDA,
-- inte sammanflätade — TVÅ skilda ärenden, TVÅ släkter, TVÅ landskap. Ingen ägarsläkt-bro finns i
-- regesterna (Ryning/Vasa/Glysing = Öland; Sture + ärkebiskopen = Almarestäk). Homonymin är
-- tillfällig (båda ur appellativet *färjestad* 'färjeläge') → noderna får ALDRIG slås ihop.
--
-- Öland-Färjestaden (place_names c7a95b74) — ortnamnsträff, EN godstvist (Ryning-bröderna vs
--   Glysing/Vasa; Gert Ryning fogde på Öland, Peter Ryning hövitsman på Borgholm):
--     SDHK 20332 ("färjestaden på Öland", böneskrift), 22120 ("Färjestaden på Öland", förlikning),
--     21767 ("godset Färjestaden", kvittobrev; "på Öland" ej ordagrant men förankrat via Borgholm).
-- Almare-Stäket (place_names 0e1c3e52) — APPELLATIV, färjeläge/tillbehör (EJ ortnamnet Färjestaden),
--   Sture-släkten + ärkebiskopen, uppländsk jurisdiktion:
--     SDHK 20234 ("färjan och färjestaden" vid Almarstäks hus, dom om arvsrätt),
--     23687 ("Almarestäk och färjestaden", stadfästelse + jordöverlåtelse).
--
-- CAVEATS (diplomatiker): (1) place_names-koord för Öland-Färjestaden är MODERNA tätorten
--   (1800–1900-tal); medeltida godsläget är rimlig men OVERIFIERAD hypotes — verifiera mot källa
--   före ev. koordinatpåstående. (2) 21767/22120 kan vara TIDIGA namnbelägg för godsnamnet, men
--   hävda EJ "äldsta belägg" utan kontroll mot SOL 2003 / Isof Ortnamnsregistret. (3) Prosopografiska
--   identifieringar (Kristiern Nilsson Vasa, filiationer) = tolkning, kräver granskning mot ÄSF/SBL.
--
-- Register-diff-poäng (nivå 3): platser som INTE finns i ortregistret får entity_id=null och bär
--   rånamnet i name_as_written → kandidat för nytt ortnamn / första skriftbelägg.

insert into public.charter_mentions
  (sdhk_id, name_as_written, mention_kind, role, entity_id, confidence, method, uncertain, qualifiers)
select v.sdhk, v.raw, v.kind, 'mentioned', v.eid::uuid, v.conf, 'diplomatiker_verified', false, v.q::jsonb
from (values
  (20332, 'Färjestaden på Öland', 'place', 'c7a95b74-5375-4d03-a331-21915256505c', '0.97',
    '{"toponym_status":"ortnamn","aktyp":"böneskrift (intercession)","prosopografi":"Ryning (Gert=Gerhard, Peter/Borgholm) vs Glysing/Vasa; Gert Ryning fogde på Öland","coord_caveat":"place_names-koord = moderna tätorten; medeltida godsläge overifierat","source":"diplomatiker ur SDHK-regest (CC BY 4.0, Riksarkivet)"}'),
  (22120, 'Färjestaden på Öland', 'place', 'c7a95b74-5375-4d03-a331-21915256505c', '0.97',
    '{"toponym_status":"ortnamn","aktyp":"kvittens/förlikning","prosopografi":"Gert Ryning då fogde på Öland; Karl Kristersson/Katarina Glysingsdotter","coord_caveat":"place_names-koord = moderna tätorten; medeltida godsläge overifierat","source":"diplomatiker ur SDHK-regest (CC BY 4.0, Riksarkivet)"}'),
  (21767, 'godset Färjestaden', 'place', 'c7a95b74-5375-4d03-a331-21915256505c', '0.90',
    '{"toponym_status":"ortnamn","aktyp":"kvittobrev (120 mark gutniska)","prosopografi":"Peter Ryning hövitsman på Borgholm; \"på Öland\" ej ordagrant men förankrat via Borgholm+parter","possible_early_attestation":"godsnamnet Färjestaden 1432 — flagga; EJ äldsta belägg utan SOL2003/Isof-kontroll","source":"diplomatiker ur SDHK-regest (CC BY 4.0, Riksarkivet)"}'),
  (20234, 'färjestaden (vid Almarstäk)', 'appellative', '0e1c3e52-6c90-45fe-a893-77da6fa67304', '0.97',
    '{"toponym_status":"appellativ (färjeläge/tillbehör till borgholmen, EJ ortnamn)","aktyp":"dom/rättsligt vittnesbörd om arvsrätt","prosopografi":"Sture: Jon Karlsson→Anund Jonsson→Anund Sture; uppländsk jurisdiktion","homonym_warning":"tillfällig homonymi med Öland-Färjestaden; slå EJ ihop noder","source":"diplomatiker ur SDHK-regest (CC BY 4.0, Riksarkivet)"}'),
  (23687, 'färjestaden (vid Almarestäk)', 'appellative', '0e1c3e52-6c90-45fe-a893-77da6fa67304', '0.97',
    '{"toponym_status":"appellativ (färjeläge/tillbehör till borgholmen, EJ ortnamn)","aktyp":"stadfästelse + jordöverlåtelse","prosopografi":"Gustav Anundsson Sture + modern fru Kristina; ärkebiskop Nils i Uppsala","homonym_warning":"tillfällig homonymi med Öland-Färjestaden; slå EJ ihop noder","source":"diplomatiker ur SDHK-regest (CC BY 4.0, Riksarkivet)"}')
) as v(sdhk, raw, kind, eid, conf, q)
where not exists (
  select 1 from public.charter_mentions cm
  where cm.sdhk_id = v.sdhk and cm.role = 'mentioned' and cm.entity_id = v.eid::uuid
);
