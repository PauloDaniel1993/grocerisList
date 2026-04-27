import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db.js";
import { resetAndSeedUsers, testPassword } from "../test/resetTestData.js";

const app = createApp();
type GroceryListSessionAgent = ReturnType<typeof request.agent>;

async function loginAsUser(agent: GroceryListSessionAgent) {
  await agent
    .post("/api/auth/login")
    .send({ email: "user@example.com", password: testPassword });
}

async function loginAsAdmin(agent: GroceryListSessionAgent) {
  await agent
    .post("/api/auth/login")
    .send({ email: "admin@example.com", password: testPassword });
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await resetAndSeedUsers();
});

describe("Grocery lists API", () => {
  it("returns 401 for unauthenticated GET /api/grocery-lists", async () => {
    const res = await request(app).get("/api/grocery-lists");
    expect(res.status).toBe(401);
  });

  it("creates a list and lists it for the same user", async () => {
    const agent = request.agent(app);
    await loginAsUser(agent);
    const create = await agent.post("/api/grocery-lists").send({ name: "  Weekly  " });
    expect(create.status).toBe(201);
    const listId = create.body.list.id as string;
    expect(create.body.list.name).toBe("Weekly");
    const list = await agent.get("/api/grocery-lists");
    expect(list.status).toBe(200);
    expect(list.body.lists).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: listId, name: "Weekly" })])
    );
  });

  it("returns 400 when list name is empty", async () => {
    const agent = request.agent(app);
    await loginAsUser(agent);
    const res = await agent.post("/api/grocery-lists").send({ name: "   " });
    expect(res.status).toBe(400);
  });

  it("user cannot see other user's list in GET (404 for detail)", async () => {
    const a = request.agent(app);
    await loginAsUser(a);
    const other = request.agent(app);
    await loginAsAdmin(other);
    const created = await other.post("/api/grocery-lists").send({ name: "Admin list" });
    const listId = created.body.list.id as string;
    const steal = await a.get(`/api/grocery-lists/${listId}`);
    expect(steal.status).toBe(404);
  });

  it("user cannot add items to another user's list", async () => {
    const a = request.agent(app);
    await loginAsUser(a);
    const other = request.agent(app);
    await loginAsAdmin(other);
    const created = await other.post("/api/grocery-lists").send({ name: "L" });
    const listId = created.body.list.id as string;
    const bad = await a.post(`/api/grocery-lists/${listId}/items`).send({
      name: "Milk",
      category: "dairy",
    });
    expect(bad.status).toBe(404);
  });

  it("adds item, patches bought, and deletes item on owned list", async () => {
    const agent = request.agent(app);
    await loginAsUser(agent);
    const { body: c } = await agent.post("/api/grocery-lists").send({ name: "Home" });
    const listId = c.list.id as string;
    const add = await agent.post(`/api/grocery-lists/${listId}/items`).send({
      name: "Eggs",
      category: "dairy",
    });
    expect(add.status).toBe(201);
    const itemId = add.body.item.id as string;
    expect(add.body.item.bought).toBe(false);

    const patch = await agent
      .patch(`/api/grocery-lists/${listId}/items/${itemId}`)
      .send({ bought: true });
    expect(patch.status).toBe(200);
    expect(patch.body.item.bought).toBe(true);

    const del = await agent.delete(
      `/api/grocery-lists/${listId}/items/${itemId}`
    );
    expect(del.status).toBe(204);
  });

  it("rejects invalid category on POST item", async () => {
    const agent = request.agent(app);
    await loginAsUser(agent);
    const { body: c } = await agent.post("/api/grocery-lists").send({ name: "H" });
    const listId = c.list.id as string;
    const res = await agent.post(`/api/grocery-lists/${listId}/items`).send({
      name: "X",
      category: "nope",
    });
    expect(res.status).toBe(400);
  });

  it("deletes list and items cascade (GET items 404 for missing list after delete)", async () => {
    const agent = request.agent(app);
    await loginAsUser(agent);
    const { body: c } = await agent.post("/api/grocery-lists").send({ name: "Temp" });
    const listId = c.list.id as string;
    await agent.post(`/api/grocery-lists/${listId}/items`).send({
      name: "A",
      category: "other",
    });
    const del = await agent.delete(`/api/grocery-lists/${listId}`);
    expect(del.status).toBe(204);
    const items = await agent.get(`/api/grocery-lists/${listId}/items`);
    expect(items.status).toBe(404);
  });
});
