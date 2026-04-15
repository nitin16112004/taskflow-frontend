import { API_BASE_URL } from "../utils/constants";

const getSessionToken = () => sessionStorage.getItem("token") || "";

const withHeaders = (headers = {}) => {
  const token = getSessionToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: withHeaders(options.headers)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Request failed");
  return payload;
};

const api = {
  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  register: (body) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  getDashboard: () => request("/boards/dashboard/overview"),

  getBoards: () => request("/boards"),

  createBoard: (body) =>
    request("/boards", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  addBoardMember: (boardId, userId) =>
    request(`/boards/${boardId}/members/add`, {
      method: "PATCH",
      body: JSON.stringify({ userId })
    }),

  getLists: (boardId) => request(`/lists/board/${boardId}`),

  createList: (body) =>
    request("/lists", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  updateList: (id, body) =>
    request(`/lists/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),

  deleteList: (id) =>
    request(`/lists/${id}`, {
      method: "DELETE"
    }),

  getTasks: (query = "") => request(`/tasks${query ? `?${query}` : ""}`),

  createTask: (body) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  updateTask: (id, body) =>
    request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),

  moveTask: (taskId, newListId) =>
    request(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ list: newListId })
    }),

  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: "DELETE"
    }),

  getUsers: () => request("/users"),

  createUser: (body) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  updateUser: (id, body) =>
    request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),

  deleteUser: (id) =>
    request(`/users/${id}`, {
      method: "DELETE"
    })
};

export default api;