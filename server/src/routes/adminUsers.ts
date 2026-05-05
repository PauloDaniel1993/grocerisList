import { Router } from "express";
import { prisma } from "../db.js";
import { toPublicUser } from "../lib/serializeUser.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const adminUsersRouter = Router();

function parseAdminPatch(
  value: unknown
): { name?: string; role?: string } {
  if (value === null || typeof value !== "object") return {};
  const o = value as Record<string, unknown>;
  return {
    name: typeof o.name === "string" ? o.name : undefined,
    role: typeof o.role === "string" ? o.role : undefined,
  };
}

adminUsersRouter.get("/", requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });
  res.json({ users: users.map(toPublicUser) });
});

adminUsersRouter.get("/:userId", requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: toPublicUser(user) });
});

adminUsersRouter.patch("/:userId", requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const body = parseAdminPatch(req.body);
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const data: { name?: string; role?: string } = {};
  if (body.name !== undefined) {
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
  if (body.role !== undefined) {
    if (body.role !== "user" && body.role !== "admin") {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
    if (userId === req.session.userId && body.role !== "admin") {
      res.status(400).json({ error: "Cannot change your own role" });
      return;
    }
    data.role = body.role;
  }
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: "No changes provided" });
    return;
  }
  const user = await prisma.user.update({ where: { id: userId }, data });
  res.json({ user: toPublicUser(user) });
});
