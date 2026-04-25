import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    req.session.destroy(() => {
      res.status(401).json({ error: "Unauthorized" });
    });
    return;
  }
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
