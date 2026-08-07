-- Adelsö/Birka-kungarna-spåret: (1) Alsnö stadga som PD-källa (medeltida diplom ~1280, EJ 1285),
-- (2) länka Hovgårdsstenen U 11 + Hovgården-kungsgård till temat makt-dynasti (maktlandskap).
-- Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.

insert into public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, kind, rights, repository, repository_ref, peer_reviewed, description)
select
  'Alsnö stadga', 'The Ordinance of Alsnö', 'Magnus Ladulås (kungligt kansli)',
  1280, 1280, 1280,
  'primary'::source_reliability,
  'fornsvenska (avskrift); latinskt original förlorat',
  'archive_item'::source_kind, 'public_domain'::source_rights,
  'SDHK (Svenskt Diplomatariums huvudkartotek)', 'SDHK 1122', false,
  'Öppet kungligt brev utfärdat av Magnus Ladulås på Alsnö hus (Adelsö), sannolikt 27 sept 1280. '
  'Självdateringen till 1285 i de bevarade texterna är bevisligen felaktig — två namngivna vittnen '
  '(ärkebiskop Jakob Israelsson, ärkedjäknen Bengt) dog redan 1281; Jägerstad (1948) rekonstruerade '
  '27 sept 1280, alternativt maj 1279 (Tunberg/Liedgren). Originalet (troligen latin) är förlorat; '
  'känd genom två fornsvenska avskrifter (ca 1325 resp. senare 1300-tal) som bilagor till Västgötalagen. '
  'Fyra artiklar: (1) förbud mot våldgästning under kungens ambulerande styre; (2) förnyelse av Birger '
  'jarls edsöreslagar; (3) "frälseartikeln" — av äldre forskning sedd som det dokument som konstituerar '
  'det världsliga frälset (skattefrihet mot rusttjänst), av nyare forskning snarare som en formalisering/'
  'skriftfästning av ett redan existerande system; (4) förbud mot förläningsinnehavares olaga pålagor på '
  'bönderna. Betydelse: nyckeldokument för svenskt frälse och kunglig förvaltning, och belägg för Adelsös '
  'roll som kunglig nod under högmedeltiden.'
where not exists (select 1 from public.historical_sources where title = 'Alsnö stadga');

-- Temalänkar (write-through-vy theme_links → relationship med has_theme). Entiteterna är redan
-- registrerade i entity_registry. Tema makt-dynasti = c1fa9fd2-8577-4577-b41b-a81c023a38ee.
insert into theme_links (theme_id, entity_type, entity_id, notes)
select v.* from (values
  ('c1fa9fd2-8577-4577-b41b-a81c023a38ee'::uuid, 'inscription', 'de493999-520d-401f-8651-9955dabb7ed1'::uuid,
   'Hovgårdsstenen (U 11): kungens bryte Tolir över Roden lät rista åt kungen — belägg för kunglig förvaltning vid Adelsö/Hovgården, vikingatid.'),
  ('c1fa9fd2-8577-4577-b41b-a81c023a38ee'::uuid, 'estate', '29a27baf-c6bd-4041-8b32-7aa6a923693f'::uuid,
   'Hovgården på Adelsö: kunglig gård mitt emot Birka (Uppsala öd), sveakungens säte; senare Alsnö hus och Alsnö stadga 1280.')
) as v(theme_id, entity_type, entity_id, notes)
where not exists (
  select 1 from theme_links tl where tl.theme_id=v.theme_id and tl.entity_type=v.entity_type and tl.entity_id=v.entity_id
);
