document.addEventListener("DOMContentLoaded", function () {
    const daysContainer = document.getElementById("days");
    const monthYear = document.getElementById("monthYear");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    let currentDate = new Date();

    function renderCalendar(date) {
        daysContainer.innerHTML = ""; // Clear previous days
        const year = date.getFullYear();
        const month = date.getMonth();

        // Set month and year display
        const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];
        monthYear.textContent = `${monthNames[month]} ${year}`;

        // Get first and last day of the month
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        // Adjust Sunday as the last column (fix for JS treating Sunday as 0)
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;

        // Fill empty spaces before the first day
        for (let i = 0; i < startOffset; i++) {
            const emptyLi = document.createElement("li");
            daysContainer.appendChild(emptyLi);
        }

        // Populate the days of the month
        for (let day = 1; day <= lastDate; day++) {
            const dayLi = document.createElement("li");
            dayLi.textContent = day;

            // Highlight today's date
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayLi.classList.add("today");
            }

            daysContainer.appendChild(dayLi);
        }

        // Fix: Ensure the last row is properly filled 
        const totalCells = startOffset + lastDate;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                const emptyLi = document.createElement("li");
                daysContainer.appendChild(emptyLi);
            }
        }
    }

    // Navigation Buttons
    prevBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // Initial render
    renderCalendar(currentDate);
});
