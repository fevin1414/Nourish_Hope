const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
router.get("/", auth, async (req, res) => {
  const list = await User.find({ role: "orphanage" }).select(
    "name email address"
  );
  res.json(list);
});
module.exports = router;
