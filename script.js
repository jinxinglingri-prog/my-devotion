document.addEventListener("DOMContentLoaded", function () {

    const fields = [
        "bibleReference",
        "bibleText",
        "reflection",
        "response",
        "prayer",
        "learning"
    ];

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayKey = `${year}-${month}-${day}`;

    const dateString = today.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
    });

    document.getElementById("today").textContent = dateString;


    function getTodayData() {

        const data = {};

        fields.forEach(function (field) {

            const element = document.getElementById(field);

            if (element) {
                data[field] = element.value;
            }

        });

        return data;
    }


    function loadTodayData() {

        const saved = localStorage.getItem("devotion-" + todayKey);

        if (!saved) {
            return;
        }

        const data = JSON.parse(saved);

        fields.forEach(function (field) {

            const element = document.getElementById(field);

            if (element && data[field] !== undefined) {
                element.value = data[field];
            }

        });
    }


    function saveTodayData() {

        const data = getTodayData();

        localStorage.setItem(
            "devotion-" + todayKey,
            JSON.stringify(data)
        );

        const message = document.getElementById("message");

        if (message) {
            message.textContent =
                "✓ 今天的灵修已经保存。";
        }
    }


    document
        .getElementById("saveButton")
        .addEventListener("click", saveTodayData);


    loadTodayData();

});
