document.addEventListener("DOMContentLoaded", () => {
const tools = document.getElementById("tools");

    function displaymenu() {
        tools.innerHTML = ""; // Clear existing

        tools.innerHTML = `
        <ul>
            <li><a href="../">Calendar</a></li>
            <hr>
            <li><a href="journal">Journal</a></li>
            <hr>
            <li><a href="todo">To-do</a></li>
            <hr>
            <li><a href="habits">Habits</a></li>
            <hr>
            <li><a href="mealplanner">Meal Planner</a></li>
            <hr>
            <li><a href="../">Notes</a></li>
            <hr>
        </ul>
        `
        // <ul class="account">
        //     <hr>
        //     <li></span> <span id="auth-section"><a href="/login">login</a></span>
        //     </li>
        //     <hr>
        // </ul>
    };

    displaymenu();

    });
