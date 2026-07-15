/* calendar.js */

const calendar = document.getElementById("calendar");

const weekNames = [
    "Pzt",
    "Sal",
    "Çar",
    "Per",
    "Cum",
    "Cmt",
    "Paz"
];

function createWeekHeader() {

    calendar.innerHTML = "";

    weekNames.forEach(day => {

        const cell = document.createElement("div");

        cell.className = "week-header";

        cell.textContent = day;

        calendar.appendChild(cell);

    });

}

function renderCalendar(year, month, officialSet, extraSet) {

    createWeekHeader();

    const firstDay = new Date(year, month, 1);

    let start = firstDay.getDay();

    // JS: Pazar=0 → Pazartesi başlangıçlı takvim
    start = start === 0 ? 6 : start - 1;

    const lastDay =
        new Date(year, month + 1, 0).getDate();

    // Ayın başındaki boş kutular
    for (let i = 0; i < start; i++) {

        const empty = document.createElement("div");

        empty.className = "day empty";

        calendar.appendChild(empty);

    }

    const now = new Date();

    for (let day = 1; day <= lastDay; day++) {

        const box = document.createElement("div");

        box.className = "day";

        const date =
            new Date(year, month, day);

        const iso =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        if (date.getDay() === 0)
            box.classList.add("sunday");

        if (officialSet.has(iso))
            box.classList.add("holiday");

        if (extraSet.has(iso))
            box.classList.add("leave");

        if (
            now.getFullYear() === year &&
            now.getMonth() === month &&
            now.getDate() === day
        ) {
            box.classList.add("today");
        }

        const number = document.createElement("div");

        number.className = "day-number";

        number.textContent = day;

        box.appendChild(number);

        if (officialSet.has(iso)) {

            const badge = document.createElement("small");

            badge.textContent = "Resmi";

            box.appendChild(badge);

        }
        else if (extraSet.has(iso)) {

            const badge = document.createElement("small");

            badge.textContent = "İzin";

            box.appendChild(badge);

        }
        else if (date.getDay() === 0) {

            const badge = document.createElement("small");

            badge.textContent = "Pazar";

            box.appendChild(badge);

        }

        // Pazar veya resmi tatil olmayan günlere tıklayarak
        // ek izin ekleyip çıkarabilme
        if (date.getDay() !== 0 && !officialSet.has(iso)) {

            box.title = extraSet.has(iso)
                ? "Ek izni kaldırmak için tıkla"
                : "Ek izin olarak işaretlemek için tıkla";

            box.addEventListener("click", () => {

                if (typeof getExtraHolidays !== "function") return;

                if (getExtraHolidays().includes(iso)) {

                    removeExtraHoliday(iso);

                } else {

                    addExtraHoliday(iso);

                }

            });

        }

        calendar.appendChild(box);

    }

} 