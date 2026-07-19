-- Berikar de två ristarna Öpir ur Källström (2007) + Åhlén (1997). Källström räknar
-- med exakt två: den uppländske mästaren (Öpir 1, 23 stenar) och en lokal ristare i
-- Södermanland (Öpir 2, Sö 11). Posten "Öpir" (0 stenar) är sannolikt en dubblett att
-- städa. Öpir 1:s stenlänkar upplöser redan (via remap) — här berikas bara ristarfälten.
update public.carvers set
  region = 'Uppland',
  gender = 'male',
  is_professional = true,
  description = 'Öpir (ybiR / ØpiR) — den mest produktiva av de sena uppländska runristarna, verksam i östra Uppland kring 1000-talets slut och 1100-talets början (stilgrupperna Pr 4 till Pr 5, sen Urnesstil). Behandlad i egen monografi av Åhlén (1997). Källström räknar med två ristare med namnet Öpir: denna uppländske mästare samt en lokalt verksam ristare i Södermanland (se Öpir 2, signaturen på Sö 11). Öpir använde ofta verbet ráða (réð) och lät ibland någon annan utföra själva huggningen. Den föreslagna identifikationen med en kyrkans man (Sjöberg 1982) har inte accepterats av runologerna.',
  source_ref = 'Åhlén, M. (1997). Runristaren Öpir: En monografi, Runrön 12; Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).'
where id = '2a1cf645-91fa-47a6-b904-5b8b56b95fb3';

update public.carvers set
  region = 'Södermanland',
  gender = 'male',
  is_professional = false,
  description = 'Öpir i Södermanland — en lokalt verksam ristare belagd genom signaturen på Sö 11, att skilja från den namnlika uppländske mästaren Öpir (se Öpir 1). Källström räknar med dessa två separata ristare med samma namn.',
  source_ref = 'Källström, M. (2007). Mästare och minnesmärken, Runrön 18 (DiVA).'
where id = '2f34f9f3-9f92-444d-af19-9587184451d9';
