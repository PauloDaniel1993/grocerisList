import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestRouter } from "../../test/TestRouter";
import App from "../../App";
import { server, setSessionToUser } from "../../test/mswServer";
import { useAuthStore } from "../../stores/authStore";

const fixedTime = "2020-01-01T00:00:00.000Z";
let apiLists: {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}[] = [];

describe("GroceryListsPage", () => {
  beforeEach(() => {
    apiLists = [];
    let id = 0;
    server.use(
      http.get("/api/grocery-lists", () => {
        return HttpResponse.json({ lists: apiLists });
      }),
      http.post("/api/grocery-lists", async ({ request }) => {
        const body = (await request.json()) as { name?: string };
        const name = (body.name ?? "").trim() || "list";
        const list = {
          id: `new-${id++}`,
          name,
          createdAt: fixedTime,
          updatedAt: fixedTime,
        };
        apiLists = [list, ...apiLists];
        return HttpResponse.json({ list }, { status: 201 });
      }),
      http.delete("/api/grocery-lists/:listId", ({ params }) => {
        apiLists = apiLists.filter((l) => l.id !== params.listId);
        return new HttpResponse(null, { status: 204 });
      })
    );
  });

  it("shows heading and empty state when there are no lists", async () => {
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/grocery-lists"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^my lists$/i })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        /you have no lists yet/i
      )
    ).toBeInTheDocument();
  });

  it("create list adds a row with link to the list detail", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/grocery-lists"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^my lists$/i })
      ).toBeInTheDocument();
    });
    await user.type(
      screen.getByPlaceholderText(/list name/i),
      "  Weekend  "
    );
    await user.click(screen.getByRole("button", { name: /create list/i }));
    const ul = screen.getByRole("list", { name: /your grocery lists/i });
    expect(
      within(ul).getByRole("link", { name: "Weekend" })
    ).toHaveAttribute("href", "/grocery-lists/new-0");
  });

  it("deletes a list when confirmed", async () => {
    const user = userEvent.setup();
    apiLists = [
      {
        id: "keep-me",
        name: "Keep",
        createdAt: fixedTime,
        updatedAt: fixedTime,
      },
    ];
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => true);
    render(
      <TestRouter initialEntries={["/grocery-lists"]}>
        <App />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Keep")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByText("Keep")).not.toBeInTheDocument();
    });
    confirmSpy.mockRestore();
  });
});
