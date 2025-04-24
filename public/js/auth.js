document.addEventListener("DOMContentLoaded", async function () {
    const authSection = document.getElementById("auth-section");
    const greetingElement = document.querySelector(".greeting");

  try {
    const response = await fetch("/api/account");
    const data = await response.json();

    if (data.user) {
      authSection.innerHTML = `<a href="/account"> Account settings</a>`
      authSection.innerHTML = `<a href="/account"> Account settings</a> <a href="/logout" class="btn btn-danger">Logout</a>`;
    } else {
      authSection.innerHTML = `<a href="/login" class="btn btn-primary">Login</a>`;
      console.error("Failed to fetch user data:", data.message);
    }

  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  /** User Greeting **/
  async function setUserGreeting() {
    try {
      const response = await fetch("/api/account");
      const data = await response.json();
      let greetings = ["Howdy", "Hi", "Nice To See You", "Hi there", "Hey", "Welcome", "Ahoy", "Yo, Yo, Yo", "What's kickin'"];
      let time = new Date().getHours();
      let greeting = time < 10 ? "Good Morning" : time >= 20 ? "Good Night" : greetings[Math.floor(Math.random() * greetings.length)];
      if (data.user) greetingElement.textContent = `${greeting} ${data.user.name}!`;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  
  setUserGreeting();
});