const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export const api = {
  me: () => request("/api/auth/me"),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  loginUrl: `${API_BASE}/api/auth/github`,

  getEntries: (module) => request(`/api/entries${module ? `?module=${module}` : ""}`),
  createEntry: (data) => request("/api/entries", { method: "POST", body: JSON.stringify(data) }),
  updateEntry: (id, data) => request(`/api/entries/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteEntry: (id) => request(`/api/entries/${id}`, { method: "DELETE" }),

  getMessages: () => request("/api/ai/messages"),
  sendMessage: (message) => request("/api/ai/chat", { method: "POST", body: JSON.stringify({ message }) }),
};
