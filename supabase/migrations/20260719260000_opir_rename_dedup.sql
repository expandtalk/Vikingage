-- Öpir-städning: (1) ta bort den tomma dubbletten "Öpir" (0 länkar, ingen data),
-- (2) döp om de två verkliga till självförklarande, sökbara namn så båda syns tydligt
-- (listan sorteras efter stenantal, så Öpir 2 låg annars långt ner och var svår att hitta).
delete from public.carvers where id = '52a24e2f-7e88-4894-8582-4296ec736725';

update public.carvers set
  name = 'Öpir (Uppland)',
  description = 'Öpir (ybiR / ØpiR) — den mest produktiva av de sena uppländska runristarna, verksam i östra Uppland kring 1000-talets slut och 1100-talets början (stilgrupperna Pr 4 till Pr 5, sen Urnesstil). Behandlad i egen monografi av Åhlén (1997). Källström räknar med två ristare med namnet Öpir: denna uppländske mästare samt en lokalt verksam ristare i Södermanland (se Öpir (Södermanland), signaturen på Sö 11). Öpir använde ofta verbet ráða (réð) och lät ibland någon annan utföra själva huggningen. Den föreslagna identifikationen med en kyrkans man (Sjöberg 1982) har inte accepterats av runologerna.'
where id = '2a1cf645-91fa-47a6-b904-5b8b56b95fb3';

update public.carvers set
  name = 'Öpir (Södermanland)',
  description = 'Öpir i Södermanland — en lokalt verksam ristare belagd genom signaturen på Sö 11, att skilja från den namnlika uppländske mästaren Öpir (se Öpir (Uppland)). Källström räknar med dessa två separata ristare med samma namn.'
where id = '2f34f9f3-9f92-444d-af19-9587184451d9';
