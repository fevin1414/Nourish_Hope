const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/food", require("./routes/food"));
app.use("/api/request", require("./routes/request"));
app.use("/api/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
