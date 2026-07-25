-- Kvalitetssäkring: maktcentra som hittills BARA fanns som historical_events (inte
-- som platser). viking_cities är annars välfyllt (Hedeby/Ribe/York/Dublin/Kaupang/
-- Truso/Wolin/Novgorod/Kiev/Staraja Ladoga/Gnezdovo finns redan). Dessa tre saknades.
-- coordinates = native point(lng,lat). Idempotent på namn.

insert into viking_cities (name, coordinates, category, country, region, period_start, period_end, description, historical_significance)
select v.name, point(v.lng, v.lat), v.cat, v.country, v.region, v.ps, v.pe, v.descr, v.sig
from (values
  ('Konstantinopel', 28.9784, 41.0082, 'established_city', 'Bysantinska riket', 'Bosporen', 500, 1200,
   'Miklagård — Bysantinska rikets huvudstad och periodens största stad. Mål för väringarnas färder österut; väringagardet tjänade kejsaren. Ändpunkt för vägen från varjagerna till grekerna.',
   'Rikaste metropolen; väringagarde och handelsmål österut.'),
  ('Dorestad', 5.3400, 51.9700, 'trading_post', 'Nederländerna', 'Frisland', 650, 900,
   'Stort frisiskt-frankiskt emporium vid Rhen/Lek; en av nordvästra Europas viktigaste handelsplatser. Upprepade vikingaräder på 800-talet (bl.a. 834). Förebild för nordiska imitationsmynt (jfr Birka).',
   'Frisiskt storemporium; myntförebild och räd-mål.'),
  ('Paris', 2.3522, 48.8566, 'established_city', 'Frankrike', 'Île-de-France', 500, 1200,
   'Frankisk/karolingisk maktcentrum vid Seine. Belägrat och plundrat av vikingar (845, 885–886); den stora belägringen 885–886 blev en vändpunkt.',
   'Frankisk stad och maktcentrum; vikingabelägringar 845 och 885–886.')
) as v(name, lng, lat, cat, country, region, ps, pe, descr, sig)
where not exists (select 1 from viking_cities vc where vc.name = v.name);
