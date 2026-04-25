import { Router } from "express";
import { prisma } from "../db.js";
import { toPublicUser } from "../lib/serializeUser.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const usersRouter = Router();

function parsePatchBody(value: unknown): { name?: string } {
  if (value === null || typeof value !== "object") return {};
  const o = value as Record<string, unknown>;
  return { name: typeof o.name === "string" ? o.name : undefined };
}

usersRouter.get("/me", requireAuth, async (req, res) => {
  const id = req.session.userId;
  if (!id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    req.session.destroy(() => {
      res.status(401).json({ error: "Unauthorized" });
    });
    return;
  }
  res.json({ user: toPublicUser(user) });
});

usersRouter.patch("/me", requireAuth, async (req, res) => {
  const id = req.session.userId;
  if (!id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { name } = parsePatchBody(req.body);
  if (name === undefined) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const trimmed = name.trim();
  if (!trimmed) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (trimmed.length > 200) {
    res.status(400).json({ error: "Name is too long" });
    return;
  }
  const user = await prisma.user.update({
    where: { id },
    data: { name: trimmed },
  });
  res.json({ user: toPublicUser(user) });
});
