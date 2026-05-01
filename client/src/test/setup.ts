import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mswServer";
import { useAuthStore } from "../stores/authStore";

// jsdom shims for Radix UI primitives (Select, DropdownMenu, etc.)
if (typeof window !== "undefined") {
  const proto = window.HTMLElement.prototype as unknown as {
    hasPointerCapture?: (id: number) => boolean;
    setPointerCapture?: (id: number) => void;
    releasePointerCapture?: (id: number) => void;
    scrollIntoView?: () => void;
  };
  proto.hasPointerCapture = proto.hasPointerCapture ?? (() => false);
  proto.setPointerCapture = proto.setPointerCapture ?? (() => undefined);
  proto.releasePointerCapture = proto.releasePointerCapture ?? (() => undefined);
  proto.scrollIntoView = proto.scrollIntoView ?? (() => undefined);
  if (typeof window.ResizeObserver === "undefined") {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
}

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
