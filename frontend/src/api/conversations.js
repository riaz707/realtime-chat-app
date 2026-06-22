import api from "./axios";

export const getMyConversations = () =>
  api.get("/conversations").then((r) => r.data);

export const accessPrivateChat = (userId) =>
  api.post("/conversations/private", { userId }).then((r) => r.data);

export const createGroupChat = (groupName, participantIds) =>
  api
    .post("/conversations/group", { groupName, participantIds })
    .then((r) => r.data);

export const addToGroup = (conversationId, userId) =>
  api
    .put(`/conversations/group/${conversationId}/add`, { userId })
    .then((r) => r.data);

export const removeFromGroup = (conversationId, userId) =>
  api
    .put(`/conversations/group/${conversationId}/remove`, { userId })
    .then((r) => r.data);
