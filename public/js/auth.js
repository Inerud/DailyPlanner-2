document.addEventListener("DOMContentLoaded", async function () {
    const authSection = document.getElementById("auth-section");

  try {
    const response = await fetch("/api/account");
    const data = await response.json();

    if (data.user) {
      authSection.innerHTML = `<a href="/account"> Account</a>`
      authSection.innerHTML = `<a href="/account"> Account</a> <a href="/logout" class="btn btn-danger">Logout</a>`;
    } else {
      authSection.innerHTML = `<a href="/login" class="btn btn-primary">Login</a>`;
      console.error("Failed to fetch user data:", data.message);
    }

  } catch (error) {
    console.error("Error fetching user data:", error);
  }
  
});