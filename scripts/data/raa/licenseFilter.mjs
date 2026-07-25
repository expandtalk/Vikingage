// Licensfilter för RAÄ K-samsök-bilder (spec 2026-07-25-raa-bildcorpus-ingest-design §3).
//
// Två vokabulär cirkulerar och licensversionen varierar per post → matcha på DELSTRÄNG,
// aldrig exakt sträng:
//   - RAÄ-internt:  kulturarvsdata.se/resurser/license#{pdmark|cc0|by|by-sa|by-nc|inc|...}
//   - Upplösta CC:  creativecommons.org/publicdomain/{zero,mark}/1.0/, /licenses/by/2.5/se/, ...
//
// Default-till-restriktivt: saknad/okänd licens → HOPPA ÖVER (RAÄ säger själva att märkning
// saknas på delar; anta aldrig fritt). BY-SA hamnar i egen bucket och hoppas över som default
// (ShareAlike smittar corpus-licensen nedström — separat beslut).

/**
 * @param {string|null|undefined} url  rå licens-URL (helst per-bild mediaLicenseUrl)
 * @returns {{keep:boolean, bucket:'pd'|'by'|'by-sa'|'restricted'|'unknown', attribution:boolean, raw:string|null}}
 */
export function classifyLicense(url) {
  const raw = url ?? null;
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return { keep: false, bucket: 'unknown', attribution: false, raw };
  }
  const u = raw.toLowerCase();

  // 1) Public domain / CC0 — fritt, ingen attribution.
  if (u.includes('publicdomain/zero') || u.includes('publicdomain/mark') ||
      u.includes('#cc0') || u.includes('#pdmark')) {
    return { keep: true, bucket: 'pd', attribution: false, raw };
  }

  // 2) Restriktivt FÖRST (before plain BY) — NC/ND/in-copyright smittar även om "by" finns i strängen.
  //    (#inc, #inc-ow-eu, #inc-edu = RAÄ "in copyright"; rightsstatements.org/…/InC*)
  if (/by-nc/.test(u) || /by-nd/.test(u) || u.includes('#inc') ||
      u.includes('rightsstatements.org') || u.includes('/inc')) {
    return { keep: false, bucket: 'restricted', attribution: false, raw };
  }

  // 3) BY-SA — egen bucket, default HOPPA ÖVER (ShareAlike).
  if (/by-sa/.test(u) || u.includes('#by-sa')) {
    return { keep: false, bucket: 'by-sa', attribution: true, raw };
  }

  // 4) Ren CC-BY (utan -nc/-nd/-sa) — BEHÅLL men attribuera.
  //    RAÄ-intern "#by" (exakt, ej "#by-*") eller CC "/licenses/by/<ver>/".
  if (/\/licenses\/by(\/|-\d|$)/.test(u) || /#by(?![a-z-])/.test(u)) {
    return { keep: true, bucket: 'by', attribution: true, raw };
  }

  // 5) Allt annat okänt → restriktivt default.
  return { keep: false, bucket: 'unknown', attribution: false, raw };
}
