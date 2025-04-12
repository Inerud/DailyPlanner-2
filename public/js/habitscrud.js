//goal, achieved
//check days
//add new habit
// monthly view, or weekly

//see total done ever
//graphs?
//habit connected to excersise

document.addEventListener("DOMContentLoaded", () => {
    async function createHabit(title, goal) {
        const newHabit = {
            title: title,
            goal: goal
        };
    
        try {
            const response = await fetch("/api/habits", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newHabit),  // Move 'body' outside of 'headers'
            });
    
            const data = await response.json();
    
        } catch (error) {
            console.error("Error posting habits:", error);
        }
    }
    
    async function getHabits() {
        try {
            const response = await fetch("/api/habits", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            const data = await response.json();

            console.log(data);
    
            if (!data.success) {
                console.error("Failed to fetch habits:", data.message);
                return;
            }

        } catch (error) {
            console.error("Error fetching habits:", error);
        }
    }
    
    async function updateHabit(id) {
        const updateHabit = {
            title: 'Drink Water - Updated',
            goal: '20'
        };

        try {
            const response = await fetch(`/api/habits/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateHabit),
            });
            
            const data = await response.json();

            console.log(data);

        } catch (error) {
            console.error("Error updating todo status:", error);
        }
    }


    async function deleteHabit(id) {
        try {
            const response = await fetch(`/api/habits/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            console.log(data);

        } catch (error) {
            console.error("Error deleting todo:", error);
        }
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
    

});