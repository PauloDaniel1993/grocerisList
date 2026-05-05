import express from "express";
import swaggerUi from "swagger-ui-express";
import { sessionMiddleware } from "./session.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { adminUsersRouter } from "./routes/adminUsers.js";
import { boughtListsRouter } from "./routes/boughtLists.js";
import { groceryListsRouter } from "./routes/groceryLists.js";
import { priceHistoryRouter } from "./routes/priceHistory.js";
import { swaggerSpec } from "./swagger.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  app.use(sessionMiddleware);

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { customSiteTitle: "PricesImproved API Docs" })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/admin/users", adminUsersRouter);
  app.use("/api/grocery-lists", groceryListsRouter);
  app.use("/api/bought-lists", boughtListsRouter);
  app.use("/api/price-history", priceHistoryRouter);

  return app;
}
