import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddGroceryForm } from "../../components/AddGroceryForm";
import { server } from "../../test/mswServer";

describe("AddGroceryForm", () => {
  let onAdd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onAdd = vi.fn();
  });

  it("rejects empty name and shows a validation message", async () => {
    const user = userEvent.setup();
    render(<AddGroceryForm onAdd={onAdd} />);
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("rejects whitespace-only name", async () => {
    const user = userEvent.setup();
    render(<AddGroceryForm onAdd={onAdd} />);
    await user.type(screen.getByLabelText(/^name$/i), "   ");
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("fills category when picking a product suggestion", async () => {
    server.use(
      http.get("/api/price-history/products", () => {
        return HttpResponse.json({
          products: [{ name: "Oats", category: "bakery" }],
        });
      })
    );
    const user = userEvent.setup();
    render(<AddGroceryForm onAdd={onAdd} />);
    const name = screen.getByLabelText(/^name$/i);
    await user.click(name);
    await user.type(name, "Oat");
    const listbox = await screen.findByRole("listbox");
    const suggestBtn = within(listbox).getByRole("button", { name: /^oats$/i });
    await user.click(suggestBtn);
    await waitFor(() => {
      expect(screen.getByLabelText(/^category$/i)).toHaveTextContent(/bakery/i);
    });
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(onAdd).toHaveBeenCalledWith({
      name: "Oats",
      category: "bakery",
    });
  });

  it("calls onAdd with trimmed name and selected category and clears the form", async () => {
    const user = userEvent.setup();
    render(<AddGroceryForm onAdd={onAdd} />);
    const name = screen.getByLabelText(/^name$/i);
    await user.type(name, "  Blueberries  ");
    await user.click(screen.getByLabelText(/^category$/i));
    await user.click(await screen.findByRole("option", { name: /^dairy$/i }));
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      name: "Blueberries",
      category: "dairy",
    });
    expect(name).toHaveValue("");
    expect(screen.getByLabelText(/^category$/i)).toHaveTextContent(/other/i);
  });
});
