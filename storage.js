/* storage.js */

const Storage = {

    KEY: "worktimepro",

    defaults: {
        theme: "light",
        dailyHour: 5.83,
        extraHolidays: []
    },

    read() {

        try {

            const json = localStorage.getItem(this.KEY);

            if (!json) return structuredClone(this.defaults);

            return {
                ...structuredClone(this.defaults),
                ...JSON.parse(json)
            };

        } catch {

            return structuredClone(this.defaults);

        }

    },

    write(data) {

        localStorage.setItem(
            this.KEY,
            JSON.stringify(data)
        );

    }

};

let AppData = Storage.read();

function saveData() {

    Storage.write(AppData);

}

function getExtraHolidays() {

    return AppData.extraHolidays;

}

function addExtraHoliday(date) {

    if (!AppData.extraHolidays.includes(date)) {

        AppData.extraHolidays.push(date);

        AppData.extraHolidays.sort();

        saveData();

        renderHolidayList();

        if (typeof calculate === "function") {

            calculate();

        }

    }

}

function removeExtraHoliday(date) {

    AppData.extraHolidays =
        AppData.extraHolidays.filter(x => x !== date);

    saveData();

    renderHolidayList();

    if (typeof calculate === "function") {

        calculate();

    }

}

function renderHolidayList() {

    const list = document.getElementById("holidayList");

    list.innerHTML = "";

    if (AppData.extraHolidays.length === 0) {

        list.innerHTML =
            "<li>Henüz ek izin eklenmedi.</li>";

        return;

    }

    AppData.extraHolidays.forEach(date => {

        const li = document.createElement("li");

        const span = document.createElement("span");

        span.textContent = formatDate(date);

        const btn = document.createElement("button");

        btn.className = "remove";

        btn.innerHTML = "✕";

        btn.onclick = () => removeExtraHoliday(date);

        li.appendChild(span);

        li.appendChild(btn);

        list.appendChild(li);

    });

}

function formatDate(date) {

    const d = new Date(date);

    return d.toLocaleDateString("tr-TR");

}

function applyTheme() {

    if (AppData.theme === "dark") {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");

    }

}

function toggleTheme() {

    AppData.theme =
        AppData.theme === "dark"
            ? "light"
            : "dark";

    saveData();

    applyTheme();

}

document.addEventListener("DOMContentLoaded", () => {

    applyTheme();

    renderHolidayList();

    const daily = document.getElementById("dailyHour");

    if (daily) {

        daily.value = AppData.dailyHour;

        daily.addEventListener("change", () => {

            AppData.dailyHour =
                parseFloat(daily.value) || 5.83;

            saveData();

            if (typeof calculate === "function") {

                calculate();

            }

        });

    }

    const addButton =
        document.getElementById("addHoliday");

    if (addButton) {

        addButton.addEventListener("click", () => {

            const input =
                document.getElementById("holidayDate");

            if (!input.value) return;

            addExtraHoliday(input.value);

            input.value = "";

        });

    }

});