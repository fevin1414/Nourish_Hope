const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Food = require("../models/Food");
const Donation = require("../models/Donation");

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "donor")
    return res.status(401).json({ msg: "Not authorized" });
  const { foodType, quantity, shelfLife, pickupLocation } = req.body;
  const newFood = new Food({
    donorId: req.user.id,
    foodType,
    quantity,
    shelfLife,
    pickupLocation,
  });
  const food = await newFood.save();
  res.json(food);
});

router.get("/", auth, async (req, res) => {
  try {
    let foods;
    let donations;

    if (req.user.role === "donor") {
      foods = await Food.find({ donorId: req.user.id });
      donations = await Donation.find({ donorId: req.user.id });
    } else if (req.user.role === "orphanage") {
      foods = await Food.find({ status: "available" });
      donations = await Donation.find(); // or filter by assigned orphanage
    } else if (req.user.role === "admin") {
      foods = await Food.find().populate("donorId", ["name", "email"]);
      donations = await Donation.find().populate("donorId", ["name", "email"]);
    }

    res.json({ foods, donations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ msg: "Food not found" });
  if (req.user.role === "orphanage" && req.body.status === "reserved") {
    food.status = "reserved";
    food.orphanageId = req.user.id;
    await food.save();
    return res.json(food);
  }
  if (
    req.user.role === "donor" &&
    food.donorId.toString() === req.user.id &&
    req.body.status === "delivered"
  ) {
    food.status = "delivered";
    food.deliveryDate = Date.now();
    await food.save();
    return res.json(food);
  }
  if (req.user.role === "admin") {
    Object.assign(food, req.body);
    await food.save();
    return res.json(food);
  }
  res.status(401).json({ msg: "Not authorized" });
});

module.exports = router;
