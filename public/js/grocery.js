function generateGroceryListFromMeals(meals) {
    const grouped = {};
  
    meals.forEach(meal => {
      const key = `${meal.day_of_week} - ${capitalize(meal.meal_type)}`;
      if (!grouped[key]) grouped[key] = "";
    });
  
    return grouped;
  }
  
  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  