const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "donor", "orphanage"], required: true },
  phone: String,
  address: String,
  verificationStatus: { type: Boolean, default: false },
  registrationDate: { type: Date, default: Date.now },
});
UserSchema.methods.comparePassword = function (p) {
  return p === this.password;
};
module.exports = mongoose.model("User", UserSchema);
