const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");
const passError = document.getElementById("incorret-password");

const API_BASE_URL = "https://e-commerce-web-1nmc.onrender.com";
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  toggleLoadingState(true);
  
  const credentials = {
    username: usernameInput.value.trim(),
    password: passwordInput.value.trim()
  };

  try {
    const response = await authenticateUser(credentials);
    
    if (response.success) {
      handleSuccessfulLogin(response.token);
    } else {
      showError(response.message || "Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    showError("Connection error. Please try again later.");
  } finally {
    toggleLoadingState(false);
  }
});

async function authenticateUser(credentials) {
  const response = await fetch(LOGIN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

function handleSuccessfulLogin(token) {
  localStorage.setItem("token", token);
  console.log("Authentication token stored successfully");
window.location.href = "https://ajalill01.github.io/E-commerce_web/admin-dashboard/myAdmin";
}

function showError(message) {
  passError.textContent = message;
  passError.style.display = 'block';
}

function toggleLoadingState(isLoading) {
  btnText.style.display = isLoading ? "none" : "inline";
  spinner.style.display = isLoading ? "block" : "none";
  

  usernameInput.disabled = isLoading;
  passwordInput.disabled = isLoading;
  loginBtn.disabled = isLoading;
}