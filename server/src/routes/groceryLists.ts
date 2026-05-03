import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import type { BoughtItem, BoughtList, GroceryItem, GroceryList } from "@prisma/client";

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
  price: number | null;
  createdAt: string;
} {
  return {
    id: item.id,
    listId: item.listId,
    name: item.name,
    category: item.category,
    bought: item.bought,
    price: item.price,
    createdAt: item.createdAt.toISOString(),
  };
}

function toPublicBoughtItem(
  item: BoughtItem
): {
  id: string;
  boughtListId: string;
  name: string;
  category: string;
  price: number | null;
  createdAt: string;
} {
  return {
    id: item.id,
    boughtListId: item.boughtListId,
    name: item.name,
    category: item.category,
    price: item.price,
    createdAt: item.createdAt.toISOString(),
  };
}

function toPublicBoughtList(
  list: BoughtList & { items?: BoughtItem[] }
): {
  id: string;
  name: string;
  location: string | null;
  groceryListId: string;
  createdAt: string;
  items?: ReturnType<typeof toPublicBoughtItem>[];
} {
  return {
    id: list.id,
    name: list.name,
    location: list.location,
    groceryListId: list.groceryListId,
    createdAt: list.createdAt.toISOString(),
    ...(list.items ? { items: list.items.map(toPublicBoughtItem) } : {}),
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
  if (name.length > 100) {
    res.status(400).json({ error: "Name is too long" });
    return;
  }
  if (!/^[A-Za-z0-9]+$/.test(name)) {
    res.status(400).json({ error: "Name can only contain letters and numbers" });
    return;
  }
  if (!isGroceryCategory(categoryRaw)) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }
  let price: number | null = null;
  if (body.price !== undefined) {
    if (typeof body.price !== "number" || !Number.isFinite(body.price)) {
      res.status(400).json({ error: "Invalid price" });
      return;
    }
    if (body.price < 0) {
      res.status(400).json({ error: "Price must be positive" });
      return;
    }
    if (body.price > 10_000_000) {
      res.status(400).json({ error: "Price is too high" });
      return;
    }
    const rounded = Math.round(body.price * 100) / 100;
    price = rounded;
  }
  const item = await prisma.groceryItem.create({
    data: {
      name,
      category: categoryRaw,
      price,
      listId,
    },
  });
  res.status(201).json({ item: toPublicItem(item) });
});

groceryListsRouter.post("/:listId/end-grocery", async (req, res) => {
  const userId = req.session.userId as string;
  const { listId } = req.params;
  const list = await prisma.groceryList.findFirst({
    where: { id: listId, userId },
  });
  if (!list) {
    res.status(404).json({ error: "List not found" });
    return;
  }
  const boughtItems = await prisma.groceryItem.findMany({
    where: { listId, bought: true },
    orderBy: { createdAt: "asc" },
  });
  if (boughtItems.length === 0) {
    res.status(400).json({ error: "Cannot end grocery without bought items" });
    return;
  }
  const body = parseJsonRecord(req.body);
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  if (location.length > 200) {
    res.status(400).json({ error: "Location is too long" });
    return;
  }

  const boughtList = await prisma.$transaction(async (tx) => {
    const created = await tx.boughtList.create({
      data: {
        name: `${list.name} - ${new Date().toISOString().slice(0, 10)}`,
        location: location || null,
        groceryListId: list.id,
        userId,
        items: {
          create: boughtItems.map((item) => ({
            name: item.name,
            category: item.category,
          })),
        },
      },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });
    await tx.groceryItem.deleteMany({
      where: { id: { in: boughtItems.map((item) => item.id) }, listId },
    });
    return created;
  });

  res.status(201).json({ boughtList: toPublicBoughtList(boughtList) });
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
      if (trimmed.length > 100) {
        res.status(400).json({ error: "Name is too long" });
        return;
      }
      if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
        res.status(400).json({ error: "Name can only contain letters and numbers" });
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
