-- Sö 314 (Torshälla kyrka) fanns redan med rätt koordinat men saknade namn/kontext/källa och syntes
-- inte vid sökning på "Torshälla" (label var bara signum). Sätter beskrivande namn (→ trg_search_refresh
-- gör den sökbar på både signum och sockennamn) + källbelagd kontext. Läsningen är fragmentarisk och
-- namnet osäkert (?); DB:s och museets normaliseringar redovisas bägge, ingen påhittad tolkning.
-- Källor: Runstenar i Södermanland s. 81; Sörmlands museums samlingar (foto SLM M025886, CC BY).
-- Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
update public.runic_inscriptions set
  name = coalesce(nullif(name,''), 'Sö 314 – Torshälla kyrkas runsten'),
  current_location = coalesce(nullif(current_location,''),
    'Rest vid Torshälla kyrkas södra vägg (RAÄ Torshälla 23:1)'),
  historical_context = coalesce(nullif(historical_context,''),
    'Sö 314 står rest vid Torshälla kyrkas södra vägg. Stenen består av två delar som var för sig, vid '
    'olika tidpunkter, påträffats inmurade i kyrkans grund. Inskriften är fragmentarisk och personnamnet '
    'osäkert (?): "… lät resa (stenen) efter [Kag/Gag/Gagar/Kak (?)], sin dugande bonde (husbonde/make)". '
    'RAÄ-nr Torshälla 23:1. Källor: Runstenar i Södermanland s. 81; Sörmlands museums samlingar '
    '(foto SLM M025886, licens CC BY, https://sokisamlingar.sormlandsmuseum.se/objects/c24-363432/).')
where signum = 'Sö 314';
