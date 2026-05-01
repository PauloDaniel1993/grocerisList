import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestRouter } from "../../test/TestRouter";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../../App";
import { useAuthStore } from "../../stores/authStore";

function renderAt(path: string) {
  return render(
    <TestRouter initialEntries={[path]}>
      <App />
    </TestRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, status: "loading" });
  });

  it("shows validation when email and password are empty", async () => {
    const user = userEvent.setup();
    renderAt("/login");
    await screen.findByRole("heading", { name: /sign in/i });
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("shows server error on 401", async () => {
    const user = userEvent.setup();
    renderAt("/login");
    await screen.findByRole("heading", { name: /sign in/i });
    await user.type(screen.getByLabelText(/email/i), "user@auth401.com");
    await user.type(screen.getByLabelText(/password/i), "secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(
      await screen.findByText(/Invalid email or password/)
    ).toBeInTheDocument();
  });

  it("navigates to my lists after successful login", async () => {
    const user = userEvent.setup();
    renderAt("/login");
    await screen.findByRole("heading", { name: /sign in/i });
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^my lists$/i })).toBeInTheDocument();
    });
  });
});
