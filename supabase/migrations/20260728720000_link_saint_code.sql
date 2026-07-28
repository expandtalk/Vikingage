-- Länka kyrkornas patron_saint → saints.code via variantlistan (normaliserar genitiv/-kyrkan-röran).
-- 154/161 matchar. Omatchade = moderna icke-medeltida (syrisk-ortodoxa Adai/Anba/Sava/Efraim;
-- nykatolska Eugenia) + lokalhelgonet Ragnhild → filtrera medeltid via built_from.
alter table public.ecclesiastical_sites add column if not exists saint_code text;
update public.ecclesiastical_sites e set saint_code = s.code
  from public.saints s
 where e.patron_saint is not null
   and (e.patron_saint = any(s.variants) or lower(e.patron_saint) = s.code or e.patron_saint = s.name);
