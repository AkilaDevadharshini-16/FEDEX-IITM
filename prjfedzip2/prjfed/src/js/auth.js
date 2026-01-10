/***********************
 * API BASE URL
 ***********************/
const AUTH_API = "http://localhost:5000/api/auth";

/***********************
 * REGISTER FUNCTION
 ***********************/
async function register() {
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!role || !username || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(`${AUTH_API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Registration successful");
    window.location.href = "login.html";

  } catch (err) {
    alert("Server error");
    console.error(err);
  }
}

/***********************
 * LOGIN FUNCTION
 ***********************/
async function login() {
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!role || !username || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(`${AUTH_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Invalid credentials");
      return;
    }

    // STORE JWT + USER
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: data.username,
        role: data.role
      })
    );

    // REDIRECT BASED ON ROLE
    if (data.role === "manager") window.location.href = "manager.html";
    if (data.role === "dca") window.location.href = "dca.html";
    if (data.role === "customer") window.location.href = "customer.html";

  } catch (err) {
    alert("Server error");
    console.error(err);
  }
}

/***********************
 * LOGOUT
 ***********************/
function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

/***********************
 * PASSWORD TOGGLE
 ***********************/
function togglePassword() {
  const pwd = document.getElementById("password");
  pwd.type = pwd.type === "password" ? "text" : "password";
}
