const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/users", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).json({ msg: "Not authorized" });
  }

  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/users/:id/verify", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).json({ msg: "Not authorized" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.verificationStatus = true;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
