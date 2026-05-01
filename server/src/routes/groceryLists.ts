import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import type { GroceryItem, GroceryList } from "@prisma/client";

export const groceryListsRouter = Router();

const GROCERY_CATEGORIES = [
  "produce",
  "dairy",
  "bakery",
  "frozen",
  "household",
  "other",
] as const;

type GroceryCategory = (typeof GROCERY_CATEGORIES)[number];

function isGroceryCategory(s: string): s is GroceryCategory {
  return (GROCERY_CATEGORIES as readonly string[]).includes(s);
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function toPublicList(list: GroceryList) {
  return {
    id: list.id,
    name: list.name,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
  };
}

function toPublicItem(
  item: GroceryItem
): {
  id: string;
  listId: string;
  name: string;
  category: string;
  bought: boolean;
  createdAt: string;
} {
  return {
    id: item.id,
    listId: item.listId,
    name: item.name,
    category: item.category,
    bought: item.bought,
    createdAt: item.createdAt.toISOString(),
  };
}

groceryListsRouter.use(requireAuth);

groceryListsRouter.get("/", async (req, res) => {
  const userId = req.session.userId as string;
  const lists = await prisma.groceryList.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ lists: lists.map(toPublicList) });
});

groceryListsRouter.post("/", async (req, res) => {
  const userId = req.session.userId as string;
  const body = parseJsonRecord(req.body);
  const name =
    typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (name.length > 200) {
    res.status(400).json({ error: "Name is too long" });
    return;
  }
  const list = await prisma.groceryList.create({
    data: { name, userId },
  });
  res.status(201).json({ list: toPublicList(list) });
});

groceryListsRouter.get("/:listId/items", async (req, res) => {
  const userId = req.session.userId as string;
  const { listId } = req.params;
  const list = await prisma.groceryList.findFirst({
    where: { id: listId, userId },
  });
  if (!list) {
    res.status(404).json({ error: "List not found" });
    return;
  }
  const items = await prisma.groceryItem.findMany({
    where: { listId },
    orderBy: { createdAt: "asc" },
  });
  res.json({ items: items.map(toPublicItem) });
});

groceryListsRouter.post("/:listId/items", async (req, res) => {
  const userId = req.session.userId as string;
  const { listId } = req.params;
  const list = await prisma.groceryList.findFirst({
    where: { id: listId, userId },
  });
  if (!list) {
    res.status(404).json({ error: "List not found" });
    return;
  }
  const body = parseJsonRecord(req.body);
  const name =
    typeof body.name === "string" ? body.name.trim() : "";
  const categoryRaw = typeof body.category === "string" ? body.category : "";
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (name.length > 200) {
    res.status(400).json({ error: "Name is too long" });
    return;
  }
  if (!isGroceryCategory(categoryRaw)) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }
  const item = await prisma.groceryItem.create({
    data: {
      name,
      category: categoryRaw,
      listId,
    },
  });
  res.status(201).json({ item: toPublicItem(item) });
});

groceryListsRouter.patch(
  "/:listId/items/:itemId",
  async (req, res) => {
    const userId = req.session.userId as string;
    const { listId, itemId } = req.params;
    const list = await prisma.groceryList.findFirst({
      where: { id: listId, userId },
    });
    if (!list) {
      res.status(404).json({ error: "List not found" });
      return;
    }
    const existing = await prisma.groceryItem.findFirst({
      where: { id: itemId, listId },
    });
    if (!existing) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    const body = parseJsonRecord(req.body);
    const data: { bought?: boolean; name?: string; category?: string } = {};
    if (body.bought !== undefined) {
      if (typeof body.bought !== "boolean") {
        res.status(400).json({ error: "Invalid bought" });
        return;
      }
      data.bought = body.bought;
    }
    if (body.name !== undefined) {
      if (typeof body.name !== "string") {
        res.status(400).json({ error: "Invalid name" });
        return;
      }
      const trimmed = body.name.trim();
      if (!trimmed) {
        res.status(400).json({ error: "Name cannot be empty" });
        return;
      }
      if (trimmed.length > 200) {
        res.status(400).json({ error: "Name is too long" });
        return;
      }
      data.name = trimmed;
    }
    if (body.category !== undefined) {
      if (typeof body.category !== "string" || !isGroceryCategory(body.category)) {
        res.status(400).json({ error: "Invalid category" });
        return;
      }
      data.category = body.category;
    }
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No changes provided" });
      return;
    }
    const item = await prisma.groceryItem.update({
      where: { id: itemId },
      data,
    });
    res.json({ item: toPublicItem(item) });
  }
);

groceryListsRouter.delete(
  "/:listId/items/:itemId",
  async (req, res) => {
    const userId = req.session.userId as string;
    const { listId, itemId } = req.params;
    const list = await prisma.groceryList.findFirst({
      where: { id: listId, userId },
    });
    if (!list) {
      res.status(404).json({ error: "List not found" });
      return;
    }
    const existing = await prisma.groceryItem.findFirst({
      where: { id: itemId, listId },
    });
    if (!existing) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    await prisma.groceryItem.delete({ where: { id: itemId } });
    res.status(204).end();
  }
);

groceryListsRouter.get("/:listId", async (req, res) => {
  const userId = req.session.userId as string;
  const { listId } = req.params;
  const list = await prisma.groceryList.findFirst({
    where: { id: listId, userId },
  });
  if (!list) {
    res.status(404).json({ error: "List not found" });
    return;
  }
  res.json({ list: toPublicList(list) });
});

groceryListsRouter.delete("/:listId", async (req, res) => {
  const userId = req.session.userId as string;
  const { listId } = req.params;
  const list = await prisma.groceryList.findFirst({
    where: { id: listId, userId },
  });
  if (!list) {
    res.status(404).json({ error: "List not found" });
    return;
  }
  await prisma.groceryList.delete({ where: { id: listId } });
  res.status(204).end();
});
