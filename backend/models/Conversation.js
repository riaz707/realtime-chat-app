const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },

    // Group-only fields
    groupName: { type: String, trim: true },
    groupAvatar: { type: String, default: "" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],

    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

// Speeds up "find existing 1-to-1 conversation between two users" lookups
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
