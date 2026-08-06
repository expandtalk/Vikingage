-- Ölund 2012 (Upplandsmuseets rapporter 2012:21) → church_investigations, kopplad till Mariakyrkan.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- Fakta + citat (INGEN verbatim rapporttext; © Upplandsmuseet markerat i license).
-- De två Maria-posterna hålls medvetet isär (klosterkyrka vs dominikankonvent) — ej hopslagna.
INSERT INTO public.church_investigations
  (church_id, church_name, year_from, year_to, investigation_type,
   find_context, what_found, source_type, source_citation, source_url, license,
   evidence_class, verification_status, notes)
SELECT
  '7c2280ac-cc40-423d-8103-1f3dfdeffc82', 'Mariakyrkan', 2012, 2012,
  'schaktningsövervakning (bergvärme/el)',
  'Mariakyrkans kyrkogård — schakt för bergvärmekulvert (ca 70 m) och el, N-delen mot gravkapellet.',
  'Bendepå med 16 kranier (A2, täckt av medeltida fjälltegel); tre intakta kistgravar (A6 med armställning typ B, samt A9–A11) och flera omdeponerade skelettrester; ett kyrkodike kring kyrkan (A1, sannolikt 1700-tal); en kraftig stenkonstruktion (A16, tolkas som norra stigluckans grund, alternativt tegelugn/biskopshus); tassavtryck av katt på en stortegelbit. Inga fynd omhändertogs.',
  'publication',
  'Ölund, Anna. 2012. Arkeologi vid Mariakyrkan i Sigtuna. RAÄ 195:1, Sigtuna 2:41, 2:42 & 2:37, Uppland. Upplandsmuseets rapporter 2012:21. ISSN 1654-8280.',
  'https://www.upplandsmuseet.se/globalassets/publikationer/rapportserien/rapporter-2012/rapport-2012_21.pdf',
  '© Upplandsmuseet (rapport 2012:21) — endast fakta/referens, ej verbatim text',
  'antiquarian_control', 'verified',
  'RAÄ Sigtuna 195:1 (stadslager); Mariakyrkan Raä 30:1. Upplandsmuseet dnr Ar-366-2012, projektnr 8413. Fältundersökning 2012-08-10–2012-09-24 (lst dnr 431-20642-2012, handläggare Carl-Henrik Ankarberg). Kompletterande schaktövervakning i Olofsgatan (dnr 431-33058-2012) påträffade inga äldre lämningar.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.church_investigations ci
  WHERE ci.church_id = '7c2280ac-cc40-423d-8103-1f3dfdeffc82'
    AND ci.source_citation LIKE 'Ölund, Anna. 2012%'
);
