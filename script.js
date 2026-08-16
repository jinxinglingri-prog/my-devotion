const fields = [
    "bibleReference",
    "bibleText",
    "reflection",
    "response",
    "prayer",
    "learning"
];

const today = new Date();

const dateString = today.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
});

document.getElementById("today").textContent = dateString;

function loadData() {

    fields.forEach(function(field) {

        const saved = localStorage.getItem(field);

        if (saved !== null) {
            document.getElementById(field).value = saved;
        }

    });
}

function saveData() {

    fields.forEach(function(field) {

        const value = document.getElementById(field).value;

        localStorage.setItem(field, value);

    });

    document.getElementById("message").textContent =
        "今天的灵修已经保存。";

}

document
    .getElementById("saveButton")
    .addEventListener("click", saveData);

loadData();