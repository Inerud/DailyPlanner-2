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
    const todotitle = document.getElementById("todotitle");

    const addTaskBtn = document.getElementById("add-task-btn");
    const openModalBtn = document.getElementById("open-modal-btn");
    const modal = document.getElementById("addTaskModal");
    const closeModalBtn = document.querySelector(".close");
    const saveTaskBtn = document.getElementById("saveTaskBtn");

    const taskType = document.getElementById("taskType");
    const taskText = document.getElementById("taskText");
    const priority = document.getElementById("priority");
    const repeat = document.getElementById("repeat");


    let selectedDate = new Date(); // Default to today

    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    function openModal() {
        modal.style.display = "block";
    }

    function closeModal() {
        modal.style.display = "none";
        taskText.value = "";
        taskType.value = "todo";
        priority.value = "low";
        repeat.value = "none";
    }

    async function fetchTodos(date) {
        try {
            const response = await fetch(`/api/todo?date=${date}`);
            const data = await response.json();

            if (todotitle) {
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);
            
                const selectedDateObj = new Date(date);
                const formattedDate = selectedDateObj.toLocaleDateString();
            
                // Compare dates without time
                if (selectedDateObj.toDateString() === today.toDateString()) {
                    todotitle.textContent = "Agenda for Today";
                } else if (selectedDateObj.toDateString() === tomorrow.toDateString()) {
                    todotitle.textContent = "Agenda for Tomorrow";
                } else {
                    todotitle.textContent = `Agenda for ${formattedDate}`;
                }
            }

            if (!taskList) return;
            taskList.innerHTML = ""; // Clear previous tasks

            if (!data.success || data.todos.length === 0) {
                taskList.innerHTML = "<li>No tasks for this day.</li>";
                return;
            }

            data.todos.forEach(todo => {
                const li = document.createElement("li");
            
                // Create checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = todo.completed === 1;
                checkbox.addEventListener("change", () => toggleTaskCompletion(todo.id, checkbox.checked));
            
                // Create task text
                const taskText = document.createElement("span");
                taskText.textContent = todo.task;
                if (todo.completed) {
                    taskText.style.textDecoration = "line-through";
                }
            
                // Create task time if available
                if (todo.task_time) {
                    const taskTime = document.createElement("span");
                    taskTime.textContent = ` @ ${todo.task_time}`;
                    taskText.appendChild(taskTime);
                }
            
                li.appendChild(checkbox);
                li.appendChild(taskText);
                taskList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching to-do items:", error);
        }
    }

    async function addTask() {
        const taskTextValue = taskText.value.trim();
        const taskTypeValue = taskType.value;
        const priorityValue = priority.value;
        const repeatValue = repeat.value;
        const taskTimeValue = document.getElementById("taskTime").value; // Get the time value
    
        if (!taskTextValue) {
            alert("Please enter a task.");
            return;
        }
    
        try {
            const response = await fetch("/api/todo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: taskTextValue,
                    task_type: taskTypeValue,
                    priority: priorityValue,
                    repeat: repeatValue,
                    task_date: formatDate(selectedDate),
                    task_time: taskTimeValue || null  // Send time if provided, otherwise null
                }),
            });
    
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
    
            closeModal();
            fetchTodos(formatDate(selectedDate));
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }

    async function toggleTaskCompletion(taskId, isCompleted) {
        try {
            const response = await fetch(`/api/todo/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: isCompleted ? 1 : 0 }),
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            fetchTodos(formatDate(selectedDate));
        } catch (error) {
            console.error("Error updating task completion:", error);
        }
    }

    if (taskText && addTaskBtn) {
        addTaskBtn.addEventListener("click", addTask);
        taskText.addEventListener("keypress", (event) => {
            if (event.key === "Enter") addTask();
        });
    }

    document.addEventListener("dateSelected", (event) => {
        console.log("Date selected event received:", event.detail);
        selectedDate = event.detail;
        fetchTodos(formatDate(selectedDate));
    });

    fetchTodos(formatDate(selectedDate));

    // Event listeners
    openModalBtn.addEventListener("click", openModal);
    closeModalBtn.addEventListener("click", closeModal);
    saveTaskBtn.addEventListener("click", addTask);

    window.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });
});
