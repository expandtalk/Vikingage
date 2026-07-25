-- Varnhem-gravens DNA-komplettering (Götherström/Malmström, Uppsala universitet 2007):
-- Y-DNA visar far–son mellan de två männen (Birger + Erik); mtDNA visar att de tre
-- inte delar mödernelinje → Mechtild var inte mor till Erik och obesläktad med männen.
-- Identiteten kan inte fastställas absolut (inga jämförelse-släktingar). Historik + osteologi
-- + DNA ger dock en mycket trovärdig koppling. Ref: presskonferens Varnhem 2007-08-31.

UPDATE public.genetic_individuals SET
  age = 'äldre man',
  period_from = 1210, period_to = 1266,
  burial_context = 'Stockholms grundare (enl. Erikskrönikan); son till Magnus Minnesköld av Bjälbo och Ingrid Ylva. Jarl 1248, de facto-regent 1250, död 21 okt 1266 vid Jälbolung. Första hustru Ingeborg Eriksdotter (syster till Erik läspe och halte) — mor till sönerna Valdemar och Magnus Ladulås som båda blev kungar. Vald Varnhems kloster som sista viloplats. Grav under skulpterad gravsten framför lekbrödernas altare. En ring av silverblandat guld (utan slitage → gjord för begravningen) hittades i graven 1920. Öppnad 2002.',
  source = 'Gravöppning 2002; osteologi (Maria Vretemark) + DNA (A. Götherström & H. Malmström, Uppsala univ. 2007, mtDNA/Y-DNA/autosomalt). Varnhems klosterkyrka.'
WHERE sample_id = 'VARNHEM-BirgerJarl';

UPDATE public.genetic_individuals SET
  age = 'vuxen man',
  period_to = 1275,
  pathology = 'Y-DNA bekräftar far–son-förhållande med den äldre mannen (Birger). Delar ej mödernelinje med kvinnan i graven.',
  burial_context = 'Birger Jarls näst yngste son ur första äktenskapet med Ingeborg Eriksdotter (Mechtild var alltså inte hans mor — bekräftat av mtDNA). Död 1275. I den upphöjda Bjälbo-graven i Varnhems klosterkyrka.',
  source = 'Gravöppning 2002; osteologi + DNA (Uppsala univ. 2007). Varnhems klosterkyrka.'
WHERE sample_id = 'VARNHEM-HertigErik';

UPDATE public.genetic_individuals SET
  age = 'vuxen kvinna',
  period_from = 1220, period_to = 1288,
  pathology = 'mtDNA visar att hon inte delar mödernelinje med de två männen — obesläktad med far och son i graven (som väntat för en ingift hustru).',
  burial_context = 'Birger Jarls andra hustru (gift 1261), änka efter danske kungen Abel av Holstein. DNA bekräftar att hon inte var mor till Erik i graven. Död 1288. Porträttstenen visar en kvinna och två män.',
  source = 'Gravöppning 2002; osteologi + DNA (Uppsala univ. 2007). Varnhems klosterkyrka.'
WHERE sample_id = 'VARNHEM-Mechtild';

-- Varnhem som kunglig nekropol (ej osteologiskt undersökta gravar noteras i platsbeskrivningen).
UPDATE public.archaeological_sites SET
  description = 'Cistercienskt kloster, kunglig gravkyrka. Erikska ätten: Knut Eriksson (+1196), Erik Knutsson (+1216), Erik Eriksson "läspe och halte" (+1250). Stenkilsätten: Inge den äldre (+ ca 1100, flyttad hit). Bjälboätten (framför Heliga korsets altare): Birger jarl (+1266), hertig Erik (+1275) och drottning Mechtild (+1288) — deras grav öppnad 2002 och DNA-bekräftad.',
  period = 'Vikingatid–medeltid'
WHERE name = 'Varnhem';
