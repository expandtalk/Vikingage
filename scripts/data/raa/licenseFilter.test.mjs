// Körs med: node scripts/data/raa/licenseFilter.test.mjs
import assert from 'node:assert/strict';
import { classifyLicense } from './licenseFilter.mjs';

const cases = [
  // [input, keep, bucket, attribution]
  ['https://creativecommons.org/publicdomain/zero/1.0/', true, 'pd', false],
  ['https://creativecommons.org/publicdomain/mark/1.0/', true, 'pd', false],
  ['http://kulturarvsdata.se/resurser/license#cc0', true, 'pd', false],
  ['http://kulturarvsdata.se/resurser/license#pdmark', true, 'pd', false],
  ['https://creativecommons.org/licenses/by/4.0/', true, 'by', true],
  ['https://creativecommons.org/licenses/by/2.5/se/', true, 'by', true],   // äldre versionerad
  ['http://kulturarvsdata.se/resurser/license#by', true, 'by', true],
  ['https://creativecommons.org/licenses/by-sa/4.0/', false, 'by-sa', true],
  ['http://kulturarvsdata.se/resurser/license#by-sa', false, 'by-sa', true],
  ['https://creativecommons.org/licenses/by-nc/4.0/', false, 'restricted', false],
  ['https://creativecommons.org/licenses/by-nc-sa/4.0/', false, 'restricted', false], // NC vinner över SA
  ['https://creativecommons.org/licenses/by-nd/4.0/', false, 'restricted', false],
  ['http://kulturarvsdata.se/resurser/license#inc', false, 'restricted', false],
  ['http://kulturarvsdata.se/resurser/license#inc-ow-eu', false, 'restricted', false],
  ['https://rightsstatements.org/vocab/InC/1.0/', false, 'restricted', false],
  [null, false, 'unknown', false],
  [undefined, false, 'unknown', false],
  ['', false, 'unknown', false],
  ['https://example.org/weird-license', false, 'unknown', false],
];

let pass = 0;
for (const [input, keep, bucket, attribution] of cases) {
  const r = classifyLicense(input);
  assert.equal(r.keep, keep, `keep for ${input}: got ${r.keep} (bucket ${r.bucket})`);
  assert.equal(r.bucket, bucket, `bucket for ${input}: got ${r.bucket}`);
  assert.equal(r.attribution, attribution, `attribution for ${input}: got ${r.attribution}`);
  pass++;
}
console.log(`✅ licenseFilter: ${pass}/${cases.length} fall OK`);
