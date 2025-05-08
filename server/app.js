const express = require("express");
const path = require("path");
const myDonations = require("./routes/myDonations");
const connectDB = require("./config/db");
require("dotenv").config();

connectDB();

const app = express();

app.use(express.json());
app.use(require("cors")());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/food", require("./routes/food"));
app.use("/api/request", require("./routes/request"));
app.use("/api/orphanages", require("./routes/orphanages"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/my-donations", myDonations);

app.use(express.static(path.join(__dirname, "../client")));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
