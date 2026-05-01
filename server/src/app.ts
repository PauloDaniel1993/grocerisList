import express from "express";
import { sessionMiddleware } from "./session.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { adminUsersRouter } from "./routes/adminUsers.js";
import { groceryListsRouter } from "./routes/groceryLists.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  app.use(sessionMiddleware);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/admin/users", adminUsersRouter);
  app.use("/api/grocery-lists", groceryListsRouter);

  return app;
}
