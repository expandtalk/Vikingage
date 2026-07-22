-- Fimbulvinter-berikning (Gräslund) + deduplicering av händelser. Applicerad via MCP
-- execute_sql; fil = proveniens. Källor: Gräslund 2007 (Saga och Sed); Gräslund & Price
-- 2012 (Antiquity); Büntgen et al. 2016 (Nature Geoscience); Sigl et al. 2015 (Nature 523).
-- Deduplicering: mina tillagda climate/epidemic-poster (matchar tidslinjens färgkarta)
-- behölls; tre pre-existerande dubbletter (natural_disaster/plague-typade) togs bort.

update public.historical_events set
  description = 'Nordens största kända katastrof. En serie vulkanutbrott (536 västra Nordamerika, 540 tropikerna, ev. 547) slungade sulfataerosoler i stratosfären; solen var nära osynlig ~1,5–2 år och somrarna kalla i ~15 år (536–550), 3–4°C lägre i norra Skandinavien. Skörden kollapsade; befolkningen kan ha halverats (Gräslund: upp till ~500 000 döda inom nuv. Sverige). Gårdar övergavs på Öland/Gotland (Övetorp, Rosendal) och i Norrland. Guldskatter offrades i sjöar/våtmark. Utlöste sannolikt justinianska pesten (541). Kopplas till Fimbulvinter-/Ragnarök-myten och futharkens förkortning 24→16.',
  sources = array['Gräslund 2007, Saga och Sed','Gräslund & Price 2012, Antiquity','Büntgen et al. 2016, Nature Geoscience','Sigl et al. 2015, Nature 523']
where event_name = 'Fimbulvintern / 536 e.Kr. stoftslöja (LALIA)';

delete from public.historical_events where id in (
  '239e55aa-0d7a-4472-9ae0-71b54fc111f3',  -- Fimbulvinter (Volkanisk vinter), natural_disaster (dubblett)
  '064650e1-ea1d-4732-972b-557d65786a08',  -- Justinianska pesten, plague (dubblett)
  'cddf7e03-b361-442f-b09f-c1b288579153'   -- Digerdöden/Svarta döden, plague (dubblett)
);
