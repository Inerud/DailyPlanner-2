document.addEventListener("DOMContentLoaded", function () {
    const journalEntry = document.getElementById("journal-entry");
    const saveButton = document.getElementById("save-journal");
    const statusMessage = document.getElementById("status-message");
    const { query, execute } = require("../../server/config/db");

    // // Load saved journal entry from localStorage
    // const savedEntry = localStorage.getItem("journalEntry");
    // if (savedEntry) {
    //     journalEntry.value = savedEntry;
    // }

    // Save journal entry to localStorage
    saveButton.addEventListener("click", function () {
        localStorage.setItem("journalEntry", journalEntry.value);
        statusMessage.textContent = "Journal entry saved!";
        statusMessage.style.color = "green";

        setTimeout(() => {
            statusMessage.textContent = "";
        }, 2000);
    });


    function addEntry(

    );

    function fetchEntry(

    );

    function updateEntry(

    );

    function deleteEntry(

    );
});
