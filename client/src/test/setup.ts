import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mswServer";
import { useAuthStore } from "../stores/authStore";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null, status: "loading" });
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
