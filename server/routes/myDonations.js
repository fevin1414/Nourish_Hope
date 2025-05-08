const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Food = require("../models/Food");
const Donation = require("../models/Donation");

router.get("/food/my-donations", auth, async (req, res) => {
  try {
    const foods = await Food.find({ donorId: req.user.id }).populate(
      "orphanageId",
      "name"
    );
    res.json(foods);
  } catch {
    res.status(500).send("Server Error");
  }
});

router.get("/donations/money/my-donations", auth, async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id }).populate(
      "orphanageId",
      "name"
    );
    res.json(donations);
  } catch {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
