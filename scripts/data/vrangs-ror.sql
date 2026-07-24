-- Vrangs rör — bronsåldersröse utpekat som Landamäris 4:e gränslandmärke "i Vraksnäs"
-- (Sverige–Danmark ~1050). FMIS: "Vrangs rör, Röse", Femsjö sn (Hylte), Småland/Halland-gräns.
-- Koord ur FMIS (56.84909, 13.28118). ÄRLIGT: det är RÖSET (landmärket), den exakta
-- gränsstenen är olokaliserad — röset vid Vraksnäs-näset tjänade som strategiskt gränsmärke.
insert into heritage_sites (raa_type, name, landscape, municipality, lat, lng, description, source_uri)
values (
  $q$gränsmärke$q$,
  $q$Vrangs rör (Vraksnäs, Landamäri #4)$q$,
  $q$Småland$q$,
  $q$Hylte$q$,
  56.84909, 13.28118,
  $q$Mäktigt bronsåldersröse vid gammal vägsträckning nära Fylleån (Simlångsdalen–Femsjö). Utpekat som landmärket vid Landamäris fjärde gränsmärke "i Vraksnäs" (Sverige–Danmark ~1050). Den exakta gränsstenen är olokaliserad; röset (vid Vraksnäs-näset i f.d. sjön Stora Frillen) tjänade som det strategiska gränsmärket — jfr att även andra Landamäri-märken utgörs av rösen vid gamla ridvägar. Lämningstyp: Röse. KANDIDAT/landmärke, ej stenen själv.$q$,
  $q$https://kulturarvsdata.se/raa/lamning/ddfeed0b-fcc9-42a8-bbf3-c35f91cc3e1d$q$
)
on conflict (source_uri) do nothing;
