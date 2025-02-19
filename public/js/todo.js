document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");

    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    async function fetchTodos(date) {
        try {
            const response = await fetch(`/api/todo?date=${date}`);
            const data = await response.json();

            taskList.innerHTML = ""; // Clear previous tasks

            if (!data.success || data.todos.length === 0) {
                taskList.innerHTML = "<li>No tasks for this day.</li>";
                return;
            }

            data.todos.forEach(todo => {
                const li = document.createElement("li");
                li.textContent = todo.task;
                taskList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching to-do items:", error);
        }
    }

    // Listen for calendar date selection
    document.addEventListener("dateSelected", (event) => {
        fetchTodos(formatDate(event.detail));
    });

    // Fetch to-dos for today's date initially
    fetchTodos(formatDate(new Date()));
});
