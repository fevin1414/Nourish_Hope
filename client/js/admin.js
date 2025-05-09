document.addEventListener("DOMContentLoaded", () => {
  loadAllUsers();
  loadAllDonations();
  loadAllRequests();

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchSection(btn.dataset.section);
      if (btn.dataset.section === "users") loadAllUsers();
      if (btn.dataset.section === "donations") loadAllDonations();
      if (btn.dataset.section === "all-requests") loadAllRequests();
    });
  });

  document
    .getElementById("addUserForm")
    .addEventListener("submit", async (e) => {
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
        const res = await fetch("/api/admin/addusers", {
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
        msgEl.textContent = "An error occurred. Try again.";
        msgEl.style.color = "red";
      }
    });

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
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ name, email, role, phone, address }),
        });
        const data = await res.json();
        if (res.ok) {
          closeEditModal();
          loadAllUsers();
        } else {
          msgEl.textContent = data.msg || "Failed to update user.";
          msgEl.style.color = "red";
        }
      } catch {
        msgEl.textContent = "An error occurred. Try again.";
        msgEl.style.color = "red";
      }
    });
});

function switchSection(sectionId) {
  document
    .querySelectorAll(".content-section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".menu-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
  document
    .querySelector(`.menu-btn[data-section="${sectionId}"]`)
    .classList.add("active");
}

function openEditUser(id, name, email, role, phone, address) {
  document.getElementById("editUserId").value = id;
  document.getElementById("editName").value = name;
  document.getElementById("editEmail").value = email;
  document.getElementById("editRole").value = role;
  document.getElementById("editPhone").value = phone;
  document.getElementById("editAddress").value = address;
  document.getElementById("editUserModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editUserModal").style.display = "none";
  document.getElementById("editUserForm").reset();
  document.getElementById("editUserMsg").textContent = "";
}

async function loadAllUsers() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/users", {
    headers: { "x-auth-token": token },
  });
  const users = await res.json();
  const usersList = document.getElementById("usersList");
  usersList.innerHTML = "";
  users.forEach((user) => {
    const card = document.createElement("div");
    card.className = "user-card";
    card.innerHTML = `
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
      }', '${user.name}', '${user.email}', '${user.role}', '${user.phone}', '${
      user.address
    }')">Edit</button>
      <button class="action-btn delete-btn" onclick="deleteUser('${
        user._id
      }')">Delete</button>
      <button class="action-btn verify-btn" onclick="verifyUser('${
        user._id
      }')">${user.verificationStatus ? "Unverify" : "Verify"}</button>
    `;
    usersList.appendChild(card);
  });
}

async function deleteUser(userId) {
  if (!confirm("Are you sure?")) return;
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "x-auth-token": token },
  });
  if (res.ok) loadAllUsers();
}

async function verifyUser(userId) {
  const token = localStorage.getItem("token");
  await fetch(`/api/admin/users/${userId}/verify`, {
    method: "PUT",
    headers: { "x-auth-token": token },
  });
  loadAllUsers();
}

async function loadAllDonations() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/food", {
    headers: { "x-auth-token": token },
  });
  const { foods, donations } = await res.json();
  const list = document.getElementById("donationsList");
  list.innerHTML = "";

  foods.forEach((food) => {
    const statusClass =
      food.status === "available"
        ? "available"
        : food.status === "reserved"
        ? "reserved"
        : "delivered";
    const card = document.createElement("div");
    card.className = "food-card";
    card.innerHTML = `
      <h3>${food.foodType}</h3>
      <p><strong>Donor:</strong> ${food.donorId?.name || "N/A"}</p>
      <p><strong>Quantity:</strong> ${food.quantity}</p>
      <p><strong>Pickup:</strong> ${food.pickupLocation}</p>
      <p><strong>Status:</strong> <span class="status ${statusClass}">${
      food.status
    }</span></p>
    `;
    list.appendChild(card);
  });

  donations.forEach((m) => {
    const card = document.createElement("div");
    card.className = "money-card";
    card.innerHTML = `
      <h3>Money Donation</h3>
      <p><strong>Donor:</strong> ${m.donorId?.name || "N/A"}</p>
      <p><strong>Amount:</strong> ₹${m.amount}</p>
      <p><strong>Message:</strong> ${m.message || "—"}</p>
    `;
    list.appendChild(card);
  });
}

async function loadAllRequests() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/request", {
    headers: { "x-auth-token": token },
  });
  const requests = await res.json();
  const list = document.getElementById("allRequestsList");
  list.innerHTML = "";
  requests.forEach((r) => {
    const card = document.createElement("div");
    card.className = "request-card";
    card.innerHTML = `
      <h3>${r.foodId?.foodType}</h3>
      <p><strong>Donor:</strong> ${r.foodId?.donorId?.name}</p>
      <p><strong>Orphanage:</strong> ${r.orphanageId?.name}</p>
      <p><strong>Status:</strong> ${r.status}</p>
    `;
    list.appendChild(card);
  });
}
