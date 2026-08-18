/**
 * Çalışma Saati Hesaplayıcı: Hedef süre ile gerçekleşen mesaiyi aynı zaman ekseninde karşılaştırır.
 * Nabız İndigosu yalnızca eylem ve hedef için; turkuaz gerçekleşen çalışma, amber tatil, mercan fark için kullanılır.
 */
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Info,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  Trash2,
  Umbrella,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const WEEK_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const MOVABLE_HOLIDAYS: Record<number, string[]> = {
  2025: ["2025-03-30", "2025-03-31", "2025-04-01", "2025-06-06", "2025-06-07", "2025-06-08", "2025-06-09"],
  2026: ["2026-03-19", "2026-03-20", "2026-03-21", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29"],
  2027: ["2027-03-09", "2027-03-10", "2027-03-11", "2027-05-16", "2027-05-17", "2027-05-18", "2027-05-19"],
  2028: ["2028-02-26", "2028-02-27", "2028-02-28", "2028-05-05", "2028-05-06", "2028-05-07", "2028-05-08"],
  2029: ["2029-02-14", "2029-02-15", "2029-02-16", "2029-04-24", "2029-04-25", "2029-04-26", "2029-04-27"],
  2030: ["2030-02-03", "2030-02-04", "2030-02-05", "2030-04-13", "2030-04-14", "2030-04-15", "2030-04-16"],
};

const FIXED_HOLIDAYS = ["01-01", "04-23", "05-01", "05-19", "07-15", "08-30", "10-29"];
const STORAGE_KEY = "worktime-pro-tr-preferences";

type WorkStatus = "worked" | "off" | "sick";
type WorkLog = { status: WorkStatus; hours: number };
type CalendarDay = {
  day: number;
  iso: string;
  isSunday: boolean;
  isOfficialHoliday: boolean;
  isLeave: boolean;
  log?: WorkLog;
};

type Preferences = {
  dailyHours: number;
  useOfficialHolidays: boolean;
  leaveDates: string[];
  workLogs: Record<string, WorkLog>;
};

const DEFAULT_PREFERENCES: Preferences = {
  dailyHours: 5.83,
  useOfficialHolidays: true,
  leaveDates: [],
  workLogs: {},
};

const WORK_STATUS = {
  worked: { label: "Çalıştım", shortLabel: "Çalışıldı", description: "Gerçekleşen saat toplamına eklenir." },
  off: { label: "Çalışmadım", shortLabel: "Çalışılmadı", description: "Saat toplamına eklenmez." },
  sick: { label: "Raporluydum", shortLabel: "Rapor", description: "Saat toplamına eklenmez." },
} satisfies Record<WorkStatus, { label: string; shortLabel: string; description: string }>;

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getOfficialHolidays(year: number) {
  return new Set([
    ...FIXED_HOLIDAYS.map((date) => `${year}-${date}`),
    ...(MOVABLE_HOLIDAYS[year] ?? []),
  ]);
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(year, month - 1, day),
  );
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(
    Math.round(value * 100) / 100,
  );
}

