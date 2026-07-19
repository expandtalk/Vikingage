-- ============================================================================
-- Fas A: Koppla den litterära traditionen till materialet.
-- Utökar historical_sources och seedar Codex Regius (Poetiska Eddan) samt
-- Magnus-brödernas 1500-talshistoria. Länkning sten<->dikt (source_inscription_links)
-- kommer i Fas B.
--
-- meter följer standardutgåvor (Neckel–Kuhn; Skaldic Project / Eddukvæði, Íslenzk
-- fornrit). "blandad" = dikten växlar mellan versmått/prosa.
-- reliability='legendary' för mytiskt/legendariskt stoff (Edda + de konstruerade
-- 1500-talskungalängderna); det säger något om innehållets art, inte källans värde.
-- ============================================================================

begin;

-- 1. Schemautökning
alter table public.historical_sources add column if not exists work_type text;   -- edda_poem | saga | skaldedikt | krönika | annat
alter table public.historical_sources add column if not exists collection text;  -- t.ex. 'Poetiska Eddan (Codex Regius)'
alter table public.historical_sources add column if not exists manuscript text;   -- t.ex. 'Codex Regius, GKS 2365 4to (~1270)'
alter table public.historical_sources add column if not exists meter text;        -- fornyrðislag | ljóðaháttr | málaháttr | dróttkvätt | prosa | blandad

comment on column public.historical_sources.work_type is 'Verktyp: edda_poem | saga | skaldedikt | krönika | annat.';
comment on column public.historical_sources.meter is 'Versform (samma vokabulär som runic_inscriptions.meter).';

-- 2. Codex Regius / Poetiska Eddan (31 poster). Gemensamma fält sätts i projektionen.
insert into public.historical_sources
  (title, title_en, author, written_year, reliability, language, work_type, collection, manuscript, meter, bias_types, description)
select
  v.title_sv, v.title_on, 'Anonym', 1270, 'legendary'::source_reliability,
  'Fornvästnordiska (fornisländska)', 'edda_poem', 'Poetiska Eddan (Codex Regius)',
  'Codex Regius, GKS 2365 4to (~1270, Árni Magnússon-institutet, Reykjavík)',
  v.meter, array['temporal_distance']::bias_type[],
  v.kind || '. ' || v.descr
