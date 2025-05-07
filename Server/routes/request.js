const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Request = require("../models/Request");
const Food = require("../models/Food");

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "orphanage") {
    return res.status(401).json({ msg: "Not authorized" });
  }

  const { foodId } = req.body;

  try {
    const food = await Food.findById(foodId);
    if (!food || food.status !== "available") {
      return res.status(400).json({ msg: "Food not available" });
    }

    const newRequest = new Request({
      foodId,
      orphanageId: req.user.id,
    });

    const request = await newRequest.save();

    food.status = "reserved";
    food.orphanageId = req.user.id;
    await food.save();

    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/", auth, async (req, res) => {
  try {
    let requests;
    if (req.user.role === "orphanage") {
      requests = await Request.find({ orphanageId: req.user.id }).populate(
        "foodId"
      );
    } else if (req.user.role === "donor") {
      const foods = await Food.find({ donorId: req.user.id });
      const foodIds = foods.map((food) => food._id);
      requests = await Request.find({ foodId: { $in: foodIds } }).populate(
        "orphanageId",
        ["name", "address"]
      );
    } else if (req.user.role === "admin") {
      requests = await Request.find().populate(["foodId", "orphanageId"]);
    }
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/:id/feedback", auth, async (req, res) => {
  if (req.user.role !== "orphanage") {
    return res.status(401).json({ msg: "Not authorized" });
  }

  const { feedback, rating } = req.body;

  try {
    const request = await Request.findById(req.params.id);
    if (!request || request.orphanageId.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Request not found" });
    }

    request.feedback = feedback;
    request.rating = rating;
    request.status = "completed";
    await request.save();

    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
