const Conversation = require("../models/Conversation");
const User = require("../models/User");

// @route  POST /api/conversations/private
// body: { userId } -> the other participant
const accessPrivateChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, userId], $size: 2 },
    })
      .populate("participants", "-password")
      .populate("lastMessage");

    if (conversation) {
      return res.json(conversation);
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) return res.status(404).json({ message: "User not found" });

    conversation = await Conversation.create({
      isGroup: false,
      participants: [req.user._id, userId],
    });

    conversation = await conversation.populate("participants", "-password");

    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Could not access chat", error: err.message });
  }
};

// @route  POST /api/conversations/group
// body: { groupName, participantIds: [] }
const createGroupChat = async (req, res) => {
  try {
    const { groupName, participantIds } = req.body;

    if (!groupName || !participantIds || participantIds.length < 2) {
      return res
        .status(400)
        .json({ message: "groupName and at least 2 other participantIds are required" });
    }

    const allParticipants = [...new Set([...participantIds, String(req.user._id)])];

    const group = await Conversation.create({
      isGroup: true,
      groupName,
      groupAdmin: req.user._id,
      participants: allParticipants,
    });

    const fullGroup = await Conversation.findById(group._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(fullGroup);
  } catch (err) {
    res.status(500).json({ message: "Could not create group", error: err.message });
  }
};

// @route  GET /api/conversations
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "-password")
      .populate("groupAdmin", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch conversations", error: err.message });
  }
};

// @route  PUT /api/conversations/group/:id/add
// body: { userId }
const addToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (String(conversation.groupAdmin) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    conversation.participants.addToSet(userId);
    await conversation.save();

    const updated = await Conversation.findById(conversation._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Could not add member", error: err.message });
  }
};

// @route  PUT /api/conversations/group/:id/remove
// body: { userId }
const removeFromGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (String(conversation.groupAdmin) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    conversation.participants = conversation.participants.filter(
      (p) => String(p) !== String(userId)
    );
    await conversation.save();

    const updated = await Conversation.findById(conversation._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Could not remove member", error: err.message });
  }
};

module.exports = {
  accessPrivateChat,
  createGroupChat,
  getMyConversations,
  addToGroup,
  removeFromGroup,
};
