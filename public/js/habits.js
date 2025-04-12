document.addEventListener("DOMContentLoaded", () => {
    const tableContainer = document.getElementById("main");

    let habits = [];

    async function fetchHabits() {
        try {
            const response = await fetch('/api/habits');
            const data = await response.json();

            habits = data.map(habit => ({
                id: habit.habit_id,
                name: habit.title,
                goal: habit.goal,
                achieved: 0,
                days: habit.days || [],
            }));

            habits.forEach(updateAchieved); // update achieved count
            createTable(4, habits);
        } catch (error) {
            console.error("Failed to fetch habits:", error);
        }
    }

    function createTable(month, habitList) {
        tableContainer.innerHTML = ''; // Clear container

        const table = document.createElement('table');
        table.className = 'tg';

        const daysInMonth = new Date(2025, month, 0).getDate();

        table.appendChild(createColgroup(daysInMonth));
        table.appendChild(createThead(month, daysInMonth));
        table.appendChild(createTbody(habitList, daysInMonth));

        tableContainer.appendChild(table);
    }

    function createColgroup(daysInMonth) {
        const colgroup = document.createElement('colgroup');
        const totalCols = daysInMonth + 3;
        for (let i = 0; i < totalCols; i++) colgroup.appendChild(document.createElement('col'));
        return colgroup;
    }

    function createThead(month, daysInMonth) {
        const thead = document.createElement('thead');

        const daysRow = document.createElement('tr');
        daysRow.className = 'days';

        const habitsHeader = document.createElement('th');
        habitsHeader.className = 'heading';
        habitsHeader.rowSpan = 2;
        habitsHeader.innerText = 'Habits';
        daysRow.appendChild(habitsHeader);

        const weekdayShort = ['s', 'm', 't', 'w', 't', 'f', 's'];
        for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(2025, month - 1, i).getDay();
            const th = document.createElement('th');
            th.className = 'tg-0lax';
            th.textContent = weekdayShort[day];
            daysRow.appendChild(th);
        }

        ['goal', 'achieved'].forEach(text => {
            const th = document.createElement('th');
            th.className = 'heading';
            th.rowSpan = 2;
            th.textContent = text;
            daysRow.appendChild(th);
        });

        const datesRow = document.createElement('tr');
        datesRow.className = 'dates';
        for (let i = 1; i <= daysInMonth; i++) {
            const th = document.createElement('th');
            th.className = 'tg-0lax';
            th.textContent = i;
            datesRow.appendChild(th);
        }

        thead.appendChild(daysRow);
        thead.appendChild(datesRow);
        return thead;
    }

    function createTbody(habitList, daysInMonth) {
        const tbody = document.createElement('tbody');

        habitList.forEach((habit, habitIndex) => {
            const row = document.createElement('tr');
            row.className = 'habit';
            row.setAttribute('data-id', habit.id);

            const nameCell = document.createElement('td');
            nameCell.className = 'tg-0lax habit-name';
            nameCell.textContent = habit.name;
            nameCell.contentEditable = true; // Prep for edit
            row.appendChild(nameCell);

            for (let day = 1; day <= daysInMonth; day++) {
                const td = document.createElement('td');
                td.className = 'tg-0lax habit-day';
                td.setAttribute('data-day', day);
                td.addEventListener('click', () => toggleDay(habit.id, day));
                row.appendChild(td);
            }

            // Goal cell
            const goalCell = document.createElement('td');
            goalCell.className = 'tg-0lax habit-goal';
            goalCell.contentEditable = true; // Editable goal
            goalCell.textContent = habit.goal;
            row.appendChild(goalCell);

            // Achieved cell
            const achievedCell = document.createElement('td');
            achievedCell.className = 'tg-0lax habit-achieved';
            achievedCell.textContent = habit.achieved;
            row.appendChild(achievedCell);

            tbody.appendChild(row);
        });

        return tbody;
    }

    async function toggleDay(habitId, day) {
        const habit = habits.find(h => h.id === habitId);
        if (!habit.days) habit.days = [];

        const index = habit.days.indexOf(day);
        if (index === -1) {
            habit.days.push(day);
        } else {
            habit.days.splice(index, 1);
        }

        updateAchieved(habit);
        createTable(4, habits);

        try {
            const userId = 2; // Replace with actual user ID
            const currentDate = `2025-04-${String(day).padStart(2, '0')}`;
            await toggleHabit(habitId, userId, currentDate);
        } catch (error) {
            console.error("Failed to toggle habit in backend:", error);
        }
    }

    function updateAchieved(habit) {
        habit.achieved = habit.days.length;
    }

    async function toggleHabit(habit_id, user_id, date) {
        try {
            const response = await fetch(`/api/habits/toggle/${habit_id}/${user_id}/${date}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            console.log(`Habit ${habit_id} on ${date} is now marked as:`, data.status);
            return data.status;

        } catch (error) {
            console.error("Error toggling habit:", error);
        }
    }

    fetchHabits();
});
