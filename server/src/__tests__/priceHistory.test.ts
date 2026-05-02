import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db.js";
import { resetAndSeedUsers, testPassword } from "../test/resetTestData.js";

const app = createApp();

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await resetAndSeedUsers();
});

async function loginAsUser(agent: ReturnType<typeof request.agent>) {
  await agent
    .post("/api/auth/login")
    .send({ email: "user@example.com", password: testPassword });
}

async function seedBoughtPrices() {
  const user = await prisma.user.findFirst({
    where: { email: "user@example.com" },
  });
  if (!user) throw new Error("missing user");
  const list = await prisma.groceryList.create({
    data: { userId: user.id, name: "Shop" },
  });
  const older = await prisma.boughtList.create({
    data: {
      userId: user.id,
      groceryListId: list.id,
      name: "Trip A",
      location: "Market",
      createdAt: new Date("2024-06-01T12:00:00.000Z"),
    },
  });
  const newer = await prisma.boughtList.create({
    data: {
      userId: user.id,
      groceryListId: list.id,
      name: "Trip B",
      location: "Co-op",
      createdAt: new Date("2024-07-01T12:00:00.000Z"),
    },
  });
  await prisma.boughtItem.create({
    data: {
      boughtListId: older.id,
      name: "Milk",
      category: "dairy",
      price: 2.5,
    },
  });
  await prisma.boughtItem.create({
    data: {
      boughtListId: newer.id,
      name: "milk",
      category: "produce",
      price: 3.1,
    },
  });
  await prisma.boughtItem.create({
    data: {
      boughtListId: newer.id,
      name: "Bread",
      category: "bakery",
      price: null,
    },
  });
}

describe("Price history API", () => {
  it("returns 401 for unauthenticated GET /products", async () => {
    const res = await request(app).get("/api/price-history/products");
    expect(res.status).toBe(401);
  });

  it("returns 401 for unauthenticated GET /", async () => {
    const res = await request(app).get("/api/price-history?category=dairy");
    expect(res.status).toBe(401);
  });

  it("GET /products returns empty list when user has no bought items", async () => {
    const agent = request.agent(app);
    await loginAsUser(agent);
    const res = await agent.get("/api/price-history/products");
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });

  it("GET /products returns distinct names with category from most recent row", async () => {
    await seedBoughtPrices();
    const agent = request.agent(app);
    await loginAsUser(agent);
    const res = await agent.get("/api/price-history/products");
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "milk", category: "produce" }),
        expect.objectContaining({ name: "Bread", category: "bakery" }),
      ])
    );
    expect(res.body.products).toHaveLength(2);
  });

  it("GET / returns 400 when neither product nor category is provided", async () => {
    const agent = request.agent(app);
    await loginAsUser(agent);
    const res = await agent.get("/api/price-history");
    expect(res.status).toBe(400);
  });

  it("GET / returns 400 for invalid category", async () => {
    const agent = request.agent(app);
    await loginAsUser(agent);
    const res = await agent.get("/api/price-history?category=invalid");
    expect(res.status).toBe(400);
  });

  it("GET / returns 400 for invalid from date", async () => {
    const agent = request.agent(app);
    await loginAsUser(agent);
    const res = await agent.get(
      "/api/price-history?category=dairy&from=not-a-date"
    );
    expect(res.status).toBe(400);
  });

  it("GET / filters by category, omits null prices, sorts by date", async () => {
    await seedBoughtPrices();
    const agent = request.agent(app);
    await loginAsUser(agent);
    const res = await agent.get("/api/price-history?category=dairy");
    expect(res.status).toBe(200);
    expect(res.body.points).toHaveLength(1);
    expect(res.body.points[0]).toMatchObject({
      name: "Milk",
      price: 2.5,
      location: "Market",
    });
  });

  it("GET / matches product case-insensitively", async () => {
    await seedBoughtPrices();
    const agent = request.agent(app);
    await loginAsUser(agent);
    const res = await agent.get("/api/price-history?product=MILK");
    expect(res.status).toBe(200);
    expect(res.body.points.map((p: { price: number }) => p.price)).toEqual([
      2.5, 3.1,
    ]);
  });

  it("admin cannot see user price history (empty products)", async () => {
    await seedBoughtPrices();
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: testPassword });
    const res = await agent.get("/api/price-history/products");
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });
});
