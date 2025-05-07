require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

async function seedAdmin() {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "password123";
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = new User({
      name: "Administrator",
      email,
      password,
      role: "admin",
      phone: "",
      address: "",
    });
    await admin.save();
    console.log("⚡️ Admin user created:", email);
  } else {
    console.log("⚡️ Admin already exists:", email);
  }
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
