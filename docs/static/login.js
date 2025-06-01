const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");
const passError = document.getElementById("incorret-password")

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  btnText.style.display = "none";
  spinner.style.display = "block";

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      console.log("Token received:", data.token);
      localStorage.setItem("token", data.token);
      console.log("Token stored:", localStorage.getItem("token"));
      window.location.href = "/docs/admin-dashboard/myAdmin.html";
    } else {
      passError.textContent = data.message;       
      passError.style.display = 'block';
    }
  } catch (err) {
    console.error("Login error:", err);
    passError.textContent = "Something went wrong";
    passError.style.display = 'block';
  } finally {
    btnText.style.display = "inline";
    spinner.style.display = "none";
  }
});