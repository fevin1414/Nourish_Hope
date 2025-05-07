const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Donation = require("../models/Donation");
const Food = require("../models/Food");

router.post("/money", auth, async (req, res) => {
  if (req.user.role !== "donor")
    return res.status(401).json({ msg: "Not authorized" });
  const { orphanageId, amount, message } = req.body;
  const d = new Donation({
    donorId: req.user.id,
    orphanageId,
    amount,
    message,
  });
  await d.save();
  res.json(d);
});

router.post("/food", auth, async (req, res) => {
  if (req.user.role !== "donor")
    return res.status(401).json({ msg: "Not authorized" });
  const { orphanageId, foodType, quantity, shelfLife, pickupLocation } =
    req.body;
  const f = new Food({
    donorId: req.user.id,
    orphanageId,
    foodType,
    quantity,
    shelfLife,
    pickupLocation,
  });
  await f.save();
  res.json(f);
});

router.get("/food", auth, async (req, res) => {
  try {
    const foods = await Food.find({ orphanageId: req.user.id }).populate(
      "donorId",
      "name email"
    );
    res.json(foods);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/money", auth, async (req, res) => {
  try {
    const donations = await Donation.find({
      orphanageId: req.user.id,
    }).populate("donorId", "name email");
    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
