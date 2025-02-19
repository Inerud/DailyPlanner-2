document.addEventListener("DOMContentLoaded", async function () {
  const authSection = document.getElementById("auth-section");
  const greeting = document.getElementById("greeting");

  try {
      const response = await fetch("/api/user");
      const data = await response.json();

      if (data.user) {
          greeting.textContent = `Good Morning, ${data.user.name}!`;
          authSection.innerHTML = `<a href="/account"> Account</a>`
          authSection.innerHTML = `<a href="/account"> Account</a> <a href="/logout" class="btn btn-danger">Logout</a>`;
      } else {
          authSection.innerHTML = `<a href="/login" class="btn btn-primary">Login</a>`;
      }
  } catch (error) {
      console.error("Error fetching user data:", error);
      authSection.innerHTML = `<a href="/login" class="btn btn-primary">Login</a>`;
  }
});
