document.addEventListener("DOMContentLoaded", function () {

    const fields = [
        "bibleReference",
        "bibleText",
        "reflection",
        "response",
        "prayer",
        "learning",
        "tags"
    ];


    let calendarDate = new Date();

    let viewingDate = null;


    const today = new Date();


    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    const day =
        String(today.getDate()).padStart(2, "0");


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
        document.getElementById("today");


    if (todayElement) {
        todayElement.textContent = dateString;
    }


    function getRecords() {

        const records = [];

        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);

            if (
                !key ||
                !key.startsWith("devotion-")
            ) {
                continue;
            }

            const date =
                key.replace("devotion-", "");

            try {

                const data =
                    JSON.parse(
                        localStorage.getItem(key)
                    );

                records.push({
                    date: date,
                    data: data
                });

            } catch (error) {

                console.error(
                    "读取记录失败：",
                    error
                );

            }

        }

        records.sort(function (a, b) {
            return b.date.localeCompare(a.date);
        });

        return records;
    }


    function clearFields() {

        fields.forEach(function (field) {

            const element =
                document.getElementById(field);

            if (element) {
                element.value = "";
            }

        });

    }


    function loadTodayData() {

        viewingDate = null;

        clearFields();


        const saved =
            localStorage.getItem(
                "devotion-" + todayKey
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

        } catch (error) {

            console.error(
                "读取今天的灵修失败：",
                error
            );

        }

    }


    function saveTodayData() {

        if (viewingDate !== null) {

            const message =
                document.getElementById("message");

            if (message) {
                message.textContent =
                    "⚠️ 请先点击“返回今天”。";
            }

            return;
        }


        const data = {};


        fields.forEach(function (field) {

            const element =
                document.getElementById(field);

            if (element) {
                data[field] =
                    element.value;
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


        renderCalendar();

        renderTagFilters();

        showHistory();

        renderStats();

    }


    function createTagsElement(tags) {

        const container =
            document.createElement("div");

        container.className =
            "history-tags";


        if (!tags) {
            return container;
        }


        const tagArray =
            tags
                .split(",")
                .map(function (tag) {
                    return tag.trim();
                })
                .filter(Boolean);


        tagArray.forEach(function (tag) {

            const element =
                document.createElement("span");

            element.className = "tag";

            element.textContent =
                "#" + tag;

            container.appendChild(element);

        });


        return container;
    }


    function getAllTags() {

        const tags = new Set();

        const records = getRecords();


        records.forEach(function (record) {

            if (!record.data.tags) {
                return;
            }


            record.data.tags
                .split(",")
                .map(function (tag) {
                    return tag.trim();
                })
                .filter(Boolean)
                .forEach(function (tag) {
                    tags.add(tag);
                });

        });


        return Array.from(tags).sort();
    }


    function renderTagFilters() {

        const container =
            document.getElementById(
                "tagFilters"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const allButton =
            document.createElement("button");


        allButton.type = "button";

        allButton.className =
            "tag-filter active";

        allButton.textContent =
            "全部";


        allButton.addEventListener(
            "click",
            function () {

                setActiveTagButton(
                    allButton
                );

                showHistory();

            }
        );


        container.appendChild(
            allButton
        );


        getAllTags().forEach(function (tag) {

            const button =
                document.createElement("button");


            button.type = "button";

            button.className =
                "tag-filter";

            button.textContent =
                "#" + tag;


            button.addEventListener(
                "click",
                function () {

                    setActiveTagButton(
                        button
                    );

                    showHistoryByTag(tag);

                }
            );


            container.appendChild(button);

        });

    }


    function setActiveTagButton(
        activeButton
    ) {

        const buttons =
            document.querySelectorAll(
                ".tag-filter"
            );


        buttons.forEach(function (button) {

            button.classList.remove("active");

        });


        activeButton.classList.add("active");
    }


    function showHistory() {

        const historyList =
            document.getElementById(
                "historyList"
            );


        if (!historyList) {
            return;
        }


        historyList.innerHTML = "";


        const records =
            getRecords();


        if (records.length === 0) {

            historyList.innerHTML =
                "<p>还没有灵修记录。</p>";

            return;
        }


        records.forEach(function (record) {

            createHistoryItem(
                record.date,
                historyList
            );

        });

    }


    function showHistoryByTag(selectedTag) {

        const historyList =
            document.getElementById(
                "historyList"
            );


        if (!historyList) {
            return;
        }


        historyList.innerHTML = "";


        const records =
            getRecords().filter(
                function (record) {

                    if (!record.data.tags) {
                        return false;
                    }


                    const tags =
                        record.data.tags
                            .split(",")
                            .map(function (tag) {
                                return tag.trim();
                            });


                    return tags.includes(
                        selectedTag
                    );

                }
            );


        if (records.length === 0) {

            historyList.innerHTML =
                "<p>还没有带有这个标签的灵修记录。</p>";

            return;
        }


        records.forEach(function (record) {

            createHistoryItem(
                record.date,
                historyList
            );

        });

    }


    function createHistoryItem(
        date,
        container
    ) {

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
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long"
                }
            );


        const bibleElement =
            document.createElement("div");

        bibleElement.className =
            "history-bible";

        bibleElement.textContent =
            data.bibleReference ||
            "还没有填写经文";


        const previewElement =
            document.createElement("div");

        previewElement.className =
            "history-preview";


        const previewSource =
            data.reflection ||
            data.prayer ||
            "";


        if (previewSource) {

            let preview =
                previewSource.replace(
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

        item.appendChild(
            createTagsElement(data.tags)
        );


        item.addEventListener(
            "click",
            function () {

                loadHistoryRecord(date);

            }
        );


        container.appendChild(item);

    }


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


            viewingDate = date;


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
                "读取历史失败：",
                error
            );

        }

    }


    function returnToToday() {

        loadTodayData();


        const message =
            document.getElementById(
                "message"
            );


        if (message) {

            message.textContent =
                "✨ 已返回今天。";

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    function renderCalendar() {

        const calendar =
            document.getElementById(
                "calendar"
            );


        const title =
            document.getElementById(
                "calendarTitle"
            );


        if (!calendar || !title) {
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


        if (startDay === 0) {
            startDay = 7;
        }


        for (
            let i = 1;
            i < startDay;
            i++
        ) {

            const empty =
                document.createElement("div");

            empty.className =
                "calendar-day empty";

            calendar.appendChild(empty);

        }


        for (
            let day = 1;
            day <= lastDay.getDate();
            day++
        ) {

            const cell =
                document.createElement("div");

            cell.className =
                "calendar-day";


            const dateKey =
                `${calendarYear}-${String(
                    calendarMonth + 1
                ).padStart(2, "0")}-${String(
                    day
                ).padStart(2, "0")}`;


            const number =
                document.createElement("span");

            number.className =
                "calendar-number";

            number.textContent = day;


            cell.appendChild(number);


            if (
                localStorage.getItem(
                    "devotion-" + dateKey
                )
            ) {

                const dot =
                    document.createElement("span");

                dot.className =
                    "calendar-dot";

                dot.textContent = "●";

                cell.appendChild(dot);

            }


            if (dateKey === todayKey) {

                cell.classList.add("today");

            }


            cell.addEventListener(
                "click",
                function () {

                    if (
                        localStorage.getItem(
                            "devotion-" + dateKey
                        )
                    ) {

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


            calendar.appendChild(cell);

        }

    }


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


        if (!input || !results) {
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


        const records =
            getRecords().filter(
                function (record) {

                    const data =
                        record.data;


                    const text =
                        [
                            data.bibleReference,
                            data.bibleText,
                            data.reflection,
                            data.response,
                            data.prayer,
                            data.learning,
                            data.tags
                        ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        keyword
                    );

                }
            );


        if (records.length === 0) {

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


        records.forEach(function (record) {

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


                if (preview.length > 120) {

                    preview =
                        preview.substring(
                            0,
                            120
                        ) + "……";

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

            item.appendChild(
                createTagsElement(
                    record.data.tags
                )
            );


            item.addEventListener(
                "click",
                function () {

                    loadHistoryRecord(
                        record.date
                    );

                }
            );


            results.appendChild(item);

        });

    }


    // =========================
    // 灵修统计
    // =========================

    function renderStats() {

        const records =
            getRecords();


        const totalDays =
            records.length;


        const monthPrefix =
            `${today.getFullYear()}-${String(
                today.getMonth() + 1
            ).padStart(2, "0")}`;


        const monthDays =
            records.filter(
                function (record) {

                    return record.date.startsWith(
                        monthPrefix
                    );

                }
            ).length;


        let streak = 0;


        const recordDates =
            new Set(
                records.map(
                    function (record) {
                        return record.date;
                    }
                )
            );


        let checkDate =
            new Date();


        while (true) {

            const y =
                checkDate.getFullYear();

            const m =
                String(
                    checkDate.getMonth() + 1
                ).padStart(2, "0");

            const d =
                String(
                    checkDate.getDate()
                ).padStart(2, "0");


            const key =
                `${y}-${m}-${d}`;


            if (
                recordDates.has(key)
            ) {

                streak++;

                checkDate.setDate(
                    checkDate.getDate() - 1
                );

            } else {

                break;

            }

        }


        const tagCount = {};


        records.forEach(function (record) {

            if (!record.data.tags) {
                return;
            }


            record.data.tags
                .split(",")
                .map(function (tag) {
                    return tag.trim();
                })
                .filter(Boolean)
                .forEach(function (tag) {

                    if (!tagCount[tag]) {
                        tagCount[tag] = 0;
                    }

                    tagCount[tag]++;

                });

        });


        let topTag = "—";

        let topCount = 0;


        Object.keys(tagCount).forEach(
            function (tag) {

                if (
                    tagCount[tag] >
                    topCount
                ) {

                    topCount =
                        tagCount[tag];

                    topTag = tag;

                }

            }
        );


        const totalElement =
            document.getElementById(
                "totalDays"
            );


        const monthElement =
            document.getElementById(
                "monthDays"
            );


        const streakElement =
            document.getElementById(
                "streakDays"
            );


        const topTagElement =
            document.getElementById(
                "topTag"
            );


        if (totalElement) {
            totalElement.textContent =
                totalDays;
        }


        if (monthElement) {
            monthElement.textContent =
                monthDays;
        }


        if (streakElement) {
            streakElement.textContent =
                streak;
        }


        if (topTagElement) {

            topTagElement.textContent =
                topTag === "—"
                    ? "—"
                    : "#" + topTag;

        }


        const statsMessage =
            document.getElementById(
                "statsMessage"
            );


        if (statsMessage) {

            if (totalDays === 0) {

                statsMessage.textContent =
                    "今天开始记录，让每一天都成为与你主同行的足迹。";

            } else if (streak >= 7) {

                statsMessage.textContent =
                    `已经连续灵修 ${streak} 天，继续在主里面忠心前行。`;

            } else {

                statsMessage.textContent =
                    "每一天的记录，都会成为你与主同行的足迹。";

            }

        }

    }


    // =========================
    // 日历按钮
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


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {
                    searchDevotions();
                }

            }
        );

    }


    // 初始化

    loadTodayData();

    renderCalendar();

    renderTagFilters();

    showHistory();

    renderStats();

});
