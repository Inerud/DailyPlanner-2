document.addEventListener("DOMContentLoaded", function () {
    const daysContainer = document.getElementById("days");
    const monthYear = document.getElementById("monthYear");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    let currentDate = new Date();
    let selectedDate = new Date(); // Default to today

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

            const dayDate = new Date(year, month, day);
            const formattedDay = dayDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

            // Highlight today's date
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayLi.classList.add("today");
            }

            // Highlight selected date
            if (formattedDay === selectedDate.toISOString().split("T")[0]) {
                dayLi.classList.add("selected");
            }

            // Add click event to select a date
            dayLi.addEventListener("click", () => selectDate(dayDate));

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

    // Function to handle date selection
    function selectDate(date) {
        selectedDate = date;

        // Re-render calendar to apply selection highlight
        renderCalendar(currentDate);

        // Dispatch a custom event with the selected date
        document.dispatchEvent(new CustomEvent("dateSelected", { detail: selectedDate }));
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

    // Automatically select today on page load
    selectDate(selectedDate);
});
