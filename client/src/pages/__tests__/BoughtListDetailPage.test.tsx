import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../../App";
import { useAuthStore } from "../../stores/authStore";
import { server, setSessionToUser } from "../../test/mswServer";
import { TestRouter } from "../../test/TestRouter";
import type { BoughtList } from "../../types/boughtList";
import type { GroceryCategory } from "../../types/grocery";

function createFile(content: string, name: string, type: string): File {
  return new File([content], name, { type });
}

const fixedTime = "2024-01-10T10:00:00.000Z";
let boughtList: BoughtList;

describe("BoughtListDetailPage", () => {
  beforeEach(() => {
    boughtList = {
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
    };
    server.use(
      http.get("/api/bought-lists/bought-1", () => {
        return HttpResponse.json({ boughtList });
      }),
      http.patch(
        "/api/bought-lists/:boughtListId/items/:itemId",
        async ({ request, params }) => {
          const body = (await request.json()) as {
            price?: number | null;
            category?: GroceryCategory;
          };
          const items = boughtList.items ?? [];
          boughtList = {
            ...boughtList,
            items: items.map((item) =>
              item.id === params.itemId ? { ...item, ...body } : item
            ),
          };
          return HttpResponse.json({
            item: boughtList.items?.find((item) => item.id === params.itemId),
          });
        }
      )
    );
  });

  it("shows bought items and saves item prices", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/bought-lists/bought-1"]}>
        <App />
      </TestRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /weekly - 2024-01-10/i })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /download template/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^export$/i })).toBeInTheDocument();
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Dairy")).toBeInTheDocument();
    expect(screen.getByText("Corner Market")).toBeInTheDocument();

    const priceInput = screen.getByRole("spinbutton", { name: /price/i });
    await user.type(priceInput, "2.5");
    await user.tab();

    await waitFor(() => {
      expect(priceInput).toHaveValue(2.5);
    });
    expect(screen.getByText(/2\.50/)).toBeInTheDocument();
  });

  it("saves category changes for bought items", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/bought-lists/bought-1"]}>
        <App />
      </TestRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /weekly - 2024-01-10/i })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("combobox", { name: /category for milk/i })
    );
    await user.click(await screen.findByRole("option", { name: /produce/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /category for milk/i })
      ).toHaveTextContent("Produce");
    });
  });

  it("imports a CSV file and updates matching items", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/bought-lists/bought-1"]}>
        <App />
      </TestRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Milk")).toBeInTheDocument();
    });

    const csv = "name,price,category\nMilk,3.50,dairy\n";
    const file = createFile(csv, "receipt.csv", "text/csv");
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/3\.50/)).toBeInTheDocument();
    });
  });

  it("shows unmatched items dialog for unrecognized products", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/bought-lists/bought-1"]}>
        <App />
      </TestRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Milk")).toBeInTheDocument();
    });

    const csv = "name,price,category\nWhole Milk,3.50,dairy\n";
    const file = createFile(csv, "receipt.csv", "text/csv");
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText("Unrecognized products")).toBeInTheDocument();
    });
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
  });

  it("imports a JSON file and updates matching items", async () => {
    const user = userEvent.setup();
    setSessionToUser();
    useAuthStore.setState({ user: null, status: "loading" });
    render(
      <TestRouter initialEntries={["/bought-lists/bought-1"]}>
        <App />
      </TestRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Milk")).toBeInTheDocument();
    });

    const json = JSON.stringify([
      { name: "Milk", price: 2.99, category: "dairy" },
    ]);
    const file = createFile(json, "receipt.json", "application/json");
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/2\.99/)).toBeInTheDocument();
    });
  });
});
