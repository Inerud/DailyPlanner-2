document.getElementById('generate-list').addEventListener('click', generateGroceryList);

function generateGroceryList() {
  const groceryDiv = document.getElementById('grocery-list-container');
  groceryDiv.innerHTML = ''; // Clear old list

  const mealTextareas = mealPlanner.querySelectorAll('textarea');
  const list = {};

  mealTextareas.forEach(textarea => {
    const content = textarea.value.trim();
    if (content) {
      const day = textarea.dataset.day;
      const type = textarea.dataset.type;
      const key = `${day} - ${capitalize(type)}`;
      list[key] = list[key] || '';
    }
  });

  for (const heading in list) {
    const section = document.createElement('div');
    section.classList.add('grocery-section');
    
    const h4 = document.createElement('h4');
    h4.textContent = heading;
    
    const input = document.createElement('textarea');
    input.placeholder = 'Add ingredients for this meal...';

    section.appendChild(h4);
    section.appendChild(input);
    groceryDiv.appendChild(section);
  }
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}