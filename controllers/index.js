const Wallet = require("../models/walletModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//controllers hold the logic for handling requests and responses

//handle user registration
const handleUserRegistration = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Create wallet for the user
    const wallet = new Wallet({
      user: newUser._id,
      balance: 100,
    });
    await wallet.save();

    res.status(201).json({
      message: "User created successfully",
      newuser: { userName, email },
      wallet: { walletID: wallet._id, balance: wallet.balance },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//handle user login
const hanldeLogin = async (req, res) => {
  const { email, password } = req.body;

  //check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  //check if password is correct

  const isMatch = await bcrypt.compare(password, user?.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  //fetch user wallet
  const wallet = await Wallet.findOne({ user: user._id });

  //generate token
  const accessToken = jwt.sign({ id: user?._id }, process.env.ACCESS_TOKEN, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ id: user?._id }, process.env.REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  res.status(200).json({
    message: "Login successful",
    accessToken,
    refreshToken,
    user: {
      userName: user.userName,
      email: user.email,
    },
    wallet: {
      walletID: wallet._id,
      balance: wallet.balance,
    },
  });
};

//// Get all users with their wallets
const handleAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("wallet", "balance");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Transfer money between wallets
const transferMoney = async (req, res) => {
  const { senderWalletId, receiverWalletId, amount } = req.body;
  // Add this at the start of your try block
  console.log({ senderWalletId, receiverWalletId, amount });

  if (!senderWalletId || !receiverWalletId || !amount) {
    return res.status(400).json({
      error: "senderWalletId, receiverWalletId and amount are required",
    });
  }

  if (amount <= 0) {
    return res
      .status(400)
      .json({ error: "Transfer amount must be greater than zero" });
  }

  try {
    // Find sender and receiver wallets
    const senderWallet = await Wallet.findById(senderWalletId);
    const receiverWallet = await Wallet.findById(receiverWalletId);

    if (!senderWallet) {
      return res.status(404).json({ error: "Sender wallet not found" });
    }

    if (!receiverWallet) {
      return res.status(404).json({ error: "Receiver wallet not found" });
    }

    // Check if sender has sufficient balance
    if (senderWallet.balance < amount) {
      return res
        .status(400)
        .json({ error: "Insufficient balance in sender wallet" });
    }

    // Perform transfer
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    // Save updated wallets
    await senderWallet.save();
    await receiverWallet.save();

    // Log the transaction
    const transaction = new Transaction({
      senderWallet: senderWalletId,
      receiverWallet: receiverWalletId,
      amount,
      status: "completed",
    });
    await transaction.save();

    return res.status(200).json({
      message: "Transfer successful",
      senderWallet,
      receiverWallet,
      transaction,
    });
  } catch (error) {
    console.error("Error during transfer:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get wallet balance by wallet ID
const getWalletBalance = async (req, res) => {
  const { walletId } = req.params;

  if (!walletId) {
    return res.status(400).json({ error: "walletId parameter is required" });
  }

  try {
    const wallet = await Wallet.findById(walletId);

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res
      .status(200)
      .json({ walletId: wallet._id, balance: wallet.balance });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  handleUserRegistration,
  hanldeLogin,
  handleAllUsers,
  transferMoney,
  getWalletBalance,
  getTransactions
};
