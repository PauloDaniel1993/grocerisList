import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardPage } from "../DashboardPage";
import { server, setSessionToUser } from "../../test/mswServer";

describe("DashboardPage", () => {
  beforeEach(() => {
    setSessionToUser();
  });

  it("shows validation when Show is clicked with All categories and empty product", async () => {
    const user = userEvent.setup();
    render(
      <div style={{ width: 480, height: 720 }}>
        <DashboardPage />
      </div>
    );
    await user.click(screen.getByRole("button", { name: /^show$/i }));
    expect(
      screen.getByText(/Choose a category or enter a product/i)
    ).toBeInTheDocument();
  });

  it("loads price history when a category is selected and Show is clicked", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      server.use(
        http.get("/api/price-history", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("category")).toBe("dairy");
          return HttpResponse.json({
            points: [
              {
                name: "Milk",
                price: 2.5,
                date: "2024-06-01T12:00:00.000Z",
                location: "Market",
              },
            ],
          });
        })
      );

      const user = userEvent.setup();
      render(
        <div style={{ width: 480, height: 720 }}>
          <DashboardPage />
        </div>
      );
      await user.click(screen.getByLabelText(/^category$/i));
      await user.click(await screen.findByRole("option", { name: /^dairy$/i }));
      await user.click(screen.getByRole("button", { name: /^show$/i }));

      await waitFor(() => {
        expect(screen.getAllByText("Milk").length).toBeGreaterThan(0);
      });
      expect(
        screen.getByRole("columnheader", { name: /^price$/i })
      ).toBeInTheDocument();
    } finally {
      warnSpy.mockRestore();
    }
  });
});
