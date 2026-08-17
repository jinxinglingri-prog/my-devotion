document.addEventListener("DOMContentLoaded", async function () {


    /* ==================================================
       Supabase 设置
    ================================================== */

    const SUPABASE_URL =
        "https://asfqtznfhljxwfktuido.supabase.co";


    const SUPABASE_KEY =
        "sb_publishable_Vu7U10XTkqZaOPa-cj9BXQ_TKxgkEwy";


    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );



    /* ==================================================
       灵修字段
    ================================================== */

    const fields = [
        "bibleReference",
        "bibleText",
        "reflection",
        "response",
        "prayer",
        "learning"
    ];



    /* ==================================================
       今天日期
    ================================================== */

    let currentDate =
        new Date();


    let calendarDate =
        new Date();



    function getDateKey(date) {

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



    const todayKey =
        getDateKey(currentDate);



    /* ==================================================
       页面日期
    ================================================== */

    const todayElement =
        document.getElementById("today");


    if (todayElement) {

        todayElement.textContent =
            currentDate.toLocaleDateString(
                "zh-CN",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long"
                }
            );

    }



    /* ==================================================
       获取元素
    ================================================== */

    const saveButton =
        document.getElementById(
            "saveButton"
        );


    const message =
        document.getElementById(
            "message"
        );


    const authStatus =
        document.getElementById(
            "authStatus"
        );


    const authMessage =
        document.getElementById(
            "authMessage"
        );


    const authForm =
        document.getElementById(
            "authForm"
        );


    const loggedInArea =
        document.getElementById(
            "loggedInArea"
        );


    const userEmail =
        document.getElementById(
            "userEmail"
        );


    const emailInput =
        document.getElementById(
            "email"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const signUpButton =
        document.getElementById(
            "signUpButton"
        );


    const signInButton =
        document.getElementById(
            "signInButton"
        );


    const signOutButton =
        document.getElementById(
            "signOutButton"
        );


    const historyList =
        document.getElementById(
            "historyList"
        );


    const calendarGrid =
        document.getElementById(
            "calendarGrid"
        );


    const calendarTitle =
        document.getElementById(
            "calendarTitle"
        );


    const prevMonthButton =
        document.getElementById(
            "prevMonthButton"
        );


    const nextMonthButton =
        document.getElementById(
            "nextMonthButton"
        );



    /* ==================================================
       当前登录用户
    ================================================== */

    let currentUser = null;



    /* ==================================================
       设置消息
    ================================================== */

    function showMessage(text) {

        if (message) {

            message.textContent =
                text;

        }

    }


    function showAuthMessage(text) {

        if (authMessage) {

            authMessage.textContent =
                text;

        }

    }



    /* ==================================================
       读取当前登录状态
    ================================================== */

    async function checkUser() {

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

            currentUser = null;

            updateAuthUI();

            return;

        }


        currentUser =
            data.user || null;


        updateAuthUI();


        if (currentUser) {

            await loadTodayData();

            await loadHistory();

            renderCalendar();

        } else {

            clearForm();

            renderCalendar();

            renderEmptyHistory();

        }

    }



    /* ==================================================
       更新登录界面
    ================================================== */

    function updateAuthUI() {

        if (!authStatus) {
            return;
        }


        if (currentUser) {

            authStatus.textContent =
                "你的灵修已经连接到云端。";


            if (userEmail) {

                userEmail.textContent =
                    currentUser.email || "";

            }


            if (authForm) {

                authForm.classList.add(
                    "hidden"
                );

            }


            if (loggedInArea) {

                loggedInArea.classList.remove(
                    "hidden"
                );

            }


            if (saveButton) {

                saveButton.disabled =
                    false;

            }

        } else {

            authStatus.textContent =
                "请先注册或登录，才能保存云端灵修。";


            if (authForm) {

                authForm.classList.remove(
                    "hidden"
                );

            }


            if (loggedInArea) {

                loggedInArea.classList.add(
                    "hidden"
                );

            }


            if (saveButton) {

                saveButton.disabled =
                    true;

            }

        }

    }



    /* ==================================================
       清空表单
    ================================================== */

    function clearForm() {

        fields.forEach(function (field) {

            const element =
                document.getElementById(
                    field
                );

            if (element) {

                element.value =
                    "";

            }

        });

    }



    /* ==================================================
       获取表单数据
    ================================================== */

    function getFormData() {

        const data = {};


        fields.forEach(function (field) {

            const element =
                document.getElementById(
                    field
                );


            data[field] =
                element
                    ? element.value
                    : "";

        });


        return data;

    }



    /* ==================================================
       把数据库字段转换成表单数据
    ================================================== */

    function fillForm(data) {

        fields.forEach(function (field) {

            const element =
                document.getElementById(
                    field
                );


            if (
                element &&
                data &&
                data[field] !== undefined
            ) {

                element.value =
                    data[field] || "";

            }

        });

    }



    /* ==================================================
       从 Supabase 读取今天的灵修
    ================================================== */

    async function loadTodayData() {

        if (!currentUser) {
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("devotions")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "date",
                    todayKey
                )
                .maybeSingle();


        if (error) {

            console.error(
                "读取今天灵修失败：",
                error
            );

            showMessage(
                "读取今天的灵修失败。"
            );

            return;

        }


        if (data) {

            fillForm(data);

            showMessage(
                "已读取今天的灵修。"
            );

        } else {

            clearForm();

            showMessage("");

        }

    }



    /* ==================================================
       保存今天的灵修
    ================================================== */

    async function saveTodayData() {

        if (!currentUser) {

            showMessage(
                "请先登录，再保存灵修。"
            );

            return;

        }


        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                "正在保存……";

        }


        const formData =
            getFormData();


        try {


            /*
             * 先检查今天是否已经存在记录
             */

            const {
                data: existing,
                error: findError
            } =
                await supabaseClient
                    .from("devotions")
                    .select("id")
                    .eq(
                        "user_id",
                        currentUser.id
                    )
                    .eq(
                        "date",
                        todayKey
                    )
                    .maybeSingle();


            if (findError) {

                throw findError;

            }



            /*
             * 如果存在，就更新
             */

            if (existing) {


                const {
                    error: updateError
                } =
                    await supabaseClient
                        .from("devotions")
                        .update({

                            bible_reference:
                                formData.bibleReference,

                            bible_text:
                                formData.bibleText,

                            reflection:
                                formData.reflection,

                            response:
                                formData.response,

                            prayer:
                                formData.prayer,

                            learning:
                                formData.learning

                        })
                        .eq(
                            "id",
                            existing.id
                        );


                if (updateError) {

                    throw updateError;

                }


            } else {


                /*
                 * 如果不存在，就新建
                 */

                const {
                    error: insertError
                } =
                    await supabaseClient
                        .from("devotions")
                        .insert({

                            user_id:
                                currentUser.id,

                            date:
                                todayKey,

                            bible_reference:
                                formData.bibleReference,

                            bible_text:
                                formData.bibleText,

                            reflection:
                                formData.reflection,

                            response:
                                formData.response,

                            prayer:
                                formData.prayer,

                            learning:
                                formData.learning

                        });


                if (insertError) {

                    throw insertError;

                }

            }



            showMessage(
                "✓ 今天的灵修已经保存到云端。"
            );


            await loadHistory();

            renderCalendar();


        } catch (error) {

            console.error(
                "保存灵修失败：",
                error
            );


            showMessage(
                "保存失败：" +
                (
                    error.message ||
                    "请检查 Supabase 设置。"
                )
            );


        } finally {


            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "保存今天的灵修";

            }

        }

    }



    /* ==================================================
       注册
    ================================================== */

    async function signUp() {

        const email =
            emailInput
                ? emailInput.value.trim()
                : "";


        const password =
            passwordInput
                ? passwordInput.value
                : "";


        if (!email || !password) {

            showAuthMessage(
                "请输入邮箱和密码。"
            );

            return;

        }


        if (password.length < 6) {

            showAuthMessage(
                "密码至少需要 6 位。"
            );

            return;

        }


        signUpButton.disabled =
            true;


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
                            password,

                        options: {

                            emailRedirectTo:
                                "https://jinxinglingri-prog.github.io/my-devotion/"

                        }

                    });


            if (error) {

                throw error;

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
                    "注册成功，已经登录。"
                );

            }


        } catch (error) {

            console.error(
                "注册失败：",
                error
            );


            showAuthMessage(
                "注册失败：" +
                (
                    error.message ||
                    "请稍后再试。"
                )
            );

        } finally {

            signUpButton.disabled =
                false;

        }

    }



    /* ==================================================
       登录
    ================================================== */

    async function signIn() {

        const email =
            emailInput
                ? emailInput.value.trim()
                : "";


        const password =
            passwordInput
                ? passwordInput.value
                : "";


        if (!email || !password) {

            showAuthMessage(
                "请输入邮箱和密码。"
            );

            return;

        }


        signInButton.disabled =
            true;


        showAuthMessage(
            "正在登录……"
        );


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

                throw error;

            }


            currentUser =
                data.user;


            showAuthMessage(
                "登录成功。"
            );


            updateAuthUI();


            await loadTodayData();

            await loadHistory();

            renderCalendar();


        } catch (error) {

            console.error(
                "登录失败：",
                error
            );


            showAuthMessage(
                "登录失败：" +
                (
                    error.message ||
                    "邮箱或密码可能不正确。"
                )
            );


        } finally {

            signInButton.disabled =
                false;

        }

    }



    /* ==================================================
       登出
    ================================================== */

    async function signOut() {

        const {
            error
        } =
            await supabaseClient
                .auth
                .signOut();


        if (error) {

            console.error(
                "退出登录失败：",
                error
            );

            return;

        }


        currentUser =
            null;


        clearForm();

        updateAuthUI();

        renderEmptyHistory();

        renderCalendar();

        showMessage("");

        showAuthMessage(
            "已经退出登录。"
        );

    }



    /* ==================================================
       读取所有历史记录
    ================================================== */

    async function loadHistory() {

        if (!currentUser) {

            renderEmptyHistory();

            return [];

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("devotions")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "date",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "读取历史记录失败：",
                error
            );


            if (historyList) {

                historyList.innerHTML =
                    "<p class='no-history'>读取历史记录失败。</p>";

            }


            return [];

        }


        window.devotionRecords =
            data || [];


        renderHistory(
            window.devotionRecords
        );


        return window.devotionRecords;

    }



    /* ==================================================
       显示历史记录
    ================================================== */

    function renderHistory(records) {

        if (!historyList) {
            return;
        }


        historyList.innerHTML =
            "";


        if (!records || records.length === 0) {

            renderEmptyHistory();

            return;

        }


        records.forEach(function (record) {


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


            if (record.reflection) {

                let preview =
                    record.reflection
                        .replace(
                            /\s+/g,
                            " "
                        );


                if (preview.length > 80) {

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
                        record
                    );

                }
            );


            historyList.appendChild(
                item
            );

        });

    }



    /* ==================================================
       没有历史记录
    ================================================== */

    function renderEmptyHistory() {

        if (!historyList) {
            return;
        }


        historyList.innerHTML =
            `
            <p class="no-history">
                登录后，你的灵修记录会显示在这里。
            </p>
            `;

    }



    /* ==================================================
       打开历史记录
    ================================================== */

    function loadHistoryRecord(record) {

        if (!record) {
            return;
        }


        fillForm(record);


        showMessage(
            "✓ 已打开 " +
            record.date +
            " 的灵修记录。"
        );


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }



    /* ==================================================
       日历
    ================================================== */

    function renderCalendar() {

        if (
            !calendarGrid ||
            !calendarTitle
        ) {

            return;

        }


        const year =
            calendarDate.getFullYear();


        const month =
            calendarDate.getMonth();


        calendarTitle.textContent =
            `${year}年${month + 1}月`;


        calendarGrid.innerHTML =
            "";


        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();


        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        const daysInPreviousMonth =
            new Date(
                year,
                month,
                0
            ).getDate();


        const records =
            window.devotionRecords ||
            [];


        const recordDates =
            new Set(
                records.map(
                    function (record) {
                        return record.date;
                    }
                )
            );



        /*
         * 上个月日期
         */

        for (
            let i = firstDay - 1;
            i >= 0;
            i--
        ) {

            const day =
                daysInPreviousMonth -
                i;


            const cell =
                createCalendarDay(
                    day,
                    true
                );


            calendarGrid.appendChild(
                cell
            );

        }



        /*
         * 本月日期
         */

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {


            const dateKey =
                `${year}-${String(
                    month + 1
                ).padStart(2, "0")}-${String(
                    day
                ).padStart(2, "0")}`;


            const cell =
                createCalendarDay(
                    day,
                    false
                );


            if (
                dateKey === todayKey
            ) {

                cell.classList.add(
                    "today"
                );

            }


            if (
                recordDates.has(
                    dateKey
                )
            ) {

                cell.classList.add(
                    "has-record"
                );


                cell.addEventListener(
                    "click",
                    function () {

                        const record =
                            records.find(
                                function (item) {
                                    return (
                                        item.date ===
                                        dateKey
                                    );
                                }
                            );


                        if (record) {

                            loadHistoryRecord(
                                record
                            );

                        }

                    }
                );

            }


            calendarGrid.appendChild(
                cell
            );

        }



        /*
         * 下个月日期
         */

        const totalCells =
            firstDay +
            daysInMonth;


        const remaining =
            Math.ceil(
                totalCells / 7
            ) * 7 -
            totalCells;


        for (
            let day = 1;
            day <= remaining;
            day++
        ) {

            const cell =
                createCalendarDay(
                    day,
                    true
                );


            calendarGrid.appendChild(
                cell
            );

        }

    }



    /* ==================================================
       创建日历日期
    ================================================== */

    function createCalendarDay(
        day,
        otherMonth
    ) {

        const cell =
            document.createElement(
                "button"
            );


        cell.type =
            "button";


        cell.className =
            "calendar-day";


        cell.textContent =
            day;


        if (otherMonth) {

            cell.classList.add(
                "other-month"
            );

        }


        return cell;

    }



    /* ==================================================
       上个月
    ================================================== */

    if (prevMonthButton) {

        prevMonthButton.addEventListener(
            "click",
            function () {

                calendarDate.setMonth(
                    calendarDate.getMonth() - 1
                );


                renderCalendar();

            }
        );

    }



    /* ==================================================
       下个月
    ================================================== */

    if (nextMonthButton) {

        nextMonthButton.addEventListener(
            "click",
            function () {

                calendarDate.setMonth(
                    calendarDate.getMonth() + 1
                );


                renderCalendar();

            }
        );

    }



    /* ==================================================
       按钮事件
    ================================================== */

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveTodayData
        );

    }


    if (signUpButton) {

        signUpButton.addEventListener(
            "click",
            signUp
        );

    }


    if (signInButton) {

        signInButton.addEventListener(
            "click",
            signIn
        );

    }


    if (signOutButton) {

        signOutButton.addEventListener(
            "click",
            signOut
        );

    }



    /* ==================================================
       监听登录状态变化
    ================================================== */

    supabaseClient
        .auth
        .onAuthStateChange(
            async function (
                event,
                session
            ) {

                currentUser =
                    session
                        ? session.user
                        : null;


                updateAuthUI();


                if (currentUser) {

                    await loadTodayData();

                    await loadHistory();

                    renderCalendar();

                } else {

                    clearForm();

                    renderEmptyHistory();

                    renderCalendar();

                }

            }
        );



    /* ==================================================
       初始化
    ================================================== */

    window.devotionRecords =
        [];


    renderCalendar();

    updateAuthUI();


    await checkUser();

});
