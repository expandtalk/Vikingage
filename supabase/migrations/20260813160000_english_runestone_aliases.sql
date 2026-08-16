-- Engelska alias för de internationellt kända runstenarna → also_known_as.
--
-- Bugg (Daniel): den engelska conversation-startern "Rök stone" gav TOM svarssida (0 träffar),
-- medan svenska "Rökstenen" fungerade. entity_answer_context.hit-CTE matchar frågan mot en sten
-- via r.name / r.signum / also_known_as (exakt, skiftlägesokänsligt) — men de engelska namnen
-- saknades i also_known_as. Här läggs BELAGDA engelska namn för de kända stenarna (INGEN gissning
-- för obskyra danska/lokala stenar — bara de med etablerade engelska namn). Idempotent (DISTINCT).
--
-- Signum verifierade mot DB innan tillägg. Både ö- och ASCII-varianter (engelska tangentbord).

WITH aliases(signum, extra) AS (
  VALUES
    ('Ög 136', ARRAY['Rök stone','Rök runestone','Rok stone','Rok runestone']),
    ('Öl 1',   ARRAY['Karlevi stone','Karlevi runestone']),
    ('DR 42',  ARRAY['Jelling stone','Jelling stones','Jelling runestone','large Jelling stone']),
    ('DR 41',  ARRAY['small Jelling stone','Jelling stone (small)']),
    ('Sö 179', ARRAY['Gripsholm stone','Gripsholm runestone']),
    ('Vg 119', ARRAY['Sparlösa stone','Sparlösa runestone','Sparlosa stone','Sparlosa runestone']),
    ('U 1161', ARRAY['Altuna stone','Altuna runestone']),
    ('G 110',  ARRAY['Tjängvide stone','Tjängvide image stone','Tjangvide stone']),
    ('DR 209', ARRAY['Glavendrup stone','Glavendrup runestone']),
    ('DR 249', ARRAY['Tune stone','Tune runestone']),
    ('U 127',  ARRAY['Jarlabanke stone','Jarlabanke runestone']),
    ('DR 282', ARRAY['Hunnestad monument','Hunnestad stone'])
)
UPDATE runic_inscriptions r
SET also_known_as = (
  SELECT array(SELECT DISTINCT x
               FROM unnest(coalesce(r.also_known_as, '{}'::text[]) || a.extra) x
               WHERE x IS NOT NULL AND btrim(x) <> '')
)
FROM aliases a
WHERE r.signum = a.signum;
