import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestRouter } from "../../test/TestRouter";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../../App";
import { useAuthStore } from "../../stores/authStore";
import { setProfileSaveHandler } from "../../test/mswServer";

describe("ProfilePage", () => {
  beforeEach(() => {
    setProfileSaveHandler();
    useAuthStore.setState({ user: null, status: "loading" });
  });

  it("shows success and updated name after save", async () => {
    const user = userEvent.setup();
    render(
      <TestRouter initialEntries={["/account/profile"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^profile$/i })).toBeInTheDocument();
    });
    const name = screen.getByLabelText(/name/i);
    await user.clear(name);
    await user.type(name, "Revised User");
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(await screen.findByText("Profile saved")).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue("Revised User");
  });
});
