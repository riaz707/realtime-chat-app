const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// @route  GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a participant of this conversation" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name avatar email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: "Could not fetch messages", error: err.message });
  }
};

// @route  POST /api/messages
// body: { conversationId, text }
// Also used internally by the socket layer
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    if (!conversationId || !text) {
      return res.status(400).json({ message: "conversationId and text are required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a participant of this conversation" });
    }

    let message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
      readBy: [req.user._id],
    });

    message = await message.populate("sender", "name avatar email");

    conversation.lastMessage = message._id;
    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Could not send message", error: err.message });
  }
};

module.exports = { getMessages, sendMessage };
