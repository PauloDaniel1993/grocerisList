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

describe("POST /api/auth/login", () => {
  it("returns 400 when body is empty", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("returns 401 for unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nope@example.com", password: testPassword });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("returns user and sets session cookie for valid user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      email: "user@example.com",
      role: "user",
    });
    const sc = res.headers["set-cookie"];
    const setOk = Array.isArray(sc) ? sc : sc ? [sc] : [];
    expect(
      setOk.some(
        (c) =>
          c.startsWith("prices.sid=") || c.toLowerCase().includes("prices.sid=")
      )
    ).toBe(true);
  });
});

describe("POST /api/auth/logout", () => {
  it("destroys session after login", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: testPassword });
    const out = await agent.post("/api/auth/logout");
    expect(out.status).toBe(204);
  });
});
