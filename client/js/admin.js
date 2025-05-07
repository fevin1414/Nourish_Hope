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
  const address = document.getElementById("address").value.trim();

  const msgEl = document.getElementById("userAddMsg");
  msgEl.textContent = "";

  if (!name || !email || !password || !role || !phone || !address) {
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
      body: JSON.stringify({ name, email, password, role, phone, address }),
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

function openEditUser(id, name, email, role, phone, address) {
  document.getElementById("editUserId").value = id;
  document.getElementById("editName").value = name;
  document.getElementById("editEmail").value = email;
  document.getElementById("editRole").value = role;
  document.getElementById("editPhone").value = phone;
  document.getElementById("editAddress").value = address;

  // Fix: Use style.display instead of classList
  document.getElementById("editUserModal").style.display = "block";
}

function closeEditModal() {
  // Fix: Use style.display instead of classList
  document.getElementById("editUserModal").style.display = "none";
  document.getElementById("editUserForm").reset();
  document.getElementById("editUserMsg").textContent = "";
}

document
  .getElementById("editUserForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editUserId").value;
    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const role = document.getElementById("editRole").value;
    const phone = document.getElementById("editPhone").value.trim();
    const address = document.getElementById("editAddress").value.trim();
    const msgEl = document.getElementById("editUserMsg");

    if (!name || !email || !role || !phone || !address) {
      msgEl.textContent = "All fields are required.";
      msgEl.style.color = "red";
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ name, email, role, phone, address }),
      });

      const data = await res.json();

      if (res.ok) {
        msgEl.textContent = "User updated successfully!";
        msgEl.style.color = "green";
        closeEditModal();
        loadAllUsers();
      } else {
        msgEl.textContent = data.msg || "Failed to update user.";
        msgEl.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      msgEl.textContent = "An error occurred. Try again.";
      msgEl.style.color = "red";
    }
  });

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
          <p><strong>Phone:</strong> ${user.phone}</p>
          <p><strong>Address:</strong> ${user.address}</p>
          <button class="action-btn edit-btn" onclick="openEditUser('${
            user._id
          }', '${user.name}', '${user.email}', '${user.role}', '${
          user.phone
        }', '${user.address}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteUser('${
            user._id
          }')">Delete</button>
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

async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.msg || "Failed to delete user");
    }

    alert("User deleted successfully");
    loadAllUsers();
  } catch (err) {
    console.error("Delete error:", err);
    alert(err.message || "An error occurred while deleting user");
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
