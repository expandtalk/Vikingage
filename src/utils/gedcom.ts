// Klientsidig GEDCOM-parser för släktforskningssidan. Läser personer + platser.
// Ingen data lämnar webbläsaren — används bara för att slå upp PUBLIKA socknar på kartan.

export interface GPerson {
  id: string; name: string; sex: string;
  birt: { date?: string; plac?: string };
  deat: { date?: string; plac?: string };
}

export function parseGedcom(text: string): GPerson[] {
  const persons: GPerson[] = [];
  let rec: GPerson | null = null; let l1: string | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const m = raw.match(/^\s*(\d+)\s+(@[^@]+@\s+)?(\S+)(?:\s(.*))?$/);
    if (!m) continue;
    const lvl = +m[1], xref = m[2] ? m[2].trim() : null, tag = m[3], val = (m[4] || '').trim();
    if (lvl === 0) {
      if (rec) persons.push(rec);
      rec = null; l1 = null;
      if (tag === 'INDI' && xref) rec = { id: xref, name: '', sex: '', birt: {}, deat: {} };
    } else if (rec) {
      if (lvl === 1) {
        l1 = tag;
        if (tag === 'NAME') rec.name = val.replace(/\//g, '').replace(/\s+/g, ' ').trim();
        else if (tag === 'SEX') rec.sex = val;
      } else if (lvl === 2) {
        if (l1 === 'BIRT') { if (tag === 'DATE') rec.birt.date = val; if (tag === 'PLAC') rec.birt.plac = val; }
        else if (l1 === 'DEAT') { if (tag === 'DATE') rec.deat.date = val; if (tag === 'PLAC') rec.deat.plac = val; }
      }
    }
  }
  if (rec) persons.push(rec);
  return persons;
}

// GEDCOM-plats "Listerby, Blekinge, Sverige" → socken "Listerby".
export function parishOf(plac?: string): string | null {
  if (!plac) return null;
  const first = plac.split(',')[0].trim().replace(/\s*\(.*?\)\s*/g, '').trim();
  return first || null;
}

export function yearOf(s?: string): number | null {
  const m = (s || '').match(/\d{4}/); return m ? +m[0] : null;
}
