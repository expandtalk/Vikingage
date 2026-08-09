-- Stäng (del av) taggnings-gapet i Ångermanland: tagga otaggade namn på igenkännbara
-- topografiska/bebyggelse-efterled. Deterministiskt (suffix-förankrat), endast där element_keys
-- är tomt. Element-fakta för böle/ånger ur Svenskt ortnamnslexikon (SOL 2003, SOFI); övriga
-- transparenta naturord. Baslinje/kontroll-led. Resultat: 1577 -> 1090 otaggade (~487 taggade).
do $$
declare
  steps text[][] := array[
    array['böle','böle$|byle$','bebyggelse'],
    array['ånger','ånger$','kust_hamn'],
    array['näs','näs$','kust_hamn'],
    array['vik','viken?$','kust_hamn'],
    array['sjö','sjön?$','natur'],
    array['fors','fors(en)?$','natur'],
    array['träsk','träsk(et)?$','natur'],
    array['backe','backe[nr]?$','natur'],
    array['berg','berget?$','natur'],
    array['bäck','bäcken?$','natur'],
    array['holm','holmen?$','natur'],
    array['dal','dalen?$','natur'],
    array['mark','marken?$','natur'],
    array['mo','mon?$','natur'],
    array['ås','åsen?$','natur'],
    array['by','by$','bebyggelse']
  ];
  s text[];
begin
  foreach s slice 1 in array steps loop
    update place_names
      set element_keys = array[s[1]], element_category = s[3], updated_at = now()
    where province ilike '%ngermanland%'
      and (element_keys is null or array_length(element_keys,1) is null)
      and lower(name) ~ ('(' || s[2] || ')');
  end loop;
end $$;
