document.addEventListener("DOMContentLoaded", () => {
  loadAvailableFood();
});

async function loadAvailableFood() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/food", {
      headers: { "x-auth-token": token },
    });
    const foods = await res.json();
    const foodList = document.getElementById("foodList");
    foodList.innerHTML = "";
    foods.forEach((food) => {
      if (food.status !== "available") return;
      const card = document.createElement("div");
      card.className = "food-card";
      card.innerHTML = `
        <h3>${food.foodType}</h3>
        <p>Quantity: ${food.quantity}</p>
        <p>Shelf Life: ${new Date(food.shelfLife).toLocaleDateString()}</p>
        <p>Pickup: ${food.pickupLocation}</p>
        <button onclick="requestFood('${food._id}')">Request Food</button>
      `;
      foodList.appendChild(card);
    });
  } catch {
    alert("An error occurred");
  }
}

async function requestFood(foodId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ foodId }),
    });
    if (res.ok) {
      alert("Food requested successfully");
      loadAvailableFood();
    } else {
      const data = await res.json();
      alert(data.msg || "Failed to request food");
    }
  } catch {
    alert("An error occurred");
  }
}
