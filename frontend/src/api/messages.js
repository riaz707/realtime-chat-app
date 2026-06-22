import api from "./axios";

export const getMessages = (conversationId, page = 1, limit = 30) =>
  api
    .get(`/messages/${conversationId}`, { params: { page, limit } })
    .then((r) => r.data);

// REST fallback for sending — the app normally sends via the socket,
// but this is handy if the socket happens to be disconnected.
export const sendMessageRest = (conversationId, text) =>
  api.post("/messages", { conversationId, text }).then((r) => r.data);
