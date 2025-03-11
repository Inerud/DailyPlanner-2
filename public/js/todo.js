//TODO LIST:
// change date to today under date
// Change color of finished tasks
// DIfferent colors for different days? or priorities
// Hide todos that are completed or low priority, and that are from yesterday or older

document.addEventListener("DOMContentLoaded", () => {
    const addButton = document.getElementById("addButton");

    let todos = []; // Store fetched todos
    let currentSort = { column: null, order: "asc" }; // Track sorting state




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

            todos = data.todos;
            displayTodos(todos);
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    };

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
                <td class="tags">${todo.tags || "—"}</td>
                <td class="done">
                    <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${todo.done ? "checked" : ""}
                    ${todo.completed ? "checked" : ""} >
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
        });
    }


    addButton.addEventListener("click", async function () {

    })
    function addTodo() { };
    function deleteTodo() { };

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
            tags: row.querySelector(".edit-tags").value,
            completed: row.querySelector(".edit-done").checked,
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
      }
      

    function setUpSorting() {
        document.querySelectorAll(".todotable th").forEach(header => {
            header.addEventListener("click", () => {
                const column = header.dataset.column;
                if (column) sortTodos(column);
            });
        });
    }

    //helper functions:
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }); // Formats as DD.MM
    }

    fetchTodos();
    setUpSorting();
});