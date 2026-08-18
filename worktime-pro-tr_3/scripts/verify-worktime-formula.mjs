import assert from "node:assert/strict";

const fixedHolidays = ["01-01", "04-23", "05-01", "05-19", "07-15", "08-30", "10-29"];
const movableHolidays = {
  2026: ["2026-03-19", "2026-03-20", "2026-03-21", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29"],
};

function isoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function calculate(year, month, dailyHours = 5.83) {
  const holidays = new Set([
    ...fixedHolidays.map((date) => `${year}-${date}`),
    ...(movableHolidays[year] ?? []),
  ]);
  const totalDays = new Date(year, month + 1, 0).getDate();
  let sundays = 0;
  let officialHolidays = 0;

  for (let day = 1; day <= totalDays; day += 1) {
    const iso = isoDate(year, month, day);
    const date = new Date(year, month, day);
    if (date.getDay() === 0) {
      sundays += 1;
    } else if (holidays.has(iso)) {
      officialHolidays += 1;
    }
  }

  const workDays = totalDays - sundays - officialHolidays;
  return { totalDays, sundays, officialHolidays, workDays, totalHours: Number((workDays * dailyHours).toFixed(2)) };
}

const cases = [
  { label: "Ağustos 2026", month: 7, expected: { totalDays: 31, sundays: 5, officialHolidays: 0, workDays: 26, totalHours: 151.58 } },
  { label: "Nisan 2026", month: 3, expected: { totalDays: 30, sundays: 4, officialHolidays: 1, workDays: 25, totalHours: 145.75 } },
  { label: "Mayıs 2026", month: 4, expected: { totalDays: 31, sundays: 5, officialHolidays: 6, workDays: 20, totalHours: 116.6 } },
];

for (const testCase of cases) {
  const actual = calculate(2026, testCase.month);
  assert.deepEqual(actual, testCase.expected, `${testCase.label} formül sonucu beklenen değerle uyuşmuyor.`);
  console.log(`${testCase.label}: ${actual.workDays} gün × 5.83 saat = ${actual.totalHours} saat`);
}
