-- Nora-Rossvik vikingatida silverskatter — källförda ur AUKTORITATIV källa (ej Agnetas dokument).
-- Länsstyrelsen Västernorrland, Riksintresse för kulturmiljövården "Nora-Rossvik" [Y 24],
-- riksintressebeskrivning beslutad av RAÄ 2018. Fyra skatter i/nära riksintresset.
-- KORRIGERING mot forskningsdokumentet: den stora myntskatten (373 mynt) är från FRÖK, inte
-- 355 mynt vid Rossvik. Koordinater = transformerade SWEREF-punkter (Frök/Rossvik) där kända.
-- Coords = point(lng, lat).

begin;

insert into public.coins (name, name_en, category, metal, denomination, period_start, period_end,
  find_place, coordinates, significance, description, sources)
select v.name, v.name_en, 'hoard', 'silver', v.denomination, 900, 1100, v.find_place, v.coords, v.significance, v.descr,
  'Länsstyrelsen Västernorrland, Riksintresse kulturmiljövård "Nora-Rossvik" [Y 24], RAÄ-beslut 2018 (värdebeskrivning)'
from (values
  ('Frök-skatten (Nora)', 'The Frök hoard (Nora)', 'silvermynt (373 st)',
    'Frök, Nora socken, Kramfors', point(18.14294, 62.87026),
    '373 vikingatida silvermynt — en av fyra silverskatter i riksintresset Nora-Rossvik',
    'Silverskatt med 373 vikingatida silvermynt, funnen i byn Frök i Nora. Vittnar om Nora-bygdens rikedom och internationella handelskontakter under vikingatiden.'),
  ('Rossvik-skatten (Nora)', 'The Rossvik hoard (Nora)', 'silvermynt + arm-/halsringar',
    'Rossvik, Nora socken, Kramfors', point(18.06448, 62.86367),
    'Silvermynt samt arm- och halsringar',
    'Vikingatida silverskatt med silvermynt samt arm- och halsringar, funnen vid Rossvik. (Forskningsdokumentets lokala fyndplatsnamn "Valfridsro" ej belagt i riksintressebeskrivningen.)'),
  ('Bredsätter-skatten (Nora)', 'The Bredsätter hoard (Nora)', 'silvermynt + ringar',
    'Bredsätter, Nora socken, Kramfors', NULL::point,
    'Silvermynt + ringar; läge ej koordinatsatt i våra data',
    'Vikingatida silverskatt med silvermynt och ringar, funnen vid/nära Bredsätter. Exakt fyndkoordinat ej fastställd här — kräver Fornsök/SHM.'),
  ('Tjärnedsviken-skatten (Nora)', 'The Tjärnedsviken hoard (Nora)', 'silverskatt',
    'Åker ovanför Tjärnedsviken, Nora socken, Kramfors', NULL::point,
    'Nedgrävd silverskatt, funnen 1860-talet, sannolikt vikingatid',
    'Nedgrävd silverskatt påträffad på 1860-talet i en åker ovanför Tjärnedsviken, sannolikt vikingatida. Fyndkoordinat ej fastställd här.')
) as v(name, name_en, denomination, find_place, coords, significance, descr)
where not exists (select 1 from public.coins c where c.name = v.name);

commit;

-- Kontroll: select name, metal, find_place, coordinates from coins where name ilike '%Nora)%' or name ilike '%Frök%';
