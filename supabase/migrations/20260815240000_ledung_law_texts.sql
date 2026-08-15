-- Ledung-paragrafer → source_texts. Framtaget av filolog-agenten, verifierat av orkestrator.
-- COPYRIGHT: grundtext = PD (Säve 1859 för Gutasagan; Fornsvenska textbanken/Schlyter 1834 för
-- Upplandslagen). Översättning = Viking Age EGEN. Holmbäck-Wessén 1933 EJ använd/citerad.
-- Kollationerings-förbehåll (teckennivå / full flock) noteras i norse_source (ej blockerande för kärnfakta).
insert into public.source_texts
  (source_id, stanza_no, section_label, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source, translation_kind)
select hs.id, base.mx + v.ord, v.section_label, v.norse, v.sv, v.en, v.norse_source,
       'Viking Age egen översättning (fornspråk→nusvenska)', 'Viking Age own translation', 'egen'
from (values
  ('Gutalagen', 1,
   'Gutasagan, kap. 4 — ledung (Gotlands åtagande mot sveakungen)',
   'Siþan Gutar toku sir biskup ok presti ok wiþr fullkumnum kristindomi, þa toku þair ok wiþ at fylgia Swia kunungi i herferþ miþ siau sniekkium ufan a haiþin land ok ai ufan kristin. So þau at kunungr a biauþa Gutum laiþing eptir wittr ok manaþa-frest firi liþstemnu-dag; ok þau skal liþstemnu-dagr wara firi miþsumar ok ai siþar. Þa hafa Gutar wald um at fara, en þair wilia, miþ sinum sniekkium ok atta wikna wist, en ai maira. En Gutar efla ai fylgia, þa gialdin fiauratigi marka penninga firi hweria sniekkiu, ok þau at andru ari, ok ai at þy sama ari sum buþit war.',
   'Sedan gutarna hade tagit sig biskop och präster och (nått) fullbordad kristendom, då åtog de sig också att följa sveakungen i härfärd med sju snäckor mot hedet land, men inte mot kristet. På så vis att kungen skall bjuda ut ledung åt gutarna efter vintern och (med) en månads frist före ledungsstämmodagen; och ändå skall ledungsstämmodagen vara före midsommar och inte senare. Då har gutarna rätt att fara, om de vill, med sina egna snäckor och åtta veckors kost, men inte mer. Men förmår gutarna inte följa med, då skall de betala fyrtio marker penningar för varje snäcka, och det (först) året därpå, inte samma år som (ledungen) bjudits ut.',
   'After the Gotlanders had taken to themselves a bishop and priests and (reached) fully established Christianity, they also undertook to follow the king of the Svear on a war-expedition with seven ships (snäckor) against heathen land, but not against Christian. On this condition: that the king shall summon the levy from the Gotlanders after winter, with a month''s notice before the muster-day; and even so the muster-day shall fall before midsummer and no later. Then the Gotlanders have the right to go, if they wish, with their own ships and eight weeks'' provisions, but no more. But if the Gotlanders are unable to take part, they shall pay forty marks in coin for each ship — and that in the following year, not in the same year in which (the levy) was summoned.',
   'Carl Säve (utg.), Gutniska urkunder, Stockholm 1859, s. 35 (PD; runeberg.org/gutniska/0079.html; hs Cod. Holm. B 64). Kärntermer belagt; teckennivå-varianter (ufan a/up a; eptir wittr/wintr; Þa/En) att kollationera mot Pipping 1905 (PD).'),

  ('Upplandslagen', 1,
   'Konungabalken (Kununx balkær), flock X — "Vm kununx leþung ok skipuistir hans"',
   'Vm kununx leþung ok skipuistir hans. NV biuþær kunungær liþ ok leþung utt, biuþær utt roþ ok reþ, þa skal næmpnæ hampn ok stampn ok styriman ok hasætæ allæ. Þæt ær laghæ leþungær fiughur skip aff hundæri hwariu. Sitær han qwær ok will æi siælfwær ut faræ, ok æi hærr sin utrikis sændæ, þa ær laghæ leþungær attæ pund ok attæ spæn j hampnu hwariæ.',
   'Om kungens ledung och hans skeppsproviant. Nu bjuder kungen ut här och ledung, bjuder ut rodd och redskap; då skall man utse hamn och stamn och styresman och alla hasätar (roddare). Det är laga ledung: fyra skepp av varje hundare. Sitter han kvar (hemma) och vill inte själv fara ut, och inte heller sända sin här utrikes, då är laga ledung åtta pund och åtta spann i varje hamna.',
   'On the king''s levy and his ship-provisioning. Now the king summons host and levy, summons out rowing and gear; then one shall appoint bow and stern and steersman and all the oarsmen (hasætar). That is the lawful levy: four ships from each hundari. If he stays at home and will not fare out himself, nor send his host abroad, then the lawful levy is eight pund and eight spæn from each hamna.',
   'Fornsvenska textbanken/Nordlund, Upplandslagen hs A (diplomatisk transkription, PD-hs). Kollationera mot C. J. Schlyter, Corpus Iuris Sueo-Gotorum III (Uplands-Lagen), 1834 (PD). KÄRNSATSER — hela flock X ej hämtad verbatim än.'),

  ('Upplandslagen', 2,
   'Konungabalken, flock XI — "Vm roþæ ræt" (roder/styresman)',
   'Vm roþæ ræt. ÞEttæ æru roþsins utskyldir: attæ markær smörs, hwarr þæn sitt æghit bröþ ætær, ok örtugh pæningæ aff hwarium bondæ fore þinglamæ. Giör styriman aþrum a sighling, böte atær skaþæ ok mæþ þre markær.',
   'Om rodderns (roddlagets) rätt. Detta är roddens utskylder: åtta marker smör av var och en som äter sitt eget bröd, och en örtug penningar av varje bonde för tinglame. Vållar styresmannen annan (skada) under segling, böte åter skadan och därtill tre marker.',
   'On the law of the rowing-district. These are the rowing-district''s dues: eight marks of butter from everyone who eats his own bread, and one örtug in coin from each farmer for þinglame. If the steersman causes (harm) to another during sailing, let him make good the damage and pay three marks besides.',
   'Fornsvenska textbanken/Nordlund, Upplandslagen hs A (PD-hs). Kollationera mot Schlyter 1834 (PD). KÄRNSATSER — hela flock XI ej hämtad verbatim än.')
) as v(law, ord, section_label, norse, sv, en, norse_source)
join public.historical_sources hs on hs.title = v.law
join lateral (select coalesce(max(stanza_no),0) mx from public.source_texts where source_id = hs.id) base on true;

-- Sätt PD-rights på lagarna vi nu fyllt ledung-text i (originalet är PD).
update public.historical_sources set rights='public_domain', updated_at=now()
where title in ('Gutalagen','Upplandslagen') and rights <> 'public_domain';
