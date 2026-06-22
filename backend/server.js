require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const initSocket = require("./socket");

const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/", (req, res) => res.send("Realtime Chat API is running"));

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// 404 + error handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*" },
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
