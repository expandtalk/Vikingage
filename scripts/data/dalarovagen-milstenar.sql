-- Kurerade milstenar längs Dalarövägen (raa_type='milstolpe'), MED årtal.
-- Alla resta 1777 under landshövding J.J. Gyllenborg (källa: Wikipedia, Dalarövägen;
-- koordinater ur docs/vagar/vagar-bas.txt). Idempotent via ON CONFLICT (source_uri).
-- OBS: source_uri måste vara unik (uq_heritage_source_uri) → fragment per milsten.
insert into heritage_sites (raa_type, name, landscape, lat, lng, period, description, source_uri)
values
  ($q$milstolpe$q$,$q$Milsten Skogskyrkogården (Dalarövägen, ½ mil)$q$,$q$Södermanland$q$,59.27528,18.09556,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#skogskyrkogarden$q$),
  ($q$milstolpe$q$,$q$Milsten Perstorpsvägen (Dalarövägen, ¼ mil)$q$,$q$Södermanland$q$,59.25444,18.10722,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#perstorpsvagen$q$),
  ($q$milstolpe$q$,$q$Milsten Skogås (Dalarövägen)$q$,$q$Södermanland$q$,59.21778,18.14111,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#skogas$q$),
  ($q$milstolpe$q$,$q$Milsten Vega (Dalarövägen)$q$,$q$Södermanland$q$,59.19444,18.14083,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#vega$q$),
  ($q$milstolpe$q$,$q$Milsten Brandbergen (Dalarövägen, 2 mil)$q$,$q$Södermanland$q$,59.16417,18.17222,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#brandbergen$q$),
  ($q$milstolpe$q$,$q$Milsten Alby (Dalarövägen)$q$,$q$Södermanland$q$,59.14750,18.18028,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#alby$q$),
  ($q$milstolpe$q$,$q$Milsten Avfart Årsta havsbad (Dalarövägen)$q$,$q$Södermanland$q$,59.12750,18.19889,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#arstahavsbad$q$),
  ($q$milstolpe$q$,$q$Milsten Lännåker (Dalarövägen)$q$,$q$Södermanland$q$,59.12000,18.24028,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#lannaker$q$),
  ($q$milstolpe$q$,$q$Milsten Vaxnäs (Dalarövägen, 3 mil)$q$,$q$Södermanland$q$,59.11583,18.27472,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#vaxnas$q$),
  ($q$milstolpe$q$,$q$Milsten Dalarökanalen (Dalarövägen, 4 mil)$q$,$q$Södermanland$q$,59.13778,18.41556,$q$1777$q$,$q$Milsten längs Dalarövägen, rest 1777 under landshövding J.J. Gyllenborg.$q$,$q$https://sv.wikipedia.org/wiki/Dalarövägen#dalarokanalen$q$)
on conflict (source_uri) do nothing;
