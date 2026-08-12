-- Rätta bath_kind: 'naturbad' → 'utomhusbad' (naturbad klingar naturistbad). Tagga kända nakenbad
-- ur Aftonbladet/Momondo-listan som FAKTA (namn+kommun-disambiguerade, ej artikeltext). 8 säkra
-- träffar → nakenbad totalt 10. Saknas hos oss: Heden (Halmstad), Goda Hopp/Skarpe Nord (Varberg).
UPDATE public.experiences SET bath_kind='utomhusbad' WHERE bath_kind='naturbad';

UPDATE public.experiences SET bath_kind='nakenbad'
WHERE category='badplats' AND (
  (name='Lövnäsbadet' AND municipality='Nykvarn') OR
  (name='Pite Havsbad' AND municipality='Piteå') OR
  (name='Ribersborg' AND municipality='Malmö') OR
  (name='Trälhavet, Breviksbadet' AND municipality='Österåker') OR
  (name='Rullsand' AND municipality='Älvkarleby') OR
  (name='Lulviksbadet' AND municipality='Luleå') OR
  (name='Stora Amundön' AND municipality='Göteborg') OR
  (name='Almö' AND municipality='Ronneby')
);
