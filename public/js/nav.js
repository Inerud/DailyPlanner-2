document.addEventListener("DOMContentLoaded", () => {
    const tools = document.getElementById("tools");
    const toggleBtn = document.getElementById("navToggle");
    const container = document.querySelector('.container');

    if (tools.classList.contains('collapsed')) {
        container.classList.add('full-width');
    } else {
        container.classList.remove('full-width');
    }

    function displayMenu() {
        tools.innerHTML = `
        <ul>
          <li><a href="../">Home Dashboard</a></li>
          <li><a href="journal">Journal</a></li>
          <li><a href="todo">To-do</a></li>
          <li><a href="habits">Habits</a></li>
          <li><a href="mealplanner">Meal Planner</a></li>
        </ul>
        <ul class="account">
            <hr>
            <li></span> <span id="auth-section"><a href="/login">login</a></span>
            </li>
            <hr>
        </ul>
      `;
    }

    toggleBtn.addEventListener("click", () => {
        tools.classList.toggle("open");
        document.body.classList.toggle("nav-open");
    });

    function highlightCurrentLink() {
        const links = tools.querySelectorAll("a");
        links.forEach(link => {
            if (window.location.href.includes(link.getAttribute("href"))) {
                link.classList.add("active");
            }
        });
    }

    displayMenu();
    highlightCurrentLink();
});
