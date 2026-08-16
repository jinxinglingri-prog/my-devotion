document.addEventListener("DOMContentLoaded", function () {

    const fields = [
        "bibleReference",
        "bibleText",
        "reflection",
        "response",
        "prayer",
        "learning"
    ];


    let calendarDate = new Date();

    let viewingDate = null;


    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    const todayKey =
        `${year}-${month}-${day}`;


    const dateString =
        today.toLocaleDateString(
            "zh-CN",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long"
            }
        );


    const todayElement =
        document.getElementById(
            "today"
        );


    if (todayElement) {

        todayElement.textContent =
            dateString;

    }



    // =========================
    // 清空编辑区域
    // =========================

    function clearFields() {

        fields.forEach(
            function (field) {

                const element =
                    document.getElementById(
                        field
                    );

                if (element) {

                    element.value = "";

                }

            }
        );

    }



    // =========================
    // 读取今天
    // =========================

    function loadTodayData() {

        viewingDate = null;


        const saved =
            localStorage.getItem(
                "devotion-" + todayKey
            );


        clearFields();


        if (!saved) {

            return;

        }


        try {

            const data =
                JSON.parse(saved);


            fields.forEach(
                function (field) {

                    const element =
                        document.getElementById(
                            field
                        );


                    if (
                        element &&
                        data[field] !== undefined
                    ) {

                        element.value =
                            data[field];

                    }

                }
            );


        } catch (error) {

            console.error(
                "读取今天的灵修失败：",
                error
            );

        }

    }



    // =========================
    // 保存今天
    // =========================

    function saveTodayData() {

        if (
            viewingDate !== null
        ) {

            const message =
                document.getElementById(
                    "message"
                );


            if (message) {

                message.textContent =
                    "⚠️ 你正在查看历史记录，请先点击“返回今天”。";

            }


            return;

        }


        const data = {};


        fields.forEach(
            function (field) {

                const element =
                    document.getElementById(
                        field
                    );


                if (element) {

                    data[field] =
                        element.value;

                }

            }
        );


        localStorage.setItem(
            "devotion-" + todayKey,
            JSON.stringify(data)
        );


        const message =
            document.getElementById(
                "message"
            );


        if (message) {

            message.textContent =
                "✓ 今天的灵修已经保存。";

        }


        renderCalendar();

    }



    // =========================
    // 显示历史
    // =========================

    function showHistory() {

        const historyList =
            document.getElementById(
                "historyList"
            );


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
                key.startsWith(
                    "devotion-"
                )
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


        if (
            records.length === 0
        ) {

            historyList.innerHTML =
                "<p>还没有灵修记录。</p>";


            return;

        }


        records.forEach(
            function (date) {

                const saved =
                    localStorage.getItem(
                        "devotion-" + date
                    );


                let data = {};


                try {

                    data =
                        JSON.parse(saved);

                } catch (error) {

                    data = {};

                }


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "history-item";


                const dateElement =
                    document.createElement(
                        "div"
                    );


                dateElement.className =
                    "history-date";


                const dateObject =
                    new Date(
                        date +
                        "T12:00:00"
                    );


                dateElement.textContent =
                    dateObject.toLocaleDateString(
                        "zh-CN",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long"
                        }
                    );


                const bibleElement =
                    document.createElement(
                        "div"
                    );


                bibleElement.className =
                    "history-bible";


                bibleElement.textContent =
                    data.bibleReference ||
                    "还没有填写经文";


                const previewElement =
                    document.createElement(
                        "div"
                    );


                previewElement.className =
                    "history-preview";


                if (
                    data.reflection
                ) {

                    let preview =
                        data.reflection.replace(
                            /\s+/g,
                            " "
                        );


                    if (
                        preview.length > 80
                    ) {

                        preview =
                            preview.substring(
                                0,
                                80
                            ) +
                            "……";

                    }


                    previewElement.textContent =
                        preview;


                } else {

                    previewElement.textContent =
                        "还没有记录今天的领受";

                }


                item.appendChild(
                    dateElement
                );

                item.appendChild(
                    bibleElement
                );

                item.appendChild(
                    previewElement
                );


                item.addEventListener(
                    "click",
                    function () {

                        loadHistoryRecord(
                            date
                        );

                    }
                );


                historyList.appendChild(
                    item
                );

            }
        );

    }



    // =========================
    // 打开历史记录
    // =========================

    function loadHistoryRecord(
        date
    ) {

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


            viewingDate = date;


            fields.forEach(
                function (field) {

                    const element =
                        document.getElementById(
                            field
                        );


                    if (
                        element &&
                        data[field] !== undefined
                    ) {

                        element.value =
                            data[field];

                    }

                }
            );


            const message =
                document.getElementById(
                    "message"
                );


            if (message) {

                message.textContent =
                    "📖 正在查看 " +
                    date +
                    " 的灵修记录";

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



    // =========================
    // 返回今天
    // =========================

    function returnToToday() {

        loadTodayData();


        const message =
            document.getElementById(
                "message"
            );


        if (message) {

            message.textContent =
                "✨ 已返回今天，可以继续写灵修了。";

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }



    // =========================
    // 日历
    // =========================

    function renderCalendar() {

        const calendar =
            document.getElementById(
                "calendar"
            );


        const title =
            document.getElementById(
                "calendarTitle"
            );


        if (
            !calendar ||
            !title
        ) {

            return;

        }


        calendar.innerHTML = "";


        const calendarYear =
            calendarDate.getFullYear();


        const calendarMonth =
            calendarDate.getMonth();


        title.textContent =
            `${calendarYear}年${calendarMonth + 1}月`;


        const firstDay =
            new Date(
                calendarYear,
                calendarMonth,
                1
            );


        const lastDay =
            new Date(
                calendarYear,
                calendarMonth + 1,
                0
            );


        let startDay =
            firstDay.getDay();


        if (
            startDay === 0
        ) {

            startDay = 7;

        }


        for (
            let i = 1;
            i < startDay;
            i++
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "calendar-day empty";


            calendar.appendChild(
                empty
            );

        }


        for (
            let calendarDay = 1;
            calendarDay <= lastDay.getDate();
            calendarDay++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "calendar-day";


            const dateKey =
                `${calendarYear}-${String(
                    calendarMonth + 1
                ).padStart(2, "0")}-${String(
                    calendarDay
                ).padStart(2, "0")}`;


            const number =
                document.createElement(
                    "span"
                );


            number.className =
                "calendar-number";


            number.textContent =
                calendarDay;


            cell.appendChild(
                number
            );


            if (
                localStorage.getItem(
                    "devotion-" + dateKey
                )
            ) {

                const dot =
                    document.createElement(
                        "span"
                    );


                dot.className =
                    "calendar-dot";


                dot.textContent =
                    "●";


                cell.appendChild(
                    dot
                );

            }


            if (
                dateKey === todayKey
            ) {

                cell.classList.add(
                    "today"
                );

            }


            cell.addEventListener(
                "click",
                function () {

                    const saved =
                        localStorage.getItem(
                            "devotion-" +
                            dateKey
                        );


                    if (saved) {

                        loadHistoryRecord(
                            dateKey
                        );

                    } else {

                        const message =
                            document.getElementById(
                                "message"
                            );


                        if (message) {

                            message.textContent =
                                "这一天还没有灵修记录。";

                        }

                    }

                }
            );


            calendar.appendChild(
                cell
            );

        }

    }



    // =========================
    // 搜索灵修
    // =========================

    function searchDevotions() {

        const input =
            document.getElementById(
                "searchInput"
            );


        const results =
            document.getElementById(
                "searchResults"
            );


        const message =
            document.getElementById(
                "searchMessage"
            );


        if (
            !input ||
            !results
        ) {

            return;

        }


        const keyword =
            input.value
                .trim()
                .toLowerCase();


        results.innerHTML = "";


        if (message) {

            message.textContent = "";

        }


        if (!keyword) {

            if (message) {

                message.textContent =
                    "请输入想搜索的内容。";

            }


            return;

        }


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
                key.startsWith(
                    "devotion-"
                )
            ) {

                const date =
                    key.replace(
                        "devotion-",
                        ""
                    );


                const saved =
                    localStorage.getItem(
                        key
                    );


                try {

                    const data =
                        JSON.parse(saved);


                    const searchableText =
                        [
                            date,
                            data.bibleReference,
                            data.bibleText,
                            data.reflection,
                            data.response,
                            data.prayer,
                            data.learning
                        ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    if (
                        searchableText.includes(
                            keyword
                        )
                    ) {

                        records.push({
                            date: date,
                            data: data
                        });

                    }


                } catch (error) {

                    console.error(
                        "搜索记录失败：",
                        error
                    );

                }

            }

        }


        records.sort(
            function (a, b) {

                return b.date.localeCompare(
                    a.date
                );

            }
        );


        if (
            records.length === 0
        ) {

            if (message) {

                message.textContent =
                    "没有找到相关的灵修记录。";

            }


            return;

        }


        if (message) {

            message.textContent =
                `找到 ${records.length} 条灵修记录。`;

        }


        records.forEach(
            function (record) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "search-result-item";


                const dateElement =
                    document.createElement(
                        "div"
                    );


                dateElement.className =
                    "search-result-date";


                const dateObject =
                    new Date(
                        record.date +
                        "T12:00:00"
                    );


                dateElement.textContent =
                    dateObject.toLocaleDateString(
                        "zh-CN",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long"
                        }
                    );


                const bibleElement =
                    document.createElement(
                        "div"
                    );


                bibleElement.className =
                    "search-result-bible";


                bibleElement.textContent =
                    record.data.bibleReference ||
                    "没有填写经文";


                const previewElement =
                    document.createElement(
                        "div"
                    );


                previewElement.className =
                    "search-result-preview";


                const previewSource =
                    record.data.reflection ||
                    record.data.prayer ||
                    record.data.learning ||
                    "";


                if (previewSource) {

                    let preview =
                        previewSource.replace(
                            /\s+/g,
                            " "
                        );


                    if (
                        preview.length > 120
                    ) {

                        preview =
                            preview.substring(
                                0,
                                120
                            ) +
                            "……";

                    }


                    previewElement.textContent =
                        preview;

                } else {

                    previewElement.textContent =
                        "这篇灵修还没有文字内容。";

                }


                item.appendChild(
                    dateElement
                );


                item.appendChild(
                    bibleElement
                );


                item.appendChild(
                    previewElement
                );


                item.addEventListener(
                    "click",
                    function () {

                        loadHistoryRecord(
                            record.date
                        );

                    }
                );


                results.appendChild(
                    item
                );

            }
        );

    }



    // =========================
    // 上个月
    // =========================

    const prevMonth =
        document.getElementById(
            "prevMonth"
        );


    if (prevMonth) {

        prevMonth.addEventListener(
            "click",
            function () {

                calendarDate.setMonth(
                    calendarDate.getMonth() - 1
                );


                renderCalendar();

            }
        );

    }



    // =========================
    // 下个月
    // =========================

    const nextMonth =
        document.getElementById(
            "nextMonth"
        );


    if (nextMonth) {

        nextMonth.addEventListener(
            "click",
            function () {

                calendarDate.setMonth(
                    calendarDate.getMonth() + 1
                );


                renderCalendar();

            }
        );

    }



    // =========================
    // 保存按钮
    // =========================

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



    // =========================
    // 历史按钮
    // =========================

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



    // =========================
    // 返回今天
    // =========================

    const todayButton =
        document.getElementById(
            "todayButton"
        );


    if (todayButton) {

        todayButton.addEventListener(
            "click",
            returnToToday
        );

    }



    // =========================
    // 搜索按钮
    // =========================

    const searchButton =
        document.getElementById(
            "searchButton"
        );


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            searchDevotions
        );

    }



    // =========================
    // 回车搜索
    // =========================

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    searchDevotions();

                }

            }
        );

    }



    // =========================
    // 初始化
    // =========================

    loadTodayData();

    renderCalendar();

});
