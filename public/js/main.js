//add "reward" for completing exercise

document.addEventListener("DOMContentLoaded", async function () {
  const dateDisplay = document.querySelector(".subtitle span");
  const leftArrow = document.querySelector(".left");
  const rightArrow = document.querySelector(".right");

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

      // Update schedule, to-dos, habits, etc.
      console.log("Loaded data for", date, data);
      // TODO: Update the elements on the page with the fetched data.

    } catch (error) {
      console.error("Error fetching data for selected date:", error);
    }
  }

  // Initialize display
  updateDateDisplay();

  try {
    const response = await fetch("/api/account");
    const data = await response.json();
    var today = new Date().getHours();

    let greetingVar = "Hello";
    let greetings = ["Howdy", "Hi", "Nice To See You", "Hi there", "Hey", "Waddup", "Hello", "Welcome", "Ahoy", "Yo, Yo, Yo", "Whats kickin'",
  "Beautiful day", "It's my favorite person", "It's the amazing", "Hello", "What's poppin'"];
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
      return;
    }

  } catch (error) {
    console.error("Error fetching user data:", error);
    authSection.innerHTML = `<a href="/login" class="btn btn-primary">Login</a>`;
  }
});
