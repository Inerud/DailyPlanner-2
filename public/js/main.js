//add "reward" for completing exercise

document.addEventListener("DOMContentLoaded", async function () {
  const authSection = document.getElementById("auth-section");
  const greeting = document.getElementById("greeting");
  const challenge = document.getElementById("challengetext");

  try {
      const response = await fetch("/api/account");
      const data = await response.json();
      var today = new Date().getHours();

      let greetingVar = "Hello";
      let greetings = ["Howdy", "Hi", "Nice To See You", "Hi there", "Hey", "Waddup", "Hello", "Welcome", "Ahoy", "Yo, Yo, Yo", "Whats kickin'"];    
      if (today <= 10 ) {
        greetingVar = "Good Morning";
      } else if (today >= 20 ) {
        greetingVar = "Good Night";
      } else {
        let x = Math.floor(Math.random() * greetings.length);
        greetingVar = greetings[x];
      }

      if (data.user) {
          greeting.textContent = `${greetingVar}, ${data.user.name}!`;
          authSection.innerHTML = `<a href="/account"> Account</a>`
          authSection.innerHTML = `<a href="/account"> Account</a> <a href="/logout" class="btn btn-danger">Logout</a>`;
      } else {
          authSection.innerHTML = `<a href="/login" class="btn btn-primary">Login</a>`;
      }
  } catch (error) {
      console.error("Error fetching user data:", error);
      authSection.innerHTML = `<a href="/login" class="btn btn-primary">Login</a>`;
  }


  try {
    //call api endpoint for exercises
    //randomise exercise every day

  } catch (error) {
    console.error("Error fetching exercise data:", error);
  }


});
