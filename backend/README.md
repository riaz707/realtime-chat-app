# Realtime Chat Backend (MERN stack)

Node.js + Express + MongoDB (Mongoose) + Socket.io + JWT auth.
Supports **1-to-1 private chat** and **group chat**, with full message history saved in MongoDB.

## Setup

```bash
npm install
cp .env.example .env   # then edit .env with your real Mongo URI + JWT secret
npm run dev             # nodemon, for development
npm start                # plain node, for production
```

Requires a running MongoDB instance (local or Atlas) — set `MONGO_URI` in `.env`.

## Folder Structure

```
chat-backend/
├── server.js              # entrypoint: Express + Socket.io wiring
├── config/db.js           # MongoDB connection
├── models/                # User, Conversation, Message (Mongoose schemas)
├── controllers/           # route handlers
├── routes/                # REST endpoints
├── middleware/auth.js     # JWT route protection
├── socket/index.js        # Socket.io real-time logic
└── utils/generateToken.js
```

## REST API

All protected routes need header: `Authorization: Bearer <token>`

| Method | Endpoint                          | Body                                   | Description                  |
|--------|------------------------------------|------------------------------------------|-------------------------------|
| POST   | `/api/auth/register`              | `{ name, email, password }`              | Create account                |
| POST   | `/api/auth/login`                 | `{ email, password }`                    | Login, returns JWT            |
| GET    | `/api/auth/me`                    | -                                         | Current logged-in user        |
| GET    | `/api/auth/users`                 | `?search=`                                | List other users (for starting chats) |
| GET    | `/api/conversations`              | -                                         | List my conversations         |
| POST   | `/api/conversations/private`      | `{ userId }`                             | Get/create 1-to-1 chat        |
| POST   | `/api/conversations/group`        | `{ groupName, participantIds: [] }`      | Create group chat             |
| PUT    | `/api/conversations/group/:id/add`| `{ userId }`                             | Add member (admin only)       |
| PUT    | `/api/conversations/group/:id/remove`| `{ userId }`                          | Remove member (admin only)    |
| GET    | `/api/messages/:conversationId`   | `?page=1&limit=30`                       | Paginated message history     |
| POST   | `/api/messages`                   | `{ conversationId, text }`               | Send message (REST fallback)  |

## Socket.io (real-time layer)

Connect with the JWT from login:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: jwtTokenFromLogin },
});
```

| Event (client → server) | Payload                              | Notes                              |
|--------------------------|----------------------------------------|--------------------------------------|
| `conversation:join`     | `conversationId`                      | Join a conversation's room          |
| `conversation:leave`    | `conversationId`                      | Leave a room                        |
| `message:send`          | `{ conversationId, text }`            | Saves to DB + broadcasts            |
| `typing:start`          | `conversationId`                      | Notify others you're typing         |
| `typing:stop`           | `conversationId`                      | Stop typing                         |
| `message:read`          | `{ conversationId, messageId }`       | Mark a message as read              |

| Event (server → client) | Payload                              | Notes                              |
|--------------------------|----------------------------------------|--------------------------------------|
| `message:new`            | message object                        | New message in a joined room        |
| `typing:start` / `stop`  | `{ conversationId, userId }`          | Someone is/isn't typing             |
| `user:online`/`offline`  | `{ userId }`                          | Presence updates                    |
| `message:read`           | `{ messageId, userId }`               | Read receipt                        |
| `error`                  | `{ message }`                         | Auth/permission errors              |

## Quick flow

1. Register/login → get JWT.
2. REST: create/find a conversation (`/api/conversations/private` or `/group`).
3. Socket: `conversation:join` with that conversation's `_id`.
4. Socket: `message:send` to chat in real time — every participant who joined the room gets `message:new`.
5. REST: `GET /api/messages/:conversationId` to load chat history on app open.
