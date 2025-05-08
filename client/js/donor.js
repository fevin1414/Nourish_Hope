document.addEventListener("DOMContentLoaded", () => {
  let type, id;
  const token = () => localStorage.getItem("token");

  function switchSection(sec) {
    document
      .querySelectorAll(".content-section")
      .forEach((s) => s.classList.toggle("active", s.id === sec));
    document
      .querySelectorAll(".menu-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.section === sec));
    if (sec === "my-donations") fetchMyDonations();
  }

  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("token");
    location = "index.html";
  };

  document
    .querySelectorAll(".menu-btn")
    .forEach((b) => (b.onclick = () => switchSection(b.dataset.section)));

  async function fetchOrphanages() {
    const res = await fetch("/api/orphanages", {
      headers: { "x-auth-token": token() },
    });
    const list = await res.json();
    const tb = document.querySelector("#orphanageTable tbody");
    tb.innerHTML = "";
    list.forEach((o) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="Name">${o.name}</td>
        <td data-label="Email">${o.email}</td>
        <td data-label="Address">${o.address || ""}</td>
        <td data-label="Donate">
          <button class="donate-food action-btn" data-id="${
            o._id
          }">Food</button>
          <button class="donate-money action-btn" data-id="${
            o._id
          }">Money</button>
        </td>`;
      tb.appendChild(tr);
    });
    document
      .querySelectorAll(".donate-food")
      .forEach((b) => (b.onclick = () => openForm("food", b.dataset.id)));
    document
      .querySelectorAll(".donate-money")
      .forEach((b) => (b.onclick = () => openForm("money", b.dataset.id)));
  }

  const box = document.getElementById("donationForms"),
    form = document.getElementById("donationForm");
  document.getElementById("cancelDonation").onclick = () => {
    box.classList.add("hidden");
    form.innerHTML = "";
  };

  function openForm(t, i) {
    type = t;
    id = i;
    form.innerHTML = "";
    document.getElementById("donationHeader").textContent =
      t === "food" ? "Donate Food" : "Donate Money";
    if (t === "food") {
      ["foodType", "quantity", "shelfLife", "pickupLocation"].forEach((f) => {
        const d = document.createElement("div"),
          l = document.createElement("label"),
          inp = document.createElement("input");
        l.textContent = f
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (ch) => ch.toUpperCase());
        inp.id = f;
        inp.required = true;
        inp.type = f === "shelfLife" ? "date" : "text";
        d.className = "form-group";
        d.append(l, inp);
        form.appendChild(d);
      });
    } else {
      const d1 = document.createElement("div"),
        l1 = document.createElement("label"),
        inp1 = document.createElement("input");
      l1.textContent = "Amount (Rs)";
      inp1.id = "amount";
      inp1.type = "number";
      inp1.required = true;
      d1.className = "form-group";
      d1.append(l1, inp1);
      const d2 = document.createElement("div"),
        l2 = document.createElement("label"),
        ta2 = document.createElement("textarea");
      l2.textContent = "Message (optional)";
      ta2.id = "message";
      d2.className = "form-group";
      d2.append(l2, ta2);
      form.append(d1, d2);
    }
    const btn = document.createElement("button");
    btn.textContent = "Donate";
    btn.type = "submit";
    btn.className = "action-btn";
    form.appendChild(btn);

    box.classList.remove("hidden");
    form.onsubmit = submitDonation;
  }

  async function submitDonation(e) {
    e.preventDefault();
    const url = "/api/donations/" + type;
    const body = { orphanageId: id };
    if (type === "food") {
      ["foodType", "quantity", "shelfLife", "pickupLocation"].forEach((f) => {
        body[f] = document.getElementById(f).value;
      });
    } else {
      body.amount = Number(document.getElementById("amount").value);
      body.message = document.getElementById("message").value;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": token() },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      alert("Success");
      box.classList.add("hidden");
      form.innerHTML = "";
    } else {
      alert("Failed");
    }
  }

  async function fetchMyDonations() {
    const foodRes = await fetch("/api/food/my-donations", {
      headers: { "x-auth-token": token() },
    });
    const moneyRes = await fetch("/api/donations/money/my-donations", {
      headers: { "x-auth-token": token() },
    });
    const foods = await foodRes.json();
    const monies = await moneyRes.json();
    const list = document.getElementById("donationsList");
    list.innerHTML = "";
    if (foods.length) {
      const fs = document.createElement("div");
      fs.innerHTML = "<h3>Food Donations</h3>";
      foods.forEach((f) => {
        const d = document.createElement("div");
        d.textContent = `${f.quantity} x ${f.foodType} to ${f.orphanageId.name}`;
        fs.appendChild(d);
      });
      list.appendChild(fs);
    }
    if (monies.length) {
      const ms = document.createElement("div");
      ms.innerHTML = "<h3>Money Donations</h3>";
      monies.forEach((m) => {
        const d = document.createElement("div");
        d.textContent = `₹${m.amount} to ${m.orphanageId.name}`;
        ms.appendChild(d);
      });
      list.appendChild(ms);
    }
  }

  fetchOrphanages();
});
