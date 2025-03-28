//goal, achieved
//check days
//add new habit
// monthly view, or weekly

//see total done ever
//graphs?
//habit connected to excersise

document.addEventListener("DOMContentLoaded", () => {
    async function createHabit() {
        const newHabit = {
            title: 'Drink Water',
            category: 'Health',
            frequency: 'DAILY',
            weekly_target: 7
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
            category: 'Health',
            frequency: 'DAILY',
            weekly_target: 7
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

});