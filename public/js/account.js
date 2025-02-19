document.addEventListener("DOMContentLoaded", () => {
    const accountForm = document.getElementById("account-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const saveButton = document.getElementById("save-account");

    // Fetch user data and display it
    async function fetchUserData() {
        try {
            const response = await fetch("/api/account");
            const data = await response.json();

            if (!data.success) {
                console.error("Failed to fetch user data:", data.message);
                return;
            }

            nameInput.value = data.user.name || "";
            emailInput.value = data.user.email || "";
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    // Handle user info update
    async function updateUserData(event) {
        event.preventDefault(); // Prevent page reload

        const updatedData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
        };

        try {
            const response = await fetch("/api/account", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            alert("Account details updated successfully!");
        } catch (error) {
            console.error("Error updating user data:", error);
            alert("Failed to update account details.");
        }
    }

    saveButton.addEventListener("click", updateUserData);

    // Fetch user data when page loads
    fetchUserData();
});
