-- Rundata litteraturreferenser → runic_inscriptions.bibliography
-- Genererad ur rundata.sql (signum1='M'). Skriver ej över befintlig bibliografi.
-- 18 av 18 signum fick referenser.

INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x24a5e790057a4f9e94f981743eea71ec'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 1'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x24a5e790057a4f9e94f981743eea71ec'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x24a5e790057a4f9e94f981743eea71ec'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 1'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 1'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 10'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 11'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 11'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 12'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 12'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 13'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 13'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 14'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 14'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 15'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 16'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 17'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 17'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 18'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 2'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 2'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 3'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 3'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x24a5e790057a4f9e94f981743eea71ec'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 4'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x24a5e790057a4f9e94f981743eea71ec'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x24a5e790057a4f9e94f981743eea71ec'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 4'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 5'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 6'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 7'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 8'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 8'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 9'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x4e2d7abd047e4742a7b6dffdeea055a1'::bytea);
INSERT INTO object_source (objectid, sourceid)
SELECT ri.id, '\x6f86ba7cd53b445e8f611d46bb596121'::bytea FROM runic_inscriptions ri
WHERE ri.signum = 'M 9'
  AND EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea)
  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = '\x6f86ba7cd53b445e8f611d46bb596121'::bytea);
