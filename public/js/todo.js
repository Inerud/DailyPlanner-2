document.addEventListener("DOMContentLoaded", () => {
    fetchTodos();

    async function fetchTodos () {
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
        
            displayTodos(data.todos);
          } catch (error) {
            console.error("Error fetching todos:", error);
          }
    };

    function displayTodos(todos) {
        const tableBody = document.querySelector(".todotable tbody");
        tableBody.innerHTML = ""; // Clear existing rows
      
        if (todos.length === 0) {
          tableBody.innerHTML = "<tr><td colspan='8'>No to-dos found.</td></tr>";
          return;
        }
      
        todos.forEach((todo, index) => {
          const row = document.createElement("tr");
      
          row.innerHTML = `
            <td class="date">${todo.date ? formatDate(todo.date) : "—"}</td>
            <td class="priority">${todo.priority || "Low"}</td>
            <td class="time">${todo.time || "—"}</td>
            <td class="recurring">${todo.recurring || "None"}</td>
            <td class="to-do">${todo.description}</td>
            <td class="tags">${todo.tags || "—"}</td>
            <td class="done">
              <input type="checkbox" ${todo.done ? "checked" : ""} onchange="toggleDone(${todo.id}, this.checked)">
            </td>
          `;
      
          tableBody.appendChild(row);
        });
    }
      
    function addTodo (){};
    function deleteTodo (){};

    async function toggleDone (id, isChecked){
        try {
            const response = await fetch(`/api/todos/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ done: isChecked }),
            });
        
            const data = await response.json();
        
            if (!data.success) {
              console.error("Failed to update todo status:", data.message);
            }
          } catch (error) {
            console.error("Error updating todo status:", error);
          }
    };

    function sortTodos (){};

    //helper functions:
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }); // Formats as DD.MM
    }
});