const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");
function logError(context, error, response = null) {
  console.groupCollapsed(`Error in ${context}`);
  console.error("Error:", error);
  if (response) {
    console.log("HTTP Status:", response.status);
    console.log("Response:", response);
    try {
      const d = response.json();
      console.log("Response Data:", d);
    } catch {}
  }
  console.groupEnd();
}
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    try {
      const res = await fetch("api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP error! status:${res.status}`);
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      switch (data.role) {
        case "donor":
          window.location.href = "donor.html";
          break;
        case "orphanage":
          window.location.href = "orphanage.html";
          break;
        case "admin":
          window.location.href = "admin.html";
          break;
        default:
          alert("Invalid role");
      }
    } catch (err) {
      logError("login form submission", err);
      alert(`Login failed: ${err.message}`);
    }
  });
}
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById("regName").value,
      email: document.getElementById("regEmail").value,
      password: document.getElementById("regPassword").value,
      role: document.getElementById("regRole").value,
      phone: document.getElementById("regPhone").value,
      address: document.getElementById("regAddress").value,
    };
    try {
      const res = await fetch("api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP error! status:${res.status}`);
      }
      await res.json();
      alert("Registration successful! Please login.");
      document.querySelector('.tab-btn[data-tab="login"]').click();
    } catch (err) {
      logError("registration form submission", err);
      alert(`Registration failed: ${err.message}`);
    }
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token && window.location.pathname.endsWith("login.html")) {
    window.location.href = "donor.html";
  } else if (!token && !window.location.pathname.endsWith("login.html")) {
    window.location.href = "login.html";
  }
});
