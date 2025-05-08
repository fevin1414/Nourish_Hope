document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  };

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".menu-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".content-section")
        .forEach((s) => s.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.section).classList.add("active");
      if (btn.dataset.section === "received-food") loadReceivedFood();
      if (btn.dataset.section === "received-money") loadReceivedMoney();
    };
  });

  loadReceivedFood();

  async function loadReceivedFood() {
    const res = await fetch("/api/donations/food", {
      headers: { "x-auth-token": token },
    });
    const foods = await res.json();
    const container = document.getElementById("receivedFoodList");
    container.innerHTML = "";
    foods.forEach((f) => {
      const div = document.createElement("div");
      div.className = "donation-card";
      div.innerHTML = `
        <h3>${f.foodType}</h3>
        <p><strong>Quantity:</strong> ${f.quantity}</p>
        <p><strong>Shelf Life:</strong> ${new Date(
          f.shelfLife
        ).toLocaleDateString()}</p>
        <p><strong>Pickup Location:</strong> ${f.pickupLocation}</p>
        <p><strong>Donor:</strong> ${f.donorId.name} (${f.donorId.email})</p>

      `;
      container.appendChild(div);
    });
  }

  async function loadReceivedMoney() {
    const res = await fetch("/api/donations/money", {
      headers: { "x-auth-token": token },
    });
    const donations = await res.json();
    const container = document.getElementById("receivedMoneyList");
    container.innerHTML = "";
    donations.forEach((d) => {
      const div = document.createElement("div");
      div.className = "donation-card";
      div.innerHTML = `
        <p><strong>Amount:</strong> $${d.amount}</p>
        <p><strong>Message:</strong> ${d.message || "–"}</p>
        <p><strong>Donor:</strong> ${d.donorId.name} (${d.donorId.email})</p>
        <p><strong>Date:</strong> ${new Date(
          d.donatedAt
        ).toLocaleDateString()}</p>
      `;
      container.appendChild(div);
    });
  }
});
