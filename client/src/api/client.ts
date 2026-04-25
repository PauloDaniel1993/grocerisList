import type { User } from "../types/user";

const jsonHeaders = { "Content-Type": "application/json" } as const;

export type ApiErrorBody = { error: string };

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { error: "Invalid response" };
  }
}

export async function getSessionUser(): Promise<User | null> {
  const res = await fetch("/api/users/me", { credentials: "include" });
  if (res.status === 401) {
    return null;
  }
  const body = (await readBody(res)) as { user?: User; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.user) throw new Error("Invalid response");
  return body.user;
}

export async function getMe(): Promise<User> {
  const u = await getSessionUser();
  if (!u) {
    throw new Error("Not signed in");
  }
  return u;
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });
  const body = (await readBody(res)) as { user?: User; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Invalid email or password");
  }
  if (!body.user) throw new Error("Invalid response");
  return { user: body.user };
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await readBody(res)) as { error?: string };
    throw new Error(body?.error ?? "Sign out failed");
  }
}

export async function patchMe(name: string): Promise<User> {
  const res = await fetch("/api/users/me", {
    method: "PATCH",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ name }),
  });
  const body = (await readBody(res)) as { user?: User; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Update failed");
  }
  if (!body.user) throw new Error("Invalid response");
  return body.user;
}

export async function listAdminUsers(): Promise<User[]> {
  const res = await fetch("/api/admin/users", { credentials: "include" });
  const body = (await readBody(res)) as { users?: User[]; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.users) throw new Error("Invalid response");
  return body.users;
}

export async function getAdminUser(userId: string): Promise<User> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    credentials: "include",
  });
  const body = (await readBody(res)) as { user?: User; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.user) throw new Error("Invalid response");
  return body.user;
}

export async function patchAdminUser(
  userId: string,
  data: { name?: string; role?: "user" | "admin" }
): Promise<User> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  const body = (await readBody(res)) as { user?: User; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Update failed");
  }
  if (!body.user) throw new Error("Invalid response");
  return body.user;
}
