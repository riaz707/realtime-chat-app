const express = require("express");
const {
  accessPrivateChat,
  createGroupChat,
  getMyConversations,
  addToGroup,
  removeFromGroup,
} = require("../controllers/conversationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getMyConversations);
router.post("/private", accessPrivateChat);
router.post("/group", createGroupChat);
router.put("/group/:id/add", addToGroup);
router.put("/group/:id/remove", removeFromGroup);

module.exports = router;
