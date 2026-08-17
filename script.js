document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       Supabase
    ========================== */

    const SUPABASE_URL =
        "https://asfqtznfhljxwfktuido.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Vu7U10XTkqZaOPa-cj9BXQ_TKxgkEwy";


    if (!window.supabase) {

        console.error(
            "Supabase JS 没有加载。"
        );

        const authMessage =
            document.getElementById(
                "authMessage"
            );

        if (authMessage) {

            authMessage.textContent =
                "系统加载失败，请刷新页面。";

        }

        return;
    }


    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    /* =========================
       灵修字段
    ========================== */

    const fields = [
        "bibleReference",
        "bibleText",
        "reflection",
        "response",
        "prayer",
        "learning"
    ];


    /* =========================
       标签
    ========================== */

    let selectedTags = [];

    let allHistoryRecords = [];


    /* =========================
       日期
    ========================== */

    const today =
        new Date();

    let selectedDate =
        formatDate(today);

    let calendarYear =
        today.getFullYear();

    let calendarMonth =
        today.getMonth();


    /* =========================
       日期格式
    ========================== */

    function formatDate(date) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return (
            year +
            "-" +
            month +
            "-" +
            day
        );
    }


    function formatChineseDate(
        dateString
    ) {

        const parts =
            dateString.split("-");

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]);

        const day =
            Number(parts[2]);

        const date =
            new Date(
                year,
                month - 1,
                day
            );

        return date.toLocaleDateString(
            "zh-CN",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long"
            }
        );
    }


    /* =========================
       页面日期
    ========================== */

    function updateTodayText() {

        const todayElement =
            document.getElementById(
                "today"
            );

        if (todayElement) {

            todayElement.textContent =
                formatChineseDate(
                    selectedDate
                );

        }
    }


    updateTodayText();


    /* =========================
       登录 UI
    ========================== */

    function updateAuthUI(user) {

        const loggedOut =
            document.getElementById(
                "authLoggedOut"
            );

        const loggedIn =
            document.getElementById(
                "authLoggedIn"
            );

        const userEmail =
            document.getElementById(
                "userEmail"
            );

        const saveButton =
            document.getElementById(
                "saveButton"
            );


        if (user) {

            if (loggedOut) {

                loggedOut.style.display =
                    "none";

            }


            if (loggedIn) {

                loggedIn.style.display =
                    "block";

            }


            if (userEmail) {

                userEmail.textContent =
                    "已登录：" +
                    (user.email || "");

            }


            if (saveButton) {

                saveButton.disabled =
                    false;

            }

        } else {

            if (loggedOut) {

                loggedOut.style.display =
                    "block";

            }


            if (loggedIn) {

                loggedIn.style.display =
                    "none";

            }


            if (userEmail) {

                userEmail.textContent =
                    "";

            }


            if (saveButton) {

                saveButton.disabled =
                    true;

            }

        }

    }


    /* =========================
       消息
    ========================== */

    function showAuthMessage(text) {

        const element =
            document.getElementById(
                "authMessage"
            );

        if (element) {

            element.textContent =
                text;

        }
    }


    function showMessage(text) {

        const element =
            document.getElementById(
                "message"
            );

        if (element) {

            element.textContent =
                text;

        }
    }


    /* =========================
       标签工具
    ========================== */

    function normalizeTags(tags) {

        if (!tags) {

            return [];

        }


        if (Array.isArray(tags)) {

            return tags
                .map(function (tag) {

                    return String(tag)
                        .trim();

                })
                .filter(Boolean);

        }


        return String(tags)
            .split(",")
            .map(function (tag) {

                return tag.trim();

            })
            .filter(Boolean);

    }


    function renderSelectedTags() {

        const container =
            document.getElementById(
                "selectedTags"
            );

        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        selectedTags.forEach(
            function (tag) {

                const tagElement =
                    document.createElement(
                        "span"
                    );

                tagElement.className =
                    "tag";


                const text =
                    document.createElement(
                        "span"
                    );

                text.textContent =
                    tag;


                const removeButton =
                    document.createElement(
                        "button"
                    );

                removeButton.type =
                    "button";

                removeButton.className =
                    "tag-remove";

                removeButton.textContent =
                    "×";


                removeButton.addEventListener(
                    "click",
                    function () {

                        selectedTags =
                            selectedTags.filter(
                                function (item) {

                                    return (
                                        item !==
                                        tag
                                    );

                                }
                            );

                        renderSelectedTags();

                    }
                );


                tagElement.appendChild(
                    text
                );

                tagElement.appendChild(
                    removeButton
                );

                container.appendChild(
                    tagElement
                );

            }
        );

    }


    function addTag(tag) {

        tag =
            String(tag || "")
                .trim();


        if (!tag) {

            return;

        }


        if (
            selectedTags.includes(tag)
        ) {

            return;

        }


        selectedTags.push(tag);

        renderSelectedTags();


        const tagInput =
            document.getElementById(
                "tagInput"
            );

        if (tagInput) {

            tagInput.value =
                "";

            tagInput.focus();

        }

    }


    function loadTags(tags) {

        selectedTags =
            normalizeTags(tags);

        renderSelectedTags();

    }


    function clearTags() {

        selectedTags = [];

        renderSelectedTags();

    }


    /* =========================
       清空输入框
    ========================== */

    function clearFields() {

        fields.forEach(
            function (field) {

                const element =
                    document.getElementById(
                        field
                    );

                if (element) {

                    element.value =
                        "";

                }

            }
        );


        clearTags();
    }


    /* =========================
       填入灵修
    ========================== */

    function fillFields(data) {

        const mapping = {

            bibleReference:
                "bible_reference",

            bibleText:
                "bible_text",

            reflection:
                "reflection",

            response:
                "response",

            prayer:
                "prayer",

            learning:
                "learning"

        };


        fields.forEach(
            function (field) {

                const element =
                    document.getElementById(
                        field
                    );

                const databaseField =
                    mapping[field];


                if (
                    element &&
                    data &&
                    data[databaseField] !==
                        undefined
                ) {

                    element.value =
                        data[databaseField] ||
                        "";

                }

            }
        );


        loadTags(
            data
                ? data.tags
                : []
        );

    }


    /* =========================
       获取当前用户
    ========================== */

    async function getCurrentUser() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .getUser();


            if (error) {

                console.error(
                    "获取用户失败：",
                    error
                );

                return null;

            }


            return data.user || null;

        } catch (error) {

            console.error(
                "获取用户异常：",
                error
            );

            return null;

        }

    }


    /* =========================
       注册
    ========================== */

    async function signUp() {

        const emailElement =
            document.getElementById(
                "email"
            );

        const passwordElement =
            document.getElementById(
                "password"
            );


        const email =
            emailElement
                ? emailElement.value.trim()
                : "";


        const password =
            passwordElement
                ? passwordElement.value
                : "";


        if (!email || !password) {

            showAuthMessage(
                "请输入邮箱和密码。"
            );

            return;

        }


        showAuthMessage(
            "正在注册……"
        );


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .signUp({

                        email:
                            email,

                        password:
                            password

                    });


            if (error) {

                console.error(
                    "注册失败：",
                    error
                );

                showAuthMessage(
                    "注册失败：" +
                    error.message
                );

                return;

            }


            if (
                data.user &&
                !data.session
            ) {

                showAuthMessage(
                    "注册成功！请打开邮箱，点击确认链接，然后回来登录。"
                );

            } else {

                showAuthMessage(
                    "注册成功！"
                );

            }

        } catch (error) {

            console.error(
                "注册异常：",
                error
            );

            showAuthMessage(
                "注册失败：" +
                error.message
            );

        }

    }


    /* =========================
       登录
    ========================== */

    async function signIn() {

        const emailElement =
            document.getElementById(
                "email"
            );

        const passwordElement =
            document.getElementById(
                "password"
            );

        const button =
            document.getElementById(
                "signInButton"
            );


        const email =
            emailElement
                ? emailElement.value.trim()
                : "";


        const password =
            passwordElement
                ? passwordElement.value
                : "";


        if (!email || !password) {

            showAuthMessage(
                "请输入邮箱和密码。"
            );

            return;

        }


        showAuthMessage(
            "正在登录……"
        );


        if (button) {

            button.disabled =
                true;

        }


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


            if (error) {

                console.error(
                    "登录失败：",
                    error
                );

                showAuthMessage(
                    "登录失败：" +
                    error.message
                );

                return;

            }


            if (
                !data ||
                !data.user
            ) {

                showAuthMessage(
                    "登录没有成功，请重新尝试。"
                );

                return;

            }


            updateAuthUI(
                data.user
            );


            showAuthMessage(
                "登录成功！"
            );


            await loadTodayFromSupabase();

            await loadHistory();

            await renderCalendar();


        } catch (error) {

            console.error(
                "登录异常：",
                error
            );

            showAuthMessage(
                "登录失败：" +
                error.message
            );

        } finally {

            if (button) {

                button.disabled =
                    false;

            }

        }

    }


    /* =========================
       退出
    ========================== */

    async function signOut() {

        const button =
            document.getElementById(
                "signOutButton"
            );


        if (button) {

            button.disabled =
                true;

        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            if (error) {

                console.error(
                    "退出失败：",
                    error
                );

                showAuthMessage(
                    "退出失败：" +
                    error.message
                );

                return;

            }


            clearFields();

            updateAuthUI(null);


            showAuthMessage(
                "已退出登录。"
            );


            showMessage("");


            allHistoryRecords = [];

            renderSearchResults("");


            await renderCalendar();

            await loadHistory();


        } catch (error) {

            console.error(
                "退出异常：",
                error
            );

            showAuthMessage(
                "退出失败：" +
                error.message
            );

        } finally {

            if (button) {

                button.disabled =
                    false;

            }

        }

    }


    /* =========================
       根据日期读取灵修
    ========================== */

    async function getDevotionByDate(
        dateString
    ) {

        const user =
            await getCurrentUser();


        if (!user) {

            return null;

        }


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("devotions")
                    .select("*")
                    .eq(
                        "user_id",
                        user.id
                    )
                    .eq(
                        "date",
                        dateString
                    )
                    .maybeSingle();


            if (error) {

                console.error(
                    "读取灵修失败：",
                    error
                );

                return null;

            }


            return data || null;


        } catch (error) {

            console.error(
                "读取灵修异常：",
                error
            );

            return null;

        }

    }


    /* =========================
       读取今天
    ========================== */

    async function loadTodayFromSupabase() {

        const user =
            await getCurrentUser();


        if (!user) {

            return;

        }


        const data =
            await getDevotionByDate(
                selectedDate
            );


        if (data) {

            fillFields(data);

            showMessage(
                "已读取今天的灵修。"
            );

        } else {

            clearFields();

            showMessage("");

        }

    }


    /* =========================
       保存灵修
    ========================== */

    async function saveTodayData() {

        const user =
            await getCurrentUser();


        if (!user) {

            showMessage(
                "请先登录。"
            );

            return;

        }


        const saveButton =
            document.getElementById(
                "saveButton"
            );


        if (saveButton) {

            saveButton.disabled =
                true;

        }


        const data = {

            user_id:
                user.id,

            date:
                selectedDate,

            bible_reference:
                document.getElementById(
                    "bibleReference"
                ).value,

            bible_text:
                document.getElementById(
                    "bibleText"
                ).value,

            reflection:
                document.getElementById(
                    "reflection"
                ).value,

            response:
                document.getElementById(
                    "response"
                ).value,

            prayer:
                document.getElementById(
                    "prayer"
                ).value,

            learning:
                document.getElementById(
                    "learning"
                ).value,

            tags:
                selectedTags.join(",")

        };


        try {

            const {
                data: existing,
                error: findError
            } =
                await supabaseClient
                    .from("devotions")
                    .select("id")
                    .eq(
                        "user_id",
                        user.id
                    )
                    .eq(
                        "date",
                        selectedDate
                    )
                    .maybeSingle();


            if (findError) {

                console.error(
                    "查找旧记录失败：",
                    findError
                );

                showMessage(
                    "读取旧记录失败：" +
                    findError.message
                );

                return;

            }


            let error =
                null;


            if (existing) {

                const result =
                    await supabaseClient
                        .from("devotions")
                        .update(data)
                        .eq(
                            "id",
                            existing.id
                        );

                error =
                    result.error;

            } else {

                const result =
                    await supabaseClient
                        .from("devotions")
                        .insert(data);

                error =
                    result.error;

            }


            if (error) {

                console.error(
                    "保存失败：",
                    error
                );

                showMessage(
                    "保存失败：" +
                    error.message
                );

                return;

            }


            showMessage(
                "✓ 今天的灵修已经保存。"
            );


            await loadHistory();

            await renderCalendar();


        } catch (error) {

            console.error(
                "保存异常：",
                error
            );

            showMessage(
                "保存失败：" +
                error.message
            );

        } finally {

            if (saveButton) {

                const currentUser =
                    await getCurrentUser();

                saveButton.disabled =
                    !currentUser;

            }

        }

    }


    /* =========================
       日历
    ========================== */

    async function renderCalendar() {

        const title =
            document.getElementById(
                "calendarTitle"
            );

        const container =
            document.getElementById(
                "calendarDays"
            );


        if (!title || !container) {

            return;

        }


        title.textContent =
            calendarYear +
            "年" +
            (calendarMonth + 1) +
            "月";


        container.innerHTML =
            "";


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


        const startWeekday =
            firstDay.getDay();


        const daysInMonth =
            lastDay.getDate();


        const recordDates =
            new Set();


        const user =
            await getCurrentUser();


        if (user) {

            const firstDate =
                calendarYear +
                "-" +
                String(
                    calendarMonth + 1
                ).padStart(2, "0") +
                "-01";


            const lastDate =
                calendarYear +
                "-" +
                String(
                    calendarMonth + 1
                ).padStart(2, "0") +
                "-" +
                String(
                    daysInMonth
                ).padStart(2, "0");


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from("devotions")
                        .select("date")
                        .eq(
                            "user_id",
                            user.id
                        )
                        .gte(
                            "date",
                            firstDate
                        )
                        .lte(
                            "date",
                            lastDate
                        );


                if (!error && data) {

                    data.forEach(
                        function (item) {

                            recordDates.add(
                                item.date
                            );

                        }
                    );

                }

            } catch (error) {

                console.error(
                    "读取日历记录失败：",
                    error
                );

            }

        }


        /* 上个月 */

        for (
            let i = startWeekday - 1;
            i >= 0;
            i--
        ) {

            const date =
                new Date(
                    calendarYear,
                    calendarMonth,
                    -i
                );


            createCalendarDay(
                date,
                true,
                recordDates,
                container
            );

        }


        /* 本月 */

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const date =
                new Date(
                    calendarYear,
                    calendarMonth,
                    day
                );


            createCalendarDay(
                date,
                false,
                recordDates,
                container
            );

        }


        /* 下个月 */

        const totalCells =
            startWeekday +
            daysInMonth;


        const remaining =
            totalCells % 7 === 0
                ? 0
                : 7 -
                  (
                      totalCells % 7
                  );


        for (
            let i = 1;
            i <= remaining;
            i++
        ) {

            const date =
                new Date(
                    calendarYear,
                    calendarMonth + 1,
                    i
                );


            createCalendarDay(
                date,
                true,
                recordDates,
                container
            );

        }

    }


    /* =========================
       创建日历日期
    ========================== */

    function createCalendarDay(
        date,
        otherMonth,
        recordDates,
        container
    ) {

        const dateString =
            formatDate(date);


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "calendar-day";


        if (otherMonth) {

            wrapper.classList.add(
                "other-month"
            );

        }


        if (
            dateString ===
            formatDate(new Date())
        ) {

            wrapper.classList.add(
                "today"
            );

        }


        if (
            dateString ===
            selectedDate
        ) {

            wrapper.classList.add(
                "selected"
            );

        }


        if (
            recordDates.has(
                dateString
            )
        ) {

            wrapper.classList.add(
                "has-record"
            );

        }


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            date.getDate();


        button.addEventListener(
            "click",
            async function () {

                await selectCalendarDate(
                    dateString
                );

            }
        );


        wrapper.appendChild(
            button
        );


        container.appendChild(
            wrapper
        );

    }


    /* =========================
       选择日期
    ========================== */

    async function selectCalendarDate(
        dateString
    ) {

        selectedDate =
            dateString;


        const parts =
            dateString.split("-");


        calendarYear =
            Number(parts[0]);


        calendarMonth =
            Number(parts[1]) - 1;


        updateTodayText();


        clearFields();


        const user =
            await getCurrentUser();


        if (!user) {

            showMessage(
                "请先登录后查看灵修记录。"
            );


            await renderCalendar();

            return;

        }


        const data =
            await getDevotionByDate(
                selectedDate
            );


        if (data) {

            fillFields(data);


            showMessage(
                "✓ 已打开 " +
                formatChineseDate(
                    selectedDate
                ) +
                " 的灵修记录。"
            );

        } else {

            showMessage(
                formatChineseDate(
                    selectedDate
                ) +
                " 还没有灵修记录。"
            );

        }


        await renderCalendar();


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }


    /* =========================
       历史
    ========================== */

    async function loadHistory() {

        const historyList =
            document.getElementById(
                "historyList"
            );


        if (!historyList) {

            return;

        }


        const user =
            await getCurrentUser();


        if (!user) {

            allHistoryRecords = [];


            historyList.innerHTML =
                "<p>请先登录后查看灵修历史。</p>";


            renderSearchResults(
                ""
            );

            return;

        }


        historyList.innerHTML =
            "<p>正在读取灵修历史……</p>";


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("devotions")
                    .select("*")
                    .eq(
                        "user_id",
                        user.id
                    )
                    .order(
                        "date",
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                console.error(
                    "读取历史失败：",
                    error
                );


                historyList.innerHTML =
                    "<p>读取灵修历史失败：" +
                    error.message +
                    "</p>";


                return;

            }


            allHistoryRecords =
                data || [];


            renderHistory(
                allHistoryRecords
            );


            renderSearchResults(
                getSearchValue()
            );


            renderSearchTags();


        } catch (error) {

            console.error(
                "历史记录异常：",
                error
            );


            historyList.innerHTML =
                "<p>读取灵修历史失败。</p>";

        }

    }


    /* =========================
       显示历史
    ========================== */

    function renderHistory(
        records
    ) {

        const historyList =
            document.getElementById(
                "historyList"
            );


        if (!historyList) {

            return;

        }


        historyList.innerHTML =
            "";


        if (
            !records ||
            records.length === 0
        ) {

            historyList.innerHTML =
                "<p>还没有灵修记录。</p>";

            return;

        }


        records.forEach(
            function (record) {

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


                dateElement.textContent =
                    formatChineseDate(
                        record.date
                    );


                const bibleElement =
                    document.createElement(
                        "div"
                    );


                bibleElement.className =
                    "history-bible";


                bibleElement.textContent =
                    record.bible_reference ||
                    "还没有填写经文";


                const previewElement =
                    document.createElement(
                        "div"
                    );


                previewElement.className =
                    "history-preview";


                if (
                    record.reflection
                ) {

                    let preview =
                        record.reflection
                            .replace(
                                /\s+/g,
                                " "
                            );


                    if (
                        preview.length >
                        100
                    ) {

                        preview =
                            preview.substring(
                                0,
                                100
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


                const tags =
                    normalizeTags(
                        record.tags
                    );


                if (
                    tags.length > 0
                ) {

                    const tagsContainer =
                        document.createElement(
                            "div"
                        );


                    tagsContainer.className =
                        "history-tags";


                    tags.forEach(
                        function (tag) {

                            const tagElement =
                                document.createElement(
                                    "button"
                                );


                            tagElement.type =
                                "button";


                            tagElement.className =
                                "history-tag";


                            tagElement.textContent =
                                tag;


                            tagElement.addEventListener(
                                "click",
                                function (event) {

                                    event.stopPropagation();

                                    searchByTag(
                                        tag
                                    );

                                }
                            );


                            tagsContainer.appendChild(
                                tagElement
                            );

                        }
                    );


                    item.appendChild(
                        tagsContainer
                    );

                }


                item.addEventListener(
                    "click",
                    async function () {

                        await selectCalendarDate(
                            record.date
                        );

                    }
                );


                historyList.appendChild(
                    item
                );

            }
        );

    }


    /* =========================
       搜索
    ========================== */

    function getSearchValue() {

        const input =
            document.getElementById(
                "searchInput"
            );


        return input
            ? input.value.trim()
            : "";

    }


    function recordMatchesSearch(
        record,
        keyword
    ) {

        if (!keyword) {

            return true;

        }


        const searchText = [

            record.date,

            record.bible_reference,

            record.bible_text,

            record.reflection,

            record.response,

            record.prayer,

            record.learning,

            normalizeTags(
                record.tags
            ).join(" ")

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        return searchText.includes(
            keyword.toLowerCase()
        );

    }


    function renderSearchResults(
        keyword
    ) {

        const status =
            document.getElementById(
                "searchStatus"
            );


        if (!status) {

            return;

        }


        const existingResults =
            document.getElementById(
                "searchResults"
            );


        if (existingResults) {

            existingResults.remove();

        }


        if (!keyword) {

            status.textContent =
                allHistoryRecords.length > 0
                    ? "可以搜索你过去的灵修。"
                    : "登录并保存灵修后，这里会出现搜索结果。";

            return;

        }


        const results =
            allHistoryRecords.filter(
                function (record) {

                    return recordMatchesSearch(
                        record,
                        keyword
                    );

                }
            );


        status.textContent =
            "找到 " +
            results.length +
            " 篇相关灵修";


        const resultContainer =
            document.createElement(
                "div"
            );


        resultContainer.id =
            "searchResults";


        results.forEach(
            function (record) {

                const result =
                    document.createElement(
                        "div"
                    );


                result.className =
                    "search-result";


                const date =
                    document.createElement(
                        "div"
                    );


                date.className =
                    "search-result-date";


                date.textContent =
                    formatChineseDate(
                        record.date
                    );


                const bible =
                    document.createElement(
                        "div"
                    );


                bible.className =
                    "search-result-bible";


                bible.textContent =
                    record.bible_reference ||
                    "还没有填写经文";


                const preview =
                    document.createElement(
                        "div"
                    );


                preview.className =
                    "search-result-preview";


                const text =
                    record.reflection ||
                    record.response ||
                    record.prayer ||
                    record.learning ||
                    "这篇灵修没有文字预览。";


                preview.textContent =
                    text.length > 120
                        ? text.substring(
                              0,
                              120
                          ) + "……"
                        : text;


                result.appendChild(
                    date
                );


                result.appendChild(
                    bible
                );


                result.appendChild(
                    preview
                );


                const tags =
                    normalizeTags(
                        record.tags
                    );


                if (
                    tags.length > 0
                ) {

                    const tagsContainer =
                        document.createElement(
                            "div"
                        );


                    tagsContainer.className =
                        "search-result-tags";


                    tags.forEach(
                        function (tag) {

                            const tagElement =
                                document.createElement(
                                    "button"
                                );


                            tagElement.type =
                                "button";


                            tagElement.className =
                                "search-result-tag";


                            tagElement.textContent =
                                tag;


                            tagElement.addEventListener(
                                "click",
                                function (event) {

                                    event.stopPropagation();

                                    searchByTag(
                                        tag
                                    );

                                }
                            );


                            tagsContainer.appendChild(
                                tagElement
                            );

                        }
                    );


                    result.appendChild(
                        tagsContainer
                    );

                }


                result.addEventListener(
                    "click",
                    async function () {

                        await selectCalendarDate(
                            record.date
                        );

                    }
                );


                resultContainer.appendChild(
                    result
                );

            }
        );


        status.parentNode.insertBefore(
            resultContainer,
            status.nextSibling
        );

    }


    function searchByTag(tag) {

        const input =
            document.getElementById(
                "searchInput"
            );


        if (input) {

            input.value =
                tag;

        }


        renderSearchResults(
            tag
        );


        const searchCard =
            document.querySelector(
                ".search-card"
            );


        if (searchCard) {

            searchCard.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }

    }


    /* =========================
       常用标签搜索
    ========================== */

    function renderSearchTags() {

        const container =
            document.getElementById(
                "searchTags"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        const tagMap =
            {};


        allHistoryRecords.forEach(
            function (record) {

                normalizeTags(
                    record.tags
                ).forEach(
                    function (tag) {

                        tagMap[tag] =
                            (tagMap[tag] || 0) +
                            1;

                    }
                );

            }
        );


        const tags =
            Object.keys(tagMap)
                .sort(
                    function (a, b) {

                        return (
                            tagMap[b] -
                            tagMap[a]
                        );

                    }
                )
                .slice(0, 12);


        tags.forEach(
            function (tag) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "search-tag";


                button.textContent =
                    tag;


                button.addEventListener(
                    "click",
                    function () {

                        searchByTag(
                            tag
                        );

                    }
                );


                container.appendChild(
                    button
                );

            }
        );

    }


    /* =========================
       搜索事件
    ========================== */

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                renderSearchResults(
                    searchInput.value.trim()
                );

            }
        );

    }


    const clearSearchButton =
        document.getElementById(
            "clearSearchButton"
        );


    if (clearSearchButton) {

        clearSearchButton.addEventListener(
            "click",
            function () {

                if (searchInput) {

                    searchInput.value =
                        "";

                }


                renderSearchResults(
                    ""
                );

                renderSearchTags();

            }
        );

    }


    /* =========================
       添加标签
    ========================== */

    const addTagButton =
        document.getElementById(
            "addTagButton"
        );


    if (addTagButton) {

        addTagButton.addEventListener(
            "click",
            function () {

                const input =
                    document.getElementById(
                        "tagInput"
                    );


                if (input) {

                    addTag(
                        input.value
                    );

                }

            }
        );

    }


    const tagInput =
        document.getElementById(
            "tagInput"
        );


    if (tagInput) {

        tagInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    addTag(
                        tagInput.value
                    );

                }

            }
        );

    }


    /* =========================
       常用标签
    ========================== */

    document
        .querySelectorAll(
            ".suggested-tag"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        addTag(
                            button.dataset.tag
                        );

                    }
                );

            }
        );


    /* =========================
       上个月
    ========================== */

    const prevMonth =
        document.getElementById(
            "prevMonth"
        );


    if (prevMonth) {

        prevMonth.addEventListener(
            "click",
            async function () {

                calendarMonth--;


                if (
                    calendarMonth < 0
                ) {

                    calendarMonth =
                        11;

                    calendarYear--;

                }


                await renderCalendar();

            }
        );

    }


    /* =========================
       下个月
    ========================== */

    const nextMonth =
        document.getElementById(
            "nextMonth"
        );


    if (nextMonth) {

        nextMonth.addEventListener(
            "click",
            async function () {

                calendarMonth++;


                if (
                    calendarMonth > 11
                ) {

                    calendarMonth =
                        0;

                    calendarYear++;

                }


                await renderCalendar();

            }
        );

    }


    /* =========================
       登录按钮
    ========================== */

    const signUpButton =
        document.getElementById(
            "signUpButton"
        );


    if (signUpButton) {

        signUpButton.addEventListener(
            "click",
            signUp
        );

    }


    const signInButton =
        document.getElementById(
            "signInButton"
        );


    if (signInButton) {

        signInButton.addEventListener(
            "click",
            signIn
        );

    }


    const signOutButton =
        document.getElementById(
            "signOutButton"
        );


    if (signOutButton) {

        signOutButton.addEventListener(
            "click",
            signOut
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


    /* =========================
       回车登录
    ========================== */

    const passwordInput =
        document.getElementById(
            "password"
        );


    if (passwordInput) {

        passwordInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    signIn();

                }

            }
        );

    }


    /* =========================
       登录状态变化
    ========================== */

    supabaseClient.auth.onAuthStateChange(
        function (
            event,
            session
        ) {

            const user =
                session
                    ? session.user
                    : null;


            updateAuthUI(
                user
            );

        }
    );


    /* =========================
       初始化
    ========================== */

    async function initialize() {

        updateAuthUI(null);


        await renderCalendar();


        const user =
            await getCurrentUser();


        if (user) {

            updateAuthUI(
                user
            );


            await loadTodayFromSupabase();

            await loadHistory();

            await renderCalendar();

        } else {

            updateAuthUI(null);

            await loadHistory();

        }

    }


    initialize();

});