function loadPreferences(): Preferences {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return DEFAULT_PREFERENCES;
    const saved = JSON.parse(value) as Partial<Preferences>;
    const workLogs = saved.workLogs && typeof saved.workLogs === "object" ? saved.workLogs : {};
    return { ...DEFAULT_PREFERENCES, ...saved, workLogs };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export default function Home() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [leaveDraft, setLeaveDraft] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [entryStatus, setEntryStatus] = useState<WorkStatus>("worked");
  const [entryHours, setEntryHours] = useState(String(DEFAULT_PREFERENCES.dailyHours));

  useEffect(() => {
    setPreferences(loadPreferences());
    const savedTheme = localStorage.getItem("worktime-pro-tr-theme") === "dark";
    setIsDark(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const officialHolidays = useMemo(
    () => (preferences.useOfficialHolidays ? getOfficialHolidays(year) : new Set<string>()),
    [preferences.useOfficialHolidays, year],
  );

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      const iso = toIsoDate(year, month, day);
      const date = new Date(year, month, day);
      return {
        day,
        iso,
        isSunday: date.getDay() === 0,
        isOfficialHoliday: officialHolidays.has(iso),
        isLeave: preferences.leaveDates.includes(iso),
        log: preferences.workLogs[iso],
      };
    });
  }, [year, month, officialHolidays, preferences.leaveDates, preferences.workLogs]);

  const targetStats = useMemo(() => {
    const totalDays = calendarDays.length;
    const sundays = calendarDays.filter((day) => day.isSunday).length;
    const official = calendarDays.filter((day) => day.isOfficialHoliday && !day.isSunday).length;
    const leave = calendarDays.filter((day) => day.isLeave && !day.isSunday && !day.isOfficialHoliday).length;
    const workDays = totalDays - sundays - official - leave;
    const totalHours = workDays * preferences.dailyHours;
    return { totalDays, sundays, official, leave, workDays, totalHours };
  }, [calendarDays, preferences.dailyHours]);

  const actualStats = useMemo(() => {
    const loggedDays = calendarDays.filter((day) => day.log);
    const workedDays = loggedDays.filter((day) => day.log?.status === "worked");
    const offDays = loggedDays.filter((day) => day.log?.status === "off").length;
    const sickDays = loggedDays.filter((day) => day.log?.status === "sick").length;
    const totalHours = workedDays.reduce((sum, day) => sum + (day.log?.hours ?? 0), 0);
    const difference = totalHours - targetStats.totalHours;
    return { loggedDays: loggedDays.length, workedDays: workedDays.length, offDays, sickDays, totalHours, difference };
  }, [calendarDays, targetStats.totalHours]);

  const leadingDays = useMemo(() => {
    const nativeDay = new Date(year, month, 1).getDay();
    return nativeDay === 0 ? 6 : nativeDay - 1;
  }, [year, month]);

  const selectedMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const selectedMonthLeaveDates = preferences.leaveDates.filter((date) => date.startsWith(selectedMonthPrefix));
  const hoursPerDay = formatDecimal(preferences.dailyHours);
  const targetHours = formatDecimal(targetStats.totalHours);
  const actualHours = formatDecimal(actualStats.totalHours);
  const differenceHours = formatDecimal(Math.abs(actualStats.difference));
  const dayFormula = `${targetStats.totalDays} gün − ${targetStats.sundays} pazar − ${targetStats.official} resmî tatil${targetStats.leave ? ` − ${targetStats.leave} ek izin` : ""} = ${targetStats.workDays} çalışma günü`;
  const comparisonState = Math.abs(actualStats.difference) < 0.01 ? "balanced" : actualStats.difference > 0 ? "over" : "under";
  const comparisonLabel = comparisonState === "balanced" ? "Hedefe ulaştın" : comparisonState === "over" ? "Fazla mesai" : "Eksik mesai";
  const comparisonDescription = actualStats.loggedDays === 0
    ? "Takvimden gün seçerek gerçekleşen mesaini kaydet."
    : comparisonState === "balanced"
      ? "Gerçekleşen çalışma süren hedefle aynı."
      : comparisonState === "over"
        ? `Hedefinin ${differenceHours} saat üzerindesin.`
        : `Hedefine ${differenceHours} saat kaldı.`;
  const actualProgress = targetStats.totalHours > 0 ? Math.min((actualStats.totalHours / targetStats.totalHours) * 100, 100) : 0;

  const updatePreferences = (changes: Partial<Preferences>) => {
    setPreferences((current) => ({ ...current, ...changes }));
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth());
  };

  const toggleLeave = (iso: string) => {
    const exists = preferences.leaveDates.includes(iso);
    updatePreferences({
      leaveDates: exists ? preferences.leaveDates.filter((date) => date !== iso) : [...preferences.leaveDates, iso].sort(),
    });
    toast.success(exists ? "Ek izin kaldırıldı" : "Ek izin eklendi", { description: formatDate(iso) });
  };

  const addLeave = () => {
    if (!leaveDraft) {
      toast.error("Önce bir tarih seçin.");
      return;
    }
    const date = new Date(`${leaveDraft}T12:00:00`);
    const isSunday = date.getDay() === 0;
    const isOfficial = officialHolidays.has(leaveDraft);
    if (isSunday || isOfficial) {
      toast.error("Seçilen gün zaten çalışma dışı.", { description: isSunday ? "Pazar günü ek izin gerektirmez." : "Resmi tatil ek izin olarak işaretlenemez." });
      return;
    }
    if (preferences.leaveDates.includes(leaveDraft)) {
      toast.message("Bu tarih zaten ek izin olarak işaretli.");
      return;
    }
    updatePreferences({ leaveDates: [...preferences.leaveDates, leaveDraft].sort() });
    toast.success("Ek izin eklendi", { description: formatDate(leaveDraft) });
    setLeaveDraft("");
  };

  const resetMonthLeaves = () => {
    if (!selectedMonthLeaveDates.length) {
      toast.message("Bu ay için temizlenecek ek izin yok.");
      return;
    }
    updatePreferences({ leaveDates: preferences.leaveDates.filter((date) => !selectedMonthLeaveDates.includes(date)) });
    toast.success("Seçili ayın ek izinleri temizlendi.");
  };

  const openWorkLog = (day: CalendarDay) => {
    setSelectedDay(day);
    setEntryStatus(day.log?.status ?? "worked");
    setEntryHours(String(day.log?.hours ?? preferences.dailyHours));
  };

  const saveWorkLog = () => {
    if (!selectedDay) return;
    const parsedHours = Math.max(0, Math.min(24, Number(entryHours) || 0));
    if (entryStatus === "worked" && parsedHours <= 0) {
      toast.error("Çalışılan gün için 0’dan büyük bir saat girin.");
      return;
    }
    updatePreferences({
      workLogs: {
        ...preferences.workLogs,
        [selectedDay.iso]: { status: entryStatus, hours: entryStatus === "worked" ? parsedHours : 0 },
      },
    });
    toast.success("Günlük mesai kaydedildi", { description: `${formatDate(selectedDay.iso)} · ${WORK_STATUS[entryStatus].label}` });
    setSelectedDay(null);
  };

  const clearWorkLog = () => {
    if (!selectedDay || !preferences.workLogs[selectedDay.iso]) return;
    const nextLogs = { ...preferences.workLogs };
    delete nextLogs[selectedDay.iso];
    updatePreferences({ workLogs: nextLogs });
    toast.success("Günlük mesai kaydı silindi", { description: formatDate(selectedDay.iso) });
    setSelectedDay(null);
  };

  const resetMonthWorkLogs = () => {
    const monthLogKeys = Object.keys(preferences.workLogs).filter((date) => date.startsWith(selectedMonthPrefix));
    if (!monthLogKeys.length) {
      toast.message("Bu ay için temizlenecek mesai kaydı yok.");
      return;
    }
    const nextLogs = { ...preferences.workLogs };
    monthLogKeys.forEach((date) => delete nextLogs[date]);
    updatePreferences({ workLogs: nextLogs });
    toast.success("Seçili ayın mesai kayıtları temizlendi.");
  };

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("worktime-pro-tr-theme", nextTheme ? "dark" : "light");
  };

  const exportCsv = () => {
    const recordedRows = calendarDays
      .filter((day) => day.log)
      .map((day) => [formatDate(day.iso), WORK_STATUS[day.log!.status].label, day.log!.status === "worked" ? formatDecimal(day.log!.hours) : "0"]);
    const rows = [
      ["Dönem", `${MONTHS[month]} ${year}`],
      ["Günlük hedef süre", `${hoursPerDay} saat`],
      ["Hedef hesaplama", dayFormula],
      ["Hedef saat", targetHours],
      ["Gerçekleşen saat", actualHours],
      ["Mesai farkı", formatDecimal(actualStats.difference)],
      ["Kayıtlı çalışma günü", actualStats.workedDays],
      ["Pazar", targetStats.sundays],
      ["Resmî tatil", targetStats.official],
      ["Ek izin", targetStats.leave],
      [],
      ["Günlük gerçekleşen kayıtlar", "Durum", "Saat"],
      ...recordedRows,
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `calisma-saati-${year}-${String(month + 1).padStart(2, "0")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Mesai özeti CSV olarak indirildi.");
  };

  const todayIso = toIsoDate(today.getFullYear(), today.getMonth(), today.getDate());
  const workAngle = Math.round((targetStats.workDays / Math.max(targetStats.totalDays, 1)) * 360);
  const sundayAngle = Math.round(((targetStats.sundays + targetStats.workDays) / Math.max(targetStats.totalDays, 1)) * 360);
  const holidayAngle = Math.round(((targetStats.sundays + targetStats.workDays + targetStats.official) / Math.max(targetStats.totalDays, 1)) * 360);

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#main-content" aria-label="Çalışma Saati Hesaplayıcı ana içeriğe geç">
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031865770/yPeeyMQsjYHAXGtI.png" alt="" className="brand-mark" />
          <span>
            <strong>Çalışma Saati Hesaplayıcı</strong>
            <small>Türkiye için aylık hesaplama</small>
          </span>
        </a>
        <div className="topbar-actions">
          <span className="period-pill"><CalendarDays aria-hidden="true" size={15} /> {MONTHS[month]} {year}</span>
          <Button variant="outline" size="icon" className="theme-button" onClick={toggleTheme} aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"} aria-pressed={isDark}>
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </Button>
        </div>
      </header>

      <main id="main-content" className="workbench">
        <aside className="control-rail" aria-label="Hesaplama ayarları">
          <div className="rail-heading">
            <span className="eyebrow"><Clock3 aria-hidden="true" size={14} /> Çalışma saati hesaplayıcı</span>
            <h1>Çalışma saatini,<br /><i>anında hesapla.</i></h1>
            <p>Planlanan hedefini hesapla; takvimden çalıştığın günleri kaydederek gerçekleşen mesaini karşılaştır.</p>
          </div>

          <section className="settings-card" aria-labelledby="period-settings">
            <div className="section-title-row">
              <h2 id="period-settings">Dönem ve hedef</h2>
              <span className="thin-rule" />
            </div>
            <div className="field-grid field-grid-period">
              <label>
                <span>Yıl</span>
                <input type="number" min="2025" max="2030" value={year} onChange={(event) => setYear(Math.min(2030, Math.max(2025, Number(event.target.value) || today.getFullYear())))} />
              </label>
              <label>
                <span>Ay</span>
                <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                  {MONTHS.map((monthName, index) => <option value={index} key={monthName}>{monthName}</option>)}
                </select>
              </label>
            </div>
            <label className="full-field">
              <span>Günlük hedef saat</span>
              <div className="unit-input">
                <input type="number" min="0.25" max="24" step="0.01" value={preferences.dailyHours} onChange={(event) => updatePreferences({ dailyHours: Math.max(0.25, Math.min(24, Number(event.target.value) || 0.25)) })} />
                <span>sa</span>
              </div>
            </label>
            <label className="switch-row">
              <input type="checkbox" checked={preferences.useOfficialHolidays} onChange={(event) => updatePreferences({ useOfficialHolidays: event.target.checked })} />
              <span className="switch-track" aria-hidden="true"><span /></span>
              <span><strong>Resmi tatilleri dahil et</strong><small>Türkiye için ön tanımlı tatil günleri</small></span>
            </label>
          </section>

          <section className="settings-card leave-card" aria-labelledby="leave-title">
            <div className="section-title-row">
              <h2 id="leave-title"><Umbrella aria-hidden="true" size={16} /> Ek izinler</h2>
              {selectedMonthLeaveDates.length > 0 && <span className="count-chip">{selectedMonthLeaveDates.length}</span>}
            </div>
            <div className="leave-form">
              <label className="sr-only" htmlFor="leave-date">Ek izin tarihi</label>
              <input id="leave-date" type="date" value={leaveDraft} onChange={(event) => setLeaveDraft(event.target.value)} />
              <Button size="icon" onClick={addLeave} aria-label="Ek izin ekle"><Plus size={18} aria-hidden="true" /></Button>
            </div>
            {selectedMonthLeaveDates.length ? (
              <ul className="leave-list" aria-label="Seçili ayın ek izinleri">
                {selectedMonthLeaveDates.map((date) => (
                  <li key={date}>
                    <span><span className="leave-dot" /> {formatDate(date)}</span>
                    <button onClick={() => toggleLeave(date)} aria-label={`${formatDate(date)} iznini kaldır`}><Trash2 size={15} aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
            ) : <p className="empty-note">Hedef hesaplamasından düşmek istediğin çalışılabilir günleri ekleyebilirsin.</p>}
            <button className="text-action" onClick={resetMonthLeaves}><RotateCcw aria-hidden="true" size={14} /> Bu ayın izinlerini temizle</button>
          </section>
        </aside>

        <section className="workspace" aria-label="Aylık çalışma ve mesai özeti">
          <section className="status-banner" aria-labelledby="status-heading">
            <img className="status-visual" src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031865770/wCJodkjVHWwywucd.png" alt="" />
            <div className="time-ruler" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="status-copy">
              <span className="eyebrow status-eyebrow"><span className="status-dot balanced" /> Aylık hedef</span>
              <h2 id="status-heading">Planlanan çalışma süresi</h2>
              <p>{dayFormula}</p>
              <div className="progress-meta"><span>Hedef gün <strong>{targetStats.workDays}</strong></span><span>Günlük süre <strong>{hoursPerDay} sa</strong></span></div>
            </div>
            <div className="calculation-result" aria-label={`Toplam hedef süre ${targetHours} saat`}>
              <strong>{targetHours}</strong>
              <span>hedef saat</span>
              <small>{targetStats.workDays} gün × {hoursPerDay} sa</small>
            </div>
          </section>

          <section className="comparison-panel" aria-labelledby="comparison-heading">
            <div className="comparison-copy">
              <span className="eyebrow"><Clock3 aria-hidden="true" size={14} /> Gerçekleşen mesai</span>
              <h2 id="comparison-heading">Hedef ile gerçekleşeni karşılaştır.</h2>
              <p>{comparisonDescription}</p>
              <button className="text-action comparison-reset" onClick={resetMonthWorkLogs}><RotateCcw aria-hidden="true" size={14} /> Bu ayın mesai kayıtlarını temizle</button>
            </div>
            <div className="comparison-data">
              <div className="comparison-stat"><span>Hedef</span><strong>{targetHours}<small>sa</small></strong><em>{targetStats.workDays} hedef gün</em></div>
              <div className="comparison-stat actual"><span>Gerçekleşen</span><strong>{actualHours}<small>sa</small></strong><em>{actualStats.workedDays} çalışılan gün</em></div>
              <div className={`comparison-stat difference ${comparisonState}`}><span>{comparisonLabel}</span><strong>{comparisonState === "balanced" ? "0" : differenceHours}<small>sa</small></strong><em>{actualStats.loggedDays} günlük kayıt</em></div>
            </div>
            <div className="comparison-progress" aria-label={`Hedefin yüzde ${Math.round(actualProgress)} kadarı gerçekleşti`}><span style={{ width: `${actualProgress}%` }} /></div>
          </section>

          <section className="metrics-strip" aria-label="Aylık hedef ve gerçekleşen özet">
            <article className="metric-card primary-metric"><span>Hedef gün</span><strong>{targetStats.workDays}</strong><small>{targetStats.totalDays} gün içinden</small></article>
            <article className="metric-card actual-metric"><span>Çalışılan gün</span><strong>{actualStats.workedDays}</strong><small>{actualStats.loggedDays} kayıt girildi</small></article>
            <article className="metric-card"><span>Pazar</span><strong>{targetStats.sundays}</strong><small>Haftalık dinlenme</small></article>
            <article className="metric-card"><span>Resmi tatil</span><strong>{targetStats.official}</strong><small>{targetStats.leave} ek izin</small></article>
          </section>

          <section className="analysis-layout">
            <article className="calendar-card">
              <div className="panel-heading calendar-heading">
                <div>
                  <span className="eyebrow"><CalendarDays aria-hidden="true" size={14} /> Günlük kayıt</span>
                  <h2>{MONTHS[month]} <span>{year}</span></h2>
                </div>
                <div className="month-controls">
                  <button onClick={() => changeMonth(-1)} aria-label="Önceki ay"><ChevronLeft size={18} aria-hidden="true" /></button>
                  <button onClick={() => changeMonth(1)} aria-label="Sonraki ay"><ChevronRight size={18} aria-hidden="true" /></button>
                </div>
              </div>
              <div className="calendar-legend" aria-label="Takvim açıklaması">
                <span><i className="legend-work" /> Hedef günü</span><span><i className="legend-actual" /> Çalışıldı</span><span><i className="legend-sunday" /> Pazar</span><span><i className="legend-holiday" /> Resmi tatil</span><span><i className="legend-leave" /> Ek izin</span>
              </div>
              <div className="calendar-grid" role="grid" aria-label={`${MONTHS[month]} ${year} günlük çalışma takvimi`}>
                {WEEK_DAYS.map((day) => <div role="columnheader" className="weekday" key={day}>{day}</div>)}
                {Array.from({ length: leadingDays }).map((_, index) => <span className="calendar-spacer" key={`leading-${index}`} aria-hidden="true" />)}
                {calendarDays.map((day) => {
                  const logStatus = day.log?.status;
                  const kind = logStatus === "worked" ? "logged-work" : logStatus === "off" ? "logged-off" : logStatus === "sick" ? "logged-sick" : day.isOfficialHoliday ? "holiday" : day.isSunday ? "sunday" : day.isLeave ? "leave" : "work";
                  const isToday = day.iso === todayIso;
                  const dayNote = day.log
                    ? day.log.status === "worked" ? `${formatDecimal(day.log.hours)} sa` : WORK_STATUS[day.log.status].shortLabel
                    : day.isOfficialHoliday ? "Resmi" : day.isSunday ? "Pazar" : day.isLeave ? "İzin" : "";
                  const dayDescription = day.log
                    ? `${WORK_STATUS[day.log.status].label}${day.log.status === "worked" ? `, ${formatDecimal(day.log.hours)} saat` : ""}. Düzenlemek için tıkla.`
                    : "Günlük mesai kaydı eklemek için tıkla.";
                  return (
                    <button key={day.iso} className={`day-cell ${kind} ${isToday ? "today" : ""}`} onClick={() => openWorkLog(day)} role="gridcell" aria-label={`${formatDate(day.iso)}. ${dayDescription}`}>
                      <span>{day.day}</span>
                      <small>{dayNote}</small>
                    </button>
                  );
                })}
              </div>
              <div className="calendar-tip"><Info aria-hidden="true" size={15} /> Bir gün seçerek çalışılan saatini, çalışmadığın günü veya rapor kaydını ekleyebilirsin.</div>
            </article>

            <aside className="insight-column">
              <article className="distribution-card">
                <div className="panel-heading compact-heading"><div><span className="eyebrow">Hedef gün dağılımı</span><h2>Zamanın ritmi</h2></div></div>
                <div className="donut-wrap">
                  <div className="donut" style={{ background: `conic-gradient(var(--chart-work) 0deg ${workAngle}deg, var(--chart-sunday) ${workAngle}deg ${sundayAngle}deg, var(--chart-holiday) ${sundayAngle}deg ${holidayAngle}deg, var(--chart-leave) ${holidayAngle}deg 360deg)` }}>
                    <div><strong>{targetStats.totalDays}</strong><span>gün</span></div>
                  </div>
                  <div className="distribution-list">
                    <span><i className="legend-work" /> Hedef <b>{targetStats.workDays}</b></span>
                    <span><i className="legend-actual" /> Gerçekleşen <b>{actualStats.workedDays}</b></span>
                    <span><i className="legend-sunday" /> Pazar <b>{targetStats.sundays}</b></span>
                    <span><i className="legend-holiday" /> Tatil <b>{targetStats.official}</b></span>
                    <span><i className="legend-leave" /> İzin <b>{targetStats.leave}</b></span>
                  </div>
                </div>
                <Button variant="outline" className="export-button" onClick={exportCsv}><Download aria-hidden="true" size={16} /> Mesai özetini CSV indir</Button>
              </article>

              <article className="privacy-card">
                <div><span className="eyebrow"><Check aria-hidden="true" size={14} /> Yerelde saklanır</span><h2>Planın ve günlük kayıtların yalnızca bu cihazda kalır.</h2><p>Hedef ayarların, ek izinlerin ve gerçekleşen mesai kayıtların tarayıcının yerel hafızasında saklanır.</p></div>
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031865770/mDHRGODkMNZgaLkb.png" alt="Takvim kartları ile yerel veri saklamayı anlatan soyut görsel" />
              </article>
            </aside>
          </section>

          <div className="data-note"><AlertCircle aria-hidden="true" size={16} /> Hareketli dini bayram günleri 2025–2030 veri setinde yer alır; farklı dönemlerde resmi kaynağı kontrol etmen önerilir.</div>
        </section>
      </main>
      <footer className="app-footer"><span>Çalışma Saati Hesaplayıcı</span><span>Aylık hedef ve gerçekleşen mesaini karşılaştırır.</span></footer>

      <Dialog open={Boolean(selectedDay)} onOpenChange={(open) => { if (!open) setSelectedDay(null); }}>
        <DialogContent className="work-log-dialog">
          <DialogHeader>
            <DialogTitle>Günlük mesai kaydı</DialogTitle>
            <DialogDescription>{selectedDay ? formatDate(selectedDay.iso) : ""}</DialogDescription>
          </DialogHeader>
          <div className="work-log-form">
            <label>
              <span>Günlük durum</span>
              <select value={entryStatus} onChange={(event) => setEntryStatus(event.target.value as WorkStatus)}>
                {Object.entries(WORK_STATUS).map(([value, meta]) => <option value={value} key={value}>{meta.label}</option>)}
              </select>
              <small>{WORK_STATUS[entryStatus].description}</small>
            </label>
            {entryStatus === "worked" && (
              <label>
                <span>Gerçekleşen çalışma saati</span>
                <div className="unit-input">
                  <input type="number" min="0.25" max="24" step="0.25" value={entryHours} onChange={(event) => setEntryHours(event.target.value)} autoFocus />
                  <span>sa</span>
                </div>
              </label>
            )}
            {selectedDay && (selectedDay.isSunday || selectedDay.isOfficialHoliday || selectedDay.isLeave) && (
              <p className="work-log-note">Bu gün hedef hesabının dışında. Çalışma kaydı eklersen gerçekleşen mesaiye dahil edilir.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={clearWorkLog} disabled={!selectedDay?.log}>Kaydı sil</Button>
            <Button onClick={saveWorkLog}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
