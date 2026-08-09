-- Lilla/Stora Frö (Öland) var otaggade: guden Frö står som HUVUDLED (efterled), missad av den
-- förled-förankrade matcharen. Tagga som 'frö' (Öland Frö-distrikt intill Fröbygårda/Frösslunda).
update place_names set element_keys = array['frö'], element_category = 'sakralt', updated_at = now()
where province ilike 'Öland' and name in ('Lilla Frö', 'Stora Frö')
  and (element_keys is null or array_length(element_keys,1) is null);
