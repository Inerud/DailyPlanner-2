document.addEventListener("DOMContentLoaded", async function () {
  const authSection = document.getElementById("auth-section");

  try {
      const response = await fetch("/api/account.php");
      const data = await response.json();

      if (data.user) {
          authSection.innerHTML = `
              <a href="/account">Account</a>
              <a href="/auth.php?logout=true" class="btn btn-danger">Logout</a>
          `;
      } else {
          authSection.innerHTML = `
              <a href="../server/auth/auth.php?login=true" class="btn btn-primary">Login</a>
          `;
      }

  } catch (error) {
      console.error("Error fetching user data:", error);
  }
});
