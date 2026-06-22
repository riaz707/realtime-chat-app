# Riaz Chat — Real-Time Messaging App

A full-stack 1-to-1 and group messaging app built with the MERN stack —
React (Vite) on the frontend, Node.js/Express + MongoDB + Socket.io on the
backend. Built as a portfolio project demonstrating REST API design, JWT
authentication, and real-time communication.

**Live demo:** _add your deployed URL here_
**Author:** Riaz Islam — [github.com/riaz707](https://github.com/riaz707) · [linkedin.com/in/riaz-islam12](https://linkedin.com/in/riaz-islam12)

## Features

- Register / login with JWT-based authentication
- 1-to-1 private chats and group chats (with admin-managed membership)
- Real-time message delivery via Socket.io, with full history persisted in MongoDB
- Online/offline presence indicators
- Typing indicators
- Read receipts (single vs. double check)
- Responsive UI (mobile + desktop)

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite, React Router, Tailwind CSS, socket.io-client, axios |
| Backend  | Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, bcrypt |

## Project structure

```
TalkSpace-app/
├── chat-backend/     Express API + Socket.io server
└── chat-frontend/    React (Vite) client
```

Each folder has its own `README.md` with more detail.

## Running locally

You need both servers running at the same time, plus a MongoDB instance
(local or [Atlas](https://www.mongodb.com/atlas)).

### 1. Backend

```bash
cd chat-backend
npm install
cp .env.example .env   # set MONGO_URI, JWT_SECRET, CLIENT_URL
npm run dev            # http://localhost:5000
```

### 2. Frontend

```bash
cd chat-frontend
npm install
cp .env.example .env   # set VITE_API_URL, VITE_SOCKET_URL
npm run dev            # http://localhost:5173
```

Open two browser tabs, register two different accounts, and start chatting —
messages, typing indicators, and presence update in real time.

## REST API summary

| Method | Endpoint                              | Description                  |
|--------|----------------------------------------|-------------------------------|
| POST   | `/api/auth/register`                  | Create account                |
| POST   | `/api/auth/login`                     | Login, returns JWT            |
| GET    | `/api/auth/me`                        | Current logged-in user        |
| GET    | `/api/auth/users`                     | List other users (for starting chats) |
| GET    | `/api/conversations`                  | List my conversations         |
| POST   | `/api/conversations/private`          | Get/create a 1-to-1 chat      |
| POST   | `/api/conversations/group`            | Create a group chat           |
| PUT    | `/api/conversations/group/:id/add`    | Add a group member (admin)    |
| PUT    | `/api/conversations/group/:id/remove` | Remove a group member (admin) |
| GET    | `/api/messages/:conversationId`       | Paginated message history     |
| POST   | `/api/messages`                       | Send message (REST fallback)  |

Full Socket.io event reference is in `chat-backend/README.md`.

## Deployment

- **Frontend** → Vercel (a `vercel.json` is included for SPA routing). Set
  `VITE_API_URL` and `VITE_SOCKET_URL` to your deployed backend URL.
- **Backend** → Render (or any Node host). Set `MONGO_URI`, `JWT_SECRET`,
  and `CLIENT_URL` (your deployed frontend URL, for CORS).

## License

MIT — free to use for learning or as a portfolio reference.
