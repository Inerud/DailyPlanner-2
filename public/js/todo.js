//TO-DO: 
//styling
//delete
//display backlog
//display all tasks
//add priority?
//add recurring?
//differenciate between event and task
//add "reward" for completing

document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const newTaskInput = document.getElementById("new-task");
    const addTaskBtn = document.getElementById("add-task-btn");


    let selectedDate = new Date(); //default to today

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

                //create checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = todo.completed === 1;
                checkbox.addEventListener("change", () => toggleTaskCompletion(todo.id, checkbox.checked));

                //create task text
                const taskText = document.createElement("span");
                taskText.textContent = todo.task;
                if (todo.completed) {
                    taskText.style.textDecoration = "line-through"; // Strike through completed tasks
                }

                li.appendChild(checkbox);
                li.appendChild(taskText);
                taskList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching to-do items:", error);
        }
    }

    // add a new task
    async function addTask() {
        const taskText = newTaskInput.value.trim();
        if (!taskText) return alert("Please enter a task.");

        try {
            const response = await fetch("/api/todo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task: taskText, task_date: formatDate(selectedDate) }),
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            newTaskInput.value = ""; // Clear input
            fetchTodos(formatDate(selectedDate)); // Refresh tasks
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }

    // complete toggle
    async function toggleTaskCompletion(taskId, isCompleted) {
        try {
            const response = await fetch(`/api/todo/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: isCompleted ? 1 : 0 }),
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            fetchTodos(formatDate(selectedDate)); // Refresh tasks
        } catch (error) {
            console.error("Error updating task completion:", error);
        }
    }


    if (newTaskInput && addTaskBtn) {
        // Listen for button click to add a task
    addTaskBtn.addEventListener("click", addTask);

    // Listen for "Enter" key in input field
    newTaskInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") addTask();
    });
    }

    // Listen for calendar date selection
    document.addEventListener("dateSelected", (event) => {
        selectedDate = event.detail; // Update the selected date
        fetchTodos(formatDate(selectedDate)); // Fetch tasks for the new date
    });

    // Fetch to-dos for today's date initially
    fetchTodos(formatDate(selectedDate));
});
