//TO-DO: finish edit
//add image/file saving
//add sorting to entries

document.addEventListener("DOMContentLoaded", function () {
    const journalTitle = document.getElementById("journal-title");
    const journalEntry = document.getElementById("journal-entry");
    const saveButton = document.getElementById("save-journal");
    const statusMessage = document.getElementById("status-message");
    const oldEntriesDiv = document.getElementById("oldentries");
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
            entryTitle = new Date().toLocaleDateString();
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

    //closeModal.addEventListener("click", closeEditModal);

    // saveEditButton.addEventListener("click", async function () {
    //     if (currentEntryId) {
    //         const updatedText = editEntryText.value.trim();
    //         if (updatedText) {
    //             const result = await updateEntry(currentEntryId, updatedText);
    //             if (result.success) {
    //                 alert("Entry updated successfully!");
    //                 closeEditModal();
    //                 fetchEntries(); // Refresh the entries list
    //             } else {
    //                 alert("Failed to update the entry.");
    //             }
    //         } else {
    //             alert("Please enter some text to save.");
    //         }
    //     }
    // });

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

            if (data.entries && data.entries.length > 0) {
                oldEntriesDiv.innerHTML = "";  // Clears previous entries

                //group entries by "Month Year"
                const groupedEntries = new Map();

                data.entries.forEach(entry => {
                    const createdAt = new Date(entry.created_at);
                    const day = createdAt.getDate();
                    const monthYear = createdAt.toLocaleString("default", { month: "long", year: "numeric" });

                    if (!groupedEntries.has(monthYear)) {
                        groupedEntries.set(monthYear, []);
                    }

                    groupedEntries.get(monthYear).push({ id: entry.id, day, entry });
                });


                // Render grouped entries with month headings
                groupedEntries.forEach((entries, monthYear) => {
                    // Create month heading
                    const monthHeading = document.createElement("h2");
                    monthHeading.textContent = monthYear;
                    oldEntriesDiv.appendChild(monthHeading);

                    entries.forEach(({ id, day, entry }) => {
                        const entryDiv = document.createElement("div");
                        entryDiv.classList.add("oldentry");
                        entryDiv.innerHTML = `
                            <div class="date">${day}</div>
                            <div class="entry" data-id="${id}">
                                <h4>${entry.entry_title}</h4>
                                <p class="entry-text">${entry.entry}</p>
                            </div>`;

                        entryDiv.querySelector(".entry").addEventListener("click", function () {
                            makeEntryEditable(this.querySelector(".entry-text"), id);
                        });

                        oldEntriesDiv.appendChild(entryDiv);
                    });
                });

                // // Add event listeners to all edit buttons
                // document.querySelectorAll('.edit-entry-button').forEach(button => {
                //     button.addEventListener('click', function () {
                //         const entryId = this.getAttribute('data-id');
                //         const entryText = this.getAttribute('data-text');
                //         openEditModal(entryId, entryText);
                //     });
                // });

                // // Add event listeners to all delete buttons
                // document.querySelectorAll('.delete-entry-button').forEach(button => {
                //     button.addEventListener('click', function () {
                //         const entryId = this.getAttribute('data-id');
                //         deleteEntry(entryId);
                //     });
                // });
            }
        } catch (error) {
            console.error("Error fetching journal entries:", error);
        }
    }

    // Function to make entry text editable
    function makeEntryEditable(element, entryId) {
        const currentText = element.textContent;
        const inputField = document.createElement("input");

        inputField.type = "text";
        inputField.value = currentText;
        inputField.classList.add("entry-input");

        // Replace the text with an input field
        element.replaceWith(inputField);
        inputField.focus();

        // Save changes on blur (clicking outside) or pressing Enter
        inputField.addEventListener("blur", () => saveUpdatedEntry(inputField, entryId));
        inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                saveUpdatedEntry(inputField, entryId);
            }
        });
    }

    // Function to save updated entry
    async function saveUpdatedEntry(inputField, entryId) {
        const updatedText = inputField.value.trim();
        if (!updatedText) return;

        try {
            // Send the updated text to the server
            await fetch(`/api/journal/${entryId}`, {
                method: "PUT", // Adjust this if your API requires PATCH instead
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entry: updatedText })
            });

            // Create a new paragraph to replace the input field
            const newTextElement = document.createElement("p");
            newTextElement.textContent = updatedText;
            newTextElement.classList.add("entry-text");
            newTextElement.setAttribute("data-id", entryId);

            // Add click-to-edit functionality again
            newTextElement.addEventListener("click", function () {
                makeEntryEditable(this, entryId);
            });

            // Replace the input field with the updated text
            inputField.replaceWith(newTextElement);
        } catch (error) {
            console.error("Error updating entry:", error);
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
