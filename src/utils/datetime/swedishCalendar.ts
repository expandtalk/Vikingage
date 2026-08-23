// Beräkningsbar svensk kalender — FAKTA, inte gissning. Allt här härleds deterministiskt ur
// dokumenterade regler (ingen inmatad lista som kan innehålla fel):
//   • Påsk: Meeus/Jones/Butcher "Anonymous Gregorian"-algoritm (standard, entydig).
//   • Allmänna helgdagar: lag (1989:253) om allmänna helgdagar — fasta + påskrelaterade + de
//     rörliga lördagsdagarna (midsommardagen, alla helgons dag).
//   • ISO-veckonummer: ISO 8601.
//   • Tidszonsoffset: härleds live ur Intl (DST-korrekt), aldrig hårdkodat.
//
// MEDVETEN LUCKA: namnsdagar finns INTE här. Namnsdagslistan (Svenska Akademiens almanacka,
// ~730 poster) är en specifik publicerad datamängd — den får INTE hittas på ur minnet (fel
// skulle smyga in). Den ska ingestas som verifierad data innan den visas.

/** Påskdagen (söndag) för ett givet år, i lokal tid. Anonymous Gregorian-algoritmen. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = mars, 4 = april
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

// Lördagen inom ett datumintervall (t.ex. midsommardagen 20–26 juni, alla helgons dag 31 okt–6 nov).
const saturdayInRange = (year: number, month0: number, dayFrom: number, dayTo: number): Date => {
  for (let day = dayFrom; day <= dayTo; day++) {
    const d = new Date(year, month0, day);
    if (d.getDay() === 6) return d; // lördag
  }
  return new Date(year, month0, dayFrom); // kan aldrig inträffa i ett 7-dagarsfönster
};

export interface Holiday {
  date: Date;
  name_sv: string;
  name_en: string;
  /** true = lagstadgad allmän helgdag; false = kulturellt viktig afton (de facto ledig, ej lagstadgad). */
  statutory: boolean;
}

// Lördagen i ett intervall som kan spänna över en månadsgräns (t.ex. alla helgons dag 31 okt–6 nov).
const saturdayInSpan = (days: Array<[number, number]>, year: number): Date => {
  for (const [m0, day] of days) {
    const d = new Date(year, m0, day);
    if (d.getDay() === 6) return d;
  }
  return new Date(year, days[0][0], days[0][1]);
};

/** Alla svenska allmänna helgdagar för ett år (+ de tre stora aftnarna, tydligt märkta). */
export function swedishHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);
  const midsummerDay = saturdayInRange(year, 5, 20, 26); // lördag 20–26 juni
  const allSaints = saturdayInSpan([[9, 31], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 6]], year);
  const list: Holiday[] = [
    { date: new Date(year, 0, 1), name_sv: 'Nyårsdagen', name_en: "New Year's Day", statutory: true },
    { date: new Date(year, 0, 6), name_sv: 'Trettondedag jul', name_en: 'Epiphany', statutory: true },
    { date: addDays(easter, -2), name_sv: 'Långfredagen', name_en: 'Good Friday', statutory: true },
    { date: easter, name_sv: 'Påskdagen', name_en: 'Easter Sunday', statutory: true },
    { date: addDays(easter, 1), name_sv: 'Annandag påsk', name_en: 'Easter Monday', statutory: true },
    { date: new Date(year, 4, 1), name_sv: 'Första maj', name_en: 'May Day', statutory: true },
    { date: addDays(easter, 39), name_sv: 'Kristi himmelsfärds dag', name_en: 'Ascension Day', statutory: true },
    { date: addDays(easter, 49), name_sv: 'Pingstdagen', name_en: 'Whit Sunday', statutory: true },
    { date: new Date(year, 5, 6), name_sv: 'Sveriges nationaldag', name_en: 'National Day of Sweden', statutory: true },
    { date: addDays(midsummerDay, -1), name_sv: 'Midsommarafton', name_en: "Midsummer's Eve", statutory: false },
    { date: midsummerDay, name_sv: 'Midsommardagen', name_en: 'Midsummer Day', statutory: true },
    { date: allSaints, name_sv: 'Alla helgons dag', name_en: "All Saints' Day", statutory: true },
    { date: new Date(year, 11, 24), name_sv: 'Julafton', name_en: 'Christmas Eve', statutory: false },
    { date: new Date(year, 11, 25), name_sv: 'Juldagen', name_en: 'Christmas Day', statutory: true },
    { date: new Date(year, 11, 26), name_sv: 'Annandag jul', name_en: 'Boxing Day', statutory: true },
    { date: new Date(year, 11, 31), name_sv: 'Nyårsafton', name_en: "New Year's Eve", statutory: false },
  ];
  return list.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Nästa helgdag från och med dagens datum (söker innevarande + nästa år). */
export function nextHoliday(now: Date): { holiday: Holiday; daysUntil: number } | null {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const candidates = [...swedishHolidays(now.getFullYear()), ...swedishHolidays(now.getFullYear() + 1)];
  for (const h of candidates) {
    const hd = new Date(h.date.getFullYear(), h.date.getMonth(), h.date.getDate());
    const days = Math.round((hd.getTime() - today.getTime()) / 86400000);
    if (days >= 0) return { holiday: h, daysUntil: days };
  }
  return null;
}

/** ISO 8601-veckonummer. */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // sön = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // torsdagen i veckan
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** UTC-offset i minuter för en IANA-tidszon vid ett givet ögonblick (DST-korrekt, via Intl). */
export function tzOffsetMinutes(now: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = dtf.formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asUTC = Date.UTC(+map.year, +map.month - 1, +map.day, +map.hour % 24, +map.minute, +map.second);
  return Math.round((asUTC - now.getTime()) / 60000);
}

/** Kalenderdatum (YYYY-MM-DD) i en tidszon — för "Idag/Igår/Imorgon"-jämförelse mellan zoner. */
export function ymdInZone(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
