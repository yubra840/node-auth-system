// public/script.js

function toggleForm() {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const signupmessage = document.getElementById('signupmessage');
  const warningmessage = document.getElementById('warningmessage');
  const noticemessage = document.getElementById('noticemessage');

  signupmessage.textContent = ''; // Clear messages on switch
  warningmessage.textContent = '';
  noticemessage.textContent = '';

  if (signupForm.style.display === 'none') {
    signupForm.style.display = 'flex';
    loginForm.style.display = 'none';
  } else {
    signupForm.style.display = 'none';
    loginForm.style.display = 'flex';
  }
}
function togglePassword(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    iconElement.textContent = '🙈'; // eye-slash
  } else {
    input.type = 'password';
    iconElement.textContent = '👁️';
  }
}

// Signup submission
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  const res = await fetch('/routes/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
    if (data.message === 'Thanks for signing up!') {
        document.getElementById('signupmessage').textContent = data.message;
        document.getElementById('noticemessage').textContent = data.notice;

    } else {
        document.getElementById('warningmessage').textContent = data.message;
    }
});

// Login submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch('/routes/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (data.success) {
    window.location.href = '/forex.html';
  } else {
    document.getElementById('warningmessage').textContent = data.message;
  }
});
// Forgot password functionality
document.getElementById("forgotPassword").addEventListener("click", async () => {
  const emailInput = document.getElementById("login-email");
  const email = emailInput ? emailInput.value : null;

  if (!email) {
    alert("Please enter your email first.");
    return;
  }

  try {
    const res = await fetch("/routes/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    const messageBox = document.getElementById("reset-message");
    messageBox.textContent = data.message;
    messageBox.style.color = res.ok ? "green" : "red";
    messageBox.style.textAlign = "center";



  } catch (err) {
    alert("Something went wrong.");
  }
});
