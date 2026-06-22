const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Tracks userId -> Set of socket ids (a user can have multiple open tabs/devices)
const onlineUsers = new Map();

const addOnlineSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

const removeOnlineSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) return;
  onlineUsers.get(userId).delete(socketId);
  if (onlineUsers.get(userId).size === 0) onlineUsers.delete(userId);
};

const initSocket = (io) => {
  // Authenticate every socket connection using the JWT issued at login
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication error: token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("Authentication error: user not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = String(socket.user._id);
    addOnlineSocket(userId, socket.id);

    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit("user:online", { userId });

    // Client joins a room per conversation it belongs to
    socket.on("conversation:join", async (conversationId) => {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.some((p) => String(p) === userId)) {
        return socket.emit("error", { message: "Not authorized to join this conversation" });
      }
      socket.join(conversationId);
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(conversationId);
    });

    // Send a message: persist to MongoDB, then broadcast to everyone in the room
    socket.on("message:send", async ({ conversationId, text }, callback) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some((p) => String(p) === userId)) {
          return callback?.({ ok: false, error: "Not authorized for this conversation" });
        }

        let message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text,
          readBy: [userId],
        });
        message = await message.populate("sender", "name avatar email");

        conversation.lastMessage = message._id;
        await conversation.save();

        io.to(conversationId).emit("message:new", message);
        callback?.({ ok: true, message });
      } catch (err) {
        callback?.({ ok: false, error: err.message });
      }
    });

    // Typing indicator
    socket.on("typing:start", (conversationId) => {
      socket.to(conversationId).emit("typing:start", { conversationId, userId });
    });

    socket.on("typing:stop", (conversationId) => {
      socket.to(conversationId).emit("typing:stop", { conversationId, userId });
    });

    // Mark messages as read
    socket.on("message:read", async ({ conversationId, messageId }) => {
      await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } });
      socket.to(conversationId).emit("message:read", { messageId, userId });
    });

    socket.on("disconnect", async () => {
      removeOnlineSocket(userId, socket.id);

      // Only mark fully offline once the user has no other open sockets
      if (!onlineUsers.has(userId)) {
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
        io.emit("user:offline", { userId });
      }
    });
  });
};

module.exports = initSocket;
