-- ============================================================================
-- Sigtunadosan (U Fv1912;8): sätt meter='dróttkvätt' + not, och slå ihop dubblett.
--
-- Sigtunadosan är en portabel bronsdosa från Sigtuna (~900–1000), inte en runsten.
-- B-sidan bär en dróttkvätt-strof — ett av få runbelägg på skaldisk hovmetrik vid
-- sidan av Karlevistenen (Öl 1). Karlevi förblir den enda FULLSTÄNDIGA dróttkvätt-
-- strofen på en runsten, bevarad i obetvivlat originalskick; dosans vers är partiell.
--
-- Städar även en dubblett: 'U FV 1912;8' (versal-variant, tom translitteration,
-- 0 carver-länkar, 0 attribueringar) — dess enda unika data (location='Sigtuna')
-- flyttas till den äkta posten innan dubbletten tas bort.
-- ============================================================================

begin;

update public.runic_inscriptions
set meter = 'dróttkvätt',
    location = coalesce(location, 'Sigtuna'),
    scholarly_notes = coalesce(scholarly_notes, '') ||
      E'\n\nSigtunadosan — en portabel bronsdosa (vikt-/skåldosa) från Sigtuna, ~900–1000 (Imer 2007), ristad av Värmund. A-sidan är prosa (»Djärv fick dessa (vikt)skålar av en semsk man…«); B-sidan bär en dróttkvätt-strof (»Fugl velva sleit falvan…«) — ett av få runbelägg på skaldisk hovmetrik vid sidan av Karlevistenen. Till skillnad från Karlevi (den enda fullständiga dróttkvätt-strofen på en runsten, bevarad i obetvivlat originalskick) är dosans vers partiell och delvis dunkel, och föremålet är ett lösföremål, inte en runsten.'
where id = '86f8acd4-2d18-4b48-bd8f-1b31c72b3f8b'   -- U Fv1912;8 (äkta)
  and (scholarly_notes is null or scholarly_notes not like '%Sigtunadosan — en portabel%');  -- idempotent: undvik re-append

-- Ta bort den tomma dubbletten (0 länkar, 0 attribueringar).
delete from public.runic_inscriptions
where id = '3fd8da39-ada1-4564-a795-3cfa1d060dc8';    -- U FV 1912;8 (dubblett)

commit;
