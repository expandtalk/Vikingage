-- Marinarkeologisk tidskrift (MT) som källa + Christer Westerdahl som forskare, samt uppgraderat
-- källkritiskt citat på Kung Valdemars segelled. UPPHOVSRÄTT: MT (Marinarkeologiska sällskapet,
-- marinarkeologi.nu) är upphovsrättsskyddad — vi lagrar bara FAKTA + länkar ut, aldrig verbatim text
-- eller rehostade PDF:er/kartor (jfr source-rights-copyright-guard). Fakta här är attribuerade.

-- 1a) Christer Westerdahl → research_scholars (myntade "det maritima kulturlandskapet", 1992).
insert into public.research_scholars (name, affiliation, role_title, active_period, life_status, biography, source)
select 'Christer Westerdahl', null, 'marinarkeolog', '1970-tal–2020-tal', null,
       'Svensk marinarkeolog; introducerade begreppet "det maritima kulturlandskapet" (Westerdahl, "The maritime cultural landscape", International Journal of Nautical Archaeology 21.1, 1992). Central författare i Marinarkeologisk tidskrift (MAS).',
       'Marinarkeologisk tidskrift (Marinarkeologiska sällskapet); Westerdahl 1992 (IJNA 21.1)'
where not exists (select 1 from public.research_scholars where name = 'Christer Westerdahl');

-- 1b) MT 1992:2-artikeln "En strukturell översyn av itinerariet" → sources (bytea-uuid-brygga för sourceid).
--     Fakta-post; uttrycket är skyddat (noteras i notes). Länk till PDF (ej rehostad).
insert into public.sources (sourceid, title, author, publication_year, publisher, url, notes, source_type, scholar_id, created_at, updated_at)
select decode(replace(gen_random_uuid()::text,'-',''),'hex'),
       'En strukturell översyn av itinerariet',
       'Christer Westerdahl', 1992,
       'Meddelanden från Marinarkeologiska sällskapet (Marinarkeologisk tidskrift) 1992:2',
       'https://marinarkeologi.nu/MT/1992/mt_1992_2__558.pdf',
       'Källkritisk revision av det danska itinerariet i Kung Valdemars jordebok. FAKTA (fria): itinerariet nedtecknat ca 1300 (knutet till Johannes Jutae, Själlandslagens nedskrivare 1298; namnformer och texttradition stöder ~1300); "Kung Valdemars jordebok" är ett senare namn på hela samlingen (utg. som Liber Census Daniae av P.F. Suhm 1792). Westerdahl tar tillbaka sin tidigare tes om fasta lotsstationer och rekommenderar att marinarkeologin utgår från det maritima kulturlandskapets faktiska rester (hamnar, vrak, sjömärken, ballastplatser) snarare än itinerariet. UPPHOVSRÄTT: uttrycket skyddat (MAS/författare) — länka, rehosta ej; endast fakta lagras.',
       'article',
       (select id from public.research_scholars where name = 'Christer Westerdahl'),
       now(), now()
where not exists (select 1 from public.sources where title = 'En strukturell översyn av itinerariet' and author = 'Christer Westerdahl');

-- 2) Uppgradera "Kung Valdemars segelled": primärlager + källkritik i stället för Wikipedia-URI.
update public.fairways
set source = 'Danska itinerariet i Kung Valdemars jordebok (utg. Liber Census Daniae, P.F. Suhm 1792), nedtecknat ca 1300. Källkritisk revision: Christer Westerdahl, "En strukturell översyn av itinerariet", Marinarkeologisk tidskrift 1992:2.',
    source_uri = 'https://marinarkeologi.nu/MT/1992/mt_1992_2__558.pdf',
    note = trim(both E'\n' from coalesce(note || E'\n', '') ||
           'Källkritik: itinerariet är EN osäker källa, ej facit. Namnet "Kung Valdemars jordebok" är en senare konstruktion. Westerdahl (MT 1992:2) drar tillbaka tesen om fasta lotsstationer och förordar att leden ses som del av det maritima kulturlandskapet (hamnar/vrak/sjömärken), inte som den enda sanna rutten.')
where id = 'ebeec916-5afc-4703-bbb7-b56292737b35';
