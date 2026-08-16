-- Ortnamns-språkskikt-specen (fas 1): språkligt ursprung + verksamhetskategori per namnled.
-- Språk och tid är SKILDA axlar (period_stratum finns redan). Etymologi = källbelagd (interpretations).
alter table public.ortnamn_element_config add column if not exists language_origin text;
alter table public.ortnamn_element_config add column if not exists activity_category text;
comment on column public.ortnamn_element_config.language_origin is 'pie/proto_norse/old_norse/low_german/latin/sami/finnic/baltic/slavic/unknown — källbelagt via ortnamn_element_interpretations';
comment on column public.ortnamn_element_config.activity_category is 'shipbuilding/seafaring/trade/defence/cult/agriculture/administration/communication/topographic/personal_name';
