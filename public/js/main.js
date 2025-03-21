//add "reward" for completing exercise
//mplement challenge
//implement habits
//fix styling
//cross out finished todos in the chedule
// if daete = oday -> display TOday: date


document.addEventListener("DOMContentLoaded", async function () {
  const dateDisplay = document.querySelector(".subtitle span");
  const leftArrow = document.querySelector(".left");
  const rightArrow = document.querySelector(".right");
  const todoList = document.querySelector(".todos ul");
  const challengeSection = document.querySelector('.challenge');


  // Initialize with today's date
  let selectedDate = new Date();

  // Function to format date as "Tuesday 28, February 2025"
  function formatDate(date) {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // Function to update date display and reload data
  function updateDateDisplay() {
    dateDisplay.textContent = formatDate(selectedDate);
    loadDataForDate(selectedDate);
    fetchChallenge(selectedDate);
  }

  function fetchChallenge(selectedDate) {
    fetch(`/api/challenge?date=${selectedDate}`)
      .then(response => response.json())
      .then(data => {
        // Ensure you have data to display
        if (data && data.title && data.exercise) {
          document.getElementById('challengetitle').innerText = data.title;
          document.getElementById('challengecomment').innerText = data.exercise;
        } else {
          // Fallback message if no data is found
          document.getElementById('challengetitle').innerText = 'No challenge for today';
          document.getElementById('challengecomment').innerText = 'Please check back tomorrow!';
        }
      })
      .catch(error => console.error('Error fetching challenge:', error));
}


  // Event listeners for navigation arrows
  leftArrow.addEventListener("click", function () {
    selectedDate.setDate(selectedDate.getDate() - 1);
    updateDateDisplay();
  });

  rightArrow.addEventListener("click", function () {
    selectedDate.setDate(selectedDate.getDate() + 1);
    updateDateDisplay();
  });

  // Allow clicking on date to select a new one
  dateDisplay.addEventListener("click", function () {
    const input = document.createElement("input");
    input.type = "date";
    input.valueAsDate = selectedDate;
    input.style.fontSize = "inherit";
    input.style.border = "none";
    input.style.background = "transparent";
    input.style.color = "inherit";
    input.style.width = dateDisplay.offsetWidth + "px";

    dateDisplay.replaceWith(input);
    input.focus();

    input.addEventListener("change", function () {
      selectedDate = new Date(input.value);
      input.replaceWith(dateDisplay);
      updateDateDisplay();
    });

    input.addEventListener("blur", function () {
      input.replaceWith(dateDisplay);
    });
  });

  // Function to load data for the selected date
  async function loadDataForDate(date) {
    try {
      const response = await fetch(`/api/data?date=${date.toISOString().split("T")[0]}`);
      const data = await response.json();

      // Update schedule, habits, and todos
      updateTodos(data.todos || []);
      updateSchedule(data.todos);

    } catch (error) {
      console.error("Error fetching data for selected date:", error);
    }
  }

  // Function to update the To-Do list display
  function updateTodos(todos) {
    if (!todoList) {
      console.log("Can't find todoList!");
      return;
    }

    todoList.innerHTML = ""; // Clear existing list

    if (todos.length === 0) {
      todoList.innerHTML = "<li>No tasks for today! 🎉</li>";
      return;
    }

    // Map string priority to numeric values
    const priorityMap = {
      "High": 1,
      "Medium": 2,
      "Low": 3
    };

    // Sort by priority (1 = High, 2 = Medium, 3 = Low)
    todos.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);

    // Select top 3 items: prioritize high, fill with lower if needed
    const highPriority = todos.filter(todo => todo.priority === "High").slice(0, 3);
    const supplement = todos.filter(todo => todo.priority !== "High").slice(0, 3 - highPriority.length);
    const displayedTodos = [...highPriority, ...supplement];

    displayedTodos.forEach(todo => {
      const li = document.createElement("li");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", async function () {
        try {
          await fetch(`/api/todo/${todo.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: checkbox.checked })
          });
        } catch (error) {
          console.error("Error updating todo:", error);
          checkbox.checked = !checkbox.checked; // Revert if error
        }
      });

      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(` ${todo.description}`)); // Update 'name' to 'description'
      todoList.appendChild(li);
    });
  }

  function updateSchedule(todos) {
    const scheduleRows = document.querySelectorAll(".schedule .tg tbody tr");

    // Clear all previous events in the schedule
    scheduleRows.forEach(row => {
      const eventCell = row.querySelector(".event");
      eventCell.textContent = ''; // Clear the event description
    });

    // Loop through each todo and place it in the corresponding schedule cell
    todos.forEach(todo => {
      const todoTime = new Date(`1970-01-01T${todo.time}Z`); // Create a Date object with only the time component
      const todoHour = todoTime.getHours(); // Get the hour of the todo time

      // Find the matching schedule row
      const matchingRow = Array.from(scheduleRows).find(row => {
        const timeRange = row.querySelector(".time").textContent.trim();
        const [start, end] = timeRange.split('-');

        // Extract hours from the time range
        const [startHour, startPeriod] = start.split(' ');
        const [endHour, endPeriod] = end.split(' ');

        // Convert hours to integers
        const startHourInt = parseInt(startHour);
        const endHourInt = parseInt(endHour);

        // Convert the 12-hour format to 24-hour format (AM/PM)
        const startHour24 = (startPeriod === 'PM' && startHourInt !== 12) ? startHourInt + 12 : (startPeriod === 'AM' && startHourInt === 12 ? 0 : startHourInt);
        const endHour24 = (endPeriod === 'PM' && endHourInt !== 12) ? endHourInt + 12 : (endPeriod === 'AM' && endHourInt === 12 ? 0 : endHourInt);

        // Check if the todo hour falls within the time range
        return todoHour >= startHour24 && todoHour < endHour24;
      });

      // If a matching row is found, place the event in the corresponding cell
      if (matchingRow) {
        const eventCell = matchingRow.querySelector(".event");
        eventCell.textContent = todo.description; // Set the event description
      }
    });
  }




  // Initialize display
  updateDateDisplay();

  // Fetch and set user greeting
  try {
    const response = await fetch("/api/account");
    const data = await response.json();
    const greeting = document.getElementById("greeting");
    var today = new Date().getHours();

    let greetingVar = "Hello";
    let greetings = [
      "Howdy", "Hi", "Nice To See You", "Hi there", "Hey", "Waddup", "Hello",
      "Welcome", "Ahoy", "Yo, Yo, Yo", "What's kickin'", "Beautiful day",
      "It's my favorite person", "It's the amazing", "What's poppin'"
    ];

    if (today <= 10) {
      greetingVar = "Good Morning";
    } else if (today >= 20) {
      greetingVar = "Good Night";
    } else {
      let x = Math.floor(Math.random() * greetings.length);
      greetingVar = greetings[x];
    }

    if (data.user) {
      greeting.textContent = `${greetingVar} ${data.user.name}!`;
    }

  } catch (error) {
    console.error("Error fetching user data:", error);
  }
});
