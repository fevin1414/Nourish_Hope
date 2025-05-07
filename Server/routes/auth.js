const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const sendErrorResponse = (res, status, message) =>
  res.status(status).json({ success: false, error: message });

router.post(
  "/register",
  [
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 6 }),
    check("role").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, email, password, role, phone, address } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return sendErrorResponse(res, 400, "User already exists");
      user = new User({ name, email, password, role, phone, address });
      await user.save();
      const payload = { user: { id: user.id, role: user.role } };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "5 days" },
        (err, token) => {
          if (err)
            return sendErrorResponse(res, 500, "Token generation failed");
          res.json({ success: true, token });
        }
      );
    } catch {
      sendErrorResponse(res, 500, "Server error");
    }
  }
);

router.post(
  "/login",
  [check("email").isEmail(), check("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !user.comparePassword(password))
        return sendErrorResponse(res, 400, "Invalid Credentials");
      const payload = { user: { id: user.id, role: user.role } };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "5 days" },
        (err, token) => {
          if (err)
            return sendErrorResponse(res, 500, "Token generation failed");
          res.json({ success: true, token, role: user.role });
        }
      );
    } catch {
      sendErrorResponse(res, 500, "Server error");
    }
  }
);

module.exports = router;
