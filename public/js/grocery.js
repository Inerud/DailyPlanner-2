let groceryTextAreas = {};

document.getElementById('open-grocery-list').onclick = async () => {
  const saved = await tryLoadSavedGroceryList();
  if (!saved) {
    const groupedMeals = generateGroceryListFromMeals(lastFetchedMeals);
    renderGroceryList(groupedMeals);
  }
  document.getElementById('grocery-list-modal').style.display = 'block';
};


document.getElementById('close-grocery-list').onclick = () => {
  document.getElementById('grocery-list-modal').style.display = 'none';
};

function generateGroceryListFromMeals(meals) {
  const grouped = {};

  meals.forEach(meal => {
    const key = meal.content?.trim();
    if (key && !grouped[key]) grouped[key] = "";    
  });
  return grouped;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderGroceryList(mealGroups) {
  const container = document.getElementById('grocery-list-content');
  container.innerHTML = '';
  groceryTextAreas = {};

  Object.keys(mealGroups).forEach(label => {
    const section = document.createElement('div');
    section.className = 'grocery-section';

    const heading = document.createElement('h4');
    heading.textContent = label;

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Add ingredients...';
    textarea.rows = 2;

    groceryTextAreas[label] = textarea;

    section.appendChild(heading);
    section.appendChild(textarea);
    container.appendChild(section);
  });
}

async function tryLoadSavedGroceryList() {
  try {
    const res = await fetch(`/api/grocery?week=${formatDate(currentWeek)}`);
    const text = await res.text();
    const saved = JSON.parse(text);

    const list = Object.entries(saved)
      .filter(([_, content]) => content.trim().length > 0);

    if (list.length === 0) return false;

    const grouped = {};
    list.forEach(([label, value]) => {
      grouped[label] = value;
    });

    renderGroceryList(grouped);
    return true;
  } catch (err) {
    console.log("No saved grocery list found or it’s empty.");
    return false;
  }
}



async function saveGroceryList() {
  const content = {};
  for (const [label, textarea] of Object.entries(groceryTextAreas)) {
    content[label] = textarea.value;
  }

  await fetch('/api/grocery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      week_start: formatDate(currentWeek),
      content: JSON.stringify(content),
    }),
  });

  alert('Grocery list saved!');
  renderChecklistPreview();
}


function exportGroceryList() {
  const list = convertTextareasToListItems();
  if (list.length === 0) return alert("Nothing to export.");

  let text = 'Grocery List\n\n';

  list.forEach(section => {
    text += `${section.label}:\n`;
    section.items.forEach(item => {
      text += `- ${item}\n`;
    });
    text += '\n';
  });

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `GroceryList-${formatDate(currentWeek)}.txt`;
  a.click();

  URL.revokeObjectURL(url);
}


async function shareGroceryList() {
  if (!navigator.share) {
    alert('Sharing not supported on this device');
    return;
  }

  const list = convertTextareasToListItems();
  if (list.length === 0) return alert("Nothing to share.");

  let text = 'Grocery List\n\n';

  list.forEach(section => {
    text += `${section.label}:\n`;
    section.items.forEach(item => {
      text += `- ${item}\n`;
    });
    text += '\n';
  });

  try {
    await navigator.share({
      title: 'Grocery List',
      text,
    });
  } catch (err) {
    console.error('Share failed:', err);
  }
}


function convertTextareasToListItems() {
  const formattedList = [];

  for (const [label, textarea] of Object.entries(groceryTextAreas)) {
    const content = textarea.value.trim();
    if (!content) continue;

    const ingredients = content.split('\n').filter(line => line.trim() !== '');

    if (ingredients.length > 0) {
      formattedList.push({
        label,
        items: ingredients
      });
    }
  }

  return formattedList;
}

function renderChecklistPreview() {
  const list = convertTextareasToListItems();
  const container = document.getElementById('grocery-list-content');
  container.innerHTML = '';

  list.forEach(section => {
    const div = document.createElement('div');
    div.className = 'grocery-section';

    const heading = document.createElement('h4');
    heading.textContent = section.label;
    div.appendChild(heading);

    const ul = document.createElement('ul');
    section.items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<label><input type="checkbox"> ${item}</label>`;
      ul.appendChild(li);
    });

    div.appendChild(ul);
    container.appendChild(div);
  });
}


