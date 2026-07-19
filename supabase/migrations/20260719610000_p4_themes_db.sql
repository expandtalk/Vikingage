-- P4.3: Tema-lagret till DB — löser sanningskälla-krocken (hårdkodade themes.ts
-- vs DB themes/theme_links). themes får slug/keywords/icon; sök-linsernas nyckelord
-- seedas från frontend-konfigen. Kuraterade grafteman behåller sina rader (keywords
-- null → chippen söker på namnet). GlobalSearch läser hädanefter DB.
-- Idempotent.

begin;

alter table public.themes
  add column if not exists slug text,
  add column if not exists keywords text[],
  add column if not exists icon text;

-- slugga befintliga kuraterade teman
update public.themes set slug = lower(regexp_replace(translate(name,'åäöÅÄÖ&','aaoAAO_'), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;

create unique index if not exists themes_slug_key on public.themes(slug);

-- seed sök-linserna (från tidigare src/config/themes.ts)
insert into public.themes (name, name_en, slug, icon, keywords, description, description_en)
select * from (values
  ('Tro','Faith','faith','cross',
   array['guð','guþ','kristr','krist','kors','ængil','ande','själ','god','christ','cross','soul','angel','bön','prayer','helga'],
   'Kristen tro och religiösa uttryck i inskrifter och på platser.','Christian faith and religious expression.'),
  ('Kult','Cult','cult','sparkles',
   array['vi','lund','hov','offer','þórr','óðinn','freyr','freyja','tor','oden','frej','sacred','heathen','hednisk'],
   'Förkristen kult: vi, lundar, hov och gudarna.','Pre-Christian cult sites and gods.'),
  ('Död & minne','Death & memory','death','skull',
   array['dó','andaðis','död','minne','grav','died','death','memory','grave','buried','begravd','eptir','reisti stein'],
   'Minnesformler, död och begravning.','Memorial formulas, death and burial.'),
  ('Resa & färd','Voyage','voyage','compass',
   array['fóru','færd','austr','öster','grikk','grekland','england','serkland','voyage','travelled','east','expedition','ingvar','vittfarne'],
   'Färder österut och västerut.','Voyages east and west.'),
  ('Vapen & krig','Weapons & war','weapons','swords',
   array['sverð','svärd','sword','spjut','spear','sköld','shield','øx','yxa','axe','strid','orrusta','battle','war','hær','army','fell','stupade'],
   'Vapen, strid och krigargrader.','Weapons, battle and warrior ranks.'),
  ('Skydd & säkerhet','Protection','protection','shield',
   array['mund','skydd','värn','borg','fort','protect','defence','guard','þegn','dræng','dräng','värja','befästning'],
   'Skydd, värn och befästningar.','Protection and fortifications.'),
  ('Kärlek & familj','Love & family','love','heart',
   array['hustru','kona','wife','dóttir','dotter','daughter','son','moðir','moder','mother','faðir','fader','father','bróðir','broder','brother','kär','beloved','husband','make'],
   'Familjeband i minnesformlerna.','Family bonds in the memorial formulas.'),
  ('Handel & rikedom','Trade & wealth','trade','coins',
   array['silfr','silver','gull','guld','gold','mynt','coin','penning','köpman','merchant','skatt','treasure','dirham','handel','gæld'],
   'Handel, silver och rikedom.','Trade, silver and wealth.'),
  ('Skepp & hav','Ships & sea','ships','ship',
   array['skip','skepp','ship','boat','båt','knörr','knärr','hamn','harbour','sjó','sea','styrimaðr','skipari','roþr','segel'],
   'Skepp, sjöfart och hamnar.','Ships, seafaring and harbours.'),
  ('Häst','Horse','horse','pawprint',
   array['hross','häst','jór','hestr','horse','mare','stóð','hingst','sto'],
   'Hästen i inskrifter och gravar.','The horse in inscriptions and graves.'),
  ('Husdjur','Pets','pets','dog',
   array['hundr','hund','dog','hound','køttr','katt','cat','hvelpr','valp','rakki'],
   'Hundar och katter i det vikingatida hemmet.','Dogs and cats in the Viking-age household.')
) as v(name, name_en, slug, icon, keywords, description, description_en)
on conflict (slug) do update set keywords = excluded.keywords, icon = excluded.icon;

commit;
