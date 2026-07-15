/* charts.js */

let workChart = null;

function drawChart(workDays, sundays, officialHolidays, extraHolidays) {

    const canvas = document.getElementById("chart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (workChart) {

        workChart.destroy();

    }

    const total =
        workDays +
        sundays +
        officialHolidays +
        extraHolidays;

    workChart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [

                "Çalışma Günü",

                "Pazar",

                "Resmi Tatil",

                "Ek İzin"

            ],

            datasets: [

                {

                    data: [

                        workDays,

                        sundays,

                        officialHolidays,

                        extraHolidays

                    ],

                    backgroundColor: [

                        "#22c55e",

                        "#ef4444",

                        "#2563eb",

                        "#f59e0b"

                    ],

                    borderWidth: 0,

                    hoverOffset: 12

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "68%",

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        padding: 20,

                        usePointStyle: true,

                        pointStyle: "circle",

                        color: getTextColor()

                    }

                },

                tooltip: {

                    callbacks: {

                        label(context) {

                            const value = context.raw;

                            const percent =
                                ((value / total) * 100).toFixed(1);

                            return `${context.label}: ${value} gün (%${percent})`;

                        }

                    }

                }

            }

        }

    });

}

function getTextColor() {

    return document.body.classList.contains("dark")

        ? "#ffffff"

        : "#222222";

}