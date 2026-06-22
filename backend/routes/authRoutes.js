const express = require("express");
const { register, login, getMe, listUsers } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/users", protect, listUsers);

module.exports = router;
