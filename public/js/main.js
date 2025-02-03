document.addEventListener("DOMContentLoaded", async function () {
    const authSection = document.getElementById("auth-section");
  
    try {
        const response = await fetch("/api/user");

      const data = await response.json();
  
      if (data.user) {
        authSection.innerHTML = `
          <p>Welcome, ${data.user.name}!</p>
          <a href="/logout" class="btn btn-danger">Logout</a>
        `;
      } else {
        authSection.innerHTML = `
          <a href="/login" class="btn btn-primary">Login</a>
        `;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      authSection.innerHTML = `<a href="/login" class="btn btn-primary">Login</a>`;
    }
  });
  