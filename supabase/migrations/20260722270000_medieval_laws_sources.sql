-- Litterära källor (task #5, del 1): medeltida landskapslagar + Alsnö stadga in i
-- historical_sources. Primary sources som dokumenterar fiscal_system-ramen (ledung,
-- Uppsala öd, frälse via Alsnö stadga). Fulltext (PD) kan läggas i source_texts senare.
DELETE FROM public.historical_sources WHERE work_type IN ('landskapslag','landslag','stadga','stadslag');
INSERT INTO public.historical_sources (title, title_en, author, written_year, covers_period_start, covers_period_end, reliability, language, work_type, description, bias_types) VALUES
 ('Äldre Västgötalagen','Older Westrogothic Law','Okänd',1220,1000,1280,'primary','Fornsvenska','landskapslag','Sveriges äldsta bevarade lag (Västergötland). Kungaval, ledung, böter, kyrkobalk.','{political_legitimacy,christian_anti_pagan}'),
 ('Upplandslagen','Law of Uppland','Okänd',1296,1100,1350,'primary','Fornsvenska','landskapslag','Upplands lag (1296). Kungsbalk, jordabalk, ledung; hundare-organisationen och Uppsala öd.','{political_legitimacy}'),
 ('Södermannalagen','Law of Södermanland','Okänd',1327,1100,1350,'primary','Fornsvenska','landskapslag','Södermanlands lag.','{political_legitimacy}'),
 ('Östgötalagen','Law of Östergötland','Okänd',1290,1100,1350,'primary','Fornsvenska','landskapslag','Östergötlands lag.','{political_legitimacy,christian_anti_pagan}'),
 ('Västmannalagen','Law of Västmanland','Okänd',1320,1100,1350,'primary','Fornsvenska','landskapslag','Västmanlands lag.','{political_legitimacy}'),
 ('Hälsingelagen','Hälsingland Law','Okänd',1320,1100,1360,'primary','Fornsvenska','landskapslag','Nämner de sex kungsgårdarna i Norrland (skatteuppbörd längs Norrstigen).','{political_legitimacy}'),
 ('Dalalagen','Law of Dalarna','Okänd',1300,1100,1350,'primary','Fornsvenska','landskapslag','Västmanna-Dalalagen.','{political_legitimacy}'),
 ('Gutalagen','Gotlandic Law','Okänd',1220,1000,1350,'primary','Forngutniska','landskapslag','Gotlands särpräglade lag.','{political_legitimacy}'),
 ('Skånelagen','Scanian Law','Okänd',1210,1000,1350,'primary','Fornöstnordiska','landskapslag','Skånes lag (då danskt).','{political_legitimacy,christian_anti_pagan}'),
 ('Magnus Erikssons landslag','King Magnus Erikssons Law of the Realm','Okänd',1350,1300,1442,'primary','Fornsvenska','landslag','Första rikstäckande landslagen (~1350).','{political_legitimacy}'),
 ('Alsnö stadga','Statute of Alsnö','Magnus Ladulås',1280,1275,1350,'primary','Fornsvenska','stadga','Grundade frälset (skattefrihet mot rusttjänst) — frälse vs skatte vs krono.','{political_legitimacy}'),
 ('Bjärköarätten','The Bjärköa Law','Okänd',1350,1200,1400,'primary','Fornsvenska','stadslag','Äldsta svenska stadslagen.','{political_legitimacy}');
