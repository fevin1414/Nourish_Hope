document.addEventListener("DOMContentLoaded", () => {
  const foodForm = document.getElementById("foodForm");

  if (foodForm) {
    foodForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const foodType = document.getElementById("foodType").value;
      const quantity = document.getElementById("quantity").value;
      const shelfLife = document.getElementById("shelfLife").value;
      const pickupLocation = document.getElementById("pickupLocation").value;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/food", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            foodType,
            quantity,
            shelfLife,
            pickupLocation,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("Food posted successfully!");
          foodForm.reset();
          loadDonorDonations();
        } else {
          alert(data.msg || "Failed to post food");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred");
      }
    });
  }
});

async function loadDonorDonations() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/food", {
      headers: {
        "x-auth-token": token,
      },
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
          <p><strong>Quantity:</strong> ${food.quantity}</p>
          <p><strong>Shelf Life:</strong> ${new Date(
            food.shelfLife
          ).toLocaleDateString()}</p>
          <p><strong>Pickup Location:</strong> ${food.pickupLocation}</p>
          <p><strong>Status:</strong> <span class="status ${statusClass}">${
          food.status
        }</span></p>
          ${
            food.status === "reserved"
              ? `<button class="action-btn" onclick="markAsDelivered('${food._id}')">Mark as Delivered</button>`
              : ""
          }
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

async function loadDonorRequests() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/request", {
      headers: {
        "x-auth-token": token,
      },
    });

    const requests = await res.json();

    if (res.ok) {
      const requestsList = document.getElementById("requestsList");
      requestsList.innerHTML = "";

      requests.forEach((request) => {
        const requestCard = document.createElement("div");
        requestCard.className = "request-card";
        requestCard.innerHTML = `
          <h3>${request.orphanageId.name}</h3>
          <p><strong>Address:</strong> ${request.orphanageId.address}</p>
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

        requestsList.appendChild(requestCard);
      });
    } else {
      alert("Failed to load requests");
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred");
  }
}

async function markAsDelivered(foodId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/food/${foodId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ status: "delivered" }),
    });

    if (res.ok) {
      alert("Food marked as delivered");
      loadDonorDonations();
    } else {
      const data = await res.json();
      alert(data.msg || "Failed to update status");
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred");
  }
}
