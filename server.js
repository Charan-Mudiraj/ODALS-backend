const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user");
const dotenv = require("dotenv");
const { connect } = require("mongoose");
const app = express();
dotenv.config();
const PORT = process.env.PORT;
const DB_URL = process.env.MONGODB_URL;

app.use(express.json());
app.use(cors());
app.use("/user", userRoutes);
app.get("/", (req, res) => {
  res.send("This is Backend");
});
app.listen(PORT, () => {
  console.log("listening on PORT: " + PORT);
});

if (DB_URL) {
  connect(process.env.MONGODB_URL);
} else {
  console.log("DB URL is Invalid");
}
