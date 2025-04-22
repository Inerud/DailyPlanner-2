//TODO: 
//add habit
//delete habit
//edit habit(name, and goal)
//confetti when monthly goal reached
//swap view between months

document.addEventListener("DOMContentLoaded", () => {
    const tableContainer = document.getElementById("main");
    document.getElementById('addHabitBtn').addEventListener('click', addHabit);

    const habitColors = ["#ffe066", "#f4b0c8", "#a1d0ff", "#b6e3b6"];

    let habits = [];
    const d = new Date();
    let month = (d.getMonth()) + 1;

    async function fetchHabits() {
        try {
            const response = await fetch('/api/habits');
            const data = await response.json();

            console.log("Fetched habits raw response:", data);

            if (!Array.isArray(data)) {
                throw new Error("Expected an array but got: " + JSON.stringify(data));
            }

            habits = data.map(habit => ({
                id: habit.habit_id,
                name: habit.title,
                goal: habit.goal,
                achieved: 0,
                days: habit.days || [],
            }));

            habits.forEach(updateAchieved);
            createTable(month, habits);
        } catch (error) {
            console.error("Failed to fetch habits:", error);
            alert("An error occurred while fetching habits.");
        }
    }


    function createTable(month, habitList) {
        tableContainer.innerHTML = ''; // Clear container

        const table = document.createElement('table');
        table.className = 'tg';

        const daysInMonth = new Date(2025, month, 0).getDate();

        table.appendChild(createColgroup(daysInMonth));
        table.appendChild(createThead(month, daysInMonth));
        table.appendChild(createTbody(habitList, daysInMonth, month));

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

    function createTbody(habitList, daysInMonth, selectedMonth) {
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

                // Construct full date string
                const dateStr = `2025-${(selectedMonth).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

                // Check if completed and apply color
                habit.days.forEach(habitDate => {
                    const dateOnly = habitDate.split(' ')[0]; // Extract the date part (YYYY-MM-DD)
                    if (dateOnly === dateStr) {
                        const color = habitColors[habitIndex % habitColors.length];
                        td.style.backgroundColor = color;
                    }
                });

                td.addEventListener('click', () => toggleDay(habit.id, dateStr));
                row.appendChild(td);
            }


            // Goal cell
            const goalCell = document.createElement('td');
            goalCell.className = 'tg-0lax habit-goal';
            goalCell.textContent = habit.goal;
            goalCell.contentEditable = true;
            row.appendChild(goalCell);

            // Update when either cell is edited
            const saveEdit = () => {
                const updatedTitle = nameCell.textContent.trim();
                const updatedGoal = parseInt(goalCell.textContent.trim());

                if (isNaN(updatedGoal)) {
                    alert('Goal must be a number');
                    goalCell.textContent = habit.goal; // Reset to original if invalid
                    return;
                }

                updateHabit(habit.id, updatedTitle, updatedGoal);
            };

            nameCell.addEventListener('blur', saveEdit);
            goalCell.addEventListener('blur', saveEdit);

            // Achieved cell
            const achievedCell = document.createElement('td');
            achievedCell.className = 'tg-0lax habit-achieved';
            achievedCell.textContent = habit.achieved;
            row.appendChild(achievedCell);

            tbody.appendChild(row);

            //deletecell
            const deleteCell = document.createElement("td");
            deleteCell.className = "delete-cell";

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️"; // or use a ✖️/❌ or actual icon
            deleteBtn.className = "delete-btn";
            deleteBtn.addEventListener("click", () => {
                if (confirm(`Delete habit "${habit.name}"?`)) {
                    deleteHabit(habit.id);
                }
            });

            deleteCell.appendChild(deleteBtn);
            row.appendChild(deleteCell);
        });

        return tbody;
    }

    async function toggleDay(habitId, dateStr) {
        const habit = habits.find(h => h.id === habitId);
        if (!habit.days) habit.days = [];

        const index = habit.days.indexOf(dateStr);
        if (index === -1) {
            habit.days.push(dateStr);
        } else {
            habit.days.splice(index, 1);
        }

        updateAchieved(habit);
        createTable(month, habits);  // Re-render the table with updated habit data

        try {
            await toggleHabit(habitId, dateStr);
        } catch (error) {
            console.error("Failed to toggle habit in backend:", error);
        }
    }



    function updateAchieved(habit) {
        habit.achieved = habit.days.length;
    }

    async function toggleHabit(habit_id, date) {
        try {
            const response = await fetch(`/api/habits/toggle/${habit_id}/${date}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            console.log(`Habit ${habit_id} on ${date} is now marked as:`, data.status);
            return data.status;

        } catch (error) {
            console.error("Error toggling habit:", error);
        }
    }

    function updateHabit(habitId, newTitle, newGoal) {
        fetch(`/api/habits/${habitId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: newTitle,
                goal: parseInt(newGoal), // Ensure goal is a number
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update habit');
                }
                return response.json();
            })
            .then(data => {
                console.log('Habit updated successfully:', data.message);
                // Optionally show a UI confirmation here
            })
            .catch(error => {
                console.error('Error updating habit:', error);
                alert('Could not update habit.');
            });
    }

    async function addHabit() {
        try {
            const res = await fetch("/api/habits", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: "New Habit" })
            });

            if (!res.ok) {
                throw new Error("Failed to add habit");
            }

            const newHabit = await res.json();

            fetchHabits();
        } catch (error) {
            console.error(error);
            alert("Could not add habit.");
        }
    }

    async function deleteHabit(habitId) {
        try {
            const res = await fetch(`/api/habits/${habitId}`, {
                method: "DELETE"
            });
    
            if (!res.ok) throw new Error("Failed to delete habit");
    
            // Remove from local list and re-draw
            habitList = habitList.filter(h => h.id !== habitId);
            drawTable();
        } catch (err) {
            console.error(err);
            alert("Could not delete habit.");
        }
    }
    

    fetchHabits();
});
