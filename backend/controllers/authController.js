const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.isOnline = true;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// @route  GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @route  GET /api/auth/users
// Lists everyone except the logged-in user, for starting new chats.
// (Added for the frontend's "new chat" / "new group" pickers — the
// original backend had no endpoint to discover other users.)
const listUsers = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const filter = {
      _id: { $ne: req.user._id },
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const users = await User.find(filter).select(
      "name email avatar isOnline lastSeen"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch users", error: err.message });
  }
};

module.exports = { register, login, getMe, listUsers };
