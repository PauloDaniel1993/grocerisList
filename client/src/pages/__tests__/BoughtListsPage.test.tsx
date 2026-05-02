import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../../App";
import { useAuthStore } from "../../stores/authStore";
import { server, setSessionToUser } from "../../test/mswServer";
import { TestRouter } from "../../test/TestRouter";
import type { BoughtList } from "../../types/boughtList";

const fixedTime = "2024-01-10T10:00:00.000Z";
let boughtLists: BoughtList[] = [];

describe("BoughtListsPage", () => {
  beforeEach(() => {
    boughtLists = [
      {
        id: "bought-1",
        name: "Weekly - 2024-01-10",
        location: "Corner Market",
        groceryListId: "list-1",
        createdAt: fixedTime,
        items: [
          {
            id: "item-1",
            boughtListId: "bought-1",
            name: "Milk",
            category: "dairy",
            price: null,
            createdAt: fixedTime,
          },
        ],
      },
    ];
    server.use(
      http.get("/api/bought-lists", () => {
        return HttpResponse.json({ boughtLists });
      }),
      http.delete("/api/bought-lists/:boughtListId", ({ params }) => {
        boughtLists = boughtLists.filter((list) => list.id !== params.boughtListId);
        return new HttpResponse(null, { status: 204 });
      }),
      http.patch("/api/bought-lists/:boughtListId", async ({ request, params }) => {
        const body = (await request.json()) as { location?: string | null };
        const updatedLocation = body.location?.trim() || null;
        boughtLists = boughtLists.map((list) =>
          list.id === params.boughtListId
            ? { ...list, location: updatedLocation }
            : list
        );
        return HttpResponse.json({
          boughtList: boughtLists.find((list) => list.id === params.boughtListId),
        });
      })
    );
  });

  it("shows bought list cards with links to detail pages", async () => {
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/bought-lists"]}>
        <App />
      </TestRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^bought lists$/i })
      ).toBeInTheDocument();
    });
    const list = screen.getByRole("list", { name: /your bought lists/i });
    expect(
      within(list).getByRole("link", { name: /weekly - 2024-01-10/i })
    ).toHaveAttribute("href", "/bought-lists/bought-1");
    expect(within(list).getByText("Corner Market")).toBeInTheDocument();
    expect(within(list).getByText("1 item")).toBeInTheDocument();
  });

  it("edits a bought list location from the actions menu", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/bought-lists"]}>
        <App />
      </TestRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Corner Market")).toBeInTheDocument();
    });
    await user.click(
      screen.getByRole("button", { name: /actions for weekly - 2024-01-10/i })
    );
    await user.click(
      await screen.findByRole("menuitem", { name: /edit location/i })
    );
    const dialog = await screen.findByRole("alertdialog");
    const input = within(dialog).getByLabelText(/location/i);
    await user.clear(input);
    await user.type(input, "Downtown Shop");
    await user.click(
      within(dialog).getByRole("button", { name: /save location/i })
    );

    await waitFor(() => {
      expect(screen.getByText("Downtown Shop")).toBeInTheDocument();
    });
  });

  it("deletes a bought list when confirmed", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/bought-lists"]}>
        <App />
      </TestRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Weekly - 2024-01-10")).toBeInTheDocument();
    });
    await user.click(
      screen.getByRole("button", { name: /actions for weekly - 2024-01-10/i })
    );
    await user.click(await screen.findByRole("menuitem", { name: /delete/i }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.queryByText("Weekly - 2024-01-10")).not.toBeInTheDocument();
    });
  });
});
