document.addEventListener("DOMContentLoaded", function () {
    const journalEntry = document.getElementById("journal-entry");
    const saveButton = document.getElementById("save-journal");
    const statusMessage = document.getElementById("status-message");
    const oldEntriesDiv = document.getElementById("old-entries");


    // Load saved journal entry from the database when the page loads
    fetchEntries();

    // Save journal entry to localStorage
    saveButton.addEventListener("click", async function () {
        const entryText = journalEntry.value.trim();
        if (entryText) {
            const response = await addEntry(entryText);
            if (response.success) {
                statusMessage.textContent = "Journal entry saved!";
                statusMessage.style.color = "green";
            } else {
                statusMessage.textContent = "Failed to save journal entry.";
                statusMessage.style.color = "red";
            }
        } else {
            statusMessage.textContent = "Journal entry cannot be empty.";
            statusMessage.style.color = "red";
        }

        setTimeout(() => {
            statusMessage.textContent = "";
        }, 2000);
    });


    async function addEntr(entryText) {
        try {
            const response = await fetch("/api/journal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ entry: entryText }),
            });
            return await response.json();
        } catch (error) {
            console.error("Error adding journal entry:", error);
            return { success: false };
        }
    }

    async function fetchEntries() {
        try {
            const response = await fetch("/api/journal");
            const data = await response.json();
            // Display the latest entry in the textarea
            if (data.entry) {
                journalEntry.value = data.entry;
            }

            // Display all previous entries in the 'old-entries' div
            if (data.entries && data.entries.length > 0) {
                oldEntriesDiv.innerHTML = "<h3>Previous Entries</h3>";  // Reset previous entries header
                data.entries.forEach(entry => {
                    const entryDiv = document.createElement("div");
                    entryDiv.classList.add("journal-entry");
                    entryDiv.innerHTML = `<p>${entry.entry}</p><p><small>Created at: ${entry.created_at}</small></p>`;
                    oldEntriesDiv.appendChild(entryDiv);
                });
            }
        } catch (error) {
            console.error("Error fetching journal entries:", error);
        }
    }

    async function updateEntry(entryId, entryText) {
        try {
            const response = await fetch(`/api/journal/${entryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ entry: entryText }),
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating journal entry:", error);
            return { success: false };
        }
    }

    async function deleteEntry(entryId) {
        try {
            const response = await fetch(`/api/journal/${entryId}`, {
                method: "DELETE",
            });
            return await response.json();
        } catch (error) {
            console.error("Error deleting journal entry:", error);
            return { success: false };
        }
    }

});
