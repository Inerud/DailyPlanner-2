const mealPlanner = document.getElementById('meal-planner');
const weekPicker = document.getElementById('week-picker');

let currentWeek = getStartOfWeek(new Date());

//Helper functions:
function getStartOfWeek(date) {
    const day = date.getDay(); // 0 = Sunday
    const diff = (day === 0 ? -6 : 1) - day; // Make Monday start of week
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

//Render weekly grid:
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['breakfast', 'lunch', 'dinner'];

function renderMealPlanner(meals = []) {
    mealPlanner.innerHTML = '';

    const mealMap = {};
    meals.forEach(m => {
        mealMap[`${m.day_of_week}-${m.meal_type}`] = m.content;
    });

    weekdays.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-column';
        dayDiv.innerHTML = `<h3>${day}</h3>`;

        mealTypes.forEach(type => {
            const textarea = document.createElement('textarea');
            textarea.placeholder = `${type}`;
            textarea.dataset.day = day;
            textarea.dataset.type = type;
            textarea.value = mealMap[`${day}-${type}`] || '';

            textarea.addEventListener('blur', saveMeal);
            dayDiv.appendChild(textarea);
        });

        mealPlanner.appendChild(dayDiv);
    });
}

//Load + save meals:
async function loadMeals() {
    const res = await fetch(`/api/meals?week=${formatDate(currentWeek)}`);
    const data = await res.json();
    renderMealPlanner(data);
}

async function saveMeal(e) {
    const textarea = e.target;
    const content = textarea.value;
    const day = textarea.dataset.day;
    const type = textarea.dataset.type;

    await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            week_start: formatDate(currentWeek),
            day_of_week: day,
            meal_type: type,
            content,
        }),
    });
}

//Week navigation
function updateWeekPicker() {
    weekPicker.value = formatDate(currentWeek);
}

document.getElementById('prev-week').onclick = () => {
    currentWeek.setDate(currentWeek.getDate() - 7);
    updateWeekPicker();
    loadMeals();
};

document.getElementById('next-week').onclick = () => {
    currentWeek.setDate(currentWeek.getDate() + 7);
    updateWeekPicker();
    loadMeals();
};

weekPicker.addEventListener('change', (e) => {
    currentWeek = getStartOfWeek(new Date(e.target.value));
    loadMeals();
});


//Initialize on page load:
updateWeekPicker();
loadMeals();

