-- inscription_features: applicerade förslag från AI-runolog (granskade, människa-i-loopen) för
-- Eriksgatan i Uppland (Bollaert 2016, Bilaga 2.1). Källa Rundata (våra transkriptioner). Belagt =
-- mekaniskt läsbart ur transkriptionen; hypotes = dubbelläsning (| |-markör kräver SRD-verifiering),
-- goðan-epitet (stående epitet, ej handlingsnekrolog), rekonstruerat ristarnamn, samt poetisk fras
-- (kräver Hübler-gruppering). U 747 (fragment) + U 748 (tom text) gav inga features.
INSERT INTO inscription_features (inscription_id, feature_type, feature_value, status, source, note)
SELECT ri.id, v.ft, v.fv, v.st, v.src, v.note
FROM runic_inscriptions ri
JOIN (VALUES
 ('Sö 175','flerstensmonument','merki þessi','belagt','Rundata','merki þisa (plural); korskontroll Bollaert 2016'),
 ('Sö 175','poetisk','reflekterande fras','hypotes','Rundata','Satt er þat sem sagt var…; kräver Hübler-gruppering'),
 ('Sö 328','flerstensmonument','steina þessa','belagt','Rundata','stina þasi (plural)'),
 ('Sö 328','familjerelation','faðir; bóndi','belagt','Rundata','faþur sin + buanta asu'),
 ('U 744','familjerelation','bóndi; sonr','belagt','Rundata','boanta sin + sun kuþuaukaʀ'),
 ('U 744','ristarformel','Balli','belagt','Rundata','bali risti stn'),
 ('U 744','nekrolog','bodde i Harvistaðir','belagt','Rundata','auk byki i haruistam'),
 ('U 744','dubbellasning','byki-i','hypotes','Rundata','delad runa; bekräfta SRD-konvention/foto'),
 ('U 745','familjerelation','bróðir','belagt','Rundata','bruþur (läst text, sten förlorad)'),
 ('U 749','familjerelation','faðir (pl.); bróðir (pl.)','belagt','Rundata','feþr sina + bryþr halfanar'),
 ('U 750','familjerelation','bróðir','belagt','Rundata','broþur sin'),
 ('U 750','ristarformel','Balli','belagt','Rundata','bali risti'),
 ('U 751','familjerelation','faðir','belagt','Rundata','faþur sin'),
 ('U 751','nekrolog','goðan-epitet','hypotes','Rundata','faþur sin koþan; stående epitet, ej handlingsnekrolog'),
 ('U 775','ristarformel','Tíðkumi','belagt','Rundata','tiþkumi risti runaʀ þis'),
 ('U 792','familjerelation','faðir; mágr','belagt','Rundata','faþur sin + mah sin'),
 ('U 792','nekrolog','förvärvade gods i Grikkland','belagt','Rundata','fé aflaði út í Grikkium arfa sínum; korskontroll Bollaert 2016'),
 ('U 793','familjerelation','bóndi','belagt','Rundata','buonta sin'),
 ('U 793','boneformel','Guð hjalpi ǫnd hans','belagt','Rundata','kuþ hialbi at hans'),
 ('U 859','familjerelation','bóndi','belagt','Rundata','uanta sin'),
 ('U 859','boneformel','Guð hjalpi ǫnd','belagt','Rundata','kuþ hialbi hont'),
 ('U 859','ristarformel','Ásmundr','belagt','Rundata','osmunrt risti runoʀ (Ásmundr Káresson)'),
 ('U 860','familjerelation','bóndi','belagt','Rundata','buanta sin'),
 ('U 860','boneformel','Guð + Guðs móðir (Maria)','belagt','Rundata','kuþ + kuþs muþiʀ'),
 ('U 860','dubbellasning','uk-kuþs','hypotes','Rundata','delad runa; bekräfta'),
 ('U 862','familjerelation','bróðir','belagt','Rundata','boroþur sin'),
 ('U 862','nekrolog','arfi (arvinge till Guðbjǫrn)','belagt','Rundata','han uas arfi kuþbiona-'),
 ('U 862','ristarformel','Véseti (rekonstruerad)','hypotes','Rundata','risti belagt, ristarnamnet rekonstruerat'),
 ('U 867','familjerelation','dóttir; faðir; verr','belagt','Rundata','totuʀ + faþur + uer sin'),
 ('U 867','boneformel','Guð létti sál þeira','belagt','Rundata','kuþ liti sal þaira'),
 ('U 871','familjerelation','bóndi','belagt','Rundata','kinlauhaʀ buanta'),
 ('U 871','ristarformel','Ásmundr','belagt','Rundata','in osmuntr hiu (hió=ristade)'),
 ('U 873','familjerelation','faðir; bóndi','belagt','Rundata','faþur sin + boanta ikuʀ'),
 ('U 873','boneformel','Guð hjalpi sál hans','belagt','Rundata','kuþ hielbi sal hans'),
 ('U 873','ristarformel','Balli','belagt','Rundata','bali risi stan þinsa'),
 ('U 873','nekrolog','goðan-epitet','hypotes','Rundata','faþur sin koþan; stående epitet'),
 ('U 879','familjerelation','faðir','belagt','Rundata','faþur sin'),
 ('U 901','familjerelation','faðir','belagt','Rundata','faþur si…'),
 ('U 901','boneformel','hjalpi ǫnd hans','belagt','Rundata','hialbi ont hos (subjektet Guð delvis förlorat)'),
 ('U 901','dubbellasning','uk-kirua','hypotes','Rundata','delad runa; bekräfta'),
 ('U 903','familjerelation','bróðir (pl.); sonr (pl.)','belagt','Rundata','bruþr sina + suniʀ hukals'),
 ('U 904','familjerelation','faðir','belagt','Rundata','faþur sin'),
 ('U 904','dubbellasning','uk-karl','hypotes','Rundata','delad runa; bekräfta')
) AS v(signum, ft, fv, st, src, note) ON ri.signum = v.signum
WHERE NOT EXISTS (SELECT 1 FROM inscription_features f
  WHERE f.inscription_id=ri.id AND f.feature_type=v.ft AND coalesce(f.feature_value,'')=coalesce(v.fv,''));
