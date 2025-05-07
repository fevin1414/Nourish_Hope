const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food",
    required: true,
  },
  orphanageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  feedback: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
});

module.exports = mongoose.model("Request", RequestSchema);
