document.addEventListener("DOMContentLoaded", () => {
  loadAllUsers();

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchSection(btn.dataset.section);

      if (btn.dataset.section === "users") loadAllUsers();
      if (btn.dataset.section === "donations") loadAllDonations();
      if (btn.dataset.section === "all-requests") loadAllRequests();
    });
  });
});

document.getElementById("addUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("newName").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const role = document.getElementById("newRole").value;
  const phone = document.getElementById("newPhone").value.trim();

  const msgEl = document.getElementById("userAddMsg");
  msgEl.textContent = "";

  if (!name || !email || !password || !role || !phone) {
    msgEl.textContent = "All fields are required.";
    msgEl.style.color = "red";
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/admin/addusers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ name, email, password, role, phone }),
    });

    const data = await res.json();

    if (res.ok) {
      msgEl.textContent = "User added successfully!";
      msgEl.style.color = "green";
      document.getElementById("addUserForm").reset();
      loadAllUsers();
    } else {
      msgEl.textContent = data.msg || "Failed to add user.";
      msgEl.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    msgEl.textContent = "An error occurred. Try again.";
    msgEl.style.color = "red";
  }
});

function switchSection(sectionId) {
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  document
    .querySelector(`.menu-btn[data-section="${sectionId}"]`)
    ?.classList.add("active");
}

async function loadAllUsers() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/admin/users", {
      headers: { "x-auth-token": token },
    });

    const users = await res.json();

    if (res.ok) {
      const usersList = document.getElementById("usersList");
      usersList.innerHTML = "";

      users.forEach((user) => {
        const userCard = document.createElement("div");
        userCard.className = "user-card";
        userCard.innerHTML = `
          <h3>${user.name}</h3>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Status:</strong> ${
            user.verificationStatus ? "Verified" : "Not Verified"
          }</p>
          ${
            !user.verificationStatus
              ? `<button class="action-btn verify-btn" onclick="verifyUser('${user._id}')">Edit</button>`
              : ""
          }
        `;
        usersList.appendChild(userCard);
      });
    } else {
      alert("Failed to load users");
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred");
  }
}

async function loadAllDonations() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/food", {
      headers: { "x-auth-token": token },
    });

    const foods = await res.json();

    if (res.ok) {
      const donationsList = document.getElementById("donationsList");
      donationsList.innerHTML = "";

      foods.forEach((food) => {
        const statusClass =
          food.status === "available"
            ? "available"
            : food.status === "reserved"
            ? "reserved"
            : "delivered";

        const foodCard = document.createElement("div");
        foodCard.className = "food-card";
        foodCard.innerHTML = `
          <h3>${food.foodType}</h3>
          <p><strong>Donor:</strong> ${food.donorId.name}</p>
          <p><strong>Quantity:</strong> ${food.quantity}</p>
          <p><strong>Shelf Life:</strong> ${new Date(
            food.shelfLife
          ).toLocaleDateString()}</p>
          <p><strong>Pickup Location:</strong> ${food.pickupLocation}</p>
          <p><strong>Status:</strong> <span class="status ${statusClass}">${
          food.status
        }</span></p>
        `;

        donationsList.appendChild(foodCard);
      });
    } else {
      alert("Failed to load donations");
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred");
  }
}

async function loadAllRequests() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/request", {
      headers: { "x-auth-token": token },
    });

    const requests = await res.json();

    if (res.ok) {
      const allRequestsList = document.getElementById("allRequestsList");
      allRequestsList.innerHTML = "";

      requests.forEach((request) => {
        const requestCard = document.createElement("div");
        requestCard.className = "request-card";
        requestCard.innerHTML = `
          <h3>${request.foodId.foodType}</h3>
          <p><strong>Donor:</strong> ${request.foodId.donorId.name}</p>
          <p><strong>Orphanage:</strong> ${request.orphanageId.name}</p>
          <p><strong>Status:</strong> ${request.status}</p>
          ${
            request.feedback
              ? `<p><strong>Feedback:</strong> ${request.feedback}</p>`
              : ""
          }
          ${
            request.rating
              ? `<p><strong>Rating:</strong> ${request.rating}/5</p>`
              : ""
          }
        `;

        allRequestsList.appendChild(requestCard);
      });
    } else {
      alert("Failed to load requests");
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred");
  }
}

async function verifyUser(userId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5000/api/admin/users/${userId}/verify`,
      {
        method: "PUT",
        headers: { "x-auth-token": token },
      }
    );

    if (res.ok) {
      alert("User verified successfully");
      loadAllUsers();
    } else {
      const data = await res.json();
      alert(data.msg || "Failed to verify user");
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred");
  }
}
