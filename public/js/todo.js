//TODO LIST:
// Change color of finished tasks and todays tasks
// Different shades for priorities. Eg. Todays tasks different greens. Future tasks different shades of blue
// add symbols for edit, delete, and done
// add a maximum of records shown at once
// tag functionality?
// add user feedback for add (fill inn necessary fields)

document.addEventListener("DOMContentLoaded", () => {
    const addButton = document.getElementById("addButton");
    const loadMoreButton = document.getElementById("loadMoreButton");
    const toggleCompletedButton = document.getElementById("toggleCompletedButton");
    const oldTodoSection = document.querySelector(".old-todo-section");
    const oldTodoList = document.querySelector(".oldtodotable tbody");

    let todos = []; // Store fetched todos
    let currentSort = { column: null, order: "asc" }; // Track sorting state
    let oldTodos = []; // Store old todos (from yesterday or older)
    let filteredOldTodos = []; // Filtered version of old todos based on completed status
    let currentPage = 0; // Page for old todos pagination
    let showCompleted = false; // Flag to toggle between completed and uncompleted todos

    async function fetchTodos() {
        try {
            const response = await fetch("/api/todos", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            const data = await response.json();
    
            if (!data.success) {
                console.error("Failed to fetch todos:", data.message);
                return;
            }
    
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize time to start of today
    
            // Separate future/current todos from old todos
            todos = data.todos.filter(todo => new Date(todo.date) >= today);
            oldTodos = data.todos.filter(todo => new Date(todo.date) < today);
    
            displayTodos(todos);
            filterAndDisplayOldTodos();
    
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    }
    

    function displayTodos(todos) {
        const tableBody = document.querySelector(".todotable tbody");
        if (!tableBody) {
            console.error("Error: Table body element not found.");
            return;
        }

        tableBody.innerHTML = ""; // Clear existing rows

        if (!Array.isArray(todos) || todos.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='8'>No to-dos found.</td></tr>";
            return;
        }

        todos.forEach((todo) => {
            const row = document.createElement("tr");
            row.dataset.id = todo.id; // Store todo ID for editing
            row.innerHTML = `
                <td class="date">${todo.date ? formatDate(todo.date) : "—"}</td>
                <td class="time">${todo.time || "—"}</td>
                <td class="priority">${todo.priority || "Low"}</td>
                <td class="recurring">${todo.recurring || "None"}</td>
                <td class="to-do">${todo.description}</td>
                <!-- <td class="tags">${todo.tags || "—"}</td> -->
                <td class="done">
                    <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${todo.completed ? "checked" : ""}>
                </td>
                <td class="edit">
                    <button class="editButton">Edit</button>
                </td>
            `;

            tableBody.appendChild(row);

            // Attach event listener to Edit button
            row.querySelector(".editButton").addEventListener("click", function () {
                toggleEdit(row, todo);
            });

            // Attach event listener to the checkbox for toggling completion
            row.querySelector(".todo-checkbox").addEventListener("change", function (event) {
                const id = event.target.dataset.id;  // Get todo ID from data attribute
                const isChecked = event.target.checked; // Get checkbox state
                toggleDone(id, isChecked);  // Call toggle function
            });
        });

    }


    addButton.addEventListener("click", async function () {
        const tableBody = document.querySelector(".todotable tbody");

        // Create a new row for adding a todo
        const newRow = document.createElement("tr");
        newRow.classList.add("editing"); // Add 'editing' class to style it
        newRow.innerHTML = `
        <td><input type="date" class="edit-date" value=""></td>
        <td><input type="time" class="edit-time" value=""></td>
        <td>
            <select class="edit-priority">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
        </td>
        <td>
            <select class="edit-recurring">
                <option value="None">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
            </select>
        </td>
        <td><input type="text" class="edit-description" placeholder="Enter task"></td>
        <td><input type="text" class="edit-tags" placeholder="Tags (comma separated)"></td>
        <td class="done">
            <input type="checkbox" class="edit-done">
        </td>
        <td class="edit">
            <button class="saveButton">Save</button>
        </td>
        `;

        tableBody.appendChild(newRow);

        // Attach event listener to Save button
        newRow.querySelector(".saveButton").addEventListener("click", function () {
            saveNewTodo(newRow);
        });
    });

    async function saveNewTodo(row) {
        const newTodo = {
            date: row.querySelector(".edit-date").value,
            time: row.querySelector(".edit-time").value,
            priority: row.querySelector(".edit-priority").value,
            recurring: row.querySelector(".edit-recurring").value,
            description: row.querySelector(".edit-description").value,
             // tags: row.querySelector(".edit-tags").value,
            completed: row.querySelector(".edit-done").checked,
        };

        try {
            const response = await fetch("/api/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTodo),
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Failed to add todo:", data.message);
                return;
            }

            // Refresh the todo list after adding
            fetchTodos();
        } catch (error) {
            console.error("Error adding todo:", error);
        }
    }

    async function deleteTodo(todoId) {
        if (!confirm("Are you sure you want to delete this to-do?")) return;

        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Failed to delete todo:", data.message);
                return;
            }

            // Refresh the list after deletion
            fetchTodos();
        } catch (error) {
            console.error("Error deleting todo:", error);
        }
    }


    async function toggleDone(id, isChecked) {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: isChecked }),
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Failed to update todo status:", data.message);
            }
        } catch (error) {
            console.error("Error updating todo status:", error);
        }
    }

    // Function to toggle between Edit and Save mode
    function toggleEdit(row, todo) {
        const isEditing = row.classList.contains("editing");

        if (!isEditing) {
            const formattedDate = todo.date ? todo.date.split("T")[0] : "";

            row.innerHTML = `
                <td><input type="date" class="edit-date" value="${formattedDate}"></td>
                <td><input type="time" class="edit-time" value="${todo.time || ''}"></td>
                <td>
                    <select class="edit-priority">
                        <option value="Low" ${todo.priority === "Low" ? "selected" : ""}>Low</option>
                        <option value="Medium" ${todo.priority === "Medium" ? "selected" : ""}>Medium</option>
                        <option value="High" ${todo.priority === "High" ? "selected" : ""}>High</option>
                    </select>
                </td>
                <td>
                    <select class="edit-recurring">
                        <option value="None" ${todo.recurring === "None" ? "selected" : ""}>None</option>
                        <option value="Daily" ${todo.recurring === "Daily" ? "selected" : ""}>Daily</option>
                        <option value="Weekly" ${todo.recurring === "Weekly" ? "selected" : ""}>Weekly</option>
                    </select>
                </td>
                <td><input type="text" class="edit-description" value="${todo.description}"></td>
                <td><input type="text" class="edit-tags" value="${todo.tags || ''}"></td>
                <td class="done">
                    <button class="deleteButton">Delete</button>
                </td>
                <td class="edit">
                    <button class="saveButton">Save</button>
                </td>
            `;

            row.classList.add("editing");

            // Attach event listener to Save button
            row.querySelector(".saveButton").addEventListener("click", function () {
                saveEdit(row, todo.id);
            });

            // Attach event listener to Delete button
            row.querySelector(".deleteButton").addEventListener("click", function () {
                deleteTodo(todo.id);
            });
        }
    }


    // Function to save edited data
    async function saveEdit(row, todoId) {
        const updatedTodo = {
            date: row.querySelector(".edit-date").value,
            priority: row.querySelector(".edit-priority").value,
            time: row.querySelector(".edit-time").value,
            recurring: row.querySelector(".edit-recurring").value,
            description: row.querySelector(".edit-description").value,
            // tags: row.querySelector(".edit-tags").value,
        };

        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTodo),
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Failed to update todo:", data.message);
                return;
            }

            // Re-fetch the todo list after updating
            fetchTodos();
        } catch (error) {
            console.error("Error updating todo:", error);
        }
    }


    //sorting 
    function sortTodos(column) {
        if (currentSort.column === column) {
            currentSort.order = currentSort.order === "asc" ? "desc" : "asc"; // Toggle order
        } else {
            currentSort.column = column;
            currentSort.order = "asc"; // Default to ascending
        }

        todos.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            // Handle different data types
            if (column === "date") {
                valA = new Date(valA).getTime() || 0;
                valB = new Date(valB).getTime() || 0;
            } else if (column === "priority") {
                const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                valA = priorityOrder[valA] || 0;
                valB = priorityOrder[valB] || 0;
            } else if (column === "time") {
                // Convert "HH:MM" to a number (e.g., "08:30" → 830)
                valA = valA ? parseInt(valA.replace(":", ""), 10) : 0;
                valB = valB ? parseInt(valB.replace(":", ""), 10) : 0;
            } else {
                // Convert to lowercase for case-insensitive sorting
                valA = valA ? valA.toString().toLowerCase() : "";
                valB = valB ? valB.toString().toLowerCase() : "";
            }

            return currentSort.order === "asc"
                ? valA > valB ? 1 : valA < valB ? -1 : 0
                : valA < valB ? 1 : valA > valB ? -1 : 0;
        });

        displayTodos(todos);
        updateArrows(column);
    }

    function updateArrows(sortedColumn) {
        const headers = document.querySelectorAll(".todotable th");

        headers.forEach(header => {
            const arrow = header.querySelector(".arrow");

            if (header.dataset.column === sortedColumn) {
                // Update arrow direction based on the sort order
                if (currentSort.order === "asc") {
                    arrow.innerHTML = "&#11205;"; // Up arrow
                } else {
                    arrow.innerHTML = "&#11206;"; // Down arrow
                }
                header.classList.add("sorted");
            } else {
                // Remove arrow if the column is not sorted
                arrow.innerHTML = "";
                header.classList.remove("sorted");
            }
        });
    }


    function setUpSorting() {
        document.querySelectorAll(".todotable th").forEach(header => {
            header.addEventListener("click", () => {
                const column = header.dataset.column;
                if (column) sortTodos(column);
            });
        });
    }

    function filterAndDisplayOldTodos() {
        filteredOldTodos = oldTodos.filter(todo => showCompleted || !todo.completed); // Show only uncompleted by default

        // Sort by most recent (most recent date first)
        filteredOldTodos.sort((a, b) => new Date(b.date) - new Date(a.date));

        displayOldTodos();
    }

    // Function to display the filtered old todos with pagination
    // Function to display the filtered old todos with pagination
    function displayOldTodos() {
        filteredOldTodos = oldTodos.filter(todo => showCompleted || !todo.completed); // Filter completed todos based on visibility

        // Sort by most recent (most recent date first)
        filteredOldTodos.sort((a, b) => new Date(b.date) - new Date(a.date));

        const todosToShow = filteredOldTodos.slice(currentPage * 5, (currentPage + 1) * 5);

        // Clear current old todo list
        oldTodoList.innerHTML = ""; // Now targeting tbody

        if (todosToShow.length === 0) {
            oldTodoList.innerHTML = "<tr><td colspan='8'>No old todos found.</td></tr>"; // Use tr for the no todos message
            loadMoreButton.style.display = "none"; // Hide the load more button if no todos are found
            return;
        }

        todosToShow.forEach(todo => {
            const row = document.createElement("tr");
            row.classList.add("old-todo-item");
            row.innerHTML = `
            <td>${todo.date ? formatDate(todo.date) : "—"}</td>
            <td>${todo.time || "—"}</td>
            <td>${todo.priority || "Low"}</td>
            <td>${todo.recurring || "None"}</td>
            <td>${todo.description}</td>
            <!-- <td>${todo.tags || "—"}</td> -->
            <td><input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${todo.completed ? "checked" : ""}></td>
            <td><button class="deleteButton">Delete</button></td>
          `;
            oldTodoList.appendChild(row);
        });

        loadMoreButton.style.display = filteredOldTodos.length > (currentPage + 1) * 5 ? "block" : "none"; // Show button if there are more todos to load
    }


    // Event listener for "Load More" button
    loadMoreButton.addEventListener("click", () => {
        currentPage++;
        displayOldTodos();
    });

    // Event listener for toggling completed todos visibility
    toggleCompletedButton.addEventListener("click", () => {
        showCompleted = !showCompleted;
        filterAndDisplayOldTodos();
        toggleCompletedButton.textContent = showCompleted ? "Show Uncompleted Todos" : "Show All Todos"; // Change button text accordingly
    });


    //helper functions:
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }); // Formats as DD.MM
    }

    let selectedDate = new Date();
    // Function to format date as "Tuesday 28, February 2025"
    function formatFullDate(date) {
        return date.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    fetchTodos();
    setUpSorting();
});