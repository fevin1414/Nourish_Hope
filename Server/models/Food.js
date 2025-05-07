const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  foodType: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  shelfLife: {
    type: Date,
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "reserved", "delivered"],
    default: "available",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orphanageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  deliveryDate: {
    type: Date,
  },
});

module.exports = mongoose.model("Food", FoodSchema);