from (values
  ('Valans spådom','Völuspá','fornyrðislag','Gudadikt','Världens skapelse, gudarnas öden och Ragnarök — huvudkälla till nordisk kosmologi'),
  ('Den Höges sång','Hávamál','ljóðaháttr','Gudadikt','Odens levnadsvisdom, runmagi och självuppoffring i trädet'),
  ('Sången om Vavtrudner','Vafþrúðnismál','ljóðaháttr','Gudadikt','Odens vishetstävlan med jätten Vavtrudner om kosmos ursprung och slut'),
  ('Sången om Grimner','Grímnismál','ljóðaháttr','Gudadikt','Oden som Grimner uppenbarar mytisk geografi och gudavärldens boningar'),
  ('Sången om Skirner','Skírnismál','ljóðaháttr','Gudadikt','Frejs frieri till jättekvinnan Gerd genom tjänaren Skirner'),
  ('Sången om Harbard','Hárbarðsljóð','blandad','Gudadikt','Ordstrid (senna) mellan Tor och Oden förklädd till färjkarlen Harbard'),
  ('Kvädet om Hymer','Hymiskviða','fornyrðislag','Gudadikt','Tor och Tyr hämtar bryggkitteln hos jätten Hymer; Tors fiske efter Midgårdsormen'),
  ('Loketrätan','Lokasenna','ljóðaháttr','Gudadikt','Loke smädar gudarna vid Ägirs gästabud (senna)'),
  ('Kvädet om Trym','Þrymskviða','fornyrðislag','Gudadikt','Jätten Trym stjäl Tors hammare; Tor klär ut sig till brud för att återta den'),
  ('Kvädet om Volund','Völundarkviða','fornyrðislag','Gudadikt/hjältedikt','Smeden Volund fångas av kung Nidud och tar grym hämnd'),
  ('Sången om Allvis','Alvíssmál','ljóðaháttr','Gudadikt','Tor prövar dvärgen Allvis med frågor tills gryningen förstenar honom'),
  ('Första kvädet om Helge Hundingsbane','Helgakviða Hundingsbana I','fornyrðislag','Hjältedikt','Hjälten Helge Hundingsbanes bragder'),
  ('Kvädet om Helge Hjorvardsson','Helgakviða Hjörvarðssonar','fornyrðislag','Hjältedikt','Helge Hjorvardsson och valkyrjan Sváva'),
  ('Andra kvädet om Helge Hundingsbane','Helgakviða Hundingsbana II','fornyrðislag','Hjältedikt','Helge och Sigrun; återkomst från Hel'),
  ('Om Sinfjötles död','Frá dauða Sinfjötla','prosa','Prosabrygga','Prosastycke om Sinfjötles död — övergång till Völsungacykeln'),
  ('Gripers spådom','Grípisspá','fornyrðislag','Hjältedikt','Griper spår Sigurds hela framtida öde och sammanfattar cykeln'),
  ('Sången om Regin','Reginsmál','blandad','Hjältedikt','Regin, guldets förbannelse (Andvaranaut) och Sigurds hämnd på fadersbanen'),
  ('Sången om Fafner','Fáfnismál','ljóðaháttr','Hjältedikt','Sigurd dräper draken Fafner, smakar hjärteblodet och förstår fåglarna (jfr Sigurdsristningen Sö 101)'),
  ('Sången om Sigdriva','Sigrdrífumál','ljóðaháttr','Hjältedikt','Sigurd väcker valkyrjan Sigdriva/Brynhild som lär honom runor; slutar i den stora lakunen'),
  ('Brottstycke av det större kvädet om Sigurd','Brot af Sigurðarkviðu','fornyrðislag','Hjältedikt','22 bevarade verser efter den stora lakunen; Sigurds dråp'),
  ('Första kvädet om Gudrun','Guðrúnarkviða I','fornyrðislag','Hjältedikt','Gudruns sorg vid den döde Sigurd'),
  ('Det korta kvädet om Sigurd','Sigurðarkviða hin skamma','fornyrðislag','Hjältedikt','Brynhilds hämnd och död'),
  ('Brynhilds färd till Hel','Helreið Brynhildar','fornyrðislag','Hjältedikt','Brynhilds färd till Hel och hennes försvarstal'),
  ('Nivlungarnes dråp','Dráp Niflunga','prosa','Prosabrygga','Prosastycke: gjukungarnas (nivlungarnas) undergång'),
  ('Andra kvädet om Gudrun','Guðrúnarkviða II','fornyrðislag','Hjältedikt','Gudruns liv efter Sigurd, hos Atle'),
  ('Tredje kvädet om Gudrun','Guðrúnarkviða III','fornyrðislag','Hjältedikt','Gudrun renar sig från anklagelse genom järnbörd'),
  ('Oddruns gråt','Oddrúnargrátr','fornyrðislag','Hjältedikt','Oddruns olyckliga kärlek till Gunnar'),
  ('Kvädet om Atle','Atlakviða','fornyrðislag','Hjältedikt','Gjukungarnas svek hos Atle (Attila) och Gudruns hämnd — en av de äldsta dikterna'),
  ('Den grönländska sången om Atle','Atlamál in grœnlenzku','málaháttr','Hjältedikt','Den längre, grönländska versionen av Atle-stoffet'),
  ('Gudruns eggelse','Guðrúnarhvöt','fornyrðislag','Hjältedikt','Gudrun eggar sönerna Hamder och Sörle till hämnd på Jörmunrek'),
  ('Sången om Hamder','Hamðismál','fornyrðislag','Hjältedikt','Hamder och Sörle anfaller Jörmunrek (Ermanarik) — den gotiska hjältecykeln')
) as v(title_sv, title_on, meter, kind, descr)
where not exists (select 1 from public.historical_sources s where s.title = v.title_sv);

-- 3. Magnus-bröderna (1500-tal). Konstruerad historia — värdefull som receptions-/
--    mentalitetshistoria, EJ som faktakälla för kungarna.
insert into public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, work_type, meter, bias_types, description)
select * from (values
  (
    'Goternas och svearnas historia',
    'Historia de omnibus Gothorum Sveonumque regibus',
    'Johannes Magnus', 1554, null::integer, 1520,
    'legendary'::source_reliability, 'Latin', 'krönika', null::text,
    array['nationalist_swedish','political_legitimacy','temporal_distance']::bias_type[],
    'Sveriges siste katolske ärkebiskop (Uppsala), skrev verket i landsflykt i Italien/Rom efter reformationen, med tillgång till kurians material; utgavs postumt 1554 av brodern Olaus. Konstruerar en obruten göticistisk kungalängd från urtiden (Magog m.fl.) för att ge Sverige/goterna en ärofull forntid. Starkt vinklad mot Vasa-regimen och protestantismen. Värde: ett fönster mot hur man tänkte om forntid och kungamakt INNAN Sverige var en organiserad stat — receptions- och mentalitetshistoria, inte faktakälla.'
  ),
  (
    'Historia om de nordiska folken',
    'Historia de gentibus septentrionalibus',
    'Olaus Magnus', 1555, null::integer, 1550,
    'secondary'::source_reliability, 'Latin', 'krönika', null::text,
    array['nationalist_swedish','christian_anti_pagan','temporal_distance']::bias_type[],
    'Johannes Magnus bror, likaså landsförvisad katolsk ärkebiskop i Rom. Encyklopedisk skildring av de nordiska folkens seder, natur och historia (jämte kartan Carta Marina, 1539). Vinklad och delvis fabulerande, men en rik etnografisk källa till nordiskt liv och föreställningsvärld sett från 1500-talet.'
  )
) as v(title, title_en, author, written_year, covers_period_start, covers_period_end,
       reliability, language, work_type, meter, bias_types, description)
where not exists (select 1 from public.historical_sources s where s.title = v.title);

commit;
