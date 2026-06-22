# TalkSpace — Frontend

A React (Vite) frontend for the `chat-backend` MERN real-time chat API —
1-to-1 and group messaging, online presence, typing indicators, and read
receipts, all wired to the backend's REST API and Socket.io layer.

## Stack

React 19 + Vite · React Router · Tailwind CSS · socket.io-client · axios · lucide-react

## Setup

```bash
npm install
cp .env.example .env   # point this at your running chat-backend
npm run dev
```

`.env` needs:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Make sure `chat-backend` is running first (`npm run dev` inside that folder,
with MongoDB up and `.env` configured there too).

## One backend addition you'll need

The original `chat-backend` has no endpoint to list other users, which the
"new chat" / "new group" pickers need. A small addition was made:

```
GET /api/auth/users?search=   (protected)
```

Returns everyone except the logged-in user (optionally filtered by name/email).
It's already included in `controllers/authController.js` and
`routes/authRoutes.js` in this delivery — if you're applying it to a copy of
the backend you already deployed elsewhere, just add the `listUsers` handler
and route shown there.

## What's implemented

- **Auth** — register / login / persisted session (JWT in localStorage), auto-redirect on expired token
- **Conversations** — sidebar with search, live-updating previews and ordering
- **Direct & group chat** — start a 1-to-1 chat or create a group from the user picker
- **Real-time messaging** — sent over the socket (`message:send` → `message:new`), with REST used only for loading history
- **Typing indicators**, **online presence**, **read receipts** (single vs. double check)
- **Responsive layout** — mobile shows either the conversation list or the open chat, like a typical chat app

## Project structure

```
src/
├── api/            REST calls (axios)
├── context/        AuthContext, SocketContext
├── components/     Sidebar, ChatWindow, MessageBubble, modals, etc.
├── pages/          Login, Register, ChatPage
└── utils/format.js Name/date/avatar helpers
```

## Build

```bash
npm run build   # outputs to dist/
```
