-- Filolog-översättning av lit_intake till svenska — ENDAST OA (rättighetssäkert). Engelska = huvudspår;
-- svenska visas bara där *_sv finns (OA vi hunnit översätta). Applicerat via scripts.
alter table lit_intake add column if not exists title_sv text;
alter table lit_intake add column if not exists abstract_sv text;
alter table lit_intake add column if not exists translated_at timestamptz;
-- lit_recent/lit_for_query returnerar nu även title_sv/abstract_sv (drop+create pga ändrad returtyp).
-- Se scripts/data/translate-lit-oa.mjs (OpenRouter, körs i cron/CI där OPENROUTER_API_KEY finns).
