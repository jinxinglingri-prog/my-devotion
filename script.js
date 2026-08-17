document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       Supabase 设置
    ========================= */

    const SUPABASE_URL =
        "https://asfqtznfhljxwfktuido.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Vu7U10XTkqZaOPa-cj9BXQ_TKxgkEwy";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    /* =========================
       灵修字段
    ========================= */

    const fields = [
        "bibleReference",
        "bibleText",
        "reflection",
        "response",
        "prayer",
        "learning"
    ];


    /* =========================
       当前日期
    ========================= */

    const now = new Date();

    let selectedDate =
        formatDate(now);

    let calendarYear =
        now.getFullYear();

    let calendarMonth =
        now.getMonth();


    /* =========================
       日期格式
    ========================= */

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

        return `${year}-${month}-${day}`;
    }


    function formatChineseDate(dateString) {

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
       页面今天日期
    ========================= */

    const todayElement =
        document.getElementById("today");

    if (todayElement) {

        todayElement.textContent =
            formatChineseDate(selectedDate);

    }


    /* =========================
       登录状态
    ========================= */

    async function checkUser() {

        const {
            data
        } =
            await supabaseClient.auth.getUser();

        updateAuthUI(
            data.user
        );

        if (data.user) {

            await loadTodayFromSupabase();

            await loadHistory();

            await renderCalendar();

        } else {

            renderCalendar();

        }

    }


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
                    user.email;

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

            if (saveButton) {
                saveButton.disabled =
                    true;
            }

        }

    }


    /* =========================
       注册
    ========================= */

    async function signUp() {

        const email =
            document.getElementById(
                "email"
            ).value.trim();

        const password =
            document.getElementById(
                "password"
            ).value;


        const authMessage =
            document.getElementById(
                "authMessage"
            );


        if (!email || !password) {

            authMessage.textContent =
                "请输入邮箱和密码。";

            return;

        }


        authMessage.textContent =
            "正在注册……";


        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password
            });


        if (error) {

            authMessage.textContent =
                "注册失败：" +
                error.message;

            return;

        }


        if (
            data.user &&
            !data.session
        ) {

            authMessage.textContent =
                "注册成功！请打开邮箱，点击确认链接，然后回来登录。";

        } else {

            authMessage.textContent =
                "注册成功！";

        }

    }


    /* =========================
       登录
    ========================= */

    async function signIn() {

        const email =
            document.getElementById(
                "email"
            ).value.trim();

        const password =
            document.getElementById(
                "password"
            ).value;


        const authMessage =
            document.getElementById(
                "authMessage"
            );


        if (!email || !password) {

            authMessage.textContent =
                "请输入邮箱和密码。";

            return;

        }


        authMessage.textContent =
            "正在登录……";


        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            authMessage.textContent =
                "登录失败：" +
                error.message;

            return;

        }


        authMessage.textContent =
            "登录成功！";


        updateAuthUI(
            data.user
        );


        await loadTodayFromSupabase();

        await loadHistory();

        await renderCalendar();

    }


    /* =========================
       退出登录
    ========================= */

    async function signOut() {

        await supabaseClient.auth.signOut();

        clearFields();

        updateAuthUI(null);

        const authMessage =
            document.getElementById(
                "authMessage"
            );

        if (authMessage) {

            authMessage.textContent =
                "已退出登录。";

        }

    }


    /* =========================
       清空表单
    ========================= */

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


    /* =========================
       从 Supabase 读取某一天
    ========================= */

    async function getDevotionByDate(
        dateString
    ) {

        const {
            data: userData
        } =
            await supabaseClient.auth.getUser();


        const user =
            userData.user;


        if (!user) {

            return null;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("devotions")
                .select("*")
                .eq("user_id", user.id)
                .eq("date", dateString)
                .maybeSingle();


        if (error) {

            console.error(
                "读取灵修失败：",
                error
            );

            return null;

        }


        return data;

    }


    /* =========================
       读取今天的灵修
    ========================= */

    async function loadTodayFromSupabase() {

        const data =
            await getDevotionByDate(
                selectedDate
            );


        if (!data) {

            return;

        }


        fillFields(data);


        const message =
            document.getElementById(
                "message"
            );


        if (message) {

            message.textContent =
                "已读取今天的灵修。";

        }

    }


    /* =========================
       把数据库数据放入页面
    ========================= */

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
                    data[databaseField] !==
                        undefined
                ) {

                    element.value =
                        data[databaseField] || "";

                }

            }
        );

    }


    /* =========================
       保存今天的灵修
    ========================= */

    async function saveTodayData() {

        const {
            data: userData
        } =
            await supabaseClient.auth.getUser();


        const user =
            userData.user;


        const message =
            document.getElementById(
                "message"
            );


        if (!user) {

            if (message) {

                message.textContent =
                    "请先登录。";

            }

            return;

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
                ).value

        };


        /*
         * 这里不用 upsert，
         * 避免要求数据库必须有
         * user_id + date 的唯一索引。
         */

        const {
            data: existing,
            error: findError
        } =
            await supabaseClient
                .from("devotions")
                .select("id")
                .eq("user_id", user.id)
                .eq("date", selectedDate)
                .maybeSingle();


        if (findError) {

            console.error(
                findError
            );

            if (message) {

                message.textContent =
                    "读取旧记录失败：" +
                    findError.message;

            }

            return;

        }


        let error = null;


        if (existing) {

            const result =
                await supabaseClient
                    .from("devotions")
                    .update(data)
                    .eq("id", existing.id);

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

            if (message) {

                message.textContent =
                    "保存失败：" +
                    error.message;

            }

            return;

        }


        if (message) {

            message.textContent =
                "✓ 今天的灵修已经保存。";

        }


        await loadHistory();

        await renderCalendar();

    }


    /* =========================
       日历
    ========================= */

    async function renderCalendar() {

        const calendarTitle =
            document.getElementById(
                "calendarTitle"
            );

        const calendarDays =
            document.getElementById(
                "calendarDays"
            );


        if (
            !calendarTitle ||
            !calendarDays
        ) {

            return;

        }


        calendarTitle.textContent =
            `${calendarYear}年${calendarMonth + 1}月`;


        calendarDays.innerHTML =
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


        /*
         * 获取这个月已有记录的日期
         */

        let recordDates =
            new Set();


        const {
            data: userData
        } =
            await supabaseClient.auth.getUser();


        if (userData.user) {

            const firstDate =
                `${calendarYear}-${String(
                    calendarMonth + 1
                ).padStart(2, "0")}-01`;


            const lastDate =
                `${calendarYear}-${String(
                    calendarMonth + 1
                ).padStart(2, "0")}-${String(
                    daysInMonth
                ).padStart(2, "0")`;


            const {
                data,
                error
            } =
                await supabaseClient
                    .from("devotions")
                    .select("date")
                    .eq(
                        "user_id",
                        userData.user.id
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

        }


        /*
         * 上个月最后几天
         */

        for (
            let i = startWeekday - 1;
            i >= 0;
            i--
        ) {

            const day =
                new Date(
                    calendarYear,
                    calendarMonth,
                    -i
                );


            createCalendarDay(
                day,
                true,
                recordDates,
                calendarDays
            );

        }


        /*
         * 本月
         */

        for (
            let dayNumber = 1;
            dayNumber <= daysInMonth;
            dayNumber++
        ) {

            const day =
                new Date(
                    calendarYear,
                    calendarMonth,
                    dayNumber
                );


            createCalendarDay(
                day,
                false,
                recordDates,
                calendarDays
            );

        }


        /*
         * 下个月前几天
         */

        const totalCells =
            startWeekday +
            daysInMonth;


        const remaining =
            totalCells % 7 === 0
                ? 0
                : 7 - (totalCells % 7);


        for (
            let i = 1;
            i <= remaining;
            i++
        ) {

            const day =
                new Date(
                    calendarYear,
                    calendarMonth + 1,
                    i
                );


            createCalendarDay(
                day,
                true,
                recordDates,
                calendarDays
            );

        }

    }


    /* =========================
       创建日历日期
    ========================= */

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
       点击日历日期
    ========================= */

    async function selectCalendarDate(
        dateString
    ) {

        selectedDate =
            dateString;


        const selectedDateObject =
            new Date(
                Number(
                    dateString.substring(
                        0,
                        4
                    )
                ),
                Number(
                    dateString.substring(
                        5,
                        7
                    )
                ) - 1,
                Number(
                    dateString.substring(
                        8,
                        10
                    )
                )
            );


        calendarYear =
            selectedDateObject.getFullYear();


        calendarMonth =
            selectedDateObject.getMonth();


        clearFields();


        const data =
            await getDevotionByDate(
                selectedDate
            );


        const message =
            document.getElementById(
                "message"
            );


        if (data) {

            fillFields(data);


            if (message) {

                message.textContent =
                    "✓ 已打开 " +
                    formatChineseDate(
                        selectedDate
                    ) +
                    " 的灵修记录。";

            }

        } else {

            if (message) {

                message.textContent =
                    formatChineseDate(
                        selectedDate
                    ) +
                    " 还没有灵修记录。";

            }

        }


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


        await renderCalendar();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =========================
       上个月
    ========================= */

    document
        .getElementById("prevMonth")
        .addEventListener(
            "click",
            async function () {

                calendarMonth--;

                if (
                    calendarMonth < 0
                ) {

                    calendarMonth = 11;

                    calendarYear--;

                }

                await renderCalendar();

            }
        );


    /* =========================
       下个月
    ========================= */

    document
        .getElementById("nextMonth")
        .addEventListener(
            "click",
            async function () {

                calendarMonth++;

                if (
                    calendarMonth > 11
                ) {

                    calendarMonth = 0;

                    calendarYear++;

                }

                await renderCalendar();

            }
        );


    /* =========================
       灵修历史
    ========================= */

    async function loadHistory() {

        const historyList =
            document.getElementById(
                "historyList"
            );


        if (!historyList) {

            return;

        }


        historyList.innerHTML =
            "<p>正在读取灵修历史……</p>";


        const {
            data: userData
        } =
            await supabaseClient.auth.getUser();


        const user =
            userData.user;


        if (!user) {

            historyList.innerHTML =
                "<p>请先登录后查看灵修历史。</p>";

            return;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("devotions")
                .select("*")
                .eq("user_id", user.id)
                .order(
                    "date",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "读取历史失败：",
                error
            );


            historyList.innerHTML =
                "<p>读取灵修历史失败。</p>";

            return;

        }


        historyList.innerHTML =
            "";


        if (
            !data ||
            data.length === 0
        ) {

            historyList.innerHTML =
                "<p>还没有灵修记录。</p>";

            return;

        }


        data.forEach(
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
       按钮事件
    ========================= */

    document
        .getElementById("signUpButton")
        .addEventListener(
            "click",
            signUp
        );


    document
        .getElementById("signInButton")
        .addEventListener(
            "click",
            signIn
        );


    document
        .getElementById("signOutButton")
        .addEventListener(
            "click",
            signOut
        );


    document
        .getElementById("saveButton")
        .addEventListener(
            "click",
            saveTodayData
        );


    /* =========================
       登录状态变化
    ========================= */

    supabaseClient.auth.onAuthStateChange(
        async function (
            event,
            session
        ) {

            updateAuthUI(
                session
                    ? session.user
                    : null
            );


            if (
                session &&
                session.user
            ) {

                await loadTodayFromSupabase();

                await loadHistory();

                await renderCalendar();

            }

        }
    );


    /* =========================
       启动
    ========================= */

    checkUser();

});
