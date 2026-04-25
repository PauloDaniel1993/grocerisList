import { render, screen, waitFor } from "@testing-library/react";
import { TestRouter } from "../../test/TestRouter";
import { describe, expect, it } from "vitest";
import App from "../../App";
import { useAuthStore } from "../../stores/authStore";
import { setSessionToUser } from "../../test/mswServer";

describe("route guards", () => {
  it("sends unauthenticated user from profile to login", async () => {
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/account/profile"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it("sends non-admin from admin users to profile", async () => {
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/admin/users"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^profile$/i })).toBeInTheDocument();
    });
  });
});
