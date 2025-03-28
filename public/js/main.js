// add "reward" for completing exercise
// implement challenge
// implement habits
// fix styling
//cross out finished todos in the chedule
// if daete = oday -> display TOday: date
// fix bug: date selector doesnt do anything

// challenge:
// add completed toggle working with habit tracker
// add categories, let the user pick a challenge between the categories for each day?

//Physical, Mental, Social, Creative, Productive)


document.addEventListener("DOMContentLoaded", async function () {
  // Select elements
  const dateDisplay = document.querySelector(".subtitle span");
  const leftArrow = document.querySelector(".left");
  const rightArrow = document.querySelector(".right");
  const todoList = document.querySelector(".todos ul");
  const challengeSection = document.querySelector('.challenge');
  const greetingElement = document.getElementById("greeting");
  // const likebtn = document.getElementById("likebtn");
  // const dislikebtn = document.getElementById("dislikebtn");

  let selectedDate = new Date(); // Default to today

  /** Date Handling Functions **/
  function formatDate(date) {
    return date.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  }

  function updateDateDisplay() {
    dateDisplay.textContent = formatDate(selectedDate);
    loadDataForDate(selectedDate);
    fetchSelectedChallenge(selectedDate);
  }

  function changeDate(days) {
    selectedDate.setDate(selectedDate.getDate() + days);
    updateDateDisplay();
  }

  /** Event Listeners for Date Navigation **/
  leftArrow.addEventListener("click", () => changeDate(-1));
  rightArrow.addEventListener("click", () => changeDate(1));
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

  function fetchChallenge(selectedDate) {
    fetch(`/api/challenge?date=${selectedDate.toISOString().split("T")[0]}`)
      .then(response => response.json())
      .then(challenges => {
        challengeSection.innerHTML = '';

        challenges.forEach(challenge => {
          const challengeCard = document.createElement("div");
          challengeCard.classList.add("challenge-card");

          challengeCard.innerHTML = `
                    <h3>${challenge.title}</h3>
                    <p>${challenge.exercise}</p>
                    <button class="selectbtn" data-id="${challenge.id}" data-title="${challenge.title}" data-exercise="${challenge.exercise}">Select</button>
                `;

          challengeSection.appendChild(challengeCard);
        });

        document.querySelectorAll(".selectbtn").forEach(button => {
          button.addEventListener("click", (event) => {
            const selectedChallenge = {
              id: event.target.dataset.id,
              title: event.target.dataset.title,
              exercise: event.target.dataset.exercise
            };
            selectChallenge(selectedChallenge);
          });
        });
      })
      .catch(error => console.error('Error fetching challenges:', error));
  }

  function selectChallenge(challenge) {
    fetch("/api/challenge/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        exercise_id: challenge.id, 
        date: selectedDate.toISOString().split("T")[0] 
      })
    })
    .then(response => response.json())
    .then(() => {
      // Update the UI to show the selected challenge
      displaySelectedChallenge(challenge);
    })
    .catch(error => console.error("Error selecting challenge:", error));
  }
  
  function displaySelectedChallenge(challenge) {
    challengeSection.innerHTML = `
      <h2>Todays challenge</h2>
      <div class="challengetext">
        <p id="challengetitle">${challenge.title}</p>
        <p id="challengecomment">${challenge.exercise}</p>
      </div>
      <button id="completebtn">Mark as Complete</button>
      <button id="likebtn">Like</button>
      <button id="dislikebtn">Dislike</button>
    `;
  
    document.getElementById("completebtn").addEventListener("click", () => markAsComplete());
  }
  
  function markAsComplete() {
    fetch("/api/challenge/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        date: selectedDate.toISOString().split("T")[0] 
      })
    })
    .then(response => response.json())
    .then(() => {
      //fetchChallenge(selectedDate); // Reload to reflect completion
      completefeedback();
    })
    .catch(error => console.error("Error marking challenge as complete:", error));
  }

  function fetchSelectedChallenge(date) {
    fetch(`/api/challenge/today`)
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          // Display the challenge if the user has already selected one
          displaySelectedChallenge(result);
        } else {
          // No challenge selected, fetch the available challenges
          fetchChallenge(date); // Show options if no challenge is picked
        }
      })
      .catch(error => console.error("Error fetching selected challenge:", error));
  }
  

  function completefeedback() {
    fireworks();

  }

  /** Data Fetching and Updating **/
  async function loadDataForDate(date) {
    try {
      const response = await fetch(`/api/data?date=${date.toISOString().split("T")[0]}`);
      const data = await response.json();
      updateTodos(data.todos || []);
      updateSchedule(data.todos);
    } catch (error) {
      console.error("Error fetching data for selected date:", error);
    }
  }

  function updateTodos(todos) {
    if (!todoList) return console.error("Can't find todoList!");

    todoList.innerHTML = todos.length === 0 ? "<li>No tasks for today! 🎉</li>" : "";

    const priorityMap = { "High": 1, "Medium": 2, "Low": 3 };
    todos.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
    const displayedTodos = todos.slice(0, 3);

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
          checkbox.checked = !checkbox.checked;
        }
      });
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(` ${todo.description}`));
      todoList.appendChild(li);
    });
  }

  function updateSchedule(todos) {
    document.querySelectorAll(".schedule .tg tbody tr").forEach(row => {
      row.querySelector(".event").textContent = '';
    });

    todos.forEach(todo => {
      const todoHour = new Date(`1970-01-01T${todo.time}Z`).getHours();
      document.querySelectorAll(".schedule .tg tbody tr").forEach(row => {
        const [startHour, startPeriod] = row.querySelector(".time").textContent.trim().split(/[- ]+/);
        const startHour24 = startPeriod === 'PM' && startHour !== '12' ? +startHour + 12 : +startHour;
        if (todoHour === startHour24) row.querySelector(".event").textContent = todo.description;
      });
    });
  }

  /** User Greeting **/
  async function setUserGreeting() {
    try {
      const response = await fetch("/api/account");
      const data = await response.json();
      let greetings = ["Howdy", "Hi", "Nice To See You", "Hi there", "Hey", "Welcome", "Ahoy", "Yo, Yo, Yo", "What's kickin'"];
      let time = new Date().getHours();
      let greeting = time < 10 ? "Good Morning" : time >= 20 ? "Good Night" : greetings[Math.floor(Math.random() * greetings.length)];
      if (data.user) greetingElement.textContent = `${greeting} ${data.user.name}!`;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  /** Initialize Page **/
  updateDateDisplay();
  setUserGreeting();
});
