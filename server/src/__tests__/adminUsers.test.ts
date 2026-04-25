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

describe("GET /api/admin/users", () => {
  it("returns 403 for user role", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: testPassword });
    const res = await agent.get("/api/admin/users");
    expect(res.status).toBe(403);
  });

  it("returns list for admin", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: testPassword });
    const res = await agent.get("/api/admin/users");
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
  });
});

describe("PATCH /api/admin/users/:id", () => {
  it("returns 403 for user role", async () => {
    const admin = await prisma.user.findUniqueOrThrow({
      where: { email: "admin@example.com" },
    });
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: testPassword });
    const res = await agent
      .patch(`/api/admin/users/${admin.id}`)
      .send({ name: "X" });
    expect(res.status).toBe(403);
  });

  it("allows admin to update name and role", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "user@example.com" },
    });
    const adminAgent = request.agent(app);
    await adminAgent
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: testPassword });
    const res = await adminAgent
      .patch(`/api/admin/users/${user.id}`)
      .send({ name: "Managed User", role: "user" });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Managed User");
  });
});
