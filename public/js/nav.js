document.addEventListener("DOMContentLoaded", () => {
    const tools = document.getElementById("tools");
    const toggleBtn = document.getElementById("navToggle");
    const container = document.querySelector('.container');
    const footer = document.querySelector('footer');

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

    function updateFooter() {
        footer.innerHTML = `
         <p class="footer-credit">Created by <strong>Stine Vik Letrud</strong></p>
            <p class="footer-contact">
              Contact: <a href="mailto:s.letrud1@uni.brighton.ac.uk">s.letrud1@uni.brighton.ac.uk</a>
            </p>
            <p class="footer-github">
              GitHub: <a href="https://github.com/Inerud/DailyPlanner-2" target="_blank">github.com/Inerud/DailyPlanner-2</a>
            </p>
            <p class="footer-description">
              Daily Planner is a personal web app designed to help users manage tasks, track habits, journal, and stay organized day by day.
            </p>
            <p class="footer-description">
                Disclaimer: This application is not intended to provide medical advice, diagnosis, or treatment. Any wellbeing suggestions included are general in nature, research-based, and low-risk. If you are experiencing mental health concerns, please seek professional help.
            </p> 
            <a href="#top" class="footer-back-to-top">↑ Back to top</a>
        `;
    }

    updateFooter();
    displayMenu();
    highlightCurrentLink();
});
