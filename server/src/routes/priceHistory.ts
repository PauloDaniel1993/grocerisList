import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const priceHistoryRouter = Router();

const GROCERY_CATEGORIES = [
  "produce",
  "dairy",
  "bakery",
  "frozen",
  "household",
  "other",
] as const;

function isGroceryCategory(s: string): boolean {
  return (GROCERY_CATEGORIES as readonly string[]).includes(s);
}

priceHistoryRouter.use(requireAuth);

/** Distinct product names (case-insensitive key) with category from most recent bought row. */
priceHistoryRouter.get("/products", async (req, res) => {
  const userId = req.session.userId as string;
  const items = await prisma.boughtItem.findMany({
    where: { boughtList: { userId } },
    include: { boughtList: true },
    orderBy: [
      { boughtList: { createdAt: "desc" } },
      { createdAt: "desc" },
    ],
  });

  const byNormName = new Map<
    string,
    { name: string; category: string }
  >();
  for (const item of items) {
    const key = item.name.trim().toLowerCase();
    if (!key) continue;
    if (!byNormName.has(key)) {
      byNormName.set(key, { name: item.name.trim(), category: item.category });
    }
  }

  const products = [...byNormName.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  res.json({ products });
});

priceHistoryRouter.get("/", async (req, res) => {
  const userId = req.session.userId as string;
  const product =
    typeof req.query.product === "string" ? req.query.product.trim() : "";
  const category =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  const fromRaw =
    typeof req.query.from === "string" ? req.query.from.trim() : "";
  const toRaw = typeof req.query.to === "string" ? req.query.to.trim() : "";

  if (!product && !category) {
    res
      .status(400)
      .json({ error: "Provide product or category (or both)" });
    return;
  }

  if (category && !isGroceryCategory(category)) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }

  let fromDate: Date | undefined;
  let toDate: Date | undefined;
  if (fromRaw) {
    fromDate = new Date(fromRaw);
    if (Number.isNaN(fromDate.getTime())) {
      res.status(400).json({ error: "Invalid from date" });
      return;
    }
  }
  if (toRaw) {
    toDate = new Date(toRaw);
    if (Number.isNaN(toDate.getTime())) {
      res.status(400).json({ error: "Invalid to date" });
      return;
    }
  }

  const items = await prisma.boughtItem.findMany({
    where: {
      price: { not: null },
      boughtList: { userId },
      ...(category ? { category } : {}),
    },
    include: { boughtList: true },
    orderBy: [{ boughtList: { createdAt: "asc" } }, { createdAt: "asc" }],
  });

  let filtered = items;
  if (product) {
    const norm = product.toLowerCase();
    filtered = items.filter(
      (i) => i.name.trim().toLowerCase() === norm
    );
  }

  if (fromDate) {
    filtered = filtered.filter((i) => i.boughtList.createdAt >= fromDate!);
  }
  if (toDate) {
    filtered = filtered.filter((i) => i.boughtList.createdAt <= toDate!);
  }

  const points = filtered.map((i) => ({
    name: i.name,
    price: i.price as number,
    date: i.boughtList.createdAt.toISOString(),
    location: i.boughtList.location,
  }));

  res.json({ points });
});
