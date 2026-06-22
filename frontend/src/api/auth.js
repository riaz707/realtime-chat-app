import api from "./axios";

export const registerUser = (payload) =>
  api.post("/auth/register", payload).then((r) => r.data);

export const loginUser = (payload) =>
  api.post("/auth/login", payload).then((r) => r.data);

export const getMe = () => api.get("/auth/me").then((r) => r.data);

// search is optional — leave empty to list everyone but yourself
export const listUsers = (search = "") =>
  api.get("/auth/users", { params: { search } }).then((r) => r.data);
