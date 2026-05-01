import { render, screen, waitFor, within } from "@testing-library/react";
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
    const table = await waitFor(() => screen.getByRole("table"));
    expect(
      await within(table).findByText(baseUser.name, { exact: true })
    ).toBeInTheDocument();
    expect(
      within(table).getByText(baseUser.email, { exact: true })
    ).toBeInTheDocument();
  });
});
