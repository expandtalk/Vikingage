-- Mörbylånga/södra Öland fornlämningar (RAÄ/FMIS, Daniels lista) → heritage_sites. Väst-korridorens
-- arkeologiska täthet. Verifierat nya (0 FMIS-id-träff i heritage_sites). TYP≠ÅLDER → period null.
-- Bårby borg (17:1) utelämnad (finns i swedish_hillforts). Idempotent på source_uri (FMIS-id).
begin;

insert into public.heritage_sites (raa_type, name, landscape, municipality, lat, lng, source_uri)
select v.typ, v.namn, 'Öland', 'Mörbylånga', v.lat, v.lng, v.fmis
from (values
  ('domarring','Mörbylånga 1:1 (stenkrets)',56.512458,16.436704,'FMIS 10084900010001'),
  ('domarring','Mörbylånga 1:2 (stenkrets)',56.513081,16.436746,'FMIS 10084900010002'),
  ('gravfält','Mörbylånga 2:1',56.510486,16.437517,'FMIS 10084900020001'),
  ('stensättning','Mörbylånga 6:1',56.506335,16.435502,'FMIS 10084900060001'),
  ('hällristning','Mörbylånga 12:1',56.504207,16.432602,'FMIS 10084900120001'),
  ('stensättning','Mörbylånga 13:1',56.502975,16.429418,'FMIS 10084900130001'),
  ('stensättning','Mörbylånga 13:2',56.502521,16.428848,'FMIS 10084900130002'),
  ('stensättning','Mörbylånga 13:4',56.502478,16.429075,'FMIS 10084900130004'),
  ('gravfält','Mörbylånga 14:1',56.501715,16.427992,'FMIS 10084900140001'),
  ('stensättning','Mörbylånga 15:1',56.500919,16.424024,'FMIS 10084900150001'),
  ('stensättning','Mörbylånga 15:2',56.500667,16.423890,'FMIS 10084900150002'),
  ('stensättning','Mörbylånga 16:1',56.500016,16.423406,'FMIS 10084900160001'),
  ('stensättning','Mörbylånga 19:1',56.501092,16.476693,'FMIS 10084900190001'),
  ('stensättning','Mörbylånga 19:2',56.501003,16.477070,'FMIS 10084900190002'),
  ('stensättning','Mörbylånga 19:3',56.501034,16.476593,'FMIS 10084900190003'),
  ('stensättning','Mörbylånga 19:4',56.500928,16.476678,'FMIS 10084900190004'),
  ('gravfält','Mörbylånga 22:1',56.506395,16.515567,'FMIS 10084900220001'),
  ('gravhägnad','Mörbylånga 22:2',56.506679,16.515221,'FMIS 10084900220002'),
  ('domarring','Trindhallarna (Mörbylånga 23:1, stenkrets)',56.482799,16.378234,'FMIS 10084900230001'),
  ('grav markerad av sten/block','Trindhallarna (Mörbylånga 23:2)',56.483062,16.378320,'FMIS 10084900230002'),
  ('grav markerad av sten/block','Trindhallarna (Mörbylånga 23:3)',56.483309,16.378356,'FMIS 10084900230003'),
  ('grav markerad av sten/block','Trindhallarna (Mörbylånga 23:4)',56.482449,16.378277,'FMIS 10084900230004'),
  ('gravfält','Risinge hög (Mörbylånga 24:1)',56.480666,16.394540,'FMIS 10084900240001'),
  ('grav markerad av sten/block','Mörbylånga 25:1',56.479801,16.394599,'FMIS 10084900250001'),
  ('stensättning','Mörbylånga 27:1',56.483103,16.394113,'FMIS 10084900270001'),
  ('stensättning','Mörbylånga 27:2',56.482884,16.394275,'FMIS 10084900270002'),
  ('stensättning','Mörbylånga 27:3',56.483143,16.394328,'FMIS 10084900270003'),
  ('stensättning','Mörbylånga 27:4',56.483004,16.394399,'FMIS 10084900270004'),
  ('gravfält','Mörbylånga 28:1',56.483775,16.396147,'FMIS 10084900280001'),
  ('grav markerad av sten/block','Mörbylånga 29:1',56.489377,16.396549,'FMIS 10084900290001'),
  ('hög','Mörbylånga 31:1',56.497869,16.385228,'FMIS 10084900310001'),
  ('grav markerad av sten/block','Mörbylånga 36:1',56.511223,16.395281,'FMIS 10084900360001'),
  ('grav markerad av sten/block','Mörbylånga 36:2',56.511189,16.395373,'FMIS 10084900360002'),
  ('grav markerad av sten/block','Mörbylånga 36:3',56.511356,16.395502,'FMIS 10084900360003'),
  ('grav markerad av sten/block','Mörbylånga 37:1',56.516302,16.388337,'FMIS 10084900370001'),
  ('grav markerad av sten/block','Mörbylånga 37:2',56.516579,16.388390,'FMIS 10084900370002'),
  ('grav markerad av sten/block','Mörbylånga 37:3',56.516522,16.388489,'FMIS 10084900370003'),
  ('grav markerad av sten/block','Mörbylånga 37:4',56.516232,16.388467,'FMIS 10084900370004'),
  ('stensättning','Mörbylånga 49:1',56.510783,16.459282,'FMIS 10084900490001'),
  ('stensättning','Mörbylånga 49:2',56.510816,16.459433,'FMIS 10084900490002'),
  ('hällristning','Mörbylånga 53:1',56.494754,16.464095,'FMIS 10084900530001'),
  ('hällristning','Mörbylånga 56:1',56.498915,16.446372,'FMIS 10084900560001'),
  ('hällristning','Mörbylånga 57:1',56.501169,16.454229,'FMIS 10084900570001'),
  ('grav markerad av sten/block','Mörbylånga 74:1',56.484043,16.395296,'FMIS 10084900740001'),
  ('grav markerad av sten/block','Mörbylånga 74:2',56.483980,16.395301,'FMIS 10084900740002'),
  ('stensättning','Mörbylånga 79:1',56.519733,16.512379,'FMIS 10084900790001'),
  ('stensättning','Mörbylånga 80:1',56.516808,16.506413,'FMIS 10084900800001'),
  ('stensättning','Ås 14:1 (Hingsthagen, stensättning m. hägn 42-48 m, S om Ottenby)',56.23106,16.40322,'Fornsök Ås 14:1'),
  ('hög','Grönhögen (Ventlinge 20:1, järnåldershög ~21 m, centrum i 1600-talsskans)',56.30000,16.29000,'Fornsök Ventlinge 20:1 (koord approximativ)')
) as v(typ, namn, lat, lng, fmis)
where not exists (select 1 from public.heritage_sites h where h.source_uri = v.fmis);

commit;
-- Kontroll: select raa_type, count(*) from heritage_sites where source_uri like 'FMIS 1008490%' group by 1;
