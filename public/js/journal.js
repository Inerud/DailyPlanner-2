    //TO-DO: finish edit
    //add image/file saving
    //add sorting to entries

document.addEventListener("DOMContentLoaded", function () {
    const journalTitle = document.getElementById("journal-title");
    const journalEntry = document.getElementById("journal-entry");
    const saveButton = document.getElementById("save-journal");
    const statusMessage = document.getElementById("status-message");
    const oldEntriesDiv = document.getElementById("old-entries");
    const editButton = document.getElementById("edit-journal");
    const editModal = document.getElementById("editModal");
    const closeModal = document.getElementById("closeModal");
    const editEntryText = document.getElementById("editEntryText");
    const saveEditButton = document.getElementById("saveEditButton");

    let currentEntryId = null;

    // Load saved journal entry from the database when the page loads
    fetchEntries();

    // Save journal entry to localStorage
    saveButton.addEventListener("click", async function () {
        let entryTitle = journalTitle.value.trim();
        const entryText = journalEntry.value.trim();

        if (entryTitle === "") {
            entryTitle = new Date();
        }

        if (entryText) {
            const response = await addEntry(entryText, entryTitle);
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

    closeModal.addEventListener("click", closeEditModal);

    saveEditButton.addEventListener("click", async function () {
        if (currentEntryId) {
            const updatedText = editEntryText.value.trim();
            if (updatedText) {
                const result = await updateEntry(currentEntryId, updatedText);
                if (result.success) {
                    alert("Entry updated successfully!");
                    closeEditModal();
                    fetchEntries(); // Refresh the entries list
                } else {
                    alert("Failed to update the entry.");
                }
            } else {
                alert("Please enter some text to save.");
            }
        }
    });

    async function addEntry(entryText, entryTitle) {
        try {
            const response = await fetch("/api/journal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ entryTitle: entryTitle, entry: entryText }),
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

            // Display all previous entries in the 'old-entries' div
            if (data.entries && data.entries.length > 0) {
                oldEntriesDiv.innerHTML = "<h3>Previous Entries</h3>";  // Reset previous entries header

                data.entries.forEach(entry => {
                    const entryDiv = document.createElement("div");
                    entryDiv.classList.add("journal-title-dis");
                    entryDiv.classList.add("journal-entry-dis");
                    entryDiv.innerHTML = `
                        <h4>${entry.entry_title}</h4>
                        <p>${entry.entry}</p>
                        <p><small>Created at: ${entry.created_at}</small></p>
                        <button class="edit-entry-button" data-id="${entry.id}" data-text="${entry.entry}">Edit</button>
                        <button class="delete-entry-button" data-id="${entry.id}" ">Delete</button>`;
                        
                    oldEntriesDiv.appendChild(entryDiv);
                });

                // Add event listeners to all edit buttons
                document.querySelectorAll('.edit-entry-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const entryId = this.getAttribute('data-id');
                        const entryText = this.getAttribute('data-text');
                        openEditModal(entryId, entryText);
                    });
                });

                // Add event listeners to all delete buttons
                document.querySelectorAll('.delete-entry-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const entryId = this.getAttribute('data-id');
                        deleteEntry(entryId);
                    });
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

    function openEditModal(entryId, entryText) {
        currentEntryId = entryId;
        editEntryText.value = entryText;
        editModal.style.display = "block";
    }

    function closeEditModal() {
        editModal.style.display = "none";
        currentEntryId = null;
        editEntryText.value = "";
    }

});
