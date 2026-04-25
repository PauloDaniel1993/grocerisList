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

describe("GET /api/users/me", () => {
  it("returns 401 without session", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  it("returns current user with valid session", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: testPassword });
    const res = await agent.get("/api/users/me");
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      email: "user@example.com",
      role: "user",
    });
  });
});

describe("PATCH /api/users/me", () => {
  it("rejects unauthenticated", async () => {
    const res = await request(app)
      .patch("/api/users/me")
      .send({ name: " New Name " });
    expect(res.status).toBe(401);
  });

  it("updates name for authenticated user", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: testPassword });
    const res = await agent
      .patch("/api/users/me")
      .send({ name: "Revised User" });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Revised User");
    const again = await agent.get("/api/users/me");
    expect(again.body.user.name).toBe("Revised User");
  });
});
