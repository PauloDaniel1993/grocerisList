import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:./prisma/vitest.db",
      SESSION_SECRET: "test-session-secret-at-least-32-characters-long-ok",
    },
    fileParallelism: false,
  },
});
