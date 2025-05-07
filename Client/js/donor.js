document.addEventListener("DOMContentLoaded", () => {
  let type, id;
  function switchSection(sec) {
    document
      .querySelectorAll(".content-section")
      .forEach((s) => s.classList.toggle("active", s.id === sec));
    document
      .querySelectorAll(".menu-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.section === sec));
  }
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("token");
    location = "index.html";
  };
  document
    .querySelectorAll(".menu-btn")
    .forEach((b) => (b.onclick = () => switchSection(b.dataset.section)));
  async function fetchOrphanages() {
    const res = await fetch("http://localhost:5000/api/orphanages", {
      headers: { "x-auth-token": localStorage.getItem("token") },
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
          <button class="donate-food" data-id="${o._id}">Food</button>
          <button class="donate-money" data-id="${o._id}">Money</button>
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
        l.textContent = f;
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
      l1.textContent = "Amount ($)";
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
    form.appendChild(btn);
    box.classList.remove("hidden");
    form.onsubmit = submitDonation;
  }
  async function submitDonation(e) {
    e.preventDefault();
    const tok = localStorage.getItem("token"),
      url = "http://localhost:5000/api/donate/" + type;
    const body = { orphanageId: id };
    if (type === "food")
      ["foodType", "quantity", "shelfLife", "pickupLocation"].forEach(
        (f) => (body[f] = document.getElementById(f).value)
      );
    else {
      body.amount = Number(document.getElementById("amount").value);
      body.message = document.getElementById("message").value;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": tok },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      alert("Success");
      document
        .querySelector(`.donate-${type}[data-id="${id}"]`)
        .closest("tr")
        .remove();
      box.classList.add("hidden");
    } else alert("Failed");
  }
  fetchOrphanages();
});
