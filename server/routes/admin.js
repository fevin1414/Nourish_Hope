const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/admin");
const User = require("../models/User");
const Food = require("../models/Food");
const Request = require("../models/Request");

router.get("/users", auth, isAdmin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.put("/users/:id/verify", auth, isAdmin, async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ msg: "User not found" });
  u.verificationStatus = true;
  await u.save();
  res.json({ msg: "User verified" });
});

router.post("/addusers", auth, isAdmin, async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role || !phone) {
    return res.status(400).json({ msg: "Please provide all required fields." });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists." });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      verificationStatus: role === "admin" ? true : false,
    });

    await user.save();

    res.status(201).json({ msg: "User created successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/food", auth, isAdmin, async (req, res) => {
  const foods = await Food.find().populate("donorId", "name email");
  res.json(foods);
});

router.get("/requests", auth, isAdmin, async (req, res) => {
  const reqs = await Request.find()
    .populate("donorId", "name email")
    .populate("orphanageId", "name email");
  res.json(reqs);
});

module.exports = router;
