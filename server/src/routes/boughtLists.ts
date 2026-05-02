import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import type { BoughtItem, BoughtList } from "@prisma/client";

export const boughtListsRouter = Router();

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

boughtListsRouter.use(requireAuth);

boughtListsRouter.get("/", async (req, res) => {
  const userId = req.session.userId as string;
  const lists = await prisma.boughtList.findMany({
    where: { userId },
    include: { items: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ boughtLists: lists.map(toPublicBoughtList) });
});

boughtListsRouter.get("/:boughtListId", async (req, res) => {
  const userId = req.session.userId as string;
  const { boughtListId } = req.params;
  const list = await prisma.boughtList.findFirst({
    where: { id: boughtListId, userId },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (!list) {
    res.status(404).json({ error: "Bought list not found" });
    return;
  }
  res.json({ boughtList: toPublicBoughtList(list) });
});

boughtListsRouter.patch("/:boughtListId", async (req, res) => {
  const userId = req.session.userId as string;
  const { boughtListId } = req.params;
  const existing = await prisma.boughtList.findFirst({
    where: { id: boughtListId, userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Bought list not found" });
    return;
  }

  const body = parseJsonRecord(req.body);
  if (typeof body.location !== "string" && body.location !== null) {
    res.status(400).json({ error: "Invalid location" });
    return;
  }
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  if (location.length > 200) {
    res.status(400).json({ error: "Location is too long" });
    return;
  }

  const list = await prisma.boughtList.update({
    where: { id: boughtListId },
    data: { location: location || null },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  res.json({ boughtList: toPublicBoughtList(list) });
});

boughtListsRouter.patch(
  "/:boughtListId/items/:itemId",
  async (req, res) => {
    const userId = req.session.userId as string;
    const { boughtListId, itemId } = req.params;
    const list = await prisma.boughtList.findFirst({
      where: { id: boughtListId, userId },
    });
    if (!list) {
      res.status(404).json({ error: "Bought list not found" });
      return;
    }
    const existing = await prisma.boughtItem.findFirst({
      where: { id: itemId, boughtListId },
    });
    if (!existing) {
      res.status(404).json({ error: "Bought item not found" });
      return;
    }

    const body = parseJsonRecord(req.body);
    const data: { price?: number | null; category?: string } = {};
    if (body.price !== undefined) {
      if (body.price !== null && typeof body.price !== "number") {
        res.status(400).json({ error: "Invalid price" });
        return;
      }
      if (
        typeof body.price === "number" &&
        (!Number.isFinite(body.price) || body.price < 0)
      ) {
        res.status(400).json({ error: "Invalid price" });
        return;
      }
      data.price = body.price;
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

    const item = await prisma.boughtItem.update({
      where: { id: itemId },
      data,
    });
    res.json({ item: toPublicBoughtItem(item) });
  }
);

boughtListsRouter.delete("/:boughtListId", async (req, res) => {
  const userId = req.session.userId as string;
  const { boughtListId } = req.params;
  const list = await prisma.boughtList.findFirst({
    where: { id: boughtListId, userId },
  });
  if (!list) {
    res.status(404).json({ error: "Bought list not found" });
    return;
  }
  await prisma.boughtList.delete({ where: { id: boughtListId } });
  res.status(204).end();
});
