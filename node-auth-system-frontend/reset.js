// reset.js
function togglePassword(inputId, toggleIcon) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    toggleIcon.textContent = "🙈";
  } else {
    input.type = "password";
    toggleIcon.textContent = "👁️";
  }
}
document.getElementById("resetForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const message = document.getElementById("message");

  if (newPassword !== confirmPassword) {
    message.textContent = "❌ Passwords do not match!";
    message.style.color = "red";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    message.textContent = "❌ Invalid or missing reset token.";
    message.style.color = "red";
    return;
  }

  const response = await fetch("/routes/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword })
  });

  const data = await response.json();

  if (response.ok) {
    document.getElementById("resetForm").style.display = "none";
    message.innerHTML = `
      ✅ ${data.message}<br><br>
      <button id="loginButton" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Go to Login
      </button>
    `;
    message.style.color = "green";

    // Add click event to login button
    document.getElementById("loginButton").addEventListener("click", () => {
      window.location.href = "/signup.html";
    });
  } else {
    message.textContent = `❌ ${data.message}`;
    message.style.color = "red";
  }
});

