/**
 * Klinik Zaman Panosu: Önce hedefe göre durum, ardından açıklayıcı takvim ve dağılım.
 * Nabız İndigosu yalnızca yönlendirme/aktif durum için kullanılır; ritmi boşluklar kurar.
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

type Preferences = {
  dailyHours: number;
  useOfficialHolidays: boolean;
  leaveDates: string[];
};

const DEFAULT_PREFERENCES: Preferences = {
  dailyHours: 5.83,
  useOfficialHolidays: true,
  leaveDates: [],
};

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

function loadPreferences(): Preferences {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return DEFAULT_PREFERENCES;
    const saved = JSON.parse(value) as Partial<Preferences>;
    return { ...DEFAULT_PREFERENCES, ...saved };
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

  const calendarDays = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      const iso = toIsoDate(year, month, day);
      const date = new Date(year, month, day);
      const isSunday = date.getDay() === 0;
      const isOfficialHoliday = officialHolidays.has(iso);
      const isLeave = preferences.leaveDates.includes(iso);
      return { day, iso, isSunday, isOfficialHoliday, isLeave };
    });
  }, [year, month, officialHolidays, preferences.leaveDates]);

  const stats = useMemo(() => {
    const totalDays = calendarDays.length;
    const sundays = calendarDays.filter((day) => day.isSunday).length;
    const official = calendarDays.filter((day) => day.isOfficialHoliday && !day.isSunday).length;
    const leave = calendarDays.filter((day) => day.isLeave && !day.isSunday && !day.isOfficialHoliday).length;
    const workDays = totalDays - sundays - official - leave;
    const totalHours = workDays * preferences.dailyHours;
    return { totalDays, sundays, official, leave, workDays, totalHours };
  }, [calendarDays, preferences.dailyHours]);

  const leadingDays = useMemo(() => {
    const nativeDay = new Date(year, month, 1).getDay();
    return nativeDay === 0 ? 6 : nativeDay - 1;
  }, [year, month]);

  const selectedMonthLeaveDates = preferences.leaveDates.filter((date) => date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`));
  const hoursPerDay = preferences.dailyHours.toFixed(2).replace(".", ",");
  const totalHours = stats.totalHours.toFixed(2).replace(".", ",");
  const dayFormula = `${stats.totalDays} gün − ${stats.sundays} pazar − ${stats.official} resmî tatil${stats.leave ? ` − ${stats.leave} ek izin` : ""} = ${stats.workDays} çalışma günü`;

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
    toast.success(exists ? "Ek izin kaldırıldı" : "Ek izin eklendi", {
      description: formatDate(iso),
    });
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

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("worktime-pro-tr-theme", nextTheme ? "dark" : "light");
  };

  const exportCsv = () => {
    const rows = [
      ["Dönem", `${MONTHS[month]} ${year}`],
      ["Günlük çalışma saati", preferences.dailyHours.toFixed(2).replace(".", ",")],
      ["Hesaplama", `${stats.workDays} çalışma günü × ${preferences.dailyHours.toFixed(2).replace(".", ",")} saat`],
      ["Çalışma günü", stats.workDays],
      ["Planlanan saat", stats.totalHours.toFixed(2).replace(".", ",")],
      ["Pazar", stats.sundays],
      ["Resmî tatil", stats.official],
      ["Ek izin", stats.leave],
      [],
      ["Ek izin tarihleri"],
      ...selectedMonthLeaveDates.map((date) => [formatDate(date)]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `worktime-${year}-${String(month + 1).padStart(2, "0")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Aylık özet CSV olarak indirildi.");
  };

  const todayIso = toIsoDate(today.getFullYear(), today.getMonth(), today.getDate());
  const workAngle = Math.round((stats.workDays / Math.max(stats.totalDays, 1)) * 360);
  const sundayAngle = Math.round(((stats.sundays + stats.workDays) / Math.max(stats.totalDays, 1)) * 360);
  const holidayAngle = Math.round(((stats.sundays + stats.workDays + stats.official) / Math.max(stats.totalDays, 1)) * 360);

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
            <p>Seçtiğin ayda Pazarları ve tatilleri çıkar; kalan günlerin toplam çalışma süresini anında hesapla.</p>
          </div>

          <section className="settings-card" aria-labelledby="period-settings">
            <div className="section-title-row">
              <h2 id="period-settings">Dönem ve süre</h2>
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
              <span>Günlük çalışma saati</span>
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
            ) : <p className="empty-note">Takvimde çalışılabilir bir güne tıklayarak da ek izin ekleyebilirsin.</p>}
            <button className="text-action" onClick={resetMonthLeaves}><RotateCcw aria-hidden="true" size={14} /> Bu ayı temizle</button>
          </section>
        </aside>

        <section className="workspace" aria-label="Aylık çalışma planı">
          <section className="status-banner" aria-labelledby="status-heading">
            <img className="status-visual" src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031865770/wCJodkjVHWwywucd.png" alt="" />
            <div className="time-ruler" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="status-copy">
              <span className="eyebrow status-eyebrow"><span className="status-dot balanced" /> Hesaplama sonucu</span>
              <h2 id="status-heading">Aylık çalışma süresi</h2>
              <p>{dayFormula}</p>
              <div className="progress-meta"><span>Çalışma günü <strong>{stats.workDays}</strong></span><span>Günlük süre <strong>{hoursPerDay} sa</strong></span></div>
            </div>
            <div className="calculation-result" aria-label={`Toplam çalışma süresi ${totalHours} saat`}>
              <strong>{totalHours}</strong>
              <span>toplam saat</span>
              <small>{stats.workDays} gün × {hoursPerDay} sa</small>
            </div>
          </section>

          <section className="metrics-strip" aria-label="Aylık özet">
            <article className="metric-card primary-metric"><span>Çalışma günü</span><strong>{stats.workDays}</strong><small>Toplam {stats.totalDays} gün</small></article>
            <article className="metric-card"><span>Pazar</span><strong>{stats.sundays}</strong><small>Haftalık dinlenme</small></article>
            <article className="metric-card"><span>Resmi tatil</span><strong>{stats.official}</strong><small>{preferences.useOfficialHolidays ? "Hesaba dahil" : "Hesaba dahil değil"}</small></article>
            <article className="metric-card"><span>Ek izin</span><strong>{stats.leave}</strong><small>Seçili ayda</small></article>
          </section>

          <section className="analysis-layout">
            <article className="calendar-card">
              <div className="panel-heading calendar-heading">
                <div>
                  <span className="eyebrow"><CalendarDays aria-hidden="true" size={14} /> Ay görünümü</span>
                  <h2>{MONTHS[month]} <span>{year}</span></h2>
                </div>
                <div className="month-controls">
                  <button onClick={() => changeMonth(-1)} aria-label="Önceki ay"><ChevronLeft size={18} aria-hidden="true" /></button>
                  <button onClick={() => changeMonth(1)} aria-label="Sonraki ay"><ChevronRight size={18} aria-hidden="true" /></button>
                </div>
              </div>
              <div className="calendar-legend" aria-label="Takvim açıklaması">
                <span><i className="legend-work" /> Çalışma</span><span><i className="legend-sunday" /> Pazar</span><span><i className="legend-holiday" /> Resmi tatil</span><span><i className="legend-leave" /> Ek izin</span>
              </div>
              <div className="calendar-grid" role="grid" aria-label={`${MONTHS[month]} ${year} çalışma takvimi`}>
                {WEEK_DAYS.map((day) => <div role="columnheader" className="weekday" key={day}>{day}</div>)}
                {Array.from({ length: leadingDays }).map((_, index) => <span className="calendar-spacer" key={`leading-${index}`} aria-hidden="true" />)}
                {calendarDays.map((day) => {
                  const kind = day.isOfficialHoliday ? "holiday" : day.isSunday ? "sunday" : day.isLeave ? "leave" : "work";
                  const isToday = day.iso === todayIso;
                  const isSelectable = !day.isSunday && !day.isOfficialHoliday;
                  const description = day.isOfficialHoliday ? "Resmi tatil" : day.isSunday ? "Pazar" : day.isLeave ? "Ek izin, kaldırmak için tıkla" : "Çalışma günü, ek izin eklemek için tıkla";
                  return (
                    <button key={day.iso} className={`day-cell ${kind} ${isToday ? "today" : ""}`} onClick={() => isSelectable && toggleLeave(day.iso)} disabled={!isSelectable} role="gridcell" aria-label={`${formatDate(day.iso)}. ${description}`}>
                      <span>{day.day}</span>
                      <small>{day.isOfficialHoliday ? "Resmi" : day.isSunday ? "Pazar" : day.isLeave ? "İzin" : ""}</small>
                    </button>
                  );
                })}
              </div>
              <div className="calendar-tip"><Info aria-hidden="true" size={15} /> Çalışma gününe tıklayarak ek izin ekleyebilir veya kaldırabilirsin.</div>
            </article>

            <aside className="insight-column">
              <article className="distribution-card">
                <div className="panel-heading compact-heading"><div><span className="eyebrow">Gün dağılımı</span><h2>Zamanın ritmi</h2></div></div>
                <div className="donut-wrap">
                  <div className="donut" style={{ background: `conic-gradient(var(--chart-work) 0deg ${workAngle}deg, var(--chart-sunday) ${workAngle}deg ${sundayAngle}deg, var(--chart-holiday) ${sundayAngle}deg ${holidayAngle}deg, var(--chart-leave) ${holidayAngle}deg 360deg)` }}>
                    <div><strong>{stats.totalDays}</strong><span>gün</span></div>
                  </div>
                  <div className="distribution-list">
                    <span><i className="legend-work" /> Çalışma <b>{stats.workDays}</b></span>
                    <span><i className="legend-sunday" /> Pazar <b>{stats.sundays}</b></span>
                    <span><i className="legend-holiday" /> Resmi <b>{stats.official}</b></span>
                    <span><i className="legend-leave" /> İzin <b>{stats.leave}</b></span>
                  </div>
                </div>
                <Button variant="outline" className="export-button" onClick={exportCsv}><Download aria-hidden="true" size={16} /> CSV özeti indir</Button>
              </article>

              <article className="privacy-card">
                <div><span className="eyebrow"><Check aria-hidden="true" size={14} /> Yerelde saklanır</span><h2>Planın yalnızca bu cihazda kalır.</h2><p>Girdiğin ayarlar ve ek izinler tarayıcının yerel hafızasında saklanır.</p></div>
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031865770/mDHRGODkMNZgaLkb.png" alt="Takvim kartları ile yerel veri saklamayı anlatan soyut görsel" />
              </article>
            </aside>
          </section>

          <div className="data-note"><AlertCircle aria-hidden="true" size={16} /> Hareketli dini bayram günleri 2025–2030 veri setinde yer alır; farklı dönemlerde resmi kaynağı kontrol etmen önerilir.</div>
        </section>
      </main>
      <footer className="app-footer"><span>Çalışma Saati Hesaplayıcı</span><span>Aylık çalışma süresini hesaplar.</span></footer>
    </div>
  );
}
