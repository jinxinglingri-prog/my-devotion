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

    const todayElement = document.getElementById("today");

    if (todayElement) {
        todayElement.textContent = dateString;
    }


    // 读取今天的灵修

    function loadTodayData() {

        const saved =
            localStorage.getItem("devotion-" + todayKey);

        if (!saved) {
            return;
        }

        try {

            const data = JSON.parse(saved);

            fields.forEach(function (field) {

                const element =
                    document.getElementById(field);

                if (
                    element &&
                    data[field] !== undefined
                ) {
                    element.value = data[field];
                }

            });

        } catch (error) {

            console.error(
                "读取今天的灵修失败：",
                error
            );

        }
    }


    // 保存今天的灵修

    function saveTodayData() {

        const data = {};

        fields.forEach(function (field) {

            const element =
                document.getElementById(field);

            if (element) {
                data[field] = element.value;
            }

        });

        localStorage.setItem(
            "devotion-" + todayKey,
            JSON.stringify(data)
        );

        const message =
            document.getElementById("message");

        if (message) {

            message.textContent =
                "✓ 今天的灵修已经保存。";

        }

    }


    // 显示历史记录

    function showHistory() {

        const historyList =
            document.getElementById("historyList");

        if (!historyList) {
            return;
        }

        historyList.innerHTML = "";


        const records = [];


        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);

            if (
                key &&
                key.startsWith("devotion-")
            ) {

                const date =
                    key.replace(
                        "devotion-",
                        ""
                    );

                records.push(date);

            }

        }


        records.sort().reverse();


        if (records.length === 0) {

            historyList.innerHTML =
                "<p>还没有灵修记录。</p>";

            return;

        }


        records.forEach(function (date) {

            const saved =
                localStorage.getItem(
                    "devotion-" + date
                );

            let data = {};

            try {
                data = JSON.parse(saved);
            } catch (error) {
                data = {};
            }


            const item =
                document.createElement("div");

            item.className =
                "history-item";


            // 日期

            const dateElement =
                document.createElement("div");

            dateElement.className =
                "history-date";

            const dateObject =
                new Date(date + "T12:00:00");

            dateElement.textContent =
                dateObject.toLocaleDateString(
                    "zh-CN",
                    {
                        month: "long",
                        day: "numeric",
                        weekday: "long"
                    }
                );


            // 经文

            const bibleElement =
                document.createElement("div");

            bibleElement.className =
                "history-bible";

            bibleElement.textContent =
                data.bibleReference ||
                "还没有填写经文";


            // 领受预览

            const previewElement =
                document.createElement("div");

            previewElement.className =
                "history-preview";

            if (data.reflection) {

                let preview =
                    data.reflection.replace(
                        /\s+/g,
                        " "
                    );

                if (preview.length > 80) {
                    preview =
                        preview.substring(0, 80) +
                        "……";
                }

                previewElement.textContent =
                    preview;

            } else {

                previewElement.textContent =
                    "还没有记录今天的领受";

            }


            item.appendChild(dateElement);
            item.appendChild(bibleElement);
            item.appendChild(previewElement);


            item.addEventListener(
                "click",
                function () {

                    loadHistoryRecord(date);

                }
            );


            historyList.appendChild(item);

        });

    }


    // 打开某一天的灵修

    function loadHistoryRecord(date) {

        const saved =
            localStorage.getItem(
                "devotion-" + date
            );

        if (!saved) {
            return;
        }

        try {

            const data =
                JSON.parse(saved);


            fields.forEach(function (field) {

                const element =
                    document.getElementById(field);

                if (
                    element &&
                    data[field] !== undefined
                ) {

                    element.value =
                        data[field];

                }

            });


            const message =
                document.getElementById("message");

            if (message) {

                message.textContent =
                    "✓ 已打开 " + date + " 的灵修记录。";

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (error) {

            console.error(
                "读取历史记录失败：",
                error
            );

        }

    }


    // 保存按钮

    const saveButton =
        document.getElementById(
            "saveButton"
        );

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveTodayData
        );

    }


    // 历史记录按钮

    const historyButton =
        document.getElementById(
            "historyButton"
        );

    if (historyButton) {

        historyButton.addEventListener(
            "click",
            showHistory
        );

    }


    loadTodayData();

});
