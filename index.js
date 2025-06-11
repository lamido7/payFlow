const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");
const Wallet = require("./models/walletModel"); // Ensure Wallet model is imported
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Uncommented for token generation
const cors = require("cors");

const routes = require("./routes");

dotenv.config();

const app = express();

// Middleware for parsing JSON
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 6000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });

// base route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Payflow backend" });
});

app.use("/api", routes);

// // Add route for crediting a wallet
// app.post("/wallet/credit", walletController.creditWallet);
