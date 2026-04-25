import { Router } from "express";
import { prisma } from "../db.js";
import { verifyPassword } from "../lib/password.js";
import { toPublicUser } from "../lib/serializeUser.js";

export const authRouter = Router();

function parseJsonBody(
  value: unknown
): { email?: string; password?: string } {
  if (value === null || typeof value !== "object") return {};
  const o = value as Record<string, unknown>;
  return {
    email: typeof o.email === "string" ? o.email : undefined,
    password: typeof o.password === "string" ? o.password : undefined,
  };
}

authRouter.post("/login", async (req, res) => {
  const { email, password } = parseJsonBody(req.body);
  if (!email?.trim() || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const id = user.id;
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) {
        reject(err);
        return;
      }
      req.session.userId = id;
      req.session.save((saveErr) => {
        if (saveErr) reject(saveErr);
        else resolve();
      });
    });
  });
  res.json({ user: toPublicUser(user) });
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to sign out" });
      return;
    }
    res.status(204).end();
  });
});
