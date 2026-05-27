export type ApiUser = {
  id: string;
  email?: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
};

export type ApiPostListItem = {
  id: string;
  user: { id: string; username: string; name: string; avatarUrl?: string };
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  createdAt: string;
};

export type ApiPostDetail = {
  id: string;
  user: { id: string; username: string; name: string; avatarUrl?: string };
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  likesCount: number;
  savesCount: number;
  createdAt: string;
  comments: { id: string; userId: string; text: string; createdAt: string }[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("pb_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) window.localStorage.removeItem("pb_token");
  else window.localStorage.setItem("pb_token", token);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  health: () => apiFetch<{ ok: boolean }>("/health"),

  register: (body: { email: string; username: string; name: string; password: string }) =>
    apiFetch<{ token: string; user: ApiUser }>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }),

  login: (body: { emailOrUsername: string; password: string }) =>
    apiFetch<{ token: string; user: ApiUser }>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }),

  me: () => apiFetch<{ user: ApiUser }>("/api/users/me"),

  updateMe: (body: { name?: string; bio?: string; avatarUrl?: string }) =>
    apiFetch<{ user: ApiUser }>("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }),

  getUser: (username: string) => apiFetch<{ user: ApiUser }>(`/api/users/${encodeURIComponent(username)}`),

  listFeed: (params: { page: number; limit?: number; q?: string; tag?: string }) => {
    const sp = new URLSearchParams();
    sp.set("page", String(params.page));
    sp.set("limit", String(params.limit ?? 20));
    if (params.q) sp.set("q", params.q);
    if (params.tag) sp.set("tag", params.tag);
    return apiFetch<{ items: ApiPostListItem[]; hasMore: boolean }>(`/api/posts?${sp.toString()}`);
  },

  getPost: (id: string) => apiFetch<{ post: ApiPostDetail }>(`/api/posts/${encodeURIComponent(id)}`),

  toggleLike: (id: string) => apiFetch<{ likesCount: number; liked: boolean }>(`/api/posts/${encodeURIComponent(id)}/like`, { method: "POST" }),

  toggleSave: (id: string) => apiFetch<{ savesCount: number; saved: boolean }>(`/api/posts/${encodeURIComponent(id)}/save`, { method: "POST" }),

  addComment: (id: string, text: string) =>
    apiFetch<{ commentsCount: number }>(`/api/posts/${encodeURIComponent(id)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    }),

  createPost: async (data: { title: string; description?: string; tags?: string; file: File }) => {
    const token = getToken();
    if (!token) throw new Error("UNAUTHORIZED");

    const fd = new FormData();
    fd.set("title", data.title);
    if (data.description) fd.set("description", data.description);
    if (data.tags) fd.set("tags", data.tags);
    fd.set("image", data.file);

    const res = await fetch(`${API_BASE}/api/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });

    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as { id: string };
  }
};

