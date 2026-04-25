import { render, screen, waitFor } from "@testing-library/react";
import { TestRouter } from "../../test/TestRouter";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../../App";
import { useAuthStore } from "../../stores/authStore";
import { baseUser, setAdminListHandlers, setSessionToAdmin } from "../../test/mswServer";

describe("AdminUsersPage", () => {
  beforeEach(() => {
    setSessionToAdmin();
    setAdminListHandlers();
    useAuthStore.setState({ user: null, status: "loading" });
  });

  it("shows seeded users in the table", async () => {
    render(
      <TestRouter initialEntries={["/admin/users"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
    expect(
      await screen.findByText(baseUser.name, { exact: true })
    ).toBeInTheDocument();
    expect(screen.getByText(baseUser.email, { exact: true })).toBeInTheDocument();
  });
});
