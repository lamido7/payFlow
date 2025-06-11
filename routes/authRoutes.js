const express = require("express");

// Importing the necessary controllers and middleware
const {
  handleUserRegistration,
  hanldeLogin,
  handleAllUsers,
  transferMoney,
  getWalletBalance,
  getTransactions,
} = require("../controllers");
const { authenticate } = require("../middlewares");

const router = express.Router();

// User registration endpoint
router.post("/sign-up", handleUserRegistration);

router.post("/login", hanldeLogin);

// Endpoint to get all users
router.get("/users", handleAllUsers);

//end point to transfer money between wallets
router.post("/transfer", authenticate, transferMoney);

//end point for getting wallet balance
router.get("/wallet/:walletId", authenticate, getWalletBalance);

//end point to get transactions log
router.get("/transaction", authenticate, getTransactions);

module.exports = router;
