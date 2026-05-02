import type { GroceryList } from "../types/groceryList";
import type { GroceryItem, GroceryCategory } from "../types/grocery";
import type { BoughtItem, BoughtList } from "../types/boughtList";
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

export async function getGroceryLists(): Promise<GroceryList[]> {
  const res = await fetch("/api/grocery-lists", { credentials: "include" });
  const body = (await readBody(res)) as { lists?: GroceryList[]; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.lists) throw new Error("Invalid response");
  return body.lists;
}

export async function createGroceryList(name: string): Promise<GroceryList> {
  const res = await fetch("/api/grocery-lists", {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ name }),
  });
  const body = (await readBody(res)) as { list?: GroceryList; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.list) throw new Error("Invalid response");
  return body.list;
}

export async function deleteGroceryList(listId: string): Promise<void> {
  const res = await fetch(`/api/grocery-lists/${listId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 204) return;
  const body = (await readBody(res)) as { error?: string };
  throw new Error(body?.error ?? "Request failed");
}

export async function getGroceryList(listId: string): Promise<GroceryList> {
  const res = await fetch(`/api/grocery-lists/${listId}`, {
    credentials: "include",
  });
  const body = (await readBody(res)) as { list?: GroceryList; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.list) throw new Error("Invalid response");
  return body.list;
}

export async function getGroceryItems(listId: string): Promise<GroceryItem[]> {
  const res = await fetch(`/api/grocery-lists/${listId}/items`, {
    credentials: "include",
  });
  const body = (await readBody(res)) as { items?: GroceryItem[]; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.items) throw new Error("Invalid response");
  return body.items;
}

export async function createGroceryItemForList(
  listId: string,
  input: { name: string; category: GroceryCategory }
): Promise<GroceryItem> {
  const res = await fetch(`/api/grocery-lists/${listId}/items`, {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
  const body = (await readBody(res)) as { item?: GroceryItem; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.item) throw new Error("Invalid response");
  return body.item;
}

export async function updateGroceryItemInList(
  listId: string,
  itemId: string,
  data: { bought?: boolean; name?: string; category?: GroceryCategory }
): Promise<GroceryItem> {
  const res = await fetch(`/api/grocery-lists/${listId}/items/${itemId}`, {
    method: "PATCH",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  const body = (await readBody(res)) as { item?: GroceryItem; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.item) throw new Error("Invalid response");
  return body.item;
}

export async function endGrocery(
  listId: string,
  input: { location?: string } = {}
): Promise<BoughtList> {
  const res = await fetch(`/api/grocery-lists/${listId}/end-grocery`, {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
  const body = (await readBody(res)) as {
    boughtList?: BoughtList;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.boughtList) throw new Error("Invalid response");
  return body.boughtList;
}

export async function updateBoughtListLocation(
  id: string,
  location: string | null
): Promise<BoughtList> {
  const res = await fetch(`/api/bought-lists/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ location }),
  });
  const body = (await readBody(res)) as {
    boughtList?: BoughtList;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.boughtList) throw new Error("Invalid response");
  return body.boughtList;
}

export async function getBoughtLists(): Promise<BoughtList[]> {
  const res = await fetch("/api/bought-lists", { credentials: "include" });
  const body = (await readBody(res)) as {
    boughtLists?: BoughtList[];
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.boughtLists) throw new Error("Invalid response");
  return body.boughtLists;
}

export async function getBoughtList(id: string): Promise<BoughtList> {
  const res = await fetch(`/api/bought-lists/${id}`, {
    credentials: "include",
  });
  const body = (await readBody(res)) as {
    boughtList?: BoughtList;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.boughtList) throw new Error("Invalid response");
  return body.boughtList;
}

export async function updateBoughtItem(
  boughtListId: string,
  itemId: string,
  data: { price?: number | null; category?: GroceryCategory }
): Promise<BoughtItem> {
  const res = await fetch(`/api/bought-lists/${boughtListId}/items/${itemId}`, {
    method: "PATCH",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  const body = (await readBody(res)) as { item?: BoughtItem; error?: string };
  if (!res.ok) {
    throw new Error(body?.error ?? "Request failed");
  }
  if (!body.item) throw new Error("Invalid response");
  return body.item;
}

export async function updateBoughtItemPrice(
  boughtListId: string,
  itemId: string,
  price: number | null
): Promise<BoughtItem> {
  return updateBoughtItem(boughtListId, itemId, { price });
}

export async function deleteBoughtList(id: string): Promise<void> {
  const res = await fetch(`/api/bought-lists/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 204) return;
  const body = (await readBody(res)) as { error?: string };
  throw new Error(body?.error ?? "Request failed");
}
