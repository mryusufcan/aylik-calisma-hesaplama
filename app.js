/* app.js */

const yearInput = document.getElementById("year");
const monthInput = document.getElementById("month");
const officialHolidayCheck = document.getElementById("officialHoliday");
const dailyHourInput = document.getElementById("dailyHour");

const totalDaysLabel = document.getElementById("totalDays");
const sundayLabel = document.getElementById("sundayCount");
const officialLabel = document.getElementById("officialCount");
const extraLabel = document.getElementById("extraCount");
const workDayLabel = document.getElementById("workDay");
const workHourLabel = document.getElementById("workHour");
const monthTitle = document.getElementById("monthTitle");

const today = new Date();

yearInput.value = today.getFullYear();
monthInput.value = today.getMonth();

const monthNames = [
"Ocak","Şubat","Mart","Nisan",
"Mayıs","Haziran","Temmuz","Ağustos",
"Eylül","Ekim","Kasım","Aralık"
];

function pad(v){
    return String(v).padStart(2,"0");
}

function calculate(){

    const year = Number(yearInput.value);
    const month = Number(monthInput.value);

    monthTitle.textContent =
        monthNames[month] + " " + year;

    const totalDays =
        new Date(year,month+1,0).getDate();

    let sundayCount = 0;
    let officialCount = 0;
    let workDays = 0;

    const officialSet =
        new Set(
            officialHolidayCheck.checked
            ? getOfficialHolidays(year)
            : []
        );

    const extraSet =
        new Set(getExtraHolidays());

    for(let day=1; day<=totalDays; day++){

        const d =
            new Date(year,month,day);

        const iso =
            year + "-" +
            pad(month+1) + "-" +
            pad(day);

        if(d.getDay()===0){

            sundayCount++;
            continue;

        }

        if(officialSet.has(iso)){

            officialCount++;
            continue;

        }

        if(extraSet.has(iso)){

            continue;

        }

        workDays++;

    }

    const totalHour =
        workDays *
        parseFloat(dailyHourInput.value);

    totalDaysLabel.textContent =
        totalDays;

    sundayLabel.textContent =
        sundayCount;

    officialLabel.textContent =
        officialCount;

    extraLabel.textContent =
        getExtraHolidays().filter(x=>{

            const d=new Date(x);

            return d.getFullYear()===year &&
                   d.getMonth()===month;

        }).length;

    workDayLabel.textContent =
        workDays;

    workHourLabel.textContent =
        totalHour.toFixed(2);

    if(typeof renderCalendar==="function"){

        renderCalendar(
            year,
            month,
            officialSet,
            extraSet
        );

    }

    if(typeof drawChart==="function"){

        drawChart(
            workDays,
            sundayCount,
            officialCount,
            Number(extraLabel.textContent)
        );

    }

}

yearInput.addEventListener(
"input",
calculate
);

monthInput.addEventListener(
"change",
calculate
);

officialHolidayCheck.addEventListener(
"change",
calculate
);

dailyHourInput.addEventListener(
"input",
calculate
);

window.addEventListener(
"load",
calculate
);