import assert from "node:assert/strict";

function calculateActual(targetHours, logs) {
  const workedLogs = Object.values(logs).filter((log) => log.status === "worked");
  const actualHours = workedLogs.reduce((sum, log) => sum + log.hours, 0);
  const difference = actualHours - targetHours;
  return { actualHours, difference, workedDays: workedLogs.length, loggedDays: Object.keys(logs).length };
}

const targetHours = 26 * 5.83;
assert.equal(targetHours.toFixed(2), "151.58", "Ağustos 2026 hedefi 151,58 saat olmalı");

const partialMonth = calculateActual(targetHours, {
  "2026-08-03": { status: "worked", hours: 8 },
  "2026-08-04": { status: "worked", hours: 7.5 },
  "2026-08-05": { status: "off", hours: 0 },
  "2026-08-06": { status: "sick", hours: 0 },
});

assert.deepEqual(partialMonth, {
  actualHours: 15.5,
  difference: -136.08,
  workedDays: 2,
  loggedDays: 4,
}, "Yalnızca çalışılan günlerin saati gerçekleşen toplamda yer almalı");

const targetMatched = calculateActual(16, {
  "2026-08-03": { status: "worked", hours: 8 },
  "2026-08-04": { status: "worked", hours: 8 },
});

assert.equal(targetMatched.difference, 0, "Hedefe eşit gerçekleşen süre dengede olmalı");
console.log("Günlük mesai karşılaştırma senaryoları doğrulandı.");
