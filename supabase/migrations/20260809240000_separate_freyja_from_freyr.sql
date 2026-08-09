-- Fröja/Frö-separation (källkritisk). element_keys NOT NULL → tom array {} vid avtaggning.
insert into ortnamn_element_config (element_key, include, category)
values ('fröja', true, 'sakralt') on conflict (element_key) do nothing;

-- (1) 'fröjd' (glädje) var FELtaggat som guden 'frö' (Fröjdadal/Fröjdegården/Fröjdenborg/Fröjds)
--     → avtagga (ej teofora; folketymologi-fälla).
update place_names
set element_keys = array_remove(element_keys, 'frö'), element_category = null, updated_at = now()
where lower(name) ~ '^fröjd' and 'frö' = any(element_keys);

-- (2) Fröje-/Fröja- (gen. Frøyju-) = plausibel Freyja (KVINNLIG) → 'fröja' (omtvistad).
--     Freyr (Frös-/Frö-) lämnas som 'frö'.
update place_names
set element_keys = array['fröja'], element_category = 'sakralt', updated_at = now()
where lower(name) ~ '^fröj[ae]' and lower(name) !~ '^fröjd';
