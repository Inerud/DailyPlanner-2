//TO-DO: finish edit
//add image/file saving
//add sorting to entries

document.addEventListener("DOMContentLoaded", function () {
    const journalTitle = document.getElementById("journal-title");
    const journalEntry = document.getElementById("journal-entry");
    const saveButton = document.getElementById("save-journal");
    const statusMessage = document.getElementById("status-message");
    const oldEntriesDiv = document.getElementById("oldentries");

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

    function autoResizeTextarea(textarea) {
        textarea.style.height = "auto"; // Reset height to recalculate
        textarea.style.height = textarea.scrollHeight + "px"; // Set new height based on content
    }

    // Function to make entry text editable
    function makeEntryEditable(element, entryId) {
        const currentText = element.textContent;
        const textarea = document.createElement("textarea");

        textarea.value = currentText;
        textarea.classList.add("edit-input");

        document.body.appendChild(textarea); // Temporarily add to measure height
        autoResizeTextarea(textarea);
        document.body.removeChild(textarea);

        // Adjust height dynamically as user types
        textarea.addEventListener("input", function () {
            autoResizeTextarea(this);
        });

        // Save on blur or Enter key press (Shift+Enter allows multi-line entry)
        textarea.addEventListener("blur", () => saveUpdatedEntry(textarea, entryId));
        textarea.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                saveUpdatedEntry(textarea, entryId);
            }
        });

        // Replace the text with an input field
        element.replaceWith(textarea);
        textarea.focus();
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
